#!/usr/bin/env bun

// Workaround for AI SDK timestamp parsing issue with certain providers
// Some providers (e.g., opencode) return invalid timestamps that cause
// RangeError: Invalid Date when AI SDK tries to call toISOString()
const originalToISOString = Date.prototype.toISOString;
Date.prototype.toISOString = function () {
  try {
    return originalToISOString.call(this);
  } catch {
    // Return current time as fallback for invalid dates
    return new Date().toISOString();
  }
};

import { defineCommand, renderUsage, runMain } from "citty";
import yoctoSpinner from "yocto-spinner";
import { extract } from "./extract";
import {
  doublePass,
  doublePassAutoMerge,
  parallel,
  parallelAutoMerge,
  sequential,
  sequentialAutoMerge,
  simple,
} from "./strategies";
import {
  setDefaultModel,
  setAlias,
  getAlias,
  deleteAlias,
  listAliases,
  resolveAlias,
  listParsers,
  getParser,
  setParser,
  deleteParser,
} from "./auth/config";
import {
  deleteProviderToken,
  listStoredProviders,
  maskToken,
  setProviderToken,
  type TokenStorageType,
} from "./auth/tokens";
import {
  listAllProviderModels,
  listProviderModels,
  resolveCheapestModel,
} from "./llm/models";
import {
  validateSerializedArtifacts,
  hydrateSerializedArtifacts,
} from "./artifacts/input";
import {
  loadArtifactsFromOptions,
  loadSchema,
  readStdinText,
  resolveDefaultModelSpec,
  resolveExplicitModelSpec,
  resolveModel,
  stdinConsumed,
} from "./cli/shared";
import { detectMimeType } from "./parsers/mime";
import { runParser } from "./parsers/runner";
import type { NpmParserDef, ParsersConfig } from "./parsers/types";
import type { ExtractionEvents, ExtractionStrategy } from "./types";
import { createDebugLogger } from "./debug/logger";
import type { SerializedArtifact } from "./artifacts/input";

const supportedProviders = [
  "openai",
  "anthropic",
  "google",
  "opencode",
  "openrouter",
];

const isBrokenPipe = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const code = (error as { code?: string }).code;
  return code === "EPIPE" || code === "ERR_STREAM_WRITE_AFTER_END";
};

const writeOutput = async (target: string | undefined, data: string) => {
  if (!target || target === "-") {
    try {
      process.stdout.write(`${data}\n`);
    } catch (error) {
      if (isBrokenPipe(error)) {
        return;
      }
      throw error;
    }
    return;
  }
  await Bun.write(target, data);
};

type StrategyOptions = {
  chunkSize?: number;
};

const DEFAULT_CHUNK_SIZE = 10_000;

const createStrategy = (
  name: string,
  model: unknown,
  options?: StrategyOptions,
): ExtractionStrategy<unknown> => {
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
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
    default:
      throw new Error(`Unsupported strategy: ${name}`);
  }
};

const parseStorage = (value: unknown): TokenStorageType => {
  if (value === "auto" || value === "keychain" || value === "file") {
    return value;
  }
  return "auto";
};

const readTokenInput = async (
  token: string | undefined,
  tokenStdin: boolean | undefined,
): Promise<string> => {
  const hasToken = token !== undefined && token !== "";
  const hasTokenStdin = tokenStdin === true;

  if (hasToken && hasTokenStdin) {
    throw new Error(
      "Specify exactly one token source (--token or --token-stdin).",
    );
  }

  if (!hasToken && !hasTokenStdin) {
    throw new Error("Token is required (--token or --token-stdin).");
  }

  if (hasToken) {
    return token;
  }

  return (await readStdinText()).trim();
};

const createSpinner = () => {
  if (!process.stderr.isTTY) {
    return null;
  }
  return yoctoSpinner({
    text: "Initializing...",
    color: "cyan",
  });
};

