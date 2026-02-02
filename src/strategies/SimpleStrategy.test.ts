import { test, expect } from "bun:test";
import type { JSONSchemaType } from "ajv";
import { SimpleStrategy } from "./SimpleStrategy";
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
    contents: [{ text: "hello" }],
  },
];

test("SimpleStrategy runs once", async () => {
  let calls = 0;
  const strategy = new SimpleStrategy<Output>({
    model: {},
    execute: (async () => {
      calls += 1;
      return {
        data: { title: "ok" },
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
  expect(result.data.title).toBe("ok");
  expect(calls).toBe(1);
});
