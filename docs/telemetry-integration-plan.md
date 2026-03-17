# Struktur Telemetry Integration Plan

## Executive Summary

This plan outlines how to add LLM conversation tracing to Struktur via multiple observability providers (Phoenix, Langfuse, Helicone, etc.) using a **self-contained `@struktur/telemetry` package**. The SDK remains completely agnostic - all telemetry logic lives in the separate package with a clean adapter interface.

## Key Principles

1. **Separate Package**: All telemetry code in `@struktur/telemetry` (not inside SDK)
2. **SDK Agnostic**: Struktur SDK knows nothing about telemetry - only hooks
3. **Multiple Providers**: Support Phoenix, Langfuse, Helicone, Braintrust, W&B, and more
4. **Adapter Pattern**: Each provider has its own adapter implementing a common interface
5. **Zero Overhead**: When no telemetry configured, no overhead
6. **CLI Integration**: Commands to configure any provider

---

## Supported Telemetry Providers

### 1. **Phoenix (Arize)** ⭐ Recommended
- **Type**: Open source + Cloud
- **Best For**: Production monitoring, drift detection, clustering
- **Architecture**: OpenTelemetry native
- **Setup**: Local (`http://localhost:6006`) or Cloud (`https://app.phoenix.arize.com`)
- **Key Features**: Trace viewing, prompt evaluation, embedding analysis

### 2. **Langfuse** ⭐ Open Source Favorite
- **Type**: Open source + Cloud (EU/US regions)
- **Best For**: Teams wanting full control, self-hosting
- **Architecture**: OpenTelemetry native (v4+ SDK)
- **Setup**: Self-hosted via Docker or Langfuse Cloud
- **Key Features**: Prompt management, datasets, user feedback, cost tracking

### 3. **Helicone**
- **Type**: Cloud-based (proxy or async logging)
- **Best For**: Quick setup, cost analytics, caching
- **Architecture**: Proxy-based or SDK manual logging
- **Setup**: Change base URL to `https://oai.helicone.ai` or use SDK
- **Key Features**: Token monitoring, latency tracking, caching

### 4. **Braintrust**
- **Type**: Cloud + Enterprise
- **Best For**: Evals-first observability, quality monitoring
- **Architecture**: Client SDK with tracing
- **Setup**: API key via `BRAINTRUST_API_KEY`
- **Key Features**: Online scoring, regression detection, experiment tracking

### 5. **LangSmith**
- **Type**: Cloud (closed source)
- **Best For**: LangChain ecosystem users
- **Architecture**: LangChain-native
- **Setup**: Automatic with LangChain, manual via SDK
- **Key Features**: Playground, prompt versioning, datasets

### 6. **Weights & Biases (W&B)**
- **Type**: Cloud + Enterprise
- **Best For**: ML teams already using W&B for training
- **Architecture**: Weave traces + experiment tracking
- **Setup**: `wandb.init()` + trace logging
- **Key Features**: Model lineage, experiment comparison, collaboration

### 7. **MLflow**
- **Type**: Open source
- **Best For**: Teams already using MLflow for ML lifecycle
- **Architecture**: OpenTelemetry compatible
- **Setup**: Local server or Databricks
- **Key Features**: Model registry, experiment tracking, trace UI

### 8. **Opik (by Comet)**
- **Type**: Cloud
- **Best For**: Unified ML and LLM monitoring
- **Architecture**: OpenTelemetry
- **Key Features**: Experiment + LLM trace unified view

---

## Package Structure

```
packages/telemetry/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Public exports
│   ├── types.ts                    # Core telemetry interface
│   ├── factory.ts                  # createTelemetry() factory
│   ├── adapters/
│   │   ├── base.ts                 # BaseAdapter abstract class
│   │   ├── phoenix/
│   │   │   ├── index.ts            # Phoenix exports
│   │   │   ├── PhoenixAdapter.ts   # Implementation
│   │   │   └── types.ts            # Phoenix-specific types
│   │   ├── langfuse/
│   │   │   ├── index.ts
│   │   │   ├── LangfuseAdapter.ts
│   │   │   └── types.ts
│   │   ├── helicone/
│   │   │   ├── index.ts
│   │   │   ├── HeliconeAdapter.ts
│   │   │   └── types.ts
│   │   ├── braintrust/
│   │   │   ├── index.ts
│   │   │   ├── BraintrustAdapter.ts
│   │   │   └── types.ts
│   │   ├── langsmith/
│   │   │   ├── index.ts
│   │   │   ├── LangSmithAdapter.ts
│   │   │   └── types.ts
│   │   ├── weights-and-biases/
│   │   │   ├── index.ts
│   │   │   ├── WeightsBiasesAdapter.ts
│   │   │   └── types.ts
│   │   └── mlflow/
│   │       ├── index.ts
│   │       ├── MLflowAdapter.ts
│   │       └── types.ts
│   └── utils/
│       ├── attributes.ts           # OpenInference attribute helpers
│       ├── sanitizers.ts          # Data sanitization for privacy
│       └── converters.ts          # Format converters
├── tests/
│   ├── adapters/
│   │   ├── phoenix.test.ts
│   │   ├── langfuse.test.ts
│   │   └── ...
│   └── factory.test.ts
└── AGENTS.md
```

