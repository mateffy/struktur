import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { buildExtractorPrompt } from "../prompts/ExtractorPrompt";
import { buildDeduplicationPrompt } from "../prompts/DeduplicationPrompt";
import { extractWithPrompt, getBatches, mergeUsage, serializeSchema } from "./utils";
import { runConcurrently } from "./concurrency";
import { SmartDataMerger } from "../merge/SmartDataMerger";
import { findExactDuplicatesWithHashing, deduplicateByIndices } from "../merge/Deduplicator";
import { runWithRetries } from "../llm/RetryingRunner";

export type ParallelAutoMergeStrategyConfig = {
  model: unknown;
  chunkSize: number;
  concurrency?: number;
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

export class ParallelAutoMergeStrategy<T> implements ExtractionStrategy<T> {
  public name = "parallel-auto-merge";
  private config: ParallelAutoMergeStrategyConfig;

  constructor(config: ParallelAutoMergeStrategyConfig) {
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
        strict: this.config.strict,
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

    const merger = new SmartDataMerger(options.schema as Record<string, unknown>);
    let merged = {} as Record<string, unknown>;
    for (const result of results) {
      merged = merger.merge(merged, result.data as Record<string, unknown>);
    }

    merged = dedupeArrays(merged);

    const dedupePrompt = buildDeduplicationPrompt(schema, merged);
    const dedupeResponse = await runWithRetries<{ keys: string[] }>({
      model: this.config.dedupeModel ?? this.config.model,
      schema: dedupeSchema,
      system: dedupePrompt.system,
      user: dedupePrompt.user,
      events: options.events,
      execute: this.config.dedupeExecute,
      strict: this.config.strict,
    });

    step += 1;
    await options.events?.onStep?.({
      step,
      total: totalSteps,
      label: "dedupe",
    });

    let deduped = merged;
    for (const key of dedupeResponse.data.keys) {
      deduped = removeByPath(deduped, key);
    }

    return {
      data: deduped as T,
      usage: mergeUsage([...results.map((r) => r.usage), dedupeResponse.usage]),
    };
  }
}

export const parallelAutoMerge = <T>(config: ParallelAutoMergeStrategyConfig) => {
  return new ParallelAutoMergeStrategy<T>(config);
};
