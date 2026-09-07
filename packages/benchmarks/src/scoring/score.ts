import type { ArrayAlignment, FieldMetric, FieldMetricSpec } from "../types";
import { EMPTY, normalizeValue, valuesEqual } from "./normalize";

// ---- Prose coverage scoring -------------------------------------------------
// description_text / location_text are free prose. Comparing them verbatim is
// meaningless (two writers never produce identical prose). Score them by
// content-word overlap — an ordered F1 over the distinct content tokens.

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "at", "is", "are",
  "it", "this", "that", "with", "for", "as", "by", "from", "be", "was", "were",
  "und", "der", "die", "das", "ein", "eine", "einen", "dem", "den", "mit",
  "von", "zur", "zum", "auf", "im", "in", "am", "ist", "sind", "werden",
  "wird", "des", "sich", "auch", "nicht", "als", "bei", "für", "über", "aus",
  "nach", "einer", "einem", "eine", "zu", "unter", "an", "sowie", "durch",
  "alle", "dass", "dieser", "diese", "hier", "sein", "ihr", "wir", "man",
]);

const tokenizeProse = (s: string): string[] => {
  if (typeof s !== "string") return [];
  return Array.from(
    new Set(
      s
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w)),
    ),
  );
};

function scoreProse(gold: unknown, pred: unknown): FieldScore {
  const s = empty();
  const gt = tokenizeProse(String(gold ?? ""));
  const pt = tokenizeProse(String(pred ?? ""));
  const gs = new Set(gt);
  const ps = new Set(pt);
  const tp = gt.filter((w) => ps.has(w)).length;
  const fp = pt.filter((w) => !gs.has(w)).length;
  const fn = gt.filter((w) => !ps.has(w)).length;
  s.tp = tp;
  s.fp = fp;
  s.fn = fn;
  s.totalGold = gt.length;
  s.totalPred = pt.length;
  return finalize(s);
}

/**
 * Field-level score. Fields (leaves) are compared individually so omission
 * (gold field missing) and hallucination (extra predicted field) are counted
 * separately, and a wrong value counts against both precision and recall.
 */
export type FieldScore = {
  /** Correctly extracted leaf values. */
  tp: number;
  /** Predicted leaves that were wrong (hallucinated or wrong value). */
  fp: number;
  /** Gold leaves that were wrong (omitted or wrong value). */
  fn: number;
  totalGold: number;
  totalPred: number;
  precision: number;
  recall: number;
  f1: number;
  /** True when every gold field matched exactly and no field was hallucinated. */
  exactMatch: boolean;
  /** Per-field mismatches for debugging. */
  fieldErrors: FieldError[];
};

export type FieldError = {
  path: string;
  gold: unknown;
  pred: unknown;
  metric: FieldMetric;
};

const empty = (): FieldScore => ({
  tp: 0,
  fp: 0,
  fn: 0,
  totalGold: 0,
  totalPred: 0,
  precision: 1,
  recall: 1,
  f1: 1,
  exactMatch: true,
  fieldErrors: [],
});

const finalize = (s: FieldScore): FieldScore => {
  s.precision = s.tp + s.fp === 0 ? 1 : s.tp / (s.tp + s.fp);
  s.recall = s.tp + s.fn === 0 ? 1 : s.tp / (s.tp + s.fn);
  s.f1 = s.precision + s.recall === 0 ? 0 : (2 * s.precision * s.recall) / (s.precision + s.recall);
  s.exactMatch = s.fp === 0 && s.fn === 0;
  return s;
};

const merge = (into: FieldScore, child: FieldScore): void => {
  into.tp += child.tp;
  into.fp += child.fp;
  into.fn += child.fn;
  into.totalGold += child.totalGold;
  into.totalPred += child.totalPred;
  into.fieldErrors.push(...child.fieldErrors);
};

