# LLM module

- Purpose: wrap Vercel AI SDK calls, build multimodal messages, run validation retries, and query provider model lists/defaults.
- Key files: `LLMClient.ts`, `RetryingRunner.ts`, `message.ts`, `models.ts`.
- Design: `generateStructured` centralizes AI SDK usage; retry loop feeds validation errors back to the model.
- Retry events: `runWithRetries` emits `onRetry` events with `{ attempt, maxAttempts, reason }` so the CLI can show retry progress (e.g. "Extracting data (retry 2/3)...").
- Supported providers: openai, anthropic, google, opencode (Zen), openrouter, ollama.
- OpenRouter provider routing: When a model has an `__openrouter_provider` property attached (set via hashtag syntax in the model string), `generateStructured` passes it as `providerOptions.openrouter.provider.order` to route requests to the specified provider.
- Tests: `RetryingRunner.test.ts`, `models.test.ts`.
