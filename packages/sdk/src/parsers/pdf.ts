import type { Artifact, ArtifactContent, ArtifactImage } from "../types";
import { collectStream } from "./collect";
import { buildContactSheets } from "./contactSheet";

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
   * Whether to composite all extracted images into labeled contact sheets and
   * append them as extra content entries. Defaults to true. Pass false to skip.
   */
  contactSheet?: boolean;
};

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

  // Extract embedded images unless the caller opted out.
  // imageBuffer=false saves memory (we only need the data URL).
  let imageResult;
  if (options?.includeImages !== false) {
    try {
      imageResult = await parser.getImage({ imageBuffer: false, imageDataUrl: true });
    } catch {
      // Image extraction is optional — continue without images if it fails
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

      screenshotResult = await parser.getScreenshot(screenshotParams);
    } catch {
      // Screenshot rendering is optional — continue without screenshots if it fails
    }
  }

  // Build a page-number → ArtifactImage[] map from extracted images
  const pageImageMap = new Map<number, ArtifactImage[]>();
  if (imageResult) {
    for (const pageImages of imageResult.pages) {
      const artifactImages: ArtifactImage[] = pageImages.images
        .filter((img) => img.dataUrl)
        .map((img) => {
          // Strip the "data:<mime>;base64," prefix to get the raw base64 string
          const base64 = img.dataUrl.replace(/^data:[^;]+;base64,/, "");
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
  // manifest and contact sheet never list redundant copies. Prefers the first
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

  // Composite all extracted images into labeled contact sheets and append them
  // as extra content entries. Each sheet is a single image the agent can read in
  // one `view_image` call, with each thumbnail labeled by its virtual path.
  // Opt-in — the CLI/immocore enables it; keeps parsePdf backward-compatible.
  if (options?.contactSheet === true && options?.includeImages !== false) {
    const allImages = contents.flatMap((c) => c.media ?? []);
    if (allImages.length > 0) {
      try {
        const sheets = await buildContactSheets(allImages, { onto: `/images/${artifactId}` });
        for (const [i, sheet] of sheets.entries()) {
          contents.push({
            text: `Contact sheet ${i + 1}: all extracted images, each labeled with its virtual filesystem path. Copy the label under each image exactly.`,
            media: [sheet],
          });
        }
      } catch (err) {
        // Compositing is best-effort — never fail parsing over it.
        console.error(`[struktur] contact sheet compositing failed: ${(err as Error).message}`);
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
