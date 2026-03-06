import { generateText, Output, jsonSchema, type ModelMessage } from "ai";
import type { AnyJSONSchema, Usage } from "../types";
import type { UserContent } from "./message";

type GenerateTextParams = Parameters<typeof generateText>[0];
type ModelType = GenerateTextParams extends { model: infer M } ? M : unknown;
type MessageType = Array<ModelMessage>;

export type StructuredRequest<T> = {
  model: ModelType | unknown;
  system: string;
  user: UserContent;
  messages?: MessageType;
  schema: unknown;
  schemaName?: string;
  schemaDescription?: string;
  strict?: boolean;
};

export type StructuredResponse<T> = {
  data: T;
  usage: Usage;
};

const isZodSchema = (
  schema: unknown,
): schema is { safeParse: (data: unknown) => unknown } => {
  return (
    typeof schema === "object" &&
    schema !== null &&
    "safeParse" in schema &&
    typeof (schema as { safeParse?: unknown }).safeParse === "function"
  );
};

export const generateStructured = async <T>(
  request: StructuredRequest<T>,
): Promise<StructuredResponse<T>> => {
  const schema = isZodSchema(request.schema)
    ? request.schema
    : jsonSchema(request.schema as AnyJSONSchema);

  // Check for OpenRouter provider preference attached to the model
  const preferredProvider = (
    request.model as { __openrouter_provider?: string }
  )?.__openrouter_provider;

  if (preferredProvider && process.env.DEBUG) {
    console.error(
      `[DEBUG] Routing to OpenRouter provider: ${preferredProvider}`,
    );
  }

  const providerOptions = preferredProvider
    ? {
        openrouter: {
          provider: {
            order: [preferredProvider],
          },
        },
      }
    : undefined;

  const result = await generateText({
    model: request.model as ModelType,
    output: Output.object({
      schema: schema as GenerateTextParams extends { schema: infer S }
        ? S
        : never,
      name: request.schemaName ?? "extract",
      description: request.schemaDescription,
    }),
    providerOptions: {
      openai: {
        strictJsonSchema: request.strict ?? false,
      },
    },
    system: request.system,
    messages: (request.messages ?? [
      { role: "user", content: request.user },
    ]) as MessageType,
    ...(providerOptions ? { providerOptions } : {}),
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

  return { data: result.output as T, usage };
};
