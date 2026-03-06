import type { Artifact } from "../types";
import type { DebugLogger } from "../debug/logger";
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
  debug?: DebugLogger;
};

export const batchArtifacts = (
  artifacts: Artifact[],
  options: BatchOptions
): Artifact[][] => {
  const debug = options.debug;
  const maxTokens = options.modelMaxTokens
    ? Math.min(options.maxTokens, options.modelMaxTokens)
    : options.maxTokens;

  // Log batching start
  debug?.batchingStart({
    totalArtifacts: artifacts.length,
    maxTokens: options.maxTokens,
    maxImages: options.maxImages,
    modelMaxTokens: options.modelMaxTokens,
    effectiveMaxTokens: maxTokens,
  });

  const batches: Artifact[][] = [];
  let currentBatch: Artifact[] = [];
  let currentTokens = 0;
  let currentImages = 0;

  for (const artifact of artifacts) {
    const splitOptions: any = { 
      maxTokens,
      debug,
    };
    if (options.maxImages !== undefined) splitOptions.maxImages = options.maxImages;
    if (options.textTokenRatio !== undefined) splitOptions.textTokenRatio = options.textTokenRatio;
    if (options.defaultImageTokens !== undefined) splitOptions.defaultImageTokens = options.defaultImageTokens;
    
    const splits = splitArtifact(artifact, splitOptions);

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
        // Log batch creation
        debug?.batchCreated({
          batchIndex: batches.length,
          artifactCount: currentBatch.length,
          totalTokens: currentTokens,
          totalImages: currentImages,
          artifactIds: currentBatch.map(a => a.id),
        });
        
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
    // Log final batch
    debug?.batchCreated({
      batchIndex: batches.length,
      artifactCount: currentBatch.length,
      totalTokens: currentTokens,
      totalImages: currentImages,
      artifactIds: currentBatch.map(a => a.id),
    });
    batches.push(currentBatch);
  }

  // Log batching complete
  debug?.batchingComplete({
    totalBatches: batches.length,
    batches: batches.map((batch, index) => ({
      index,
      artifactCount: batch.length,
      tokens: batch.reduce((sum, a) => sum + (a.tokens ?? 0), 0),
      images: batch.reduce((sum, a) => 
        sum + a.contents.reduce((c, content) => c + (content.media?.length ?? 0), 0), 0
      ),
    })),
  });

  return batches;
};
