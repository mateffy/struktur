import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { serve } from "bun";
import {
  extract,
  parse,
  validateSerializedArtifacts,
  hydrateSerializedArtifacts,
  detectMimeType,
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

const app = new Hono();

app.use("*", cors());

const authMiddleware = async (c: Context, next: () => Promise<void>) => {
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
    throw new HTTPException(401, { message: "Invalid Authorization header format. Use: Bearer <token>" });
  }

  if (token !== apiKey) {
    throw new HTTPException(401, { message: "Invalid API key" });
  }

  return next();
};

app.use("*", authMiddleware);

app.get("/", (c) => {
  return c.json({
    name: "struktur-http",
    version: "1.2.1",
    endpoints: {
      "POST /parse": "Parse uploaded files into artifact JSON",
      "POST /extract": "Extract structured data from documents or artifact JSON",
    },
  });
});

const serializeArtifacts = (artifacts: Artifact[]): SerializedArtifact[] => {
  return artifacts.map((a) => ({
    id: a.id,
    type: a.type,
    contents: a.contents.map((c): SerializedArtifactContent => ({
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
    })),
    ...(a.metadata ? { metadata: a.metadata } : {}),
  }));
};

app.post("/parse", async (c) => {
  const contentType = c.req.header("Content-Type") || "";

  if (!contentType.includes("multipart/form-data")) {
    throw new HTTPException(400, { message: "Content-Type must be multipart/form-data" });
  }

  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    throw new HTTPException(400, { message: "Missing 'file' in form data" });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  const images = formData.get("images") === "true";
  const screenshots = formData.get("screenshots") === "true";
  const screenshotScale = formData.get("screenshotScale") ? parseFloat(formData.get("screenshotScale") as string) : undefined;
  const screenshotWidth = formData.get("screenshotWidth") ? parseInt(formData.get("screenshotWidth") as string, 10) : undefined;

  try {
    const artifacts = await parse(
      { kind: "buffer", buffer, mimeType },
      {
        includeImages: images,
        screenshots,
        screenshotScale,
        screenshotWidth,
      }
    );

    const serialized = serializeArtifacts(artifacts);
    return c.json({ artifacts: serialized });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HTTPException(500, { message: `Parse error: ${message}` });
  }
});

type ExtractRequest = {
  artifacts?: SerializedArtifact[];
  schema?: AnyJSONSchema;
  fields?: string;
  model: string;
  strategy?: string;
  chunkSize?: number;
  maxSteps?: number;
  strict?: boolean;
};

const resolveModelForEnv = async (model: string) => {
  const [provider, ...rest] = model.split("/");
  const modelName = rest.join("/");

  if (!provider || !modelName) {
    throw new Error(`Invalid model format: ${model}. Expected format: provider/model (e.g., openai/gpt-4)`);
  }

  const envVar = `OPENAI_API_KEY`;
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
  options?: { chunkSize?: number; maxSteps?: number; modelSpec?: string }
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
        `Unsupported strategy: ${name}. Available: simple, parallel, sequential, parallelAutoMerge, sequentialAutoMerge, doublePass, doublePassAutoMerge, agent`
      );
  }
};

app.post("/extract", async (c) => {
  let body: ExtractRequest;

  const contentType = c.req.header("Content-Type") || "";

  if (contentType.includes("multipart/form-data")) {
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
          { includeImages: images, screenshots }
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

    body = {
      artifacts,
      schema,
      fields: fields || undefined,
      model: model || "",
      strategy: strategy || "simple",
      chunkSize: chunkSize ? parseInt(chunkSize, 10) : undefined,
      maxSteps: maxSteps ? parseInt(maxSteps, 10) : undefined,
      strict,
    };
  } else {
    body = await c.req.json();
  }

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
      ? hydrateSerializedArtifacts(body.artifacts)
      : [];

    const model = await resolveModelForEnv(body.model);
    const strategy = createStrategy(body.strategy || "simple", model, {
      chunkSize: body.chunkSize,
      maxSteps: body.maxSteps,
      modelSpec: body.model,
    });

    const result = await extract({
      artifacts: hydratedArtifacts,
      ...(body.schema ? { schema: body.schema } : { fields: body.fields }),
      strategy,
      strict: body.strict,
    });

    return c.json({
      data: result.data,
      usage: result.usage,
      error: result.error?.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HTTPException(500, { message: `Extraction error: ${message}` });
  }
});

const port = parseInt(process.env.PORT || "3031");

serve({
  port,
  fetch: app.fetch,
});

console.log(`struktur-http listening on http://localhost:${port}`);
