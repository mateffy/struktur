# Struktur OpenTelemetry/Phoenix Integration Plan

## Executive Summary

This plan outlines how to add LLM conversation tracing to Struktur via Phoenix (Arize) and OpenTelemetry, following an adapter pattern where the SDK remains agnostic to OTel specifics while exposing hooks that adapters can use to log events.

## Key Principles

1. **SDK Agnostic**: Struktur SDK knows nothing about OTel/Phoenix - it only exposes telemetry hooks
2. **Adapter Pattern**: All OTel/Phoenix logic lives in an adapter package
3. **CLI Integration**: Commands to enable/disable/configure OTel endpoints
4. **Zero Overhead**: When no telemetry adapter is provided, no tracing overhead

---

## 1. SDK Telemetry Interface (`packages/sdk/src/telemetry/types.ts`)

### Core Interface

```typescript
// packages/sdk/src/telemetry/types.ts

export interface TelemetryAdapter {
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
}

export interface SpanContext {
  name: string;
  kind: SpanKind;
  parentSpan?: Span;
  attributes?: Record<string, unknown>;
}

export type SpanKind = 
  | "CHAIN"      // Extraction pipeline
  | "LLM"        // LLM calls
  | "TOOL"       // Agent tool calls
  | "AGENT"      // Agent strategy
  | "RETRIEVER"; // Document parsing/chunking

export interface Span {
  id: string;
  name: string;
  kind: SpanKind;
  startTime: number;
}

export interface SpanResult {
  status: "ok" | "error";
  error?: Error;
  output?: unknown;
}

export type TelemetryEvent =
  | LLMCallEvent
  | ValidationEvent
  | ChunkEvent
  | ToolCallEvent
  | MergeEvent;

// Specific event types
export interface LLMCallEvent {
  type: "llm_call";
  model: string;
  provider: string;
  input: {
    messages: Array<{ role: string; content: string }>;
    schema?: unknown;
  };
  output?: {
    content: string;
    usage?: TokenUsage;
  };
  error?: Error;
}

export interface ValidationEvent {
  type: "validation";
  attempt: number;
  maxAttempts: number;
  schema: unknown;
  input: unknown;
  errors?: Array<{ path: string; message: string }>;
}

export interface ChunkEvent {
  type: "chunk";
  chunkIndex: number;
  totalChunks: number;
  tokens: number;
  images: number;
}

export interface ToolCallEvent {
  type: "tool_call";
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: Error;
}

export interface MergeEvent {
  type: "merge";
  strategy: string;
  inputCount: number;
  outputCount: number;
}
```

### Telemetry Options in extract()

```typescript
// Add to packages/sdk/src/types.ts

export interface ExtractOptions<T> {
  artifacts: Artifact[];
  schema?: JSONSchemaType<T>;
  fields?: string;
  strategy?: ExtractionStrategy<T>;
  model?: string;
  events?: ExtractionEvents;
  debug?: boolean;
  telemetry?: TelemetryAdapter | null;  // NEW
}
```

---

## 2. Phoenix/OTel Adapter Package

### Package Structure

```
packages/sdk/src/telemetry/
├── types.ts                    # Core telemetry interface
├── index.ts                    # Public exports
└── adapters/
    └── phoenix/
        ├── index.ts            # Phoenix adapter export
        ├── PhoenixAdapter.ts   # Main adapter implementation
        ├── spanKinds.ts        # OpenInference span kind mapping
        └── attributes.ts       # Attribute conversion utilities
```

### Phoenix Adapter Implementation

