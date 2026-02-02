import type { Artifact, ArtifactContent } from "../types";
import {
  countContentTokens,
  countArtifactImages,
  countArtifactTokens,
  estimateTextTokens,
  type TokenCountOptions,
} from "../tokenization";

export type SplitOptions = TokenCountOptions & {
  maxTokens: number;
  maxImages?: number;
};

const splitTextIntoChunks = (
  content: ArtifactContent,
  maxTokens: number,
  options?: TokenCountOptions
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

export const splitArtifact = (
  artifact: Artifact,
  options: SplitOptions
): Artifact[] => {
  const { maxTokens, maxImages } = options;
  const splitContents: ArtifactContent[] = [];

  for (const content of artifact.contents) {
    splitContents.push(...splitTextIntoChunks(content, maxTokens, options));
  }

  const chunks: Artifact[] = [];
  let currentContents: ArtifactContent[] = [];
  let currentTokens = 0;
  let currentImages = 0;

  for (const content of splitContents) {
    const contentTokens = countContentTokens(content, options);
    const contentImages = content.media?.length ?? 0;

    const exceedsTokens =
      currentContents.length > 0 && currentTokens + contentTokens > maxTokens;
    const exceedsImages =
      maxImages !== undefined &&
      currentContents.length > 0 &&
      currentImages + contentImages > maxImages;

    if (exceedsTokens || exceedsImages) {
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

  return chunks;
};
