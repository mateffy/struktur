import { estimateImageTokens, estimateTextTokens } from "../../tokenization";
import type { VirtualFilesystemResult } from "./ArtifactFilesystem";

export type PrefillOptions = {
  /** Maximum tokens of document text to pre-load. */
  textTokens: number;
  /**
   * Hard cap on pre-loaded images, image overviews first. Default: 1 — the
   * overview alone, which already shows every extracted image.
   */
  maxImages?: number;
  /**
   * Hard cap on the total base64 bytes of pre-loaded images. Providers reject
   * oversized request bodies (OpenRouter: "Downloaded image content cannot
   * exceed 30MB") and a single image is 1–4 MB, so a count alone is not enough.
   * Default: 12 MB.
   */
  maxImageBytes?: number;
};

export type PrefillResult = {
  /** Synthetic `read` / `view_image` assistant + tool message pairs. */
  messages: any[];
  tokens: number;
  textTokens: number;
  imageTokens: number;
  imagePaths: string[];
  /** True when the document did not fit into the budget. */
  truncated: boolean;
};

/** Mirrors the `read` tool's own contract: max 1000 lines per call. */
const LINES_PER_CHUNK = 1000;

const buildReadMessages = (filePath: string, contents: string, budget: number) => {
  const lines = contents.split("\n");
  const messages: any[] = [];
  let textTokens = 0;
  let chunkIndex = 0;

  for (let start = 0; start < lines.length; start += LINES_PER_CHUNK) {
    const chunk = lines.slice(start, start + LINES_PER_CHUNK).join("\n");
    const tokens = estimateTextTokens(chunk);
    if (textTokens + tokens > budget) break;

    chunkIndex++;
    textTokens += tokens;
    // Stable ids derived from the path/index so an identical document produces a
    // byte-identical prefix and provider prompt caching can hit.
    const toolCallId = `prefill_read_${chunkIndex}`;

    messages.push({
      role: "assistant",
      content: [
        {
          type: "tool-call",
          toolCallId,
          toolName: "read",
          input: { file_path: filePath, offset: start + 1, limit: LINES_PER_CHUNK },
        },
      ],
    });
    messages.push({
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId,
          toolName: "read",
          output: { type: "content", value: [{ type: "text", text: chunk }] },
        },
      ],
    });
  }

  return { messages, textTokens, truncated: chunkIndex * LINES_PER_CHUNK < lines.length };
};

/**
 * Pre-load the agent's context with synthetic tool calls so it does not have to
 * spend steps discovering the document text and images.
 *
 * Overview sheets come first: one image that shows every extracted image is worth
 * far more per token than a single photo. Pure function — no network, no LLM.
 */
export const buildPrefill = (
  filesystem: VirtualFilesystemResult,
  options: PrefillOptions,
): PrefillResult => {
  const textBudget = Math.max(0, options.textTokens);

  const artifactJson = filesystem["/artifact.json"] ?? "";
  const read = buildReadMessages("/artifact.json", artifactJson, textBudget);

  const allPaths = Array.from(filesystem.virtualFiles.keys());
  const imagePaths = [
    ...allPaths.filter((p) => p.includes("image-overview")),
    ...allPaths.filter((p) => !p.includes("image-overview")),
  ];

  const maxImages = options.maxImages ?? 1;
  const maxImageBytes = options.maxImageBytes ?? 12_000_000;
  const messages = [...read.messages];
  const loadedPaths: string[] = [];
  let imageTokens = 0;
  let imageBytes = 0;

  for (const path of imagePaths) {
    if (loadedPaths.length >= maxImages) break;

    const data = filesystem.getImageByPath(path);
    if (!data) continue;

    const tokens = estimateImageTokens();
    if (imageBytes + data.length > maxImageBytes) continue;

    const toolCallId = `prefill_view_image_${loadedPaths.length + 1}`;
    const mediaType = path.endsWith(".png") ? "image/png" : "image/jpeg";

    messages.push({
      role: "assistant",
      content: [
        { type: "tool-call", toolCallId, toolName: "view_image", input: { image_path: path } },
      ],
    });
    messages.push({
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId,
          toolName: "view_image",
          output: {
            type: "content",
            value: [
              { type: "text", text: `[Image: ${path}]` },
              { type: "media", data, mediaType },
            ],
          },
        },
      ],
    });

    loadedPaths.push(path);
    imageTokens += tokens;
    imageBytes += data.length;
  }

  return {
    messages,
    tokens: read.textTokens + imageTokens,
    textTokens: read.textTokens,
    imageTokens,
    imagePaths: loadedPaths,
    truncated: read.truncated || loadedPaths.length < imagePaths.length,
  };
};
