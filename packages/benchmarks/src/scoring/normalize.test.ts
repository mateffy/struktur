import { test, expect } from "bun:test";
import {
  EMPTY,
  normalizeAggressive,
  normalizeString,
  normalizeValue,
  valuesEqual,
} from "./normalize";

test("normalizeString folds case, whitespace and diacritics", () => {
  expect(normalizeString("  ACME   Inc.  ")).toBe("acme inc.");
  expect(normalizeString("Crème Brûlée")).toBe("creme brulee");
  expect(normalizeString("MÜLLER")).toBe("muller");
});

test("normalizeAggressive keeps alphanumerics only", () => {
  expect(normalizeAggressive("ACME Inc.")).toBe("acmeinc");
  expect(normalizeAggressive("2024-01-01")).toBe("20240101");
  expect(normalizeAggressive("Some, Corp!")).toBe("somecorp");
});

test("normalizeValue maps null/undefined to EMPTY", () => {
  expect(normalizeValue(null, "normalized")).toBe(EMPTY);
  expect(normalizeValue(undefined, "exact")).toBe(EMPTY);
});

test("exact metric preserves type and value", () => {
  expect(valuesEqual("acme", "acme", "exact")).toBe(true);
  expect(valuesEqual("ACME", "acme", "exact")).toBe(false);
  expect(valuesEqual(42, 42, "exact")).toBe(true);
  expect(valuesEqual(42, "42", "exact")).toBe(false);
});

test("normalized metric is case-insensitive for strings", () => {
  expect(valuesEqual("ACME Inc.", "acme inc.", "normalized")).toBe(true);
  expect(valuesEqual("Müller", "muller", "normalized")).toBe(true);
  expect(valuesEqual(42, 42, "normalized")).toBe(true);
  // type must still match
  expect(valuesEqual(42, "42", "normalized")).toBe(false);
});

test("tolerance metric accepts small numeric differences", () => {
  expect(valuesEqual(1.0, 1.0000001, "tolerance")).toBe(true);
  expect(valuesEqual(1000, 1000.001, "tolerance")).toBe(true);
  expect(valuesEqual(1.0, 1.1, "tolerance")).toBe(false);
  expect(valuesEqual(42, "42", "tolerance")).toBe(false);
});

test("semantic metric strips punctuation", () => {
  expect(valuesEqual("ACME Inc.", "acme inc", "semantic")).toBe(true);
  expect(valuesEqual("Some Corp.", "somecorp", "semantic")).toBe(true);
  expect(valuesEqual("2024-01-01", "20240101", "semantic")).toBe(true);
});

test("EMPTY equals EMPTY, EMPTY does not equal a value", () => {
  expect(valuesEqual(null, undefined, "normalized")).toBe(true);
  expect(valuesEqual(null, "", "normalized")).toBe(false);
  expect(valuesEqual(null, 0, "normalized")).toBe(false);
});
