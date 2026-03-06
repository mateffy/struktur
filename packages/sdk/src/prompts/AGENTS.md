Prompts module

- Purpose: generate optimized extraction/merge/dedupe prompt texts with thinking guidance and format artifacts as XML.
- Design: prompt builders return `{ system, user }` strings with concise instructions and `<thinking>` sections; artifacts render into XML blocks with image refs.
- Changes: System prompts now include structured `<thinking>` guidance, `<rules>` sections, and moved `outputInstructions` above schema for better context flow.
- Key files: `ExtractorPrompt.ts`, `SequentialExtractorPrompt.ts`, `ParallelMergerPrompt.ts`, `DeduplicationPrompt.ts`, `formatArtifacts.ts`.
- Design: prompt builders return `{ system, user }` strings; artifacts render into XML blocks with image refs.
- Tests: `ExtractorPrompt.test.ts`, `SequentialExtractorPrompt.test.ts`, `ParallelMergerPrompt.test.ts`, `DeduplicationPrompt.test.ts`.
