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

## Agent Notes

- When you add or significantly change code under `src/`, update the nearest `AGENTS.md` in that subtree to reflect the current structure and responsibilities.
