import type { FieldMetric } from "../types";

/** Sentinel for "no value": null, undefined, and absent keys all normalize here. */
export const EMPTY = Symbol("struktur.benchmarks.empty");

export type Normalized = string | number | boolean | typeof EMPTY;

const stripDiacritics = (s: string): string =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Case, whitespace, and diacritic folding for normal string comparison. */
export const normalizeString = (s: string): string =>
  stripDiacritics(s.toLowerCase()).replace(/\s+/g, " ").trim();

/** Aggressive folding for semantic equivalence: alphanumerics only. */
export const normalizeAggressive = (s: string): string =>
  stripDiacritics(s.toLowerCase()).replace(/[^a-z0-9]+/g, "");

/**
 * Normalize a leaf value according to a metric. Leaves are primitives
 * (string/number/boolean) or null/undefined; anything else is stringified so a
 * type mismatch still produces a deterministic, non-equal comparison.
 */
export function normalizeValue(value: unknown, metric: FieldMetric): Normalized {
  if (value === null || value === undefined) return EMPTY;

  if (metric === "exact") {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return value;
    }
    return JSON.stringify(value);
  }

  if (metric === "semantic") {
    if (typeof value === "number" || typeof value === "boolean") return value;
    return normalizeAggressive(typeof value === "string" ? value : JSON.stringify(value));
  }

  // normalized / tolerance
  if (typeof value === "number" || typeof value === "boolean") return value;
  return normalizeString(typeof value === "string" ? value : JSON.stringify(value));
}

const RELATIVE_TOLERANCE = 1e-6;

/**
 * Compare two leaf values under a metric. `EMPTY == EMPTY` is always true:
 * extracting "nothing" where the source has nothing is correct.
 */
export function valuesEqual(a: unknown, b: unknown, metric: FieldMetric): boolean {
  const na = normalizeValue(a, metric);
  const nb = normalizeValue(b, metric);

  if (na === EMPTY || nb === EMPTY) return na === EMPTY && nb === EMPTY;

  if (metric === "tolerance" && typeof na === "number" && typeof nb === "number") {
    const scale = Math.max(1, Math.abs(na), Math.abs(nb));
    return Math.abs(na - nb) <= RELATIVE_TOLERANCE * scale;
  }

  return na === nb;
}
