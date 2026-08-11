# HTTP Package

HTTP API server for running Struktur headlessly.

## Overview

This package provides a simple HTTP API for parsing files and extracting structured data using Struktur. It runs on Bun with Hono and `hono-openapi` for auto-generated OpenAPI documentation.

## File Structure

```
src/
  index.ts              # Bun.serve() bootstrap
  app.ts                # Hono app instance, middleware, route mounting
  config.ts             # Environment variable loading
  schemas.ts            # Zod schemas (Standard Schema compliant)
  middleware/
    auth.ts             # Bearer token auth with /openapi.json whitelist
  routes/
    info.ts             # GET /
    parse.ts            # POST /parse
    extract.ts          # POST /extract (SSE by default, JSON with `?sse=false`; dual-mode: JSON + multipart + form)
    extract-stream.ts   # POST /extract/stream (convenience alias, always SSE)
    client.ts           # GET /client (Scalar API client UI)
    debug.ts            # GET /debug (simple HTML upload/debug UI)
  utils/
    serialize.ts        # Artifact serialization helpers
    extraction.ts       # Shared extraction primitives (parseExtractRequest, resolveModelForEnv, createStrategy)
```

## Quick Start

```bash
# Start the server (port 3031 by default)
bun run start

# Or with hot reload for development
bun run dev

# With auth enabled
API_KEY=secret-key bun run start

# With a specific provider key
OPENAI_API_KEY=sk-... bun run start
```

## API Client UI

Open `http://localhost:3031/client` in your browser for an interactive Scalar API client. The documentation is also available at `http://localhost:3031/openapi.json`.

## Endpoints

### `GET /`

Returns API info and available endpoints.

### `GET /client`

Interactive Scalar API client UI (auto-generated from the OpenAPI spec). No auth required.

### `GET /debug`

Simple HTML debug page for uploading files and visualizing extraction output in real-time. Submits to `/extract/stream` and displays all SSE events plus the final pretty-printed JSON result. No auth required. Uses Tailwind CSS via CDN.

### `GET /openapi.json`

OpenAPI 3.1.0 specification. No auth required.

### `POST /parse`

Parse uploaded files into artifact JSON.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `file` (required): File to parse
  - `images` (optional): Extract embedded images from documents (PDFs)
  - `screenshots` (optional): Render page screenshots
  - `screenshotScale` (optional): Scale factor for screenshots
  - `screenshotWidth` (optional): Target width in pixels for screenshots

**Response:**
```json
{
  "artifacts": [...]
}
```

### `POST /extract`

Extract structured data from documents or artifact JSON.

**Streaming behavior:** By default, returns SSE (`text/event-stream`). Disable streaming with `?sse=false` to get a plain JSON response.

**Request (JSON):**
```json
{
  "artifacts": [...],
  "schema": {...},
  "model": "openai/gpt-4.1-mini",
  "strategy": "simple",
  "chunkSize": 10000,
  "strict": false
}
```

**Request (multipart/form-data):**
- `artifacts` (optional): Artifact JSON string
- `file` (optional): File to parse (alternative to artifacts)
- `schema` (optional): JSON schema string
- `fields` (optional): Shorthand field list (alternative to schema)
- `model` (required): Model identifier (e.g., `openai/gpt-4.1-mini`, `anthropic/claude-sonnet-4-6`)
- `strategy` (optional): Extraction strategy (default: `simple`)
- `chunkSize` (optional): Token budget per batch (default: 10000)
- `maxSteps` (optional): Maximum agent steps for agent strategy
- `strict` (optional): Strict schema validation
- `images` (optional): Extract embedded images (when using file)
- `screenshots` (optional): Render page screenshots (when using file)

**Request (application/x-www-form-urlencoded):**
Same fields as multipart, but `artifacts` and `schema` must be JSON strings. No file upload support.

**Response (default SSE):** `text/event-stream` — see event types below.

**Response (`?sse=false`):**
```json
{
  "data": {...},
  "usage": {
    "inputTokens": 100,
    "outputTokens": 50,
    "totalTokens": 150
  }
}
```

### `POST /extract/stream`

Convenience alias that always streams via SSE. Accepts the same request formats as `POST /extract`.

**Response:** `text/event-stream`

Each event is a JSON object with a `type` field:

