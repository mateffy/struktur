import { test, expect } from "bun:test";
import type { JSONSchemaType } from "ajv";
import { ParallelAutoMergeStrategy } from "./ParallelAutoMergeStrategy";
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
