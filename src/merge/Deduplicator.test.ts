import { test, expect } from "bun:test";
import { findExactDuplicatesWithHashing, deduplicateByIndices } from "./Deduplicator";

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
