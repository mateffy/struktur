import { describe, expect, it } from "vitest";
import {
  changePassword,
  decryptApiKey,
  decryptWithPassword,
  encryptApiKey,
  encryptWithPassword,
  generateEncryptionKey,
  verifyPassword,
  type EncryptedData,
} from "./crypto";

describe("crypto", () => {
  it("generateEncryptionKey returns a base64 256-bit key", async () => {
    const key = await generateEncryptionKey();
    expect(typeof key).toBe("string");
    expect(key.length).toBeGreaterThan(0);
    // base64 of 32 bytes (256 bits) is 43 chars + padding
    expect(key).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("generateEncryptionKey produces a fresh key each call", async () => {
    const a = await generateEncryptionKey();
    const b = await generateEncryptionKey();
    expect(a).not.toBe(b);
  });

  it("encryptWithPassword/decryptWithPassword round-trips a string", async () => {
    const data = "helloworld-secret-$#@";
    const password = "correct horse battery staple";
    const encrypted = await encryptWithPassword(data, password);

    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.salt).toBeTruthy();
    expect(encrypted.data).toBeTruthy();
    // ciphertext must not leak the plaintext
    expect(encrypted.data).not.toContain("helloworld");

    const decrypted = await decryptWithPassword(encrypted, password);
    expect(decrypted).toBe(data);
  });

  it("decryptWithPassword throws on the wrong password", async () => {
    const encrypted = await encryptWithPassword("hello", "right-password");
    await expect(decryptWithPassword(encrypted, "wrong-password")).rejects.toThrow();
  });

  it("verifyPassword returns true for the correct password and false otherwise", async () => {
    const encrypted = await encryptWithPassword("x", "pw-123456");
    await expect(verifyPassword(encrypted, "pw-123456")).resolves.toBe(true);
    await expect(verifyPassword(encrypted, "pw-654321")).resolves.toBe(false);
  });

  it("encrypting the same plaintext twice yields different ciphertexts (random IV)", async () => {
    const a = await encryptWithPassword("same", "pw");
    const b = await encryptWithPassword("same", "pw");
    expect(a.data).not.toBe(b.data);
    expect(a.iv).not.toBe(b.iv);
    // both still decrypt to the same value
    await expect(decryptWithPassword(a, "pw")).resolves.toBe("same");
    await expect(decryptWithPassword(b, "pw")).resolves.toBe("same");
  });

  it("encryptApiKey/decryptApiKey round-trips with a master key", async () => {
    const masterKey = await generateEncryptionKey();
    const secret = "sk-proj-secret-value";

    const encrypted = await encryptApiKey(secret, masterKey);
    expect(encrypted.data).not.toContain(secret);

    const decrypted = await decryptApiKey(encrypted, masterKey);
    expect(decrypted).toBe(secret);
  });

  it("decryptApiKey fails with an unrelated master key", async () => {
    const originalMaster = await generateEncryptionKey();
    const otherMaster = await generateEncryptionKey();
    const encrypted = await encryptApiKey("secret", originalMaster);

    await expect(decryptApiKey(encrypted, otherMaster)).rejects.toThrow();
  });

  it("changePassword re-encrypts the master key and preserves the underlying data", async () => {
    const master = await generateEncryptionKey();
    const encryptedWithOld = await encryptWithPassword(master, "old-password");

    const reEncrypted: EncryptedData = await changePassword(
      encryptedWithOld,
      "old-password",
      "new-password",
    );

    // The old password no longer unlocks it…
    await expect(decryptWithPassword(reEncrypted, "old-password")).rejects.toThrow();
    // …but the new one does, and the master key survives.
    await expect(decryptWithPassword(reEncrypted, "new-password")).resolves.toBe(master);
  });

  it("salt differs between encryptions of the same value", async () => {
    const a = await encryptWithPassword("same", "pw");
    const b = await encryptWithPassword("same", "pw");
    expect(a.salt).not.toBe(b.salt);
  });
});