| Event type | Description |
|-----------|-------------|
| `step` | Extraction step started/completed |
| `progress` | Batch progress (current/total/percent) |
| `message` | LLM message sent/received |
| `tokenUsage` | Token usage update |
| `retry` | Retry attempt |
| `agent_tool_start` | Agent tool invocation started |
| `agent_tool_end` | Agent tool invocation completed |
| `agent_message` | Agent message |
| `agent_reasoning` | Agent reasoning/thought |
| `complete` | Final result with `data` and `usage` |
| `error` | Error message |

**Example (curl):**
```bash
curl -N -X POST http://localhost:3031/extract \
  -H "Content-Type: application/json" \
  -d '{
    "artifacts": [{"id":"1","type":"text","contents":[{"text":"test"}]}],
    "schema": {"type":"object","properties":{"name":{"type":"string"}}},
    "model": "openai/gpt-4o-mini"
  }'
```

Disable SSE to get plain JSON:
```bash
curl -X POST "http://localhost:3031/extract?sse=false" \
  -H "Content-Type: application/json" \
  -d '{
    "artifacts": [{"id":"1","type":"text","contents":[{"text":"test"}]}],
    "schema": {"type":"object","properties":{"name":{"type":"string"}}},
    "model": "openai/gpt-4o-mini"
  }'
```

## Example Requests

### Parse a file

```bash
curl -X POST http://localhost:3031/parse \
  -F "file=@document.pdf" \
  -F "images=true"
```

### Extract with JSON body (pre-parsed artifacts)

```bash
curl -X POST http://localhost:3031/extract \
  -H "Content-Type: application/json" \
  -d '{
    "artifacts": [{"id":"1","type":"text","contents":[{"text":"John Doe works at Acme Corp"}]}],
    "schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "company": {"type": "string"}
      }
    },
    "model": "openai/gpt-4o-mini",
    "strategy": "simple"
  }'
```

### Extract with file upload (parse + extract in one call)

```bash
curl -X POST http://localhost:3031/extract \
  -F "file=@document.pdf" \
  -F 'schema={"type":"object","properties":{"title":{"type":"string"}}}' \
  -F "model=openai/gpt-4o-mini" \
  -F "strategy=parallel" \
  -F "chunkSize=5000"
```

### Stream extraction with SSE (default)

```bash
curl -N -X POST http://localhost:3031/extract \
  -H "Content-Type: application/json" \
  -d '{
    "artifacts": [{"id":"1","type":"text","contents":[{"text":"test"}]}],
    "schema": {"type":"object","properties":{"name":{"type":"string"}}},
    "model": "openai/gpt-4o-mini"
  }'
```

### Extract with JSON response (disable SSE)

```bash
curl -X POST "http://localhost:3031/extract?sse=false" \
  -H "Content-Type: application/json" \
  -d '{
    "artifacts": [{"id":"1","type":"text","contents":[{"text":"test"}]}],
    "schema": {"type":"object","properties":{"name":{"type":"string"}}},
    "model": "openai/gpt-4o-mini"
  }'
```

### With authentication enabled

```bash
curl -X POST http://localhost:3031/extract \
  -H "Authorization: Bearer secret-key" \
  -H "Content-Type: application/json" \
  -d '{"artifacts": [...], "schema": {...}, "model": "openai/gpt-4o-mini"}'
```

## Authentication

If `API_KEY` environment variable is set, all requests must include:
```
Authorization: Bearer <api-key>
```

## Environment Variables

- `API_KEY`: API key for authentication (optional)
- `PORT`: Server port (default: 3031)
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key
- `GOOGLE_API_KEY`: Google API key
- `OPENCODE_API_KEY`: OpenCode API key
- `OPENROUTER_API_KEY`: OpenRouter API key

## Development

```bash
# Install dependencies
bun install

# Start development server with hot reload
bun run dev

# Start production server
bun run start

# Run tests
bun test
```

## Supported Strategies

- `simple`: Single-pass extraction
- `parallel`: Parallel batch processing with merge
- `sequential`: Sequential batch processing
- `parallelAutoMerge`: Parallel with auto-deduplication
- `sequentialAutoMerge`: Sequential with auto-deduplication
- `doublePass`: Two-pass extraction with merge
- `doublePassAutoMerge`: Two-pass with auto-deduplication
- `agent`: Agent-based extraction (requires `maxSteps`)
  - Uses a sandboxed emulated shell with only read/grep/glob file utilities
  - No external HTTP calls or command execution
  - No custom VM needed - runs safely in the same process
