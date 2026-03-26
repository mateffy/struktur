import {
  parse,
  parseSerializedArtifacts,
  detectMimeType,
  resolveCheapestModel,
  getDefaultModel,
  listParsers,
  resolveAlias,
  listStoredProviders,
} from "@struktur/sdk";
import type { NpmParserDef, ParsersConfig, AnyJSONSchema, Artifact, NpmParserEntry } from "@struktur/sdk";
import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";

export type ParsedArgs = {
  command?: string;
  options: Record<string, string | boolean>;
  positionals: string[];
};

export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
    // Remove stack trace for user errors
    Error.captureStackTrace?.(this, UserError);
    Object.defineProperty(this, "stack", {
      get: () => `${this.name}: ${this.message}`,
      enumerable: false,
      configurable: true,
    });
  }
}

export const usage = () => {
  return [
    "struktur [command] [options]",
    "",
    "Commands (default: extract-file):",
    "  extract-file   Extract data from input into JSON (default)",
    "  verify         Validate artifact JSON from file or stdin",
    "  auth           Manage provider API tokens",
    "  models         List available provider models",
    "",
    "extract options (default command):",
    "  --input <path>           Input file to parse",
    "  --text <string>          Raw text input",
    "  --stdin                  Read from stdin (auto-detects artifact JSON or raw text)",
    "  --artifact-file <path|url> Artifact JSON file or URL",
    "  --artifact-json <json>   Artifact JSON string",
    "  --schema <path|url>      JSON schema file or URL",
    "  --schema-json <json>     JSON schema string",
    "  --model <provider/model> Model identifier (e.g. openai/gpt-5, default: configured or cheapest)",
    "  --output <path|->        Output path or stdout (default: -)",
    "  --strategy <name>        Strategy name (simple|parallel|sequential|parallelAutoMerge|sequentialAutoMerge|doublePass|doublePassAutoMerge|agent, default: agent)",
    "  --chunk-size <number>    Token budget per batch for chunked strategies (default: 10000)",
    "  --max-steps <number>        Maximum agent steps per iteration for agent strategy (default: 50)",
    "  --max-iterations <number>  Maximum iteration loops - restart with clean context and carry over extracted data (default: 1)",
    "",
    "auth commands:",
    "  auth set     --provider <name> --token <token>",
    "  auth set     --provider <name> --token-stdin",
    "  auth default <provider>",
    "  auth default --model <provider/model>",
    "  auth get    --provider <name> [--raw]",
    "  auth delete --provider <name>",
    "  auth list",
    "",
    "auth options:",
    "  --provider <name>        Provider id (openai, anthropic, google, opencode, openrouter)",
    "  --model <provider/model> Default model identifier",
    "  --token <token>          API token value",
    "  --token-stdin            Read token from stdin",
    "  --storage <auto|keychain|file> Storage (default: auto)",
    "  --default                Set default model for provider",
    "  --raw                    Print token without masking",
    "",
    "models options:",
    "  --provider <name>        Provider id to query",
    "  --all                    Query all supported providers (default)",
    "",
    "verify options:",
    "  --input <path|->         Artifact JSON file or stdin",
    "",
    "Global:",
    "  -h, --help               Show help",
  ].join("\n");
};

export const parseArgs = (argv: string[]): ParsedArgs => {
  const options: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  let command: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg) {
      continue;
    }

    if (!command && !arg.startsWith("-")) {
      command = arg;
      continue;
    }

    if (arg === "-h" || arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg.startsWith("--")) {
      const [key, inlineValue] = arg.slice(2).split("=", 2);
      if (!key) {
        continue;
      }
      if (inlineValue !== undefined) {
        options[key] = inlineValue;
        continue;
      }
      const next = argv[index + 1];
      if (next && !next.startsWith("-")) {
        options[key] = next;
        index += 1;
      } else {
        options[key] = true;
      }
      continue;
    }

    positionals.push(arg);
  }

  return { command, options, positionals };
};

export let stdinConsumed = false;

export const readStdinText = async () => {
  stdinConsumed = true;
  return await new Response(process.stdin).text();
};

export const readJsonFile = async (path: string) => {
  const text = await readFile(path, "utf-8");
  return JSON.parse(text) as unknown;
};

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const parseSchemaText = (source: string, text: string) => {
  try {
    return JSON.parse(text) as AnyJSONSchema;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Schema at ${source} is not valid JSON: ${message}`);
  }
};

const fetchSchemaFromUrl = async (url: string): Promise<AnyJSONSchema> => {
  const response = await fetch(url, {
    headers: {
      accept: "application/schema+json, application/json;q=0.9, */*;q=0.1",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch schema from ${url}: ${response.status} ${response.statusText}`,
    );
  }
  const text = await response.text();
  return parseSchemaText(url, text);
};

