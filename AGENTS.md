# Struktur

## Overview

Struktur is a TypeScript library that reimplements LLM Magic for structured data extraction using the Vercel AI SDK. It operates on JSON-based artifact DTOs, chunks them by token budgets, runs extraction strategies, validates results with Ajv, and merges/dedupes outputs where needed.

## How to Use

- Primary API: `extract({ artifacts, schema, strategy, events? })`
- Artifacts: JSON DTOs with text and media slices (no parsing in this repo).
- Strategies: `simple`, `parallel`, `sequential`, `parallelAutoMerge`, `sequentialAutoMerge`, `doublePass`, `doublePassAutoMerge`.
- Schema: JSON Schema (typed with Ajv `JSONSchemaType<T>` for inferred `result.data`).

Example (usage shown in `README.md`):
- Build artifacts (e.g. `urlToArtifact`, `fileToArtifact`)
- Pick a strategy with a model
- Call `extract` and use `result.data`/`result.usage`

## Code Organization

- `src/extract.ts`: main entrypoint; delegates to strategy.
- `src/types.ts`: core DTOs and strategy interfaces.
- `src/artifacts/`: artifact helpers, provider registry, and input parsing/validation.
- `src/chunking/`: token-aware splitting and batching.
- `src/llm/`: Vercel AI SDK wrapper, message building, retry loop.
- `src/prompts/`: prompt builders and artifact XML formatting.
- `src/merge/`: schema-aware merge and dedup utilities.
- `src/strategies/`: extraction strategies and concurrency helpers.
- `src/validation/`: Ajv validator and error shaping.
- `src/cli.ts`: CLI entrypoint for extraction and artifact verification; auto-detects piped stdin and supports provider-based default model selection.
- Each `src/*/AGENTS.md` describes its subtree.


Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

- Tests are colocated next to implementation files (e.g. `foo.ts` and `foo.test.ts`).
- Add or update tests whenever you add or change behavior.
- Prefer small, focused unit tests that validate strategy orchestration, chunking, prompt formatting, and validation retries.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

## Documentation Styling Guide

Use the visual system derived from the clawkey UI reference when building documentation pages under `docs/`.

- **Typography:** Use `JetBrains Mono` for all text. Headings are uppercase with letter spacing (`0.04em` to `0.12em`).
- **Color system:** Grayscale palette with minimal accents. Base tokens:
  - Backgrounds: `--bg` `#fafafa`, `--bg-elevated` `#ffffff`, `--sidebar-bg` `#f5f5f5`
  - Text: `--text` `#1a1a1a`, `--text-secondary` `#555555`, `--text-muted` `#808080`, `--text-subtle` `#a0a0a0`
  - Borders: `--border` `#e0e0e0`, `--border-subtle` `#f0f0f0`, `--border-strong` `#d0d0d0`
  - Accent: `--accent` `#1a1a1a`, `--accent-hover` `#404040`, `--secure-bg` `#f8f8f8`
- **Layout:** Centered main content with max width ~980px. Documentation pages use a fixed left sidebar (240px) with section nav.
- **Components:**
  - Cards: `1px` border, `4px` radius, no heavy shadows.
  - Buttons: solid accent for primary, bordered neutral for secondary.
  - Badges: uppercase labels, gray background.
  - Code blocks: dark background (`--key-bg`) with light text (`--key-text`).
- **Motion:** Keep transitions subtle (150ms) and avoid animated gradients.
- **Dark mode:** Optional. If used, mirror the provided dark tokens in `docs/assets/style.css`.
- **Copy:** Technical, concise, and structured. Use short paragraphs and focused bullet lists.

## Agent Notes

- When you add or significantly change code under `src/`, update the nearest `AGENTS.md` in that subtree to reflect the current structure and responsibilities.
