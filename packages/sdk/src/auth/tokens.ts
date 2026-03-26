import path from "node:path";
import os from "node:os";
import { chmod, mkdir, readFile, writeFile, stat, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type TokenStorageType = "auto" | "keychain" | "file";

export type TokenEntry = {
  storage: "keychain" | "file";
  token?: string;
  account?: string;
  service?: string;
};

type TokenStore = {
  version: 1;
  providers: Record<string, TokenEntry>;
};

const CONFIG_DIR_ENV = "STRUKTUR_CONFIG_DIR";
const DISABLE_KEYCHAIN_ENV = "STRUKTUR_DISABLE_KEYCHAIN";
const SERVICE_ENV = "STRUKTUR_KEYCHAIN_SERVICE";
const DEFAULT_SERVICE = "struktur";

const resolveConfigDir = () => {
  return process.env[CONFIG_DIR_ENV] ?? path.join(os.homedir(), ".config", "struktur");
};

const resolveTokensPath = () => path.join(resolveConfigDir(), "tokens.json");

const emptyStore = (): TokenStore => ({ version: 1, providers: {} });

const readTokenStore = async (): Promise<TokenStore> => {
  const tokensPath = resolveTokensPath();
  try {
    await stat(tokensPath);
  } catch {
    return emptyStore();
  }
  const raw = await readFile(tokensPath, "utf-8");
  const parsed = JSON.parse(raw) as TokenStore;
  if (!parsed || parsed.version !== 1 || typeof parsed.providers !== "object") {
    return emptyStore();
  }
  return parsed;
};

const writeTokenStore = async (store: TokenStore) => {
  const configDir = resolveConfigDir();
  const tokensPath = resolveTokensPath();
  await mkdir(configDir, { recursive: true, mode: 0o700 });
  await writeFile(tokensPath, JSON.stringify(store, null, 2));
  await chmod(configDir, 0o700);
  await chmod(tokensPath, 0o600);
};

const isKeychainAvailable = async () => {
  if (process.env[DISABLE_KEYCHAIN_ENV]) {
    return false;
  }
  if (process.platform !== "darwin") {
    return false;
  }
  try {
    await access("/usr/bin/security");
    return true;
  } catch {
    return false;
  }
};

const keychainService = () => process.env[SERVICE_ENV] ?? DEFAULT_SERVICE;

const runSecurity = async (args: string[]) => {
  try {
    const { stdout } = await execFileAsync("/usr/bin/security", args);
    return stdout;
  } catch (error) {
    if (error instanceof Error && "stderr" in error) {
      const stderr = (error as { stderr: string }).stderr;
      const message = stderr?.trim() || error.message;
      throw new Error(message);
    }
    throw error;
  }
};

const writeKeychainToken = async (provider: string, token: string) => {
  await runSecurity([
    "add-generic-password",
    "-a",
    provider,
    "-s",
    keychainService(),
    "-w",
    token,
    "-U",
  ]);
};

const readKeychainToken = async (provider: string) => {
  const output = await runSecurity([
    "find-generic-password",
    "-a",
    provider,
    "-s",
    keychainService(),
    "-w",
  ]);
  return output.trim();
};

const deleteKeychainToken = async (provider: string) => {
  await runSecurity([
    "delete-generic-password",
    "-a",
    provider,
    "-s",
    keychainService(),
  ]);
};

export const listStoredProviders = async () => {
  const store = await readTokenStore();
  return Object.entries(store.providers).map(([provider, entry]) => ({
    provider,
    storage: entry.storage,
  }));
};

export const setProviderToken = async (
  provider: string,
  token: string,
  storage: TokenStorageType = "auto"
) => {
  const store = await readTokenStore();
  let resolvedStorage: TokenEntry["storage"] = "file";

  if (storage === "keychain") {
    if (!(await isKeychainAvailable())) {
      throw new Error("Keychain is not available on this platform.");
    }
    resolvedStorage = "keychain";
  } else if (storage === "auto") {
    resolvedStorage = (await isKeychainAvailable()) ? "keychain" : "file";
  }

  if (resolvedStorage === "keychain") {
    await writeKeychainToken(provider, token);
    store.providers[provider] = {
      storage: "keychain",
      account: provider,
      service: keychainService(),
    };
  } else {
    store.providers[provider] = {
      storage: "file",
      token,
    };
  }

  await writeTokenStore(store);
  return resolvedStorage;
};

export const deleteProviderToken = async (provider: string) => {
  const store = await readTokenStore();
  const entry = store.providers[provider];
  if (!entry) {
    return false;
  }

  if (entry.storage === "keychain") {
    try {
      await deleteKeychainToken(provider);
    } catch {
      // ignore errors for missing keychain items
    }
  }

  delete store.providers[provider];
  await writeTokenStore(store);
  return true;
};

export const resolveProviderToken = async (provider: string) => {
  const store = await readTokenStore();
  const entry = store.providers[provider];
  if (!entry) {
    return undefined;
  }

  if (entry.storage === "file") {
    return entry.token;
  }

  try {
    return await readKeychainToken(provider);
  } catch {
    return undefined;
  }
};

export const getProviderTokenOrThrow = async (provider: string) => {
  const token = await resolveProviderToken(provider);
  if (!token) {
    throw new Error(`No token stored for provider: ${provider}`);
  }
  return token;
};

export const resolveProviderEnvVar = (provider: string) => {
  switch (provider) {
    case "openai":
      return "OPENAI_API_KEY";
    case "anthropic":
      return "ANTHROPIC_API_KEY";
    case "google":
      return "GOOGLE_GENERATIVE_AI_API_KEY";
    case "opencode":
      return "OPENCODE_API_KEY";
    case "openrouter":
      return "OPENROUTER_API_KEY";
    default:
      return undefined;
  }
};

export const resolveOllamaBaseURL = async () => {
  if (process.env.OLLAMA_BASE_URL) {
    return process.env.OLLAMA_BASE_URL;
  }
  const stored = await resolveProviderToken("ollama");
  if (stored) {
    return stored;
  }
  return "http://localhost:11434/api";
};

export const maskToken = (token: string) => {
  if (token.length <= 8) {
    return "********";
  }
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
};
