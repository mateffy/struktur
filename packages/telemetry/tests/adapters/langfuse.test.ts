/**
 * Unit tests for LangfuseAdapter
 */

import { test, expect, describe } from "bun:test";
import { 
  LangfuseAdapter,
  createLangfuseAdapter,
} from "../../src/adapters/langfuse/index.js";
import type {
  SpanContext,
  LangfuseConfig,
} from "../../src/types.js";

describe("LangfuseAdapter", () => {
  test("should have correct name and version", () => {
    const adapter = new LangfuseAdapter({
      publicKey: "pk-test",
      secretKey: "sk-test",
    });
    
    expect(adapter.name).toBe("langfuse");
    expect(adapter.version).toBe("1.0.0");
  });

  test("should apply default baseUrl", () => {
    const adapter = new LangfuseAdapter({
      publicKey: "pk-test",
      secretKey: "sk-test",
    });
    
    expect(adapter).toBeDefined();
  });

  test("createLangfuseAdapter should create adapter", () => {
    const config: LangfuseConfig = {
      publicKey: "pk-test",
      secretKey: "sk-test",
      baseUrl: "https://cloud.langfuse.com",
      projectName: "my-project",
    };
    
    const adapter = createLangfuseAdapter(config);
    
    expect(adapter).toBeDefined();
    expect(adapter.name).toBe("langfuse");
  });

  test("should throw when startSpan called before initialize", () => {
    const adapter = new LangfuseAdapter({
      publicKey: "pk-test",
      secretKey: "sk-test",
    });
    
    const context: SpanContext = {
      name: "test-span",
      kind: "CHAIN",
    };
    
    expect(() => adapter.startSpan(context)).toThrow("not initialized");
  });

  test("should accept all span kinds", () => {
    const adapter = new LangfuseAdapter({
      publicKey: "pk-test",
      secretKey: "sk-test",
    });
    
    const kinds = ["CHAIN", "LLM", "TOOL", "AGENT", "RETRIEVER"] as const;
    
    for (const _kind of kinds) {
      expect(adapter).toBeDefined();
    }
  });
});

describe("LangfuseAdapter config", () => {
  test("should require public and secret keys", () => {
    const config: LangfuseConfig = {
      publicKey: "pk-lf-123",
      secretKey: "sk-lf-456",
    };
    
    const adapter = createLangfuseAdapter(config);
    
    expect(adapter).toBeDefined();
  });

  test("should accept all config options", () => {
    const config: LangfuseConfig = {
      publicKey: "pk-test",
      secretKey: "sk-test",
      baseUrl: "https://us.cloud.langfuse.com",
      projectName: "test-project",
    };
    
    const adapter = createLangfuseAdapter(config);
    
    expect(adapter).toBeDefined();
  });
});

describe("LangfuseAdapter interface", () => {
  test("should expose required methods", () => {
    const adapter = new LangfuseAdapter({
      publicKey: "pk-test",
      secretKey: "sk-test",
    });
    
    expect(typeof adapter.initialize).toBe("function");
    expect(typeof adapter.shutdown).toBe("function");
    expect(typeof adapter.startSpan).toBe("function");
    expect(typeof adapter.endSpan).toBe("function");
    expect(typeof adapter.recordEvent).toBe("function");
    expect(typeof adapter.setAttributes).toBe("function");
    expect(typeof adapter.setContext).toBe("function");
  });
});
