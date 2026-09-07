import type { ExtractionStrategy, Usage } from "@struktur/sdk";
import { extract, resolveModel, toJsonSchema } from "@struktur/sdk";
import {
  simple, parallel, sequential, parallelAutoMerge, sequentialAutoMerge,
  doublePass, doublePassAutoMerge, agent,
} from "@struktur/sdk";
import type { BenchmarkCase, Track } from "./types";
import { TRACKS } from "./types";
import { materializeTrack } from "./tracks";
import { scoreData, type FieldScore } from "./scoring/score";
import { cacheGet, cacheSet, hashKey } from "./cache";
import { BENCHMARK_MODEL, defaultResultsDir } from "./config";
import { estimateCostUsd } from "./pricing";

// ---------------------------------------------------------------------------
// Strategy resolution
// ---------------------------------------------------------------------------

type BuiltinName =
  | "simple" | "parallel" | "sequential"
  | "parallelAutoMerge" | "sequentialAutoMerge"
  | "doublePass" | "doublePassAutoMerge"
  | "agent";

/**
 * Strategy factory: the runner resolves the model once and injects it.
 * `instructions` maps to `outputInstructions` — accept it if you want prompt
 * variants, otherwise ignore it.
 */
export type StrategyFactory<T = unknown> = (
  model: unknown,
  modelSpec: string,
  instructions?: string,
) => ExtractionStrategy<T>;

/** A built-in strategy plus an optional prompt variant and report label. */
export type StrategyEntry = {
  label?: string;
  instructions?: string;
  strategy: BuiltinName | StrategyFactory;
};

export type StrategyLike = BuiltinName | StrategyFactory | ExtractionStrategy<unknown> | StrategyEntry;

// ---------------------------------------------------------------------------
// Built-in factories
// ---------------------------------------------------------------------------

const builtins: Record<BuiltinName, StrategyFactory> = {
  simple: (model, _spec, instructions) => simple({ model, outputInstructions: instructions }),
  parallel: (model, _spec, instructions) =>
    parallel({ model, mergeModel: model, chunkSize: 10_000, outputInstructions: instructions }),
  sequential: (model, _spec, instructions) =>
    sequential({ model, chunkSize: 10_000, outputInstructions: instructions }),
  parallelAutoMerge: (model, _spec, instructions) =>
    parallelAutoMerge({ model, dedupeModel: model, chunkSize: 10_000, outputInstructions: instructions }),
  sequentialAutoMerge: (model, _spec, instructions) =>
    sequentialAutoMerge({ model, dedupeModel: model, chunkSize: 10_000, outputInstructions: instructions }),
  doublePass: (model, _spec, instructions) =>
    doublePass({ model, mergeModel: model, chunkSize: 10_000, outputInstructions: instructions }),
  doublePassAutoMerge: (model, _spec, instructions) =>
    doublePassAutoMerge({ model, dedupeModel: model, chunkSize: 10_000, outputInstructions: instructions }),
  agent: (_model, modelSpec, instructions) => {
    const [provider, ...rest] = modelSpec.split("/");
    const modelId = rest.join("/");
    if (!provider || !modelId) throw new Error(`Agent requires 'provider/model'. Got: ${modelSpec}`);
    return agent({ provider, modelId, maxSteps: 50, maxIterations: 1, vision: true, outputInstructions: instructions });
  },
};

// ---------------------------------------------------------------------------
// Runner types
// ---------------------------------------------------------------------------

export type RunOptions = {
  cases: BenchmarkCase[];
  strategies: StrategyLike[];
  /** Model string in `provider/model` form. Defaults to the pinned benchmark model. */
  model?: string;
  /** Cache directory for result cells. Defaults to `~/.struktur/benchmarks/results`. */
  cacheDir?: string;
  /** Set to `false` to skip the disk cache. */
  cache?: boolean;
  /** Opaque variant tag included in the cache key — bump to invalidate. */
  variant?: string;
  onCell?: (info: { caseId: string; track: Track; strategy: string; cached: boolean }) => void;
};

export type CellResult = {
  caseId: string;
  track: Track;
  strategy: string;
  model: string;
  cached: boolean;
  valid: boolean;
  error?: string;
  score: FieldScore;
  usage: Usage;
  latencyMs: number;
  /** Estimated USD cost of the cell's token usage (0 if pricing unknown). */
  costUsd?: number;
  /** Raw extracted data (null if extraction failed). */
  data: unknown;
};

export type SummaryRow = {
  strategy: string;
  track: Track;
  cases: number;
  meanF1: number;
  meanPrecision: number;
  meanRecall: number;
  validityRate: number;
  exactMatchRate: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  /** Sum of cell costs across the row (USD). */
  totalCostUsd: number;
  /** Mean cost per case (USD). */
  meanCostUsd: number;
  /** Total wall-clock latency across all cells in the row (ms). */
  totalLatencyMs: number;
  meanLatencyMs: number;
};

