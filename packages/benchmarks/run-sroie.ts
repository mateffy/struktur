/**
 * Run the SROIE (ICDAR 2019 scanned receipts) benchmark. Text track: the
 * receipt's OCR words joined (the fair text-only baseline). Image track
 * (text+embedded) fetches receipt scans by URL for the model.
 *
 * Sharding: set SHARDS=N to split cases into N shards and run them via child
 * processes in parallel (one child per shard, including shard 0). Each shard
 * writes its report to REPORT_FILE.<i>.json; the parent merges and saves
 * SROIE.json + SROIE.md.
 */
import { loadDataset, sroie } from "./src/datasets/index";
import {
  runBenchmark,
  saveReport,
  buildReport,
  type BenchmarkReport,
  type CellResult,
  type BenchmarkCase,
} from "./src/index";
import { BENCHMARK_MODEL } from "./src/config";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const STRATEGIES = ["simple", "parallel", "sequential", "doublePass"] as const;
const TRACKS = ["text"] as const;
const VARIANT = process.env.VARIANT ?? "sroie-1";
const SHARDS = Number(process.env.SHARDS ?? 1);
const SHARD_INDEX = Number(process.env.SHARD_INDEX ?? -1);
const REPORT_FILE = process.env.REPORT_FILE;

async function runSlice(
  cases: BenchmarkCase[],
  shardIndex: number,
  reportFile: string,
): Promise<void> {
  const report = await runBenchmark({
    cases: cases.map((c) => ({ ...c, tracks: [...TRACKS] })),
    strategies: [...STRATEGIES],
    model: process.env.BENCHMARK_MODEL ?? BENCHMARK_MODEL,
    variant: VARIANT,
  });
  const shardReport: BenchmarkReport = {
    model: BENCHMARK_MODEL,
    variant: `${VARIANT}#shard${shardIndex}`,
    generatedAt: new Date().toISOString(),
    cells: report.cells,
    summary: report.summary,
  };
  await saveReport(shardReport, reportFile);
  console.error(`shard ${shardIndex}: ${cases.length} cases, ${report.cells.length} cells done`);
}

async function main() {
  const cases = await loadDataset(sroie);

  if (SHARD_INDEX >= 0) {
    // Child process: run this shard.
    const slice = cases.filter((_, i) => i % SHARDS === SHARD_INDEX);
    await runSlice(slice, SHARD_INDEX, REPORT_FILE!);
    return;
  }

  // Parent: shard into SHARDS child processes and merge.
  const dir = await mkdtemp(join(tmpdir(), "sroie-"));
  console.error(
    `SROIE: ${cases.length} cases, ${STRATEGIES.length} strategies, ${SHARDS} shard(s).`,
  );

  const start = Date.now();
  const jobs = Array.from({ length: SHARDS }, (_, i) => {
    const reportFile = join(dir, `shard-${i}.json`);
    const proc = Bun.spawn(["bun", "run", "run-sroie.ts"], {
      cwd: import.meta.dir,
      env: {
        ...process.env,
        SHARD_INDEX: String(i),
        SHARDS: String(SHARDS),
        VARIANT,
        REPORT_FILE: reportFile,
      },
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
  await saveReport(merged, "SROIE.json");

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  console.error("\n=== SROIE summary (text track) ===\n");
  for (const r of merged.summary) {
    console.error(
      `${r.strategy.padEnd(12)} F1=${pct(r.meanF1)} P=${pct(r.meanPrecision)} R=${pct(r.meanRecall)} | valid=${pct(r.validityRate)} | $${r.totalCostUsd.toFixed(4)} | ${Math.round(r.meanLatencyMs)}ms avg (${r.totalLatencyMs}ms total) | ${r.totalInputTokens + r.totalOutputTokens} tok`,
    );
  }
  console.error(`\nWall-clock: ${Math.round((Date.now() - start) / 1000)}s\n`);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
