import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { buildExtractorPrompt } from "../prompts/ExtractorPrompt";
import { buildParallelMergerPrompt } from "../prompts/ParallelMergerPrompt";
import { buildSequentialPrompt } from "../prompts/SequentialExtractorPrompt";
import { extractWithPrompt, getBatches, mergeUsage, serializeSchema } from "./utils";
import { runConcurrently } from "./concurrency";
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

  getEstimatedSteps(artifacts: ExtractionOptions<T>["artifacts"]): number {
    const batches = getBatches(artifacts, {
      maxTokens: this.config.chunkSize,
      maxImages: this.config.maxImages,
    });
    return batches.length * 2 + 3;
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
        label: `pass 1 batch ${index + 1}/${batches.length}`,
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
      label: "pass 1 merge",
    });

    let currentData = merged.data;
    const usages = [...results.map((r) => r.usage), merged.usage];

    for (const [index, batch] of batches.entries()) {
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

      step += 1;
      await options.events?.onStep?.({
        step,
        total: totalSteps,
        label: `pass 2 batch ${index + 1}/${batches.length}`,
      });
    }

    return { data: currentData, usage: mergeUsage(usages) };
  }
}

export const doublePass = <T>(config: DoublePassStrategyConfig) => {
  return new DoublePassStrategy<T>(config);
};
