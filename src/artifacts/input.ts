import type { Artifact, ArtifactContent, ArtifactImage, ArtifactType } from "../types";
import { createAjv, validateOrThrow } from "../validation/validator";
import { defaultArtifactProviders, type ArtifactProviders } from "./providers";
import type { ParsersConfig } from "../parsers/types";
import { runParser } from "../parsers/runner";
import type { ParsePdfOptions } from "../parsers/pdf";

export type SerializedArtifactImage = Omit<ArtifactImage, "contents"> & {
  contents?: never;
};

export type SerializedArtifactContent = Omit<ArtifactContent, "media"> & {
  media?: SerializedArtifactImage[];
};

export type SerializedArtifact = Omit<Artifact, "raw" | "contents"> & {
  contents: SerializedArtifactContent[];
  raw?: never;
};

export type SerializedArtifacts = SerializedArtifact | SerializedArtifact[];

export type ArtifactInput =
  | { kind: "artifact-json"; data: unknown }
  | { kind: "text"; text: string; id?: string }
  | { kind: "file"; path: string; mimeType?: string; id?: string }
  | { kind: "buffer"; buffer: Buffer; mimeType: string; id?: string };

export type ArtifactInputParser = {
  name: string;
  canParse: (input: ArtifactInput) => boolean;
  parse: (
    input: ArtifactInput,
    options?: { 
      providers?: ArtifactProviders; 
      parsers?: ParsersConfig; 
      includeImages?: boolean;
      screenshots?: boolean;
      screenshotScale?: number;
      screenshotWidth?: number;
    }
  ) => Promise<Artifact[]>;
};

const serializedArtifactImageSchema = {
  type: "object",
  required: ["type"],
  properties: {
    type: { const: "image" },
    url: { type: "string", minLength: 1 },
    base64: { type: "string", minLength: 1 },
    text: { type: "string" },
    x: { type: "number" },
    y: { type: "number" },
    width: { type: "number" },
    height: { type: "number" },
    imageType: { enum: ["embedded", "screenshot"] },
  },
  additionalProperties: false,
  anyOf: [{ required: ["url"] }, { required: ["base64"] }],
};

const serializedArtifactContentSchema = {
  type: "object",
  properties: {
    page: { type: "number" },
    text: { type: "string" },
    media: { type: "array", items: serializedArtifactImageSchema },
  },
  additionalProperties: false,
  anyOf: [{ required: ["text"] }, { required: ["media"] }],
};

const serializedArtifactSchema = {
  type: "object",
  required: ["id", "type", "contents"],
  properties: {
    id: { type: "string", minLength: 1 },
    type: { enum: ["text", "image", "pdf", "file"] as ArtifactType[] },
    contents: { type: "array", items: serializedArtifactContentSchema },
    metadata: { type: "object", additionalProperties: true },
    tokens: { type: "number" },
  },
  additionalProperties: false,
};

const serializedArtifactsSchema = {
  anyOf: [
    serializedArtifactSchema,
    { type: "array", items: serializedArtifactSchema },
  ],
};

const inputParsers: ArtifactInputParser[] = [];

export const registerArtifactInputParser = (parser: ArtifactInputParser) => {
  inputParsers.push(parser);
};

export const clearArtifactInputParsers = () => {
  inputParsers.length = 0;
};

export const validateSerializedArtifacts = (data: unknown): SerializedArtifact[] => {
  const ajv = createAjv();
  const parsed = validateOrThrow<SerializedArtifacts>(
    ajv,
    serializedArtifactsSchema,
    data
  );
  return Array.isArray(parsed) ? parsed : [parsed];
};

export const hydrateSerializedArtifacts = (items: SerializedArtifact[]): Artifact[] => {
  return items.map((item) => ({
    ...item,
    raw: async () => Buffer.from(JSON.stringify(item.contents ?? [])),
  }));
};

export const parseSerializedArtifacts = (text: string): SerializedArtifact[] => {
  const parsed = JSON.parse(text) as unknown;
  return validateSerializedArtifacts(parsed);
};

export const splitTextIntoContents = (text: string): ArtifactContent[] => {
  const blocks = text
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  if (blocks.length === 0) {
    return [{ text }];
  }

  return blocks.map((block) => ({ text: block }));
};

const detectMimeType = async (path: string) => {
  const file = Bun.file(path);
  const type = file.type?.trim();
  return type && type.length > 0 ? type : "application/octet-stream";
};

const bufferToTextArtifact = (buffer: Buffer, id?: string): Artifact => {
  const text = buffer.toString();
  return {
    id: id ?? `artifact-${crypto.randomUUID()}`,
    type: "text",
    raw: async () => buffer,
    contents: splitTextIntoContents(text),
  };
};

const bufferToImageArtifact = (buffer: Buffer, id?: string): Artifact => {
  return {
    id: id ?? `artifact-${crypto.randomUUID()}`,
    type: "image",
    raw: async () => buffer,
    contents: [
      {
        media: [{ type: "image", contents: buffer }],
      },
    ],
  };
};

