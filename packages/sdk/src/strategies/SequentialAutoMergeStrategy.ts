import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { buildExtractorPrompt } from "../prompts/ExtractorPrompt";
import { buildDeduplicationPrompt } from "../prompts/DeduplicationPrompt";
import {
  extractWithPrompt,
  getBatches,
  mergeUsage,
  serializeSchema,
} from "./utils";
import { SmartDataMerger } from "../merge/SmartDataMerger";
import {
  findExactDuplicatesWithHashing,
  deduplicateByIndices,
} from "../merge/Deduplicator";
import { runWithRetries } from "../llm/RetryingRunner";

export type SequentialAutoMergeStrategyConfig = {
  model: unknown;
  chunkSize: number;
  maxImages?: number;
  outputInstructions?: string;
  dedupeModel?: unknown;
  execute?: typeof runWithRetries;
  dedupeExecute?: typeof runWithRetries;
  strict?: boolean;
};

const dedupeSchema = {
  type: "object",
  properties: {
    keys: { type: "array", items: { type: "string" } },
  },
  required: ["keys"],
  additionalProperties: false,
} as const;

const dedupeArrays = (data: Record<string, unknown>) => {
  const result: Record<string, unknown> = { ...data };
  for (const [key, value] of Object.entries(result)) {
    if (Array.isArray(value)) {
      const duplicates = findExactDuplicatesWithHashing(value);
      result[key] = deduplicateByIndices(value, duplicates);
    }
  }
  return result;
};

const removeByPath = (data: Record<string, unknown>, path: string) => {
  const [root, indexStr] = path.split(".");
  const index = Number(indexStr);
  if (!root || Number.isNaN(index)) {
    return data;
  }

  const value = data[root];
  if (!Array.isArray(value)) {
    return data;
  }

  const next = [...value];
  next.splice(index, 1);
  return { ...data, [root]: next };
};

export class SequentialAutoMergeStrategy<T> implements ExtractionStrategy<T> {
  public name = "sequential-auto-merge";
  private config: SequentialAutoMergeStrategyConfig;

  constructor(config: SequentialAutoMergeStrategyConfig) {
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
      name: "strategy.sequential-auto-merge",
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
    const merger = new SmartDataMerger(
      options.schema as Record<string, unknown>,
    );
    let merged = {} as Record<string, unknown>;
    const usages = [];
    const totalSteps = this.getEstimatedSteps(options.artifacts);
    let step = 1;

    debug?.mergeStart({
      mergeId: "sequential_auto_merge",
      inputCount: batches.length,
      strategy: this.name,
    });
    
    // Create smart merge span
    const mergeSpan = telemetry?.startSpan({
      name: "struktur.smart_merge",
      kind: "CHAIN",
      parentSpan: strategySpan,
      attributes: {
        "merge.strategy": "smart",
        "merge.input_count": batches.length,
      },
    });

    for (const [index, batch] of batches.entries()) {
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
        callId: `sequential_auto_batch_${index + 1}`,
        telemetry: telemetry ?? undefined,
        parentSpan: mergeSpan,
      });

      merged = merger.merge(merged, result.data as Record<string, unknown>);
      usages.push(result.usage);

      // Log merge operation per field
      for (const key of Object.keys(result.data as Record<string, unknown>)) {
        const leftArray = Array.isArray(merged[key])
          ? (merged[key] as unknown[]).length
          : undefined;
        const rightArray = Array.isArray(
          (result.data as Record<string, unknown>)[key],
        )
          ? ((result.data as Record<string, unknown>)[key] as unknown[]).length
          : undefined;

        debug?.smartMergeField({
          mergeId: "sequential_auto_merge",
          field: key,
          operation: "merge_arrays",
          leftCount: leftArray,
          rightCount: rightArray,
        });
        
        // Record merge event in telemetry
        if (mergeSpan && telemetry) {
          telemetry.recordEvent(mergeSpan, {
            type: "merge",
            strategy: "smart",
            inputCount: rightArray ?? 1,
            outputCount: leftArray ?? 1,
          });
        }
      }

