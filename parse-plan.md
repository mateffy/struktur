# Struktur Parse Plan

## Overview

Three major workstreams:

1. **`src/parsers/` module** — types, runner, MIME detection, built-in PDF support
2. **`struktur parse` command** — converts any file/stdin to Artifact JSON
3. **`struktur config` command tree** — replaces top-level `models` and `providers`; adds `config parsers` subcommand

> **Status:** Fully implemented. See section 12 for a summary of deviations from the original plan and the `--no-images` additions made after initial implementation.

---

## 1. `src/parsers/` — New Module

### 1.1 Types (`src/parsers/types.ts`)

Three parser definition variants, stored per MIME type in config:

```ts
type NpmParserDef = {
  type: "npm";
  package: string;  // e.g. "@myorg/pdf-parser"
};

type CommandFileDef = {
  type: "command-file";
  command: string;  // must contain FILE_PATH placeholder
};

type CommandStdinDef = {
  type: "command-stdin";
  command: string;
};

type ParserDef = NpmParserDef | CommandFileDef | CommandStdinDef;

type ParsersConfig = Record<string, ParserDef>;  // keyed by MIME type
```

**Validation rules:**
- `command-file` must contain `FILE_PATH` in the command string — error loudly if not present at config-write time
- `command-stdin` pipes input to subprocess stdin

### 1.2 npm Parser Contract (`src/parsers/npm.ts`)

npm parser packages must export **at least one** of these two named functions:

```ts
// Parser receives a ReadableStream — no disk I/O needed
type ParseStreamFn = (
  stream: ReadableStream<Uint8Array>,
  mimeType: string,
) => Promise<Artifact[]>;

// Parser receives a file path — useful for libraries that only work with files
type ParseFileFn = (
  filePath: string,
  mimeType: string,
) => Promise<Artifact[]>;

// Magic byte detection — optional; return true if this parser handles the given bytes
type DetectFileTypeFn = (header: Uint8Array) => boolean;

// The package exports any combination:
export const parseStream: ParseStreamFn;    // optional
export const parseFile: ParseFileFn;        // optional
export const detectFileType: DetectFileTypeFn;  // optional
// At least one of parseStream or parseFile must be present
```

**Selection logic when running an npm parser** (given input is `file` or `buffer`):

| Input kind | `parseFile` exported | `parseStream` exported | Action |
|---|---|---|---|
| file path | yes | — | call `parseFile(path, mimeType)` directly |
| file path | no | yes | open file as `ReadableStream`, call `parseStream(stream, mimeType)` |
| buffer | — | yes | create `ReadableStream` from buffer, call `parseStream(stream, mimeType)` |
| buffer | yes | no | write buffer to temp file, call `parseFile(path, mimeType)`, clean up in `finally` |
| buffer | no | no | error: package exports neither function |

If both are exported and input is a file path, prefer `parseFile` (zero-copy). If input is a buffer, prefer `parseStream`.

### 1.3 `collectStream` Helper

Exported from the main `struktur` package as a public utility for npm parser authors:

```ts
// Collects a ReadableStream<Uint8Array> into a Buffer
// Uses Web Streams API — compatible with Bun and Node 18+
export async function collectStream(stream: ReadableStream<Uint8Array>): Promise<Buffer>;
```

### 1.4 Runner (`src/parsers/runner.ts`)

`runParser(def: ParserDef, input: ParserInput, mimeType: string): Promise<Artifact[]>`

Where `ParserInput = { kind: "file"; path: string } | { kind: "buffer"; buffer: Buffer }`.

**npm runner:**
1. Dynamic import the package: `const mod = await import(def.package)`
2. Determine which functions are exported (`parseFile`, `parseStream`)
3. Apply selection logic from table above
4. Subprocess stdout from npm parsers (for command runners) is expected to be `SerializedArtifact[]` JSON

**command-file runner:**
- If `input.kind === "file"`: interpolate `FILE_PATH` with the real path → `Bun.spawn(command)`
- If `input.kind === "buffer"`: write buffer to temp file in `os.tmpdir()` → interpolate path → spawn → clean up in `finally`
- Capture stdout, JSON-parse as `SerializedArtifact[]`, hydrate into `Artifact[]`

**command-stdin runner:**
- If `input.kind === "file"`: read file buffer → pipe to subprocess stdin
- If `input.kind === "buffer"`: pipe buffer directly to subprocess stdin
- Capture stdout, JSON-parse as `SerializedArtifact[]`, hydrate into `Artifact[]`

