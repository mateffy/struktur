import { getDefaultModel, listParsers, resolveAlias } from "../auth/config";
import {
  listStoredProviders,
  resolveProviderEnvVar,
  resolveProviderToken,
} from "../auth/tokens";
import {
  parse,
  parseSerializedArtifacts,
} from "../artifacts/input";
import { detectMimeType, type NpmParserEntry } from "../parsers/mime";
import type { NpmParserDef, ParsersConfig } from "../parsers/types";
import { resolveCheapestModel } from "../llm/models";
import { buildSchemaFromFields } from "../fields";
import type { AnyJSONSchema, Artifact } from "../types";

export type ParsedArgs = {
  command?: string;
  options: Record<string, string | boolean>;
  positionals: string[];
};

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
    "  --stdin                  Read raw text from stdin (auto-detected when piped)",
    "  --artifact <path|->      Artifact JSON file or stdin",
    "  --artifact-json <json>   Artifact JSON string",
    "  --schema <path>          JSON schema file",
    "  --schema-json <json>     JSON schema string",
    "  --model <provider/model> Model identifier (e.g. openai/gpt-5, default: configured or cheapest)",
    "  --output <path|->        Output path or stdout (default: -)",
    "  --strategy <name>        Strategy name (default: simple)",
    "  --chunk-size <number>    Token budget per batch for chunked strategies (default: 10000)",
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
  const text = await Bun.file(path).text();
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

export const resolveModel = async (model: string) => {
  (globalThis as { AI_SDK_LOG_WARNINGS?: boolean }).AI_SDK_LOG_WARNINGS ??= false;
  process.env.AI_SDK_LOG_WARNINGS ??= "false";
  const [provider, ...rest] = model.split("/");
  const modelName = rest.join("/");

  if (!provider || !modelName) {
    throw new Error(`Invalid model format: ${model}`);
  }

  const envVar = resolveProviderEnvVar(provider);
  if (envVar && !process.env[envVar]) {
    const storedToken = await resolveProviderToken(provider);
    if (storedToken) {
      process.env[envVar] = storedToken;
    }
  }

  switch (provider) {
    case "openai": {
      const { openai } = await import("@ai-sdk/openai");
      return openai(modelName);
    }
    case "anthropic": {
      const { anthropic } = await import("@ai-sdk/anthropic");
      return anthropic(modelName);
    }
    case "google": {
      const { google } = await import("@ai-sdk/google");
      return google(modelName);
    }
    case "opencode": {
      const envVar = resolveProviderEnvVar("opencode");
      let apiKey = envVar ? process.env[envVar] : undefined;
      if (!apiKey) {
        apiKey = await resolveProviderToken("opencode");
      }
      if (!apiKey) {
        throw new Error("OpenCode API key is required. Set OPENCODE_API_KEY environment variable or run 'struktur auth set --provider opencode --token <token>'");
      }
      
      // OpenCode Zen uses different AI SDK packages based on model family
      if (modelName.startsWith("claude-")) {
        // Claude models use Anthropic SDK
        const { createAnthropic } = await import("@ai-sdk/anthropic");
        return createAnthropic({
          apiKey,
          baseURL: "https://opencode.ai/zen/v1",
        })(modelName);
      } else if (modelName.startsWith("gemini-")) {
        // Gemini models use Google SDK
        const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
        return createGoogleGenerativeAI({
          apiKey,
          baseURL: "https://opencode.ai/zen/v1",
        })(modelName);
      } else {
        // GPT models and chat completions (GLM, Kimi, MiniMax, Qwen, etc.)
        // Use OpenAI SDK with custom baseURL
        const { createOpenAI } = await import("@ai-sdk/openai");
        return createOpenAI({
          apiKey,
          baseURL: "https://opencode.ai/zen/v1",
        })(modelName);
      }
    }
    case "openrouter": {
      const { openrouter } = await import("@openrouter/ai-sdk-provider");
      // Parse provider preference from hashtag (e.g., "anthropic/claude-3.5-sonnet#cerebras")
      const hashIndex = modelName.indexOf("#");
      const actualModelName = hashIndex >= 0 ? modelName.slice(0, hashIndex) : modelName;
      const preferredProvider = hashIndex >= 0 ? modelName.slice(hashIndex + 1) : undefined;
      
      const modelInstance = openrouter(actualModelName);
      
      // Attach provider preference to the model object for later use by LLMClient
      if (preferredProvider) {
        Object.defineProperty(modelInstance, "__openrouter_provider", {
          value: preferredProvider,
          writable: false,
          enumerable: false,
          configurable: false,
        });
      }
      
      return modelInstance;
    }
    default:
      throw new Error(`Unsupported model provider: ${provider}`);
  }
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
    throw new Error("Model is required (--model provider/model) and no providers are configured.");
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
    throw new Error("Specify exactly one input source.");
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
    throw new Error(
      "Specify exactly one schema source: --schema, --schema-json, or --fields.",
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
  const artifact = options.artifact;
  const artifactJson = options["artifact-json"];
  const noParse = options["no-parse"] === true;
  const images = options.images === true;
  const screenshots = options.screenshots === true;
  const screenshotScale = typeof options["screenshot-scale"] === "string" 
    ? parseFloat(options["screenshot-scale"]) 
    : undefined;
  const screenshotWidth = typeof options["screenshot-width"] === "string" 
    ? parseInt(options["screenshot-width"], 10) 
    : undefined;
  const mimeOverride = typeof options.mime === "string" ? options.mime : undefined;
  const parserOverride = typeof options.parser === "string" ? options.parser : undefined;
  const readStdin = deps?.readStdinText ?? readStdinText;
  const stdinIsTTY = deps?.stdinIsTTY ?? process.stdin.isTTY;
  const inferredStdin =
    !stdin && !input && !text && !artifact && !artifactJson && stdinIsTTY === false;
  const stdinRequested = Boolean(stdin) || inferredStdin;

  ensureSingleInput([input, text, stdinRequested, artifact, artifactJson]);

  if (typeof artifactJson === "string") {
    const serialized = parseSerializedArtifacts(artifactJson);
    return parse({ kind: "artifact-json", data: serialized });
  }

  if (artifact) {
    const source = artifact === "-" ? await readStdinText() : await Bun.file(artifact as string).text();
    const serialized = parseSerializedArtifacts(source);
    return parse({ kind: "artifact-json", data: serialized });
  }

  if (typeof text === "string") {
    return parse({ kind: "text", text });
  }

  if (stdinRequested) {
    const stdinBuffer = Buffer.from(await readStdin());

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
        screenshotScale,
        screenshotWidth,
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
        const file = Bun.file(input);
        const arrayBuf = await file.slice(0, 512).arrayBuffer();
        headerBuffer = Buffer.from(arrayBuf);
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
      throw new Error(
        `Cannot detect MIME type for file "${input}". Use --mime to specify the type.`
      );
    }

    return parse(
      { kind: "file", path: input, mimeType: detectedMime ?? undefined },
      { 
        parserConfig: effectiveParsers, 
        includeImages: images,
        screenshots,
        screenshotScale,
        screenshotWidth,
      }
    );
  }

  throw new Error("No input provided.");
};
