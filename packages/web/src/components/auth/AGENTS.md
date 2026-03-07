# API Key Secure Storage

This module provides secure client-side storage for API keys used with LLM model providers.

## Architecture

### Two-Layer Encryption

1. **API Key Encryption**: Each API key is encrypted with a randomly generated 256-bit master key using AES-GCM
2. **Master Key Encryption**: The master key is encrypted with the user's password using PBKDF2 key derivation and AES-GCM

### Storage Strategy

- **LocalStorage**: Stores encrypted API keys and the encrypted master key
- **SessionStorage**: Stores the user's password (cleared when tab closes)
- **Memory**: Decrypted API keys are only kept in memory while the app is unlocked

This design ensures:
- Password survives page reloads but not tab closes
- Encrypted data persists across sessions
- No keys are stored or logged on the server

## Files

### Core Encryption (`lib/crypto.ts`)

- `generateEncryptionKey()`: Creates random 256-bit keys
- `encryptWithPassword()/decryptWithPassword()`: Password-based encryption
- `encryptApiKey()/decryptApiKey()`: API key encryption with master key
- `verifyPassword()`: Check if password can decrypt master key
- `changePassword()`: Re-encrypt master key with new password

Uses Web Crypto API with:
- AES-GCM for symmetric encryption
- PBKDF2 with 100,000 iterations for key derivation
- SHA-256 for hashing
- Random 12-byte IV and 16-byte salt

### Secure Storage (`lib/secure-storage.ts`)

High-level storage API:
- `initializeSecureStorage(password)`: First-time setup
- `unlockSecureStorage(password)`: Decrypt master key with password
- `storeApiKey()/retrieveApiKey()`: Save/load encrypted API keys
- `getStoredProviders()`: List providers with saved keys
- `lockSecureStorage()`: Clear session password
- `clearAllSecureStorage()`: Delete all encrypted data

### React Context (`components/auth/ApiKeyProvider.tsx`)

React context providing:
- `isInitialized`: Has user set up encryption?
- `isUnlocked`: Is the storage currently unlocked?
- `storedProviders`: List of providers with saved keys
- `saveApiKey()`: Encrypt and store an API key
- `getApiKey()`: Retrieve and decrypt an API key
- `removeApiKey()`: Delete an API key
- `unlock()`: Authenticate with password
- `lock()`: Clear session

### UI Components

**PasswordPrompt** (`components/auth/PasswordPrompt.tsx`)
- Full-screen modal for initial setup and unlock
- Password creation with confirmation
- Error handling for incorrect passwords
- Security information display

**ProviderSettings** (`components/auth/ProviderSettings.tsx`)
- Dialog for managing provider API keys
- Provider cards with logos and descriptions
- Auto-save functionality
- Show/hide key visibility toggle
- Security recommendations per provider
- Lock/Unlock functionality

**ProviderLogos** (`components/auth/ProviderLogos.tsx`)
- SVG icons for each provider
- Consistent branding

**SecureStorageGate** (`components/auth/SecureStorageGate.tsx`)
- Wrapper component that shows password prompt when needed
- Handles both setup and unlock flows
- Allows skipping unlock for new users

### Types (`types/providers.ts`)

Provider configuration including:
- Provider metadata (name, docs URL, key URL)
- SVG logos
- API key validation rules
- Security recommendations
- Key format hints

## Supported Providers

- **OpenAI**: GPT-4, GPT-3.5 (keys start with `sk-`)
- **Anthropic**: Claude models (keys start with `sk-ant-`)
- **Google**: Gemini models
- **Opencode**: Zen API (keys start with `opc_`)
- **OpenRouter**: Multi-provider routing (keys start with `sk-or-`)

## Security Considerations

1. **No Server Storage**: API keys are only stored encrypted in the browser
2. **Transient Server Usage**: Keys are sent to the server only during extraction requests and immediately used (set as env vars then restored)
3. **No Logging**: API keys are never logged on the server
4. **Password Cannot Be Recovered**: If forgotten, all encrypted data is lost
5. **Session Scoped**: Password clears when tab closes
6. **Validation**: API key format validation helps prevent typos

## Usage Flow

1. **First Visit**: User is prompted to create a password for secure storage
2. **Subsequent Visits**: User enters password to unlock storage (or can skip)
3. **Managing Keys**: User clicks lock icon in header to open provider settings
4. **Running Extraction**: App automatically uses stored key for selected provider
5. **Locking**: User can click "Lock Storage" to clear session

## Integration

The system is integrated into:
- **Root Route** (`routes/__root.tsx`): ApiKeyProvider wraps the app
- **ExtractPage** (`components/ExtractPage.tsx`): ProviderSettings button, API key retrieval
- **Server API** (`server/api.ts`): Receives API key, sets as env var, restores after extraction
