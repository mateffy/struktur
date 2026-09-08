import { test, expect } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { downloadHubRows, loadDataset, type Dataset, type FetchLike } from "./source";
import type { BenchmarkCase } from "../types";
import { textArtifact } from "./synthetic";

/** A fake fetch that returns paginated rows. */
const hubFetch =
  (pages: Record<string, unknown>[][]): FetchLike =>
  async (url) => {
    const match = /offset=(\d+)&length=(\d+)/.exec(url);
    const offset = Number(match?.[1] ?? 0);
    const page = pages[Math.floor(offset / 100)] ?? [];
    return new Response(JSON.stringify({ rows: page.map((row) => ({ row })) }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

test("downloadHubRows pages through the datasets-server API", async () => {
  const pages = [
    Array.from({ length: 100 }, (_, i) => ({ id: String(i) })),
    [{ id: "100" }, { id: "101" }],
  ];
  const rows = await downloadHubRows(
    {
      kind: "hub",
      repo: "test/dataset",
      config: "default",
      split: "train",
      baseUrl: "https://example.test",
    },
    hubFetch(pages),
  );
  expect(rows).toHaveLength(102);
  expect(rows[0]).toEqual({ id: "0" });
  expect(rows[101]).toEqual({ id: "101" });
});

test("loadDataset downloads, converts, and caches", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-ds-"));
  try {
    const dataset: Dataset = {
      id: "demo",
      version: "1",
      source: { kind: "hub", repo: "test/demo" },
      download: async (rawDir, fetchImpl) => {
        const { writeFile } = await import("node:fs/promises");
        await writeFile(join(rawDir, "rows.json"), JSON.stringify([{ v: "x" }]));
        void fetchImpl;
      },
      convert: async (rawDir) => {
        const { readFile } = await import("node:fs/promises");
        const rows = JSON.parse(await readFile(join(rawDir, "rows.json"), "utf8")) as {
          v: string;
        }[];
        return rows.map((r, i): BenchmarkCase => ({
          id: `demo-${i}`,
          schema: { type: "object" },
          gold: { v: r.v },
          artifacts: [textArtifact(r.v)],
          tracks: ["text"],
        }));
      },
    };

    const cases = await loadDataset(dataset, { cacheDir: dir });
    expect(cases).toHaveLength(1);
    expect(cases[0]!.gold).toEqual({ v: "x" });

    // Second load hits the cache — convert is not called again.
    let convertCalls = 0;
    const counting: Dataset = {
      ...dataset,
      convert: async (_rawDir) => {
        convertCalls++;
        return [];
      },
    };
    const cached = await loadDataset(counting, { cacheDir: dir });
    expect(convertCalls).toBe(0);
    expect(cached).toHaveLength(1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("loadDataset applies limit and offset", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-ds-"));
  try {
    const dataset: Dataset = {
      id: "demo2",
      version: "1",
      source: { kind: "hub", repo: "test/demo2" },
      download: async () => {},
      convert: async () =>
        [0, 1, 2, 3, 4].map((i): BenchmarkCase => ({
          id: `c${i}`,
          schema: { type: "object" },
          gold: {},
          artifacts: [textArtifact("")],
        })),
    };
    const cases = await loadDataset(dataset, { cacheDir: dir, limit: 2, offset: 1 });
    expect(cases.map((c) => c.id)).toEqual(["c1", "c2"]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("loadDataset throws for manual sources without files", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-ds-"));
  try {
    const dataset: Dataset = {
      id: "manual",
      version: "1",
      source: { kind: "manual", hint: "put files somewhere" },
      download: async () => {},
      convert: async () => [],
    };
    await expect(loadDataset(dataset, { cacheDir: dir })).rejects.toThrow("manual download");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
