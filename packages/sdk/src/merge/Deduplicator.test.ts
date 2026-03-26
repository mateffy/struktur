import { test, expect } from "bun:test";
import { findExactDuplicatesWithHashing, deduplicateByIndices, fnv1a32 } from "./Deduplicator";

test("fnv1a32: official test vectors from lcn2/fnv", () => {
  expect(fnv1a32("")).toBe(0x811c9dc5);
  expect(fnv1a32("a")).toBe(0xe40c292c);
  expect(fnv1a32("b")).toBe(0xe70c2de5);
  expect(fnv1a32("c")).toBe(0xe60c2c52);
  expect(fnv1a32("d")).toBe(0xe10c2473);
  expect(fnv1a32("e")).toBe(0xe00c22e0);
  expect(fnv1a32("f")).toBe(0xe30c2799);
  expect(fnv1a32("fo")).toBe(0x6222e842);
  expect(fnv1a32("foo")).toBe(0xa9f37ed7);
  expect(fnv1a32("foob")).toBe(0x3f5076ef);
  expect(fnv1a32("fooba")).toBe(0x39aaa18a);
  expect(fnv1a32("foobar")).toBe(0xbf9cf968);
  expect(fnv1a32("chongo was here!\n")).toBe(0xd49930d5);
});

test("fnv1a32: consistent results", () => {
  const str = "test string for consistency";
  const hash1 = fnv1a32(str);
  const hash2 = fnv1a32(str);
  const hash3 = fnv1a32(str);
  expect(hash1).toBe(hash2);
  expect(hash2).toBe(hash3);
});

test("fnv1a32: different strings produce different hashes", () => {
  const strings = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
  const hashes = strings.map(fnv1a32);
  const uniqueHashes = new Set(hashes);
  expect(uniqueHashes.size).toBe(strings.length);
});

test("fnv1a32: handles unicode", () => {
  const hash1 = fnv1a32("hello");
  const hash2 = fnv1a32("héllo");
  const hash3 = fnv1a32("你好");
  expect(hash1).not.toBe(hash2);
  expect(typeof hash3).toBe("number");
  expect(hash3).toBeGreaterThan(0);
});

test("fnv1a32: handles special characters", () => {
  const hash1 = fnv1a32('{"key":"value"}');
  const hash2 = fnv1a32('{"key":"value2"}');
  expect(hash1).not.toBe(hash2);
});

test("fnv1a32: returns unsigned 32-bit integer", () => {
  const hash = fnv1a32("some test string");
  expect(hash).toBeGreaterThanOrEqual(0);
  expect(hash).toBeLessThan(4294967296);
  expect(Number.isInteger(hash)).toBe(true);
});

test("fnv1a32: collision resistance for similar strings", () => {
  const strings = [
    "item1",
    "item2",
    "item3",
    "item4",
    "item5",
    "item6",
    "item7",
    "item8",
    "item9",
    "item10",
    "Item1",
    "ITEM1",
    "itemA",
    "itemB",
    "itemC",
  ];
  const hashes = strings.map(fnv1a32);
  const uniqueHashes = new Set(hashes);
  expect(uniqueHashes.size).toBe(strings.length);
});

test("findExactDuplicatesWithHashing finds duplicates", () => {
  const duplicates = findExactDuplicatesWithHashing([
    { id: 1, name: "A" },
    { id: 1, name: "A" },
    { id: 2, name: "B" },
  ]);

  expect(duplicates).toEqual([1]);
});

test("deduplicateByIndices removes by index", () => {
  const items = ["a", "b", "c"];
  const result = deduplicateByIndices(items, [1]);
  expect(result).toEqual(["a", "c"]);
});

test("findExactDuplicatesWithHashing handles empty array", () => {
  expect(findExactDuplicatesWithHashing([])).toEqual([]);
});

test("findExactDuplicatesWithHashing handles no duplicates", () => {
  expect(findExactDuplicatesWithHashing([1, 2, 3])).toEqual([]);
});

test("findExactDuplicatesWithHashing handles all duplicates", () => {
  expect(findExactDuplicatesWithHashing([1, 1, 1])).toEqual([1, 2]);
});

test("findExactDuplicatesWithHashing handles complex objects", () => {
  const obj = { a: 1, b: { c: 2 } };
  const duplicates = findExactDuplicatesWithHashing([obj, obj, { a: 1, b: { c: 3 } }]);
  expect(duplicates).toEqual([1]);
});

test("findExactDuplicatesWithHashing: key order doesn't matter", () => {
  const obj1 = { a: 1, b: 2 };
  const obj2 = { b: 2, a: 1 };
  const duplicates = findExactDuplicatesWithHashing([obj1, obj2]);
  expect(duplicates).toEqual([1]);
});
