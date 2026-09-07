import { test, expect } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtractionStrategy } from "@struktur/sdk";
import { runBenchmark, type StrategyFactory } from "./runner";
import { textArtifact } from "./datasets/synthetic";
import type { BenchmarkCase } from "./types";

const fakeStrategy = (data: unknown): ExtractionStrategy<unknown> => ({
  name: "fake",
  async run() {
    return { data, usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 } };
  },
});

const makeCase = (gold: unknown): BenchmarkCase => ({
  id: "c1",
  schema: { type: "object" },
  gold,
  artifacts: [textArtifact("hello")],
  tracks: ["text"],
});

test("runBenchmark scores each cell and aggregates", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-run-"));
  try {
    const report = await runBenchmark({
      cases: [makeCase({ a: 1, b: 2 })],
      strategies: [fakeStrategy({ a: 1 })],
      cacheDir: dir,
      model: "openrouter/deepseek/deepseek-v4-flash-vision-exp",
    });

    expect(report.cells).toHaveLength(1);
    const cell = report.cells[0]!;
    expect(cell.strategy).toBe("fake");
    expect(cell.track).toBe("text");
    expect(cell.score.recall).toBe(0.5); // b missing
    expect(cell.usage.inputTokens).toBe(10);
    expect(cell.valid).toBe(true);

    expect(report.summary).toHaveLength(1);
    expect(report.summary[0]!.meanRecall).toBe(0.5);
    expect(report.summary[0]!.totalInputTokens).toBe(10);
    // 10 in-tokens × $0.22/M + 5 out-tokens × $0.66/M
    expect(cell.costUsd).toBeCloseTo((10 / 1e6) * 0.22 + (5 / 1e6) * 0.66, 10);
    expect(report.summary[0]!.totalCostUsd).toBeCloseTo(cell.costUsd!, 10);
    expect(report.summary[0]!.meanCostUsd).toBeCloseTo(cell.costUsd!, 10);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("results are cached across runs", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-run-"));
  try {
    const opts = {
      cases: [makeCase({ a: 1 })],
      strategies: [fakeStrategy({ a: 1 })],
      cacheDir: dir,
      model: "openrouter/deepseek/deepseek-v4-flash-vision-exp",
    };
    const first = await runBenchmark(opts);
    expect(first.cells[0]!.cached).toBe(false);

    const second = await runBenchmark(opts);
    expect(second.cells[0]!.cached).toBe(true);
    expect(second.cells[0]!.score.f1).toBe(first.cells[0]!.score.f1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("cache can be disabled", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-run-"));
  try {
    const opts = {
      cases: [makeCase({ a: 1 })],
      strategies: [fakeStrategy({ a: 1 })],
      cacheDir: dir,
      cache: false,
      model: "openrouter/deepseek/deepseek-v4-flash-vision-exp",
    };
    await runBenchmark(opts);
    const second = await runBenchmark({ ...opts, cache: false });
    expect(second.cells[0]!.cached).toBe(false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("custom strategy factory receives the resolved model and instructions", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-run-"));
  try {
    let receivedModel: unknown;
    let receivedInstructions: string | undefined;
    const factory: StrategyFactory = (model, _spec, instructions) => {
      receivedModel = model;
      receivedInstructions = instructions;
      return fakeStrategy({ a: 1 });
    };

    await runBenchmark({
      cases: [makeCase({ a: 1 })],
      strategies: [{ label: "custom+prompt", instructions: "only totals", strategy: factory }],
      cacheDir: dir,
      model: "openrouter/deepseek/deepseek-v4-flash-vision-exp",
    });

    expect(receivedModel).toBeDefined();
    expect(receivedInstructions).toBe("only totals");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("multiple cases and tracks form the full matrix", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-run-"));
  try {
    const report = await runBenchmark({
      cases: [
        { ...makeCase({ a: 1 }), id: "c1", tracks: ["text", "text+embedded"] },
        { ...makeCase({ a: 1 }), id: "c2", tracks: ["text"] },
      ],
      strategies: [fakeStrategy({ a: 1 })],
      cacheDir: dir,
      model: "openrouter/deepseek/deepseek-v4-flash-vision-exp",
    });
    // c1×2 tracks + c2×1 track = 3 cells
    expect(report.cells).toHaveLength(3);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
