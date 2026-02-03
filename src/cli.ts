#!/usr/bin/env bun
import { extract } from "./extract";
import { simple } from "./strategies";
import { getDefaultModel, setDefaultModel } from "./auth/config";
import {
  deleteProviderToken,
  getProviderTokenOrThrow,
  listStoredProviders,
  maskToken,
  resolveProviderEnvVar,
  resolveProviderToken,
  setProviderToken,
  type TokenStorageType,
} from "./auth/tokens";
import {
  listAllProviderModels,
  listProviderModels,
  resolveCheapestModel,
} from "./llm/models";
import {
  parseInputToArtifacts,
  parseSerializedArtifacts,
  validateSerializedArtifacts,
} from "./artifacts/input";
import type { AnyJSONSchema, Artifact, ExtractionResult, ExtractionStrategy } from "./types";

type CliDependencies = {
  resolveModel?: (model: string) => Promise<unknown>;
  resolveDefaultModel?: () => Promise<string>;
  createStrategy?: (name: string, model: unknown) => ExtractionStrategy<unknown>;
  extract?: typeof extract;
  readStdinText?: () => Promise<string>;
  stdinIsTTY?: boolean;
};

type AuthDependencies = {
  resolveCheapestModel?: typeof resolveCheapestModel;
  listStoredProviders?: typeof listStoredProviders;
  setDefaultModel?: typeof setDefaultModel;
};

type ParsedArgs = {
  command?: string;
  options: Record<string, string | boolean>;
  positionals: string[];
};

