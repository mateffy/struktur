import { generateText, Output, jsonSchema, type ModelMessage } from "ai";
import type { AnyJSONSchema, Usage, TelemetryAdapter } from "../types";
import type { UserContent } from "./message";

type GenerateTextParams = Parameters<typeof generateText>[0];
type ModelType = GenerateTextParams extends { model: infer M } ? M : unknown;
type MessageType = Array<ModelMessage>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StructuredRequest<T> = {
  model: ModelType | unknown;
  system: string;
  user: UserContent;
  messages?: MessageType;
  schema: unknown;
  schemaName?: string;
  schemaDescription?: string;
  strict?: boolean;
  /**
   * Telemetry adapter for tracing LLM calls
   */
  telemetry?: TelemetryAdapter;
  /**
   * Parent span for creating hierarchical traces
   */
  parentSpan?: { id: string; traceId: string; name: string; kind: string; startTime: number; parentId?: string };
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
  const { telemetry, parentSpan } = request;
  
  // Start LLM span if telemetry is enabled
  const llmSpan = telemetry?.startSpan({
    name: "llm.generateStructured",
    kind: "LLM",
    parentSpan,
    attributes: {
      "llm.schema_name": request.schemaName ?? "extract",
      "llm.strict": request.strict ?? false,
    },
  });

  const startTime = Date.now();

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

  let result;
  try {
    result = await generateText({
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
  } catch (error) {
    // Determine model ID for error messages
    const modelId =
      typeof request.model === "object" && request.model !== null
        ? (request.model as { modelId?: string }).modelId ??
          JSON.stringify(request.model)
        : String(request.model);

    if (
      error &&
      typeof error === "object" &&
      "responseBody" in error &&
      "statusCode" in error
    ) {
      const apiError = error as {
        responseBody: unknown;
        statusCode: number;
        data?: {
          code?: number;
          message?: string;
          type?: string | null;
          param?: string | null;
        };
      };

      const responseBody = apiError.responseBody;
      const errorData = apiError.data;

      if (
        typeof responseBody === "string" &&
        responseBody.includes("No endpoints found that support image input")
      ) {
        throw new Error(
          `Model "${modelId}" does not support image input. Please use a model that supports images (e.g., gpt-4o, claude-3-5-sonnet, gemini-1.5-pro) or remove the --images and --screenshots flags.`,
        );
      }

      if (errorData?.code === 500 || errorData?.message?.includes("Internal Server Error")) {
        throw new Error(
          `Provider error for model "${modelId}": Internal server error. The model or provider may be experiencing issues. Please try again or use a different model.`,
        );
      }

      if (apiError.statusCode === 401 || errorData?.code === 401) {
        throw new Error(
          `Authentication failed for model "${modelId}". Please check your API key is valid and has the necessary permissions.`,
        );
      }

      if (apiError.statusCode === 403 || errorData?.code === 403) {
        throw new Error(
          `Access denied for model "${modelId}". Your API key may not have access to this model. Please check your subscription or try a different model.`,
        );
      }

      if (apiError.statusCode === 429 || errorData?.code === 429) {
        throw new Error(
          `Rate limit exceeded for model "${modelId}". Please wait a moment and try again, or use a different model.`,
        );
      }

      if (apiError.statusCode === 404 || errorData?.code === 404) {
        const errorMsg = errorData?.message || "Model not found";
        throw new Error(
          `Model "${modelId}" not found or unavailable. ${errorMsg} Please check the model name or try a different model.`,
        );
      }

      if (errorData?.message) {
        throw new Error(
          `Provider error for model "${modelId}": ${errorData.message}`,
        );
      }
    }
    
    // Record error in telemetry
    if (llmSpan && telemetry) {
      const latencyMs = Date.now() - startTime;
      telemetry.recordEvent(llmSpan, {
        type: "llm_call",
        model: modelId,
        provider: "unknown", // Will be determined by the model
        input: {
          messages: request.messages ?? [{ role: "user", content: typeof request.user === "string" ? request.user : "" }],
          temperature: undefined,
          maxTokens: undefined,
          schema: request.schema,
        },
        error: error instanceof Error ? error : new Error(String(error)),
        latencyMs,
      });
      telemetry.endSpan(llmSpan, {
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
        latencyMs,
      });
    }
    
    throw error;
  }

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

  // Record successful LLM call in telemetry
  if (llmSpan && telemetry) {
    const latencyMs = Date.now() - startTime;
    telemetry.recordEvent(llmSpan, {
      type: "llm_call",
      model: typeof request.model === "object" && request.model !== null
        ? (request.model as { modelId?: string }).modelId ?? "unknown"
        : String(request.model),
      provider: preferredProvider ?? "unknown",
      input: {
        messages: request.messages ?? [{ role: "user", content: typeof request.user === "string" ? request.user : "" }],
        temperature: undefined,
        maxTokens: undefined,
        schema: request.schema,
      },
      output: {
        content: JSON.stringify(result.output),
        structured: true,
        usage: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
      },
      latencyMs,
    });
    telemetry.endSpan(llmSpan, {
      status: "ok",
      output: result.output,
      latencyMs,
    });
  }

  return { data: result.output as T, usage };
};