const parseArtifactText = (source: string, text: string) => {
  try {
    return parseSerializedArtifacts(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Artifact at ${source} is not valid JSON: ${message}`);
  }
};

const fetchArtifactFromUrl = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      accept: "application/json, */*;q=0.1",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch artifact from ${url}: ${response.status} ${response.statusText}`,
    );
  }
  const text = await response.text();
  return parseArtifactText(url, text);
};

export const resolveDefaultModelSpec = async () => {
  const configuredDefault = await getDefaultModel();
  if (configuredDefault) {
    // The stored default may itself be an alias — resolve it
    return await resolveAlias(configuredDefault);
  }

  const providers = await listStoredProviders();
  const firstProvider = providers[0]?.provider;
  if (!firstProvider) {
    throw new UserError("No model specified and no providers are configured.\n\nUse --model <provider/model> to specify a model, or configure a provider with:\n  struktur config providers add <provider> --token <token>");
  }

  const cheapest = await resolveCheapestModel(firstProvider);
  return `${firstProvider}/${cheapest}`;
};

/**
 * Resolve an explicit model spec supplied by the user (e.g. from --model).
 * If the value matches a stored alias it is replaced with the aliased model string.
 * The resolved string is always in "provider/model" form expected by resolveModel.
 */
export const resolveExplicitModelSpec = async (spec: string): Promise<string> => {
  return await resolveAlias(spec);
};

const ensureSingleInput = (inputs: Array<string | boolean | undefined>) => {
  const count = inputs.filter((value) => value !== undefined && value !== false).length;
  if (count !== 1) {
    throw new UserError("Specify exactly one input source: --input, --text, --stdin, --artifact, or --artifact-json");
  }
};

export type LoadSchemaResult =
  | { kind: "schema"; schema: AnyJSONSchema }
  | { kind: "fields"; fields: string }
  | { kind: "missing" };

export const loadSchema = async (
  options: Record<string, string | boolean | undefined>,
): Promise<LoadSchemaResult> => {
  const schemaPath = options.schema;
  const schemaJson = options["schema-json"];
  const fields = options.fields;

  const defined = [schemaPath, schemaJson, fields].filter(
    (v) => v !== undefined && v !== false && v !== "",
  );

  if (defined.length > 1) {
    throw new UserError(
      "Specify exactly one schema source: --schema, --schema-json, or --fields",
    );
  }

  if (typeof fields === "string" && fields.trim()) {
    return { kind: "fields", fields };
  }

  if (schemaJson && typeof schemaJson === "string") {
    return { kind: "schema", schema: JSON.parse(schemaJson) as AnyJSONSchema };
  }

  if (schemaPath && typeof schemaPath === "string") {
    if (isHttpUrl(schemaPath)) {
      return { kind: "schema", schema: await fetchSchemaFromUrl(schemaPath) };
    }
    return { kind: "schema", schema: (await readJsonFile(schemaPath)) as AnyJSONSchema };
  }

  return { kind: "missing" };
};

