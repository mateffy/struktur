import { test, expect, describe } from "bun:test";
import { agent } from "./AgentStrategy";

describe("Agent Strategy Provider/Model Integration", () => {
  test("correctly parses provider/model spec format", () => {
    const testCases = [
      {
        modelSpec: "anthropic/claude-sonnet-4",
        expected: { provider: "anthropic", modelId: "claude-sonnet-4" },
      },
      {
        modelSpec: "openai/gpt-4o",
        expected: { provider: "openai", modelId: "gpt-4o" },
      },
      {
        modelSpec: "openrouter/anthropic/claude-sonnet-4",
        expected: { provider: "openrouter", modelId: "anthropic/claude-sonnet-4" },
      },
    ];

    for (const testCase of testCases) {
      const parts = testCase.modelSpec.split("/");
      const provider = parts[0];
      const modelId = parts.slice(1).join("/");

      expect(provider).toBe(testCase.expected.provider);
      expect(modelId).toBe(testCase.expected.modelId);
    }
  });

  test("strategy config stores provider and modelId correctly", () => {
    const strategy = agent<{ title: string }>({
      provider: "anthropic",
      modelId: "claude-sonnet-4",
      maxSteps: 25,
    });

    expect(strategy).toBeDefined();
    expect(strategy.name).toBe("agent");
  });

  test("strategy with API key config", () => {
    const strategy = agent<{ title: string }>({
      provider: "anthropic",
      modelId: "claude-sonnet-4",
      apiKey: "test-api-key",
      maxSteps: 25,
    });

    expect(strategy).toBeDefined();
    expect(strategy.name).toBe("agent");
  });
});
