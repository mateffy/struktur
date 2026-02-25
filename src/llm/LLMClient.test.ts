import { test, expect, mock } from "bun:test";
import type { ModelMessage } from "ai";

type GenerateTextParams = {
  model: unknown;
  output: unknown;
  system: string;
  messages: ModelMessage[];
};

let generateTextImpl: (params: GenerateTextParams) => Promise<{
  output: unknown;
  usage?: Record<string, unknown>;
}>;

const calls: GenerateTextParams[] = [];

mock.module("ai", () => ({
  generateText: (params: GenerateTextParams) => {
    calls.push(params);
    return generateTextImpl(params);
  },
  Output: {
    object: (config: unknown) => config,
  },
  jsonSchema: (schema: unknown) => ({ wrapped: schema }),
}));

const { generateStructured } = await import("./LLMClient");

test("generateStructured maps prompt/completion token usage", async () => {
  calls.length = 0;
  generateTextImpl = async () => ({
    output: { title: "ok" },
    usage: { promptTokens: 2, completionTokens: 3, totalTokens: 9 },
  });

  const result = await generateStructured({
    model: {},
    schema: { type: "object" },
    system: "sys",
    user: "prompt",
  });

  expect(result.usage).toEqual({ inputTokens: 2, outputTokens: 3, totalTokens: 9 });
  expect(calls[0]?.output).toEqual({ schema: { wrapped: { type: "object" } }, name: "extract" });
  expect(calls[0]?.messages[0]).toEqual({ role: "user", content: "prompt" });
});

test("generateStructured uses explicit messages and totals usage", async () => {
  calls.length = 0;
  const messages: ModelMessage[] = [{ role: "user", content: "custom" }];
  generateTextImpl = async (params) => ({
    output: { title: "ok" },
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
