#!/usr/bin/env node
/**
 * Tiny dataset-management CLI.
 *
 *   struktur-benchmarks ls
 *   struktur-benchmarks fetch <dataset>
 *   struktur-benchmarks fetch --all
 *
 * The run command is a thin wrapper that loads a module exporting
 * `{ cases, strategies }` and calls runBenchmark. For production use the
 * TypeScript API directly.
 */
import { resolve } from "node:path";
import { sroie, loadDataset } from "./datasets/index.js";
import { toMarkdownTable, saveReport, runBenchmark } from "./index.js";

const args = process.argv.slice(2);
const cmd = args[0];

async function main() {
  switch (cmd) {
    case "ls": {
      const { readdir } = await import("node:fs/promises");
      const { defaultDatasetDir } = await import("./config.js");
      const dir = defaultDatasetDir();
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const e of entries) {
          if (e.isDirectory()) console.log(`  ${e.name}`);
        }
      } catch {
        console.log(`Cache dir ${dir} is empty or missing.`);
      }
      break;
    }

    case "fetch": {
      const all = args.includes("--all");
      const name = args[1];
      const datasets = { sroie };
      if (all) {
        for (const [key, ds] of Object.entries(datasets)) {
          console.log(`Fetching ${key}...`);
          await loadDataset(ds, { force: true });
          console.log(`  done.`);
        }
      } else if (name && name in datasets) {
        console.log(`Fetching ${name}...`);
        await loadDataset(datasets[name as keyof typeof datasets], { force: true });
        console.log(`  done.`);
      } else {
        console.log("Usage: struktur-benchmarks fetch <dataset> | --all");
        console.log(`Available: ${Object.keys(datasets).join(", ")}`);
      }
      break;
    }

    case "run": {
      const modulePath = args[1];
      if (!modulePath) {
        console.log("Usage: struktur-benchmarks run <module.js>");
        console.log("  Module must export: { cases, strategies }");
        process.exit(1);
      }
      const mod = await import(resolve(modulePath));
      const report = await runBenchmark({
        cases: mod.cases,
        strategies: mod.strategies ?? ["simple"],
      });
      console.log(toMarkdownTable(report));
      await saveReport(report, `benchmark-report-${Date.now()}.json`);
      break;
    }

    default:
      console.log("Usage: struktur-benchmarks <ls|fetch|run>");
      console.log("  ls        List cached datasets");
      console.log("  fetch     Download a dataset");
      console.log("  run       Run a module");
      break;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
