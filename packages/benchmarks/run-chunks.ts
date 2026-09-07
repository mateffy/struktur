/**
 * Chunk-size experiment: sweep chunkSize × strategy over the long-document
 * cases (which actually split). Custom strategy factories vary chunkSize;
 * the runner's builtin factories hardcode 10k.
 *
 * Sharding: SHARDS=N splits cases across N child processes in parallel.
 */
import { simple, parallel, sequential, doublePass, type ExtractionStrategy } from "@struktur/sdk";
import { runBenchmark, saveReport, buildReport, type BenchmarkReport, type CellResult, type BenchmarkCase, type StrategyLike } from "./src/index";
import { longDocCases } from "./src/datasets/longdoc";
import { BENCHMARK_MODEL } from "./src/config";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHUNK_SIZES = [1000, 2000, 4000, 8000, 16000, 32000];
const STRATEGIES = ["simple", "parallel", "sequential", "doublePass"] as const;

const VARIANT = process.env.VARIANT ?? "chunks-1";
const SHARDS = Number(process.env.SHARDS ?? 1);
const SHARD_INDEX = Number(process.env.SHARD_INDEX ?? -1);
const REPORT_FILE = process.env.REPORT_FILE;

type Builtin = (typeof STRATEGIES)[number];

const factory = (name: Builtin, chunkSize: number) =>
  (model: unknown, _spec: string, instructions?: string): ExtractionStrategy<unknown> => {
    switch (name) {
      case "simple":
        return simple({ model, outputInstructions: instructions });
      case "parallel":
        return parallel({ model, mergeModel: model, chunkSize, outputInstructions: instructions });
      case "sequential":
        return sequential({ model, chunkSize, outputInstructions: instructions });
      case "doublePass":
        return doublePass({ model, mergeModel: model, chunkSize, outputInstructions: instructions });
    }
  };

/** simple is chunk-size-independent, so run it once; chunked strategies sweep all sizes. */
const strategiesFor = (): StrategyLike[] => {
  const out: StrategyLike[] = [{ label: "simple", strategy: factory("simple", 0) }];
  for (const name of ["parallel", "sequential", "doublePass"] as const) {
    for (const size of CHUNK_SIZES) {
      out.push({ label: `${name}@${size}`, strategy: factory(name, size) });
    }
  }
  return out;
};

async function runSlice(cases: BenchmarkCase[], reportFile: string): Promise<void> {
  const report = await runBenchmark({
    cases,
    strategies: strategiesFor(),
    model: process.env.BENCHMARK_MODEL ?? BENCHMARK_MODEL,
    variant: VARIANT,
  });
  await saveReport(report, reportFile);
  console.error(`shard ${SHARD_INDEX}: ${cases.length} cases, ${report.cells.length} cells`);
}

async function main() {
  const cases = longDocCases();

  if (SHARD_INDEX >= 0) {
    const slice = cases.filter((_, i) => i % SHARDS === SHARD_INDEX);
    await runSlice(slice, REPORT_FILE!);
    return;
  }

  const dir = await mkdtemp(join(tmpdir(), "chunks-"));
  console.error(`Chunk sweep: ${cases.length} cases × ${strategiesFor().length} strategies.`);

  const start = Date.now();
  const jobs = Array.from({ length: SHARDS }, (_, i) => {
    const reportFile = join(dir, `shard-${i}.json`);
    const proc = Bun.spawn(["bun", "run", "run-chunks.ts"], {
      cwd: import.meta.dir,
      env: { ...process.env, SHARD_INDEX: String(i), SHARDS: String(SHARDS), VARIANT, REPORT_FILE: reportFile },
      stdout: "ignore",
      stderr: "pipe",
    });
    return (async () => {
      const err = await new Response(proc.stderr).text();
      const code = await proc.exited;
      if (code !== 0) throw new Error(`shard ${i} exited ${code}: ${err.slice(-2000)}`);
      return JSON.parse(await readFile(reportFile, "utf8")) as BenchmarkReport;
    })();
  });

  const results = await Promise.allSettled(jobs);
  const reports: BenchmarkReport[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i]!;
    if (r.status === "fulfilled") reports.push(r.value);
    else console.error(`shard ${i} FAILED: ${(r.reason as Error).message}`);
  }
  await rm(dir, { recursive: true, force: true });

  const cells: CellResult[] = reports.flatMap((r) => r.cells);
  const merged = buildReport(BENCHMARK_MODEL, cells, VARIANT);
  await saveReport(merged, "CHUNKS.json");

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  console.error("\n=== chunk sweep (longdoc, text track) ===\n");
  console.error("strategy@chunkSize | case | F1 | cost | ms | in tok | out tok");
  for (const c of merged.cells) {
    const caseId = c.caseId.replace("longdoc-", "");
    console.error(
      `${c.strategy.padEnd(22)} | ${caseId.padEnd(4)} | ${pct(c.score.f1)} | $${(c.costUsd ?? 0).toFixed(4)} | ${Math.round(c.latencyMs)} | ${c.usage.inputTokens} | ${c.usage.outputTokens}`,
    );
  }
  console.error(`\nWall-clock: ${Math.round((Date.now() - start) / 1000)}s\n`);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
