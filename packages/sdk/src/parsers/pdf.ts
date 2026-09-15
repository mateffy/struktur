import type { Artifact, ArtifactContent, ArtifactImage } from "../types";
import { collectStream } from "./collect";
import { buildImageOverviews } from "./imageOverview";

export type ParsePdfOptions = {
  /**
   * Whether to extract embedded images from each page and include them as
   * base64-encoded ArtifactImage entries in the media field.
   * Defaults to true. Pass false to skip image extraction entirely.
   */
  includeImages?: boolean;
  /**
   * Whether to render page screenshots and include them as ArtifactImage entries.
   * When true, each page is rendered to a PNG image and added to the media field.
   * Defaults to false.
   */
  screenshots?: boolean;
  /**
   * Scale factor for screenshots. Higher values produce larger, higher-quality images.
   * Defaults to 1.5.
   */
  screenshotScale?: number;
  /**
   * Target width in pixels for screenshots. If specified, takes precedence over screenshotScale.
   * Height is calculated to maintain aspect ratio.
   */
  screenshotWidth?: number;
  /**
   * Whether to composite all extracted images into labeled image overviews and
   * append them as extra content entries. Defaults to true. Pass false to skip.
   */
  imageOverview?: boolean;
  /**
   * How long to spend extracting embedded images before keeping only what has been
   * collected so far, in milliseconds. Defaults to 120000. Exposed mainly so tests
   * need not wait.
   */
  imageTimeoutMs?: number;
};

/**
 * Ceiling for the optional image/screenshot extraction steps.
 *
 * `pdf-parse` can hang rather than fail on real exposes, and a hang escapes a
 * try/catch: the promise never settles, the event loop drains, and the process
 * exits 0 having written nothing at all. Bounding the step keeps parsing alive.
 */
const IMAGE_EXTRACTION_TIMEOUT_MS = 120_000;

/**
 * Ceiling for tearing down a per-page parser. Teardown must never stall the parse,
 * but it also must not mask a failure from the extraction it followed.
 */
const PARSE_TEARDOWN_TIMEOUT_MS = 5_000;

/** Images extracted from a single page, as returned by pdf-parse's getImage(). */
type ExtractedPageImages = {
  pageNumber: number;
  images: Array<{ dataUrl?: string; width: number; height: number }>;
};

/**
 * Reject if `promise` has not settled within `ms`, so a hung optional step cannot
 * stall the caller forever. The timer is always cleared so it never keeps the
 * event loop (and therefore the process) alive by itself.
 */
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

/**
 * Built-in PDF parser using pdf-parse.
 *
 * Accepts a Buffer or ReadableStream<Uint8Array> and extracts text per-page
 * into ArtifactContent[] with page numbers set. Embedded images on each page
 * are extracted and included as base64-encoded ArtifactImage entries in the
 * media field of the corresponding content block (unless includeImages is
 * false). Returns an Artifact with type: "pdf".
 */
