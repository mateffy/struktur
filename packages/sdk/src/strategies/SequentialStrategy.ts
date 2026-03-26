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
  strict?: boolean;
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
    const debug = options.debug;
    const { telemetry } = options;

    // Create strategy-level span
    const strategySpan = telemetry?.startSpan({
      name: "strategy.sequential",
      kind: "CHAIN",
      attributes: {
        "strategy.name": this.name,
        "strategy.artifacts.count": options.artifacts.length,
        "strategy.chunk_size": this.config.chunkSize,
      },
    });

    const batches = getBatches(
      options.artifacts,
      {
        maxTokens: this.config.chunkSize,
        maxImages: this.config.maxImages,
      },
      debug,
      telemetry ?? undefined,
      strategySpan,
    );

    const schema = serializeSchema(options.schema);
    let currentData: T | undefined;
    const usages = [];
    const totalSteps = this.getEstimatedSteps(options.artifacts);
    let step = 1;

    // Emit start event
    await options.events?.onStep?.({
      step,
      total: totalSteps,
      label: batches.length > 1 ? `batch 1/${batches.length}` : "extract",
    });
    debug?.step({
      step,
      total: totalSteps,
      label: batches.length > 1 ? `batch 1/${batches.length}` : "extract",
      strategy: this.name,
    });

    for (const [index, batch] of batches.entries()) {
      const previousData = currentData ? JSON.stringify(currentData) : "{}";
      const prompt = buildSequentialPrompt(
        batch,
        schema,
        previousData,
        this.config.outputInstructions,
      );

      const result = await extractWithPrompt<T>({
        model: this.config.model,
        schema: options.schema,
        system: prompt.system,
        user: prompt.user,
        artifacts: batch,
        events: options.events,
        execute: this.config.execute as never,
        strict: options.strict ?? this.config.strict,
        debug,
        callId: `sequential_batch_${index + 1}`,
        telemetry: telemetry ?? undefined,
        parentSpan: strategySpan,
      });

      currentData = result.data;
      usages.push(result.usage);

      step += 1;
      // Only emit progress if there are more batches
      if (index < batches.length - 1) {
        await options.events?.onStep?.({
          step,
          total: totalSteps,
          label: `batch ${index + 2}/${batches.length}`,
        });
        debug?.step({
          step,
          total: totalSteps,
          label: `batch ${index + 2}/${batches.length}`,
          strategy: this.name,
        });
      }
    }

    if (!currentData) {
      throw new Error("No data extracted from sequential strategy");
    }

    // End strategy span
    telemetry?.endSpan(strategySpan!, {
      status: "ok",
      output: currentData,
    });

    return { data: currentData, usage: mergeUsage(usages) };
  }
}

export const sequential = <T>(config: SequentialStrategyConfig) => {
  return new SequentialStrategy<T>(config);
};
