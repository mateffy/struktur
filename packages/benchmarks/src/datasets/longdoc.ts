import type { Artifact } from "@struktur/sdk";
import type { BenchmarkCase } from "../types";
import { textArtifact } from "./synthetic";

/**
 * Synthetic long documents: `recordCount` self-contained records with a
 * repeating structure. Document length scales with record count, so total
 * length is controllable and the document actually splits into chunks.
 *
 * The schema requires collecting/counting across the whole document
 * (arrays + aggregates: total_records, total_amount), which exercises
 * chunking + merge quality — not just per-record extraction. Notes are short
 * meaningful phrases (no filler) so output tokens stay proportional to
 * content, keeping cost/latency measurements honest.
 */

export type LongDocSpec = {
  id: string;
  recordCount: number;
  /** Random seed for deterministic generation. */
  seed?: number;
};

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

const SCHEMA = {
  type: "object",
  properties: {
    total_records: { type: "number" },
    total_amount: { type: "number" },
    records: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          customer: { type: "string" },
          amount: { type: "number" },
          notes: { type: "string" },
        },
        required: ["id", "customer", "amount", "notes"],
        additionalProperties: false,
      },
    },
  },
  required: ["total_records", "total_amount", "records"],
  additionalProperties: false,
} as const;

const CUSTOMERS = [
  "Acme Corp",
  "Globex Inc",
  "Initech LLC",
  "Umbrella Corp",
  "Soylent Corp",
  "Hooli",
  "Pied Piper",
  "Stark Industries",
  "Wayne Enterprises",
  "Aperture Science",
] as const;

const NOTES = [
  "priority order",
  "standard delivery",
  "expedited shipping",
  "payment pending",
  "payment received",
  "on hold — awaiting review",
  "partially shipped",
  "fully delivered",
  "return requested",
  "refund issued",
  "backordered",
  "customer pickup",
] as const;

export type LongDocRecord = { id: string; customer: string; amount: number; notes: string };

const buildRecords = (count: number, seed: number): LongDocRecord[] => {
  const rnd = mulberry32(seed);
  const records: LongDocRecord[] = [];
  for (let i = 0; i < count; i++) {
    records.push({
      id: `REC-${String(i + 1).padStart(5, "0")}`,
      customer: CUSTOMERS[Math.floor(rnd() * CUSTOMERS.length)]!,
      amount: Math.round(rnd() * 100000) / 100,
      notes: NOTES[Math.floor(rnd() * NOTES.length)]!,
    });
  }
  return records;
};

const buildText = (records: LongDocRecord[]): string =>
  records
    .map(
      (r) =>
        `Record ${r.id}\nCustomer: ${r.customer}\nAmount: ${r.amount.toFixed(2)}\nNotes: ${r.notes}\n`,
    )
    .join("\n---\n");

export const longDocArtifact = (id: string, text: string): Artifact => textArtifact(text, id);

/** Create a single long-document benchmark case. */
export function longDocCase(spec: LongDocSpec): BenchmarkCase {
  const records = buildRecords(spec.recordCount, spec.seed ?? 42);
  const text = buildText(records);
  const total = records.reduce((a, r) => a + r.amount, 0);

  return {
    id: `longdoc-${spec.id}`,
    schema: SCHEMA,
    gold: {
      total_records: records.length,
      total_amount: Math.round(total * 100) / 100,
      records,
    },
    artifacts: [longDocArtifact(`longdoc-${spec.id}`, text)],
    tracks: ["text"],
    metrics: {
      default: "normalized",
      fields: { amount: "tolerance", total_amount: "tolerance" },
      arrays: [{ path: "records", key: "id" }],
    },
    source: { dataset: "longdoc-synthetic" },
  };
}

/**
 * Long-document cases at ~5k / 10k / 20k tokens (4 chars/token).
 * Record count = targetTokens * 4 / ~90 chars per record.
 */
export const longDocCases = (): BenchmarkCase[] => [
  longDocCase({ id: "5k", recordCount: 220, seed: 1 }),
  longDocCase({ id: "10k", recordCount: 440, seed: 2 }),
  longDocCase({ id: "20k", recordCount: 880, seed: 3 }),
];
