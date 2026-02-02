Chunking module

- Purpose: split and batch artifacts based on token and image limits.
- Key files: `ArtifactSplitter.ts`, `ArtifactBatcher.ts`.
- Design: split large artifact contents into parts, then batch parts to fit limits.
- Tests: `ArtifactSplitter.test.ts`, `ArtifactBatcher.test.ts`.