---

## Core Interface (`packages/telemetry/src/types.ts`)

```typescript
// Struktur SDK only knows about this interface

export interface TelemetryAdapter {
  readonly name: string;
  readonly version: string;
  
  // Lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  // Span management
  startSpan(context: SpanContext): Span;
  endSpan(span: Span, result?: SpanResult): void;
  
  // Event recording
  recordEvent(span: Span, event: TelemetryEvent): void;
  
  // Context propagation
  setAttributes(span: Span, attributes: Record<string, unknown>): void;
  setContext(context: TelemetryContext): void;
}

export interface SpanContext {
  name: string;
  kind: SpanKind;
  parentSpan?: Span;
  attributes?: Record<string, unknown>;
  startTime?: number;
}

export type SpanKind = 
  | "CHAIN"      // Extraction pipeline, strategies
  | "LLM"        // LLM calls (generateText, generateObject)
  | "TOOL"       // Agent tool calls (bash, read, etc.)
  | "AGENT"      // Agent strategy execution
  | "RETRIEVER"  // Document parsing, chunking
  | "EMBEDDING"  // Vector embeddings (future)
  | "RERANKER";  // Reranking (future)

export interface Span {
  id: string;
  name: string;
  kind: SpanKind;
  startTime: number;
  traceId: string;
  parentId?: string;
}

export interface SpanResult {
  status: "ok" | "error";
  error?: Error;
  output?: unknown;
  latencyMs?: number;
}

export interface TelemetryContext {
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

// Event types that Struktur emits
export type TelemetryEvent =
  | LLMCallEvent
  | ValidationEvent
  | ChunkEvent
  | ToolCallEvent
  | MergeEvent
  | ParseEvent;

export interface LLMCallEvent {
  type: "llm_call";
  model: string;
  provider: string;
  input: {
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
    schema?: unknown;
  };
  output?: {
    content: string;
    structured?: boolean;
    usage?: TokenUsage;
  };
  latencyMs: number;
  error?: Error;
}

export interface ValidationEvent {
  type: "validation";
  attempt: number;
  maxAttempts: number;
  schema: unknown;
  input: unknown;
  success: boolean;
  errors?: Array<{ path: string; message: string }>;
  latencyMs?: number;
}

export interface ChunkEvent {
  type: "chunk";
  chunkIndex: number;
  totalChunks: number;
  tokens: number;
  images: number;
  content?: string;
}

export interface ToolCallEvent {
  type: "tool_call";
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: Error;
  latencyMs?: number;
}

export interface MergeEvent {
  type: "merge";
  strategy: string;
  inputCount: number;
  outputCount: number;
  deduped?: number;
}

export interface ParseEvent {
  type: "parse";
  mimeType: string;
  parser: string;
  inputSize: number;
  outputTokens: number;
  outputImages: number;
  latencyMs: number;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

// Factory function options
export interface TelemetryOptions {
  provider: "phoenix" | "langfuse" | "helicone" | "braintrust" | "langsmith" | "weights-and-biases" | "mlflow" | "opik";
  // Provider-specific config passed through
  config: Record<string, unknown>;
  
  // Common options
  enabled?: boolean;
  sampleRate?: number;  // 0.0 - 1.0
  redactPii?: boolean;  // Remove personally identifiable info
  maxInputLength?: number;  // Truncate long inputs
  maxOutputLength?: number;  // Truncate long outputs
}
```

---

## Factory Function (`packages/telemetry/src/factory.ts`)

