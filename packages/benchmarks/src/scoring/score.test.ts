import { test, expect } from "bun:test";
import { scoreData, leafCount } from "./score";
import type { FieldMetricSpec } from "../types";

test("exact match scores a perfect F1", () => {
  const s = scoreData({ a: 1, b: "x" }, { a: 1, b: "x" });
  expect(s.f1).toBe(1);
  expect(s.precision).toBe(1);
  expect(s.recall).toBe(1);
  expect(s.exactMatch).toBe(true);
  expect(s.tp).toBe(2);
  expect(s.fp).toBe(0);
  expect(s.fn).toBe(0);
});

test("omission counts as a false negative", () => {
  const s = scoreData({ a: 1, b: 2 }, { a: 1 });
  expect(s.fn).toBe(1);
  expect(s.fp).toBe(0);
  expect(s.recall).toBe(0.5);
  expect(s.precision).toBe(1);
  expect(s.exactMatch).toBe(false);
});

test("hallucination counts as a false positive", () => {
  const s = scoreData({ a: 1 }, { a: 1, b: 2 });
  expect(s.fp).toBe(1);
  expect(s.fn).toBe(0);
  expect(s.precision).toBe(0.5);
  expect(s.recall).toBe(1);
});

test("wrong value counts against both precision and recall", () => {
  const s = scoreData({ a: 1, b: 2 }, { a: 1, b: 99 });
  expect(s.fp).toBe(1);
  expect(s.fn).toBe(1);
  expect(s.tp).toBe(1);
  expect(s.precision).toBe(0.5);
  expect(s.recall).toBe(0.5);
  expect(s.exactMatch).toBe(false);
});

test("null and absent are equivalent", () => {
  expect(scoreData({ a: null }, {}).f1).toBe(1);
  expect(scoreData({}, { a: null }).f1).toBe(1);
  expect(scoreData({ a: null }, { a: null }).f1).toBe(1);
});

test("normalized comparison is the default (case-insensitive)", () => {
  const s = scoreData({ name: "ACME Inc." }, { name: "acme inc." });
  expect(s.f1).toBe(1);
});

test("per-field metric override", () => {
  const spec: FieldMetricSpec = {
    fields: { total: "tolerance", name: "exact" },
  };
  // name must match exactly (fails), total within tolerance (passes)
  const s = scoreData({ name: "ACME", total: 1.0 }, { name: "acme", total: 1.0000001 }, spec);
  expect(s.tp).toBe(1); // total only
  expect(s.fn).toBe(1); // name wrong
  expect(s.fp).toBe(1);
});

test("nested objects flatten with dot paths", () => {
  const s = scoreData({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } });
  expect(s.f1).toBe(1);
  const s2 = scoreData({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } });
  expect(s2.f1).toBe(0);
  expect(s2.fieldErrors[0]!.path).toBe("a.b.c");
});

test("arrays compare by index by default", () => {
  const gold = { items: [{ n: "a", q: 1 }, { n: "b", q: 2 }] };
  const pred = { items: [{ n: "a", q: 1 }, { n: "b", q: 2 }] };
  expect(scoreData(gold, pred).f1).toBe(1);

  const wrong = { items: [{ n: "a", q: 1 }, { n: "b", q: 9 }] };
  const s = scoreData(gold, wrong);
  expect(s.tp).toBe(3);
  expect(s.fn).toBe(1);
  expect(s.fp).toBe(1);
});

test("array alignment by key is order-invariant", () => {
  const gold = { items: [{ n: "a", q: 1 }, { n: "b", q: 2 }] };
  const reordered = { items: [{ n: "b", q: 2 }, { n: "a", q: 1 }] };
  const spec: FieldMetricSpec = { arrays: [{ path: "items", key: "n" }] };

  const indexed = scoreData(gold, reordered);
  expect(indexed.f1).toBe(0); // positional mismatch

  const aligned = scoreData(gold, reordered, spec);
  expect(aligned.f1).toBe(1);
});

test("array alignment falls back to position when no key overlaps", () => {
  // e.g. building label "Halle 1" vs "Halle 1 mit Bürogebäude" — no exact key
  // match, so positional alignment must pair them instead of scoring all FN+FP.
  const gold = { items: [{ n: "Halle 1", q: 1 }, { n: "Halle 2", q: 2 }] };
  const pred = { items: [{ n: "Halle 1 mit Bürogebäude", q: 1 }, { n: "Halle 2 mit Bürogebäude", q: 2 }] };
  const spec: FieldMetricSpec = { arrays: [{ path: "items", key: "n" }] };

  const s = scoreData(gold, pred, spec);
  expect(s.tp).toBe(2); // q values match positionally
  // labels differ ("Halle 1" vs "Halle 1 mit Bürogebäude") under normalized
  // metric — but far better than the no-fallback case (tp=0, everything FN+FP).
  expect(s.fn).toBe(2);
  expect(s.fp).toBe(2);
});

test("array alignment counts missing and extra items", () => {
  const gold = { items: [{ n: "a", q: 1 }, { n: "b", q: 2 }] };
  const pred = { items: [{ n: "a", q: 1 }, { n: "c", q: 3 }] };
  const spec: FieldMetricSpec = { arrays: [{ path: "items", key: "n" }] };

  const s = scoreData(gold, pred, spec);
  // "a" item matches (2 leaves), "b" item omitted (2 fn), "c" item extra (2 fp)
  expect(s.tp).toBe(2);
  expect(s.fn).toBe(2);
  expect(s.fp).toBe(2);
});

test("empty object vs empty object is perfect", () => {
  expect(scoreData({}, {}).f1).toBe(1);
  expect(scoreData({}, {}).tp).toBe(0);
});

test("type mismatch (object vs null) scores all gold leaves as missing", () => {
  const s = scoreData({ a: 1, b: 2 }, null);
  expect(s.fn).toBe(2);
  expect(s.fp).toBe(0);
  expect(s.recall).toBe(0);
});

test("leafCount counts leaves", () => {
  expect(leafCount({ a: 1, b: { c: 2 } })).toBe(2);
  expect(leafCount([{ a: 1 }, { a: 2 }])).toBe(2);
  expect(leafCount({})).toBe(0);
  expect(leafCount(null)).toBe(1);
});

test("failed extraction (null data) has zero recall", () => {
  const s = scoreData({ a: 1, b: 2 }, null);
  expect(s.tp).toBe(0);
  expect(s.fn).toBe(2);
  expect(s.f1).toBe(0);
});

test("sets are matched order-insensitively", () => {
  const gold = { usages: ["office", "storage"], features: ["elevators", "cctv"] };
  const pred = { usages: ["storage", "office"], features: ["cctv", "elevators"] };
  const spec: FieldMetricSpec = { sets: ["usages", "features"] };
  const s = scoreData(gold, pred, spec);
  expect(s.f1).toBe(1);
  expect(s.tp).toBe(4);
  expect(s.fp).toBe(0);
  expect(s.fn).toBe(0);
});

test("sets penalize missing and extra members", () => {
  const gold = { usages: ["office", "storage"] };
  const pred = { usages: ["office"] };
  const spec: FieldMetricSpec = { sets: ["usages"] };
  const s = scoreData(gold, pred, spec);
  expect(s.tp).toBe(1);
  expect(s.fn).toBe(1);
  expect(s.fp).toBe(0);
});
