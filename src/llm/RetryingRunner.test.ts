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

test("runWithRetries with strict=false allows missing required fields on intermediate attempts", async () => {
  let calls = 0;
  const result = await runWithRetries<Output>({
    model: {},
    schema,
    system: "sys",
    user: "user",
    strict: false,
    execute: async () => {
      calls += 1;
      return {
        data: {} as Output,
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      };
    },
  });

  expect(result.data as unknown as Record<string, unknown>).toEqual({});
  expect(calls).toBe(1);
});

test("runWithRetries with strict=true validates required fields on every attempt", async () => {
  let calls = 0;
  
  await expect(
    runWithRetries<Output>({
      model: {},
      schema,
      system: "sys",
      user: "user",
      strict: true,
      maxAttempts: 2,
      execute: async () => {
        calls += 1;
        return {
          data: {} as Output,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        };
      },
    })
  ).rejects.toThrow();
  
  expect(calls).toBe(2);
});

test("runWithRetries with strict=false still validates type errors", async () => {
  let calls = 0;
  const result = await runWithRetries<Output>({
    model: {},
    schema,
    system: "sys",
    user: "user",
    strict: false,
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

test("runWithRetries enforces strict validation on final attempt even with strict=false", async () => {
  let calls = 0;
  
  await expect(
    runWithRetries<Output>({
      model: {},
      schema,
      system: "sys",
      user: "user",
      strict: false,
      maxAttempts: 2,
      execute: async () => {
        calls += 1;
        return {
          data: {} as Output,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        };
      },
    })
  ).rejects.toThrow();
  
  expect(calls).toBe(2);
});
