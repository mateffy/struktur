import { test, expect } from "bun:test";
import { agent, AgentStrategy } from "@struktur/sdk";

test("agent strategy is exported from @struktur/sdk", () => {
  expect(agent).toBeDefined();
  expect(typeof agent).toBe("function");
});

test("AgentStrategy class is exported from @struktur/sdk", () => {
  const strategy = agent({
    provider: "anthropic",
    modelId: "claude-sonnet-4",
    maxSteps: 10,
  });
  expect(strategy).toBeInstanceOf(AgentStrategy);
  expect(strategy.name).toBe("agent");
});
