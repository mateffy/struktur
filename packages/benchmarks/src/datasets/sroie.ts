import type { Artifact } from "@struktur/sdk";
import type { BenchmarkCase } from "../types";
import { downloadHubRows, type Dataset, type FetchLike } from "./source";

/**
 * SROIE (ICDAR 2019, scanned receipts) — key information extraction:
 * company, date, address, total.
 *
 * Backed by the Hugging Face mirror `darentang/sroie`, which exposes per-word
 * BIO tags. Rows are downloaded via the datasets-server API; receipt images
 * are referenced by URL (fetched by the model at inference time), so no bulk
 * image download is needed.
 */

const REPO = "darentang/sroie";
const CONFIG = "sroie";

const LABELS = [
  "O",
  "B-COMPANY",
  "I-COMPANY",
  "B-DATE",
  "I-DATE",
  "B-ADDRESS",
  "I-ADDRESS",
  "B-TOTAL",
  "I-TOTAL",
] as const;

const SCHEMA = {
  type: "object",
  properties: {
    company: { type: ["string", "null"] },
    date: { type: ["string", "null"] },
    address: { type: ["string", "null"] },
    total: { type: ["string", "null"] },
  },
  additionalProperties: false,
} as const;

export type SroieRow = {
  id?: string;
  words?: string[];
  ner_tags?: number[];
  image_path?: string;
};

/** Reconstruct `company/date/address/total` from BIO-tagged words. */
export function reconstructEntities(
  words: string[],
  tags: number[],
): Record<string, string | null> {
  const out: Record<string, string | null> = {
    company: null,
    date: null,
    address: null,
    total: null,
  };
  let current: string | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (current && buffer.length > 0) {
      out[current.toLowerCase()] = buffer.join(" ");
    }
    current = null;
    buffer = [];
  };

  for (let i = 0; i < words.length; i++) {
    const tag = LABELS[tags[i] ?? 0] ?? "O";
    if (tag.startsWith("B-")) {
      flush();
      current = tag.slice(2);
      buffer = [words[i] ?? ""];
    } else if (tag.startsWith("I-") && current === tag.slice(2)) {
      buffer.push(words[i] ?? "");
    } else {
      flush();
    }
  }
  flush();
  return out;
}

const imageUrl = (imagePath: string): string =>
  `https://huggingface.co/datasets/${REPO}/resolve/main/${imagePath}`;

const imageArtifact = (id: string, url: string): Artifact => ({
  id: `artifact-${id}`,
  type: "image",
  raw: async () => Buffer.from(""),
  contents: [{ media: [{ type: "image", url }] }],
});

/** Convert raw HF rows into benchmark cases. */
export function sroieToCases(rows: SroieRow[]): BenchmarkCase[] {
  const cases: BenchmarkCase[] = [];
  for (const row of rows) {
    const words = row.words ?? [];
    const tags = row.ner_tags ?? [];
    const imagePath = row.image_path;
    if (!imagePath) continue;

    const gold = reconstructEntities(words, tags);
    const id = row.id ?? imagePath;
    const url = imageUrl(imagePath);

    // OCR text variant: words joined — a fair text-only baseline.
    const text = words.join(" ");

    cases.push({
      id: `sroie-${id}`,
      schema: SCHEMA,
      gold,
      artifacts: [imageArtifact(id, url)],
      tracks: ["text", "text+embedded"],
      artifactsByTrack: {
        text: [
          {
            id: `artifact-${id}-text`,
            type: "text",
            raw: async () => Buffer.from(text, "utf8"),
            contents: [{ text }],
          },
        ],
        "text+embedded": [imageArtifact(id, url)],
      },
      metrics: { default: "normalized" },
      source: {
        dataset: "sroie",
        license: "ICDAR 2019 SROIE (research use)",
        url: "https://github.com/zzzDavid/ICDAR-2019-SROIE",
        attribution: "ICDAR 2019 SROIE (Huang et al., 2019)",
      },
    });
  }
  return cases;
}

const download = async (rawDir: string, fetchImpl?: FetchLike): Promise<void> => {
  const { writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const all: SroieRow[] = [];
  for (const split of ["train", "test"]) {
    const rows = await downloadHubRows(
      { kind: "hub", repo: REPO, config: CONFIG, split },
      fetchImpl,
    );
    all.push(...(rows as SroieRow[]));
  }
  await writeFile(path.join(rawDir, "rows.json"), JSON.stringify(all), "utf8");
};

const convert = async (rawDir: string): Promise<BenchmarkCase[]> => {
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const rows = JSON.parse(await readFile(path.join(rawDir, "rows.json"), "utf8")) as SroieRow[];
  return sroieToCases(rows);
};

export const sroie: Dataset = {
  id: "sroie",
  version: "1",
  source: { kind: "hub", repo: REPO, config: CONFIG },
  license: "ICDAR 2019 SROIE (research use)",
  attribution: "ICDAR 2019 SROIE (Huang et al., 2019)",
  download,
  convert,
};
