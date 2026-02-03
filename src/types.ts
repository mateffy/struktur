import type { JSONSchemaType } from "ajv";

export type ArtifactType = "text" | "image" | "pdf" | "file";

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

export type ExtractionEvents = {
  onStep?: (info: StepInfo) => void | Promise<void>;
  onMessage?: (info: MessageInfo) => void | Promise<void>;
  onProgress?: (info: ProgressInfo) => void | Promise<void>;
  onTokenUsage?: (info: TokenUsageInfo) => void | Promise<void>;
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
  schema: TypedJSONSchema<T> | AnyJSONSchema;
  strategy: ExtractionStrategy<T>;
  events?: ExtractionEvents;
};

export interface ExtractionStrategy<T> {
  name: string;
  run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>>;
  getEstimatedSteps?: (artifacts: Artifact[]) => number;
}
