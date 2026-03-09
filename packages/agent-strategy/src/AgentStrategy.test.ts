import { test, expect } from "bun:test";
import { agent, AgentStrategy } from "./AgentStrategy";
import type { Artifact } from "@struktur/sdk";

// Mock model for testing
const createMockModel = (response: string) => {
  return {
    modelId: "mock-model",
    specification: {
      async generate() {
        return {
          text: response,
          usage: {
            promptTokens: 100,
            completionTokens: 50,
            totalTokens: 150,
          },
        };
      },
    },
  };
};

test("AgentStrategy has correct name", () => {
  const strategy = new AgentStrategy<{ name: string }>({
    model: createMockModel('{"name": "test"}'),
  });
  expect(strategy.name).toBe("agent");
});

test("AgentStrategy getEstimatedSteps returns maxSteps", () => {
  const strategy1 = new AgentStrategy<{ name: string }>({
    model: createMockModel('{"name": "test"}'),
    maxSteps: 30,
  });
  expect(strategy1.getEstimatedSteps()).toBe(30);

  const strategy2 = new AgentStrategy<{ name: string }>({
    model: createMockModel('{"name": "test"}'),
  });
  expect(strategy2.getEstimatedSteps()).toBe(50); // default
});

test("agent factory function creates AgentStrategy", () => {
  const strategy = agent<{ name: string }>({
    model: createMockModel('{"name": "test"}'),
    maxSteps: 25,
  });

  expect(strategy).toBeInstanceOf(AgentStrategy);
  expect(strategy.name).toBe("agent");
  expect(strategy.getEstimatedSteps()).toBe(25);
});

test("AgentStrategy accepts all config options", () => {
  const strategy = agent<{ name: string }>({
    model: createMockModel('{"name": "test"}'),
    maxSteps: 100,
    outputInstructions: "Extract the user name",
    systemPrompt: "Custom prompt",
    apiKey: "test-key",
    provider: "anthropic",
    modelId: "claude-sonnet-4",
    verbose: true,
  });

  expect(strategy).toBeInstanceOf(AgentStrategy);
  expect(strategy.name).toBe("agent");
});
