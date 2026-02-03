Auth module

- Purpose: persist and resolve provider API tokens and CLI defaults.
- Key files: `tokens.ts`, `config.ts`.
- Design: prefers macOS Keychain when available; otherwise uses `~/.config/struktur/tokens.json` with strict permissions.
- Tests: `tokens.test.ts`.
