import { test, expect, mock } from "bun:test";
import type { ModelMessage } from "ai";

type GenerateObjectParams = {
  model: unknown;
  schema: unknown;
  schemaName?: string;
  system: string;
  messages: ModelMessage[];
  output: string;
};

let generateObjectImpl: (params: GenerateObjectParams) => Promise<{
  object: unknown;
  usage?: Record<string, unknown>;
}>;

const calls: GenerateObjectParams[] = [];

mock.module("ai", () => ({
  generateObject: (params: GenerateObjectParams) => {
    calls.push(params);
    return generateObjectImpl(params);
  },
  jsonSchema: (schema: unknown) => ({ wrapped: schema }),
}));

const { generateStructured } = await import("./LLMClient");

test("generateStructured maps prompt/completion token usage", async () => {
  calls.length = 0;
  generateObjectImpl = async () => ({
    object: { title: "ok" },
    usage: { promptTokens: 2, completionTokens: 3, totalTokens: 9 },
  });

  const result = await generateStructured({
    model: {},
    schema: { type: "object" },
    system: "sys",
    user: "prompt",
  });

  expect(result.usage).toEqual({ inputTokens: 2, outputTokens: 3, totalTokens: 9 });
  expect(calls[0]?.schemaName).toBe("extract");
  expect(calls[0]?.schema).toEqual({ wrapped: { type: "object" } });
  expect(calls[0]?.messages[0]).toEqual({ role: "user", content: "prompt" });
});

test("generateStructured uses explicit messages and totals usage", async () => {
  calls.length = 0;
  const messages: ModelMessage[] = [{ role: "user", content: "custom" }];
  generateObjectImpl = async (params) => ({
    object: { title: "ok" },
    usage: { inputTokens: 4, outputTokens: 6 },
  });

  const result = await generateStructured({
    model: {},
    schema: { type: "object" },
    system: "sys",
    user: "fallback",
    messages,
  });

  expect(calls[0]?.messages).toBe(messages);
  expect(result.usage).toEqual({ inputTokens: 4, outputTokens: 6, totalTokens: 10 });
});
