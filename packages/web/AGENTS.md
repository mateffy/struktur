# Struktur Web Application

This is the browser-based web interface for Struktur data extraction.

## Architecture

### Tech Stack

- **Framework**: TanStack Router with React
- **State Management**: TanStack Query + React Context
- **Styling**: Tailwind CSS with custom theme
- **Components**: shadcn/ui + Radix UI primitives
- **Build Tool**: Vite with SSR support

### Color Palette

Warm, parchment-like theme:
- Background: `#f5efe6` (cream)
- Surface: `#ede5d8` (warm beige)
- Border: `#d4c8b8` (tan)
- Primary: `#7a5c3a` (brown)
- Text: `#2d1b0e` (dark brown)
- Muted: `#a0926f` (taupe)
- Success: `#5c8a5c` (green)
- Error: `#a05c5c` (red)

## Project Structure

```
src/
├── components/
│   ├── auth/              # API key secure storage
│   │   ├── AGENTS.md
│   │   ├── ApiKeyProvider.tsx
│   │   ├── PasswordPrompt.tsx
│   │   ├── ProviderSettings.tsx
│   │   ├── ProviderLogos.tsx
│   │   └── SecureStorageGate.tsx
│   ├── ui/                 # shadcn/ui components
│   ├── ai-elements/        # Custom AI components
│   ├── model/              # Model selector
│   ├── ExtractPage.tsx     # Main page component
│   ├── Sidebar.tsx
│   ├── ArtifactViewer.tsx
│   ├── OutputViewer.tsx
│   └── ...
├── lib/
│   ├── crypto.ts           # Web Crypto API utilities
│   ├── secure-storage.ts   # Encrypted storage layer
│   └── utils.ts
├── types/
│   └── providers.ts        # Provider configurations
├── server/
│   ├── hono.ts             # API routes
│   ├── api.ts              # Extraction logic
│   └── models.ts           # Model fetching
├── vitest.config.ts        # Test runner config + coverage thresholds
├── vitest.setup.ts         # Test setup: webcrypto, IndexedDB, DOM stubs
├── routes/
│   ├── __root.tsx          # Root with ApiKeyProvider
│   └── index.tsx
└── entry-server.tsx        # SSR entry
```

## Key Features

### Secure API Key Storage

The app features a secure, client-side encrypted storage system for API keys:
- Two-layer encryption (password → master key → API keys)
- LocalStorage for persistence, SessionStorage for session password
- Automatic key retrieval based on selected model provider
- Lock/unlock functionality in the header

See `components/auth/AGENTS.md` for detailed documentation.

### Data Extraction Flow

1. **File Upload**: Users upload files via drag-and-drop
2. **Parsing**: Files are parsed into artifacts (text, images)
3. **Schema Definition**: Users define output schema (JSON or field shorthand)
4. **Model Selection**: AI model and strategy selected
5. **Extraction**: Streaming extraction with real-time progress
6. **Results**: Structured data displayed with timeline

### API Endpoints

- `POST /api/parse`: Parse files into artifacts
- `POST /api/extract`: Run extraction (non-streaming)
- `POST /api/extract/stream`: Streaming extraction with SSE
- `GET /api/models`: List available models
- `GET /api/config`: Get default model and aliases

## Development

```bash
# Install dependencies
bun install

# Development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## Testing

The web app uses Vitest (jsdom) + Testing Library, with colocated `*.test.ts(x)` files next to the source, plus a shared setup in `vitest.setup.ts`.

```bash
# Run the strict suite (enforces coverage thresholds)
bun run test

# Watch mode
bun run test:watch
```

`vitest.config.ts` scopes the coverage gate to the data/auth/logic modules and the rendering surfaces the suite exercises (crypto/secure-storage/file-storage, the server API, and the main component tree). `bun run test` fails if statements/lines drop below 76%, branches below 70%, or functions below 62% on those files.

Coverage map (what the suite verifies):

- `lib/crypto.ts`, `lib/secure-storage.ts`, `lib/file-storage.ts` — encryption, key lifecycle, and IndexedDB persistence.
- `server/api.ts` — the `src/server` Hono routes (`/api/config`, `/api/parse`), `parseFiles`, `parseFieldsShorthand`, and the `extractData` failure path.
- `components/auth/*` — `ApiKeyProvider`, `SecureStorageGate`, `PasswordPrompt`, `ProviderSettings` (secure-storage workflow + rendering).
- `components/ExtractPage`, `Sidebar`, `SchemaInput`, `OutputViewer`, `Logo`, `FileUploadZone` — layout/rendering detail and the parse → extract → result workflow.

Notes:

- Provider listing (`/api/models`) hits the network, so the suite mocks `fetch` for `/api/config`, `/api/models`, `/api/parse`, and `/api/extract/stream` (SSE bodies are constructed as `ReadableStream`s).
- No real provider keys are used; the extraction error paths assert the failure behaviour.

## Security

- API keys are never stored on the server
- Keys are encrypted client-side with user password
- Keys are sent only during extraction requests
- Server sets key as env var, uses it, then restores original value
- All encryption uses Web Crypto API (PBKDF2 + AES-GCM)
