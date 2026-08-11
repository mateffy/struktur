import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import {
  type AnyJSONSchema,
  type Artifact,
  type ExtractionStrategy,
  type SerializedArtifact,
  extract,
  hydrateSerializedArtifacts,
  resolveModel,
  validateSerializedArtifacts,
  parse,
  agent,
  doublePass,
  doublePassAutoMerge,
  parallel,
  parallelAutoMerge,
  sequential,
  sequentialAutoMerge,
  simple,
} from "@struktur/sdk";
import { serializeArtifacts } from "./serialize";
import { config } from "../config";

export async function resolveModelForEnv(model: string) {
  const [provider, ...rest] = model.split("/");
  const modelName = rest.join("/");

  if (!provider || !modelName) {
    throw new Error(
      `Invalid model format: ${model}. Expected format: provider/model (e.g., openai/gpt-4)`,
    );
  }

  if (provider === "openai" && !process.env.OPENAI_API_KEY && config.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = config.OPENAI_API_KEY;
  }
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY && config.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = config.ANTHROPIC_API_KEY;
  }
  if (provider === "google" && !process.env.GOOGLE_API_KEY && config.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = config.GOOGLE_API_KEY;
  }
  if (provider === "opencode" && !process.env.OPENCODE_API_KEY && config.OPENCODE_API_KEY) {
    process.env.OPENCODE_API_KEY = config.OPENCODE_API_KEY;
  }
  if (provider === "openrouter" && !process.env.OPENROUTER_API_KEY && config.OPENROUTER_API_KEY) {
    process.env.OPENROUTER_API_KEY = config.OPENROUTER_API_KEY;
  }

  return resolveModel(model);
}

export function createStrategy(
  name: string,
  model: unknown,
  options?: { chunkSize?: number; maxSteps?: number; modelSpec?: string },
): ExtractionStrategy<unknown> {
  const chunkSize = options?.chunkSize ?? 10000;

  switch (name) {
    case "simple":
      return simple({ model });
    case "parallel":
      return parallel({ model, mergeModel: model, chunkSize });
    case "sequential":
      return sequential({ model, chunkSize });
    case "parallelAutoMerge":
      return parallelAutoMerge({ model, dedupeModel: model, chunkSize });
    case "sequentialAutoMerge":
      return sequentialAutoMerge({ model, dedupeModel: model, chunkSize });
    case "doublePass":
      return doublePass({ model, mergeModel: model, chunkSize });
    case "doublePassAutoMerge":
      return doublePassAutoMerge({ model, dedupeModel: model, chunkSize });
    case "agent": {
      const modelSpec = options?.modelSpec || "";
      const [provider, ...modelParts] = modelSpec.split("/");
      const modelId = modelParts.join("/");
      if (!provider || !modelId) {
        throw new Error("Agent strategy requires model in format 'provider/model'");
      }
      return agent({
        provider,
        modelId,
        maxSteps: options?.maxSteps ?? 50,
      });
    }
    default:
      throw new Error(
        `Unsupported strategy: ${name}. Available: simple, parallel, sequential, parallelAutoMerge, sequentialAutoMerge, doublePass, doublePassAutoMerge, agent`,
      );
  }
}

export type ExtractParams = {
  artifacts: SerializedArtifact[];
  schema?: AnyJSONSchema;
  fields?: string;
  model: string;
  strategy?: string;
  chunkSize?: number;
  maxSteps?: number;
  strict: boolean;
};

