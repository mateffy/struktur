#!/usr/bin/env bun
import { extract } from "./extract";
import { simple } from "./strategies";
import {
  parseInputToArtifacts,
  parseSerializedArtifacts,
  validateSerializedArtifacts,
} from "./artifacts/input";
import type { AnyJSONSchema, Artifact, ExtractionResult, ExtractionStrategy } from "./types";

type CliDependencies = {
  resolveModel?: (model: string) => Promise<unknown>;
  createStrategy?: (name: string, model: unknown) => ExtractionStrategy<unknown>;
  extract?: typeof extract;
};

type ParsedArgs = {
  command?: string;
  options: Record<string, string | boolean>;
  positionals: string[];
};

const usage = () => {
  return [
    "struktur <command> [options]",
    "",
    "Commands:",
    "  extract-file   Extract data from input into JSON",
    "  verify         Validate artifact JSON from file or stdin",
    "",
    "extract-file options:",
    "  --input <path>           Input file to parse",
    "  --text <string>          Raw text input",
    "  --stdin                  Read raw text from stdin",
    "  --artifact <path|->      Artifact JSON file or stdin",
    "  --artifact-json <json>   Artifact JSON string",
    "  --schema <path>          JSON schema file",
    "  --schema-json <json>     JSON schema string",
    "  --model <provider/model> Model identifier (e.g. openai/gpt-5)",
    "  --output <path|->        Output path or stdout (default: -)",
    "  --strategy <name>        Strategy name (default: simple)",
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
  const [provider, ...rest] = model.split("/");
  const modelName = rest.join("/");

  if (!provider || !modelName) {
    throw new Error(`Invalid model format: ${model}`);
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

const createStrategy = (name: string, model: unknown): ExtractionStrategy<unknown> => {
  if (name !== "simple") {
    throw new Error(`Unsupported strategy: ${name}`);
  }
  return simple({ model });
};

const writeOutput = async (target: string | undefined, data: string) => {
  if (!target || target === "-") {
    process.stdout.write(`${data}\n`);
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
  options: Record<string, string | boolean>
): Promise<Artifact[]> => {
  const input = options.input;
  const text = options.text;
  const stdin = options.stdin;
  const artifact = options.artifact;
  const artifactJson = options["artifact-json"];

  ensureSingleInput([input, text, stdin, artifact, artifactJson]);

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

  if (stdin) {
    const stdinText = await readStdinText();
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
  const modelSpec = options.model;
  if (!modelSpec || typeof modelSpec !== "string") {
    throw new Error("Model is required (--model provider/model).");
  }

  const artifacts = await loadArtifactsFromOptions(options);
  const output = options.output;
  const strategyName = typeof options.strategy === "string" ? options.strategy : "simple";

  const resolveModelFn = deps.resolveModel ?? resolveModel;
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
  const { command, options } = parseArgs(argv);

  if (options.help || !command) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  switch (command) {
    case "extract-file":
      await runExtractCommand(options, deps);
      return;
    case "verify":
      await runVerifyCommand(options);
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};

if (import.meta.main) {
  runCli(Bun.argv.slice(2)).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
}