```typescript
import type { TelemetryAdapter, TelemetryOptions } from "./types.js";

export async function createTelemetry(options: TelemetryOptions): Promise<TelemetryAdapter | null> {
  if (options.enabled === false) {
    return null;
  }

  switch (options.provider) {
    case "phoenix": {
      const { PhoenixAdapter } = await import("./adapters/phoenix/index.js");
      return new PhoenixAdapter(options.config);
    }
    case "langfuse": {
      const { LangfuseAdapter } = await import("./adapters/langfuse/index.js");
      return new LangfuseAdapter(options.config);
    }
    case "helicone": {
      const { HeliconeAdapter } = await import("./adapters/helicone/index.js");
      return new HeliconeAdapter(options.config);
    }
    case "braintrust": {
      const { BraintrustAdapter } = await import("./adapters/braintrust/index.js");
      return new BraintrustAdapter(options.config);
    }
    case "langsmith": {
      const { LangSmithAdapter } = await import("./adapters/langsmith/index.js");
      return new LangSmithAdapter(options.config);
    }
    case "weights-and-biases": {
      const { WeightsBiasesAdapter } = await import("./adapters/weights-and-biases/index.js");
      return new WeightsBiasesAdapter(options.config);
    }
    case "mlflow": {
      const { MLflowAdapter } = await import("./adapters/mlflow/index.js");
      return new MLflowAdapter(options.config);
    }
    default:
      throw new Error(`Unknown telemetry provider: ${options.provider}`);
  }
}

// Convenience functions for specific providers
export async function createPhoenixTelemetry(config: PhoenixConfig): Promise<TelemetryAdapter> {
  const { createPhoenixAdapter } = await import("./adapters/phoenix/index.js");
  return createPhoenixAdapter(config);
}

export async function createLangfuseTelemetry(config: LangfuseConfig): Promise<TelemetryAdapter> {
  const { createLangfuseAdapter } = await import("./adapters/langfuse/index.js");
  return createLangfuseAdapter(config);
}

export async function createHeliconeTelemetry(config: HeliconeConfig): Promise<TelemetryAdapter> {
  const { createHeliconeAdapter } = await import("./adapters/helicone/index.js");
  return createHeliconeAdapter(config);
}
```

---

## Adapter Implementations

### Phoenix Adapter Example

