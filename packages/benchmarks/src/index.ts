export {
  TRACKS,
  defineCase,
  type Track,
  type SchemaOutput,
  type FieldMetric,
  type FieldMetricSpec,
  type ArrayAlignment,
  type CaseSourceInfo,
  type BenchmarkCase,
} from "./types";

export { BENCHMARK_MODEL, defaultDatasetDir, defaultResultsDir } from "./config";

export { estimateCostUsd, pricingFor, type ModelPricing } from "./pricing";

export { trackToPdfOptions, materializeTrack } from "./tracks";

export { scoreData, leafCount, EMPTY, type FieldScore, type FieldError } from "./scoring/score";
export {
  normalizeString,
  normalizeAggressive,
  normalizeValue,
  valuesEqual,
} from "./scoring/normalize";

export {
  runBenchmark,
  buildReport,
  type RunOptions,
  type CellResult,
  type SummaryRow,
  type BenchmarkReport,
  type StrategyFactory,
  type StrategyEntry,
  type StrategyLike,
} from "./runner";

export { toMarkdownTable, saveReport } from "./report";
