import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { buildExtractorPrompt } from "../prompts/ExtractorPrompt";
import { buildParallelMergerPrompt } from "../prompts/ParallelMergerPrompt";
import { extractWithPrompt, getBatches, mergeUsage, serializeSchema } from "./utils";
import { runConcurrently } from "./concurrency";
import { runWithRetries } from "../llm/RetryingRunner";

export type ParallelStrategyConfig = {
  model: unknown;
  mergeModel: unknown;
  chunkSize: number;
  concurrency?: number;
  maxImages?: number;
  outputInstructions?: string;
  execute?: typeof runWithRetries;
};

export class ParallelStrategy<T> implements ExtractionStrategy<T> {
  public name = "parallel";
  private config: ParallelStrategyConfig;

  constructor(config: ParallelStrategyConfig) {
    this.config = config;
  }

  getEstimatedSteps(artifacts: ExtractionOptions<T>["artifacts"]): number {
    const batches = getBatches(artifacts, {
      maxTokens: this.config.chunkSize,
      maxImages: this.config.maxImages,
    });
    return batches.length + 3;
  }

  async run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>> {
    const batches = getBatches(options.artifacts, {
      maxTokens: this.config.chunkSize,
      maxImages: this.config.maxImages,
    });

    const schema = serializeSchema(options.schema);
    const totalSteps = this.getEstimatedSteps(options.artifacts);
    let step = 1;
    const tasks = batches.map((batch, index) => async () => {
      const prompt = buildExtractorPrompt(
        batch,
        schema,
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
      step += 1;
      await options.events?.onStep?.({
        step,
        total: totalSteps,
        label: `batch ${index + 1}/${batches.length}`,
      });
      return result;
    });

    const results = await runConcurrently(
      tasks,
      this.config.concurrency ?? batches.length
    );

    const mergePrompt = buildParallelMergerPrompt(schema, results.map((r) => r.data));
    const merged = await extractWithPrompt<T>({
      model: this.config.mergeModel,
      schema: options.schema,
      system: mergePrompt.system,
      user: mergePrompt.user,
      artifacts: [],
      events: options.events,
      execute: this.config.execute as never,
    });

    step += 1;
    await options.events?.onStep?.({
      step,
      total: totalSteps,
      label: "merge",
    });

    return { data: merged.data, usage: mergeUsage([...results.map((r) => r.usage), merged.usage]) };
  }
}

export const parallel = <T>(config: ParallelStrategyConfig) => {
  return new ParallelStrategy<T>(config);
};
