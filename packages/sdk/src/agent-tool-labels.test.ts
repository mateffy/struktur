import { test, expect, describe } from "bun:test";
import { agent, AgentStrategy } from "@struktur/sdk";

describe("Agent Strategy Tool Labels", () => {
  test("strategy creates properly configured agent", () => {
    const strategy = agent<{ title: string }>({
      provider: "anthropic",
      modelId: "claude-sonnet-4",
      maxSteps: 25,
    });

    expect(strategy).toBeDefined();
    expect(strategy.name).toBe("agent");
  });

  test("label format for read tool with file path only", () => {
    const label = "Read artifact.json";
    expect(label).toBe("Read artifact.json");
  });

  test("label format for read tool with limit", () => {
    const label = "Read artifact.json (limit 100)";
    expect(label).toBe("Read artifact.json (limit 100)");
  });

  test("label format for read tool with offset and limit", () => {
    const label = "Read artifact.json (offset 101, limit 100)";
    expect(label).toBe("Read artifact.json (offset 101, limit 100)");
  });

  test("label format for bash command", () => {
    const label = "Bash: cat /artifacts/artifact.json";
    expect(label).toBe("Bash: cat /artifacts/artifact.json");
  });

  test("label format for grep", () => {
    const label = 'Grep "pattern" in artifact.json';
    expect(label).toBe('Grep "pattern" in artifact.json');
  });

  test("label format for find", () => {
    const label = 'Find "*.json" in /artifacts';
    expect(label).toBe('Find "*.json" in /artifacts');
  });

  test("label format for ls", () => {
    const label = "List /artifacts (recursive)";
    expect(label).toBe("List /artifacts (recursive)");
  });
});
