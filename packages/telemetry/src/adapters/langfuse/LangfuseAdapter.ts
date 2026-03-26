/**
 * Langfuse telemetry adapter
 *
 * Implements TelemetryAdapter for Langfuse using their OpenTelemetry SDK.
 */

import type {
  TelemetryAdapter,
  SpanContext,
  Span,
  SpanResult,
  TelemetryEvent,
  TelemetryContext,
  LangfuseConfig,
  LLMCallEvent,
  ValidationEvent,
  ChunkEvent,
  ToolCallEvent,
  MergeEvent,
  ParseEvent,
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
 * Langfuse telemetry adapter using OpenTelemetry
 */
export class LangfuseAdapter implements TelemetryAdapter {
  readonly name = "langfuse";
  readonly version = "1.0.0";

  private config: LangfuseConfig;
  private sdk: { shutdown: () => Promise<void> } | null = null;
  private activeSpans = new Map<string, OtelSpan>();
  private otelApi: typeof import("@opentelemetry/api") | null = null;

  constructor(config: LangfuseConfig) {
    this.config = {
      baseUrl: "https://cloud.langfuse.com",
      ...config,
    };
  }

  async initialize(): Promise<void> {
    // Dynamically import Langfuse OTel SDK
    const [{ LangfuseSpanProcessor }, { NodeSDK }, otelApi] = await Promise.all([
      import("@langfuse/otel"),
      import("@opentelemetry/sdk-node"),
      import("@opentelemetry/api"),
    ]);

    this.otelApi = otelApi;

    const processor = new LangfuseSpanProcessor({
      publicKey: this.config.publicKey,
      secretKey: this.config.secretKey,
      baseUrl: this.config.baseUrl,
    });

    const sdk = new NodeSDK({
      spanProcessors: [processor],
    });

    sdk.start();
    this.sdk = sdk;
  }

  async shutdown(): Promise<void> {
    if (this.sdk) {
      await this.sdk.shutdown();
    }
  }

  startSpan(context: SpanContext): Span {
    if (!this.otelApi) {
      throw new Error("LangfuseAdapter not initialized");
    }

    const tracer = this.otelApi.trace.getTracer("struktur");

    const otelSpan = tracer.startSpan(context.name, {
      attributes: {
        "observation.type": context.kind.toLowerCase(),
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
      otelSpan.setStatus({
        code: result.status === "ok" ? 1 : 2,
        message: result.error?.message,
      });

      if (result.output !== undefined) {
        try {
          const outputStr =
            typeof result.output === "string" ? result.output : JSON.stringify(result.output);
          otelSpan.setAttribute("output", outputStr);
        } catch {
          otelSpan.setAttribute("output", "[object]");
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
    // Langfuse supports session_id, user_id, metadata, tags via span attributes
    // These would be set on individual spans
  }

  private recordLLMCall(span: OtelSpan, event: LLMCallEvent): void {
    const attrs: Record<string, string | number | boolean> = {
      model: event.model,
      provider: event.provider,
      input: JSON.stringify(event.input.messages),
      temperature: event.input.temperature ?? "",
      max_tokens: event.input.maxTokens ?? "",
    };

    if (event.output) {
      attrs.output = event.output.content;

      if (event.output.usage) {
        attrs["usage.input"] = event.output.usage.input;
        attrs["usage.output"] = event.output.usage.output;
        attrs["usage.total"] = event.output.usage.total;
      }
    }

    attrs.latency_ms = event.latencyMs;

    if (event.error) {
      attrs.error = event.error.message;
      span.recordException(event.error);
    }

    span.setAttributes(attrs);
  }

  private recordValidation(span: OtelSpan, event: ValidationEvent): void {
    const attrs: Record<string, string | number | boolean> = {
      attempt: event.attempt,
      max_attempts: event.maxAttempts,
      success: event.success,
    };

    if (event.errors && event.errors.length > 0) {
      attrs.errors = JSON.stringify(event.errors);
    }

    if (event.latencyMs !== undefined) {
      attrs.latency_ms = event.latencyMs;
    }

    span.setAttributes(attrs);
  }

  private recordChunk(span: OtelSpan, event: ChunkEvent): void {
    const attrs: Record<string, string | number | boolean> = {
      chunk_index: event.chunkIndex,
      chunk_total: event.totalChunks,
      chunk_tokens: event.tokens,
      chunk_images: event.images,
    };

    if (event.content) {
      attrs.chunk_content = event.content.slice(0, 1000);
    }

    span.setAttributes(attrs);
  }

  private recordToolCall(span: OtelSpan, event: ToolCallEvent): void {
    const attrs: Record<string, string | number | boolean> = {
      tool_name: event.toolName,
      tool_args: JSON.stringify(event.args),
    };

    if (event.result !== undefined) {
      try {
        attrs.tool_result = JSON.stringify(event.result);
      } catch {
        attrs.tool_result = "[object]";
      }
    }

    if (event.error) {
      attrs.tool_error = event.error.message;
    }

    if (event.latencyMs !== undefined) {
      attrs.latency_ms = event.latencyMs;
    }

    span.setAttributes(attrs);

    if (event.error) {
      span.recordException(event.error);
    }
  }

  private recordMerge(span: OtelSpan, event: MergeEvent): void {
    const attrs: Record<string, string | number | boolean> = {
      strategy: event.strategy,
      input_count: event.inputCount,
      output_count: event.outputCount,
    };

    if (event.deduped !== undefined) {
      attrs.deduped = event.deduped;
    }

    span.setAttributes(attrs);
  }

  private recordParse(span: OtelSpan, event: ParseEvent): void {
    span.setAttributes({
      mime_type: event.mimeType,
      parser: event.parser,
      input_size: event.inputSize,
      output_tokens: event.outputTokens,
      output_images: event.outputImages,
      latency_ms: event.latencyMs,
    });
  }
}

/**
 * Create a Langfuse telemetry adapter
 *
 * @param config - Langfuse configuration
 * @returns Langfuse telemetry adapter
 */
export function createLangfuseAdapter(config: LangfuseConfig): LangfuseAdapter {
  return new LangfuseAdapter(config);
}

export type { LangfuseConfig };