### 1.5 MIME Detection (`src/parsers/mime.ts`)

Two-layer detection system (actual implementation uses three layers):

**Layer 1 — Built-in magic bytes** (checked first, authoritative):
- `application/pdf` → `%PDF` (`25 50 44 46`)
- `image/png` → `89 50 4E 47`
- `image/jpeg` → `FF D8 FF`
- `image/gif` → `GIF8`
- `image/webp` → `52 49 46 46 ... 57 45 42 50`
- Standard Office/ZIP formats (DOCX/XLSX/PPTX all start with `PK 03 04`)

**Layer 2 — npm parser `detectFileType`** (checked after magic bytes, before extension):

If a configured npm parser exports `detectFileType(header: Uint8Array): boolean`, we pass the first 512 bytes of the input to it. This is checked after our own magic byte matching so built-ins always take priority.

**Layer 3 — Extension database** (fallback for file inputs when no magic bytes match):

A static lookup table of common extensions to MIME types, e.g.:
```ts
const EXTENSION_MIME_MAP: Record<string, string> = {
  ".txt":  "text/plain",
  ".md":   "text/markdown",
  ".html": "text/html",
  ".json": "application/json",
  ".pdf":  "application/pdf",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".webp": "image/webp",
  ".csv":  "text/csv",
  ".xml":  "application/xml",
  ".yaml": "application/yaml",
  ".yml":  "application/yaml",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // ... etc
};
```

**`--mime` flag override:**
- When `--mime <type>` is passed, skip all detection and use it directly
- Applies to both `parse` and `extract` commands

**Fallback behavior:**
- For stdin with no `--mime`: fall back to `text/plain` (treat as raw text)
- For `--input <file>` with no detectable type: **error** with a clear message prompting the user to use `--mime`

**Exported API:**
```ts
export async function detectMimeType(options: {
  buffer?: Buffer;         // for magic byte detection
  filePath?: string;       // for extension detection
  mimeOverride?: string;   // --mime flag value
  npmParsers?: NpmParserEntry[];  // for detectFileType callbacks
}): Promise<string | null>;
```

### 1.6 Built-in PDF Parser (`src/parsers/pdf.ts`)

Uses the `pdf-parse` npm package (not `@documenso/pdf-lib` as originally planned):

```ts
export type ParsePdfOptions = {
  /**
   * Whether to extract embedded images from each page and include them as
   * base64-encoded ArtifactImage entries in the media field.
   * Defaults to true. Pass false to skip image extraction entirely.
   */
  includeImages?: boolean;
};

export async function parsePdf(
  input: Buffer | ReadableStream<Uint8Array>,
  options?: ParsePdfOptions,
): Promise<Artifact>
```

- Accepts `Buffer` or `ReadableStream<Uint8Array>`
- Extracts per-page text via `parser.getText()` into `ArtifactContent[]` with `page` numbers set; falls back to full document text when no per-page info is available
- Extracts embedded images per-page via `parser.getImage({ imageBuffer: false, imageDataUrl: true })` — each image becomes an `ArtifactImage` with `base64` (data-URL prefix stripped), `width`, and `height`; images are merged into the `media` array of the matching content entry; pages with images but no text produce their own content entry
- `includeImages: false` skips `getImage()` entirely — used by the `--no-images` CLI flag
- Image extraction failure is non-fatal; the parser continues and returns text-only content
- Returns an `Artifact` with `type: "pdf"`
- **Not** automatically registered in `defaultArtifactProviders` — instead, `parseBufferInput` in `src/artifacts/input.ts` has a built-in `application/pdf` case that calls `parsePdf` directly

> DocX support is deferred to a future iteration.

### 1.7 Module Index (`src/parsers/index.ts`)

```ts
export type { ParserDef, ParsersConfig, NpmParserDef, CommandFileDef, CommandStdinDef } from "./types";
export { runParser } from "./runner";
export { detectMimeType } from "./mime";
export { collectStream } from "./collect";
export type { ParsePdfOptions } from "./pdf";
```

### 1.8 `src/parsers/AGENTS.md`

Documents the module structure and responsibilities.

---

## 2. Config Store Extension (`src/auth/config.ts`)

Extend `ConfigStore`:

```ts
type ConfigStore = {
  version: 1;
  defaultModel?: string;
  aliases?: Record<string, string>;
  parsers?: ParsersConfig;   // NEW
};
```

New exported functions:

```ts
export const listParsers = async (): Promise<ParsersConfig>
export const getParser = async (mimeType: string): Promise<ParserDef | undefined>
export const setParser = async (mimeType: string, def: ParserDef): Promise<void>
export const deleteParser = async (mimeType: string): Promise<boolean>
```

