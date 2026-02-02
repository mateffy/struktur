import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { ParallelStrategy } from "./ParallelStrategy";
import { buildSequentialPrompt } from "../prompts/SequentialExtractorPrompt";
import { extractWithPrompt, getBatches, mergeUsage, serializeSchema } from "./utils";
import { runWithRetries } from "../llm/RetryingRunner";

export type DoublePassStrategyConfig = {
  model: unknown;
  mergeModel: unknown;
  chunkSize: number;
  concurrency?: number;
  maxImages?: number;
  outputInstructions?: string;
  execute?: typeof runWithRetries;
};

export class DoublePassStrategy<T> implements ExtractionStrategy<T> {
  public name = "double-pass";
  private config: DoublePassStrategyConfig;

  constructor(config: DoublePassStrategyConfig) {
    this.config = config;
  }

  async run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>> {
    const firstPass = await new ParallelStrategy<T>({
      model: this.config.model,
      mergeModel: this.config.mergeModel,
      chunkSize: this.config.chunkSize,
      concurrency: this.config.concurrency,
      maxImages: this.config.maxImages,
      outputInstructions: this.config.outputInstructions,
      execute: this.config.execute,
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

export const doublePass = <T>(config: DoublePassStrategyConfig) => {
  return new DoublePassStrategy<T>(config);
};
