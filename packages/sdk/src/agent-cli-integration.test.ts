import { test, expect, describe } from "bun:test";
import { agent, AgentStrategy } from "@struktur/sdk";

describe("Agent Strategy CLI Integration", () => {
  test("agent strategy accepts provider and modelId", () => {
    const strategy = agent<{ name: string }>({
      provider: "anthropic",
      modelId: "claude-sonnet-4",
      maxSteps: 30,
    });

    expect(strategy).toBeInstanceOf(AgentStrategy);
    expect(strategy.name).toBe("agent");
    expect(strategy.getEstimatedSteps()).toBe(30);
  });

  test("agent strategy works with openai", () => {
    const strategy = agent<{ name: string }>({
      provider: "openai",
      modelId: "gpt-4o",
      maxSteps: 50,
    });

    expect(strategy).toBeInstanceOf(AgentStrategy);
    expect(strategy.name).toBe("agent");
  });

  test("agent strategy works with openrouter nested paths", () => {
    const strategy = agent<{ name: string }>({
      provider: "openrouter",
      modelId: "anthropic/claude-sonnet-4",
      maxSteps: 50,
    });

    expect(strategy).toBeInstanceOf(AgentStrategy);
    expect(strategy.name).toBe("agent");
  });

  test("agent strategy uses default maxSteps", () => {
    const strategy = agent<{ name: string }>({
      provider: "anthropic",
      modelId: "claude-sonnet-4",
    });

    expect(strategy.getEstimatedSteps()).toBe(50);
  });
});
