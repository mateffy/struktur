import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import type { ProviderId } from '@/lib/secure-storage'
import {
  initializeSecureStorage,
  unlockSecureStorage,
  storeApiKey,
  retrieveApiKey,
  deleteApiKey,
  getStoredProviders,
  lockSecureStorage,
  getSecureStorageState,
  clearAllSecureStorage,
} from '@/lib/secure-storage'

type ApiKeyStatus = 'idle' | 'loading' | 'error'

interface ApiKeyContextValue {
  // State
  isInitialized: boolean
  isUnlocked: boolean
  storedProviders: ProviderId[]
  status: ApiKeyStatus
  error: string | null
  providerKeys: Partial<Record<ProviderId, string>>
  unlockRequested: boolean

  // Actions
  initialize: (password: string) => Promise<void>
  unlock: (password: string) => Promise<boolean>
  lock: () => void
  reset: () => void
  requestUnlock: () => void
  clearUnlockRequest: () => void
  saveApiKey: (provider: ProviderId, apiKey: string) => Promise<void>
  getApiKey: (provider: ProviderId) => Promise<string | null>
  removeApiKey: (provider: ProviderId) => void
  refreshStoredProviders: () => void
  hasKeyForProvider: (provider: ProviderId) => boolean
}

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined)

interface ApiKeyProviderProps {
  children: ReactNode
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [storedProviders, setStoredProviders] = useState<ProviderId[]>([])
  const [status, setStatus] = useState<ApiKeyStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [providerKeys, setProviderKeys] = useState<Partial<Record<ProviderId, string>>>({})
  const [unlockRequested, setUnlockRequested] = useState(false)

  // Check initial state on mount
  useEffect(() => {
    const state = getSecureStorageState()
    setIsInitialized(state.isInitialized)
    setIsUnlocked(state.isUnlocked)
    if (state.isInitialized) {
      setStoredProviders(getStoredProviders())
    }
  }, [])

  const initialize = useCallback(async (password: string) => {
    setStatus('loading')
    setError(null)

    try {
      await initializeSecureStorage(password)
      setIsInitialized(true)
      setIsUnlocked(true)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to initialize secure storage')
      throw err
    }
  }, [])

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    setStatus('loading')
    setError(null)

    try {
      const success = await unlockSecureStorage(password)
      if (success) {
        setIsUnlocked(true)
        setStoredProviders(getStoredProviders())
        setStatus('idle')
      } else {
        setStatus('error')
        setError('Incorrect password')
      }
      return success
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to unlock')
      return false
    }
  }, [])

  const lock = useCallback(() => {
    lockSecureStorage()
    setIsUnlocked(false)
    setProviderKeys({})
  }, [])

  const reset = useCallback(() => {
    clearAllSecureStorage()
    setIsInitialized(false)
    setIsUnlocked(false)
    setStoredProviders([])
    setProviderKeys({})
    setError(null)
    setStatus('idle')
    setUnlockRequested(false)
  }, [])

  const requestUnlock = useCallback(() => {
    if (!isUnlocked) {
      setUnlockRequested(true)
    }
  }, [isUnlocked])

  const clearUnlockRequest = useCallback(() => {
    setUnlockRequested(false)
  }, [])

  const saveApiKey = useCallback(async (provider: ProviderId, apiKey: string) => {
    if (!isUnlocked) {
      throw new Error('Secure storage is locked')
    }

    const success = await storeApiKey(provider, apiKey)
    if (!success) {
      throw new Error('Failed to save API key')
    }

    // Update local state
    setProviderKeys((prev) => ({ ...prev, [provider]: apiKey }))
    setStoredProviders((prev) => {
      if (prev.includes(provider)) return prev
      return [...prev, provider]
    })
  }, [isUnlocked])

  const getApiKey = useCallback(async (provider: ProviderId): Promise<string | null> => {
    if (!isUnlocked) {
      return null
    }

    // Check if we already have it cached
    if (providerKeys[provider]) {
      return providerKeys[provider]!
    }

    // Retrieve from storage
    const key = await retrieveApiKey(provider)
    if (key) {
      setProviderKeys((prev) => ({ ...prev, [provider]: key }))
    }
    return key
  }, [isUnlocked, providerKeys])

  const removeApiKey = useCallback((provider: ProviderId) => {
    deleteApiKey(provider)
    setProviderKeys((prev) => {
      const next = { ...prev }
      delete next[provider]
      return next
    })
    setStoredProviders((prev) => prev.filter((p) => p !== provider))
  }, [])

  const refreshStoredProviders = useCallback(() => {
    setStoredProviders(getStoredProviders())
  }, [])

  const hasKeyForProvider = useCallback((provider: ProviderId): boolean => {
    return storedProviders.includes(provider)
  }, [storedProviders])

  const value = useMemo(
    () => ({
      isInitialized,
      isUnlocked,
      storedProviders,
      status,
      error,
      providerKeys,
      unlockRequested,
      initialize,
      unlock,
      lock,
      reset,
      requestUnlock,
      clearUnlockRequest,
      saveApiKey,
      getApiKey,
      removeApiKey,
      refreshStoredProviders,
      hasKeyForProvider,
    }),
    [
      isInitialized,
      isUnlocked,
      storedProviders,
      status,
      error,
      providerKeys,
      unlockRequested,
      initialize,
      unlock,
      lock,
      reset,
      requestUnlock,
      clearUnlockRequest,
      saveApiKey,
      getApiKey,
      removeApiKey,
      refreshStoredProviders,
      hasKeyForProvider,
    ]
  )

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKeys(): ApiKeyContextValue {
  const context = useContext(ApiKeyContext)
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider')
  }
  return context
}
