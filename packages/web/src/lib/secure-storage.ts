// Secure storage layer for API keys and encryption keys
// Uses LocalStorage for encrypted data and SessionStorage for the password

import {
  type EncryptedData,
  generateEncryptionKey,
  encryptWithPassword,
  decryptWithPassword,
  encryptApiKey,
  decryptApiKey,
  verifyPassword,
} from './crypto'

// Storage keys
const MASTER_KEY_STORAGE_KEY = 'struktur_master_key_encrypted'
const API_KEY_PREFIX = 'struktur_api_key_'
const SESSION_PASSWORD_KEY = 'struktur_session_password'

export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'opencode'
  | 'openrouter'

export interface StoredApiKey {
  provider: ProviderId
  encryptedData: EncryptedData
  updatedAt: string
}

export interface SecureStorageState {
  isInitialized: boolean
  isUnlocked: boolean
  hasEncryptedData: boolean
}

/**
 * Check if the user has previously set up encryption (has encrypted master key in LocalStorage)
 */
export function hasEncryptedMasterKey(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MASTER_KEY_STORAGE_KEY) !== null
}

/**
 * Check if the user has an active session (password in SessionStorage)
 */
export function hasActiveSession(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(SESSION_PASSWORD_KEY) !== null
}

/**
 * Get the current session password from SessionStorage
 */
export function getSessionPassword(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(SESSION_PASSWORD_KEY)
}

/**
 * Set the session password in SessionStorage
 */
export function setSessionPassword(password: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SESSION_PASSWORD_KEY, password)
}

/**
 * Clear the session password (logout)
 */
export function clearSessionPassword(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_PASSWORD_KEY)
}

/**
 * Initialize secure storage with a new password
 * This creates a new master encryption key encrypted with the password
 */
export async function initializeSecureStorage(
  password: string
): Promise<void> {
  // Generate a new random master key
  const masterKey = await generateEncryptionKey()

  // Encrypt the master key with the password
  const encryptedMasterKey = await encryptWithPassword(masterKey, password)

  // Store in LocalStorage
  localStorage.setItem(
    MASTER_KEY_STORAGE_KEY,
    JSON.stringify(encryptedMasterKey)
  )

  // Set the session password
  setSessionPassword(password)
}

/**
 * Unlock the secure storage with a password
 * Returns true if successful, false if password is wrong
 */
export async function unlockSecureStorage(password: string): Promise<boolean> {
  const stored = localStorage.getItem(MASTER_KEY_STORAGE_KEY)
  if (!stored) return false

  try {
    const encryptedMasterKey: EncryptedData = JSON.parse(stored)
    const isValid = await verifyPassword(encryptedMasterKey, password)

    if (isValid) {
      setSessionPassword(password)
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Get the decrypted master key
 * Requires an active session (password in SessionStorage)
 */
async function getMasterKey(): Promise<string | null> {
  const password = getSessionPassword()
  if (!password) return null

  const stored = localStorage.getItem(MASTER_KEY_STORAGE_KEY)
  if (!stored) return null

  try {
    const encryptedMasterKey: EncryptedData = JSON.parse(stored)
    return await decryptWithPassword(encryptedMasterKey, password)
  } catch {
    return null
  }
}

/**
 * Store an API key for a provider
 * Requires an active session
 */
export async function storeApiKey(
  provider: ProviderId,
  apiKey: string
): Promise<boolean> {
  const masterKey = await getMasterKey()
  if (!masterKey) return false

  try {
    const encryptedData = await encryptApiKey(apiKey, masterKey)

    const storedData: StoredApiKey = {
      provider,
      encryptedData,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(
      `${API_KEY_PREFIX}${provider}`,
      JSON.stringify(storedData)
    )

    return true
  } catch {
    return false
  }
}

/**
 * Retrieve and decrypt an API key for a provider
 * Requires an active session
 */
export async function retrieveApiKey(
  provider: ProviderId
): Promise<string | null> {
  const masterKey = await getMasterKey()
  if (!masterKey) return null

  const stored = localStorage.getItem(`${API_KEY_PREFIX}${provider}`)
  if (!stored) return null

  try {
    const storedData: StoredApiKey = JSON.parse(stored)
    return await decryptApiKey(storedData.encryptedData, masterKey)
  } catch {
    return null
  }
}

/**
 * Check if an API key exists for a provider (without decrypting)
 */
export function hasApiKey(provider: ProviderId): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`${API_KEY_PREFIX}${provider}`) !== null
}

/**
 * Delete an API key for a provider
 */
export function deleteApiKey(provider: ProviderId): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`${API_KEY_PREFIX}${provider}`)
}

/**
 * Get all providers that have stored API keys
 */
export function getStoredProviders(): ProviderId[] {
  if (typeof window === 'undefined') return []

  const providers: ProviderId[] = []
  const allProviders: ProviderId[] = [
    'openai',
    'anthropic',
    'google',
    'opencode',
    'openrouter',
  ]

  for (const provider of allProviders) {
    if (localStorage.getItem(`${API_KEY_PREFIX}${provider}`)) {
      providers.push(provider)
    }
  }

  return providers
}

/**
 * Get the current state of secure storage
 */
export function getSecureStorageState(): SecureStorageState {
  return {
    isInitialized: hasEncryptedMasterKey(),
    isUnlocked: hasActiveSession(),
    hasEncryptedData: hasEncryptedMasterKey(),
  }
}

/**
 * Change the password for the secure storage
 * Requires the current session to be active
 */
export async function changeStoragePassword(
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  const stored = localStorage.getItem(MASTER_KEY_STORAGE_KEY)
  if (!stored) return false

  try {
    const encryptedMasterKey: EncryptedData = JSON.parse(stored)

    // Decrypt with old password
    const masterKey = await decryptWithPassword(encryptedMasterKey, oldPassword)

    // Re-encrypt with new password
    const newEncryptedMasterKey = await encryptWithPassword(masterKey, newPassword)

    // Store new encrypted master key
    localStorage.setItem(
      MASTER_KEY_STORAGE_KEY,
      JSON.stringify(newEncryptedMasterKey)
    )

    // Update session password
    setSessionPassword(newPassword)

    return true
  } catch {
    return false
  }
}

/**
 * Clear all secure storage (delete all API keys and master key)
 */
export function clearAllSecureStorage(): void {
  if (typeof window === 'undefined') return

  // Clear all API keys
  const allProviders: ProviderId[] = [
    'openai',
    'anthropic',
    'google',
    'opencode',
    'openrouter',
  ]

  for (const provider of allProviders) {
    localStorage.removeItem(`${API_KEY_PREFIX}${provider}`)
  }

  // Clear master key
  localStorage.removeItem(MASTER_KEY_STORAGE_KEY)

  // Clear session
  clearSessionPassword()
}

/**
 * Lock the secure storage (clear session but keep encrypted data)
 */
export function lockSecureStorage(): void {
  clearSessionPassword()
}
