# Parsers module

- Purpose: detect MIME types, run external/npm/command parsers, and provide built-in PDF support.
- Key files: `types.ts`, `collect.ts`, `mime.ts`, `npm.ts`, `runner.ts`, `pdf.ts`, `index.ts`.

## Types (`types.ts`)

- `NpmParserDef` — npm package parser definition (`type: "npm"`, `package: string`)
- `CommandFileDef` — command with `FILE_PATH` placeholder (`type: "command-file"`, `command: string`)
- `CommandStdinDef` — command that reads from stdin (`type: "command-stdin"`, `command: string`)
- `ParserDef` — union of the three variants
- `ParsersConfig` — `Record<string, ParserDef>` keyed by MIME type
- `ParserInput` — `{ kind: "file"; path: string } | { kind: "buffer"; buffer: Buffer }`

## npm Contract (`npm.ts`)

- `ParseStreamFn`, `ParseFileFn`, `DetectFileTypeFn`, `NpmParserModule` — interfaces that npm parser packages must implement.
- At least one of `parseStream` or `parseFile` must be exported.

## collectStream (`collect.ts`)

- `collectStream(stream: ReadableStream<Uint8Array>): Promise<Buffer>` — public utility for npm parser authors to collect a stream into a Buffer.

## MIME Detection (`mime.ts`)

Two-layer detection + npm detectFileType callbacks:

1. **Magic bytes** (authoritative): PDF, PNG, JPEG, GIF, WebP, ZIP/Office
2. **npm `detectFileType`**: called after magic bytes with first 512 bytes
3. **Extension database**: fallback when no magic bytes match (file inputs only)

`detectMimeType({ buffer?, filePath?, mimeOverride?, npmParsers? }): Promise<string | null>`

## Runner (`runner.ts`)

`runParser(def: ParserDef, input: ParserInput, mimeType: string): Promise<Artifact[]>`

- **npm**: Dynamic import, prefer `parseFile` for file inputs (zero-copy), prefer `parseStream` for buffer inputs. Falls back via temp-file if needed.
- **command-file**: Interpolates `FILE_PATH` in command, writes temp file for buffer inputs.
- **command-stdin**: Pipes input buffer to subprocess stdin; captures stdout as `SerializedArtifact[]` JSON.

## Built-in PDF Parser (`pdf.ts`)

`parsePdf(input: Buffer | ReadableStream<Uint8Array>, options?: ParsePdfOptions): Promise<Artifact>`

Uses `pdf-parse` (npm package). Extracts per-page text **and** embedded images into `ArtifactContent[]`
with `page` numbers set. Returns an `Artifact` with `type: "pdf"`.

- Text extraction: per-page via `parser.getText()`; falls back to full document text when no per-page info is available.
- Image extraction: per-page via `parser.getImage({ imageBuffer: false, imageDataUrl: true })`. Each embedded image is mapped to an `ArtifactImage` with `base64` (raw base64 string, data-URL prefix stripped), `width`, `height`, and `imageType: "embedded"`. Images are merged into the `media` array of the matching `ArtifactContent` entry. Pages that contain images but no text produce their own content entry. Image extraction failure is non-fatal — the parser continues and returns text-only content.
- Screenshot rendering: per-page via `parser.getScreenshot()`. Each page is rendered to a PNG image and added to the `media` array with `imageType: "screenshot"`. Screenshots are appended to any embedded images for the same page. Screenshot rendering failure is non-fatal — the parser continues without screenshots.
- `imageThreshold` defaults to 80 px (from pdf-parse), filtering out tiny decorative images.
- `ParsePdfOptions.includeImages` (default `true`): set to `false` to skip `getImage()` entirely and return text-only content. This is used by the `--no-images` CLI flag.
- `ParsePdfOptions.screenshots` (default `false`): set to `true` to render page screenshots and include them as images. This is used by the `--screenshots` CLI flag.
- `ParsePdfOptions.screenshotScale` (default `1.5`): scale factor for screenshot rendering. Higher values produce larger, higher-quality images.
- `ParsePdfOptions.screenshotWidth`: target width in pixels for screenshots. If specified, takes precedence over `screenshotScale` and height is calculated to maintain aspect ratio.
