import { generateObject, jsonSchema, type ModelMessage } from "ai";
import type { AnyJSONSchema, Usage } from "../types";
import type { UserContent } from "./message";

type GenerateObjectParams = Parameters<typeof generateObject>[0];
type ModelType = GenerateObjectParams extends { model: infer M } ? M : unknown;
type MessageType = Array<ModelMessage>;

export type StructuredRequest<T> = {
  model: ModelType | unknown;
  system: string;
  user: UserContent;
  messages?: MessageType;
  schema: unknown;
  schemaName?: string;
};

export type StructuredResponse<T> = {
  data: T;
  usage: Usage;
};

const isZodSchema = (schema: unknown): schema is { safeParse: (data: unknown) => unknown } => {
  return (
    typeof schema === "object" &&
    schema !== null &&
    "safeParse" in schema &&
    typeof (schema as { safeParse?: unknown }).safeParse === "function"
  );
};

export const generateStructured = async <T>(
  request: StructuredRequest<T>
): Promise<StructuredResponse<T>> => {
  const schema = isZodSchema(request.schema)
    ? request.schema
    : jsonSchema(request.schema as AnyJSONSchema);
  const result = await generateObject({
    model: request.model as ModelType,
    schema: schema as GenerateObjectParams extends { schema: infer S } ? S : never,
    schemaName: request.schemaName ?? "extract",
    system: request.system,
    messages: (request.messages ?? [{ role: "user", content: request.user }]) as MessageType,
    output: "object",
  });

  const usageRaw = result.usage ?? {};
  const inputTokens =
    "promptTokens" in usageRaw
      ? (usageRaw.promptTokens as number)
      : ((usageRaw as { inputTokens?: number }).inputTokens ?? 0);
  const outputTokens =
    "completionTokens" in usageRaw
      ? (usageRaw.completionTokens as number)
      : ((usageRaw as { outputTokens?: number }).outputTokens ?? 0);
  const totalTokens =
    "totalTokens" in usageRaw
      ? (usageRaw.totalTokens as number)
      : inputTokens + outputTokens;

  const usage: Usage = {
    inputTokens,
    outputTokens,
    totalTokens,
  };

  return { data: result.object as T, usage };
};
