import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute } from "hono-openapi";
import { type Artifact, extract } from "@struktur/sdk";
import { ExtractRequestSchema } from "../schemas";
import {
  createStrategy,
  hydrateSerializedArtifacts,
  parseExtractRequest,
  resolveModelForEnv,
} from "../utils/extraction";

const app = new Hono();

const extractJsonSchema = ExtractRequestSchema.toJSONSchema() as Record<string, unknown>;

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

app.post(
  "/extract/stream",
  describeRoute({
    operationId: "extractDataStream",
    summary: "Extract structured data (streaming)",
    description:
      "Run an LLM-powered extraction and receive real-time progress via Server-Sent Events (SSE).\n\n" +
      "Accepts the same request formats as `POST /extract`. Returns a `text/event-stream` where each event is a JSON object with a `type` field.\n\n" +
      "Event types: `step`, `progress`, `message`, `tokenUsage`, `retry`, `agent_tool_start`, `agent_tool_end`, `agent_message`, `agent_reasoning`, `complete`, `error`.",
    tags: ["Extract"],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: extractJsonSchema,
        },
        "application/x-www-form-urlencoded": {
          schema: {
            type: "object",
            required: ["model"],
            properties: {
              artifacts: {
                type: "string",
                description: "Pre-parsed artifact JSON string (alternative to file)",
              },
              schema: {
                type: "string",
                description: "JSON Schema string describing the desired output shape",
              },
              fields: {
                type: "string",
                description: "Shorthand field list, e.g. name,age:number,emails:array{string}",
              },
              model: {
                type: "string",
                description: "Model identifier, e.g. openai/gpt-4o-mini",
              },
              strategy: {
                type: "string",
                enum: [
                  "simple",
                  "parallel",
                  "sequential",
                  "parallelAutoMerge",
                  "sequentialAutoMerge",
                  "doublePass",
                  "doublePassAutoMerge",
                  "agent",
                ],
                description: "Extraction strategy (default: simple)",
              },
              chunkSize: {
                type: "string",
                description: "Token budget per batch for chunking strategies (default: 10000)",
              },
              maxSteps: {
                type: "string",
                description: "Maximum agent steps when using the agent strategy",
              },
              strict: {
                type: "string",
                enum: ["true", "false"],
                description: "Enable strict schema validation",
              },
            },
          },
        },
        "multipart/form-data": {
          schema: {
            type: "object",
            required: ["model"],
            properties: {
              file: {
                type: "string",
                format: "binary",
                description: "File to parse and extract from (alternative to pre-parsed artifacts)",
              },
              artifacts: {
                type: "string",
                description: "Pre-parsed artifact JSON string (alternative to file)",
              },
              schema: {
                type: "string",
                description: "JSON Schema string describing the desired output shape",
              },
              fields: {
                type: "string",
                description: "Shorthand field list, e.g. name,age:number,emails:array{string}",
              },
              model: {
                type: "string",
                description: "Model identifier, e.g. openai/gpt-4o-mini",
              },
              strategy: {
                type: "string",
                enum: [
                  "simple",
                  "parallel",
                  "sequential",
                  "parallelAutoMerge",
                  "sequentialAutoMerge",
                  "doublePass",
                  "doublePassAutoMerge",
                  "agent",
                ],
                description: "Extraction strategy (default: simple)",
              },
              chunkSize: {
                type: "string",
                description: "Token budget per batch for chunking strategies (default: 10000)",
              },
              maxSteps: {
                type: "string",
                description: "Maximum agent steps when using the agent strategy",
              },
              strict: {
                type: "string",
                enum: ["true", "false"],
                description: "Enable strict schema validation",
              },
              images: {
                type: "string",
                enum: ["true", "false"],
                description: "Extract embedded images when parsing a file (PDFs)",
              },
              screenshots: {
                type: "string",
                enum: ["true", "false"],
                description: "Render page screenshots when parsing a file (PDFs)",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "SSE stream of extraction events",
        content: {
          "text/event-stream": {
            schema: { type: "string", description: "Server-Sent Events stream" },
          },
        },
      },
      400: {
        description: "Invalid request",
      },
      500: {
        description: "Extraction error",
      },
    },
  }),
  async (c) => {
    const params = await parseExtractRequest(c);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const send = (event: StreamEvent) => {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        // SSE keepalive: send comment pings every 5s to prevent connection timeout
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

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  },
);

export default app;
