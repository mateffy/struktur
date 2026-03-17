import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { buildExtractorPrompt } from "../prompts/ExtractorPrompt";
import { buildParallelMergerPrompt } from "../prompts/ParallelMergerPrompt";
import {
  extractWithPrompt,
  getBatches,
  mergeUsage,
  serializeSchema,
} from "./utils";
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
  strict?: boolean;
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
    const debug = options.debug;
    const { telemetry } = options;
    
    // Create strategy-level span
    const strategySpan = telemetry?.startSpan({
      name: "strategy.parallel",
      kind: "CHAIN",
      attributes: {
        "strategy.name": this.name,
        "strategy.artifacts.count": options.artifacts.length,
        "strategy.chunk_size": this.config.chunkSize,
        "strategy.concurrency": this.config.concurrency,
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

    const tasks = batches.map((batch, index) => async () => {
      const prompt = buildExtractorPrompt(
        batch,
        schema,
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
        callId: `parallel_batch_${index + 1}`,
        telemetry: telemetry ?? undefined,
        parentSpan: strategySpan,
      });
      // Emit progress after batch completes (if there are more batches)
      const completedIndex = index + 1;
      if (completedIndex < batches.length) {
        step += 1;
        await options.events?.onStep?.({
          step,
          total: totalSteps,
          label: `batch ${completedIndex + 1}/${batches.length}`,
        });
        debug?.step({
          step,
          total: totalSteps,
          label: `batch ${completedIndex + 1}/${batches.length}`,
          strategy: this.name,
        });
      }
      return result;
    });

    const results = await runConcurrently(
      tasks,
      this.config.concurrency ?? batches.length,
    );

    debug?.mergeStart({
      mergeId: "parallel_merge",
      inputCount: results.length,
      strategy: this.name,
    });
    
    // Create merge span
    const mergeSpan = telemetry?.startSpan({
      name: "struktur.merge",
      kind: "CHAIN",
      parentSpan: strategySpan,
      attributes: {
        "merge.strategy": "parallel",
        "merge.input_count": results.length,
      },
    });

    const mergePrompt = buildParallelMergerPrompt(
      schema,
      results.map((r) => r.data),
    );
    const merged = await extractWithPrompt<T>({
      model: this.config.mergeModel,
      schema: options.schema,
      system: mergePrompt.system,
      user: mergePrompt.user,
      artifacts: [],
      events: options.events,
      execute: this.config.execute as never,
      strict: this.config.strict,
      debug,
      callId: "parallel_merge",
      telemetry: telemetry ?? undefined,
      parentSpan: mergeSpan,
    });

    step += 1;
    await options.events?.onStep?.({
      step,
      total: totalSteps,
      label: "merge",
    });
    debug?.step({
      step,
      total: totalSteps,
      label: "merge",
      strategy: this.name,
    });
    debug?.mergeComplete({ mergeId: "parallel_merge", success: true });
    
    // End merge span
    if (mergeSpan && telemetry) {
      telemetry.recordEvent(mergeSpan, {
        type: "merge",
        strategy: "parallel",
        inputCount: results.length,
        outputCount: 1,
      });
      telemetry.endSpan(mergeSpan, {
        status: "ok",
        output: merged.data,
      });
    }
    
    // End strategy span
    telemetry?.endSpan(strategySpan!, {
      status: "ok",
      output: merged.data,
    });

    return {
      data: merged.data,
      usage: mergeUsage([...results.map((r) => r.usage), merged.usage]),
    };
  }
}

export const parallel = <T>(config: ParallelStrategyConfig) => {
  return new ParallelStrategy<T>(config);
};