```typescript
// packages/telemetry/src/adapters/phoenix/PhoenixAdapter.ts

import { register } from "@arizeai/phoenix-otel";
import { trace } from "@opentelemetry/api";
import { withSpan, getLLMAttributes, setSession, setMetadata } from "@arizeai/openinference-core";
import { SemanticConventions } from "@arizeai/openinference-semantic-conventions";
import type { TelemetryAdapter, SpanContext, Span, SpanResult, TelemetryEvent } from "../../types.js";
import type { PhoenixConfig } from "./types.js";

export class PhoenixAdapter implements TelemetryAdapter {
  readonly name = "phoenix";
  readonly version = "1.0.0";
  
  private config: PhoenixConfig;
  private tracerProvider: ReturnType<typeof register> | null = null;
  private activeSpans = new Map<string, any>(); // OtelSpan

  constructor(config: Record<string, unknown>) {
    this.config = {
      projectName: "struktur",
      batch: true,
      ...config,
    } as PhoenixConfig;
  }

  async initialize(): Promise<void> {
    this.tracerProvider = register({
      projectName: this.config.projectName,
      url: this.config.url,
      apiKey: this.config.apiKey,
      batch: this.config.batch,
      headers: this.config.headers,
    });
  }

  async shutdown(): Promise<void> {
    await this.tracerProvider?.forceFlush?.();
  }

  startSpan(context: SpanContext): Span {
    const tracer = trace.getTracer("struktur");
    const otelSpan = tracer.startSpan(context.name, {
      attributes: {
        [SemanticConventions.OPENINFERENCE_SPAN_KIND]: context.kind,
        ...context.attributes,
      },
    });

    const span: Span = {
      id: otelSpan.spanContext().spanId,
      traceId: otelSpan.spanContext().traceId,
      name: context.name,
      kind: context.kind,
      startTime: Date.now(),
      parentId: context.parentSpan?.id,
    };

    this.activeSpans.set(span.id, otelSpan);
    return span;
  }

  endSpan(span: Span, result?: SpanResult): void {
    const otelSpan = this.activeSpans.get(span.id);
    if (!otelSpan) return;

    if (result) {
      otelSpan.setStatus({
        code: result.status === "ok" ? 1 : 2,
        message: result.error?.message,
      });

      if (result.output !== undefined) {
        otelSpan.setAttribute("output.value", JSON.stringify(result.output));
      }
      
      if (result.latencyMs) {
        otelSpan.setAttribute("latency_ms", result.latencyMs);
      }
    }

    otelSpan.end();
    this.activeSpans.delete(span.id);
  }

  recordEvent(span: Span, event: TelemetryEvent): void {
    const otelSpan = this.activeSpans.get(span.id);
    if (!otelSpan) return;

    switch (event.type) {
      case "llm_call":
        this.recordLLMCall(otelSpan, event);
        break;
      case "validation":
        this.recordValidation(otelSpan, event);
        break;
      case "chunk":
        this.recordChunk(otelSpan, event);
        break;
      case "tool_call":
        this.recordToolCall(otelSpan, event);
        break;
      case "merge":
        this.recordMerge(otelSpan, event);
        break;
      case "parse":
        this.recordParse(otelSpan, event);
        break;
    }
  }

  setAttributes(span: Span, attributes: Record<string, unknown>): void {
    const otelSpan = this.activeSpans.get(span.id);
    if (!otelSpan) return;

    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        otelSpan.setAttribute(key, String(value));
      }
    });
  }

  setContext(context: TelemetryContext): void {
    // Phoenix/OpenInference uses context propagators
    // This would set via OTel context
  }

  private recordLLMCall(span: any, event: Extract<TelemetryEvent, { type: "llm_call" }>): void {
    span.setAttributes({
      "llm.model_name": event.model,
      "llm.provider": event.provider,
      "llm.temperature": event.input.temperature,
      "llm.max_tokens": event.input.maxTokens,
      "llm.input_messages": JSON.stringify(event.input.messages),
      "output.value": event.output?.content,
      "llm.token_count.prompt": event.output?.usage?.input,
      "llm.token_count.completion": event.output?.usage?.output,
      "latency_ms": event.latencyMs,
    });

    if (event.error) {
      span.recordException(event.error);
    }
  }

  private recordValidation(span: any, event: Extract<TelemetryEvent, { type: "validation" }>): void {
    span.setAttributes({
      "validation.attempt": event.attempt,
      "validation.max_attempts": event.maxAttempts,
      "validation.success": event.success,
      "validation.errors": event.errors ? JSON.stringify(event.errors) : undefined,
    });
  }

  private recordChunk(span: any, event: Extract<TelemetryEvent, { type: "chunk" }>): void {
    span.setAttributes({
      "chunk.index": event.chunkIndex,
      "chunk.total": event.totalChunks,
      "chunk.tokens": event.tokens,
      "chunk.images": event.images,
    });
  }

  private recordToolCall(span: any, event: Extract<TelemetryEvent, { type: "tool_call" }>): void {
    span.setAttributes({
      "tool.name": event.toolName,
      "tool.args": JSON.stringify(event.args),
      "tool.result": event.result !== undefined ? JSON.stringify(event.result) : undefined,
      "tool.error": event.error?.message,
      "latency_ms": event.latencyMs,
    });
  }

  private recordMerge(span: any, event: Extract<TelemetryEvent, { type: "merge" }>): void {
    span.setAttributes({
      "merge.strategy": event.strategy,
      "merge.input_count": event.inputCount,
      "merge.output_count": event.outputCount,
      "merge.deduped": event.deduped,
    });
  }

  private recordParse(span: any, event: Extract<TelemetryEvent, { type: "parse" }>): void {
    span.setAttributes({
      "parse.mime_type": event.mimeType,
      "parse.parser": event.parser,
      "parse.input_size": event.inputSize,
      "parse.output_tokens": event.outputTokens,
      "parse.output_images": event.outputImages,
      "latency_ms": event.latencyMs,
    });
  }
}
```

### Langfuse Adapter Example

