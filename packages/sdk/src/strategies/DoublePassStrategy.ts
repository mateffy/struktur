import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { buildExtractorPrompt } from "../prompts/ExtractorPrompt";
import { buildParallelMergerPrompt } from "../prompts/ParallelMergerPrompt";
import { buildSequentialPrompt } from "../prompts/SequentialExtractorPrompt";
import {
  extractWithPrompt,
  getBatches,
  mergeUsage,
  serializeSchema,
} from "./utils";
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
  strict?: boolean;
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
    const debug = options.debug;
    const { telemetry } = options;
    
    // Create strategy-level span
    const strategySpan = telemetry?.startSpan({
      name: "strategy.double-pass",
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
    
    // Create pass 1 span
    const pass1Span = telemetry?.startSpan({
      name: "struktur.pass_1",
      kind: "CHAIN",
      parentSpan: strategySpan,
      attributes: {
        "pass.number": 1,
        "pass.type": "parallel_extraction",
      },
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
        callId: `double_pass_1_batch_${index + 1}`,
        telemetry: telemetry ?? undefined,
        parentSpan: pass1Span,
      });
      step += 1;
      await options.events?.onStep?.({
        step,
        total: totalSteps,
        label: `pass 1 batch ${index + 1}/${batches.length}`,
      });
      debug?.step({
        step,
        total: totalSteps,
        label: `pass 1 batch ${index + 1}/${batches.length}`,
        strategy: this.name,
      });
      return result;
    });

    const results = await runConcurrently(
      tasks,
      this.config.concurrency ?? batches.length,
    );

    debug?.mergeStart({
      mergeId: "double_pass_1_merge",
      inputCount: results.length,
      strategy: this.name,
    });
    
    // Create pass 1 merge span
    const pass1MergeSpan = telemetry?.startSpan({
      name: "struktur.pass_1_merge",
      kind: "CHAIN",
      parentSpan: pass1Span,
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
      callId: "double_pass_1_merge",
      telemetry: telemetry ?? undefined,
      parentSpan: pass1MergeSpan,
    });

    step += 1;
    await options.events?.onStep?.({
      step,
      total: totalSteps,
      label: "pass 1 merge",
    });
    debug?.step({
      step,
      total: totalSteps,
      label: "pass 1 merge",
      strategy: this.name,
    });
    debug?.mergeComplete({ mergeId: "double_pass_1_merge", success: true });
    
    // End pass 1 merge span
    if (pass1MergeSpan && telemetry) {
      telemetry.recordEvent(pass1MergeSpan, {
        type: "merge",
        strategy: "parallel",
        inputCount: results.length,
        outputCount: 1,
      });
      telemetry.endSpan(pass1MergeSpan, {
        status: "ok",
        output: merged.data,
      });
    }
    
    // End pass 1 span
    telemetry?.endSpan(pass1Span!, {
      status: "ok",
      output: merged.data,
    });
    
    // Create pass 2 span
    const pass2Span = telemetry?.startSpan({
      name: "struktur.pass_2",
      kind: "CHAIN",
      parentSpan: strategySpan,
      attributes: {
        "pass.number": 2,
        "pass.type": "sequential_refinement",
      },
    });

    let currentData = merged.data;
    const usages = [...results.map((r) => r.usage), merged.usage];

    for (const [index, batch] of batches.entries()) {
      const prompt = buildSequentialPrompt(
        batch,
        schema,
        JSON.stringify(currentData),
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
        strict: this.config.strict,
        debug,
        callId: `double_pass_2_batch_${index + 1}`,
        telemetry: telemetry ?? undefined,
        parentSpan: pass2Span,
      });

      currentData = result.data;
      usages.push(result.usage);

      step += 1;
      await options.events?.onStep?.({
        step,
        total: totalSteps,
        label: `pass 2 batch ${index + 1}/${batches.length}`,
      });
      debug?.step({
        step,
        total: totalSteps,
        label: `pass 2 batch ${index + 1}/${batches.length}`,
        strategy: this.name,
      });
    }
    
    // End pass 2 span
    telemetry?.endSpan(pass2Span!, {
      status: "ok",
      output: currentData,
    });
    
    // End strategy span
    telemetry?.endSpan(strategySpan!, {
      status: "ok",
      output: currentData,
    });

    return { data: currentData, usage: mergeUsage(usages) };
  }
}

export const doublePass = <T>(config: DoublePassStrategyConfig) => {
  return new DoublePassStrategy<T>(config);
};