export async function parseExtractRequest(c: Context): Promise<ExtractParams> {
  const contentType = c.req.header("Content-Type") || "";

  let artifacts: SerializedArtifact[] | undefined;
  let schema: AnyJSONSchema | undefined;
  let fields: string | undefined;
  let model: string | undefined;
  let strategy: string | undefined;
  let chunkSize: number | undefined;
  let maxSteps: number | undefined;
  let strict = false;

  // --- JSON mode ---
  if (contentType.includes("application/json")) {
    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      throw new HTTPException(400, { message: "Invalid JSON body" });
    }

    const rawArtifacts = body.artifacts;
    if (!Array.isArray(rawArtifacts)) {
      throw new HTTPException(400, { message: "'artifacts' must be an array" });
    }

    artifacts = rawArtifacts as SerializedArtifact[];

    if (body.schema && typeof body.schema === "object") {
      schema = body.schema as AnyJSONSchema;
    }
    if (body.fields && typeof body.fields === "string") {
      fields = body.fields;
    }
    if (!schema && !fields) {
      throw new HTTPException(400, { message: "Either 'schema' or 'fields' is required" });
    }

    if (!body.model || typeof body.model !== "string") {
      throw new HTTPException(400, { message: "'model' is required" });
    }
    model = body.model;

    if (body.strategy && typeof body.strategy === "string") {
      strategy = body.strategy;
    }
    if (body.chunkSize && typeof body.chunkSize === "number") {
      chunkSize = body.chunkSize;
    }
    if (body.maxSteps && typeof body.maxSteps === "number") {
      maxSteps = body.maxSteps;
    }
    if (body.strict === true) {
      strict = true;
    }
  }
  // --- Multipart mode ---
  else if (contentType.includes("multipart/form-data")) {
    const formData = await c.req.formData();

    const artifactsJson = formData.get("artifacts");
    const schemaJson = formData.get("schema");
    const fieldsValue = formData.get("fields") as string | null;
    const modelValue = formData.get("model") as string | null;
    const strategyValue = formData.get("strategy") as string | null;
    const chunkSizeValue = formData.get("chunkSize") as string | null;
    const maxStepsValue = formData.get("maxSteps") as string | null;
    strict = formData.get("strict") === "true";

    if (artifactsJson && typeof artifactsJson === "string") {
      try {
        const parsed = JSON.parse(artifactsJson);
        artifacts = validateSerializedArtifacts(parsed);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new HTTPException(400, { message: `Invalid artifacts JSON: ${message}` });
      }
    } else {
      const file = formData.get("file");
      if (file && file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || "application/octet-stream";
        const images = formData.get("images") === "true";
        const screenshots = formData.get("screenshots") === "true";

        try {
          const parsedArtifacts = await parse(
            { kind: "buffer", buffer, mimeType },
            { includeImages: images, screenshots },
          );
          artifacts = serializeArtifacts(parsedArtifacts);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new HTTPException(500, { message: `Parse error: ${message}` });
        }
      }
    }

    if (!artifacts) {
      throw new HTTPException(400, { message: "'artifacts' or 'file' is required" });
    }

    if (schemaJson && typeof schemaJson === "string") {
      try {
        schema = JSON.parse(schemaJson) as AnyJSONSchema;
      } catch {
        throw new HTTPException(400, { message: "Invalid schema JSON" });
      }
    }

    if (fieldsValue) {
      fields = fieldsValue;
    }

    if (!schema && !fields) {
      throw new HTTPException(400, { message: "Either 'schema' or 'fields' is required" });
    }

    if (!modelValue) {
      throw new HTTPException(400, { message: "'model' is required" });
    }
    model = modelValue;

    if (strategyValue) strategy = strategyValue;
    if (chunkSizeValue) chunkSize = parseInt(chunkSizeValue, 10);
    if (maxStepsValue) maxSteps = parseInt(maxStepsValue, 10);
  }
  // --- Form URL-encoded mode ---
  else if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await c.req.parseBody();

    const artifactsJson = formData.artifacts;
    const schemaJson = formData.schema;
    const fieldsValue = formData.fields as string | undefined;
    const modelValue = formData.model as string | undefined;
    const strategyValue = formData.strategy as string | undefined;
    const chunkSizeValue = formData.chunkSize as string | undefined;
    const maxStepsValue = formData.maxSteps as string | undefined;
    strict = formData.strict === "true";

    if (artifactsJson && typeof artifactsJson === "string") {
      try {
        const parsed = JSON.parse(artifactsJson);
        artifacts = validateSerializedArtifacts(parsed);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new HTTPException(400, { message: `Invalid artifacts JSON: ${message}` });
      }
    }

    if (!artifacts) {
      throw new HTTPException(400, { message: "'artifacts' is required for form-urlencoded requests" });
    }

    if (schemaJson && typeof schemaJson === "string") {
      try {
        schema = JSON.parse(schemaJson) as AnyJSONSchema;
      } catch {
        throw new HTTPException(400, { message: "Invalid schema JSON" });
      }
    }

    if (fieldsValue) {
      fields = fieldsValue;
    }

    if (!schema && !fields) {
      throw new HTTPException(400, { message: "Either 'schema' or 'fields' is required" });
    }

    if (!modelValue) {
      throw new HTTPException(400, { message: "'model' is required" });
    }
    model = modelValue;

    if (strategyValue) strategy = strategyValue;
    if (chunkSizeValue) chunkSize = parseInt(chunkSizeValue, 10);
    if (maxStepsValue) maxSteps = parseInt(maxStepsValue, 10);
  } else {
    throw new HTTPException(400, {
      message: "Content-Type must be application/json, multipart/form-data, or application/x-www-form-urlencoded",
    });
  }

  return {
    artifacts,
    schema,
    fields,
    model,
    strategy,
    chunkSize,
    maxSteps,
    strict,
  };
}

