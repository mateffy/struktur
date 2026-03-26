import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { serve } from "bun";
import {
  extract,
  parse,
  validateSerializedArtifacts,
  hydrateSerializedArtifacts,
  resolveModel,
  simple,
  parallel,
  sequential,
  parallelAutoMerge,
  sequentialAutoMerge,
  doublePass,
  doublePassAutoMerge,
  agent,
} from "@struktur/sdk";
import type {
  AnyJSONSchema,
  Artifact,
  ExtractionStrategy,
  SerializedArtifact,
  SerializedArtifactContent,
} from "@struktur/sdk";

type Env = {
  API_KEY: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  OPENCODE_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
};

const env: Env = {
  API_KEY: process.env.API_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  OPENCODE_API_KEY: process.env.OPENCODE_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
};

// ============================================================================
// Zod Schemas
// ============================================================================

const MediaSchema = z
  .object({
    type: z.literal("image"),
    url: z.string().optional(),
    base64: z.string().optional(),
    text: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    imageType: z.string().optional(),
  })
  .openapi("Media", {
    description: "Media object representing an image",
    example: {
      type: "image",
      url: "https://example.com/image.png",
      width: 800,
      height: 600,
    },
  });

const ArtifactContentSchema = z
  .object({
    page: z.number().optional(),
    text: z.string().optional(),
    media: z.array(MediaSchema).optional(),
  })
  .openapi("ArtifactContent", {
    description: "Content of an artifact",
    example: {
      page: 1,
      text: "Content text here...",
    },
  });

const ArtifactSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    contents: z.array(ArtifactContentSchema),
    metadata: z.record(z.unknown()).optional(),
  })
  .openapi("Artifact", {
    description: "An artifact containing parsed content",
    example: {
      id: "art-123",
      type: "text",
      contents: [{ text: "Hello world" }],
      metadata: { filename: "document.txt" },
    },
  });

const ArtifactsResponseSchema = z
  .object({
    artifacts: z.array(ArtifactSchema),
  })
  .openapi("ArtifactsResponse", {
    description: "Response containing parsed artifacts",
    example: {
      artifacts: [
        {
          id: "art-123",
          type: "text",
          contents: [{ text: "Hello world" }],
        },
      ],
    },
  });

const ParseRequestSchema = z
  .object({
    file: z.instanceof(File),
    images: z.enum(["true", "false"]).optional(),
    screenshots: z.enum(["true", "false"]).optional(),
    screenshotScale: z.string().optional(),
    screenshotWidth: z.string().optional(),
  })
  .openapi("ParseRequest", {
    description: "Request to parse a file into artifacts",
  });

const ExtractRequestSchema = z
  .object({
    artifacts: z.array(ArtifactSchema).optional(),
    schema: z.record(z.unknown()).optional(),
    fields: z.string().optional(),
    model: z.string(),
    strategy: z
      .enum([
        "simple",
        "parallel",
        "sequential",
        "parallelAutoMerge",
        "sequentialAutoMerge",
        "doublePass",
        "doublePassAutoMerge",
        "agent",
      ])
      .optional(),
    chunkSize: z.number().optional(),
    maxSteps: z.number().optional(),
    strict: z.boolean().optional(),
  })
  .openapi("ExtractRequest", {
    description: "Request to extract structured data from artifacts",
    example: {
      artifacts: [
        {
          id: "art-1",
          type: "text",
          contents: [{ text: "John Doe works at Acme Corp" }],
        },
      ],
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          company: { type: "string" },
        },
      },
      model: "openai/gpt-4",
      strategy: "simple",
    },
  });

const UsageSchema = z
  .object({
    inputTokens: z.number(),
    outputTokens: z.number(),
    totalTokens: z.number(),
  })
  .openapi("Usage", {
    description: "Token usage information",
    example: {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    },
  });

const ExtractResponseSchema = z
  .object({
    data: z.unknown(),
    usage: UsageSchema,
    error: z.string().optional(),
  })
  .openapi("ExtractResponse", {
    description: "Extraction result",
    example: {
      data: { name: "John Doe", company: "Acme Corp" },
      usage: {
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      },
    },
  });

const ErrorResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("ErrorResponse", {
    description: "Error response",
    example: {
      message: "Invalid request",
    },
  });

const APIInfoSchema = z
  .object({
    name: z.string(),
    version: z.string(),
    endpoints: z.record(z.string()),
  })
  .openapi("APIInfo", {
    description: "API information",
    example: {
      name: "struktur-http",
      version: "1.2.1",
      endpoints: {
        "POST /parse": "Parse uploaded files into artifact JSON",
        "POST /extract": "Extract structured data from documents or artifact JSON",
      },
    },
  });

