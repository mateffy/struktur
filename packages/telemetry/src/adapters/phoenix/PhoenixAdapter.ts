/**
 * Phoenix (Arize) telemetry adapter
 * 
 * Implements TelemetryAdapter for Phoenix using OpenTelemetry and
 * OpenInference semantic conventions.
 */

import type {
  TelemetryAdapter,
  SpanContext,
  Span,
  SpanResult,
  TelemetryEvent,
  TelemetryContext,
  PhoenixConfig,
  LLMCallEvent,
  ValidationEvent,
  ChunkEvent,
  ToolCallEvent,
  MergeEvent,
  ParseEvent,
  TokenUsage,
} from "../../types.js";

type OtelSpan = {
  spanContext: () => { spanId: string; traceId: string };
  setStatus: (status: { code: number; message?: string }) => void;
  setAttribute: (key: string, value: string | number | boolean | undefined) => void;
  setAttributes: (attrs: Record<string, string | number | boolean>) => void;
  recordException: (error: Error) => void;
  end: () => void;
};

/**
 * Phoenix telemetry adapter using OpenTelemetry
 */
export class PhoenixAdapter implements TelemetryAdapter {
  readonly name = "phoenix";
  readonly version = "1.0.0";

  private config: PhoenixConfig;
  private tracerProvider: { forceFlush?: () => Promise<void> } | null = null;
  private activeSpans = new Map<string, OtelSpan>();
  private otelApi: typeof import("@opentelemetry/api") | null = null;
  private phoenixOtel: typeof import("@arizeai/phoenix-otel") | null = null;

