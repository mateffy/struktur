# @struktur/benchmarks

Benchmark harness for `@struktur/sdk`. Runs `case × track × strategy` matrices
through `extract()`, scores field-by-field against gold, and reports
F1 / validity / token cost / latency. Model is pinned to a fixed baseline
(OpenRouter DeepSeek v4 flash vision) since the harness — not the model — is
what's being measured.

## Structure

- `src/types.ts` — `BenchmarkCase<TSchema, T>`, `Track`, `FieldMetricSpec`,
  `SchemaOutput` inference, `defineCase`.
- `src/config.ts` — `BENCHMARK_MODEL` and cache directory defaults.
- `src/pricing.ts` — token pricing table (USD per 1M in/out tokens) + `estimateCostUsd`; override with `STRUKTUR_BENCHMARK_PRICES`.
- `src/tracks.ts` — `trackToPdfOptions` + `materializeTrack` (re-parses PDFs
  per track; image/text artifacts pass through).
- `src/scoring/` — `normalize.ts` (value folding per metric) and `score.ts`
  (recursive leaf scorer: TP/FP/FN, omission vs hallucination, array alignment).
  This is the heart of the package — keep it pure and well-tested.
- `src/cache.ts` — stable key-order-insensitive `hashKey` + JSON file cache.
- `src/runner.ts` — `runBenchmark`: resolves the model once, resolves
  `StrategyLike` (builtin name / factory / pre-built object / entry with
  instructions), runs the matrix, caches cells, builds `BenchmarkReport`.
- `src/report.ts` — Markdown table + JSON serialization.
- `src/datasets/` — `source.ts` (generic download+cache, HF datasets-server
  helper), `synthetic.ts` (offline deterministic generators), `sroie.ts`
  (SROIE importer), `index.ts` (subpath export `@struktur/benchmarks/datasets`).
- `src/cli.ts` — `struktur-benchmarks ls|fetch|run` (dataset management; run is
  a thin wrapper, prefer the TS API).

## Conventions

- Colocated `bun test` tests, as elsewhere in the monorepo. The scorer is the
  most-tested unit.
- `types.test.ts` uses `@ts-expect-error` to pin the `SchemaOutput` inference;
  run `pnpm typecheck` to validate it (`bun test` does not typecheck).
- Datasets are not vendored — download on demand into
  `~/.struktur/benchmarks/` (override `STRUKTUR_BENCHMARKS_DIR`).
- Importers: `download(rawDir, fetchImpl)` fetches raw files, `convert(rawDir)`
  maps them to `BenchmarkCase[]`. Keep `convert` pure so it's fixture-testable.
