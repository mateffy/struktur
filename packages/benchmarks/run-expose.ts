import { parsePdf } from "@struktur/sdk";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Artifact } from "@struktur/sdk";
import { runBenchmark, saveReport, type BenchmarkCase, type StrategyEntry } from "./src/index";
import { estateTextSchema, type ExposeGold } from "./src/expose/schema";
import {
  sandstrasse,
  primePulse,
  flottenstrasse,
  dock100,
  holzhauser,
  elsenstrasse,
} from "./src/expose/gold";
import { buildEstateInstructions } from "./src/expose/instructions";
import { exposeMetric } from "./src/expose/metric";
import { normalizeForScoring } from "./src/expose/gold-score";
import { BENCHMARK_MODEL } from "./src/config";

const baseDir =
  "/Users/mat/Library/Mobile Documents/com~apple~CloudDocs/Archiv/Dev/Realbeispiele/Exposes";

const files: { id: string; gold: ExposeGold; file: string }[] = [
  {
    id: "sandstrasse",
    gold: sandstrasse,
    file: "834b58b6-2ab8-4976-8624-ea28bfd3dde6-1780388793.pdf",
  },
  { id: "primePulse", gold: primePulse, file: "240317_Exposé_AA_62-64_MA.pdf" },
  { id: "flottenstrasse", gold: flottenstrasse, file: "A 0100210 Flottenstraße (Final).pdf" },
  { id: "dock100", gold: dock100, file: "dock100.pdf" },
  { id: "holzhauser", gold: holzhauser, file: "Expose Holzhauser Quartier.pdf" },
  { id: "elsenstrasse", gold: elsenstrasse, file: "expose_elsenstrasse-1 copy.pdf" },
];

async function loadArtifact(file: string): Promise<Artifact> {
  const buf = await readFile(path.join(baseDir, file));
  return parsePdf(buf, { includeImages: false, screenshots: false });
}

async function main() {
  const cases: BenchmarkCase[] = [];
  const idToGold = new Map<string, ExposeGold>();

  const only = process.env.ONLY;
  for (const f of files) {
    if (only && !f.id.startsWith(only)) continue;
    console.error(`Loading ${f.id}...`);
    const artifact = await loadArtifact(f.file);
    cases.push({
      id: `expose-${f.id}`,
      schema: estateTextSchema,
      gold: normalizeForScoring(f.gold, true),
      artifacts: [artifact],
      tracks: ["text"],
      metrics: exposeMetric,
      transform: (data) => normalizeForScoring(data, false),
      source: { dataset: "exposes", attribution: `real-estate expose (${f.id})` },
    });
    idToGold.set(`expose-${f.id}`, f.gold);
  }

  console.error(`Loaded ${cases.length} expose cases.`);

  const instructions = buildEstateInstructions();
  const strat = (name: BuiltinName): StrategyEntry => ({ strategy: name, instructions });
  type BuiltinName =
    | "simple"
    | "parallel"
    | "sequential"
    | "doublePass"
    | "parallelAutoMerge"
    | "sequentialAutoMerge"
    | "doublePassAutoMerge"
    | "agent";

  const report = await runBenchmark({
    cases,
    strategies: process.env.STRATEGY
      ? [strat(process.env.STRATEGY as BuiltinName)]
      : process.argv.includes("--all")
        ? [
            strat("simple"),
            strat("parallel"),
            strat("sequential"),
            strat("doublePass"),
            strat("parallelAutoMerge"),
            strat("sequentialAutoMerge"),
            strat("doublePassAutoMerge"),
            strat("agent"),
          ]
        : [strat("simple")],
    model: process.env.BENCHMARK_MODEL ?? BENCHMARK_MODEL,
    variant: process.env.VARIANT ?? "expose-v3",
  });

  if (process.env.REPORT_FILE) {
    await saveReport(report, process.env.REPORT_FILE);
  }

  // Per-case detail
  console.error("\n=== per-case ===\n");
  if (report.cells.length === 0) {
    console.error("(no cells produced)");
    process.exit(1);
  }
  for (const cell of report.cells) {
    const s = cell.score;
    console.error(
      `${cell.caseId.replace("expose-", "").padEnd(16)} F1=${(s.f1 * 100).toFixed(1)}% P=${(s.precision * 100).toFixed(1)} R=${(s.recall * 100).toFixed(1)} exact=${s.exactMatch} valid=${cell.valid}${cell.error ? " ERR:" + cell.error.slice(0, 60) : ""} tok=${cell.usage.totalTokens} $${(cell.costUsd ?? 0).toFixed(4)} ${cell.latencyMs}ms`,
    );
    // show field errors
    const feCount = process.env.VERBOSE ? s.fieldErrors.length : 8;
    for (const fe of s.fieldErrors.slice(0, feCount)) {
      console.error(
        `    ${fe.path} | gold=${JSON.stringify(fe.gold)?.slice(0, 60)} | pred=${JSON.stringify(fe.pred)?.slice(0, 60)}`,
      );
    }
  }

  console.error("\n=== summary ===\n");
  for (const r of report.summary) {
    console.error(
      `${r.strategy.padEnd(12)} F1=${(r.meanF1 * 100).toFixed(1)}% exact=${(r.exactMatchRate * 100).toFixed(0)}% valid=${(r.validityRate * 100).toFixed(0)}% tok=${r.totalInputTokens + r.totalOutputTokens} $${r.totalCostUsd.toFixed(4)} ${Math.round(r.meanLatencyMs)}ms avg (${r.totalLatencyMs}ms total)`,
    );
  }

  const exact = report.cells.filter((c) => c.score.exactMatch).length;
  console.error(
    `\n${exact}/${report.cells.length} exact (${((exact / report.cells.length) * 100).toFixed(0)}%)\n`,
  );
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
