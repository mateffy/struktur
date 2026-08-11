import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { ExtractRequestSchema } from "../schemas";
import {
  parseExtractRequest,
  createExtractionStream,
} from "../utils/extraction";

const app = new Hono();

const extractJsonSchema = ExtractRequestSchema.toJSONSchema() as Record<string, unknown>;

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
    const stream = createExtractionStream(params);
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