```typescript
// packages/sdk/src/telemetry/adapters/phoenix/PhoenixAdapter.ts

import { register } from "@arizeai/phoenix-otel";
import { trace, type Span as OtelSpan } from "@opentelemetry/api";
import {
  withSpan,
  getLLMAttributes,
  setSession,
  setMetadata,
} from "@arizeai/openinference-core";
import { SemanticConventions } from "@arizeai/openinference-semantic-conventions";
import type {
  TelemetryAdapter,
  SpanContext,
  Span,
  SpanResult,
  TelemetryEvent,
  LLMCallEvent,
} from "../../types.js";

export interface PhoenixConfig {
  projectName: string;
  url?: string;
  apiKey?: string;
  batch?: boolean;
  headers?: Record<string, string>;
}

export class PhoenixAdapter implements TelemetryAdapter {
  private config: PhoenixConfig;
  private tracerProvider: ReturnType<typeof register> | null = null;
  private activeSpans = new Map<string, OtelSpan>();

  constructor(config: PhoenixConfig) {
    this.config = {
      batch: true,
      ...config,
    };
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
    // Flush any pending spans
    if (this.tracerProvider) {
      await this.tracerProvider.forceFlush?.();
    }
  }

  startSpan(context: SpanContext): Span {
    const tracer = trace.getTracer("struktur");
    const otelSpan = tracer.startSpan(context.name, {
      attributes: {
        [SemanticConventions.OPENINFERENCE_SPAN_KIND]: this.mapSpanKind(context.kind),
        ...context.attributes,
      },
    });

    const span: Span = {
      id: otelSpan.spanContext().spanId,
      name: context.name,
      kind: context.kind,
      startTime: Date.now(),
    };

    this.activeSpans.set(span.id, otelSpan);
    return span;
  }

  endSpan(span: Span, result?: SpanResult): void {
    const otelSpan = this.activeSpans.get(span.id);
    if (!otelSpan) return;

    if (result) {
      otelSpan.setStatus({
        code: result.status === "ok" ? 1 : 2, // OK = 1, ERROR = 2
        message: result.error?.message,
      });

      if (result.output !== undefined) {
        otelSpan.setAttribute("output.value", JSON.stringify(result.output));
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

  private recordLLMCall(span: OtelSpan, event: LLMCallEvent): void {
    const llmAttributes = getLLMAttributes({
      provider: event.provider,
      modelName: event.model,
      inputMessages: event.input.messages,
      invocationParameters: {},
    });

    span.setAttributes(llmAttributes);

    if (event.output) {
      span.setAttribute("output.value", event.output.content);
      if (event.output.usage) {
        span.setAttribute("llm.token_count.prompt", event.output.usage.input);
        span.setAttribute("llm.token_count.completion", event.output.usage.output);
      }
    }

    if (event.error) {
      span.recordException(event.error);
    }
  }

  private recordValidation(span: OtelSpan, event: Extract<ValidationEvent, { type: "validation" }>): void {
    span.setAttribute("validation.attempt", event.attempt);
    span.setAttribute("validation.max_attempts", event.maxAttempts);
    if (event.errors) {
      span.setAttribute("validation.errors", JSON.stringify(event.errors));
    }
  }

  private recordChunk(span: OtelSpan, event: Extract<TelemetryEvent, { type: "chunk" }>): void {
    span.setAttribute("chunk.index", event.chunkIndex);
    span.setAttribute("chunk.total", event.totalChunks);
    span.setAttribute("chunk.tokens", event.tokens);
  }

  private recordToolCall(span: OtelSpan, event: Extract<TelemetryEvent, { type: "tool_call" }>): void {
    span.setAttribute("tool.name", event.toolName);
    span.setAttribute("tool.args", JSON.stringify(event.args));
    if (event.error) {
      span.setAttribute("tool.error", event.error.message);
    }
  }

  private recordMerge(span: OtelSpan, event: Extract<TelemetryEvent, { type: "merge" }>): void {
    span.setAttribute("merge.strategy", event.strategy);
    span.setAttribute("merge.input_count", event.inputCount);
    span.setAttribute("merge.output_count", event.outputCount);
  }

  private mapSpanKind(kind: SpanKind): string {
    const mapping: Record<SpanKind, string> = {
      CHAIN: "CHAIN",
      LLM: "LLM",
      TOOL: "TOOL",
      AGENT: "AGENT",
      RETRIEVER: "RETRIEVER",
    };
    return mapping[kind];
  }
}

// Factory function for easy initialization
export function createPhoenixAdapter(config: PhoenixConfig): PhoenixAdapter {
  return new PhoenixAdapter(config);
}
```

