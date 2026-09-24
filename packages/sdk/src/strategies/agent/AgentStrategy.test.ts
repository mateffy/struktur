import { test, expect, describe } from "bun:test";
import { agent, AgentStrategy, buildOutputDataSchema, resolveFailureReason } from "./AgentStrategy";

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

test("resolveFailureReason keeps the reason the fail tool recorded", () => {
  // The fail tool stores its reason itself. The tool's return value carries none,
  // so resolving off it reported every failure as "Unknown error".
  expect(resolveFailureReason("fail", "no images in the document", undefined)).toBe(
    "no images in the document",
  );
});

test("resolveFailureReason falls back to the tool-call input", () => {
  expect(resolveFailureReason("fail", null, { reason: "schema does not match" })).toBe(
    "schema does not match",
  );
});

test("resolveFailureReason reports unknown only when no reason exists", () => {
  expect(resolveFailureReason("fail", null, {})).toBe("Unknown error");
  expect(resolveFailureReason("fail", null, undefined)).toBe("Unknown error");
  expect(resolveFailureReason("fail", null, { reason: "" })).toBe("Unknown error");
});

test("resolveFailureReason explains a finish call that produced no data", () => {
  expect(resolveFailureReason("finish", null, undefined)).toBe(
    "finish called without setting output data first",
  );
});

describe("buildOutputDataSchema", () => {
  const schema = {
    type: "object",
    required: ["units"],
    properties: {
      units: {
        type: "array",
        items: {
          type: "object",
          required: ["label", "usages"],
          properties: {
            label: { type: "string" },
            usages: { type: "array", items: { type: "string", enum: ["office", "storage"] } },
          },
        },
      },
    },
  };

  test("rejects values outside the schema enum", () => {
    const parsed = buildOutputDataSchema(schema).safeParse({
      units: [{ label: "Archiv", usages: ["archive"] }],
    });

    expect(parsed.success).toBe(false);
  });

  test("accepts output that is still incomplete", () => {
    const zod = buildOutputDataSchema(schema);

    expect(zod.safeParse({}).success).toBe(true);
    expect(zod.safeParse({ units: [{ label: "Archiv", usages: ["office"] }] }).success).toBe(true);
  });

  test("rejects values of the wrong type", () => {
    const parsed = buildOutputDataSchema(schema).safeParse({
      units: [{ label: "A", usages: [1] }],
    });

    expect(parsed.success).toBe(false);
  });
});
