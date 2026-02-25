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

test("runWithRetries emits onRetry event when retrying", async () => {
  let calls = 0;
  const retryEvents: Array<{ attempt: number; maxAttempts: number; reason?: string }> = [];
  
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
    events: {
      onRetry: (info) => {
        retryEvents.push(info);
      },
    },
  });

  expect(result.data.title).toBe("ok");
  expect(calls).toBe(2);
  expect(retryEvents).toHaveLength(1);
  expect(retryEvents[0]?.attempt).toBe(2);
  expect(retryEvents[0]?.maxAttempts).toBe(3);
  expect(retryEvents[0]?.reason).toBe("schema_validation_failed");
});

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

test("runWithRetries with strict=false retries on missing required fields until max attempts", async () => {
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
