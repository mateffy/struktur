/**
 * @struktur/telemetry
 * 
 * Telemetry and observability for Struktur structured data extraction.
 * Supports multiple providers including Phoenix (Arize) and Langfuse.
 * 
 * @example
 * ```typescript
 * import { createPhoenixTelemetry } from "@struktur/telemetry";
 * 
 * const telemetry = await createPhoenixTelemetry({
 *   projectName: "my-app",
 *   url: "http://localhost:6006",
 * });
 * 
 * await extract({ artifacts, schema, telemetry });
 * ```
 */

// Core types
export type {
  TelemetryAdapter,
  SpanContext,
  Span,
  SpanKind,
  SpanResult,
  TelemetryContext,
  TelemetryEvent,
  LLMCallEvent,
  ValidationEvent,
  ChunkEvent,
  ToolCallEvent,
  MergeEvent,
  ParseEvent,
  TokenUsage,
  TelemetryOptions,
  PhoenixConfig,
  LangfuseConfig,
} from "./types.js";

export { NoopTelemetryAdapter } from "./types.js";

// Factory functions
export {
  createTelemetry,
  createPhoenixTelemetry,
  createLangfuseTelemetry,
  createNoopTelemetry,
} from "./factory.js";

// Phoenix adapter
export { PhoenixAdapter, createPhoenixAdapter } from "./adapters/phoenix/index.js";

// Langfuse adapter
export { LangfuseAdapter, createLangfuseAdapter } from "./adapters/langfuse/index.js";
