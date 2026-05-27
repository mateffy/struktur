import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver } from "hono-openapi";
import { parse } from "@struktur/sdk";
import { ArtifactsResponseSchema } from "../schemas";
import { serializeArtifacts } from "../utils/serialize";

const app = new Hono();

app.post(
  "/parse",
  describeRoute({
    operationId: "parseFile",
    summary: "Parse a file into artifacts",
    description:
      "Upload a file (PDF, image, text, HTML, etc.) and receive a JSON array of artifacts containing the parsed content. Supports optional image extraction and screenshot generation for PDFs.",
    tags: ["Parse"],
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            required: ["file"],
            properties: {
              file: {
                type: "string",
                format: "binary",
                description: "The file to parse (PDF, image, text, HTML, etc.)",
              },
              images: {
                type: "string",
                enum: ["true", "false"],
                description: "Extract embedded images from PDFs",
              },
              screenshots: {
                type: "string",
                enum: ["true", "false"],
                description: "Render page screenshots (PDFs)",
              },
              screenshotScale: {
                type: "string",
                description: "Scale factor for screenshots (e.g. 2.0 for retina)",
              },
              screenshotWidth: {
                type: "string",
                description: "Target width in pixels for screenshots",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully parsed artifacts",
        content: {
          "application/json": {
            schema: resolver(ArtifactsResponseSchema),
          },
        },
      },
      400: {
        description: "Invalid request — missing file or wrong Content-Type",
      },
      500: {
        description: "Parse error — unsupported file type or parser failure",
      },
    },
  }),
  async (c) => {
    const contentType = c.req.header("Content-Type") || "";
    if (!contentType.includes("multipart/form-data")) {
      throw new HTTPException(400, { message: "Expected multipart/form-data" });
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
    const screenshotScaleRaw = formData.get("screenshotScale") as string | null;
    const screenshotWidthRaw = formData.get("screenshotWidth") as string | null;

    const screenshotScale = screenshotScaleRaw ? parseFloat(screenshotScaleRaw) : undefined;
    const screenshotWidth = screenshotWidthRaw ? parseInt(screenshotWidthRaw, 10) : undefined;

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
  },
);

export default app;
