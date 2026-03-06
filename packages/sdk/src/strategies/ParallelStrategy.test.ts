import { test, expect } from "bun:test";
import type { JSONSchemaType } from "ajv";
import { ParallelStrategy } from "./ParallelStrategy";
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

test("ParallelStrategy merges batch results", async () => {
  let calls = 0;
  const strategy = new ParallelStrategy<Output>({
    model: {},
    mergeModel: {},
    chunkSize: 2,
    execute: (async (request: any) => {
      calls += 1;
      const userText = typeof request.user === "string" ? request.user : "";
      if (userText.includes("<json-objects>")) {
        return {
          data: { title: "merged" },
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        };
      }
      return {
        data: { title: "chunk" },
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
  expect(result.data.title).toBe("merged");
  expect(calls).toBe(3);
});
