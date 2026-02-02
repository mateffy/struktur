import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { ParallelAutoMergeStrategy } from "./ParallelAutoMergeStrategy";
import { buildSequentialPrompt } from "../prompts/SequentialExtractorPrompt";
import { extractWithPrompt, getBatches, mergeUsage, serializeSchema } from "./utils";
import { runWithRetries } from "../llm/RetryingRunner";

export type DoublePassAutoMergeStrategyConfig = {
  model: unknown;
  chunkSize: number;
  concurrency?: number;
  maxImages?: number;
  outputInstructions?: string;
  dedupeModel?: unknown;
  execute?: typeof runWithRetries;
  dedupeExecute?: typeof runWithRetries;
};

export class DoublePassAutoMergeStrategy<T> implements ExtractionStrategy<T> {
  public name = "double-pass-auto-merge";
  private config: DoublePassAutoMergeStrategyConfig;

  constructor(config: DoublePassAutoMergeStrategyConfig) {
    this.config = config;
  }

  async run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>> {
    const firstPass = await new ParallelAutoMergeStrategy<T>({
      model: this.config.model,
      chunkSize: this.config.chunkSize,
      concurrency: this.config.concurrency,
      maxImages: this.config.maxImages,
      outputInstructions: this.config.outputInstructions,
      dedupeModel: this.config.dedupeModel,
      execute: this.config.execute,
      dedupeExecute: this.config.dedupeExecute,
    }).run(options);

    const batches = getBatches(options.artifacts, {
      maxTokens: this.config.chunkSize,
      maxImages: this.config.maxImages,
    });

    const schema = serializeSchema(options.schema);
    let currentData = firstPass.data;
    const usages = [firstPass.usage];

    for (const batch of batches) {
      const prompt = buildSequentialPrompt(
        batch,
        schema,
        JSON.stringify(currentData),
        this.config.outputInstructions
      );

      const result = await extractWithPrompt<T>({
        model: this.config.model,
        schema: options.schema,
        system: prompt.system,
        user: prompt.user,
        artifacts: batch,
        events: options.events,
        execute: this.config.execute as never,
      });

      currentData = result.data;
      usages.push(result.usage);
    }

    return { data: currentData, usage: mergeUsage(usages) };
  }
}

export const doublePassAutoMerge = <T>(
  config: DoublePassAutoMergeStrategyConfig
) => {
  return new DoublePassAutoMergeStrategy<T>(config);
};
