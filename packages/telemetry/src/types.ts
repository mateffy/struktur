/**
 * Core telemetry types and interfaces for Struktur
 * 
 * This module defines the TelemetryAdapter interface that all telemetry providers
 * must implement. The SDK uses this interface to emit telemetry events without
 * knowing about specific provider implementations.
 */

/**
 * Represents the different kinds of spans that can be created during extraction
 */
export type SpanKind = 
  | "CHAIN"      // Extraction pipeline, strategies
  | "LLM"        // LLM calls (generateText, generateObject)
  | "TOOL"       // Agent tool calls (bash, read, etc.)
  | "AGENT"      // Agent strategy execution
  | "RETRIEVER"  // Document parsing, chunking
  | "EMBEDDING"  // Vector embeddings (future)
  | "RERANKER";  // Reranking (future)

/**
 * Context for creating a new span
 */
export interface SpanContext {
  /** Human-readable name for the span */
  name: string;
  
  /** Type of span */
  kind: SpanKind;
  
  /** Parent span for creating hierarchical traces */
  parentSpan?: Span;
  
  /** Initial attributes to set on the span */
  attributes?: Record<string, unknown>;
  
  /** Start time (defaults to now) */
  startTime?: number;
}

/**
 * Represents an active span in the telemetry system
 */
export interface Span {
  /** Unique identifier for this span */
  id: string;
  
  /** Trace identifier that groups related spans */
  traceId: string;
  
  /** Human-readable name */
  name: string;
  
  /** Type of span */
  kind: SpanKind;
  
  /** Unix timestamp when span started */
  startTime: number;
  
  /** Parent span ID (if any) */
  parentId?: string;
}

/**
 * Result of a completed span
 */
export interface SpanResult {
  /** Whether the operation succeeded or failed */
  status: "ok" | "error";
  
  /** Error details if status is "error" */
  error?: Error;
  
  /** Output data from the operation */
  output?: unknown;
  
  /** Latency in milliseconds */
  latencyMs?: number;
}

/**
 * Context that applies to all spans in a trace
 */
export interface TelemetryContext {
  /** Session identifier for grouping related extractions */
  sessionId?: string;
  
  /** User identifier */
  userId?: string;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Token usage information from LLM calls
 */
export interface TokenUsage {
  /** Input/prompt tokens */
  input: number;
  
  /** Output/completion tokens */
  output: number;
  
  /** Total tokens (input + output) */
  total: number;
}

/**
 * Event emitted when an LLM call is made
 */
export interface LLMCallEvent {
  type: "llm_call";
  
  /** Model identifier (e.g., "gpt-4o", "claude-3-opus") */
  model: string;
  
  /** Provider name (e.g., "openai", "anthropic") */
  provider: string;
  
  /** Input parameters */
  input: {
    /** Messages sent to the LLM */
    messages: Array<{ role: string; content: string }>;
    
    /** Temperature parameter (if set) */
    temperature?: number;
    
    /** Max tokens parameter (if set) */
    maxTokens?: number;
    
    /** JSON schema for structured output (if set) */
    schema?: unknown;
  };
  
  /** Output from the LLM (if successful) */
  output?: {
    /** Raw content from the LLM */
    content: string;
    
    /** Whether this was structured (JSON) output */
    structured?: boolean;
    
    /** Token usage information */
    usage?: TokenUsage;
  };
  
  /** Latency in milliseconds */
  latencyMs: number;
  
  /** Error if the call failed */
  error?: Error;
}

/**
 * Event emitted during schema validation
 */
export interface ValidationEvent {
  type: "validation";
  
  /** Current attempt number */
  attempt: number;
  
  /** Maximum allowed attempts */
  maxAttempts: number;
  
  /** Schema being validated against */
  schema: unknown;
  
  /** Input data being validated */
  input: unknown;
  
  /** Whether validation succeeded */
  success: boolean;
  
  /** Validation errors (if failed) */
  errors?: Array<{ path: string; message: string }>;
  
  /** Latency in milliseconds */
  latencyMs?: number;
}

/**
 * Event emitted when chunking documents
 */
export interface ChunkEvent {
  type: "chunk";
  
  /** Index of this chunk (0-based) */
  chunkIndex: number;
  
  /** Total number of chunks */
  totalChunks: number;
  
  /** Number of tokens in this chunk */
  tokens: number;
  
  /** Number of images in this chunk */
  images: number;
  
  /** Preview of chunk content (optional) */
  content?: string;
}

/**
 * Event emitted when agent tools are called
 */
export interface ToolCallEvent {
  type: "tool_call";
  
  /** Name of the tool */
  toolName: string;
  
  /** Arguments passed to the tool */
  args: Record<string, unknown>;
  
  /** Result from the tool (if successful) */
  result?: unknown;
  
  /** Error if the tool failed */
  error?: Error;
  
  /** Latency in milliseconds */
  latencyMs?: number;
}

/**
 * Event emitted when merging results from multiple chunks
 */
export interface MergeEvent {
  type: "merge";
  
