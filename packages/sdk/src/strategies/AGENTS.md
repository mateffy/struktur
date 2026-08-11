Strategies module

- Purpose: orchestrate extraction flows (simple, parallel, sequential, auto-merge, double-pass, agent).
- Key files: `SimpleStrategy.ts`, `ParallelStrategy.ts`, `SequentialStrategy.ts`, `ParallelAutoMergeStrategy.ts`, `SequentialAutoMergeStrategy.ts`, `DoublePassStrategy.ts`, `DoublePassAutoMergeStrategyStrategy.ts`, `agent/AgentStrategy.ts`, `utils.ts`, `concurrency.ts`.
- Design: strategies own config (chunk size, concurrency, models) and call prompt + retry helpers. Strategies emit `events.onStep` updates and implement `getEstimatedSteps` for progress tracking.
- Agent Strategy: Uses AI SDK's `generateText` with a manual tool loop. The agent iterates, calling tools until extraction is complete. Supports virtual filesystem for artifacts, tools for file operations (read, bash, grep, find, ls, view_image), and output management (set_output_data, update_output_data, finish, fail). Each `generateText` step has a configurable timeout (`stepTimeoutMs`, default 5 min) to prevent hanging on unresponsive providers. Internal logging uses `debug?.` (NDJSON to stderr), never `console.log`.
- Tests: strategy-specific `*.test.ts` files.