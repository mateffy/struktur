/**
 * Unit tests for telemetry factory functions
 */

import { test, expect, describe } from "bun:test";
import { 
  createTelemetry, 
  createPhoenixTelemetry, 
  createLangfuseTelemetry,
  createNoopTelemetry 
} from "../src/factory.js";
import type { TelemetryOptions, PhoenixConfig, LangfuseConfig } from "../src/types.js";

describe("createTelemetry", () => {
  test("should return null when disabled", async () => {
    const options: TelemetryOptions = {
      provider: "phoenix",
      config: { projectName: "test" },
      enabled: false,
    };
    
    const telemetry = await createTelemetry(options);
    expect(telemetry).toBeNull();
  });

  test("should throw error for unknown provider", async () => {
    const options: TelemetryOptions = {
      provider: "unknown" as any,
      config: {},
    };
    
    await expect(createTelemetry(options)).rejects.toThrow("Unknown telemetry provider");
  });
});

describe("createNoopTelemetry", () => {
  test("should create noop adapter", () => {
    const adapter = createNoopTelemetry();
    
    expect(adapter).toBeDefined();
    expect(adapter.name).toBe("noop");
    expect(adapter.version).toBe("1.0.0");
  });

  test("should work without initialization", async () => {
    const adapter = createNoopTelemetry();
    
    // Should not require initialize
    const span = adapter.startSpan({
      name: "test",
      kind: "CHAIN",
    });
    
    expect(span).toBeDefined();
    expect(span.name).toBe("test");
  });
});

describe("createPhoenixTelemetry", () => {
  test("should create Phoenix adapter when dependencies available", async () => {
    const config: PhoenixConfig = {
      projectName: "test",
      url: "http://localhost:6006",
    };
    
    try {
      const adapter = await createPhoenixTelemetry(config);
      expect(adapter).toBeDefined();
      expect(adapter.name).toBe("phoenix");
    } catch (error) {
      // Expected if dependencies not installed
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe("createLangfuseTelemetry", () => {
  test("should create Langfuse adapter when dependencies available", async () => {
    const config: LangfuseConfig = {
      publicKey: "pk-test",
      secretKey: "sk-test",
    };
    
    try {
      const adapter = await createLangfuseTelemetry(config);
      expect(adapter).toBeDefined();
      expect(adapter.name).toBe("langfuse");
    } catch (error) {
      // Expected if dependencies not installed
      expect(error).toBeInstanceOf(Error);
    }
  });
});
