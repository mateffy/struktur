Auth module

- Purpose: persist and resolve provider API tokens and CLI defaults.
- Key files: `tokens.ts`, `config.ts`.
- Design: prefers macOS Keychain when available; otherwise uses `~/.config/struktur/tokens.json` with strict permissions.
- Config store (`config.ts`): stores `defaultModel` (string) and `aliases` (Record<string, string>) in `~/.config/struktur/config.json`.
- Alias API: `listAliases`, `getAlias`, `setAlias`, `deleteAlias`, `resolveAlias` (resolves alias → model spec, passthrough if not an alias).
- Environment variables: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, OPENCODE_API_KEY, OPENROUTER_API_KEY.
- Tests: `tokens.test.ts`.
