import path from "node:path";
import os from "node:os";
import { chmod, mkdir } from "node:fs/promises";

type ConfigStore = {
  version: 1;
  defaultModel?: string;
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
