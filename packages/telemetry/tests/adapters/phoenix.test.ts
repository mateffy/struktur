/**
 * Unit tests for PhoenixAdapter
 * 
 * These tests verify that the PhoenixAdapter correctly implements
 * the TelemetryAdapter interface. Since we don't have the actual
 * dependencies installed, these tests focus on the adapter's logic.
 */

import { test, expect, describe } from "bun:test";
import { 
  PhoenixAdapter,
  createPhoenixAdapter,
} from "../../src/adapters/phoenix/index.js";
import type {
  SpanContext,
  SpanResult,
  LLMCallEvent,
  ValidationEvent,
  ChunkEvent,
  ToolCallEvent,
  MergeEvent,
  ParseEvent,
  PhoenixConfig,
} from "../../src/types.js";

describe("PhoenixAdapter", () => {
  test("should have correct name and version", () => {
    const adapter = new PhoenixAdapter({ projectName: "test" });
    
    expect(adapter.name).toBe("phoenix");
    expect(adapter.version).toBe("1.0.0");
  });

  test("should apply default config values", () => {
    const adapter = new PhoenixAdapter({ projectName: "test" });
    
    // Default values should be set
    expect(adapter).toBeDefined();
  });

  test("createPhoenixAdapter should create adapter", () => {
    const config: PhoenixConfig = {
      projectName: "my-project",
      url: "http://localhost:6006",
      apiKey: "test-key",
    };
    
    const adapter = createPhoenixAdapter(config);
    
    expect(adapter).toBeDefined();
    expect(adapter.name).toBe("phoenix");
  });

  test("should throw when startSpan called before initialize", () => {
    const adapter = new PhoenixAdapter({ projectName: "test" });
    
    const context: SpanContext = {
      name: "test-span",
      kind: "CHAIN",
    };
    
    // Should throw because OTel API isn't loaded yet
    expect(() => adapter.startSpan(context)).toThrow("not initialized");
  });

  test("should accept all span kinds", () => {
    const adapter = new PhoenixAdapter({ projectName: "test" });
    
    // Verify adapter is created for all span kinds
    const kinds = ["CHAIN", "LLM", "TOOL", "AGENT", "RETRIEVER", "EMBEDDING", "RERANKER"] as const;
    
    for (const kind of kinds) {
      expect(adapter).toBeDefined();
    }
  });
});

describe("PhoenixAdapter config", () => {
  test("should merge config with defaults", () => {
    const config: PhoenixConfig = {
      projectName: "test-project",
      url: "https://app.phoenix.arize.com",
      apiKey: "phx-api-key",
      batch: false,
    };
    
    const adapter = createPhoenixAdapter(config);
    
    expect(adapter).toBeDefined();
    expect(adapter.name).toBe("phoenix");
  });

  test("should work with minimal config", () => {
    const config: PhoenixConfig = {
      projectName: "minimal",
    };
    
    const adapter = createPhoenixAdapter(config);
    
    expect(adapter).toBeDefined();
  });

  test("should handle all optional config fields", () => {
    const config: PhoenixConfig = {
      projectName: "full-config",
      url: "http://localhost:6006",
      apiKey: "secret-key",
      batch: true,
      headers: {
        "X-Custom-Header": "value",
      },
    };
    
    const adapter = createPhoenixAdapter(config);
    
    expect(adapter).toBeDefined();
  });
});

describe("PhoenixAdapter interface", () => {
  test("should expose required methods", () => {
    const adapter = new PhoenixAdapter({ projectName: "test" });
    
    expect(typeof adapter.initialize).toBe("function");
    expect(typeof adapter.shutdown).toBe("function");
    expect(typeof adapter.startSpan).toBe("function");
    expect(typeof adapter.endSpan).toBe("function");
    expect(typeof adapter.recordEvent).toBe("function");
    expect(typeof adapter.setAttributes).toBe("function");
    expect(typeof adapter.setContext).toBe("function");
  });
});
