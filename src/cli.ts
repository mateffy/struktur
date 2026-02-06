#!/usr/bin/env bun
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
import { setDefaultModel } from "./auth/config";
import {
  deleteProviderToken,
  getProviderTokenOrThrow,
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
  parseArgs,
  readStdinText,
  resolveDefaultModelSpec,
  resolveModel,
  stdinConsumed,
  usage,
} from "./cli/shared";
import type {
  ExtractionEvents,
  ExtractionResult,
  ExtractionStrategy,
} from "./types";
import cliProgress from "cli-progress";

type CliDependencies = {
  resolveModel?: (model: string) => Promise<unknown>;
  resolveDefaultModel?: () => Promise<string>;
  createStrategy?: (
    name: string,
    model: unknown,
    options?: StrategyOptions,
  ) => ExtractionStrategy<unknown>;
  extract?: typeof extract;
  readStdinText?: () => Promise<string>;
  stdinIsTTY?: boolean;
  events?: ExtractionEvents;
};

type AuthDependencies = {
  resolveCheapestModel?: typeof resolveCheapestModel;
  listStoredProviders?: typeof listStoredProviders;
  setDefaultModel?: typeof setDefaultModel;
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
  const tokenSources = [token, tokenStdin].filter(
    (value) => value !== undefined && value !== false,
  );
  if (tokenSources.length !== 1) {
    throw new Error(
      "Specify exactly one token source (--token or --token-stdin).",
    );
  }

  if (typeof token === "string") {
    return token;
  }

  return (await readStdinText()).trim();
};

export const runAuthCommand = async (
  positionals: string[],
  options: Record<string, string | boolean>,
  deps: AuthDependencies = {},
) => {
  const action = positionals[0];
  if (!action) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const provider =
    typeof options.provider === "string" ? options.provider : undefined;
  const resolveCheapestModelFn =
    deps.resolveCheapestModel ?? resolveCheapestModel;
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
        throw new Error(
          "Provider is required (auth default <provider> or --model).",
        );
      }

      const providers = await listStoredProvidersFn();
      const configured = providers.some(
        (entry) => entry.provider === providerName,
      );
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

export const runModelsCommand = async (
  options: Record<string, string | boolean>,
) => {
  const provider =
    typeof options.provider === "string" ? options.provider : undefined;
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

export const runExtractCommand = async (
  options: Record<string, string | boolean>,
  deps: CliDependencies,
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
  const strategyName =
    typeof options.strategy === "string" ? options.strategy : "simple";
  const chunkSizeOption = options["chunk-size"];
  let chunkSize: number | undefined;
  if (typeof chunkSizeOption === "string") {
    const parsed = Number(chunkSizeOption);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("Chunk size must be a positive number (--chunk-size).");
    }
    chunkSize = Math.floor(parsed);
  } else if (chunkSizeOption !== undefined) {
    throw new Error("Chunk size must be a number (--chunk-size).");
  }

  const resolveModelFn = deps.resolveModel ?? resolveModel;
  const resolveDefaultModelFn =
    deps.resolveDefaultModel ?? resolveDefaultModelSpec;
  if (!modelSpec) {
    modelSpec = await resolveDefaultModelFn();
  }
  const createStrategyFn = deps.createStrategy ?? createStrategy;
  const extractFn = deps.extract ?? extract;

  const model = await resolveModelFn(modelSpec);
  const strategy = createStrategyFn(strategyName, model, { chunkSize });
  const totalSteps = strategy.getEstimatedSteps?.(artifacts);
  const showProgress = process.stderr.isTTY === true;
  const barTotal = totalSteps ?? 100;
  let barValue = 0;
  let progressTimer: ReturnType<typeof setInterval> | undefined;
  const progressBar = showProgress
    ? new cliProgress.SingleBar(
        {
          format: "◈ {bar} {percentage}% | {message}",
          barCompleteChar: "▰",
          barIncompleteChar: "▱",
          hideCursor: true,
          clearOnComplete: true,
        },
        cliProgress.Presets.shades_classic,
      )
    : null;

  if (progressBar) {
    progressBar.start(barTotal, 0, { message: "starting" });
    if (!totalSteps) {
      progressTimer = setInterval(() => {
        if (barValue >= 90) {
          return;
        }
        barValue += 1;
        progressBar.update(barValue, { message: "processing" });
      }, 200);
    }
  }

  const events: ExtractionEvents = {
    onStep: async (info) => {
      if (progressBar) {
        const value = info.total
          ? info.step
          : info.label === "complete"
            ? barTotal
            : 0;
        barValue = Math.min(value, barTotal);
        progressBar.update(barValue, {
          message: info.label ?? "working",
        });
      }
      await deps.events?.onStep?.(info);
    },
    onProgress: async (info) => {
      if (progressBar) {
        if (progressTimer) {
          clearInterval(progressTimer);
          progressTimer = undefined;
        }
        const percent =
          info.percent ?? Math.round((info.current / info.total) * 100);
        const value = Math.round((percent / 100) * barTotal);
        barValue = Math.min(value, barTotal);
        progressBar.update(barValue, {
          message: `processing ${info.current}/${info.total}`,
        });
      }
      await deps.events?.onProgress?.(info);
    },
    onMessage: async (info) => {
      await deps.events?.onMessage?.(info);
    },
    onTokenUsage: async (info) => {
      await deps.events?.onTokenUsage?.(info);
    },
  };

  const result = await extractFn({ artifacts, schema, strategy, events });

  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = undefined;
  }
  if (progressBar) {
    if (result.error) {
      progressBar.update(barTotal, { message: "failed" });
    } else {
      progressBar.update(barTotal, { message: "complete" });
    }
    progressBar.stop();
  }

  if (result.error) {
    throw result.error;
  }

  const json = JSON.stringify(result.data, null, 2);
  await writeOutput(typeof output === "string" ? output : "-", json);

  return result;
};

export const runVerifyCommand = async (
  options: Record<string, string | boolean>,
) => {
  const input = options.input;
  const dataSource = typeof input === "string" ? input : "-";
  const raw =
    dataSource === "-"
      ? await readStdinText()
      : await Bun.file(dataSource).text();
  const parsed = JSON.parse(raw) as unknown;
  const artifacts = validateSerializedArtifacts(parsed);
  const json = JSON.stringify(
    { valid: true, artifacts: artifacts.length },
    null,
    2,
  );
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
}