const formatStepMessage = (
  label: string | undefined,
  step: number,
  total?: number,
): string => {
  if (!label) {
    return total ? `Step ${step}/${total}` : "Processing...";
  }

  // Format common step labels into readable messages
  if (label === "extract") {
    return "Extracting data...";
  }
  if (label === "merge") {
    return "Merging results...";
  }
  if (label === "dedupe") {
    return "Removing duplicates...";
  }
  if (label.startsWith("batch ")) {
    const match = label.match(/batch (\d+)\/(\d+)/);
    if (match) {
      const [, current, totalBatches] = match;
      return `Processing batch ${current}/${totalBatches}...`;
    }
    return `Processing ${label}...`;
  }
  if (label.startsWith("pass ")) {
    // Handle pass 1 batch X/Y or pass 1 merge
    const passMatch = label.match(/pass (\d+) (.*)/);
    if (passMatch && passMatch[2]) {
      const passNum = passMatch[1];
      const rest = passMatch[2];
      if (rest === "merge") {
        return `Pass ${passNum}: Merging results...`;
      }
      const batchMatch = rest.match(/batch (\d+)\/(\d+)/);
      if (batchMatch) {
        const [, current, totalBatches] = batchMatch;
        return `Pass ${passNum}: Processing batch ${current}/${totalBatches}...`;
      }
      return `Pass ${passNum}: ${rest}...`;
    }
    return label;
  }
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}...`;
};

// ---------------------------------------------------------------------------
// models list
// ---------------------------------------------------------------------------
const modelsListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List models available for all (or one) provider",
  },
  args: {
    provider: {
      type: "string",
      description: "Provider ID to query",
      alias: "p",
    },
  },
  async run({ args }) {
    if (args.provider) {
      const result = await listProviderModels(args.provider);
      const json = JSON.stringify({ providers: [result] }, null, 2);
      await writeOutput("-", json);
      return;
    }
    const results = await listAllProviderModels(supportedProviders);
    const json = JSON.stringify({ providers: results }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias list
// ---------------------------------------------------------------------------
const modelsAliasListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all model aliases",
  },
  async run() {
    const aliases = await listAliases();
    const json = JSON.stringify({ aliases }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias get <alias>
// ---------------------------------------------------------------------------
const modelsAliasGetCommand = defineCommand({
  meta: {
    name: "get",
    description: "Get the model behind an alias",
  },
  args: {
    alias: {
      type: "positional",
      description: "Alias name",
      required: true,
    },
  },
  async run({ args }) {
    const model = await getAlias(args.alias);
    if (!model) {
      throw new Error(`No alias found: ${args.alias}`);
    }
    const json = JSON.stringify({ alias: args.alias, model }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias set <alias> <model>
// ---------------------------------------------------------------------------
const modelsAliasSetCommand = defineCommand({
  meta: {
    name: "set",
    description: "Create or update a model alias",
  },
  args: {
    alias: {
      type: "positional",
      description: "Alias name",
      required: true,
    },
    model: {
      type: "positional",
      description: "Model string (provider/model)",
      required: true,
    },
  },
  async run({ args }) {
    const model = await setAlias(args.alias, args.model);
    const json = JSON.stringify({ alias: args.alias, model }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias remove <alias>
// ---------------------------------------------------------------------------
const modelsAliasRemoveCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Delete a model alias",
  },
  args: {
    alias: {
      type: "positional",
      description: "Alias name",
      required: true,
    },
  },
  async run({ args }) {
    const deleted = await deleteAlias(args.alias);
    const json = JSON.stringify({ alias: args.alias, deleted }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias  (parent)
// ---------------------------------------------------------------------------
const modelsAliasCommand = defineCommand({
  meta: {
    name: "alias",
    description: "Manage model aliases",
  },
  subCommands: {
    list: modelsAliasListCommand,
    get: modelsAliasGetCommand,
    set: modelsAliasSetCommand,
    remove: modelsAliasRemoveCommand,
  },
});

// ---------------------------------------------------------------------------
// models use <alias_or_model>
// ---------------------------------------------------------------------------
const modelsUseCommand = defineCommand({
  meta: {
    name: "use",
    description: "Set the default model (accepts alias or provider/model)",
  },
  args: {
    model: {
      type: "positional",
      description:
        "Alias or provider/model string (e.g. fast, openai/gpt-4.1-mini)",
      required: true,
    },
  },
  async run({ args }) {
    // Resolve alias before storing so the config always holds a real model spec
    const resolved = await resolveAlias(args.model);
    const stored = await setDefaultModel(resolved);
    const json = JSON.stringify({ defaultModel: stored }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models  (parent)
// ---------------------------------------------------------------------------
const modelsCommand = defineCommand({
  meta: {
    name: "models",
    description: "Manage and list LLM models",
  },
  subCommands: {
    list: modelsListCommand,
    alias: modelsAliasCommand,
    use: modelsUseCommand,
  },
});

// ---------------------------------------------------------------------------
// providers list
// ---------------------------------------------------------------------------
const providersListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all supported providers and whether they are configured",
  },
  async run() {
    const stored = await listStoredProviders();
    const storedSet = new Set(stored.map((e) => e.provider));
    const providers = supportedProviders.map((provider) => ({
      provider,
      configured: storedSet.has(provider),
      storage: stored.find((e) => e.provider === provider)?.storage ?? null,
    }));
    const json = JSON.stringify({ providers }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// providers add <provider>
// ---------------------------------------------------------------------------
const providersAddCommand = defineCommand({
  meta: {
    name: "add",
    description: "Configure an API token for a provider",
  },
  args: {
    provider: {
      type: "positional",
      description:
        "Provider ID (openai, anthropic, google, opencode, openrouter)",
      required: true,
    },
    token: {
      type: "string",
      description: "API token value",
      alias: "t",
    },
    "token-stdin": {
      type: "boolean",
      description: "Read token from stdin",
    },
    storage: {
      type: "string",
      description: "Token storage method",
      valueHint: "auto|keychain|file",
      default: "auto",
    },
    default: {
      type: "boolean",
      description: "Also set this provider's cheapest model as the default",
    },
  },
  async run({ args }) {
    if (!supportedProviders.includes(args.provider)) {
      throw new Error(
        `Unknown provider: ${args.provider}. Supported: ${supportedProviders.join(", ")}`,
      );
    }
    const token = await readTokenInput(args.token, args["token-stdin"]);
    const storage = parseStorage(args.storage);
    const stored = await setProviderToken(args.provider, token, storage);

    let defaultModel: string | undefined;
    if (args.default) {
      const cheapest = await resolveCheapestModel(args.provider);
      defaultModel = await setDefaultModel(`${args.provider}/${cheapest}`);
    }

    const json = JSON.stringify(
      { provider: args.provider, stored, defaultModel },
      null,
      2,
    );
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// providers remove <provider>
// ---------------------------------------------------------------------------
const providersRemoveCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a configured provider token",
  },
  args: {
    provider: {
      type: "positional",
      description: "Provider ID",
      required: true,
    },
  },
  async run({ args }) {
    const deleted = await deleteProviderToken(args.provider);
    const json = JSON.stringify({ provider: args.provider, deleted }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// providers  (parent)
// ---------------------------------------------------------------------------
const providersCommand = defineCommand({
  meta: {
    name: "providers",
    description: "Manage LLM provider credentials",
  },
  subCommands: {
    list: providersListCommand,
    add: providersAddCommand,
    remove: providersRemoveCommand,
  },
});

const verifyCommand = defineCommand({
  meta: {
    name: "verify",
    description: "Validate artifact JSON from file or stdin",
  },
  args: {
    input: {
      type: "string",
      description: "Artifact JSON file to validate",
      alias: "i",
    },
    stdin: {
      type: "boolean",
      description: "Read artifact JSON from stdin",
      alias: "s",
      default: false,
    },
  },
  async run({ args }) {
    const useStdin = args.stdin === true;

    if (!args.input && !useStdin) {
      const usageText = await renderUsage(verifyCommand);
      process.stderr.write(`${usageText}\n`);
      process.stderr.write("error: Specify an input source: --input <file> or --stdin\n");
      process.exit(1);
    }

    const raw = useStdin
      ? await readStdinText()
      : await Bun.file(args.input!).text();
    const parsed = JSON.parse(raw) as unknown;
    const artifacts = validateSerializedArtifacts(parsed);
    const json = JSON.stringify(
      { valid: true, artifacts: artifacts.length },
      null,
      2,
    );
    await writeOutput("-", json);
  },
});

const extractCommand = defineCommand({
  meta: {
    name: "extract",
    description: "Extract structured data from files or text input",
  },
  args: {
    input: {
      type: "string",
      description: "Input file to parse",
      alias: "i",
    },
    text: {
      type: "string",
      description: "Raw text input",
      alias: "t",
    },
    stdin: {
      type: "boolean",
      description: "Read raw text from stdin (auto-detected when piped)",
    },
    artifact: {
      type: "string",
      description: "Artifact JSON file or stdin (-)",
      alias: "a",
    },
    "artifact-json": {
      type: "string",
      description: "Artifact JSON string",
    },
    schema: {
      type: "string",
      description: "JSON schema file path or URL",
      alias: "s",
    },
    "schema-json": {
      type: "string",
      description: "JSON schema string",
    },
    fields: {
      type: "string",
      description:
        'Shorthand field list, e.g. "name, age:number" / "price_history:array{number}" / "sizes:enum{small|medium|large}"',
      alias: "f",
    },
    model: {
      type: "string",
      description:
        "Model identifier (e.g., openai/gpt-5, anthropic/claude-sonnet-4-20250514)",
      alias: "m",
    },
    output: {
      type: "string",
      description: "Output path or stdout (default: -)",
      alias: "o",
      default: "-",
    },
    strategy: {
      type: "string",
      description:
        "Extraction strategy (simple|parallel|sequential|parallelAutoMerge|sequentialAutoMerge|doublePass|doublePassAutoMerge)",
      alias: "S",
      default: "simple",
      valueHint: "simple|parallel|...",
    },
    "chunk-size": {
      type: "string",
      description: "Token budget per batch for chunked strategies",
      default: "10000",
    },
    debug: {
      type: "boolean",
      description: "Enable verbose JSON debug logging to stderr",
      default: false,
    },
    strict: {
      type: "boolean",
      description: "Strict mode for schema validation",
      default: false,
    },
    "no-parse": {
      type: "boolean",
      description: "Skip custom parsers; use only built-in text/image/artifact-JSON detection",
      default: false,
    },
    mime: {
      type: "string",
      description: "Override MIME type detection for the input",
    },
    parser: {
      type: "string",
      description: "Use this npm package as the parser, overriding configured parser",
    },
    "no-images": {
      type: "boolean",
      description: "Skip image extraction; do not include images in the artifact output",
      default: false,
    },
  },
  async run({ args }) {
    const isDebug = args.debug === true;
    const debug = createDebugLogger(isDebug);

    // Log CLI initialization
    debug.cliInit({
      args: {
        input: args.input,
        text: args.text ? "[provided]" : undefined,
        stdin: args.stdin,
        artifact: args.artifact,
        "artifact-json": args["artifact-json"] ? "[provided]" : undefined,
        schema: args.schema,
        "schema-json": args["schema-json"] ? "[provided]" : undefined,
        fields: args.fields,
        model: args.model,
        output: args.output,
        strategy: args.strategy,
        "chunk-size": args["chunk-size"],
        debug: args.debug,
      },
    });

    const schemaResult = await loadSchema({
      schema: args.schema,
      "schema-json": args["schema-json"],
      fields: args.fields,
    });
    debug.schemaLoaded({
      source:
        args.schema ??
        (args["schema-json"]
          ? "json-string"
          : args.fields
            ? "fields"
            : "unknown"),
      schemaSize:
        schemaResult.kind === "schema"
          ? JSON.stringify(schemaResult.schema).length
          : (args.fields?.length ?? 0),
    });

    const artifacts = await loadArtifactsFromOptions({
      input: args.input,
      text: args.text,
      stdin: args.stdin,
      artifact: args.artifact,
      "artifact-json": args["artifact-json"],
      "no-parse": args["no-parse"],
      "no-images": args["no-images"],
      mime: args.mime,
      parser: args.parser,
    });

    // Calculate artifact stats
    const artifactSummaries = artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      contentCount: a.contents.length,
      tokens: a.tokens,
    }));
    const totalTokens = artifactSummaries.reduce(
      (sum, a) => sum + (a.tokens ?? 0),
      0,
    );

    // Count total images across all artifacts
    let totalImages = 0;
    for (const artifact of artifacts) {
      for (const content of artifact.contents) {
        totalImages += content.media?.length ?? 0;
      }
    }

    debug.artifactsLoaded({
      count: artifacts.length,
      artifacts: artifactSummaries,
      totalTokens,
      totalImages,
    });

    let modelSpec = args.model
      ? await resolveExplicitModelSpec(args.model)
      : await resolveDefaultModelSpec();

    const chunkSize = parseInt(args["chunk-size"], 10);
    if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
      throw new Error("Chunk size must be a positive number.");
    }

    const model = await resolveModel(modelSpec);
    debug.modelResolved({ modelSpec, resolvedModel: JSON.stringify(model) });

    const strategy = createStrategy(args.strategy, model, { chunkSize });
    debug.strategyCreated({
      strategy: args.strategy,
      config: { chunkSize, model: JSON.stringify(model) },
    });

    const spinner = isDebug ? null : createSpinner();
    let currentStepLabel: string | undefined;

    if (spinner) {
      spinner.start();
    }

    const events: ExtractionEvents = {
      onStep: async (info) => {
        if (info.label) {
          currentStepLabel = info.label;
        }
        if (spinner && info.label) {
          spinner.text = formatStepMessage(info.label, info.step, info.total);
        }
      },
      onProgress: async (info) => {
        if (spinner && info.total > 0) {
          const percent = Math.round((info.current / info.total) * 100);
          spinner.text = `Processing ${info.current}/${info.total} (${percent}%)...`;
        }
      },
      onRetry: async (info) => {
        if (spinner) {
          const baseMessage = currentStepLabel
            ? formatStepMessage(currentStepLabel, 0, undefined).replace(
                /\.\.\.$/,
                "",
              )
            : "Extracting data";
          spinner.text = `${baseMessage} (retry ${info.attempt}/${info.maxAttempts})...`;
        }
      },
      onMessage: async () => {
        // Messages are handled internally
      },
      onTokenUsage: async () => {
        // Token usage tracked in result
      },
    };

    try {
      const result = await extract({
        artifacts,
        ...(schemaResult.kind === "schema"
          ? { schema: schemaResult.schema }
          : { fields: schemaResult.fields }),
        strategy,
        events,
        debug,
        strict: args.strict,
      });

      if (spinner) {
        spinner.stop();
      }

      if (result.error) {
        const { SchemaValidationError } =
          await import("./validation/validator");
        const isSchemaError =
          result.error instanceof SchemaValidationError ||
          (result.error.name === "SchemaValidationError" &&
            "errors" in result.error);
        if (isSchemaError) {
          const schemaError = result.error as InstanceType<
            typeof SchemaValidationError
          >;
          const errorDetails = JSON.stringify(schemaError.errors, null, 2);
          throw new Error(`Schema validation failed:\n${errorDetails}`);
        }
        throw result.error;
      }

      const json = JSON.stringify(result.data, null, 2);
      await writeOutput(args.output, json);
    } catch (error) {
      if (spinner) {
        spinner.stop();
      }
      throw error;
    }
  },
});

// ---------------------------------------------------------------------------
// parse
// ---------------------------------------------------------------------------
const parseCommand = defineCommand({
  meta: {
    name: "parse",
    description: "Convert a file or stdin to Artifact JSON",
  },
  args: {
    input: {
      type: "string",
      description: "File to parse",
      alias: "i",
    },
    stdin: {
      type: "boolean",
      description: "Read from stdin",
      alias: "s",
      default: false,
    },
    mime: {
      type: "string",
      description: "Override MIME type detection",
    },
    output: {
      type: "string",
      description: "Output destination (default: stdout)",
      alias: "o",
      default: "-",
    },
    parser: {
      type: "string",
      description: "Override configured parser with this npm package name",
    },
    "no-images": {
      type: "boolean",
      description: "Skip image extraction; do not include images in the artifact output",
      default: false,
    },
  },
  async run({ args }) {
    const useStdin = args.stdin === true;

    if (!args.input && !useStdin) {
      // No input source — show usage + error and exit 1
      const usageText = await renderUsage(parseCommand);
      process.stderr.write(`${usageText}\n`);
      process.stderr.write("error: Specify an input source: --input <file> or --stdin\n");
      process.exit(1);
    }

    // Load parsers config
    let parsersConfig: ParsersConfig = {};
    try {
      parsersConfig = await listParsers();
    } catch {
      // Ignore config load failures
    }

    // Read input into buffer
    let buffer: Buffer;
    let filePath: string | undefined;

    if (useStdin) {
      const text = await readStdinText();
      buffer = Buffer.from(text);
    } else {
      filePath = args.input!;
      const file = Bun.file(filePath);
      buffer = Buffer.from(await file.arrayBuffer());
    }

    // Detect MIME type
    const npmParserEntries = Object.entries(parsersConfig)
      .filter((entry): entry is [string, NpmParserDef] => entry[1].type === "npm")
      .map(([mimeType, def]) => ({ mimeType, def }));

    let mimeType = await detectMimeType({
      buffer,
      filePath,
      mimeOverride: args.mime,
      npmParsers: npmParserEntries,
    });

    if (!mimeType) {
      if (useStdin) {
        // Fallback to text/plain for stdin
        mimeType = "text/plain";
      } else {
        throw new Error(
          `Cannot detect MIME type for file "${args.input}". Use --mime to specify the type.`
        );
      }
    }

    // JSON auto-detection: if MIME is application/json, check if it's already SerializedArtifact[]
    if (mimeType === "application/json") {
      try {
        const parsed = JSON.parse(buffer.toString()) as unknown;
        const serialized = validateSerializedArtifacts(parsed);
        const json = JSON.stringify(serialized, null, 2);
        await writeOutput(args.output, json);
        return;
      } catch {
        // Not valid artifact JSON — fall through to parser resolution
      }
    }

    // Resolve parser: --parser flag > configured parser > built-in (PDF, text, image)
    const effectiveParsers: ParsersConfig = { ...parsersConfig };
    if (args.parser) {
      effectiveParsers[mimeType] = { type: "npm", package: args.parser };
    }

    const parserDef = effectiveParsers[mimeType];

    let artifacts;
    if (parserDef) {
      artifacts = await runParser(parserDef, { kind: "buffer", buffer }, mimeType);
    } else if (mimeType === "application/pdf") {
      const { parsePdf } = await import("./parsers/pdf");
      artifacts = [await parsePdf(buffer, { includeImages: args["no-images"] !== true })];
    } else if (mimeType.startsWith("text/")) {
      const { splitTextIntoContents, hydrateSerializedArtifacts: hydrate } = await import("./artifacts/input");
      const text = buffer.toString();
      const contents = splitTextIntoContents(text);
      artifacts = [{
        id: `artifact-${crypto.randomUUID()}`,
        type: "text" as const,
        raw: async () => buffer,
        contents,
      }];
    } else if (mimeType.startsWith("image/")) {
      artifacts = [{
        id: `artifact-${crypto.randomUUID()}`,
        type: "image" as const,
        raw: async () => buffer,
        contents: [{ media: [{ type: "image" as const, contents: buffer }] }],
      }];
    } else {
      throw new Error(
        `No parser configured for MIME type "${mimeType}". Use --parser to specify an npm parser package or configure one with: struktur config parsers add --mime ${mimeType} ...`
      );
    }

    // Serialize to SerializedArtifact[]
    const serialized: SerializedArtifact[] = artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      contents: a.contents.map((c) => ({
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
              })),
            }
          : {}),
      })),
      ...(a.metadata ? { metadata: a.metadata } : {}),
    }));

    const json = JSON.stringify(serialized, null, 2);
    await writeOutput(args.output, json);
  },
});

// ---------------------------------------------------------------------------
// config parsers list
// ---------------------------------------------------------------------------
const configParsersListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all configured parsers",
  },
  async run() {
    const parsers = await listParsers();
    const json = JSON.stringify({ parsers }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// config parsers get
// ---------------------------------------------------------------------------
const configParsersGetCommand = defineCommand({
  meta: {
    name: "get",
    description: "Get the parser configured for a MIME type",
  },
  args: {
    mime: {
      type: "string",
      description: "MIME type",
      required: true,
    },
  },
  async run({ args }) {
    const parser = await getParser(args.mime);
    if (!parser) {
      throw new Error(`No parser configured for MIME type: ${args.mime}`);
    }
    const json = JSON.stringify({ mimeType: args.mime, parser }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// config parsers add
// ---------------------------------------------------------------------------
const configParsersAddCommand = defineCommand({
  meta: {
    name: "add",
    description: "Configure a parser for a MIME type",
  },
  args: {
    mime: {
      type: "string",
      description: "MIME type to configure",
      required: true,
    },
    npm: {
      type: "string",
      description: "npm package name",
    },
    "file-command": {
      type: "string",
      description: "Command with FILE_PATH placeholder",
    },
    "stdin-command": {
      type: "string",
      description: "Command that reads from stdin",
    },
  },
  async run({ args }) {
    const sources = [args.npm, args["file-command"], args["stdin-command"]].filter(
      (v) => v !== undefined && v !== ""
    );
    if (sources.length !== 1) {
      throw new Error(
        "Specify exactly one of --npm, --file-command, or --stdin-command."
      );
    }

    let parserDef;
    if (args.npm) {
      parserDef = { type: "npm" as const, package: args.npm };
    } else if (args["file-command"]) {
      if (!args["file-command"].includes("FILE_PATH")) {
        throw new Error(
          `--file-command must contain FILE_PATH placeholder. Got: "${args["file-command"]}"`
        );
      }
      parserDef = { type: "command-file" as const, command: args["file-command"] };
    } else {
      parserDef = { type: "command-stdin" as const, command: args["stdin-command"]! };
    }

    await setParser(args.mime, parserDef);
    const json = JSON.stringify({ mimeType: args.mime, parser: parserDef }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// config parsers remove
// ---------------------------------------------------------------------------
const configParsersRemoveCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a configured parser",
  },
  args: {
    mime: {
      type: "string",
      description: "MIME type",
      required: true,
    },
  },
  async run({ args }) {
    const deleted = await deleteParser(args.mime);
    const json = JSON.stringify({ mimeType: args.mime, deleted }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// config parsers (parent)
// ---------------------------------------------------------------------------
const configParsersCommand = defineCommand({
  meta: {
    name: "parsers",
    description: "Manage file parsers by MIME type",
  },
  subCommands: {
    list: configParsersListCommand,
    get: configParsersGetCommand,
    add: configParsersAddCommand,
    remove: configParsersRemoveCommand,
  },
});

// ---------------------------------------------------------------------------
// config (parent) — houses models, providers, parsers
// ---------------------------------------------------------------------------
const configCommand = defineCommand({
  meta: {
    name: "config",
    description: "Manage struktur configuration",
  },
  subCommands: {
    models: modelsCommand,
    providers: providersCommand,
    parsers: configParsersCommand,
  },
});

const main = defineCommand({
  meta: {
    name: "struktur",
    version: "0.1.0",
    description: "Structured data extraction using LLMs",
  },
  subCommands: {
    extract: extractCommand,
    parse: parseCommand,
    config: configCommand,
    verify: verifyCommand,
  },
});

runMain(main).catch(async (error) => {
  // Drain stdin if needed to prevent broken pipe
  if (!process.stdin.isTTY && !stdinConsumed) {
    try {
      await readStdinText();
    } catch (drainError) {
      if (!isBrokenPipe(drainError)) {
        process.stderr.write(`${String(drainError)}\n`);
      }
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
