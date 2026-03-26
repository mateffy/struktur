// Secure cryptographic utilities for API key encryption
// Uses Web Crypto API with AES-GCM for encryption and PBKDF2 for key derivation

const ENCRYPTION_ALGORITHM = "AES-GCM";
const KEY_DERIVATION_ALGORITHM = "PBKDF2";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

export interface EncryptedData {
  iv: string; // Base64 encoded
  salt: string; // Base64 encoded
  data: string; // Base64 encoded encrypted data
}

/**
 * Generate a random encryption key (256-bit)
 */
export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"],
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

/**
 * Derive an encryption key from a password using PBKDF2
 */
async function deriveKeyFromPassword(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordData,
    { name: KEY_DERIVATION_ALGORITHM },
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt data with a password
 */
export async function encryptWithPassword(data: string, password: string): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from password
  const key = await deriveKeyFromPassword(password, salt.buffer as ArrayBuffer);

  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv: iv.buffer as ArrayBuffer },
    key,
    dataBuffer,
  );

  return {
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    data: arrayBufferToBase64(encrypted),
  };
}

/**
 * Decrypt data with a password
 * Throws if password is incorrect or data is corrupted
 */
export async function decryptWithPassword(
  encryptedData: EncryptedData,
  password: string,
): Promise<string> {
  const { iv, salt, data } = encryptedData;

  // Decode base64
  const ivBuffer = base64ToArrayBuffer(iv);
  const saltBuffer = base64ToArrayBuffer(salt);
  const dataBuffer = base64ToArrayBuffer(data);

  // Derive key from password
  const key = await deriveKeyFromPassword(password, saltBuffer);

  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    { name: ENCRYPTION_ALGORITHM, iv: ivBuffer },
    key,
    dataBuffer,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypt an API key with the master encryption key
 */
export async function encryptApiKey(apiKey: string, masterKey: string): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(apiKey);

  // Import the master key
  const keyData = base64ToArrayBuffer(masterKey);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: ENCRYPTION_ALGORITHM },
    false,
    ["encrypt"],
  );

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt the API key
  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv: iv.buffer as ArrayBuffer },
    cryptoKey,
    dataBuffer,
  );

  // Generate random salt (not used for key derivation here, but kept for consistency)
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  return {
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    data: arrayBufferToBase64(encrypted),
  };
}

/**
 * Decrypt an API key with the master encryption key
 */
export async function decryptApiKey(
  encryptedData: EncryptedData,
  masterKey: string,
): Promise<string> {
  const { iv, data } = encryptedData;

  // Decode base64
  const ivBuffer = base64ToArrayBuffer(iv);
  const dataBuffer = base64ToArrayBuffer(data);

  // Import the master key
  const keyData = base64ToArrayBuffer(masterKey);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: ENCRYPTION_ALGORITHM },
    false,
    ["decrypt"],
  );

  // Decrypt the API key
  const decrypted = await crypto.subtle.decrypt(
    { name: ENCRYPTION_ALGORITHM, iv: ivBuffer },
    cryptoKey,
    dataBuffer,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Change the password for an encrypted master key
 */
export async function changePassword(
  encryptedMasterKey: EncryptedData,
  oldPassword: string,
  newPassword: string,
): Promise<EncryptedData> {
  // Decrypt with old password
  const masterKey = await decryptWithPassword(encryptedMasterKey, oldPassword);

  // Re-encrypt with new password
  return encryptWithPassword(masterKey, newPassword);
}

/**
 * Verify that a password can decrypt the master key
 * Returns true if successful, false if password is wrong
 */
export async function verifyPassword(
  encryptedMasterKey: EncryptedData,
  password: string,
): Promise<boolean> {
  try {
    await decryptWithPassword(encryptedMasterKey, password);
    return true;
  } catch {
    return false;
  }
}

// Helper functions

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
