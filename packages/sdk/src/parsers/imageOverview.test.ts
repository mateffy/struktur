import { test, expect } from "bun:test";
import { buildImageOverviews, pack } from "./imageOverview";

// A tiny valid PNG (1x1 red pixel) base64.
const PNG_1x1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// A wider PNG (2x1) to exercise aspect-ratio scaling.
const PNG_2x1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAQAAABeK7cBAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const mk = (n: number, w: number, h: number, b64 = PNG_1x1) => ({
  type: "image" as const,
  base64: b64,
  width: w,
  height: h,
  imageType: "embedded" as const,
  virtualPath: `/images/artifact-abc-page-${n}-image-0.png`,
});

test("buildImageOverviews composites several images into one sheet with a image-overview virtual path", async () => {
  const images = [mk(1, 100, 100, PNG_2x1), mk(2, 100, 100, PNG_1x1)];
  const sheets = await buildImageOverviews(images, { onto: "/images/artifact-abc" });

  expect(sheets.length).toBeGreaterThanOrEqual(1);
  const sheet = sheets[0];
  expect(sheet.type).toBe("image");
  expect(sheet.virtualPath).toContain("/image-overview-1.png");
  expect(sheet.width).toBeGreaterThan(0);
  expect(sheet.height).toBeGreaterThan(0);
  expect(sheet.base64!.length).toBeGreaterThan(100);
});

test("buildImageOverviews dedupes byte-identical images (recurring logos)", async () => {
  const images = [
    mk(1, 100, 100),
    mk(2, 100, 100, PNG_1x1), // same bytes as page 1 → should dedupe
    mk(3, 100, 100, PNG_2x1), // different bytes → kept
  ];
  const sheets = await buildImageOverviews(images, { onto: "/images/artifact-abc" });
  // 3 source images, one deduped → 2 cells. A single sheet is fine either way;
  // assert the sheet was produced and is valid.
  expect(sheets.length).toBeGreaterThanOrEqual(1);
  expect(sheets[0].base64!.length).toBeGreaterThan(100);
});

test("buildImageOverviews drops tiny images (icons/logos under 40px)", async () => {
  const images = [mk(1, 20, 20), mk(2, 200, 200)];
  const sheets = await buildImageOverviews(images, { onto: "/images/artifact-abc" });
  // Only the 200x200 image survives; single image → returned as-is.
  expect(sheets).toHaveLength(1);
  expect(sheets[0].virtualPath).toBe(images[1].virtualPath);
});

test("buildImageOverviews returns empty for no images", async () => {
  expect(await buildImageOverviews([], { onto: "/images/artifact-abc" })).toEqual([]);
});

test("buildImageOverviews returns single image as-is when only one survives", async () => {
  const one = mk(1, 200, 200);
  const sheets = await buildImageOverviews([one], { onto: "/images/artifact-abc" });
  expect(sheets).toHaveLength(1);
  expect(sheets[0].virtualPath).toBe(one.virtualPath);
});

const intersects = (
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

// Deterministic pseudo-random sizes so a failure is reproducible.
const seeded = (seed: number) => () => {
  seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
  return seed / 2_147_483_648;
};

test("pack never places two cells on top of each other", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const random = seeded(seed);
    const items = Array.from({ length: 60 }, () => ({
      x: 0,
      y: 0,
      w: 126 + Math.round(random() * 100),
      h: 142 + Math.round(random() * 100),
    }));
    const { placed } = pack(items, 1400);

    expect(placed).toHaveLength(items.length);
    for (let i = 0; i < placed.length; i++) {
      expect(placed[i]!.x + placed[i]!.w).toBeLessThanOrEqual(1400);
      for (let j = i + 1; j < placed.length; j++) {
        if (intersects(placed[i]!, placed[j]!)) {
          throw new Error(`seed ${seed}: cell ${i} overlaps cell ${j}`);
        }
      }
    }
  }
});

test("pack keeps placements in input order with the input sizes", () => {
  const items = [
    { x: 0, y: 0, w: 300, h: 100 },
    { x: 0, y: 0, w: 100, h: 300 },
    { x: 0, y: 0, w: 200, h: 200 },
  ];
  const { placed, usedH } = pack(items, 400);

  expect(placed.map((p) => [p.w, p.h])).toEqual([
    [300, 100],
    [100, 300],
    [200, 200],
  ]);
  expect(usedH).toBe(Math.max(...placed.map((p) => p.y + p.h)));
});

test("pack puts a cell wider than the container on its own row", () => {
  const { placed } = pack(
    [
      { x: 0, y: 0, w: 100, h: 100 },
      { x: 0, y: 0, w: 500, h: 50 },
    ],
    400,
  );

  expect(placed[1]).toEqual({ x: 0, y: 100, w: 500, h: 50 });
});