const parseBufferInput = async (
  buffer: Buffer,
  mimeType: string,
  id?: string,
  providers?: ArtifactProviders,
  parsers?: ParsersConfig,
  includeImages?: boolean,
  screenshots?: boolean,
  screenshotScale?: number,
  screenshotWidth?: number,
): Promise<Artifact[]> => {
  // Resolution order:
  // 1. parsers config (custom ParserDef) — if MIME type has a configured parser, use it
  if (parsers) {
    const parserDef = parsers[mimeType];
    if (parserDef) {
      return runParser(parserDef, { kind: "buffer", buffer }, mimeType);
    }
  }

  // 2. providers registry (user-registered ArtifactProvider functions)
  const registry = providers ?? defaultArtifactProviders;
  const provider = registry[mimeType];
  if (provider) {
    return [await provider(buffer)];
  }

  // JSON auto-detection: if MIME is application/json, try to parse as SerializedArtifact[]
  if (mimeType === "application/json") {
    try {
      const parsed = JSON.parse(buffer.toString()) as unknown;
      const serialized = validateSerializedArtifacts(parsed);
      return hydrateSerializedArtifacts(serialized);
    } catch {
      // If no custom parser is configured for application/json, throw clear error
      throw new Error(
        "Input is JSON but not in SerializedArtifact format. To parse arbitrary JSON files, configure a parser: struktur config parsers add --mime application/json ..."
      );
    }
  }

  // 3. Built-in PDF → pdf artifact
  if (mimeType === "application/pdf") {
    const { parsePdf } = await import("../parsers/pdf");
    const pdfOptions: ParsePdfOptions = { 
      includeImages, 
      screenshots, 
      screenshotScale, 
      screenshotWidth 
    };
    return [await parsePdf(buffer, pdfOptions)];
  }

  // 4. Built-in text/* → text artifact
  if (mimeType.startsWith("text/")) {
    return [bufferToTextArtifact(buffer, id)];
  }

  // 5. Built-in image/* → image artifact
  if (mimeType.startsWith("image/")) {
    return [bufferToImageArtifact(buffer, id)];
  }

  throw new Error(`Unsupported MIME type: ${mimeType}`);
};

const artifactJsonParser: ArtifactInputParser = {
  name: "artifact-json",
  canParse: (input) => input.kind === "artifact-json",
  parse: async (input) => {
    if (input.kind !== "artifact-json") {
      return [];
    }
    const serialized = validateSerializedArtifacts(input.data);
    return hydrateSerializedArtifacts(serialized);
  },
};

const textParser: ArtifactInputParser = {
  name: "text",
  canParse: (input) => input.kind === "text",
  parse: async (input) => {
    if (input.kind !== "text") {
      return [];
    }
    const buffer = Buffer.from(input.text);
    return [bufferToTextArtifact(buffer, input.id)];
  },
};

const fileParser: ArtifactInputParser = {
  name: "file",
  canParse: (input) => input.kind === "file",
  parse: async (input, options) => {
    if (input.kind !== "file") {
      return [];
    }
    const mimeType = input.mimeType ?? (await detectMimeType(input.path));

    // JSON auto-detection: if MIME type is application/json, first try to validate as SerializedArtifact[]
    if (mimeType === "application/json") {
      const text = await Bun.file(input.path).text();
      try {
        const parsed = JSON.parse(text) as unknown;
        const serialized = validateSerializedArtifacts(parsed);
        return hydrateSerializedArtifacts(serialized);
      } catch {
        // Not valid artifact JSON — try custom parser or throw
        if (options?.parsers) {
          const parserDef = options.parsers[mimeType];
          if (parserDef) {
            return runParser(parserDef, { kind: "file", path: input.path }, mimeType);
          }
        }
        throw new Error(
          `File "${input.path}" is JSON but not in SerializedArtifact format. To parse arbitrary JSON files, configure a parser: struktur config parsers add --mime application/json ...`
        );
      }
    }

    const file = Bun.file(input.path);
    const buffer = Buffer.from(await file.arrayBuffer());
    return parseBufferInput(
      buffer, 
      mimeType, 
      input.id, 
      options?.providers, 
      options?.parsers, 
      options?.includeImages,
      options?.screenshots,
      options?.screenshotScale,
      options?.screenshotWidth,
    );
  },
};

const bufferParser: ArtifactInputParser = {
  name: "buffer",
  canParse: (input) => input.kind === "buffer",
  parse: async (input, options) => {
    if (input.kind !== "buffer") {
      return [];
    }
    return parseBufferInput(
      input.buffer,
      input.mimeType,
      input.id,
      options?.providers,
      options?.parsers,
      options?.includeImages,
      options?.screenshots,
      options?.screenshotScale,
      options?.screenshotWidth,
    );
  },
};

export const parse = async (
  input: ArtifactInput,
  options?: { 
    parsers?: ArtifactInputParser[]; 
    providers?: ArtifactProviders; 
    parserConfig?: ParsersConfig; 
    includeImages?: boolean;
    screenshots?: boolean;
    screenshotScale?: number;
    screenshotWidth?: number;
  }
): Promise<Artifact[]> => {
  const parsers =
    options?.parsers ??
    [
      ...inputParsers,
      artifactJsonParser,
      textParser,
      fileParser,
      bufferParser,
    ];
  const parser = parsers.find((candidate) => candidate.canParse(input));

  if (!parser) {
    throw new Error(`No artifact input parser available for ${input.kind}`);
  }

  return parser.parse(input, { 
    providers: options?.providers, 
    parsers: options?.parserConfig, 
    includeImages: options?.includeImages,
    screenshots: options?.screenshots,
    screenshotScale: options?.screenshotScale,
    screenshotWidth: options?.screenshotWidth,
  });
};