export async function parsePdf(
  input: Buffer | ReadableStream<Uint8Array>,
  options?: ParsePdfOptions,
): Promise<Artifact> {
  const buffer = Buffer.isBuffer(input) ? input : await collectStream(input);

  // Dynamic import to avoid bundling issues
  const { PDFParse } = await import("pdf-parse");

  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();

  // Build a page-number → text map from per-page results
  const pageTextMap = new Map<number, string>();
  if (textResult.pages.length > 0) {
    for (const page of textResult.pages) {
      if (page.text && page.text.trim().length > 0) {
        pageTextMap.set(page.num, page.text);
      }
    }
  }

  // Extract embedded images unless the caller opted out, one page at a time.
  //
  // A single document-wide getImage() call deadlocks on any document that reuses an
  // image across pages — a recurring logo or background. pdf.js names that repeat as a
  // common object (`g_d0_...`), while pdf-parse looks every key up in the per-page
  // store, where a common key never resolves and the promise stays pending forever
  // (mozilla/pdf.js#13742, discussion #19864). Parsing each page on its own means
  // every image is a first encounter, so the key stays page-local and resolves.
  // Measured the same overall cost as the document-wide call, because decoding the
  // images dominates and that work is identical either way.
  //
  // Pages collect into a shared array, so if the budget runs out the images from the
  // pages that already finished are kept rather than discarded.
  let imageResult: { pages: ExtractedPageImages[] } | undefined;
  if (options?.includeImages !== false) {
    const totalPages = textResult.total;
    const collected: ExtractedPageImages[] = [];
    let processedPages = 0;

    try {
      await withTimeout(
        (async () => {
          for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
            // A fresh parser per page: reusing one is exactly what turns the image on
            // the second page into a common object that cannot be resolved.
            const pageParser = new PDFParse({ data: buffer });

            try {
              const pageResult = await pageParser.getImage({
                partial: [pageNumber],
                imageBuffer: false,
                imageDataUrl: true,
              });
              collected.push(...(pageResult?.pages ?? []));
            } finally {
              try {
                await withTimeout(
                  Promise.resolve(pageParser.destroy()),
                  PARSE_TEARDOWN_TIMEOUT_MS,
                  "parser teardown",
                );
              } catch {
                // A stalled teardown must not fail the parse.
              }
            }

            processedPages++;
          }
        })(),
        options?.imageTimeoutMs ?? IMAGE_EXTRACTION_TIMEOUT_MS,
        "image extraction",
      );
    } catch (error) {
      // Image extraction is optional — carry on with whatever was collected, but say
      // so: swallowing this silently turned a hung parser into an empty result with a
      // zero exit code, which is impossible to diagnose from the caller's side.
      console.error(
        `[struktur] image extraction incomplete: ${processedPages} of ${totalPages} pages done (${(error as Error).message})`,
      );
    }

    if (collected.length > 0) {
      imageResult = { pages: collected };
    }
  }

  // Render page screenshots if requested
  let screenshotResult;
  if (options?.screenshots === true) {
    try {
      const screenshotParams: {
        imageBuffer: boolean;
        imageDataUrl: boolean;
        scale?: number;
        desiredWidth?: number;
      } = { imageBuffer: false, imageDataUrl: true };

      if (options.screenshotWidth !== undefined) {
        screenshotParams.desiredWidth = options.screenshotWidth;
      } else {
        screenshotParams.scale = options.screenshotScale ?? 1.5;
      }

      screenshotResult = await withTimeout(
        parser.getScreenshot(screenshotParams),
        options?.imageTimeoutMs ?? IMAGE_EXTRACTION_TIMEOUT_MS,
        "screenshot rendering",
      );
    } catch (error) {
      // Screenshot rendering is optional — continue without screenshots.
      console.error(`[struktur] screenshot rendering skipped: ${(error as Error).message}`);
    }
  }

  // Build a page-number → ArtifactImage[] map from extracted images
  const pageImageMap = new Map<number, ArtifactImage[]>();
  if (imageResult) {
    for (const pageImages of imageResult.pages) {
      const artifactImages: ArtifactImage[] = pageImages.images
        .filter((img) => img.dataUrl)
        .map((img) => {
          // Strip the "data:<mime>;base64," prefix to get the raw base64 string.
          // The filter above guarantees a data URL; `?? ""` keeps this safe if the
          // parser ever omits one, since dataUrl is optional in its result type.
          const base64 = (img.dataUrl ?? "").replace(/^data:[^;]+;base64,/, "");
          const artifactImage: ArtifactImage = {
            type: "image",
            base64,
            width: img.width,
            height: img.height,
            imageType: "embedded",
          };
          return artifactImage;
        });
      if (artifactImages.length > 0) {
        pageImageMap.set(pageImages.pageNumber, artifactImages);
      }
    }
  }

  // Add screenshots to the pageImageMap
  if (screenshotResult) {
    for (const screenshot of screenshotResult.pages) {
      if (screenshot.dataUrl) {
        // Strip the "data:<mime>;base64," prefix to get the raw base64 string
        const base64 = screenshot.dataUrl.replace(/^data:[^;]+;base64,/, "");
        const artifactImage: ArtifactImage = {
          type: "image",
          base64,
          width: screenshot.width,
          height: screenshot.height,
          imageType: "screenshot",
        };
        // Append to existing images for this page, or create new entry
        const existing = pageImageMap.get(screenshot.pageNumber) ?? [];
        pageImageMap.set(screenshot.pageNumber, [...existing, artifactImage]);
      }
    }
  }

  // Deduplicate images document-wide: a byte-identical image (e.g. a recurring
  // logo/letterhead drawn on every page) is kept only once, so the artifact,
  // manifest and image overview never list redundant copies. Prefers the first
  // occurrence, then drops any page whose media is now empty.
  const seenImages = new Set<string>();
  for (const [pageNum, media] of pageImageMap) {
    const kept = media.filter((img) => {
      if (!img.base64) return true; // attacker/other kinds pass through
      if (seenImages.has(img.base64)) return false;
      seenImages.add(img.base64);
      return true;
    });
    if (kept.length > 0) {
      pageImageMap.set(pageNum, kept);
    } else {
      pageImageMap.delete(pageNum);
    }
  }

  let contents: ArtifactContent[];

  if (textResult.pages.length > 0) {
    // Collect all page numbers that have text or images
    const allPageNums = new Set<number>([...pageTextMap.keys(), ...pageImageMap.keys()]);

    contents = Array.from(allPageNums)
      .sort((a, b) => a - b)
      .map((pageNum) => {
        const entry: ArtifactContent = { page: pageNum };
        const text = pageTextMap.get(pageNum);
        if (text) entry.text = text;
        const media = pageImageMap.get(pageNum);
        if (media) entry.media = media;
        return entry;
      });
  } else if (pageImageMap.size > 0) {
    // No per-page text, but we have screenshots/images — create per-page entries
    contents = Array.from(pageImageMap.keys())
      .sort((a, b) => a - b)
      .map((pageNum) => {
        const entry: ArtifactContent = { page: pageNum, text: "" };
        const media = pageImageMap.get(pageNum);
        if (media) entry.media = media;
        return entry;
      });
  } else {
    // Fallback: no per-page info and no images — use full concatenated text
    const entry: ArtifactContent = { text: textResult.text };
    contents = [entry];
  }

  // Ensure we have at least one content entry
  if (contents.length === 0) {
    contents = [{ text: "" }];
  }

  let infoResult;
  try {
    infoResult = await parser.getInfo();
  } catch {
    // Info extraction is optional
  }

  await parser.destroy();

  const artifactId = `artifact-${crypto.randomUUID()}`;

  // Stamp every image with its stable virtual path so all strategies
  // (including simple/parallel etc.) can reference images by the same
  // paths the agent strategy uses.
  for (const content of contents) {
    if (!content.media) continue;
    content.media.forEach((img, idx) => {
      // Detect format from base64 signature
      let extension = "png";
      if (img.base64) {
        if (img.base64.startsWith("/9j/")) extension = "jpg";
        else if (img.base64.startsWith("iVBOR")) extension = "png";
        else if (img.base64.startsWith("R0lGOD")) extension = "gif";
        else if (img.base64.startsWith("UklGR")) extension = "webp";
      }
      img.virtualPath = `/images/${artifactId}-page-${content.page ?? 0}-image-${idx}.${extension}`;
    });
  }

  // Composite all extracted images into labeled image overviews and append them
  // as extra content entries. Each sheet is a single image the agent can read in
  // one `view_image` call, with each thumbnail labeled by its virtual path.
  // Opt-in — the CLI/immocore enables it; keeps parsePdf backward-compatible.
  if (options?.imageOverview === true && options?.includeImages !== false) {
    const allImages = contents.flatMap((c) => c.media ?? []);
    if (allImages.length > 0) {
      try {
        const sheets = await buildImageOverviews(allImages, { onto: `/images/${artifactId}` });
        for (const [i, sheet] of sheets.entries()) {
          contents.push({
            text: `Image overview ${i + 1}: a single image containing ALL extracted images as labeled thumbnails. Read the label beneath each thumbnail to get its exact /images/... path.`,
            media: [sheet],
          });
        }
      } catch (err) {
        // Compositing is best-effort — never fail parsing over it.
        console.error(`[struktur] image overview compositing failed: ${(err as Error).message}`);
      }
    }
  }

  return {
    id: artifactId,
    type: "pdf",
    raw: async () => buffer,
    contents,
    metadata: infoResult
      ? {
          numpages: textResult.total,
          info: infoResult,
        }
      : { numpages: textResult.total },
  };
}
