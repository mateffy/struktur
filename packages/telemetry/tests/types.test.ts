/**
 * Unit tests for core telemetry types
 */

import { test, expect, describe } from "bun:test";
import {
  NoopTelemetryAdapter,
  type SpanContext,
  type SpanResult,
  type LLMCallEvent,
  type ValidationEvent,
  type ChunkEvent,
  type ToolCallEvent,
  type MergeEvent,
  type ParseEvent,
} from "../src/types.js";

describe("NoopTelemetryAdapter", () => {
  test("should create noop adapter", () => {
    const adapter = new NoopTelemetryAdapter();

    expect(adapter.name).toBe("noop");
    expect(adapter.version).toBe("1.0.0");
  });

  test("should initialize without error", async () => {
    const adapter = new NoopTelemetryAdapter();
    await expect(adapter.initialize()).resolves.toBeUndefined();
  });

  test("should shutdown without error", async () => {
    const adapter = new NoopTelemetryAdapter();
    await expect(adapter.shutdown()).resolves.toBeUndefined();
  });

  test("should create spans", () => {
    const adapter = new NoopTelemetryAdapter();

    const context: SpanContext = {
      name: "test-span",
      kind: "CHAIN",
      attributes: { test: true },
    };

    const span = adapter.startSpan(context);

    expect(span.id).toBeDefined();
    expect(span.name).toBe("test-span");
    expect(span.kind).toBe("CHAIN");
    expect(span.traceId).toBeDefined();
    expect(span.startTime).toBeGreaterThan(0);
  });

  test("should create child spans", () => {
    const adapter = new NoopTelemetryAdapter();

    const parentContext: SpanContext = {
      name: "parent",
      kind: "CHAIN",
    };

    const parentSpan = adapter.startSpan(parentContext);

    const childContext: SpanContext = {
      name: "child",
      kind: "LLM",
      parentSpan,
    };

    const childSpan = adapter.startSpan(childContext);

    expect(childSpan.parentId).toBe(parentSpan.id);
    // Noop adapter creates new traceIds for each span
    expect(childSpan).toBeDefined();
    expect(parentSpan).toBeDefined();
  });

  test("should end spans without error", () => {
    const adapter = new NoopTelemetryAdapter();

    const span = adapter.startSpan({
      name: "test",
      kind: "CHAIN",
    });

    const result: SpanResult = {
      status: "ok",
      output: { data: "test" },
      latencyMs: 100,
    };

    expect(() => adapter.endSpan(span, result)).not.toThrow();
  });

  test("should record events without error", () => {
    const adapter = new NoopTelemetryAdapter();

    const span = adapter.startSpan({
      name: "test",
      kind: "LLM",
    });

    const event: LLMCallEvent = {
      type: "llm_call",
      model: "gpt-4o",
      provider: "openai",
      input: {
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.5,
        maxTokens: 100,
      },
      output: {
        content: "Hi there!",
        usage: { input: 10, output: 5, total: 15 },
      },
      latencyMs: 250,
    };

    expect(() => adapter.recordEvent(span, event)).not.toThrow();
  });

  test("should set attributes without error", () => {
    const adapter = new NoopTelemetryAdapter();

    const span = adapter.startSpan({
      name: "test",
      kind: "CHAIN",
    });

    expect(() => adapter.setAttributes(span, { key: "value", num: 42 })).not.toThrow();
  });

  test("should set context without error", () => {
    const adapter = new NoopTelemetryAdapter();

    expect(() =>
      adapter.setContext({
        sessionId: "session-123",
        userId: "user-456",
        metadata: { source: "test" },
        tags: ["test", "unit"],
      }),
    ).not.toThrow();
  });

  test("should handle error results", () => {
    const adapter = new NoopTelemetryAdapter();

    const span = adapter.startSpan({
      name: "test",
      kind: "LLM",
    });

    const result: SpanResult = {
      status: "error",
      error: new Error("Test error"),
    };

    expect(() => adapter.endSpan(span, result)).not.toThrow();
  });

  test("should handle all event types", () => {
    const adapter = new NoopTelemetryAdapter();

    const span = adapter.startSpan({
      name: "test",
      kind: "CHAIN",
    });

    // LLM call event
    const llmEvent: LLMCallEvent = {
      type: "llm_call",
      model: "gpt-4o",
      provider: "openai",
      input: {
        messages: [{ role: "user", content: "Hello" }],
      },
      output: {
        content: "Hi",
        usage: { input: 5, output: 2, total: 7 },
      },
      latencyMs: 100,
    };

    expect(() => adapter.recordEvent(span, llmEvent)).not.toThrow();

    // Validation event
    const validationEvent: ValidationEvent = {
      type: "validation",
      attempt: 1,
      maxAttempts: 3,
      schema: { type: "object" },
      input: { data: "test" },
      success: true,
      latencyMs: 50,
    };

    expect(() => adapter.recordEvent(span, validationEvent)).not.toThrow();

    // Chunk event
    const chunkEvent: ChunkEvent = {
      type: "chunk",
      chunkIndex: 0,
      totalChunks: 5,
      tokens: 1000,
      images: 2,
    };

    expect(() => adapter.recordEvent(span, chunkEvent)).not.toThrow();

    // Tool call event
    const toolEvent: ToolCallEvent = {
      type: "tool_call",
      toolName: "read",
      args: { file_path: "/test.txt" },
      result: "file contents",
      latencyMs: 25,
    };

    expect(() => adapter.recordEvent(span, toolEvent)).not.toThrow();

    // Merge event
    const mergeEvent: MergeEvent = {
      type: "merge",
      strategy: "parallel",
      inputCount: 5,
      outputCount: 4,
      deduped: 1,
    };

    expect(() => adapter.recordEvent(span, mergeEvent)).not.toThrow();

    // Parse event
    const parseEvent: ParseEvent = {
      type: "parse",
      mimeType: "application/pdf",
      parser: "pdf-parse",
      inputSize: 1024,
      outputTokens: 500,
      outputImages: 0,
      latencyMs: 200,
    };

    expect(() => adapter.recordEvent(span, parseEvent)).not.toThrow();
  });
});
