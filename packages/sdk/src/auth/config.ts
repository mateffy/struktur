import path from "node:path";
import os from "node:os";
import { chmod, mkdir } from "node:fs/promises";
import type { ParserDef, ParsersConfig } from "@struktur/sdk";

type TelemetryConfig = {
  enabled: boolean;
  provider: string;
  url?: string;
  apiKey?: string;
  projectName?: string;
  publicKey?: string; // For Langfuse
  secretKey?: string; // For Langfuse
  baseUrl?: string; // For Langfuse
  sampleRate?: number;
};

type ConfigStore = {
  version: 1;
  defaultModel?: string;
  aliases?: Record<string, string>;
  parsers?: ParsersConfig;
  telemetry?: TelemetryConfig;
};

const CONFIG_DIR_ENV = "STRUKTUR_CONFIG_DIR";

const resolveConfigDir = () => {
  return process.env[CONFIG_DIR_ENV] ?? path.join(os.homedir(), ".config", "struktur");
};

const resolveConfigPath = () => path.join(resolveConfigDir(), "config.json");

const emptyStore = (): ConfigStore => ({ version: 1 });

const readConfigStore = async (): Promise<ConfigStore> => {
  const configPath = resolveConfigPath();
  const exists = await Bun.file(configPath).exists();
  if (!exists) {
    return emptyStore();
  }
  const raw = await Bun.file(configPath).text();
  const parsed = JSON.parse(raw) as ConfigStore;
  if (!parsed || parsed.version !== 1) {
    return emptyStore();
  }
  return parsed;
};

const writeConfigStore = async (store: ConfigStore) => {
  const configDir = resolveConfigDir();
  const configPath = resolveConfigPath();
  await mkdir(configDir, { recursive: true, mode: 0o700 });
  await Bun.write(configPath, JSON.stringify(store, null, 2));
  await chmod(configDir, 0o700);
  await chmod(configPath, 0o600);
};

export const getDefaultModel = async () => {
  const store = await readConfigStore();
  return store.defaultModel;
};

export const setDefaultModel = async (model: string) => {
  const store = await readConfigStore();
  store.defaultModel = model;
  await writeConfigStore(store);
  return model;
};

// --- Alias management ---

export const listAliases = async (): Promise<Record<string, string>> => {
  const store = await readConfigStore();
  return store.aliases ?? {};
};

export const getAlias = async (alias: string): Promise<string | undefined> => {
  const store = await readConfigStore();
  return store.aliases?.[alias];
};

export const setAlias = async (alias: string, model: string): Promise<string> => {
  const store = await readConfigStore();
  store.aliases ??= {};
  store.aliases[alias] = model;
  await writeConfigStore(store);
  return model;
};

export const deleteAlias = async (alias: string): Promise<boolean> => {
  const store = await readConfigStore();
  if (!store.aliases?.[alias]) {
    return false;
  }
  delete store.aliases[alias];
  await writeConfigStore(store);
  return true;
};

/**
 * Resolve a model spec: if it matches a stored alias, return the aliased model string.
 * Otherwise return the original spec unchanged.
 */
export const resolveAlias = async (modelSpec: string): Promise<string> => {
  const aliases = await listAliases();
  return aliases[modelSpec] ?? modelSpec;
};

// --- Parser config management ---

export const listParsers = async (): Promise<ParsersConfig> => {
  const store = await readConfigStore();
  return store.parsers ?? {};
};

export const getParser = async (mimeType: string): Promise<ParserDef | undefined> => {
  const store = await readConfigStore();
  return store.parsers?.[mimeType];
};

export const setParser = async (mimeType: string, def: ParserDef): Promise<void> => {
  if (def.type === "command-file" && !def.command.includes("FILE_PATH")) {
    throw new Error(
      `command-file parser must contain FILE_PATH placeholder in the command string. Got: "${def.command}"`
    );
  }
  const store = await readConfigStore();
  store.parsers ??= {};
  store.parsers[mimeType] = def;
  await writeConfigStore(store);
};

export const deleteParser = async (mimeType: string): Promise<boolean> => {
  const store = await readConfigStore();
  if (!store.parsers?.[mimeType]) {
    return false;
  }
  delete store.parsers[mimeType];
  await writeConfigStore(store);
  return true;
};

// --- Telemetry config management ---

export const getTelemetryConfig = async (): Promise<TelemetryConfig | undefined> => {
  const store = await readConfigStore();
  return store.telemetry;
};

export const setTelemetryConfig = async (config: TelemetryConfig): Promise<void> => {
  const store = await readConfigStore();
  store.telemetry = config;
  await writeConfigStore(store);
};

export const enableTelemetry = async (
  provider: string,
  options: Omit<TelemetryConfig, "enabled" | "provider">
): Promise<void> => {
  const store = await readConfigStore();
  store.telemetry = {
    enabled: true,
    provider,
    ...options,
  };
  await writeConfigStore(store);
};

export const disableTelemetry = async (): Promise<void> => {
  const store = await readConfigStore();
  if (store.telemetry) {
    store.telemetry.enabled = false;
  }
  await writeConfigStore(store);
};

export const deleteTelemetryConfig = async (): Promise<boolean> => {
  const store = await readConfigStore();
  if (!store.telemetry) {
    return false;
  }
  delete store.telemetry;
  await writeConfigStore(store);
  return true;
};
