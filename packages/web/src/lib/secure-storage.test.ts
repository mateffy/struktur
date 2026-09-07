import { describe, expect, it } from "vitest";
import {
  changeStoragePassword,
  clearAllSecureStorage,
  clearSessionPassword,
  deleteApiKey,
  getSecureStorageState,
  getSessionPassword,
  getStoredProviders,
  hasActiveSession,
  hasApiKey,
  hasEncryptedMasterKey,
  initializeSecureStorage,
  lockSecureStorage,
  retrieveApiKey,
  setSessionPassword,
  storeApiKey,
  unlockSecureStorage,
  type ProviderId,
} from "./secure-storage";

const PASSWORD = "correct-password-123";
const ALL_PROVIDERS: ProviderId[] = ["openai", "anthropic", "google", "opencode", "openrouter"];

describe("secure-storage", () => {
  it("starts uninitialized and locked", () => {
    const state = getSecureStorageState();
    expect(state.isInitialized).toBe(false);
    expect(state.isUnlocked).toBe(false);
    expect(hasEncryptedMasterKey()).toBe(false);
    expect(hasActiveSession()).toBe(false);
  });

  it("initializeSecureStorage creates a master key and unlocks the session", async () => {
    await initializeSecureStorage(PASSWORD);

    const state = getSecureStorageState();
    expect(state.isInitialized).toBe(true);
    expect(state.isUnlocked).toBe(true);
    expect(hasEncryptedMasterKey()).toBe(true);
    expect(getSessionPassword()).toBe(PASSWORD);
  });

  it("unlockSecureStorage succeeds with the correct password and fails otherwise", async () => {
    await initializeSecureStorage(PASSWORD);
    // Simulate a fresh session lock
    lockSecureStorage();
    expect(hasActiveSession()).toBe(false);

    await expect(unlockSecureStorage("wrong-password")).resolves.toBe(false);
    expect(hasActiveSession()).toBe(false);

    await expect(unlockSecureStorage(PASSWORD)).resolves.toBe(true);
    expect(hasActiveSession()).toBe(true);
  });

  it("unlockSecureStorage returns false when nothing is initialized", async () => {
    await expect(unlockSecureStorage(PASSWORD)).resolves.toBe(false);
  });

  it("storeApiKey/retrieveApiKey round-trips a provider key while unlocked", async () => {
    await initializeSecureStorage(PASSWORD);

    await expect(storeApiKey("openai", "sk-test-openai")).resolves.toBe(true);
    await expect(retrieveApiKey("openai")).resolves.toBe("sk-test-openai");
  });

  it("storeApiKey/retrieveApiKey return false/null while locked", async () => {
    await initializeSecureStorage(PASSWORD);
    lockSecureStorage();

    await expect(storeApiKey("openai", "sk-test")).resolves.toBe(false);
    await expect(retrieveApiKey("openai")).resolves.toBeNull();
  });

  it("hasApiKey and getStoredProviders reflect stored keys", async () => {
    await initializeSecureStorage(PASSWORD);

    expect(hasApiKey("anthropic")).toBe(false);
    expect(getStoredProviders()).toEqual([]);

    await storeApiKey("anthropic", "sk-anthropic");
    await storeApiKey("openrouter", "sk-openrouter");

    expect(hasApiKey("anthropic")).toBe(true);
    expect(getStoredProviders()).toEqual(["anthropic", "openrouter"]);
  });

  it("deleteApiKey removes only the matching provider", async () => {
    await initializeSecureStorage(PASSWORD);
    await storeApiKey("google", "sk-google");
    await storeApiKey("opencode", "sk-opencode");

    deleteApiKey("google");

    expect(hasApiKey("google")).toBe(false);
    expect(hasApiKey("opencode")).toBe(true);
    expect(getStoredProviders()).toEqual(["opencode"]);
  });

  it("lockSecureStorage clears the session but keeps the encrypted data", async () => {
    await initializeSecureStorage(PASSWORD);
    await storeApiKey("openai", "sk-openai");

    lockSecureStorage();

    const state = getSecureStorageState();
    expect(state.isInitialized).toBe(true);
    expect(state.isUnlocked).toBe(false);
    expect(hasEncryptedMasterKey()).toBe(true);
    // Data survives a lock, but is unreachable without a session
    await expect(retrieveApiKey("openai")).resolves.toBeNull();
  });

  it("changeStoragePassword re-encrypts with the new password", async () => {
    await initializeSecureStorage(PASSWORD);
    await storeApiKey("openai", "sk-openai");

    lockSecureStorage();
    await expect(changeStoragePassword(PASSWORD, "new-password-456")).resolves.toBe(true);

    // Old password fails, new works, keys survive
    await expect(unlockSecureStorage(PASSWORD)).resolves.toBe(false);
    await expect(unlockSecureStorage("new-password-456")).resolves.toBe(true);
    await expect(retrieveApiKey("openai")).resolves.toBe("sk-openai");
  });

  it("clearAllSecureStorage wipes master key, session, and all keys", async () => {
    await initializeSecureStorage(PASSWORD);
    // Store every provider
    for (const provider of ALL_PROVIDERS) {
      await storeApiKey(provider, `sk-${provider}`);
    }
    expect(getStoredProviders()).toHaveLength(ALL_PROVIDERS.length);

    clearAllSecureStorage();

    const state = getSecureStorageState();
    expect(state.isInitialized).toBe(false);
    expect(state.isUnlocked).toBe(false);
    expect(hasEncryptedMasterKey()).toBe(false);
    expect(hasActiveSession()).toBe(false);
    expect(getStoredProviders()).toEqual([]);
    for (const provider of ALL_PROVIDERS) {
      expect(hasApiKey(provider)).toBe(false);
    }
  });

  it("setSessionPassword/clearSessionPassword control the active session", () => {
    expect(getSessionPassword()).toBeNull();

    setSessionPassword("session-pass");
    expect(getSessionPassword()).toBe("session-pass");
    expect(hasActiveSession()).toBe(true);

    clearSessionPassword();
    expect(getSessionPassword()).toBeNull();
    expect(hasActiveSession()).toBe(false);
  });
});
