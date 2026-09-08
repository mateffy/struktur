# Struktur

## Overview

Struktur is a TypeScript library that reimplements LLM Magic for structured data extraction using the Vercel AI SDK. It operates on Artifacts, chunks them by token budgets, runs extraction strategies, validates results against your schema, and merges/dedupes outputs where needed.

## Monorepo Structure

This is a Bun multi-package monorepo with the following packages:

- `packages/fields` (`@struktur/fields`): Standalone shorthand JSON Schema builder
- `packages/sdk` (`@struktur/sdk`): Core SDK with extraction logic, strategies, types, and utilities
- `packages/benchmarks` (`@struktur/benchmarks`): Benchmark harness (cases, field-level scorer, matrix runner, dataset importers)
- `packages/cli` (`@struktur/cli`): CLI tool that uses the SDK
- `packages/documentation` (`@struktur/documentation`): Documentation site (private, not published)

## How to Use

- Primary API: `extract({ artifacts, schema, strategy, events? })`
- Artifacts: JSON with text and media slices (no parsing in this repo).
- Strategies: `simple`, `parallel`, `sequential`, `parallelAutoMerge`, `sequentialAutoMerge`, `doublePass`, `doublePassAutoMerge`.
- Schema: JSON Schema (typed with `JSONSchemaType<T>` for inferred `result.data`).

Example (usage shown in `README.md`):
- Build artifacts (e.g. `urlToArtifact`, `fileToArtifact`)
- Pick a strategy with a model
- Call `extract` and use `result.data`/`result.usage`

## Code Organization

### `packages/sdk/src/`

- `extract.ts`: main entrypoint; delegates to strategy.
- `types.ts`: core types and strategy interfaces.
- `artifacts/`: artifact helpers, provider registry, and input parsing/validation.
- `chunking/`: token-aware splitting and batching.
- `llm/`: Vercel AI SDK wrapper, message building, retry loop.
- `prompts/`: prompt builders and artifact XML formatting.
- `merge/`: schema-aware merge and dedup utilities.
- `strategies/`: extraction strategies and concurrency helpers.
- `validation/`: schema validator and error shaping.
- `auth/`: token and config management for CLI and SDK users.
- Each `*/AGENTS.md` describes its subtree.

### `packages/cli/src/`

- `cli.ts`: CLI entrypoint for extraction and artifact verification.
- `cli/shared.ts`: shared CLI utilities for loading artifacts, schemas, and models.

### `packages/documentation/`

- Documentation site built with Vite, TanStack Router, and Fumadocs.

## Development

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

- When you add or significantly change code under `packages/*/src/`, update the nearest `AGENTS.md` in that subtree to reflect the current structure and responsibilities.

## Release Process

The release cycle is: **login → version bump → changelog → commit → publish → tag → GitHub release → (optional) binary**. Do it in this order every time.

1. **Login** (npm auth, once per session): `pnpm login`

2. **Version bump**: `pnpm version <patch|minor|major>` — bumps the five published packages (`@struktur/fields`, `@struktur/sdk`, `@struktur/processors`, `@struktur/cli`, `@struktur/telemetry`) and refreshes `pnpm-lock.yaml`.

3. **Changelog**: Add a `## [<version>] - <date>` entry to `CHANGELOG.md` (Keep a Changelog, grouped by Added / Changed / Fixed / Security). Keep a fresh `## [Unreleased]` heading at the top. This is the source of truth for the release notes.

4. **Commit**: Commit the version bump + changelog (e.g. `chore: bump to v<version>`). The tree must be clean before publishing.

5. **Publish**: `pnpm publish -r --access public` — publishes every package to npm.

6. **Tag**: `git tag -a v<version> -m "Release v<version>"` then `git push origin v<version>`.

7. **GitHub release** — set the notes here at create time (no later `gh release edit`):
   ```bash
   gh release create v<version> --title "v<version>" --notes-file <changelog-section>
   ```
   Produce `<changelog-section>` from the `## [<version>]` block in `CHANGELOG.md` (omit the `## [<version>]` heading, keep the Security/Changed/Fixed groups).

8. **(Optional) Standalone binary**: build + upload the compiled CLI binary to the release:
   ```bash
   bun run build:binary
   cp packages/cli/dist/struktur struktur-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m)
   gh release upload v<version> struktur-*
   ```

### Gotchas (corner cases we hit)
- **pnpm v11 reads settings from `pnpm-workspace.yaml`, not `package.json`.** `pnpm.overrides` / `pnpm.onlyBuiltDependencies` in package.json are silently ignored; put them under `overrides:` / `allowBuilds:` in `pnpm-workspace.yaml` (used for the `tar` CVE override and the build-script approvals).
- **`pnpm build` must build `@struktur/processors` before `@struktur/cli`** — the CLI imports it and fails in a fresh checkout. The root `build` script orders fields → sdk → processors → telemetry → cli.
- **`@langfuse/otel` needs a real version range** — `^2.0.0` is unsatisfiable (the package only ships 4.x/5.x); use `^5.0.0`.
- **CI gate**: `pnpm check` (gesetz: oxlint + oxfmt + vitest) and `pnpm -r run test` must pass before releasing. CI runs install → build → check → test.
- **Dependency/security PRs** (Dependabot, OrbisAI, …): apply the fix yourself (own commit) rather than merging blindly; review the actual change and its lockfile.
- **Verify CI via `gh`**: `gh run list` / `gh run view <id>` to confirm the release commit's CI is green.


<research-agent>

Use research.actor instead of spinning up a sub-agent to explore the codebase.

**CRITICAL:** If `RESEARCH_ACTIVE` environment variable is set, you are already running inside a research subprocess. DO NOT invoke research again — analyze directly instead.

**When to use:** At the start of any task, or when you need codebase context (structure, patterns, uncommitted changes). Prefer this over manual exploration or sub-agents.

**What it does:** Returns an instant, cached analysis keyed by git commit. First run on a commit does a full analysis (cached), subsequent runs return instantly. Automatically detects and reports uncommitted working changes on top.

**Advantage:** Saves tokens and time. Avoids re-exploring the same codebase repeatedly. You get comprehensive context immediately without file-by-file exploration.

**How to use:**
- Run analysis: `research analyze`
- Ask a question: `research ask "your question"`
- If you have the skill available: mention "use the research.actor skill"
- View the full skill: `research skill` (outputs the complete SKILL.md)

</research-agent>
