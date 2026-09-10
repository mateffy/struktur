import type { ArtifactImage } from "../types";

/**
 * Contact-sheet compositor.
 *
 * Composites many extracted images into one or more labeled contact sheets:
 * each source image becomes a thumbnail with its virtual filesystem path printed
 * underneath as a label. The label IS the path the agent must emit, so reading a
 * sheet turns per-image classification into a single copy-the-label step.
 *
 * Uses MaxRects bin packing (tight, tetris-like) instead of a rigid grid, and a
 * split pass that caps each sheet's longest edge at {@link MAX_SHEET_EDGE} so the
 * model does not internally downscale the sheet below the vision encoder's patch
 * size (which would make thumbnails illegible).
 */

// ---- tuning knobs (research-derived) ----
const THUMB_EDGE = 220; // target longest edge of each thumbnail (px)
const THUMB_EDGE_MIN = 120; // floor — keeps labels legible after model downscale
const CELL_BORDER = 3; // hard black border between cells (px)
const LABEL_H = 16; // label bar height (px)
const MAX_SHEET_EDGE = 1500; // longest edge ceiling per sheet (px)
const SHEET_WIDTH = 1400; // fixed sheet width (px); height auto-grows then splits

type SizedImage = ArtifactImage & { w: number; h: number; name: string };

// ---- MaxRects bin packing (best-short-side-fit) ----
type Rect = { x: number; y: number; w: number; h: number };

const subtract = (a: Rect, b: Rect): Rect[] => {
  if (b.x >= a.x + a.w || b.x + b.w <= a.x || b.y >= a.y + a.h || b.y + b.h <= a.y) {
    return [a];
  }
  const r: Rect[] = [];
  if (b.x > a.x) r.push({ x: a.x, y: a.y, w: b.x - a.x, h: a.h });
  if (b.x + b.w < a.x + a.w) r.push({ x: b.x + b.w, y: a.y, w: a.x + a.w - (b.x + b.w), h: a.h });
  if (b.y > a.y) r.push({ x: a.x, y: a.y, w: a.w, h: b.y - a.y });
  if (b.y + b.h < a.y + a.h) r.push({ x: a.x, y: b.y + b.h, w: a.w, h: a.y + a.h - (b.y + b.h) });
  return r.filter((x) => x.w > 0 && x.h > 0);
};

const contains = (a: Rect, b: Rect): boolean =>
  a.x <= b.x && a.y <= b.y && a.x + a.w >= b.x + b.w && a.y + a.h >= b.y + b.h;

/** Pack a fixed-height-free rect list. Returns placements + used height. */
const pack = (items: Rect[], containerW: number) => {
  let free: Rect[] = [{ x: 0, y: 0, w: containerW, h: 1_000_000 }];
  const placed: Rect[] = [];
  let usedH = 0;

  for (const it of items) {
    let best: { score: number; x: number; y: number } | null = null;
    for (const f of free) {
      if (it.w <= f.w && it.h <= f.h) {
        const lh = f.w - it.w;
        const lv = f.h - it.h;
        const score = Math.min(lh, lv) * 1000 + Math.max(lh, lv) * 10 + (f.w * f.h - it.w * it.h);
        if (!best || score < best.score) best = { score, x: f.x, y: f.y };
      }
    }
    if (!best) continue; // shouldn't happen given the huge container height

    const chunk = free.find((f) => f.x === best!.x && f.y === best!.y)!;
    free = free.filter((f) => f !== chunk);
    free = [...free, ...subtract(chunk, { x: best.x, y: best.y, w: it.w, h: it.h })];
    free = free.filter((f) => !free.some((o) => o !== f && contains(o, f)));

    const r: Rect = { x: best.x, y: best.y, w: it.w, h: it.h };
    placed.push(r);
    usedH = Math.max(usedH, r.y + r.h);
  }

  return { placed, usedH };
};

const truncate = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);

/**
 * Short, distinguishing label for an image: strips the artifact UUID and keeps
 * the meaningful `page-N-image-M` (or `page-N`) suffix so the model can copy it.
 * e.g. "/images/artifact-abc-page-3-image-1.png" -> "page-3-image-1".
 */
const shortLabel = (virtualPath: string): string => {
  const base = virtualPath.split("/").pop() ?? virtualPath;
  // Drop the leading "artifact-<uuid>-" prefix if present.
  const m = base.match(/^artifact-[0-9a-f-]{8,}-(.*\.(?:png|jpg|jpeg|gif|webp))$/i);
  const captured = m?.[1];
  return captured ? captured.replace(/\.[^.]+$/, "") : base.replace(/\.[^.]+$/, "");
};

/**
 * Build one or more contact-sheet images from a list of extracted images.
 *
 * @param images          The extracted images (must carry `base64` + `virtualPath`).
 * @param options.onto    Base path prefix for the generated sheet virtual paths.
 * @returns Composite `ArtifactImage[]` — one per emitted sheet.
 */