Update `src/auth/AGENTS.md` to document the parsers config API.

---

## 3. Artifact Input Integration (`src/artifacts/input.ts`)

### 3.1 Accept `parsers` config and `includeImages` in `parseBufferInput`

Actual implemented signature:

```ts
const parseBufferInput = async (
  buffer: Buffer,
  mimeType: string,
  id?: string,
  providers?: ArtifactProviders,
  parsers?: ParsersConfig,
  includeImages?: boolean,   // NEW — passed to parsePdf
): Promise<Artifact[]>
```

Resolution order (as implemented):
1. `parsers` config — if MIME type has a `ParserDef`, call `runParser()`
2. `providers` registry — user-registered `ArtifactProvider` functions
3. JSON auto-detection (`application/json`)
4. **Built-in `application/pdf`** — calls `parsePdf(buffer, { includeImages })` via dynamic import
5. Built-in `text/*` → text artifact
6. Built-in `image/*` → image artifact
7. Throw `Unsupported MIME type`

Pass `parsers` and `includeImages` through `fileParser` and `bufferParser` options.

`parseInputToArtifacts` options type:
```ts
options?: {
  parsers?: ArtifactInputParser[];
  providers?: ArtifactProviders;
  parserConfig?: ParsersConfig;
  includeImages?: boolean;   // NEW
}
```

### 3.2 JSON Artifact Auto-detection

In the `fileParser` (and analogously in `loadArtifactsFromOptions` when `--input` is used):

When MIME type is `application/json`:
1. Read file content as text, parse JSON
2. Try `validateSerializedArtifacts(parsed)` — if valid, return `hydrateSerializedArtifacts(result)` directly (no further parsing)
3. If invalid: check if a custom parser is configured for `application/json` in the `parsers` config; if yes, run it; if no, throw a clear error explaining the JSON is not in artifact format and no parser is configured

---

## 4. `loadArtifactsFromOptions` Changes (`src/cli/shared.ts`)

When `--input <path>` is used:

1. Load `parsers` config from `listParsers()` (from `src/auth/config.ts`)
2. Detect MIME type using the new `detectMimeType()` (magic bytes + npm `detectFileType` + extension)
3. Pass `parsers` and detected `mimeType` to `parseInputToArtifacts({ kind: "file", path, mimeType })`

Options wired through `loadArtifactsFromOptions`:
- `"no-parse": boolean` — if true, skip custom parsers; built-in text/image/artifact-JSON/PDF fallbacks still apply
- `"mime": string` — from `--mime` flag; forwarded to `detectMimeType`
- `"parser": string` — from `--parser` flag; overrides the configured parser for this invocation
- `"no-images": boolean` — **NEW** — if true, derives `includeImages: false` and passes it to `parseInputToArtifacts`

```ts
const noImages = options["no-images"] === true;
const includeImages = noImages ? false : undefined;
// ... forwarded to both stdin and file-path call sites
```

### Stdin MIME detection for `extract`

When stdin is used as input (piped), read as buffer first, then:
1. Run magic byte detection on the buffer
2. Check npm parser `detectFileType` exports for configured parsers
3. If `--mime` was provided, use it
4. Fallback: treat as `text/plain`

---

## 5. `struktur parse` Command

New top-level subcommand:

```
struktur parse [--input <file>|-] [--mime <type>] [--output <path|->] [--parser <npm-pkg>] [--no-images]
```

**Flags:**
- `--input <path>` / `-i` — file to parse; `-` or omitted = stdin
- `--mime <type>` — override MIME type detection
- `--output <path|->` / `-o` — output destination (default: stdout)
- `--parser <pkg>` — override configured parser with this npm package name
- `--no-images` — **NEW** — skip image extraction (PDF only); do not include images in the artifact output

**Behavior:**
1. Read input: file path → buffer from disk; stdin → buffer from stdin stream
2. Detect MIME type:
   - `--mime` override takes precedence
   - Otherwise: magic bytes → npm `detectFileType` callbacks → extension database
   - For stdin with no `--mime`: fall back to `text/plain`
   - For file with undetectable type: error, prompt to use `--mime`
3. JSON auto-detection: if MIME is `application/json`, validate as `SerializedArtifact[]`; if valid, pass through
4. Resolve parser: `--parser` flag > configured parser in `parsers` config > built-in (PDF, text, image)
5. For PDF inputs: passes `{ includeImages: args["no-images"] !== true }` directly to `parsePdf`
6. Run parser → get `Artifact[]`
7. Serialize (`SerializedArtifact[]`) → output as JSON