```typescript
// packages/telemetry/src/adapters/langfuse/LangfuseAdapter.ts

import { LangfuseSpanProcessor, type LangfuseConfig } from "@langfuse/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { trace } from "@opentelemetry/api";
import type { TelemetryAdapter, SpanContext, Span, SpanResult, TelemetryEvent } from "../../types.js";

export class LangfuseAdapter implements TelemetryAdapter {
  readonly name = "langfuse";
  readonly version = "1.0.0";
  
  private config: LangfuseConfig;
  private sdk: NodeSDK | null = null;
  private activeSpans = new Map<string, any>();

  constructor(config: Record<string, unknown>) {
    this.config = config as LangfuseConfig;
  }

  async initialize(): Promise<void> {
    const processor = new LangfuseSpanProcessor({
      publicKey: this.config.publicKey,
      secretKey: this.config.secretKey,
      baseUrl: this.config.baseUrl,
    });

    this.sdk = new NodeSDK({
      spanProcessors: [processor],
    });

    this.sdk.start();
  }

  async shutdown(): Promise<void> {
    await this.sdk?.shutdown();
  }

  startSpan(context: SpanContext): Span {
    const tracer = trace.getTracer("struktur");
    const otelSpan = tracer.startSpan(context.name, {
      attributes: {
        "observation.type": context.kind.toLowerCase(),
        ...context.attributes,
      },
    });

    const span: Span = {
      id: otelSpan.spanContext().spanId,
      traceId: otelSpan.spanContext().traceId,
      name: context.name,
      kind: context.kind,
      startTime: Date.now(),
      parentId: context.parentSpan?.id,
    };

    this.activeSpans.set(span.id, otelSpan);
    return span;
  }

  endSpan(span: Span, result?: SpanResult): void {
    const otelSpan = this.activeSpans.get(span.id);
    if (!otelSpan) return;

    if (result) {
      otelSpan.setStatus({
        code: result.status === "ok" ? 1 : 2,
        message: result.error?.message,
      });

      if (result.output !== undefined) {
        otelSpan.setAttribute("output", JSON.stringify(result.output));
      }
    }

    otelSpan.end();
    this.activeSpans.delete(span.id);
  }

  recordEvent(span: Span, event: TelemetryEvent): void {
    const otelSpan = this.activeSpans.get(span.id);
    if (!otelSpan) return;

    // Langfuse uses similar attribute structure to Phoenix
    // Just map the events to span attributes
    switch (event.type) {
      case "llm_call":
        otelSpan.setAttributes({
          model: event.model,
          provider: event.provider,
          input: JSON.stringify(event.input.messages),
          output: event.output?.content,
          "usage.input": event.output?.usage?.input,
          "usage.output": event.output?.usage?.output,
        });
        break;
      // ... other events
    }
  }

  setAttributes(span: Span, attributes: Record<string, unknown>): void {
    const otelSpan = this.activeSpans.get(span.id);
    if (!otelSpan) return;
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        otelSpan.setAttribute(key, String(value));
      }
    });
  }

  setContext(context: TelemetryContext): void {
    // Langfuse supports session_id, user_id, metadata, tags
    // Set via OTel context or span attributes
  }
}
```

### Helicone Adapter Example

```typescript
// packages/telemetry/src/adapters/helicone/HeliconeAdapter.ts

import { HeliconeManualLogger } from "@helicone/helpers";
import type { TelemetryAdapter, SpanContext, Span, SpanResult, TelemetryEvent } from "../../types.js";
import type { HeliconeConfig } from "./types.js";

export class HeliconeAdapter implements TelemetryAdapter {
  readonly name = "helicone";
  readonly version = "1.0.0";
  
  private config: HeliconeConfig;
  private logger: HeliconeManualLogger;
  private activeSpans = new Map<string, {
    span: Span;
    requestId: string;
    startTime: number;
  }>();

  constructor(config: Record<string, unknown>) {
    this.config = config as HeliconeConfig;
    this.logger = new HeliconeManualLogger({
      apiKey: this.config.apiKey,
      headers: this.config.headers,
    });
  }

  async initialize(): Promise<void> {
    // Helicone logger is ready immediately
  }

  async shutdown(): Promise<void> {
    // Helicone sends async, no explicit shutdown needed
  }

  startSpan(context: SpanContext): Span {
    const span: Span = {
      id: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      name: context.name,
      kind: context.kind,
      startTime: Date.now(),
      parentId: context.parentSpan?.id,
    };

    this.activeSpans.set(span.id, {
      span,
      requestId: span.traceId,
      startTime: span.startTime,
    });

    return span;
  }

  endSpan(span: Span, result?: SpanResult): void {
    const activeSpan = this.activeSpans.get(span.id);
    if (!activeSpan) return;

    // Helicone primarily logs LLM calls, not arbitrary spans
    // So we only log when there's meaningful LLM data
    
    this.activeSpans.delete(span.id);
  }

  recordEvent(span: Span, event: TelemetryEvent): void {
    // Helicone's logger works at the request level
    // We batch events and log the full request on endSpan
    const activeSpan = this.activeSpans.get(span.id);
    if (!activeSpan) return;

    // Store event in span for later logging
    // Implementation depends on how we want to batch
  }

  setAttributes(span: Span, attributes: Record<string, unknown>): void {
    // Store attributes for logging
  }

  setContext(context: TelemetryContext): void {
    // Helicone supports properties via headers
  }
}
```

---

## SDK Integration Points

The `@struktur/sdk` package only needs minimal changes:

### 1. Add telemetry option to `ExtractOptions`