export { extract, hydrateSerializedArtifacts };

export type StreamEvent =
  | { type: "step"; data: { step: number; total?: number; label?: string; detail?: string } }
  | { type: "progress"; data: { current: number; total: number; percent?: number } }
  | { type: "message"; data: { role: string; content: unknown } }
  | { type: "tokenUsage"; data: { inputTokens: number; outputTokens: number; totalTokens: number; model?: string } }
  | { type: "retry"; data: { attempt: number; maxAttempts: number; reason?: string } }
  | { type: "agent_tool_start"; data: { toolName: string; toolCallId: string; args: Record<string, unknown> } }
  | { type: "agent_tool_end"; data: { toolCallId: string; result?: Record<string, unknown>; error?: string } }
  | { type: "agent_message"; data: { content: string; role?: string } }
  | { type: "agent_reasoning"; data: { thought: string } }
  | { type: "complete"; data: { data: unknown; usage: { inputTokens: number; outputTokens: number; totalTokens: number }; error?: string } }
  | { type: "error"; data: { message: string } };

export function createExtractionStream(params: ExtractParams): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: StreamEvent) => {
        const payload = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      const keepalive = setInterval(() => {
        controller.enqueue(encoder.encode(":\n\n"));
      }, 5000);

      try {
        const hydratedArtifacts: Artifact[] = hydrateSerializedArtifacts(params.artifacts);
        const resolvedModel = await resolveModelForEnv(params.model);
        const strat = createStrategy(params.strategy || "simple", resolvedModel, {
          chunkSize: params.chunkSize,
          maxSteps: params.maxSteps,
          modelSpec: params.model,
        });

        const result = await extract({
          artifacts: hydratedArtifacts,
          ...(params.schema ? { schema: params.schema } : { fields: params.fields }),
          strategy: strat,
          strict: params.strict,
          events: {
            onStep: (info) => send({ type: "step", data: info }),
            onProgress: (info) => send({ type: "progress", data: info }),
            onMessage: (info) => send({ type: "message", data: info }),
            onTokenUsage: (info) =>
              send({
                type: "tokenUsage",
                data: {
                  inputTokens: info.inputTokens,
                  outputTokens: info.outputTokens,
                  totalTokens: info.totalTokens,
                  model: info.model,
                },
              }),
            onRetry: (info) => send({ type: "retry", data: info }),
            onAgentToolStart: (info) => send({ type: "agent_tool_start", data: info }),
            onAgentToolEnd: (info) => send({ type: "agent_tool_end", data: info }),
            onAgentMessage: (info) => send({ type: "agent_message", data: info }),
            onAgentReasoning: (info) => send({ type: "agent_reasoning", data: info }),
          },
        });

        send({
          type: "complete",
          data: {
            data: result.data,
            usage: result.usage,
            error: result.error?.message,
          },
        });
      } catch (error) {
        send({
          type: "error",
          data: { message: error instanceof Error ? error.message : String(error) },
        });
      } finally {
        clearInterval(keepalive);
        controller.close();
      }
    },
  });
}
