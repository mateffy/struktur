LLM module

- Purpose: wrap Vercel AI SDK calls, build multimodal messages, run validation retries, and query provider model lists/defaults.
- Key files: `LLMClient.ts`, `RetryingRunner.ts`, `message.ts`, `models.ts`.
- Design: `generateStructured` centralizes AI SDK usage; retry loop feeds validation errors back to the model.
- Supported providers: openai, anthropic, google, opencode (Zen), openrouter.
- Tests: `RetryingRunner.test.ts`, `models.test.ts`.