  constructor(config: PhoenixConfig) {
    this.config = {
      url: "http://localhost:6006",
      batch: true,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    // Dynamically import OTel dependencies
    const [{ register }, otelApi] = await Promise.all([
      import("@arizeai/phoenix-otel"),
      import("@opentelemetry/api"),
    ]);

    this.otelApi = otelApi;
    this.phoenixOtel = { register } as typeof import("@arizeai/phoenix-otel");

    this.tracerProvider = register({
      projectName: this.config.projectName,
      url: this.config.url,
      apiKey: this.config.apiKey,
      batch: this.config.batch,
      headers: this.config.headers,
    });
  }

  async shutdown(): Promise<void> {
    if (this.tracerProvider?.forceFlush) {
      await this.tracerProvider.forceFlush();
    }
  }

  startSpan(context: SpanContext): Span {
    if (!this.otelApi) {
      throw new Error("PhoenixAdapter not initialized");
    }

    const tracer = this.otelApi.trace.getTracer("struktur");
    
    const spanKind = context.kind;
    const otelSpan = tracer.startSpan(context.name, {
      attributes: {
        "openinference.span.kind": spanKind,
        ...context.attributes,
      },
    }) as OtelSpan;

    const spanContext = otelSpan.spanContext();
    const span: Span = {
      id: spanContext.spanId,
      traceId: spanContext.traceId,
      name: context.name,
      kind: context.kind,
      startTime: context.startTime ?? Date.now(),
      parentId: context.parentSpan?.id,
    };

    this.activeSpans.set(span.id, otelSpan);
    return span;
  }

  endSpan(span: Span, result?: SpanResult): void {
    const otelSpan = this.activeSpans.get(span.id);
    if (!otelSpan) return;

    if (result) {
      // OTel status codes: 1 = OK, 2 = ERROR
      otelSpan.setStatus({
        code: result.status === "ok" ? 1 : 2,
        message: result.error?.message,
      });

      if (result.output !== undefined) {
        try {
          const outputStr = typeof result.output === "string" 
            ? result.output 
            : JSON.stringify(result.output);
          otelSpan.setAttribute("output.value", outputStr);
        } catch {
          otelSpan.setAttribute("output.value", "[object]");
        }
      }

      if (result.latencyMs !== undefined) {
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

    const stringAttrs: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(attributes)) {
      if (value !== undefined && value !== null) {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          stringAttrs[key] = value;
        } else {
          try {
            stringAttrs[key] = JSON.stringify(value);
          } catch {
            stringAttrs[key] = String(value);
          }
        }
      }
    }

    otelSpan.setAttributes(stringAttrs);
  }

  setContext(_context: TelemetryContext): void {
    // Phoenix/OpenInference supports context via OTel context propagation
    // This would require setting up context managers
    // For now, attributes can be set on spans directly
  }

  private recordLLMCall(span: OtelSpan, event: LLMCallEvent): void {
    const attrs: Record<string, string | number | boolean> = {
      "llm.model_name": event.model,
      "llm.provider": event.provider,
      "llm.temperature": event.input.temperature ?? "",
      "llm.max_tokens": event.input.maxTokens ?? "",
    };

    // Record input messages
    if (event.input.messages.length > 0) {
      attrs["llm.input_messages"] = JSON.stringify(event.input.messages);
    }

    // Record schema if present
    if (event.input.schema) {
      try {
        attrs["llm.schema"] = JSON.stringify(event.input.schema);
      } catch {
        // Ignore schema serialization errors
      }
    }

    // Record output
    if (event.output) {
      attrs["output.value"] = event.output.content;
      attrs["llm.structured_output"] = event.output.structured ?? false;

      // Record token usage
      if (event.output.usage) {
        this.setTokenUsageAttrs(attrs, event.output.usage);
      }
    }

    attrs["latency_ms"] = event.latencyMs;

    if (event.error) {
      span.recordException(event.error);
    }

    span.setAttributes(attrs);
  }

  private setTokenUsageAttrs(attrs: Record<string, string | number | boolean>, usage: TokenUsage): void {
    attrs["llm.token_count.prompt"] = usage.input;
    attrs["llm.token_count.completion"] = usage.output;
    attrs["llm.token_count.total"] = usage.total;
  }

  private recordValidation(span: OtelSpan, event: ValidationEvent): void {
    const attrs: Record<string, string | number | boolean> = {
      "validation.attempt": event.attempt,
      "validation.max_attempts": event.maxAttempts,
      "validation.success": event.success,
    };

    if (event.errors && event.errors.length > 0) {
      attrs["validation.errors"] = JSON.stringify(event.errors);
    }

    if (event.latencyMs !== undefined) {
      attrs["latency_ms"] = event.latencyMs;
    }

    span.setAttributes(attrs);
  }

  private recordChunk(span: OtelSpan, event: ChunkEvent): void {
    span.setAttributes({
      "chunk.index": event.chunkIndex,
      "chunk.total": event.totalChunks,
      "chunk.tokens": event.tokens,
      "chunk.images": event.images,
    });

    if (event.content) {
      span.setAttribute("chunk.content_preview", event.content.slice(0, 1000));
    }
  }

  private recordToolCall(span: OtelSpan, event: ToolCallEvent): void {
    const attrs: Record<string, string | number | boolean> = {
      "tool.name": event.toolName,
      "tool.args": JSON.stringify(event.args),
    };

    if (event.result !== undefined) {
      try {
        attrs["tool.result"] = JSON.stringify(event.result);
      } catch {
        attrs["tool.result"] = "[object]";
      }
    }

    if (event.error) {
      attrs["tool.error"] = event.error.message;
    }

    if (event.latencyMs !== undefined) {
      attrs["latency_ms"] = event.latencyMs;
    }

    span.setAttributes(attrs);

    if (event.error) {
      span.recordException(event.error);
    }
  }

  private recordMerge(span: OtelSpan, event: MergeEvent): void {
    const attrs: Record<string, string | number | boolean> = {
      "merge.strategy": event.strategy,
      "merge.input_count": event.inputCount,
      "merge.output_count": event.outputCount,
    };

    if (event.deduped !== undefined) {
      attrs["merge.deduped"] = event.deduped;
    }

    span.setAttributes(attrs);
  }

  private recordParse(span: OtelSpan, event: ParseEvent): void {
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

/**
 * Create a Phoenix telemetry adapter
 * 
 * @param config - Phoenix configuration
 * @returns Phoenix telemetry adapter
 */
export function createPhoenixAdapter(config: PhoenixConfig): PhoenixAdapter {
  return new PhoenixAdapter(config);
}

export type { PhoenixConfig };
