import { test, expect, describe } from "bun:test";
import { MockLanguageModelV3 } from "ai/test";
import { extract } from "../../extract";
import { agent } from "./AgentStrategy";
import { createValidator, SchemaValidationError } from "../../validation/validator";
import type { Artifact } from "../../types";

// ---------------------------------------------------------------------------
// Scripted model
//
// The agent's validation cannot be covered by pure-function tests: the tool
// schemas, the self-repair round and the finish nudge only exist inside the
// step loop. `MockLanguageModelV3` replays a fixed list of responses, so the
// loop can be driven deterministically without a provider.
// ---------------------------------------------------------------------------

const usage = () => ({
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 10, text: 10, reasoning: 0 },
});

const text = (t: string) => ({ type: "text" as const, text: t });
const call = (id: string, toolName: string, input: unknown) => ({
  type: "tool-call" as const,
  toolCallId: id,
  toolName,
  input: JSON.stringify(input),
});
const set = (id: string, data: unknown) => call(id, "set_output_data", { data });
const update = (id: string, changes: unknown) => call(id, "update_output_data", { changes });
const step = (content: unknown[], finish = "tool-calls") => ({
  content,
  finishReason: { unified: finish, raw: finish },
  usage: usage(),
  warnings: [],
});

/** Replays the responses in order, repeating the last one. */
const scripted = (responses: unknown[]) => {
  let i = 0;
  return new MockLanguageModelV3({
    doGenerate: () => responses[Math.min(i++, responses.length - 1)] as never,
  });
};

const artifact: Artifact = {
  id: "artifact-1",
  type: "text",
  raw: async () => Buffer.from("doc", "utf8"),
  contents: [{ text: "Bürohaus mit Büro im EG und Archiv im Untergeschoss." }],
};

const schema = {
  type: "object",
  required: ["name", "unit"],
  properties: {
    name: { type: "string" },
    unit: {
      type: "object",
      required: ["label", "usages"],
      properties: {
        label: { type: "string" },
        usages: { type: "array", items: { type: "string", enum: ["office", "storage"] } },
      },
    },
  },
};

const usagesOf = (data: unknown): string[] =>
  ((data as { unit?: { usages?: string[] } })?.unit?.usages ?? []) as string[];

const validates = (data: unknown): boolean => {
  try {
    createValidator(schema).validateOrThrow(data);
    return true;
  } catch {
    return false;
  }
};

const run = async (model: unknown, options: { strict?: boolean } = {}) => {
  const events = { retries: 0, nudges: 0 };
  const result = await extract({
    artifacts: [artifact],
    schema: schema as never,
    strategy: agent({ model: model as never, maxSteps: 40 }),
    strict: options.strict,
    events: {
      onRetry: () => {
        events.retries += 1;
      },
      onMessage: (message) => {
        if (
          typeof message.content === "string" &&
          message.content.includes("You have not called finish()")
        ) {
          events.nudges += 1;
        }
      },
    },
  });
  return { result, ...events };
};

describe("agent strategy output validation", () => {
  test("rejects an out-of-enum value at the tool call and repairs it", async () => {
    const model = scripted([
      step([set("c1", { name: "X", unit: { label: "Archiv", usages: ["archive"] } })]),
      step([set("c2", { name: "X", unit: { label: "Archiv", usages: ["office"] } })]),
      step([call("c3", "finish", {})]),
    ]);

    const { result } = await run(model);

    expect(result.error).toBeUndefined();
    expect(validates(result.data)).toBe(true);
    expect(usagesOf(result.data)).toEqual(["office"]);
    // The invalid call was rejected by the tool schema, so the model needed a
    // third call to produce the valid payload.
    expect((model as unknown as { doGenerateCalls: unknown[] }).doGenerateCalls).toHaveLength(3);
  });

  test("rejects a wrongly typed value at the tool call and repairs it", async () => {
    const model = scripted([
      step([set("c1", { name: 123, unit: { label: "A", usages: ["office"] } })]),
      step([set("c2", { name: "X", unit: { label: "A", usages: ["office"] } })]),
      step([call("c3", "finish", {})]),
    ]);

    const { result } = await run(model);

    expect(result.error).toBeUndefined();
    expect(validates(result.data)).toBe(true);
    expect(typeof (result.data as { name?: unknown }).name).toBe("string");
  });

  test("validates on finish and lets the agent repair an incomplete object in strict mode", async () => {
    const model = scripted([
      step([set("c1", { name: "X" })]),
      step([call("c2", "finish", {})]),
      step([update("c3", { unit: { label: "Archiv", usages: ["office"] } })]),
      step([call("c4", "finish", {})]),
    ]);

    const { result, retries } = await run(model, { strict: true });

    expect(result.error).toBeUndefined();
    expect(validates(result.data)).toBe(true);
    expect(retries).toBeGreaterThanOrEqual(1);
  });

  test("fails with SchemaValidationError instead of returning invalid data", async () => {
    const model = scripted([
      step([set("c1", { name: "X" })]),
      step([call("c2", "finish", {})]),
      step([call("c3", "finish", {})]),
      step([call("c4", "finish", {})]),
    ]);

    const { result, retries } = await run(model, { strict: true });

    expect(result.error).toBeInstanceOf(SchemaValidationError);
    expect(result.data).toBeNull();
    expect(retries).toBe(3);
  });

  test("nudges the agent to finish when it answers with text and no tool call", async () => {
    const model = scripted([
      step([set("c1", { name: "X", unit: { label: "A", usages: ["office"] } })]),
      step([text("Here is a summary of the findings.")], "stop"),
      step([call("c2", "finish", {})]),
    ]);

    const { result, nudges } = await run(model);

    expect(result.error).toBeUndefined();
    expect(validates(result.data)).toBe(true);
    expect(nudges).toBeGreaterThanOrEqual(1);
  });

  test("caps the finish nudge and still returns accumulated valid output", async () => {
    const model = scripted([
      step([set("c1", { name: "X", unit: { label: "A", usages: ["office"] } })]),
      step([text("Summary.")], "stop"),
    ]);

    const { result, nudges } = await run(model);

    expect(result.error).toBeUndefined();
    expect(validates(result.data)).toBe(true);
    expect(nudges).toBe(3);
  });
});