  /** Merge strategy used */
  strategy: string;
  
  /** Number of input items merged */
  inputCount: number;
  
  /** Number of items after merge */
  outputCount: number;
  
  /** Number of items removed during deduplication (if applicable) */
  deduped?: number;
}

/**
 * Event emitted when parsing input files
 */
export interface ParseEvent {
  type: "parse";
  
  /** MIME type of the file */
  mimeType: string;
  
  /** Parser used (e.g., "pdf-parse", "text") */
  parser: string;
  
  /** Input file size in bytes */
  inputSize: number;
  
  /** Number of tokens in output */
  outputTokens: number;
  
  /** Number of images extracted */
  outputImages: number;
  
  /** Latency in milliseconds */
  latencyMs: number;
}

/**
 * All possible telemetry events
 */
export type TelemetryEvent =
  | LLMCallEvent
  | ValidationEvent
  | ChunkEvent
  | ToolCallEvent
  | MergeEvent
  | ParseEvent;

/**
 * Interface that all telemetry adapters must implement.
 * This allows the SDK to emit telemetry without knowing about specific providers.
 */
export interface TelemetryAdapter {
  /** Provider name */
  readonly name: string;
  
  /** Adapter version */
  readonly version: string;
  
  /**
   * Initialize the telemetry adapter.
   * Must be called before any other operations.
   */
  initialize(): Promise<void>;
  
  /**
   * Shutdown the telemetry adapter.
   * Flushes any pending telemetry data.
   */
  shutdown(): Promise<void>;
  
  /**
   * Start a new span.
   * @param context - Span creation context
   * @returns The created span
   */
  startSpan(context: SpanContext): Span;
  
  /**
   * End a span and record its result.
   * @param span - Span to end
   * @param result - Optional result of the operation
   */
  endSpan(span: Span, result?: SpanResult): void;
  
  /**
   * Record an event within a span.
   * @param span - Active span to record event in
   * @param event - Event to record
   */
  recordEvent(span: Span, event: TelemetryEvent): void;
  
  /**
   * Set attributes on a span.
   * @param span - Active span
   * @param attributes - Attributes to set
   */
  setAttributes(span: Span, attributes: Record<string, unknown>): void;
  
  /**
   * Set context that applies to all spans in this trace.
   * @param context - Context to set
   */
  setContext(context: TelemetryContext): void;
}

/**
 * Configuration options for creating a telemetry adapter
 */
export interface TelemetryOptions {
  /** Provider name */
  provider: string;
  
  /** Provider-specific configuration */
  config: Record<string, unknown>;
  
  /** Whether telemetry is enabled (defaults to true) */
  enabled?: boolean;
  
  /** Sampling rate from 0.0 to 1.0 (1.0 = all traces) */
  sampleRate?: number;
  
  /** Whether to redact PII from traces */
  redactPii?: boolean;
  
  /** Maximum length for input content (truncate if longer) */
  maxInputLength?: number;
  
  /** Maximum length for output content (truncate if longer) */
  maxOutputLength?: number;
}

/**
 * Configuration for Phoenix telemetry
 */
export interface PhoenixConfig {
  /** Project name in Phoenix */
  projectName: string;
  
  /** Phoenix collector endpoint URL (defaults to http://localhost:6006) */
  url?: string;
  
  /** API key for Phoenix Cloud */
  apiKey?: string;
  
  /** Use batch processing (defaults to true for production) */
  batch?: boolean;
  
  /** Additional headers for OTLP requests */
  headers?: Record<string, string>;
}

/**
 * Configuration for Langfuse telemetry
 */
export interface LangfuseConfig {
  /** Langfuse public key */
  publicKey: string;
  
  /** Langfuse secret key */
  secretKey: string;
  
  /** Langfuse base URL (defaults to https://cloud.langfuse.com) */
  baseUrl?: string;
  
  /** Project name (optional) */
  projectName?: string;
}

/**
 * No-op adapter for when telemetry is disabled
 */
export class NoopTelemetryAdapter implements TelemetryAdapter {
  readonly name = "noop";
  readonly version = "1.0.0";
  
  private currentId = 0;
  private mockSpans = new Map<string, Span>();
  
  async initialize(): Promise<void> {
    // No-op
  }
  
  async shutdown(): Promise<void> {
    // No-op
  }
  
  startSpan(context: SpanContext): Span {
    const id = `noop-${++this.currentId}`;
    const span: Span = {
      id,
      traceId: `trace-${this.currentId}`,
      name: context.name,
      kind: context.kind,
      startTime: Date.now(),
      parentId: context.parentSpan?.id,
    };
    this.mockSpans.set(id, span);
    return span;
  }
  
  endSpan(span: Span, _result?: SpanResult): void {
    this.mockSpans.delete(span.id);
  }
  
  recordEvent(_span: Span, _event: TelemetryEvent): void {
    // No-op
  }
  
  setAttributes(_span: Span, _attributes: Record<string, unknown>): void {
    // No-op
  }
  
  setContext(_context: TelemetryContext): void {
    // No-op
  }
}