> Note: the `parse` command calls `parsePdf` directly (via dynamic import) rather than going through `loadArtifactsFromOptions`, so `--no-images` is wired directly at the `parsePdf` call site.

---

## 6. `struktur extract` Changes

### New flags on `extractCommand`:

- `--no-parse` — skip custom parsers; treat `--input` file as raw text/image using only built-in detection
- `--mime <type>` — override MIME type detection for the input
- `--parser <npm-pkg>` — use this npm package as the parser, overriding any configured parser for the detected MIME type
- `--no-images` — **NEW** — skip image extraction; do not include images in the artifact output (passed through to PDF parser)

### Logic:

When `--input <path>` is given:
- Automatically load `parsers` config and apply (unless `--no-parse`)
- Apply `--mime` override and `--parser` override as described above
- JSON auto-detection: `.json` files that are valid `SerializedArtifact[]` are hydrated directly without parsing
- `--no-images` is forwarded as `"no-images"` to `loadArtifactsFromOptions`

When stdin is used:
- Buffer stdin, run MIME detection (magic bytes → npm `detectFileType` → fallback `text/plain`)
- Apply same parser/no-parse/no-images logic as file inputs

---

## 7. `struktur config` Command Tree

**Breaking change:** `struktur models` and `struktur providers` are moved under `struktur config`. No backwards-compat aliases — clean break since pre-1.0.

### Full command tree:

```
struktur config
  models
    list [--provider <id>]
    use <alias_or_model>
    alias
      list
      get <alias>
      set <alias> <model>
      remove <alias>
  providers
    list
    add <provider> --token <t> [--token-stdin] [--storage auto|keychain|file] [--default]
    remove <provider>
  parsers
    list
    get --mime <type>
    add --mime <type> (--npm <pkg> | --file-command "<cmd>" | --stdin-command "<cmd>")
    remove --mime <type>
```

### `config parsers add` validation:
- Exactly one of `--npm`, `--file-command`, `--stdin-command` must be provided (mutually exclusive)
- `--file-command` value must contain `FILE_PATH` placeholder — error at add time if missing
- Output: JSON with the stored parser definition

### Output format (consistent with existing style):
All config commands output JSON objects, same pattern as existing `providers` and `models` commands.

---

## 8. Public API Additions (`src/index.ts`)

```ts
export { collectStream } from "./parsers/collect";
export type { ParserDef, ParsersConfig } from "./parsers/types";
```

---

## 9. File Touch Map

| File | Change |
|---|---|
| `src/parsers/types.ts` | **NEW** — `ParserDef`, `ParsersConfig` types |
| `src/parsers/collect.ts` | **NEW** — `collectStream()` helper |
| `src/parsers/mime.ts` | **NEW** — `detectMimeType()`, magic bytes, extension map |
| `src/parsers/npm.ts` | **NEW** — npm parser contract types and dynamic import runner |
| `src/parsers/runner.ts` | **NEW** — `runParser()` dispatch logic |
| `src/parsers/pdf.ts` | **NEW** — built-in PDF parser using `pdf-parse`; includes `ParsePdfOptions` with `includeImages` |
| `src/parsers/index.ts` | **NEW** — module re-exports (includes `ParsePdfOptions`) |
| `src/parsers/AGENTS.md` | **NEW** — module docs |
| `src/auth/config.ts` | **EXTEND** — add `parsers` field + `listParsers`, `getParser`, `setParser`, `deleteParser` |
| `src/auth/AGENTS.md` | **UPDATE** — document parsers config API |
| `src/artifacts/input.ts` | **EXTEND** — built-in `application/pdf` case in `parseBufferInput`; `includeImages` option threaded through; JSON artifact auto-detection |
| `src/artifacts/AGENTS.md` | **UPDATE** — documents new PDF built-in step and `includeImages` |
| `src/cli/shared.ts` | **EXTEND** — load parsers from config; MIME detection; `--no-parse`, `--mime`, `--parser`, `--no-images` options wired through |
| `src/cli/AGENTS.md` | **UPDATE** — document new command tree and flags including `--no-images` |
| `src/cli.ts` | **MAJOR EXTEND** — add `parse` command; add `config` command tree (moving `models` + `providers` under it); add `--no-parse`, `--mime`, `--parser`, `--no-images` to `extract`; add `--no-images` to `parse` |
| `src/index.ts` | **EXTEND** — export `collectStream`, parser types |

