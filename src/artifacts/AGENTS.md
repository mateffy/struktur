Artifacts module

- Purpose: convert external inputs into Artifact DTOs and manage parser configuration.
- Key files: `fileToArtifact.ts`, `urlToArtifact.ts`, `providers.ts`, `input.ts`.
- Design: `ParsersConfig` is the unified configuration system for all parsers (npm packages, CLI commands, and inline handlers). The `providers` registry is deprecated — use inline parsers in `ParsersConfig` instead.
- `parse` accepts an optional `parserConfig: ParsersConfig` (from `src/parsers/types`) that takes priority over the deprecated providers registry. Custom parsers are resolved by MIME type.
- `ParsersConfig` supports four parser types:
  - `NpmParserDef` — npm package with `parseFile` or `parseStream` exports
  - `CommandFileDef` — CLI command with `FILE_PATH` placeholder
  - `CommandStdinDef` — CLI command that reads from stdin
  - `InlineParserDef` — inline `(buffer: Buffer) => Promise<Artifact>` function (replaces the old providers registry)
- JSON auto-detection: when MIME type is `application/json`, `fileParser` first attempts to validate the file as `SerializedArtifact[]`. If valid, it hydrates and returns them directly. If not valid, it checks `parsers` config for a custom parser; if none, throws a clear error.
- `parseBufferInput` resolution order: (1) parsers config, (2) providers registry (deprecated), (3) JSON auto-detection, (4) built-in `application/pdf` (via `parsePdf`), (5) built-in text/*, (6) built-in image/*, (7) error.
- `parse` accepts `includeImages?: boolean` which is forwarded to `parsePdf` for PDF inputs. Set to `false` to suppress image extraction (used by `--no-images` CLI flag).
- `SerializedArtifactImage` schema validation accepts an optional `imageType` field with values `"embedded"` or `"screenshot"` to differentiate between embedded images extracted from PDFs and page screenshots.
- Tests: `fileToArtifact.test.ts`, `urlToArtifact.test.ts`, `input.test.ts`, `providers.test.ts`.
