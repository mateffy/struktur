import { test, expect } from "bun:test";
import path from "node:path";
import os from "node:os";
import { rm } from "node:fs/promises";
import {
  deleteProviderToken,
  getProviderTokenOrThrow,
  listStoredProviders,
  resolveProviderToken,
  setProviderToken,
} from "./tokens";

const makeTempDir = () => {
  const suffix = Math.random().toString(16).slice(2);
  return path.join(os.tmpdir(), `struktur-test-${suffix}`);
};

test("setProviderToken stores token in file when keychain disabled", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;
  process.env.STRUKTUR_DISABLE_KEYCHAIN = "1";

  try {
    const storage = await setProviderToken("openai", "sk-test", "auto");
    expect(storage).toBe("file");

    const resolved = await resolveProviderToken("openai");
    expect(resolved).toBe("sk-test");

    const listed = await listStoredProviders();
    expect(listed).toEqual([{ provider: "openai", storage: "file" }]);

    const token = await getProviderTokenOrThrow("openai");
    expect(token).toBe("sk-test");
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    delete process.env.STRUKTUR_DISABLE_KEYCHAIN;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("deleteProviderToken removes stored token", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;
  process.env.STRUKTUR_DISABLE_KEYCHAIN = "1";

  try {
    await setProviderToken("anthropic", "sk-test", "auto");
    const deleted = await deleteProviderToken("anthropic");
    expect(deleted).toBe(true);
    const resolved = await resolveProviderToken("anthropic");
    expect(resolved).toBeUndefined();
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    delete process.env.STRUKTUR_DISABLE_KEYCHAIN;
    await rm(tempDir, { recursive: true, force: true });
  }
});
