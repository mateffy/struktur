import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BenchmarkReport } from "./runner";

const pct = (v: number): string => `${(v * 100).toFixed(1)}%`;

/** Render the summary as a Markdown table. */
export function toMarkdownTable(report: BenchmarkReport): string {
  const lines: string[] = [];
  lines.push(`# Benchmark report`);
  lines.push(``);
  lines.push(`- model: \`${report.model}\``);
  if (report.variant) lines.push(`- variant: \`${report.variant}\``);
  lines.push(`- generated: ${report.generatedAt}`);
  lines.push(``);
  lines.push(`| strategy | track | cases | F1 | precision | recall | valid | exact | in tok | out tok | cost (USD) | ms/case | total ms |`);
  lines.push(`|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|`);
  for (const row of report.summary) {
    lines.push(
      `| ${row.strategy} | ${row.track} | ${row.cases} | ${pct(row.meanF1)} | ${pct(row.meanPrecision)} | ${pct(row.meanRecall)} | ${pct(row.validityRate)} | ${pct(row.exactMatchRate)} | ${row.totalInputTokens} | ${row.totalOutputTokens} | ${row.totalCostUsd.toFixed(4)} | ${Math.round(row.meanLatencyMs)} | ${row.totalLatencyMs} |`,
    );
  }
  return lines.join("\n");
}

/** Write the full JSON report and a Markdown summary next to it. */
export async function saveReport(report: BenchmarkReport, file: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(report, null, 2), "utf8");
  const mdFile = file.replace(/\.json$/, "") + ".md";
  await writeFile(mdFile, toMarkdownTable(report), "utf8");
}