// ============================================================================
// App Setup
// ============================================================================

const app = new OpenAPIHono();

app.use("*", cors());

const authMiddleware = async (c: any, next: () => Promise<void>) => {
  const apiKey = env.API_KEY;
  if (!apiKey) {
    return next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    throw new HTTPException(401, { message: "Missing Authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new HTTPException(401, {
      message: "Invalid Authorization header format. Use: Bearer <token>",
    });
  }

  if (token !== apiKey) {
    throw new HTTPException(401, { message: "Invalid API key" });
  }

  return next();
};

app.use("*", authMiddleware);

// ============================================================================
// Routes
// ============================================================================

const indexRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Info"],
  description: "Returns API information and available endpoints",
  responses: {
    200: {
      description: "API information",
      content: {
        "application/json": {
          schema: APIInfoSchema,
        },
      },
    },
  },
});

app.openapi(indexRoute, (c) => {
  return c.json(
    {
      name: "struktur-http",
      version: "1.2.1",
      endpoints: {
        "POST /parse": "Parse uploaded files into artifact JSON",
        "POST /extract": "Extract structured data from documents or artifact JSON",
      },
    },
    200,
  );
});

// ============================================================================
// Parse Route
// ============================================================================

const parseRoute = createRoute({
  method: "post",
  path: "/parse",
  tags: ["Parse"],
  description: "Parse uploaded files into artifact JSON",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: ParseRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully parsed artifacts",
      content: {
        "application/json": {
          schema: ArtifactsResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Parse error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const serializeArtifacts = (artifacts: Artifact[]): SerializedArtifact[] => {
  return artifacts.map((a) => ({
    id: a.id,
    type: a.type,
    contents: a.contents.map(
      (c): SerializedArtifactContent => ({
        ...(c.page !== undefined ? { page: c.page } : {}),
        ...(c.text !== undefined ? { text: c.text } : {}),
        ...(c.media
          ? {
              media: c.media.map((m) => ({
                type: "image" as const,
                ...(m.url ? { url: m.url } : {}),
                ...(m.base64 ? { base64: m.base64 } : {}),
                ...(m.contents ? { base64: m.contents.toString("base64") } : {}),
                ...(m.text ? { text: m.text } : {}),
                ...(m.width !== undefined ? { width: m.width } : {}),
                ...(m.height !== undefined ? { height: m.height } : {}),
                ...(m.imageType ? { imageType: m.imageType } : {}),
              })),
            }
          : {}),
      }),
    ),
    ...(a.metadata ? { metadata: a.metadata } : {}),
  }));
};

app.openapi(parseRoute, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    throw new HTTPException(400, { message: "Missing 'file' in form data" });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  const images = formData.get("images") === "true";
  const screenshots = formData.get("screenshots") === "true";
  const screenshotScale = formData.get("screenshotScale")
    ? parseFloat(formData.get("screenshotScale") as string)
    : undefined;
  const screenshotWidth = formData.get("screenshotWidth")
    ? parseInt(formData.get("screenshotWidth") as string, 10)
    : undefined;

  try {
    const artifacts = await parse(
      { kind: "buffer", buffer, mimeType },
      {
        includeImages: images,
        screenshots,
        screenshotScale,
        screenshotWidth,
      },
    );

    const serialized = serializeArtifacts(artifacts);
    return c.json({ artifacts: serialized }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HTTPException(500, { message: `Parse error: ${message}` });
  }
});

// ============================================================================
// Extract Route
// ============================================================================

const extractJsonRoute = createRoute({
  method: "post",
  path: "/extract",
  tags: ["Extract"],
  description: "Extract structured data from artifacts using JSON request body",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ExtractRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully extracted data",
      content: {
        "application/json": {
          schema: ExtractResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Extraction error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const resolveModelForEnv = async (model: string) => {
  const [provider, ...rest] = model.split("/");
  const modelName = rest.join("/");

  if (!provider || !modelName) {
    throw new Error(
      `Invalid model format: ${model}. Expected format: provider/model (e.g., openai/gpt-4)`,
    );
  }

  if (provider === "openai" && !process.env.OPENAI_API_KEY && env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  }
  if (provider === "google" && !process.env.GOOGLE_API_KEY && env.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = env.GOOGLE_API_KEY;
  }
  if (provider === "opencode" && !process.env.OPENCODE_API_KEY && env.OPENCODE_API_KEY) {
    process.env.OPENCODE_API_KEY = env.OPENCODE_API_KEY;
  }
  if (provider === "openrouter" && !process.env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY) {
    process.env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
  }

  return resolveModel(model);
};

const createStrategy = (
  name: string,
  model: unknown,
  options?: { chunkSize?: number; maxSteps?: number; modelSpec?: string },
): ExtractionStrategy<unknown> => {
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
};

app.openapi(extractJsonRoute, async (c) => {
  const body = c.req.valid("json");

  if (!body.artifacts) {
    throw new HTTPException(400, { message: "'artifacts' is required" });
  }

  if (!body.schema && !body.fields) {
    throw new HTTPException(400, { message: "Either 'schema' or 'fields' is required" });
  }

  if (!body.model) {
    throw new HTTPException(400, { message: "'model' is required" });
  }

  try {
    const hydratedArtifacts: Artifact[] = body.artifacts
      ? hydrateSerializedArtifacts(body.artifacts as SerializedArtifact[])
      : [];

    const model = await resolveModelForEnv(body.model);
    const strategy = createStrategy(body.strategy || "simple", model, {
      chunkSize: body.chunkSize,
      maxSteps: body.maxSteps,
      modelSpec: body.model,
    });

    const result = await extract({
      artifacts: hydratedArtifacts,
      ...(body.schema ? { schema: body.schema as AnyJSONSchema } : { fields: body.fields }),
      strategy,
      strict: body.strict,
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
});

// ============================================================================
// Extract Route (Form Data) - Custom handler for multipart/form-data
// ============================================================================

app.use("/extract", async (c, next) => {
  const contentType = c.req.header("Content-Type") || "";

  if (contentType.includes("multipart/form-data")) {
    // Handle form data
    const formData = await c.req.formData();

    const artifactsJson = formData.get("artifacts");
    const schemaJson = formData.get("schema");
    const fields = formData.get("fields") as string | null;
    const model = formData.get("model") as string | null;
    const strategy = formData.get("strategy") as string | null;
    const chunkSize = formData.get("chunkSize") as string | null;
    const maxSteps = formData.get("maxSteps") as string | null;
    const strict = formData.get("strict") === "true";

    const file = formData.get("file");
    let artifacts: SerializedArtifact[] | undefined;

    if (artifactsJson && typeof artifactsJson === "string") {
      try {
        const parsed = JSON.parse(artifactsJson);
        artifacts = validateSerializedArtifacts(parsed);
      } catch {
        throw new HTTPException(400, { message: "Invalid artifacts JSON" });
      }
    } else if (file && file instanceof File) {
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

    let schema: AnyJSONSchema | undefined;
    if (schemaJson && typeof schemaJson === "string") {
      try {
        schema = JSON.parse(schemaJson);
      } catch {
        throw new HTTPException(400, { message: "Invalid schema JSON" });
      }
    }

    if (!artifacts) {
      throw new HTTPException(400, { message: "'artifacts' or 'file' is required" });
    }

    if (!schema && !fields) {
      throw new HTTPException(400, { message: "Either 'schema' or 'fields' is required" });
    }

    if (!model) {
      throw new HTTPException(400, { message: "'model' is required" });
    }

    try {
      const hydratedArtifacts: Artifact[] = hydrateSerializedArtifacts(artifacts);

      const resolvedModel = await resolveModelForEnv(model);
      const strat = createStrategy(strategy || "simple", resolvedModel, {
        chunkSize: chunkSize ? parseInt(chunkSize, 10) : undefined,
        maxSteps: maxSteps ? parseInt(maxSteps, 10) : undefined,
        modelSpec: model,
      });

      const result = await extract({
        artifacts: hydratedArtifacts,
        ...(schema ? { schema } : { fields: fields || undefined }),
        strategy: strat,
        strict,
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
  }

  return next();
});

// ============================================================================
// OpenAPI Documentation
// ============================================================================

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Struktur HTTP API",
    version: "1.2.1",
    description:
      "HTTP API for running Struktur headlessly. Parse files into artifacts and extract structured data using LLMs.",
  },
  servers: [
    {
      url: "http://localhost:3031",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Info", description: "API information" },
    { name: "Parse", description: "File parsing operations" },
    { name: "Extract", description: "Data extraction operations" },
  ],
});

// ============================================================================
// Start Server
// ============================================================================

const port = parseInt(process.env.PORT || "3031");

serve({
  port,
  fetch: app.fetch,
});

console.log(`struktur-http listening on http://localhost:${port}`);
console.log(`OpenAPI documentation available at http://localhost:${port}/openapi.json`);
