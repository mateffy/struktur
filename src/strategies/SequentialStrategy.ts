import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { buildSequentialPrompt } from "../prompts/SequentialExtractorPrompt";
import { extractWithPrompt, getBatches, mergeUsage, serializeSchema } from "./utils";
import { runWithRetries } from "../llm/RetryingRunner";

export type SequentialStrategyConfig = {
  model: unknown;
  chunkSize: number;
  maxImages?: number;
  outputInstructions?: string;
  execute?: typeof runWithRetries;
};

export class SequentialStrategy<T> implements ExtractionStrategy<T> {
  public name = "sequential";
  private config: SequentialStrategyConfig;

  constructor(config: SequentialStrategyConfig) {
    this.config = config;
  }

  getEstimatedSteps(artifacts: ExtractionOptions<T>["artifacts"]): number {
    const batches = getBatches(artifacts, {
      maxTokens: this.config.chunkSize,
      maxImages: this.config.maxImages,
    });
    return batches.length + 2;
  }

  async run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>> {
    const batches = getBatches(options.artifacts, {
      maxTokens: this.config.chunkSize,
      maxImages: this.config.maxImages,
    });

    const schema = serializeSchema(options.schema);
    let currentData: T | undefined;
    const usages = [];
    const totalSteps = this.getEstimatedSteps(options.artifacts);
    let step = 1;

    for (const [index, batch] of batches.entries()) {
      const previousData = currentData ? JSON.stringify(currentData) : "{}";
      const prompt = buildSequentialPrompt(
        batch,
        schema,
        previousData,
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

      step += 1;
      await options.events?.onStep?.({
        step,
        total: totalSteps,
        label: `batch ${index + 1}/${batches.length}`,
      });
    }

    if (!currentData) {
      throw new Error("No data extracted from sequential strategy");
    }

    return { data: currentData, usage: mergeUsage(usages) };
  }
}

export const sequential = <T>(config: SequentialStrategyConfig) => {
  return new SequentialStrategy<T>(config);
};
