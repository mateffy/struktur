/**
 * The benchmark measures the harness, not the model — the model is a fixed baseline.
 *
 * deepseek-v4-flash-vision-exp: ~$0.60/M tokens, vision-capable, supports
 * structured output (json_schema) via OpenRouter. Cheap enough for frequent
 * benchmark runs while testing the full matrix of text + image variants.
 */
export const BENCHMARK_MODEL = "openrouter/deepseek/deepseek-v4-flash-vision-exp";

/** Default cache root for downloaded datasets. */
export const defaultDatasetDir = (): string =>
  process.env.STRUKTUR_BENCHMARKS_DIR ?? `${process.env.HOME ?? "."}/.struktur/benchmarks`;

/** Default cache root for extraction result cells. */
export const defaultResultsDir = (): string =>
  `${defaultDatasetDir()}/results`;
