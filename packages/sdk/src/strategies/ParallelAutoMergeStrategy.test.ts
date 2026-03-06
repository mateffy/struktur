import { test, expect } from "bun:test";
import type { JSONSchemaType } from "ajv";
import { ParallelAutoMergeStrategy, __testing__ } from "./ParallelAutoMergeStrategy";
import type { Artifact, ExtractionOptions } from "../types";

type Output = { items: Array<{ id: number }> };

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "number" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

const artifacts: Artifact[] = [
  {
    id: "a1",
    type: "text",
    raw: async () => Buffer.from(""),
    contents: [{ text: "abcdefgh" }],
  },
  {
    id: "a2",
    type: "text",
    raw: async () => Buffer.from(""),
    contents: [{ text: "abcdefgh" }],
  },
];

test("ParallelAutoMergeStrategy deduplicates arrays", async () => {
  const strategy = new ParallelAutoMergeStrategy<Output>({
    model: {},
    chunkSize: 2,
    execute: (async () => {
      return {
        data: { items: [{ id: 1 }, { id: 1 }] },
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      };
    }) as any,
    dedupeExecute: (async () => {
      return {
        data: { keys: [] },
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      };
    }) as any,
  });

  const options: ExtractionOptions<Output> = {
    artifacts,
    schema,
    strategy,
  };

  const result = await strategy.run(options);
  expect(result.data.items.length).toBe(1);
});

test("dedupeArrays removes duplicates from all array fields", () => {
  const data = {
    items: [{ id: 1 }, { id: 1 }, { id: 2 }],
    names: ["a", "a", "b"],
    count: 5,
  };

  const result = __testing__.dedupeArrays(data);

  expect(result.items).toEqual([{ id: 1 }, { id: 2 }]);
  expect(result.names).toEqual(["a", "b"]);
  expect(result.count).toBe(5);
});

test("dedupeArrays handles non-array fields", () => {
  const data = {
    title: "test",
    count: 42,
  };

  const result = __testing__.dedupeArrays(data);

  expect(result).toEqual({ title: "test", count: 42 });
});

test("removeByPath removes item at path", () => {
  const data = {
    items: [{ id: 1 }, { id: 2 }, { id: 3 }],
  };

  const result = __testing__.removeByPath(data, "items.1");

  expect(result.items).toEqual([{ id: 1 }, { id: 3 }]);
});

test("removeByPath handles first item", () => {
  const data = {
    items: [{ id: 1 }, { id: 2 }],
  };

  const result = __testing__.removeByPath(data, "items.0");

  expect(result.items).toEqual([{ id: 2 }]);
});

test("removeByPath handles last item", () => {
  const data = {
    items: [{ id: 1 }, { id: 2 }],
  };

  const result = __testing__.removeByPath(data, "items.1");

  expect(result.items).toEqual([{ id: 1 }]);
});

test("removeByPath returns unchanged data for invalid path", () => {
  const data = {
    items: [{ id: 1 }],
  };

  expect(__testing__.removeByPath(data, "")).toEqual(data);
  expect(__testing__.removeByPath(data, "items")).toEqual(data);
  expect(__testing__.removeByPath(data, "items.abc")).toEqual(data);
  expect(__testing__.removeByPath(data, "missing.0")).toEqual(data);
});

test("removeByPath returns unchanged data for non-array field", () => {
  const data = {
    title: "test",
  };

  const result = __testing__.removeByPath(data, "title.0");

  expect(result).toEqual(data);
});

test("removeByPath does not mutate original data", () => {
  const data = {
    items: [{ id: 1 }, { id: 2 }],
  };

  __testing__.removeByPath(data, "items.0");

  expect(data.items).toEqual([{ id: 1 }, { id: 2 }]);
});