const usage = () => {
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
    "  --provider <name>        Provider id (openai, anthropic, google)",
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

const parseArgs = (argv: string[]): ParsedArgs => {
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

const readStdinText = async () => {
  return await new Response(process.stdin).text();
};

const readJsonFile = async (path: string) => {
  const text = await Bun.file(path).text();
  return JSON.parse(text) as unknown;
};

const resolveModel = async (model: string) => {
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
    default:
      throw new Error(`Unsupported model provider: ${provider}`);
  }
};

const parseStorage = (value: unknown): TokenStorageType => {
  if (value === "auto" || value === "keychain" || value === "file") {
    return value;
  }
  return "auto";
};

const readTokenInput = async (options: Record<string, string | boolean>) => {
  const token = options.token;
  const tokenStdin = options["token-stdin"];
  const tokenSources = [token, tokenStdin].filter((value) => value !== undefined && value !== false);
  if (tokenSources.length !== 1) {
    throw new Error("Specify exactly one token source (--token or --token-stdin).");
  }

  if (typeof token === "string") {
    return token;
  }

  return (await readStdinText()).trim();
};

const resolveDefaultModelSpec = async () => {
  const configuredDefault = await getDefaultModel();
  if (configuredDefault) {
    return configuredDefault;
  }

  const providers = await listStoredProviders();
  const firstProvider = providers[0]?.provider;
  if (!firstProvider) {
    throw new Error("Model is required (--model provider/model) and no providers are configured.");
  }

  const cheapest = await resolveCheapestModel(firstProvider);
  return `${firstProvider}/${cheapest}`;
};

export const runAuthCommand = async (
  positionals: string[],
  options: Record<string, string | boolean>,
  deps: AuthDependencies = {}
) => {
  const action = positionals[0];
  if (!action) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const provider = typeof options.provider === "string" ? options.provider : undefined;
  const resolveCheapestModelFn = deps.resolveCheapestModel ?? resolveCheapestModel;
  const listStoredProvidersFn = deps.listStoredProviders ?? listStoredProviders;
  const setDefaultModelFn = deps.setDefaultModel ?? setDefaultModel;

  switch (action) {
    case "set": {
      if (!provider) {
        throw new Error("Provider is required (--provider).");
      }
      const token = await readTokenInput(options);
      const storage = parseStorage(options.storage);
      const stored = await setProviderToken(provider, token, storage);
      let defaultModel: string | undefined;
      if (options.default) {
        const cheapest = await resolveCheapestModelFn(provider);
        defaultModel = await setDefaultModelFn(`${provider}/${cheapest}`);
      }
      const json = JSON.stringify({ provider, stored, defaultModel }, null, 2);
      await writeOutput("-", json);
      return;
    }
    case "default": {
      const model = options.model;
      if (typeof model === "string") {
        const stored = await setDefaultModelFn(model);
        const json = JSON.stringify({ defaultModel: stored }, null, 2);
        await writeOutput("-", json);
        return;
      }

      if (model !== undefined) {
        throw new Error("Model is required (--model provider/model).");
      }

      const providerName = provider ?? positionals[1];
      if (!providerName) {
        throw new Error("Provider is required (auth default <provider> or --model).");
      }

      const providers = await listStoredProvidersFn();
      const configured = providers.some((entry) => entry.provider === providerName);
      if (!configured) {
        throw new Error(`No token stored for provider: ${providerName}`);
      }

      const cheapest = await resolveCheapestModelFn(providerName);
      const stored = await setDefaultModelFn(`${providerName}/${cheapest}`);
      const json = JSON.stringify({ defaultModel: stored }, null, 2);
      await writeOutput("-", json);
      return;
    }
    case "get": {
      if (!provider) {
        throw new Error("Provider is required (--provider).");
      }
      const token = await getProviderTokenOrThrow(provider);
      const raw = Boolean(options.raw);
      const value = raw ? token : maskToken(token);
      await writeOutput("-", value);
      return;
    }
    case "delete": {
      if (!provider) {
        throw new Error("Provider is required (--provider).");
      }
      const deleted = await deleteProviderToken(provider);
      const json = JSON.stringify({ provider, deleted }, null, 2);
      await writeOutput("-", json);
      return;
    }
    case "list": {
      const providers = await listStoredProviders();
      const json = JSON.stringify({ providers }, null, 2);
      await writeOutput("-", json);
      return;
    }
    default:
      throw new Error(`Unknown auth command: ${action}`);
  }
};

const supportedProviders = ["openai", "anthropic", "google"];

export const runModelsCommand = async (options: Record<string, string | boolean>) => {
  const provider = typeof options.provider === "string" ? options.provider : undefined;
  if (provider) {
    const result = await listProviderModels(provider);
    const json = JSON.stringify({ providers: [result] }, null, 2);
    await writeOutput("-", json);
    return;
  }

  if (options.all || !provider) {
    const results = await listAllProviderModels(supportedProviders);
    const json = JSON.stringify({ providers: results }, null, 2);
    await writeOutput("-", json);
    return;
  }
};

const createStrategy = (name: string, model: unknown): ExtractionStrategy<unknown> => {
  if (name !== "simple") {
    throw new Error(`Unsupported strategy: ${name}`);
  }
  return simple({ model });
};

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

const ensureSingleInput = (inputs: Array<string | boolean | undefined>) => {
  const count = inputs.filter((value) => value !== undefined && value !== false).length;
  if (count !== 1) {
    throw new Error("Specify exactly one input source.");
  }
};

const loadSchema = async (options: Record<string, string | boolean>): Promise<AnyJSONSchema> => {
  const schemaPath = options.schema;
  const schemaJson = options["schema-json"];

  if (schemaJson && typeof schemaJson === "string") {
    return JSON.parse(schemaJson) as AnyJSONSchema;
  }

  if (schemaPath && typeof schemaPath === "string") {
    return (await readJsonFile(schemaPath)) as AnyJSONSchema;
  }

  throw new Error("Schema is required (--schema or --schema-json).");
};

const loadArtifactsFromOptions = async (
  options: Record<string, string | boolean>,
  deps?: { readStdinText?: () => Promise<string>; stdinIsTTY?: boolean }
): Promise<Artifact[]> => {
  const input = options.input;
  const text = options.text;
  const stdin = options.stdin;
  const artifact = options.artifact;
  const artifactJson = options["artifact-json"];
  const readStdin = deps?.readStdinText ?? readStdinText;
  const stdinIsTTY = deps?.stdinIsTTY ?? process.stdin.isTTY;
  const inferredStdin =
    !stdin && !input && !text && !artifact && !artifactJson && stdinIsTTY === false;
  const stdinRequested = Boolean(stdin) || inferredStdin;

  ensureSingleInput([input, text, stdinRequested, artifact, artifactJson]);

  if (typeof artifactJson === "string") {
    const serialized = parseSerializedArtifacts(artifactJson);
    return parseInputToArtifacts({ kind: "artifact-json", data: serialized });
  }

  if (artifact) {
    const source = artifact === "-" ? await readStdinText() : await Bun.file(artifact as string).text();
    const serialized = parseSerializedArtifacts(source);
    return parseInputToArtifacts({ kind: "artifact-json", data: serialized });
  }

  if (typeof text === "string") {
    return parseInputToArtifacts({ kind: "text", text });
  }

  if (stdinRequested) {
    const stdinText = await readStdin();
    return parseInputToArtifacts({ kind: "text", text: stdinText });
  }

  if (typeof input === "string") {
    return parseInputToArtifacts({ kind: "file", path: input });
  }

  throw new Error("No input provided.");
};

export const runExtractCommand = async (
  options: Record<string, string | boolean>,
  deps: CliDependencies
): Promise<ExtractionResult<unknown>> => {
  const schema = await loadSchema(options);
  const modelOption = options.model;
  let modelSpec: string | undefined;
  if (typeof modelOption === "string") {
    modelSpec = modelOption;
  } else if (modelOption !== undefined) {
    throw new Error("Model is required (--model provider/model).");
  }

  const artifacts = await loadArtifactsFromOptions(options, {
    readStdinText: deps.readStdinText,
    stdinIsTTY: deps.stdinIsTTY,
  });
  const output = options.output;
  const strategyName = typeof options.strategy === "string" ? options.strategy : "simple";

  const resolveModelFn = deps.resolveModel ?? resolveModel;
  const resolveDefaultModelFn = deps.resolveDefaultModel ?? resolveDefaultModelSpec;
  if (!modelSpec) {
    modelSpec = await resolveDefaultModelFn();
  }
  const createStrategyFn = deps.createStrategy ?? createStrategy;
  const extractFn = deps.extract ?? extract;

  const model = await resolveModelFn(modelSpec);
  const strategy = createStrategyFn(strategyName, model);
  const result = await extractFn({ artifacts, schema, strategy });

  if (result.error) {
    throw result.error;
  }

  const json = JSON.stringify(result.data, null, 2);
  await writeOutput(typeof output === "string" ? output : "-", json);

  return result;
};

export const runVerifyCommand = async (options: Record<string, string | boolean>) => {
  const input = options.input;
  const dataSource = typeof input === "string" ? input : "-";
  const raw = dataSource === "-" ? await readStdinText() : await Bun.file(dataSource).text();
  const parsed = JSON.parse(raw) as unknown;
  const artifacts = validateSerializedArtifacts(parsed);
  const json = JSON.stringify({ valid: true, artifacts: artifacts.length }, null, 2);
  await writeOutput("-", json);
};

export const runCli = async (argv: string[], deps: CliDependencies = {}) => {
  const { command, options, positionals } = parseArgs(argv);

  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const resolvedCommand = command ?? "extract-file";

  switch (resolvedCommand) {
    case "extract-file":
      await runExtractCommand(options, deps);
      return;
    case "verify":
      await runVerifyCommand(options);
      return;
    case "auth":
      await runAuthCommand(positionals, options);
      return;
    case "models":
      await runModelsCommand(options);
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};

if (import.meta.main) {
  process.env.AI_SDK_LOG_WARNINGS ??= "false";
  runCli(Bun.argv.slice(2)).catch(async (error) => {
    if (!process.stdin.isTTY) {
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
}
