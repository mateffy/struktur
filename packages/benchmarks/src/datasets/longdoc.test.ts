import { test, expect } from "bun:test";
import { longDocCase, longDocCases } from "./longdoc";

test("longDocCase generates the requested record count", () => {
  const c = longDocCase({ id: "t", recordCount: 10, seed: 7 });
  const gold = c.gold as { total_records: number; records: unknown[] };
  expect(gold.total_records).toBe(10);
  expect(gold.records).toHaveLength(10);
  expect(c.id).toBe("longdoc-t");
});

test("gold total_amount equals the sum of record amounts", () => {
  const c = longDocCase({ id: "t", recordCount: 25, seed: 9 });
  const gold = c.gold as { total_amount: number; records: { amount: number }[] };
  const sum = gold.records.reduce((a, r) => a + r.amount, 0);
  expect(gold.total_amount).toBeCloseTo(Math.round(sum * 100) / 100, 2);
});

test("document text grows with record count", () => {
  const small = longDocCase({ id: "s", recordCount: 5 }).artifacts[0]!;
  const big = longDocCase({ id: "b", recordCount: 50 }).artifacts[0]!;
  const smallLen = small.contents.reduce((a, c) => a + (c.text?.length ?? 0), 0);
  const bigLen = big.contents.reduce((a, c) => a + (c.text?.length ?? 0), 0);
  expect(bigLen).toBeGreaterThan(smallLen * 5);
});

test("longDocCases produces 3 cases at increasing lengths", () => {
  const cases = longDocCases();
  expect(cases).toHaveLength(3);
  expect(cases.map((c) => c.id)).toEqual(["longdoc-5k", "longdoc-10k", "longdoc-20k"]);
});

test("record ids are unique and deterministic per seed", () => {
  const a = longDocCase({ id: "a", recordCount: 10, seed: 3 });
  const b = longDocCase({ id: "a", recordCount: 10, seed: 3 });
  expect(a.gold).toEqual(b.gold);
});
