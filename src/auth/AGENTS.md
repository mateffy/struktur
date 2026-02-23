Auth module

- Purpose: persist and resolve provider API tokens and CLI defaults.
- Key files: `tokens.ts`, `config.ts`.
- Design: prefers macOS Keychain when available; otherwise uses `~/.config/struktur/tokens.json` with strict permissions.
- Environment variables: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, OPENCODE_API_KEY, OPENROUTER_API_KEY.
- Tests: `tokens.test.ts`.
