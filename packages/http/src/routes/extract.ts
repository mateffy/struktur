import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver } from "hono-openapi";
import { type Artifact, extract } from "@struktur/sdk";
import { ExtractRequestSchema, ExtractResponseSchema } from "../schemas";
import {
  createStrategy,
  hydrateSerializedArtifacts,
  parseExtractRequest,
  resolveModelForEnv,
  createExtractionStream,
} from "../utils/extraction";

const app = new Hono();

const extractJsonSchema = ExtractRequestSchema.toJSONSchema() as Record<string, unknown>;

app.post(
  "/extract",
  describeRoute({
    operationId: "extractData",
    summary: "Extract structured data",
    description:
      "Run an LLM-powered extraction over artifacts or an uploaded file.\n\n" +
      "**JSON mode** — send `application/json` with pre-parsed `artifacts` and a `schema` or `fields` shorthand.\n" +
      "**Multipart mode** — send `multipart/form-data` with a `file` (parsed on-the-fly) plus extraction parameters.\n" +
      "**Form mode** — send `application/x-www-form-urlencoded` with pre-parsed `artifacts` and extraction parameters.\n\n" +
      "By default, returns a `text/event-stream` of progress events via SSE. " +
      "Disable streaming with `?sse=false` to receive a plain JSON response.\n\n" +
      "Available strategies: `simple`, `parallel`, `sequential`, `parallelAutoMerge`, `sequentialAutoMerge`, `doublePass`, `doublePassAutoMerge`, `agent`.",
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
        description: "SSE stream of extraction events, or plain JSON when `?sse=false`",
        content: {
          "text/event-stream": {
            schema: { type: "string", description: "Server-Sent Events stream" },
          },
          "application/json": {
            schema: resolver(ExtractResponseSchema),
          },
        },
      },
      400: {
        description: "Invalid request — missing required fields or malformed input",
      },
      500: {
        description: "Extraction error — model failure, parser error, or unexpected exception",
      },
    },
  }),
  async (c) => {
    const params = await parseExtractRequest(c);
    const sse = c.req.query("sse") !== "false";

    if (sse) {
      const stream = createExtractionStream(params);
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

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
      });

      return c.json(
        {
          data: result.data,
          usage: result.usage,
          error: result.error?.message || undefined,
        },
        200,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HTTPException(500, { message: `Extraction error: ${message}` });
    }
  },
);

export default app;
