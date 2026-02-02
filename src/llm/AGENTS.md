LLM module

- Purpose: wrap Vercel AI SDK calls, build multimodal messages, and run validation retries.
- Key files: `LLMClient.ts`, `RetryingRunner.ts`, `message.ts`.
- Design: `generateStructured` centralizes AI SDK usage; retry loop feeds validation errors back to the model.
- Tests: `RetryingRunner.test.ts`.
