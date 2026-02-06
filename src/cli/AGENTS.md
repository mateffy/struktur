# CLI module

- Purpose: provide CLI entrypoints and shared helpers for parsing, inputs, output, and schema loading.
- Key files: `cli.ts`, `shared.ts`.
- Design: keep CLI behavior consistent for both interactive and non-interactive runs. Progress feedback is handled in `cli.ts`; schema loading supports local files, inline JSON, and HTTP(S) URLs with JSON accept headers.