const isLeaf = (v: unknown): boolean =>
  v === null || v === undefined || typeof v === "string" || typeof v === "number" || typeof v === "boolean";

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Number of leaf values a (sub)tree contains. `{}` has zero; `null` counts as one. */
export const leafCount = (v: unknown): number => {
  if (Array.isArray(v)) return v.reduce<number>((n, item) => n + leafCount(item), 0);
  if (isObject(v)) {
    return Object.values(v).reduce<number>((n, item) => n + leafCount(item), 0);
  }
  return 1;
};

/** Collapse concrete array keys to `[]` so nested alignment/set lookups work. */
const canonPath = (path: string): string => path.replace(/\[[^\]]*\]/g, "[]");

const metricFor = (spec: FieldMetricSpec, path: string): FieldMetric =>
  // field overrides are keyed by the leaf field name (e.g. "area"), robust to
  // concrete array keys in the path.
  spec.fields?.[path.split(".").pop() as string] ?? spec.default ?? "normalized";

const alignmentFor = (spec: FieldMetricSpec, path: string): ArrayAlignment | undefined =>
  spec.arrays?.find((a) => canonPath(a.path) === canonPath(path)) ??
  spec.arrays?.find((a) => canonPath(path).endsWith(canonPath(a.path)));

const isSetPath = (spec: FieldMetricSpec, path: string): boolean =>
  (spec.sets ?? []).some((s) => canonPath(s) === canonPath(path) || canonPath(path).endsWith(canonPath(s)));

function groupByKey(items: unknown[], key: string | string[]): Map<string, unknown[]> {
  const map = new Map<string, unknown[]>();
  const keys = Array.isArray(key) ? key : [key];
  for (const item of items) {
    const k = keys
      .map((kf) => (isObject(item) ? item[kf] : undefined))
      .map((v) => String(normalizeValue(v, "normalized")))
      .join("|");
    const arr = map.get(k) ?? [];
    arr.push(item);
    map.set(k, arr);
  }
  return map;
}

/** Compare a leaf pair (at least one side is a leaf/null/undefined). */
function scoreLeaf(path: string, gold: unknown, pred: unknown, spec: FieldMetricSpec): FieldScore {
  const metric = metricFor(spec, path);
  if (metric === "prose" && (typeof gold === "string" || typeof pred === "string")) {
    return scoreProse(gold, pred);
  }
  const s = empty();
  s.totalGold = isLeaf(gold) ? 1 : leafCount(gold);
  s.totalPred = isLeaf(pred) ? 1 : leafCount(pred);

  if (valuesEqual(gold, pred, metric)) {
    s.tp = isLeaf(gold) ? 1 : leafCount(gold);
    // both sides equal → the gold side is fully correct; nothing wrong.
    return finalize(s);
  }

  const goldEmpty = gold === null || gold === undefined;
  const predEmpty = pred === null || pred === undefined;
  if (goldEmpty) s.fp = s.totalPred;
  else if (predEmpty) s.fn = s.totalGold;
  else {
    s.fn = s.totalGold;
    s.fp = s.totalPred;
  }
  s.fieldErrors.push({ path, gold, pred, metric });
  return finalize(s);
}

function scoreIndexed(path: string, g: unknown[], p: unknown[], spec: FieldMetricSpec): FieldScore {
  const s = empty();
  const len = Math.max(g.length, p.length);
  for (let i = 0; i < len; i++) {
    merge(s, scoreAt(`${path}[${i}]`, g[i] ?? null, p[i] ?? null, spec));
  }
  return finalize(s);
}