export async function buildContactSheets(
  images: ArtifactImage[],
  options?: { onto?: string },
): Promise<ArtifactImage[]> {
  const sharp = (await import("sharp")).default;

  // Dedupe byte-identical images (recurring logos/letterheads appear on many
  // pages as identical bytes) and drop tiny icons that carry no signal.
  const seen = new Set<string>();
  const list = images.filter((i) => {
    if (!i.base64 || !i.virtualPath) return false;
    const w = i.width ?? 0;
    const h = i.height ?? 0;
    if (w > 0 && h > 0 && (w < 40 || h < 40)) return false; // logos/icons
    const hash = i.base64;
    if (seen.has(hash)) return false; // byte-identical repeat
    seen.add(hash);
    return true;
  });

  if (list.length === 0) return [];
  if (list.length < 2) {
    // No compositing needed — return as-is so callers still get a single ref.
    return list;
  }

  // Scale each image into a thumb box, preserving aspect ratio.
  const sized: SizedImage[] = [];
  for (const img of list) {
    const long = Math.max(img.width ?? THUMB_EDGE_MIN, img.height ?? THUMB_EDGE_MIN);
    const scale = THUMB_EDGE / long;
    const w = Math.max(Math.round((img.width ?? 1) * Math.min(scale, 1)), THUMB_EDGE_MIN);
    const h = Math.max(Math.round((img.height ?? 1) * Math.min(scale, 1)), THUMB_EDGE_MIN);
    sized.push({ ...img, w, h, name: shortLabel(img.virtualPath as string) });
  }

  // Cells = image + border. Pack, then split into sheets by edge ceiling.
  const cells: (Rect & { img: SizedImage })[] = sized.map((img) => ({
    x: 0,
    y: 0,
    w: img.w + CELL_BORDER * 2,
    h: img.h + CELL_BORDER * 2 + LABEL_H,
    img,
  }));

  // Greedy split into sheets: fill a sheet up to MAX_SHEET_EDGE, then flush.
  const sheets: (typeof cells)[] = [];
  let current: typeof cells = [];
  for (const cell of cells) {
    const trial = [...current, cell];
    const { usedH } = pack(trial.map((c) => ({ x: 0, y: 0, w: c.w, h: c.h })), SHEET_WIDTH);
    if (usedH > MAX_SHEET_EDGE && current.length > 0) {
      sheets.push(current);
      current = [cell];
    } else {
      current = trial;
    }
  }
  if (current.length > 0) sheets.push(current);

  const basePath = (options?.onto ?? "/images") + "/contact-sheet";
  const out: ArtifactImage[] = [];

  for (let s = 0; s < sheets.length; s++) {
    const sheetCells = sheets[s]!;
    const { placed, usedH } = pack(
      sheetCells.map((c) => ({ x: 0, y: 0, w: c.w, h: c.h })),
      SHEET_WIDTH,
    );
    const height = Math.ceil(usedH);

    const composites: { input: Buffer; top: number; left: number }[] = [];
    for (let i = 0; i < placed.length; i++) {
      const p = placed[i];
      const cell = sheetCells[i];
      if (!p || !cell) continue;
      const img = cell.img;

      // Black border rect (underneath).
      composites.push({
        input: await sharp({
          create: { width: p.w, height: p.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
        })
          .png()
          .toBuffer(),
        top: p.y,
        left: p.x,
      });

      // Thumbnail inside border.
      const thumbBuf = Buffer.from(img.base64 as string, "base64");
      const thumb = await sharp(thumbBuf)
        .resize(img.w, img.h, { fit: "inside", background: { r: 255, g: 255, b: 255 } })
        .png()
        .toBuffer();
      composites.push({ input: thumb, top: p.y + CELL_BORDER, left: p.x + CELL_BORDER });

      // Label bar at bottom (solid black + white text; librsvg lacks rgba()).
      const label = truncate(img.name, 34);
      const svg = Buffer.from(
        `<svg width="${img.w}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${img.w}" height="${LABEL_H}" fill="black" opacity="0.72"/>
          <text x="4" y="${LABEL_H - 3}" font-family="Helvetica" font-size="10" font-weight="600" fill="white">${label}</text>
        </svg>`,
      );
      composites.push({ input: svg, top: p.y + CELL_BORDER + img.h, left: p.x + CELL_BORDER });
    }

    const sheetPng = await sharp({
      create: { width: SHEET_WIDTH, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite(composites)
      .png()
      .toBuffer();

    const base64 = sheetPng.toString("base64");
    out.push({
      type: "image",
      base64,
      width: SHEET_WIDTH,
      height,
      imageType: "screenshot",
      virtualPath: `${basePath}-${s + 1}.png`,
    });
  }

  return out;
}