      step += 1;
      await options.events?.onStep?.({
        step,
        total: totalSteps,
        label: `batch ${index + 1}/${batches.length}`,
      });
      debug?.step({
        step,
        total: totalSteps,
        label: `batch ${index + 1}/${batches.length}`,
        strategy: this.name,
      });
    }

    debug?.mergeComplete({ mergeId: "sequential_auto_merge", success: true });
    
    // End merge span
    if (mergeSpan && telemetry) {
      telemetry.endSpan(mergeSpan, {
        status: "ok",
        output: merged,
      });
    }

    merged = dedupeArrays(merged);
    
    // Create exact dedupe span
    const exactDedupeSpan = telemetry?.startSpan({
      name: "struktur.exact_dedupe",
      kind: "CHAIN",
      parentSpan: strategySpan,
      attributes: {
        "dedupe.method": "exact_hashing",
      },
    });
    
    // End exact dedupe span
    if (exactDedupeSpan && telemetry) {
      telemetry.recordEvent(exactDedupeSpan, {
        type: "merge",
        strategy: "exact_hash_dedupe",
        inputCount: Object.keys(merged).length,
        outputCount: Object.keys(merged).length,
      });
      telemetry.endSpan(exactDedupeSpan, {
        status: "ok",
        output: merged,
      });
    }

    const dedupePrompt = buildDeduplicationPrompt(schema, merged);

    debug?.dedupeStart({
      dedupeId: "sequential_auto_dedupe",
      itemCount: Object.keys(merged).length,
    });
    
    // Create LLM dedupe span
    const llmDedupeSpan = telemetry?.startSpan({
      name: "struktur.llm_dedupe",
      kind: "CHAIN",
      parentSpan: strategySpan,
      attributes: {
        "dedupe.method": "llm",
      },
    });

    const dedupeResponse = await runWithRetries<{ keys: string[] }>({
      model: this.config.dedupeModel ?? this.config.model,
      schema: dedupeSchema,
      system: dedupePrompt.system,
      user: dedupePrompt.user,
      events: options.events,
      execute: this.config.dedupeExecute,
      strict: this.config.strict,
      debug,
      callId: "sequential_auto_dedupe",
      telemetry: telemetry ?? undefined,
      parentSpan: llmDedupeSpan,
    });

    step += 1;
    await options.events?.onStep?.({
      step,
      total: totalSteps,
      label: "dedupe",
    });
    debug?.step({
      step,
      total: totalSteps,
      label: "dedupe",
      strategy: this.name,
    });

    let deduped = merged;
    for (const key of dedupeResponse.data.keys) {
      deduped = removeByPath(deduped, key);
    }

    debug?.dedupeComplete({
      dedupeId: "sequential_auto_dedupe",
      duplicatesFound: dedupeResponse.data.keys.length,
      itemsRemoved: dedupeResponse.data.keys.length,
    });
    
    // End LLM dedupe span
    if (llmDedupeSpan && telemetry) {
      telemetry.recordEvent(llmDedupeSpan, {
        type: "merge",
        strategy: "llm_dedupe",
        inputCount: Object.keys(merged).length,
        outputCount: Object.keys(deduped).length,
        deduped: dedupeResponse.data.keys.length,
      });
      telemetry.endSpan(llmDedupeSpan, {
        status: "ok",
        output: deduped,
      });
    }
    
    // End strategy span
    telemetry?.endSpan(strategySpan!, {
      status: "ok",
      output: deduped,
    });

    return {
      data: deduped as T,
      usage: mergeUsage([...usages, dedupeResponse.usage]),
    };
  }
}

export const sequentialAutoMerge = <T>(
  config: SequentialAutoMergeStrategyConfig,
) => {
  return new SequentialAutoMergeStrategy<T>(config);
};