```typescript
// packages/sdk/src/types.ts

import type { TelemetryAdapter } from "@struktur/telemetry";

export interface ExtractOptions<T> {
  artifacts: Artifact[];
  schema?: JSONSchemaType<T>;
  fields?: string;
  strategy?: ExtractionStrategy<T>;
  model?: string;
  events?: ExtractionEvents;
  debug?: boolean;
  telemetry?: TelemetryAdapter | null;  // NEW: Optional telemetry
}
```

### 2. Call telemetry hooks in `extract.ts`

```typescript
// packages/sdk/src/extract.ts

export async function extract<T>(
  options: ExtractOptions<T>
): Promise<ExtractionResult<T>> {
  const { artifacts, strategy, telemetry } = options;

  // Initialize telemetry if provided
  if (telemetry) {
    await telemetry.initialize();
  }

  // Start root extraction span
  const rootSpan = telemetry?.startSpan({
    name: "struktur.extract",
    kind: "CHAIN",
    attributes: {
      "extraction.strategy": strategy?.name ?? "default",
      "extraction.artifacts.count": artifacts.length,
      "extraction.schema": JSON.stringify(options.schema ?? options.fields),
    },
  });

  try {
    // Parse artifacts (RETRIEVER span)
    const parseSpan = telemetry?.startSpan({
      name: "struktur.parse",
      kind: "RETRIEVER",
      parentSpan: rootSpan,
    });

    const parsedArtifacts = await parseArtifacts(artifacts);

    telemetry?.endSpan(parseSpan!, {
      status: "ok",
      output: { count: parsedArtifacts.length },
    });

    // Run extraction strategy
    const result = await strategy!.run({
      ...options,
      telemetry,
    });

    telemetry?.endSpan(rootSpan!, {
      status: result.error ? "error" : "ok",
      output: result.data,
      error: result.error,
    });

    return result;
  } catch (error) {
    telemetry?.endSpan(rootSpan!, {
      status: "error",
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  } finally {
    await telemetry?.shutdown();
  }
}
```

---

## CLI Integration

### Package Configuration Commands

```typescript
// packages/cli/src/cli/config.ts

const telemetryCommand = defineCommand({
  meta: {
    name: "telemetry",
    description: "Manage telemetry configuration",
  },
  subCommands: {
    enable: telemetryEnableCommand,
    disable: telemetryDisableCommand,
    status: telemetryStatusCommand,
    list: telemetryListCommand,
  },
});

const telemetryEnableCommand = defineCommand({
  meta: {
    name: "enable",
    description: "Enable telemetry provider",
  },
  args: {
    provider: {
      type: "positional",
      description: "Provider name (phoenix, langfuse, helicone, braintrust, langsmith, wandb, mlflow)",
      required: true,
    },
    url: {
      type: "string",
      description: "Endpoint URL (if required)",
    },
    apiKey: {
      type: "string",
      description: "API key",
      alias: "k",
    },
    project: {
      type: "string",
      description: "Project name",
      alias: "p",
    },
  },
  async run({ args }) {
    const config = await loadConfig();

    const telemetryConfig: TelemetryConfig = {
      enabled: true,
      provider: args.provider,
    };

    // Provider-specific setup
    switch (args.provider) {
      case "phoenix":
        telemetryConfig.url = args.url ?? "http://localhost:6006";
        telemetryConfig.apiKey = args.apiKey;
        telemetryConfig.projectName = args.project ?? "struktur";
        break;
      case "langfuse":
        telemetryConfig.url = args.url ?? "https://cloud.langfuse.com";
        telemetryConfig.publicKey = args.apiKey; // Langfuse uses public/secret key pair
        telemetryConfig.projectName = args.project;
        break;
      case "helicone":
        telemetryConfig.apiKey = args.apiKey;
        telemetryConfig.proxyEnabled = !!args.url;
        break;
      case "braintrust":
        telemetryConfig.apiKey = args.apiKey;
        break;
      case "langsmith":
        telemetryConfig.apiKey = args.apiKey;
        telemetryConfig.projectName = args.project;
        break;
      case "wandb":
      case "weights-and-biases":
        telemetryConfig.apiKey = args.apiKey;
        telemetryConfig.projectName = args.project;
        break;
      case "mlflow":
        telemetryConfig.url = args.url ?? "http://localhost:5000";
        break;
    }

    config.telemetry = telemetryConfig;
    await saveConfig(config);

    console.log(`✓ Telemetry enabled: ${args.provider}`);
  },
});

const telemetryDisableCommand = defineCommand({
  meta: {
    name: "disable",
    description: "Disable telemetry",
  },
  async run() {
    const config = await loadConfig();
    if (config.telemetry) {
      config.telemetry.enabled = false;
      await saveConfig(config);
    }
    console.log("✓ Telemetry disabled");
  },
});

const telemetryStatusCommand = defineCommand({
  meta: {
    name: "status",
    description: "Show telemetry status",
  },
  async run() {
    const config = await loadConfig();
    
    if (!config.telemetry?.enabled) {
      console.log("Telemetry: disabled");
      console.log("\nAvailable providers:");
      console.log("  phoenix         - Arize Phoenix (OpenTelemetry)");
      console.log("  langfuse        - Langfuse (Open source)");
      console.log("  helicone        - Helicone (Proxy-based)");
      console.log("  braintrust      - Braintrust (Evals + observability)");
      console.log("  langsmith       - LangSmith (LangChain)");
      console.log("  wandb           - Weights & Biases");
      console.log("  mlflow          - MLflow (Open source)");
      return;
    }

    console.log(`Telemetry: enabled`);
    console.log(`Provider: ${config.telemetry.provider}`);
    if (config.telemetry.projectName) {
      console.log(`Project: ${config.telemetry.projectName}`);
    }
    if (config.telemetry.url) {
      console.log(`Endpoint: ${config.telemetry.url}`);
    }
  },
});

const telemetryListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List supported telemetry providers",
  },
  async run() {
    console.log("Supported telemetry providers:\n");
    console.log("Open Source:");
    console.log("  phoenix      Arize Phoenix - OpenTelemetry-based, great for production");
    console.log("  langfuse     Langfuse - Full-featured, prompt management, can self-host");
    console.log("  mlflow       MLflow - Good if already using MLflow for ML lifecycle\n");
    console.log("Cloud/SaaS:");
    console.log("  helicone     Helicone - Proxy-based, instant setup, cost analytics");
    console.log("  braintrust   Braintrust - Evals-first, quality monitoring");
    console.log("  langsmith    LangSmith - Best for LangChain users");
    console.log("  wandb        Weights & Biases - Best if already using W&B for training\n");
    console.log("Enable with: struktur config telemetry enable <provider>");
  },
});
```

