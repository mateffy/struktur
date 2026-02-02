import type { Artifact } from "../types";
import {
  countArtifactTokens,
  countArtifactImages,
  type TokenCountOptions,
} from "../tokenization";
import { splitArtifact } from "./ArtifactSplitter";

export type BatchOptions = TokenCountOptions & {
  maxTokens: number;
  maxImages?: number;
  modelMaxTokens?: number;
};

export const batchArtifacts = (
  artifacts: Artifact[],
  options: BatchOptions
): Artifact[][] => {
  const maxTokens = options.modelMaxTokens
    ? Math.min(options.maxTokens, options.modelMaxTokens)
    : options.maxTokens;

  const batches: Artifact[][] = [];
  let currentBatch: Artifact[] = [];
  let currentTokens = 0;
  let currentImages = 0;

  for (const artifact of artifacts) {
    const splits = splitArtifact(artifact, { ...options, maxTokens });

    for (const split of splits) {
      const splitTokens = countArtifactTokens(split, options);
      const splitImages = countArtifactImages(split);

      const exceedsTokens =
        currentBatch.length > 0 && currentTokens + splitTokens > maxTokens;
      const exceedsImages =
        options.maxImages !== undefined &&
        currentBatch.length > 0 &&
        currentImages + splitImages > options.maxImages;

      if (exceedsTokens || exceedsImages) {
        batches.push(currentBatch);
        currentBatch = [];
        currentTokens = 0;
        currentImages = 0;
      }

      currentBatch.push(split);
      currentTokens += splitTokens;
      currentImages += splitImages;
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
};
