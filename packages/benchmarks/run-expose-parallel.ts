/**
 * Run the real-estate expose benchmark across ALL strategies, one process per
 * expose file, in parallel. Each child runs `run-expose.ts --all` for a single
 * file (ONLY=<id>) and writes its report JSON to REPORT_FILE. This script
 * merges the per-file reports into one combined report and prints a
 * strategy×case matrix with F1 / cost / duration.
 */
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildReport, saveReport, type BenchmarkReport, type CellResult } from "./src/index";
import { BENCHMARK_MODEL } from "./src/config";

const FILES = [
  "sandstrasse",
  "primePulse",
  "flottenstrasse",
  "dock100",
  "holzhauser",
  "elsenstrasse",
] as const;

const VARIANT = process.env.VARIANT ?? "expose-all";

async function runChild(id: string, reportFile: string): Promise<void> {
  const proc = Bun.spawn(["bun", "run", "run-expose.ts", "--all"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      ONLY: id,
      VARIANT,
      REPORT_FILE: reportFile,
    },
    stdout: "ignore",
    stderr: "pipe",
  });
  const err = await new Response(proc.stderr).text();
  const code = await proc.exited;
  if (code !== 0) throw new Error(`${id} exited ${code}:\n${err.slice(-2000)}`);
}

async function main() {
  const dir = await mkdtemp(join(tmpdir(), "expose-parallel-"));
  console.error(
    `Variant: ${VARIANT}\nLaunching ${FILES.length} parallel processes (one per expose file)...`,
  );

  const start = Date.now();
  const jobs = FILES.map(async (id) => {
    const reportFile = join(dir, `${id}.json`);
    await runChild(id, reportFile);
    return JSON.parse(await readFile(reportFile, "utf8")) as BenchmarkReport;
  });

  const results = await Promise.allSettled(jobs);
  const reports: BenchmarkReport[] = [];
  const failures: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i]!;
    if (r.status === "fulfilled") reports.push(r.value);
    else failures.push(`${FILES[i]}: ${(r.reason as Error).message}`);
  }
  await rm(dir, { recursive: true, force: true });

  if (failures.length) {
    console.error("\nFAILED:\n" + failures.join("\n"));
  }

  const cells: CellResult[] = reports.flatMap((r) => r.cells);
  const merged = buildReport(BENCHMARK_MODEL, cells, VARIANT);

  await saveReport(merged, "EXPOSE-ALL.json");

  // ── strategy × case matrix ──────────────────────────────────────────────
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  console.error("\n=== F1 matrix (strategy × case) ===\n");
  const byStrategy = new Map<string, Map<string, CellResult>>();
  for (const c of cells) {
    const m = byStrategy.get(c.strategy) ?? new Map();
    m.set(c.caseId.replace("expose-", ""), c);
    byStrategy.set(c.strategy, m);
  }
  const header = `| strategy | ${FILES.join(" | ")} | mean F1 | cost | total ms |`;
  console.error(header);
  console.error(
    `|${"-".repeat(8)}|${FILES.map(() => "-".repeat(14)).join("|")}|--------|------|----------|`,
  );
  for (const [strategy, m] of byStrategy) {
    const vals = FILES.map((f) => m.get(f)?.score.f1);
    const mean =
      vals.filter((v): v is number => v !== undefined).reduce((a, b) => a + b, 0) / vals.length;
    const cost = [...m.values()].reduce((a, c) => a + (c.costUsd ?? 0), 0);
    const ms = [...m.values()].reduce((a, c) => a + c.latencyMs, 0);
    console.error(
      `| ${strategy.padEnd(8)} | ${vals.map((v) => (v === undefined ? "—" : pct(v)).padStart(14)).join(" | ")} | ${pct(mean).padStart(7)} | $${cost.toFixed(4)} | ${Math.round(ms)} |`,
    );
  }

  // ── summary ──────────────────────────────────────────────────────────────
  console.error("\n=== summary ===\n");
  for (const r of merged.summary) {
    console.error(
      `${r.strategy.padEnd(22)} F1=${pct(r.meanF1)} P=${pct(r.meanPrecision)} R=${pct(r.meanRecall)} | $${r.totalCostUsd.toFixed(4)} | ${Math.round(r.meanLatencyMs)}ms avg (${r.totalLatencyMs}ms total) | ${r.totalInputTokens + r.totalOutputTokens} tok`,
    );
  }

  console.error(`\nWall-clock: ${Math.round((Date.now() - start) / 1000)}s\n`);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
