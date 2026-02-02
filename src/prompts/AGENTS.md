Prompts module

- Purpose: generate exact extraction/merge/dedupe prompt texts and format artifacts as XML.
- Key files: `ExtractorPrompt.ts`, `SequentialExtractorPrompt.ts`, `ParallelMergerPrompt.ts`, `DeduplicationPrompt.ts`, `formatArtifacts.ts`.
- Design: prompt builders return `{ system, user }` strings; artifacts render into XML blocks with image refs.
- Tests: `ExtractorPrompt.test.ts`, `SequentialExtractorPrompt.test.ts`, `ParallelMergerPrompt.test.ts`, `DeduplicationPrompt.test.ts`.
