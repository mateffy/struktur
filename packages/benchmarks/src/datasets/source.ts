import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BenchmarkCase } from "../types";
import { defaultDatasetDir } from "../config";

/** Injectable fetch for tests. */
export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** Where a dataset's raw files come from. */
export type DatasetSource =
  | { kind: "hub"; repo: string; config?: string; split?: string; baseUrl?: string }
  | { kind: "url"; url: string }
  | { kind: "manual"; hint?: string };

export type Dataset = {
  id: string;
  /** Bump to invalidate the local cache. */
  version: string;
  source: DatasetSource;
  license?: string;
  attribution?: string;
  /** Download raw files into `rawDir`. */
  download: (rawDir: string, fetchImpl?: FetchLike) => Promise<void>;
  /** Convert raw files in `rawDir` into benchmark cases. */
  convert: (rawDir: string) => Promise<BenchmarkCase[]>;
};

export type LoadDatasetOptions = {
  cacheDir?: string;
  /** Return only this many cases (defaults to all). */
  limit?: number;
  offset?: number;
  fetchImpl?: FetchLike;
  /** Re-download + re-convert even if cached. */
  force?: boolean;
};

const readCachedCases = async (file: string): Promise<BenchmarkCase[] | undefined> => {
  try {
    return JSON.parse(await readFile(file, "utf8")) as BenchmarkCase[];
  } catch {
    return undefined;
  }
};

/**
 * Load a dataset's cases, downloading and converting on first use and caching
 * the converted result under `~/.struktur/benchmarks/<id>/<version>/`.
 */
export async function loadDataset(
  dataset: Dataset,
  options: LoadDatasetOptions = {},
): Promise<BenchmarkCase[]> {
  const base = path.join(options.cacheDir ?? defaultDatasetDir(), dataset.id, dataset.version);
  const casesFile = path.join(base, "cases.json");
  const rawDir = path.join(base, "raw");
  const limit = options.limit;
  const offset = options.offset ?? 0;

  let cases = options.force ? undefined : await readCachedCases(casesFile);

  if (!cases) {
    if (dataset.source.kind === "manual") {
      const hint = dataset.source.hint ?? `download the dataset into ${rawDir}`;
      throw new Error(
        `Dataset "${dataset.id}" requires manual download. ${hint}`,
      );
    }

    await mkdir(rawDir, { recursive: true });
    await dataset.download(rawDir, options.fetchImpl);
    cases = await dataset.convert(rawDir);

    await mkdir(base, { recursive: true });
    await writeFile(casesFile, JSON.stringify(cases, null, 2), "utf8");
    await writeFile(
      path.join(base, "manifest.json"),
      JSON.stringify(
        {
          id: dataset.id,
          version: dataset.version,
          license: dataset.license,
          attribution: dataset.attribution,
          generatedAt: new Date().toISOString(),
          count: cases.length,
        },
        null,
        2,
      ),
      "utf8",
    );
  }

  return cases.slice(offset, limit !== undefined ? offset + limit : undefined);
}

// ---------------------------------------------------------------------------
// Hugging Face datasets-server helpers
// ---------------------------------------------------------------------------

const DEFAULT_HUB_BASE = "https://datasets-server.huggingface.co";

/** Fetch every row of a hub dataset via the datasets-server `/rows` endpoint. */
export async function downloadHubRows(
  source: Extract<DatasetSource, { kind: "hub" }>,
  fetchImpl: FetchLike = fetch,
): Promise<Record<string, unknown>[]> {
  const base = source.baseUrl ?? DEFAULT_HUB_BASE;
  const repo = encodeURIComponent(source.repo);
  const config = source.config ?? "default";
  const split = source.split ?? "train";
  const pageSize = 100;

  const rows: Record<string, unknown>[] = [];
  let offset = 0;
  for (;;) {
    const url =
      `${base}/rows?dataset=${repo}&config=${config}&split=${split}&offset=${offset}&length=${pageSize}`;
    const res = await fetchImpl(url);
    if (!res.ok) {
      throw new Error(`Hugging Face datasets-server error ${res.status} for ${url}`);
    }
    const body = (await res.json()) as { rows?: { row: Record<string, unknown> }[] };
    const page = body.rows ?? [];
    if (page.length === 0) break;
    rows.push(...page.map((r) => r.row));
    if (page.length < pageSize) break;
    offset += page.length;
  }
  return rows;
}