export type BenchmarkReport = {
  model: string;
  variant?: string;
  generatedAt: string;
  cells: CellResult[];
  summary: SummaryRow[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveStrategy(
  entry: StrategyLike,
  model: unknown,
  modelSpec: string,
): { name: string; strategy: ExtractionStrategy<unknown> } {
  if (typeof entry === "string") {
    const factory = builtins[entry];
    if (!factory) {
      throw new Error(`Unknown builtin strategy: ${entry}. Available: ${Object.keys(builtins).join(", ")}`);
    }
    return { name: entry, strategy: factory(model, modelSpec) };
  }

  if (typeof entry === "function") {
    const s = entry(model, modelSpec);
    return { name: s.name, strategy: s };
  }

  if ("strategy" in entry) {
    const inner = entry.strategy;
    if (typeof inner === "string") {
      const factory = builtins[inner];
      if (!factory) throw new Error(`Unknown builtin strategy: ${inner}`);
      return { name: entry.label ?? inner, strategy: factory(model, modelSpec, entry.instructions) };
    }
    const s = inner(model, modelSpec, entry.instructions);
    return { name: entry.label ?? s.name, strategy: s };
  }

  return { name: (entry as ExtractionStrategy<unknown>).name, strategy: entry as ExtractionStrategy<unknown> };
}

const emptyUsage = (): Usage => ({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function runBenchmark(options: RunOptions): Promise<BenchmarkReport> {
  const modelSpec = options.model ?? BENCHMARK_MODEL;
  const model = await resolveModel(modelSpec);
  const cacheDir = options.cacheDir ?? defaultResultsDir();
  const useCache = options.cache ?? true;
  const variant = options.variant ?? "";

  const strats = options.strategies.map((s) => resolveStrategy(s, model, modelSpec));
  const cells: CellResult[] = [];

  for (const c of options.cases) {
    const tracks = c.tracks ?? [...TRACKS];
    for (const track of tracks) {
      for (const { name, strategy } of strats) {
        const cacheKey = hashKey({
          caseId: c.id,
          track,
          strategy: name,
          model: modelSpec,
          variant,
          schema: toJsonSchema(c.schema),
          gold: c.gold,
        });

        const cached = useCache ? await cacheGet<CellResult>(cacheDir, cacheKey) : undefined;
        if (cached) {
          cached.cached = true;
          // Backfill cost for cells cached before cost tracking was added.
          if (cached.costUsd === undefined) cached.costUsd = estimateCostUsd(modelSpec, cached.usage);
          cells.push(cached);
          options.onCell?.({ caseId: c.id, track, strategy: name, cached: true });
          continue;
        }

        options.onCell?.({ caseId: c.id, track, strategy: name, cached: false });

        const artifacts =
          c.artifactsByTrack?.[track] ?? (await materializeTrack(c.artifacts, track));
        const start = Date.now();

        let data: unknown;
        let usage = emptyUsage();
        let valid = true;
        let error: string | undefined;

        try {
          const result = await extract<unknown>({ artifacts, schema: c.schema as never, strategy });
          data = result.data;
          usage = result.usage;
          if (result.error) {
            valid = false;
            error = result.error.message;
          }
        } catch (e) {
          valid = false;
          error = (e as Error).message;
          data = null;
        }

        const cell: CellResult = {
          caseId: c.id,
          track,
          strategy: name,
          model: modelSpec,
          cached: false,
          valid,
          error,
          score: scoreData(c.gold, c.transform ? c.transform(data) : data, c.metrics),
          usage,
          latencyMs: Date.now() - start,
          costUsd: estimateCostUsd(modelSpec, usage),
          data,
        };

        if (useCache) await cacheSet(cacheDir, cacheKey, cell);
        cells.push(cell);
      }
    }
  }

  return buildReport(modelSpec, cells, variant);
}

// ---------------------------------------------------------------------------
// Report builder
// ---------------------------------------------------------------------------

export function buildReport(model: string, cells: CellResult[], variant?: string): BenchmarkReport {
  const summary = new Map<string, SummaryRow>();

  for (const cell of cells) {
    const key = `${cell.strategy}|${cell.track}`;
    let row = summary.get(key);
    if (!row) {
      row = {
        strategy: cell.strategy,
        track: cell.track,
        cases: 0,
        meanF1: 0,
        meanPrecision: 0,
        meanRecall: 0,
        validityRate: 0,
        exactMatchRate: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCostUsd: 0,
        meanCostUsd: 0,
        totalLatencyMs: 0,
        meanLatencyMs: 0,
      };
      summary.set(key, row);
    }
    row.cases++;
    row.meanF1 += cell.score.f1;
    row.meanPrecision += cell.score.precision;
    row.meanRecall += cell.score.recall;
    if (cell.valid) row.validityRate++;
    if (cell.score.exactMatch) row.exactMatchRate++;
    row.totalInputTokens += cell.usage.inputTokens;
    row.totalOutputTokens += cell.usage.outputTokens;
    row.totalCostUsd += cell.costUsd ?? estimateCostUsd(model, cell.usage);
    row.totalLatencyMs += cell.latencyMs;
    row.meanLatencyMs += cell.latencyMs;
  }

  for (const row of summary.values()) {
    row.meanF1 /= row.cases;
    row.meanPrecision /= row.cases;
    row.meanRecall /= row.cases;
    row.validityRate /= row.cases;
    row.exactMatchRate /= row.cases;
    row.meanCostUsd = row.cases ? row.totalCostUsd / row.cases : 0;
    row.meanLatencyMs = row.cases ? row.meanLatencyMs / row.cases : 0;
  }

  return {
    model,
    variant,
    generatedAt: new Date().toISOString(),
    cells,
    summary: [...summary.values()],
  };
}
