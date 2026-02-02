import { test, expect } from "bun:test";
import type { JSONSchemaType } from "ajv";
import { runWithRetries } from "./RetryingRunner";

type Output = { title: string };

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: { title: { type: "string" } },
  required: ["title"],
  additionalProperties: false,
};

test("runWithRetries retries on validation error", async () => {
  let calls = 0;
  const result = await runWithRetries<Output>({
    model: {},
    schema,
    system: "sys",
    user: "user",
    execute: async () => {
      calls += 1;
      if (calls === 1) {
        return {
          data: { title: 123 } as unknown as Output,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        };
      }
      return {
        data: { title: "ok" },
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      };
    },
  });

  expect(result.data.title).toBe("ok");
  expect(calls).toBe(2);
});
