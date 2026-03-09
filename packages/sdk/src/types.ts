import type { JSONSchemaType } from "ajv";
import type { DebugLogger } from "./debug/logger";

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

export type ExtractionEvents = {
  onStep?: (info: StepInfo) => void | Promise<void>;
  onMessage?: (info: MessageInfo) => void | Promise<void>;
  onProgress?: (info: ProgressInfo) => void | Promise<void>;
  onTokenUsage?: (info: TokenUsageInfo) => void | Promise<void>;
  onRetry?: (info: RetryInfo) => void | Promise<void>;
};

export type AnyJSONSchema = Record<string, unknown>;
export type TypedJSONSchema<T> = JSONSchemaType<T>;

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
  schema?: TypedJSONSchema<T> | AnyJSONSchema;
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
}

export interface ExtractionStrategy<T> {
  name: string;
  run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>>;
  getEstimatedSteps?: (artifacts: Artifact[]) => number;
}
