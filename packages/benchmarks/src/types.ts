import type {
  Artifact,
  StandardSchema,
  TypedJSONSchema,
  Usage,
} from "@struktur/sdk";

/**
 * The four ways a source can be presented to the model.
 *
 * Text is always present — the PDF parser extracts text unconditionally. The
 * track only varies which images accompany it:
 * - `text`                       → text only
 * - `text+embedded`              → text + images embedded in the source
 * - `text+screenshots`           → text + rendered page screenshots
 * - `text+embedded+screenshots`  → text + both
 *
 * For image-only sources (scanned receipts, photos) text is absent and the
 * image IS the content, so only `text+embedded` is meaningful.
 */
export type Track =
  | "text"
  | "text+embedded"
  | "text+screenshots"
  | "text+embedded+screenshots";

export const TRACKS: readonly Track[] = [
  "text",
  "text+embedded",
  "text+screenshots",
  "text+embedded+screenshots",
] as const;

/**
 * Infer the output type `T` of a schema:
 * - Standard Schema v1 (Zod, Valibot, ArkType, …) → its output type
 * - TypedJSONSchema<T> (tagged plain JSON Schema)      → T
 * - plain JSON Schema object                            → unknown (no type info carried)
 */
export type SchemaOutput<S> = S extends StandardSchema<unknown, infer T>
  ? T
  : S extends TypedJSONSchema<infer T>
    ? T
    : unknown;

/** How a single field is compared against its gold value. */
export type FieldMetric = "exact" | "normalized" | "tolerance" | "semantic" | "prose";

/** An array path (dot notation) aligned by per-item key field(s) instead of index. */
export type ArrayAlignment = {
  /** e.g. `"items"` or `"invoice.items"` */
  path: string;
  /** Field(s) within each item used to match items, e.g. `"name"` or `["floor","area"]`. */
  key: string | string[];
};

/**
 * Per-field scoring rules. Defaults to `normalized` (case/whitespace/diacritic
 * folding, numeric equality) when nothing is specified.
 */
export type FieldMetricSpec = {
  default?: FieldMetric;
  /** Dot-path → metric override. e.g. `{ "total": "tolerance" }` */
  fields?: Record<string, FieldMetric>;
  /** Arrays matched by a key field rather than position. */
  arrays?: ArrayAlignment[];
  /** Array paths scored as order-insensitive sets (uses the def value metric). */
  sets?: string[];
};

/** Provenance metadata attached to a case (license, attribution). */
export type CaseSourceInfo = {
  dataset?: string;
  license?: string;
  url?: string;
  attribution?: string;
};

/**
 * The portable unit of the benchmark: one input → one schema → one correct
 * answer. `gold` is a fully-populated instance of `schema` — the exact JSON a
 * perfect extraction should return.
 *
 * `artifacts` is the base input. For PDF sources the runner re-parses
 * `artifacts` per track (see `materializeTrack`); for image/text sources that
 * can't be re-derived, supply `artifactsByTrack` to pin specific inputs.
 */
export interface BenchmarkCase<TSchema = unknown, T = SchemaOutput<TSchema>> {
  id: string;
  schema: TSchema;
  gold: T;
  artifacts: Artifact[];
  /** Tracks this case can produce. Defaults to all four. */
  tracks?: Track[];
  /**
   * Pre-materialized artifacts per track. Takes precedence over `artifacts`
   * (which is still required as the fallback/default). Use when a source can't
   * be re-parsed from its raw bytes, e.g. image-only datasets.
   */
  artifactsByTrack?: Partial<Record<Track, Artifact[]>>;
  /** Per-field scoring rules for this case. */
  metrics?: FieldMetricSpec;
  /**
   * Optional normalizer applied to a prediction before scoring (and before
   * caching). Use to make gold/prediction shapes symmetric, e.g. collapsing
   * building+unit features into one set. Gold is NOT passed through this.
   */
  transform?: (data: unknown) => unknown;
  source?: CaseSourceInfo;
}

/** Identity helper that preserves schema → gold type inference. */
export function defineCase<TSchema>(c: BenchmarkCase<TSchema>): BenchmarkCase<TSchema> {
  return c;
}

export type { Usage };
