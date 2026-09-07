import type { Artifact } from "@struktur/sdk";
import type { BenchmarkCase, FieldMetricSpec, Track } from "../types";

/** Build a plain text artifact (no media). */
export function textArtifact(text: string, id?: string): Artifact {
  return {
    id: id ?? `artifact-${crypto.randomUUID()}`,
    type: "text",
    raw: async () => Buffer.from(text, "utf8"),
    contents: [{ text }],
  };
}

export type SyntheticRecord = {
  text: string;
  gold: unknown;
  id?: string;
};

/** Wrap user-supplied `(text, gold)` records into benchmark cases. */
export function syntheticCases(
  datasetId: string,
  schema: unknown,
  records: SyntheticRecord[],
  opts: { metrics?: FieldMetricSpec; tracks?: Track[] } = {},
): BenchmarkCase[] {
  return records.map((r, i) => ({
    id: r.id ?? `${datasetId}-${i}`,
    schema,
    gold: r.gold,
    artifacts: [textArtifact(r.text)],
    tracks: opts.tracks ?? ["text"],
    metrics: opts.metrics,
    source: { dataset: datasetId, license: "synthetic" },
  }));
}

// ---------------------------------------------------------------------------
// Deterministic key-value generator
// ---------------------------------------------------------------------------

export type SimpleField = {
  name: string;
  type?: "string" | "number";
  /** Candidate values; picked deterministically. */
  values?: string[];
};

/** Mulberry32 seeded PRNG for reproducible generation. */
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const DEFAULT_STRING_VALUES = ["Acme Corp", "Example Ltd", "Northwind", "Globex", "Initech"];
const DEFAULT_NUMBER_VALUES = ["42", "100.5", "7", "1500", "0.75"];

/**
 * Generate N deterministic text→JSON cases for schema/prompt comparison.
 * Each case renders `<Field Name>: <value>` lines and a gold object, so it
 * exercises flat key-value extraction with no network or files.
 */
export function generateKeyValueCases(
  datasetId: string,
  fields: SimpleField[],
  count: number,
  seed = 1,
): BenchmarkCase[] {
  const rnd = mulberry32(seed);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;

  const schema = {
    type: "object",
    properties: Object.fromEntries(
      fields.map((f) => [f.name, { type: f.type ?? "string" }]),
    ),
    required: fields.map((f) => f.name),
    additionalProperties: false,
  };

  const cases: BenchmarkCase[] = [];
  for (let i = 0; i < count; i++) {
    const lines: string[] = [];
    const gold: Record<string, unknown> = {};
    for (const f of fields) {
      const values = f.values ?? (f.type === "number" ? DEFAULT_NUMBER_VALUES : DEFAULT_STRING_VALUES);
      const raw = pick(values);
      const value = f.type === "number" ? Number.parseFloat(raw) : raw;
      lines.push(`${f.name}: ${raw}`);
      gold[f.name] = value;
    }
    const text = lines.join("\n");
    cases.push({
      id: `${datasetId}-${i}`,
      schema,
      gold,
      artifacts: [textArtifact(text, `artifact-${datasetId}-${i}`)],
      tracks: ["text"],
      source: { dataset: datasetId, license: "synthetic" },
    });
  }
  return cases;
}
