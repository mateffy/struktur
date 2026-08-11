import type { DebugLogger } from "./debug/logger";
import type { StandardSchema } from "./validation/validator";

export type ArtifactType = "text" | "image" | "pdf" | "file";

export type ImageType = "embedded" | "screenshot";

export type ArtifactImage = {
  type: "image";
  url?: string;
  base64?: string;
  contents?: Buffer;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  imageType?: ImageType;
};

export type ArtifactContent = {
  page?: number;
  text?: string;
  media?: ArtifactImage[];
};

export interface Artifact {
  id: string;
  type: ArtifactType;
  raw: () => Promise<Buffer>;
  contents: ArtifactContent[];
  metadata?: Record<string, unknown>;
  tokens?: number;
}

export type Usage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type ExtractionResult<T> = {
  data: T;
  usage: Usage;
  error?: Error;
};

/**
 * Telemetry adapter interface for tracing extraction operations.
 * This is a minimal interface that matches the full TelemetryAdapter from @struktur/telemetry.
 * SDK users should import adapters from @struktur/telemetry package.
 */
export interface TelemetryAdapter {
  readonly name: string;
  readonly version: string;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  startSpan(context: {
    name: string;
    kind: "CHAIN" | "LLM" | "TOOL" | "AGENT" | "RETRIEVER" | "EMBEDDING" | "RERANKER";
    parentSpan?: { id: string; traceId: string };
    attributes?: Record<string, unknown>;
    startTime?: number;
  }): {
    id: string;
    traceId: string;
    name: string;
    kind: string;
    startTime: number;
    parentId?: string;
  };
  endSpan(
    span: { id: string },
    result?: { status: "ok" | "error"; error?: Error; output?: unknown; latencyMs?: number },
  ): void;
  recordEvent(span: { id: string }, event: unknown): void;
  setAttributes(span: { id: string }, attributes: Record<string, unknown>): void;
  setContext(context: {
    sessionId?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
  }): void;
}

export type StepInfo = {
  step: number;
  total?: number;
  label?: string;
  detail?: string;
};

export type ProgressInfo = {
  current: number;
  total: number;
  percent?: number;
};

export type MessageInfo = {
  role: "system" | "user" | "assistant" | "tool";
  content: unknown;
};

export type TokenUsageInfo = Usage & {
  model?: string;
};

export type RetryInfo = {
  attempt: number;
  maxAttempts: number;
  reason?: string;
};

export type AgentToolStartInfo = {
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
};

export type AgentToolEndInfo = {
  toolCallId: string;
  result?: Record<string, unknown>;
  error?: string;
};

export type AgentMessageInfo = {
  content: string;
  role?: "assistant" | "user";
};

export type AgentReasoningInfo = {
  thought: string;
};

export type AgentEvents = {
  onAgentToolStart?: (info: AgentToolStartInfo) => void | Promise<void>;
  onAgentToolEnd?: (info: AgentToolEndInfo) => void | Promise<void>;
  onAgentMessage?: (info: AgentMessageInfo) => void | Promise<void>;
  onAgentReasoning?: (info: AgentReasoningInfo) => void | Promise<void>;
  onVisionStatus?: (info: {
    enabled: boolean;
    provider: string;
    modelId: string;
  }) => void | Promise<void>;
};

export type ExtractionEvents = {
  onStep?: (info: StepInfo) => void | Promise<void>;
  onMessage?: (info: MessageInfo) => void | Promise<void>;
  onProgress?: (info: ProgressInfo) => void | Promise<void>;
  onTokenUsage?: (info: TokenUsageInfo) => void | Promise<void>;
  onRetry?: (info: RetryInfo) => void | Promise<void>;
} & AgentEvents;

export type AnyJSONSchema = Record<string, unknown>;

/**
 * A plain JSON Schema object tagged with the expected TypeScript output type.
 * For type-safe schema authoring, prefer Zod schemas — they give full inference
 * without needing this type wrapper.
 */
export type TypedJSONSchema<T> = AnyJSONSchema & { readonly __inferredType?: T };

export type { StandardSchema } from "./validation/validator";

export type ProviderModelsResult = {
  provider: string;
  ok: boolean;
  models?: string[];
  error?: string;
};

export type ExtractionOptions<T> = {
  artifacts: Artifact[];
  /**
   * JSON Schema for the extracted output.
   * Exactly one of `schema`, `fields`, or an inline schema via the CLI must be provided.
   */
  /**
   * Schema for the extracted output. Accepts:
   * - A **Zod v4 schema** (recommended — gives type inference automatically)
   * - Any **Standard Schema V1** implementation (Valibot, ArkType, …)
   * - A plain **JSON Schema** object (use `TypedJSONSchema<T>` to tag it with a type)
   *
   * Mutually exclusive with `fields`.
   */
  schema?: TypedJSONSchema<T> | AnyJSONSchema | StandardSchema<unknown, T>;
  /**
   * Shorthand schema definition as a comma-separated string of `name` or `name:type` tokens.
   * E.g. `"title, price:number"`. Defaults to `string` when no type is specified.
   * Mutually exclusive with `schema`.
   */
  fields?: string;
  strategy: ExtractionStrategy<T>;
  events?: ExtractionEvents;
  debug?: DebugLogger;
  strict?: boolean;
  /**
   * Telemetry adapter for tracing extraction operations.
   * Supports Phoenix (Arize), Langfuse, and other OpenTelemetry-compatible providers.
   * Import from `@struktur/telemetry` package and pass the adapter here.
   */
  telemetry?: TelemetryAdapter | null;
};

export interface ExtractionStrategy<T> {
  name: string;
  run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>>;
  getEstimatedSteps?: (artifacts: Artifact[]) => number;
}
