Artifacts module

- Purpose: convert external inputs into Artifact DTOs and manage provider registry.
- Key files: `fileToArtifact.ts`, `urlToArtifact.ts`, `providers.ts`, `input.ts`.
- Design: providers are passed as a simple plain object (`Record<string, ArtifactProvider>`) to `fileToArtifact` and `parseInputToArtifacts`. A default empty object is exported for convenience. For multi-tenant setups, create separate provider objects.
- `parseInputToArtifacts` accepts an optional `parserConfig: ParsersConfig` (from `src/parsers/types`) that takes priority over the providers registry. Custom parsers are resolved by MIME type.
- JSON auto-detection: when MIME type is `application/json`, `fileParser` first attempts to validate the file as `SerializedArtifact[]`. If valid, it hydrates and returns them directly. If not valid, it checks `parsers` config for a custom parser; if none, throws a clear error.
- `parseBufferInput` resolution order: (1) parsers config, (2) providers registry, (3) JSON auto-detection, (4) built-in `application/pdf` (via `parsePdf`), (5) built-in text/*, (6) built-in image/*, (7) error.
- `parseInputToArtifacts` accepts `includeImages?: boolean` which is forwarded to `parsePdf` for PDF inputs. Set to `false` to suppress image extraction (used by `--no-images` CLI flag).
- Tests: `fileToArtifact.test.ts`, `urlToArtifact.test.ts`, `input.test.ts`, `providers.test.ts`.