---

## Configuration Storage

```typescript
// packages/sdk/src/auth/config.ts

export interface StrukturConfig {
  defaultModel?: string;
  aliases?: Record<string, string>;
  parsers?: ParserConfig;
  telemetry?: TelemetryConfig;  // NEW
}

export interface TelemetryConfig {
  enabled: boolean;
  provider: string;
  
  // Common fields
  url?: string;
  apiKey?: string;
  projectName?: string;
  
  // Provider-specific
  publicKey?: string;      // Langfuse
  secretKey?: string;      // Langfuse
  proxyEnabled?: boolean;  // Helicone
  headers?: Record<string, string>;
  
  // Sampling and privacy
  sampleRate?: number;     // 0.0 - 1.0
  redactPii?: boolean;
  maxInputLength?: number;
  maxOutputLength?: number;
}
```

---

## Usage Examples

### SDK Usage with Different Providers

```typescript
// Phoenix
import { createPhoenixTelemetry } from "@struktur/telemetry";

const telemetry = await createPhoenixTelemetry({
  projectName: "my-app",
  url: "https://app.phoenix.arize.com/s/my-space",
  apiKey: process.env.PHOENIX_API_KEY,
});

await extract({ artifacts, schema, telemetry });

// Langfuse
import { createLangfuseTelemetry } from "@struktur/telemetry";

const telemetry = await createLangfuseTelemetry({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: "https://cloud.langfuse.com",
});

await extract({ artifacts, schema, telemetry });

// Helicone (proxy mode - just need to configure URL in model)
// Helicone adapter for manual logging
import { createHeliconeTelemetry } from "@struktur/telemetry";

const telemetry = await createHeliconeTelemetry({
  apiKey: process.env.HELICONE_API_KEY,
});

await extract({ artifacts, schema, telemetry });

// Generic factory
import { createTelemetry } from "@struktur/telemetry";

const telemetry = await createTelemetry({
  provider: "braintrust",
  config: {
    apiKey: process.env.BRAINTRUST_API_KEY,
  },
});
```

### CLI Usage

```bash
# Phoenix
struktur config telemetry enable phoenix http://localhost:6006
struktur config telemetry enable phoenix https://app.phoenix.arize.com/s/my-space \
  --api-key phx-xxx --project production

# Langfuse
struktur config telemetry enable langfuse https://cloud.langfuse.com \
  --api-key pk-lf-xxx \
  --secret-key sk-lf-xxx

# Helicone (manual logging mode)
struktur config telemetry enable helicone --api-key hk-xxx

# Braintrust
struktur config telemetry enable braintrust --api-key brt-xxx

# Check status
struktur config telemetry status

# List providers
struktur config telemetry list

# Disable
struktur config telemetry disable

# Extract with configured telemetry
struktur extract document.pdf --schema "title, authors"
```

