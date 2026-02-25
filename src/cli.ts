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

import { defineCommand, runMain } from "citty";
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
import { validateSerializedArtifacts } from "./artifacts/input";
import {
  loadArtifactsFromOptions,
  loadSchema,
  readStdinText,
  resolveDefaultModelSpec,
  resolveExplicitModelSpec,
  resolveModel,
  stdinConsumed,
} from "./cli/shared";
import type { ExtractionEvents, ExtractionStrategy } from "./types";
import { createDebugLogger } from "./debug/logger";

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
      description: "Artifact JSON file or stdin (-)",
      alias: "i",
      default: "-",
    },
  },
  async run({ args }) {
    const raw =
      args.input === "-"
        ? await readStdinText()
        : await Bun.file(args.input).text();
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
      description: "Shorthand field list, e.g. \"title, price:number\"",
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
      description: "Extraction strategy",
      alias: "S",
      default: "simple",
      valueHint:
        "simple|parallel|sequential|parallelAutoMerge|sequentialAutoMerge|doublePass|doublePassAutoMerge",
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
        args.schema ?? (args["schema-json"] ? "json-string" : args.fields ? "fields" : "unknown"),
      schemaSize:
        schemaResult.kind === "schema"
          ? JSON.stringify(schemaResult.schema).length
          : args.fields?.length ?? 0,
    });

    const artifacts = await loadArtifactsFromOptions({
      input: args.input,
      text: args.text,
      stdin: args.stdin,
      artifact: args.artifact,
      "artifact-json": args["artifact-json"],
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

const main = defineCommand({
  meta: {
    name: "struktur",
    version: "0.1.0",
    description: "Structured data extraction using LLMs",
  },
  subCommands: {
    extract: extractCommand,
    models: modelsCommand,
    providers: providersCommand,
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
