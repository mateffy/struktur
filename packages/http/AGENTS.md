# HTTP Package

HTTP API server for running Struktur headlessly.

## Overview

This package provides a simple HTTP API for parsing files and extracting structured data using Struktur. It runs on Bun with Hono.

## Endpoints

### `GET /`

Returns API info and available endpoints.

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

**Request (JSON):**
```json
{
  "artifacts": [...],
  "schema": {...},
  "model": "openai/gpt-4",
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
- `model` (required): Model identifier (e.g., `openai/gpt-4`)
- `strategy` (optional): Extraction strategy (default: `simple`)
- `chunkSize` (optional): Token budget per batch (default: 10000)
- `maxSteps` (optional): Maximum agent steps for agent strategy
- `strict` (optional): Strict schema validation
- `images` (optional): Extract embedded images (when using file)
- `screenshots` (optional): Render page screenshots (when using file)

**Response:**
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
# Start development server with hot reload
bun run dev

# Start production server
bun run start
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
