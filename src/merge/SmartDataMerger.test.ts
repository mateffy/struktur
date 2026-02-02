import { test, expect } from "bun:test";
import { SmartDataMerger } from "./SmartDataMerger";

test("SmartDataMerger concatenates arrays and preserves scalars", () => {
  const schema = {
    type: "object",
    properties: {
      items: { type: "array" },
      title: { type: "string" },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge(
    { items: [1], title: "A" },
    { items: [2], title: "" }
  );

  expect(result.items).toEqual([1, 2]);
  expect(result.title).toBe("A");
});
