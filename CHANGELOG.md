# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.7.0] - 2026-09-11

### Added

- **Contact-sheet compositor** — `parsePdf` composites extracted images into labeled contact sheets (MaxRects bin packing), each thumbnail labeled with its virtual filesystem path. Sheets cap at 1500px so the vision encoder does not downscale labels into illegibility. Opt-in (default off in `parsePdf`; the CLI enables it by default, `--no-contact-sheet` to disable).
- **Document-wide image dedup** — `parsePdf` keeps only one copy of byte-identical images (recurring logos/letterheads).
- **Observation-masked image payloads** in agent history (defensive; the AI SDK already strips media from persisted tool results).
- **Stable agent system prompt** — the growing extraction output moved out of the system prompt into the user-message tail so prompt caching can hit on the static prefix.
- **Contact-sheet-aware agent instructions** — the agent now views `contact-sheet` paths first and never assigns an image path it has not viewed.

### Fixed

- `createVirtualFilesystem` no longer clobbers a parser-assigned `virtualPath` (e.g. contact sheets).

## [2.6.1] - 2026-09-08

### Security

- **Pinned `tar` to `7.5.21`** (`overrides` in `pnpm-workspace.yaml`) to fix CVE-2026-59873 — a critical denial-of-service via crafted gzip bomb — plus several node-tar path-traversal advisories. The audit went from 109 findings (1 critical) to 87, 0 critical.

### Changed

- Upgraded all dependencies to their latest versions (`pnpm update --latest`): `zod` 4.5.4, `hono` 4.12.28, `oxfmt` 0.66, `oxlint` 1.81, `@mariozechner/pi-coding-agent` 0.73.
- Fixed `@langfuse/otel` in `@struktur/telemetry` — the `^2.0.0` range was unsatisfiable (only 4.x/5.x exist); now `^5.0.0`. Regenerated `pnpm-lock.yaml` so `pnpm install --frozen-lockfile` succeeds in CI.

### Fixed

- Build `@struktur/processors` before the CLI so a fresh checkout resolves the `@struktur/processors` import.
- HTTP API (`GET /`, `/openapi.json`) now reports the actual package version instead of a hardcoded `1.2.1`.

## [2.6.0] - 2026-09-07

- janitor release

## [2.5.0] - 2026-09-07

### Added

- **`@struktur/fields` package** — the fields-shorthand builder is extracted into a standalone, zero-dependency package. It turns a concise string like `title, price:number, tags:array` into a valid JSON Schema object, with no coupling to Struktur internals.
- **`@struktur/processors` package** — dedicated document/PDF processors, powered by LLamaIndex liteparse and Kreuzberg, so the SDK can keep its parser surface focused.
- **`@struktur/php` SDK** (`mateffy/struktur`) — a zero-dependency PHP adapter over the CLI. It provides strongly-typed DTOs, real-time event streaming, and a clean API; all LLM/vision/parsing logic stays in the CLI for automatic feature parity. Mirrored to a subtree repository with CI.
- **Human-facing status events** (`onStatus` / `status` NDJSON event)
  - Strategies emit coarse, strategy-independent phases (`starting`, `analyzing`, `extracting`, `retrying`, `completed`, `failed`) so consumers can render localized progress without string-matching internal step labels or tool names.
  - Optional `message` (`{ key, params }`) carries structured detail for i18n interpolation.
  - Optional `percent` distinguishes determinate progress (batch strategies) from indeterminate (agent strategy — `null`).
- **Image map in extraction results** — the agent strategy now returns `result.images` (virtual path → base64) so consumers can resolve the image references inside `data` back to raw bytes.
- **`--instructions`** — append custom output instructions to the strategy prompt (CLI flag + `outputInstructions` in every strategy config).
- **`--reasoning-effort low|medium|high`** — control reasoning effort for OpenRouter thinking models (`reasoningEffort` in the agent strategy config).
- **`--images-output <file>`** — write the extracted image map to a side file, keeping stdout clean for the JSON result.
- **`ArtifactImage.virtualPath`** — each image now carries the virtual-filesystem path the agent references.
- **Standalone binary** — the CLI builds to a single compiled `struktur` binary via `bun build --compile`, uploaded to GitHub releases on publish.
- **Server-Sent Events streaming** — the HTTP server streams extraction progress over SSE by default on `/extract`.

### Changed

- **Package manager migration to pnpm** — the monorepo moved to pnpm workspaces with a version catalog.
- **Zod v4 validation** — bumped from the v3 line across the SDK and web app.
- **SSE by default on `/extract`** — the HTTP API now streams events by default; pass `?sse=false` for a plain JSON response.
- **Agent prompt efficiency** — the agent system prompt now instructs the model to read `/artifact.json` directly instead of exploring with `ls`/`find`/`tree`/`grep`/`bash`, reducing wasted tool calls on small documents.
- **Docs: Docker setup, PHP SDK, and environment variables** are now documented.

## 2.4.1
- Inject correct package version for struktur --help

## 2.4.0
- Fixed Node.js module resolution errors (TS build issues)

## 2.3.0
- Moved `@struktur/agent-strategy` into `@struktur/sdk`

## 2.2.0
- **Node.js support**
  - The package was Bun-only before and didn't have a TypeScript buildstep. It does now and thus works correctly with normal Node environments too!

## 2.1.0
- **Telemetry Support**
  - Added support for using Arize Phoenix or Langfuse LLM telemetry

## 2.0.0

### Added

- **Agent strategy** - Autonomous extraction using pi.dev agent with virtual filesystem
  - Explores documents intelligently using read, grep, find, ls tools
  - Builds output incrementally with set_output_data and update_output_data tools
  - Fully sandboxed - runs in same process with emulated shell (no custom VM needed)
  - No external HTTP calls or command execution
  - Supports pagination for efficient large file exploration
  - Auto-extracts embedded images to virtual files for easier access
- **HTTP package** (`@struktur/http`) - Headless HTTP API server for running Struktur
  - `POST /parse` - Parse files into artifact JSON
  - `POST /extract` - Extract structured data from artifacts or files
  - API key authentication via Bearer token
  - Supports all extraction strategies including agent
  - Runs on Bun with Hono

### Changed

- **Agent is now the default strategy** - No need to specify `--strategy agent`
  - Previously: `struktur extract --input doc.pdf --schema schema.json --strategy agent`
  - Now: `struktur extract --input doc.pdf --schema schema.json`
  - Agent provides better extraction quality for most documents
  - Other strategies (`simple`, `parallel`, `sequential`, etc.) still available via `--strategy` flag

## 1.2.1

### Added

- Built-in PDF parser with image extraction and screenshot rendering
- Multiple extraction strategies: simple, parallel, sequential, parallelAutoMerge, sequentialAutoMerge, doublePass, doublePassAutoMerge
- Fields shorthand for simple schemas
- Provider management (OpenAI, Anthropic, Google, OpenCode, OpenRouter)
- Model aliases and default model configuration
- Custom parser support (npm packages, CLI commands)
- Web application (`@struktur/web`)