---

## 10. Tests Added/Updated

| File | What is tested |
|---|---|
| `src/parsers/mime.test.ts` | Magic byte detection, extension lookup, override, fallback |
| `src/parsers/runner.test.ts` | npm parser selection logic (both fns / one fn / neither), command-file temp file cleanup, command-stdin piping |
| `src/parsers/collect.test.ts` | `collectStream` with various stream inputs |
| `src/parsers/pdf.test.ts` | Per-page text, full-text fallback, image attachment, base64 stripping, image-only pages, `getImage()` error resilience, empty document, metadata, raw buffer, `includeImages: false` skips `getImage()`, `includeImages: true` matches default |
| `src/auth/config.test.ts` | `listParsers`, `setParser`, `deleteParser`, `getParser` |
| `src/artifacts/input.test.ts` | JSON auto-detection passthrough, custom parsers resolution order, built-in `application/pdf` routing, `includeImages: false` threading |
| `src/cli/shared.test.ts` | `--no-parse`, `--mime` override, `--parser` override, `--no-images` accepted for text and stdin inputs |

---

## 11. Open Questions / Deferred

- **DocX support**: Deferred. Will follow same pattern as PDF once a suitable library is identified.
- **`detectFileType` bytes vs function**: npm packages can either export `detectFileType(header: Uint8Array): boolean` (function-based) or we may later add a `magicBytes: Uint8Array[]` export as a simpler alternative. For now, function-based only.
- **PDF library selection**: Resolved — `pdf-parse` was used (not `@documenso/pdf-lib`).

---

## 12. Post-Implementation Additions: `--no-images`

After the initial implementation was complete, a `--no-images` flag was added to both the `parse` and `extract` CLI commands. This section documents the full scope of those changes.

### What was added

**`src/parsers/pdf.ts`**
- Added `ParsePdfOptions` type exported from the module:
  ```ts
  export type ParsePdfOptions = { includeImages?: boolean };
  ```
- Updated `parsePdf` signature to accept `options?: ParsePdfOptions`
- `getImage()` is only called when `options?.includeImages !== false`

**`src/parsers/index.ts`**
- Added `export type { ParsePdfOptions } from "./pdf"`

**`src/artifacts/input.ts`**
- Added `import type { ParsePdfOptions } from "../parsers/pdf"`
- Added `includeImages?: boolean` to `ArtifactInputParser.parse()` options type
- Added built-in `application/pdf` case to `parseBufferInput` (step 4 in resolution order):
  ```ts
  if (mimeType === "application/pdf") {
    const { parsePdf } = await import("../parsers/pdf");
    return [await parsePdf(buffer, { includeImages })];
  }
  ```
  > Prior to this change, `parseBufferInput` had no built-in PDF handling and would throw `Unsupported MIME type` for `application/pdf` unless a custom parser or provider was registered.
- `fileParser` and `bufferParser` both forward `options?.includeImages` to `parseBufferInput`
- `parseInputToArtifacts` options type extended with `includeImages?: boolean`

**`src/cli/shared.ts`**
- In `loadArtifactsFromOptions`: reads `options["no-images"]`, derives `includeImages` (`false` when `no-images` is `true`, `undefined` otherwise), passes `includeImages` to both `parseInputToArtifacts` call sites (stdin buffer and file path)

**`src/cli.ts`**
- `parse` command: added `"no-images"` arg (`type: "boolean"`, `default: false`); passes `{ includeImages: args["no-images"] !== true }` directly to `parsePdf` call
- `extract` command: added `"no-images"` arg (`type: "boolean"`, `default: false`); passes `"no-images": args["no-images"]` to `loadArtifactsFromOptions`

**`src/parsers/AGENTS.md`** — updated to document `ParsePdfOptions.includeImages` and `--no-images`

**`src/cli/AGENTS.md`** — updated to document `--no-images` for both `extract` and `parse`

**`src/artifacts/AGENTS.md`** — updated to document the built-in PDF step (step 4) and `includeImages` threading

### Test coverage for `--no-images`

| File | Tests added |
|---|---|
| `src/parsers/pdf.test.ts` | `includeImages: false` → no `media` on output; `includeImages: true` → images present; no options → images present (default) |
| `src/artifacts/input.test.ts` | `application/pdf` buffer routes to built-in `parsePdf`; `includeImages: false` threads through `parseInputToArtifacts` |
| `src/cli/shared.test.ts` | `"no-images": true` accepted without error for text file inputs; `"no-images": true` accepted without error for stdin text inputs |
