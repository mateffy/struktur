Strategies module

- Purpose: orchestrate extraction flows (simple, parallel, sequential, auto-merge, double-pass).
- Key files: `SimpleStrategy.ts`, `ParallelStrategy.ts`, `SequentialStrategy.ts`, `ParallelAutoMergeStrategy.ts`, `SequentialAutoMergeStrategy.ts`, `DoublePassStrategy.ts`, `DoublePassAutoMergeStrategy.ts`, `utils.ts`, `concurrency.ts`.
- Design: strategies own config (chunk size, concurrency, models) and call prompt + retry helpers.
- Tests: strategy-specific `*.test.ts` files.