### Public API Exports

```typescript
// packages/sdk/src/telemetry/index.ts
export type {
  TelemetryAdapter,
  SpanContext,
  Span,
  SpanKind,
  SpanResult,
  TelemetryEvent,
  LLMCallEvent,
  ValidationEvent,
  ChunkEvent,
  ToolCallEvent,
  MergeEvent,
} from "./types.js";

// Phoenix adapter (optional import)
export { PhoenixAdapter, createPhoenixAdapter, type PhoenixConfig } from "./adapters/phoenix/index.js";
```

---

## 3. SDK Integration Points

### A. extract.ts - Main Entrypoint

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
      telemetry,  // Pass telemetry to strategy
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

### B. LLMClient.ts - LLM Call Tracing

```typescript
// packages/sdk/src/llm/LLMClient.ts

export async function generateStructured<T>(
  options: GenerateOptions<T>,
  telemetry?: TelemetryAdapter,
  parentSpan?: Span
): Promise<GenerateResult<T>> {
  const { model, system, user, schema, strict } = options;

  const span = telemetry?.startSpan({
    name: "llm.generateStructured",
    kind: "LLM",
    parentSpan,
    attributes: {
      "llm.model": model,
      "llm.provider": extractProvider(model),
    },
  });

  try {
    // Record input
    telemetry?.recordEvent(span!, {
      type: "llm_call",
      model: model,
      provider: extractProvider(model),
      input: {
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: user },
        ],
        schema,
      },
    });

    // Call Vercel AI SDK
    const result = await ai.generateText({
      model: resolveModel(model),
      system,
      messages: [{ role: "user", content: user }],
      ...
    });

    // Record output
    telemetry?.recordEvent(span!, {
      type: "llm_call",
      model,
      provider: extractProvider(model),
      input: { messages: [] }, // Already recorded above
      output: {
        content: JSON.stringify(result.object),
        usage: {
          input: result.usage?.promptTokens ?? 0,
          output: result.usage?.completionTokens ?? 0,
        },
      },
    });

    telemetry?.endSpan(span!, { status: "ok", output: result.object });

    return result;
  } catch (error) {
    telemetry?.recordEvent(span!, {
      type: "llm_call",
      model,
      provider: extractProvider(model),
      input: { messages: [] },
      error: error instanceof Error ? error : new Error(String(error)),
    });

    telemetry?.endSpan(span!, {
      status: "error",
      error: error instanceof Error ? error : new Error(String(error)),
    });

    throw error;
  }
}
```

### C. RetryingRunner.ts - Validation Tracing

```typescript
// packages/sdk/src/llm/RetryingRunner.ts

export async function runWithRetries<T>(
  options: RetryOptions<T>,
  telemetry?: TelemetryAdapter,
  parentSpan?: Span
): Promise<T> {
  const { maxAttempts, onRetry } = options;

  const span = telemetry?.startSpan({
    name: "struktur.validation_retry",
    kind: "CHAIN",
    parentSpan,
    attributes: {
      "retry.max_attempts": maxAttempts,
    },
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await options.run();

      // Validate
      const validation = validate(result);

      if (validation.success) {
        telemetry?.recordEvent(span!, {
          type: "validation",
          attempt,
          maxAttempts,
          schema: options.schema,
          input: result,
        });

        telemetry?.endSpan(span!, { status: "ok", output: result });
        return result;
      }

      // Record validation failure
      telemetry?.recordEvent(span!, {
        type: "validation",
        attempt,
        maxAttempts,
        schema: options.schema,
        input: result,
        errors: validation.errors,
      });

      onRetry?.(attempt, validation.errors);

    } catch (error) {
      telemetry?.recordEvent(span!, {
        type: "validation",
        attempt,
        maxAttempts,
        schema: options.schema,
        input: null,
        errors: [{ path: "", message: String(error) }],
      });

      if (attempt === maxAttempts) {
        telemetry?.endSpan(span!, {
          status: "error",
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      }
    }
  }
}
```