---

## Package Dependencies

### `@struktur/telemetry` package.json

```json
{
  "name": "@struktur/telemetry",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./adapters/phoenix": "./src/adapters/phoenix/index.ts",
    "./adapters/langfuse": "./src/adapters/langfuse/index.ts",
    "./adapters/helicone": "./src/adapters/helicone/index.ts",
    "./adapters/braintrust": "./src/adapters/braintrust/index.ts",
    "./adapters/langsmith": "./src/adapters/langsmith/index.ts",
    "./adapters/weights-and-biases": "./src/adapters/weights-and-biases/index.ts",
    "./adapters/mlflow": "./src/adapters/mlflow/index.ts"
  },
  "dependencies": {
    "@struktur/sdk": "workspace:*"
  },
  "optionalDependencies": {
    "@arizeai/phoenix-otel": "^1.x",
    "@arizeai/openinference-core": "^1.x",
    "@langfuse/otel": "^2.x",
    "@helicone/helpers": "^1.x",
    "braintrust": "^0.x",
    "langsmith": "^0.x",
    "@wandb/sdk": "^0.x",
    "mlflow": "^0.x"
  },
  "peerDependencies": {
    "@opentelemetry/api": "^1.x"
  },
  "peerDependenciesMeta": {
    "@opentelemetry/api": {
      "optional": true
    }
  }
}
```

---

## Implementation Phases

### Phase 1: Package Setup
1. Create `packages/telemetry/` directory
2. Set up `package.json` with optional dependencies
3. Create core interface in `src/types.ts`
4. Create factory function in `src/factory.ts`

### Phase 2: Phoenix Adapter (MVP)
1. Implement `PhoenixAdapter`
2. Add OpenInference attribute mapping
3. Test with local Phoenix instance

### Phase 3: SDK Integration
1. Add `telemetry` option to `ExtractOptions`
2. Call lifecycle hooks in `extract.ts`
3. Update `LLMClient.ts` to emit LLM events
4. Update strategies to emit span events

### Phase 4: CLI Configuration
1. Add `struktur config telemetry` commands
2. Update config storage interface
3. Wire telemetry in extract command

### Phase 5: Additional Adapters
1. Implement `LangfuseAdapter`
2. Implement `HeliconeAdapter`
3. Implement `BraintrustAdapter`
4. Implement `LangSmithAdapter`
5. Implement `WeightsBiasesAdapter`

### Phase 6: Testing & Documentation
1. Add unit tests for each adapter
2. Create integration tests
3. Write documentation for each provider
4. Add examples

---

## Provider Comparison Matrix

| Provider | Type | Setup | Best For | Self-Host | OTel Native | Cost |
|----------|------|-------|----------|-----------|-------------|------|
| **Phoenix** | Open Source | Easy | Production monitoring | ✅ | ✅ | Free |
| **Langfuse** | Open Source | Medium | Full control, prompts | ✅ | ✅ | Free tier |
| **Helicone** | SaaS | Very Easy | Quick setup, caching | ❌ | ❌ | Free tier |
| **Braintrust** | SaaS | Easy | Evals-first | ❌ | Partial | Paid |
| **LangSmith** | SaaS | Easy | LangChain users | ❌ | Partial | Paid |
| **W&B** | SaaS | Easy | ML teams | ❌ | No | Paid |
| **MLflow** | Open Source | Medium | MLflow users | ✅ | ✅ | Free |

---

## Privacy and Security Considerations

1. **PII Redaction**: Option to remove personally identifiable info
2. **Sampling**: Only trace X% of requests
3. **Truncation**: Limit input/output sizes
4. **Opt-in**: Telemetry is disabled by default
5. **Local-first**: All providers support local/self-hosted

---

## Summary

This plan creates a **self-contained `@struktur/telemetry` package** with:

1. **8 supported providers**: Phoenix, Langfuse, Helicone, Braintrust, LangSmith, W&B, MLflow, Opik
2. **Clean adapter interface**: SDK knows nothing about specific providers
3. **Lazy loading**: Adapters loaded on-demand via dynamic imports
4. **CLI configuration**: Simple commands to enable/disable any provider
5. **Privacy controls**: Sampling, PII redaction, truncation
6. **OpenTelemetry native**: Phoenix and Langfuse use OTel standards

The architecture allows adding new providers without touching the SDK, maintaining clean separation of concerns.
