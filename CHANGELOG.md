# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Human-facing status events** (`onStatus` / `status` NDJSON event)
  - Strategies emit coarse, strategy-independent phases (`starting`, `analyzing`, `extracting`, `retrying`, `completed`, `failed`) so consumers can render localized progress without string-matching internal step labels or tool names.
  - Optional `message` (`{ key, params }`) carries structured detail for i18n interpolation.
  - Optional `percent` distinguishes determinate progress (batch strategies) from indeterminate (agent strategy — `null`).
- **Image map in extraction results** — the agent strategy now returns `result.images` (virtual path → base64) so consumers can resolve the image references inside `data` back to raw bytes.
- **`--instructions`** — append custom output instructions to the strategy prompt (CLI flag + `outputInstructions` in every strategy config).
- **`--reasoning-effort low|medium|high`** — control reasoning effort for OpenRouter thinking models (`reasoningEffort` in the agent strategy config).
- **`--images-output <file>`** — write the extracted image map to a side file, keeping stdout clean for the JSON result.
- **`ArtifactImage.virtualPath`** — each image now carries the virtual-filesystem path the agent references.

### Changed

- The agent system prompt now instructs the model to read `/artifact.json` directly instead of exploring with `ls`/`find`/`tree`/`grep`/`bash`, reducing wasted tool calls on small documents.

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
