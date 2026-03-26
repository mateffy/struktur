import type { Artifact, ArtifactContent } from "../types";
import type { DebugLogger } from "../debug/logger";
import {
  countContentTokens,
  countArtifactTokens,
  estimateTextTokens,
  type TokenCountOptions,
} from "../tokenization";

export type SplitOptions = TokenCountOptions & {
  maxTokens: number;
  maxImages?: number;
  debug?: DebugLogger;
};

const splitTextIntoChunks = (
  content: ArtifactContent,
  maxTokens: number,
  options?: TokenCountOptions,
  debug?: DebugLogger,
  artifactId?: string,
): ArtifactContent[] => {
  if (!content.text) {
    return [content];
  }

  const totalTokens = estimateTextTokens(content.text, options);
  if (totalTokens <= maxTokens) {
    return [content];
  }

  const ratio = options?.textTokenRatio ?? 4;
  const chunkSize = Math.max(1, maxTokens * ratio);
  const chunks: ArtifactContent[] = [];

  // Log text splitting
  if (debug && artifactId) {
    debug.chunkingSplit({
      artifactId,
      originalContentCount: 1,
      splitContentCount: Math.ceil(content.text.length / chunkSize),
      splitReason: "text_too_long",
      originalTokens: totalTokens,
      chunkSize,
    });
  }

  for (let offset = 0; offset < content.text.length; offset += chunkSize) {
    const text = content.text.slice(offset, offset + chunkSize);
    chunks.push({
      page: content.page,
      text,
      media: offset === 0 ? content.media : undefined,
    });
  }

  return chunks;
};

export const splitArtifact = (artifact: Artifact, options: SplitOptions): Artifact[] => {
  const { maxTokens, maxImages, debug } = options;
  const splitContents: ArtifactContent[] = [];

  // Log chunking start
  const totalTokens = countArtifactTokens(artifact, options);
  debug?.chunkingStart({
    artifactId: artifact.id,
    totalTokens,
    maxTokens,
    maxImages,
  });

  for (const content of artifact.contents) {
    splitContents.push(...splitTextIntoChunks(content, maxTokens, options, debug, artifact.id));
  }

  const chunks: Artifact[] = [];
  let currentContents: ArtifactContent[] = [];
  let currentTokens = 0;
  let currentImages = 0;

  for (const content of splitContents) {
    const contentTokens = countContentTokens(content, options);
    const contentImages = content.media?.length ?? 0;

    const exceedsTokens = currentContents.length > 0 && currentTokens + contentTokens > maxTokens;
    const exceedsImages =
      maxImages !== undefined &&
      currentContents.length > 0 &&
      currentImages + contentImages > maxImages;

    if (exceedsTokens || exceedsImages) {
      // Log chunk creation
      if (debug) {
        debug.chunkingSplit({
          artifactId: artifact.id,
          originalContentCount: splitContents.length,
          splitContentCount: chunks.length + 1,
          splitReason: exceedsTokens ? "content_limit" : "content_limit",
          originalTokens: totalTokens,
          chunkSize: maxTokens,
        });
      }

      chunks.push({
        ...artifact,
        id: `${artifact.id}:part:${chunks.length + 1}`,
        contents: currentContents,
        tokens: currentTokens,
      });
      currentContents = [];
      currentTokens = 0;
      currentImages = 0;
    }

    currentContents.push(content);
    currentTokens += contentTokens;
    currentImages += contentImages;
  }

  if (currentContents.length > 0) {
    chunks.push({
      ...artifact,
      id: `${artifact.id}:part:${chunks.length + 1}`,
      contents: currentContents,
      tokens: currentTokens,
    });
  }

  if (chunks.length === 0) {
    chunks.push({
      ...artifact,
      id: `${artifact.id}:part:1`,
      tokens: countArtifactTokens(artifact, options),
    });
  }

  // Log chunking result
  debug?.chunkingResult({
    artifactId: artifact.id,
    chunksCreated: chunks.length,
    chunkSizes: chunks.map((c) => c.tokens ?? 0),
  });

  return chunks;
};
