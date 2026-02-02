import { test, expect } from "bun:test";
import type { JSONSchemaType } from "ajv";
import { SequentialStrategy } from "./SequentialStrategy";
import type { Artifact, ExtractionOptions } from "../types";

type Output = { title: string };

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: { title: { type: "string" } },
  required: ["title"],
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

test("SequentialStrategy processes batches in order", async () => {
  let calls = 0;
  const strategy = new SequentialStrategy<Output>({
    model: {},
    chunkSize: 2,
    execute: (async () => {
      calls += 1;
      return {
        data: { title: `step-${calls}` },
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
  expect(result.data.title).toBe("step-2");
  expect(calls).toBe(2);
});
