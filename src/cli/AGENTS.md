# CLI module

- Purpose: provide CLI entrypoints and shared helpers for parsing, inputs, output, and schema loading.
- Key files: `cli.ts`, `shared.ts`.
- Design: keep CLI behavior consistent for both interactive and non-interactive runs. Progress feedback is handled in `cli.ts`; schema loading supports local files, inline JSON, and HTTP(S) URLs with JSON accept headers.
- Model resolution (`resolveModel` in `shared.ts`): supports openai, anthropic, google, opencode (Zen), and openrouter providers. OpenCode Zen uses different AI SDK packages based on model family (openai for GPT, anthropic for Claude, google for Gemini, openai-compatible for others).