export const loadArtifactsFromOptions = async (
  options: Record<string, string | boolean | undefined>,
  deps?: { readStdinText?: () => Promise<string>; stdinIsTTY?: boolean }
): Promise<Artifact[]> => {
  const input = options.input;
  const text = options.text;
  const stdin = options.stdin;
  const artifactFile = options["artifact-file"];
  const artifactJson = options["artifact-json"];
  const noParse = options["no-parse"] === true;
  const images = options.images === true;
  const screenshots = options.screenshots === true;
  const mimeOverride = typeof options.mime === "string" ? options.mime : undefined;
  const parserOverride = typeof options.parser === "string" ? options.parser : undefined;
  const readStdin = deps?.readStdinText ?? readStdinText;
  const stdinIsTTY = deps?.stdinIsTTY ?? process.stdin.isTTY;
  const inferredStdin =
    !stdin && !input && !text && !artifactFile && !artifactJson && stdinIsTTY === false;
  const stdinRequested = Boolean(stdin) || inferredStdin;

  ensureSingleInput([input, text, stdinRequested, artifactFile, artifactJson]);

  if (typeof artifactJson === "string") {
    const serialized = parseSerializedArtifacts(artifactJson);
    return parse({ kind: "artifact-json", data: serialized });
  }

  if (artifactFile) {
    if (isHttpUrl(artifactFile as string)) {
      const serialized = await fetchArtifactFromUrl(artifactFile as string);
      return parse({ kind: "artifact-json", data: serialized });
    }
    const source = await readFile(artifactFile as string, "utf-8");
    const serialized = parseArtifactText(artifactFile as string, source);
    return parse({ kind: "artifact-json", data: serialized });
  }

  if (typeof text === "string") {
    return parse({ kind: "text", text });
  }

  if (stdinRequested) {
    const stdinBuffer = Buffer.from(await readStdin());

    // Try to parse as artifact JSON first
    try {
      const serialized = parseSerializedArtifacts(stdinBuffer.toString());
      return parse({ kind: "artifact-json", data: serialized });
    } catch {
      // Not valid artifact JSON — continue with MIME detection
    }

    // MIME detection for stdin
    let detectedMime: string | null = null;
    if (!noParse) {
      // Load parsers config to get npm parser entries for detectFileType
      let parsersConfig: ParsersConfig = {};
      try {
        parsersConfig = await listParsers();
      } catch {
        // Ignore config load failures
      }

      const npmParserEntries: NpmParserEntry[] = Object.entries(parsersConfig)
        .filter((entry): entry is [string, NpmParserDef] => entry[1].type === "npm")
        .map(([mimeType, def]) => ({ mimeType, def: def as NpmParserDef }));

      detectedMime = await detectMimeType({
        buffer: stdinBuffer,
        mimeOverride,
        npmParsers: npmParserEntries,
      });
    }

    const mimeType = detectedMime ?? "text/plain";

    if (mimeType === "text/plain") {
      // Treat as raw text
      return parse({ kind: "text", text: stdinBuffer.toString() });
    }

    // Build effective parsers config
    let effectiveParsers: ParsersConfig | undefined;
    if (!noParse) {
      let parsersConfig: ParsersConfig = {};
      try {
        parsersConfig = await listParsers();
      } catch {
        // Ignore config load failures
      }

      if (parserOverride) {
        parsersConfig = { ...parsersConfig, [mimeType]: { type: "npm", package: parserOverride } };
      }

      effectiveParsers = Object.keys(parsersConfig).length > 0 ? parsersConfig : undefined;
    }

    return parse(
      { kind: "buffer", buffer: stdinBuffer, mimeType },
      { 
        parserConfig: effectiveParsers, 
        includeImages: images,
        screenshots,
      }
    );
  }

  if (typeof input === "string") {
    // Build effective parsers config for file input
    let effectiveParsers: ParsersConfig | undefined;
    let detectedMime: string | null = null;

    if (!noParse) {
      let parsersConfig: ParsersConfig = {};
      try {
        parsersConfig = await listParsers();
      } catch {
        // Ignore config load failures
      }

      // Read first 512 bytes for magic byte detection
      let headerBuffer: Buffer | undefined;
      try {
        const fd = await import("node:fs/promises").then(fs => fs.open(input, "r"));
        const buffer = Buffer.alloc(512);
        await fd.read(buffer, 0, 512, 0);
        await fd.close();
        headerBuffer = buffer;
      } catch {
        // Ignore read failures for detection
      }

      const npmParserEntries: NpmParserEntry[] = Object.entries(parsersConfig)
        .filter((entry): entry is [string, NpmParserDef] => entry[1].type === "npm")
        .map(([mimeType, def]) => ({ mimeType, def: def as NpmParserDef }));

      detectedMime = await detectMimeType({
        buffer: headerBuffer,
        filePath: input,
        mimeOverride,
        npmParsers: npmParserEntries,
      });

      if (parserOverride && detectedMime) {
        parsersConfig = { ...parsersConfig, [detectedMime]: { type: "npm", package: parserOverride } };
      }

      effectiveParsers = Object.keys(parsersConfig).length > 0 ? parsersConfig : undefined;
    } else {
      // Even with --no-parse, apply --mime override
      detectedMime = await detectMimeType({
        filePath: input,
        mimeOverride,
      });
    }

    if (!noParse && !mimeOverride && detectedMime === null) {
      throw new UserError(
        `Cannot detect MIME type for file "${input}". Use --mime to specify the type.`
      );
    }

    return parse(
      { kind: "file", path: input, mimeType: detectedMime ?? undefined },
      { 
        parserConfig: effectiveParsers, 
        includeImages: images,
        screenshots,
      }
    );
  }

  throw new UserError("No input provided. Use --input, --text, --stdin, --artifact, or --artifact-json");
};