### D. Strategy Implementations

Each strategy needs to trace:
1. Chunking operations
2. Parallel/sequential batch processing
3. Merge/dedup operations

```typescript
// packages/sdk/src/strategies/ParallelStrategy.ts example

export class ParallelStrategy<T> implements ExtractionStrategy<T> {
  async run(options: StrategyOptions<T>): Promise<ExtractionResult<T>> {
    const { artifacts, telemetry } = options;

    const span = telemetry?.startSpan({
      name: "strategy.parallel",
      kind: "CHAIN",
      attributes: {
        "strategy.name": "parallel",
        "strategy.batch_size": this.batchSize,
      },
    });

    // Trace chunking
    const chunkSpan = telemetry?.startSpan({
      name: "struktur.chunking",
      kind: "RETRIEVER",
      parentSpan: span,
    });

    const batches = batchArtifacts(artifacts, { maxTokens: this.maxTokens });

    telemetry?.endSpan(chunkSpan!, {
      status: "ok",
      output: { batches: batches.length },
    });

    // Record chunk events
    batches.forEach((batch, index) => {
      telemetry?.recordEvent(chunkSpan!, {
        type: "chunk",
        chunkIndex: index,
        totalChunks: batches.length,
        tokens: batch.tokens,
        images: batch.images,
      });
    });

    // Process batches (child spans created by LLMClient)
    const results = await Promise.all(
      batches.map((batch) =>
        this.processBatch(batch, options, telemetry, span)
      )
    );

    // Trace merge
    const mergeSpan = telemetry?.startSpan({
      name: "struktur.merge",
      kind: "CHAIN",
      parentSpan: span,
    });

    const merged = await mergeResults(results, options.schema);

    telemetry?.recordEvent(mergeSpan!, {
      type: "merge",
      strategy: "parallel",
      inputCount: results.length,
      outputCount: Array.isArray(merged) ? merged.length : 1,
    });

    telemetry?.endSpan(mergeSpan!, { status: "ok", output: merged });
    telemetry?.endSpan(span!, { status: "ok", output: merged });

    return merged;
  }
}
```

### E. AgentStrategy - Tool Call Tracing

```typescript
// packages/agent-strategy/src/AgentStrategy.ts

export class AgentStrategy<T> implements ExtractionStrategy<T> {
  private handleToolCall(
    event: ToolCallEvent,
    telemetry?: TelemetryAdapter,
    parentSpan?: Span
  ): void {
    const span = telemetry?.startSpan({
      name: `tool.${event.toolName}`,
      kind: "TOOL",
      parentSpan,
      attributes: {
        "tool.name": event.toolName,
      },
    });

    telemetry?.recordEvent(span!, {
      type: "tool_call",
      toolName: event.toolName,
      args: event.args,
      result: event.result,
      error: event.error,
    });

    telemetry?.endSpan(span!, {
      status: event.error ? "error" : "ok",
      error: event.error,
      output: event.result,
    });
  }
}
```

---

## 4. CLI Integration

### A. Config Commands

Add to existing `struktur config` command group:

```typescript
// packages/cli/src/cli/config.ts

export const configCommand = defineCommand({
  meta: {
    name: "config",
    description: "Manage Struktur configuration",
  },
  subCommands: {
    // ... existing subcommands
    otel: otelCommand,
  },
});

// New OTel subcommand
const otelCommand = defineCommand({
  meta: {
    name: "otel",
    description: "Manage OpenTelemetry/Phoenix configuration",
  },
  subCommands: {
    enable: otelEnableCommand,
    disable: otelDisableCommand,
    status: otelStatusCommand,
  },
});

const otelEnableCommand = defineCommand({
  meta: {
    name: "enable",
    description: "Enable OpenTelemetry tracing with Phoenix",
  },
  args: {
    url: {
      type: "positional",
      description: "Phoenix collector endpoint URL",
      required: true,
    },
    apiKey: {
      type: "string",
      description: "Phoenix API key (optional)",
      alias: "k",
    },
    project: {
      type: "string",
      description: "Project name in Phoenix",
      default: "struktur",
    },
  },
  async run({ args }) {
    const config = await loadConfig();

    config.otel = {
      enabled: true,
      url: args.url,
      apiKey: args.apiKey,
      projectName: args.project,
    };

    await saveConfig(config);

    console.log(`✓ OpenTelemetry tracing enabled`);
    console.log(`  Endpoint: ${args.url}`);
    console.log(`  Project: ${args.project}`);
    if (args.apiKey) {
      console.log(`  API Key: ${args.apiKey.slice(0, 8)}...`);
    }
  },
});

const otelDisableCommand = defineCommand({
  meta: {
    name: "disable",
    description: "Disable OpenTelemetry tracing",
  },
  async run() {
    const config = await loadConfig();
    config.otel = { enabled: false };
    await saveConfig(config);
    console.log("✓ OpenTelemetry tracing disabled");
  },
});

const otelStatusCommand = defineCommand({
  meta: {
    name: "status",
    description: "Show OpenTelemetry configuration status",
  },
  async run() {
    const config = await loadConfig();

    if (!config.otel?.enabled) {
      console.log("OpenTelemetry tracing: disabled");
      return;
    }

    console.log("OpenTelemetry tracing: enabled");
    console.log(`  Endpoint: ${config.otel.url}`);
    console.log(`  Project: ${config.otel.projectName}`);
    console.log(`  API Key: ${config.otel.apiKey ? "*****" : "not set"}`);
  },
});
```

### B. Config Storage Update

```typescript
// packages/sdk/src/auth/config.ts

export interface StrukturConfig {
  defaultModel?: string;
  aliases?: Record<string, string>;
  parsers?: ParserConfig;
  otel?: OTelConfig;  // NEW
}

export interface OTelConfig {
  enabled: boolean;
  url?: string;
  apiKey?: string;
  projectName?: string;
  batch?: boolean;
  headers?: Record<string, string>;
}
```

### C. CLI Extract Command Integration

```typescript
// packages/cli/src/cli/commands/extract.ts

import { extract } from "@struktur/sdk";
import { createPhoenixAdapter } from "@struktur/sdk/telemetry";
import { loadConfig } from "@struktur/sdk/auth";

export const extractCommand = defineCommand({
  // ... existing meta and args

  async run({ args }) {
    const config = await loadConfig();

    // Initialize telemetry if enabled
    let telemetry = null;
    if (config.otel?.enabled) {
      telemetry = createPhoenixAdapter({
        projectName: config.otel.projectName ?? "struktur",
        url: config.otel.url,
        apiKey: config.otel.apiKey,
        batch: config.otel.batch ?? true,
        headers: config.otel.headers,
      });
    }

    // Run extraction with telemetry
    const result = await extract({
      artifacts,
      schema,
      strategy,
      model: args.model,
      telemetry,  // Pass to SDK
    });

    // ... rest of command
  },
});
```

---

## 5. Usage Examples

### SDK Usage with Phoenix

```typescript
import { extract } from "@struktur/sdk";
import { createPhoenixAdapter } from "@struktur/sdk/telemetry";

const telemetry = createPhoenixAdapter({
  projectName: "my-extraction-app",
  url: "https://app.phoenix.arize.com/s/my-space",
  apiKey: process.env.PHOENIX_API_KEY,
});

const result = await extract({
  artifacts,
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      authors: { type: "array", items: { type: "string" } },
    },
  },
  strategy: parallelStrategy(),
  telemetry,  // Opt-in tracing
});
```

### CLI Usage