function scoreAligned(
  path: string,
  g: unknown[],
  p: unknown[],
  key: string | string[],
  spec: FieldMetricSpec,
): FieldScore {
  const s = empty();
  const gm = groupByKey(g, key);
  const pm = groupByKey(p, key);

  // If no key overlaps at all (e.g. building label "Halle 1" vs
  // "Halle 1 mit Bürogebäude"), key alignment scores everything as FN+FP.
  // Fall back to positional alignment — item order follows the document in
  // both gold and prediction, which is a better match than nothing.
  let matchedAny = false;

  for (const [k, gItems] of gm) {
    const pItems = pm.get(k);
    if (!pItems || pItems.length === 0) {
      for (const gi of gItems) {
        s.fn += leafCount(gi);
        s.totalGold += leafCount(gi);
      }
      continue;
    }
    matchedAny = true;
    const pairs = Math.min(gItems.length, pItems.length);
    for (let i = 0; i < pairs; i++) {
      merge(s, scoreAt(`${path}[${String(k)}]`, gItems[i], pItems[i], spec));
    }
    for (let i = pairs; i < gItems.length; i++) {
      s.fn += leafCount(gItems[i]!);
      s.totalGold += leafCount(gItems[i]!);
    }
    for (let i = pairs; i < pItems.length; i++) {
      s.fp += leafCount(pItems[i]!);
      s.totalPred += leafCount(pItems[i]!);
    }
  }

  for (const [k, pItems] of pm) {
    if (gm.has(k)) continue;
    for (const pi of pItems) {
      s.fp += leafCount(pi);
      s.totalPred += leafCount(pi);
    }
  }

  if (!matchedAny && g.length > 0 && p.length > 0) {
    return scoreIndexed(path, g, p, spec);
  }

  return finalize(s);
}

function scoreSet(path: string, g: unknown[], p: unknown[], spec: FieldMetricSpec): FieldScore {
  // Compare as an order-insensitive multiset. Duplicates count independently.
  const s = empty();
  const goldKeyed = new Map<string, number>();
  const predKeyed = new Map<string, number>();
  const metric = metricFor(spec, canonPath(path));
  const bump = (map: Map<string, number>, v: unknown) => {
    const k = String(normalizeValue(v, metric));
    map.set(k, (map.get(k) ?? 0) + 1);
  };

  for (const v of g) bump(goldKeyed, v);
  for (const v of p) bump(predKeyed, v);

  s.totalGold = g.length;
  s.totalPred = p.length;

  for (const [k, gc] of goldKeyed) {
    const pc = predKeyed.get(k) ?? 0;
    const common = Math.min(gc, pc);
    s.tp += common;
    s.fn += gc - common;
    s.fp += pc - common;
    if (common < gc) {
      s.fieldErrors.push({ path, gold: g.find((v) => String(normalizeValue(v, metric)) === k), pred: null, metric });
    }
  }
  for (const [k, pc] of predKeyed) {
    const gc = goldKeyed.get(k) ?? 0;
    if (pc > gc) {
      s.fieldErrors.push({ path, gold: null, pred: p.find((v) => String(normalizeValue(v, metric)) === k), metric });
    }
  }
  return finalize(s);
}

function scoreAt(path: string, gold: unknown, pred: unknown, spec: FieldMetricSpec): FieldScore {
  if (isLeaf(gold) || isLeaf(pred)) {
    return scoreLeaf(path, gold, pred, spec);
  }

  if (Array.isArray(gold) || Array.isArray(pred)) {
    const g = Array.isArray(gold) ? gold : [gold];
    const p = Array.isArray(pred) ? pred : [pred];
    if (isSetPath(spec, path)) {
      return scoreSet(path, g, p, spec);
    }
    const align = alignmentFor(spec, path);
    return align ? scoreAligned(path, g, p, align.key, spec) : scoreIndexed(path, g, p, spec);
  }

  const s = empty();
  const keys = new Set([...Object.keys(gold as object), ...Object.keys(pred as object)]);
  for (const key of keys) {
    const childPath = path === "" ? key : `${path}.${key}`;
    const gv = (gold as Record<string, unknown>)[key] ?? null;
    const pv = (pred as Record<string, unknown>)[key] ?? null;
    merge(s, scoreAt(childPath, gv, pv, spec));
  }
  return finalize(s);
}

/**
 * Score an extraction output against its gold instance, field by field.
 */
export function scoreData(gold: unknown, pred: unknown, spec: FieldMetricSpec = {}): FieldScore {
  return scoreAt("", gold, pred, spec);
}

/** Export the sentinel so tests/consumers can build explicit EMPTY comparisons. */
export { EMPTY };