```bash
# Enable OTel
struktur config otel enable http://localhost:6006 --project my-project

# Enable with Phoenix Cloud
struktur config otel enable https://app.phoenix.arize.com/s/my-space \
  --api-key phx-xxx \
  --project production

# Check status
struktur config otel status

# Disable
struktur config otel disable

# Extract with tracing (auto-enabled if configured)
struktur extract document.pdf --schema "title, authors"
```

---

## 6. Dependencies to Add

### SDK Package (`packages/sdk/package.json`)

```json
{
  "dependencies": {
    // ... existing deps
  },
  "optionalDependencies": {
    "@arizeai/phoenix-otel": "^1.x",
    "@arizeai/openinference-core": "^1.x",
    "@opentelemetry/api": "^1.x"
  }
}
```

Keep OTel deps as optional so SDK works without them.

### CLI Package (`packages/cli/package.json`)

No changes needed - CLI just imports from SDK.

---

## 7. Implementation Phases

### Phase 1: Core Telemetry Interface
1. Create `packages/sdk/src/telemetry/types.ts` with interfaces
2. Add `telemetry` option to `ExtractOptions`
3. Update `extract.ts` to call lifecycle hooks

### Phase 2: Phoenix Adapter
1. Create `packages/sdk/src/telemetry/adapters/phoenix/` directory
2. Implement `PhoenixAdapter` class
3. Add exports to `packages/sdk/src/telemetry/index.ts`
4. Make OTel deps optional in package.json

### Phase 3: LLM Call Tracing
1. Update `LLMClient.ts` to create LLM spans
2. Add span creation to `generateStructured()` and `generateText()`
3. Record input/output/usage as events

### Phase 4: Strategy Tracing
1. Update each strategy to create CHAIN spans
2. Add chunking events
3. Add merge/dedup events

### Phase 5: Agent Tool Tracing
1. Update `AgentStrategy` to create TOOL spans
2. Instrument all tool calls

### Phase 6: CLI Integration
1. Add `struktur config otel` subcommands
2. Update `OTelConfig` interface in auth/config.ts
3. Wire telemetry in extract command

### Phase 7: Testing & Documentation
1. Add tests for telemetry interface
2. Add example usage to documentation
3. Test with local Phoenix instance

---

## 8. OpenInference Attributes Reference

Key attributes to set for Phoenix compatibility:

### Span Kind Attribute (Required)
```typescript
span.setAttribute("openinference.span.kind", "LLM" | "CHAIN" | "TOOL" | "AGENT" | "RETRIEVER");
```

### LLM Span Attributes
```typescript
"llm.model_name": "gpt-4o"
"llm.provider": "openai"
"llm.invocation_parameters": JSON.stringify({ temperature: 0.5 })
"llm.input_messages.0.message.role": "system"
"llm.input_messages.0.message.content": "..."
"llm.output_messages.0.message.role": "assistant"
"llm.output_messages.0.message.content": "..."
"llm.token_count.prompt": 150
"llm.token_count.completion": 50
```

### Chain Span Attributes
```typescript
"input.value": JSON.stringify(inputData)
"output.value": JSON.stringify(outputData)
```

### Tool Span Attributes
```typescript
"tool.name": "bash"
"tool.description": "Execute bash command"
"tool.parameters": JSON.stringify({ command: "ls" })
```

### Context Attributes (from parent span)
```typescript
"session.id": "user-session-123"
"user.id": "user@example.com"
"metadata": JSON.stringify({ source: "cli", version: "2.0.0" })
"tag.tags": JSON.stringify(["production", "invoice"])
```

---

## 9. Summary

This integration plan provides:

1. **Clean Adapter Pattern**: SDK exposes hooks, Phoenix adapter implements them
2. **Zero Overhead**: No OTel code runs without adapter
3. **CLI Integration**: Simple enable/disable commands
4. **Complete Coverage**: All operations traced (parsing, LLM, validation, tools, merge)
5. **Phoenix Native**: Uses OpenInference semantic conventions
6. **Flexible Configuration**: URL, API key, project name, batching options

The implementation maintains Struktur's existing architecture while adding powerful observability capabilities through Phoenix.
