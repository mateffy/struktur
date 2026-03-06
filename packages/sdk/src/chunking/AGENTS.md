Chunking module

- Purpose: split and batch artifacts based on token and image limits.
- Key files: `ArtifactSplitter.ts`, `ArtifactBatcher.ts`.
- Design: split large artifact contents into parts, then batch parts to fit limits.
- Tests: `ArtifactSplitter.test.ts`, `ArtifactBatcher.test.ts`.

IMPORTANT: When modifying chunking/batching logic, you MUST also update the client-side
JavaScript implementation in `src/cli.ts` (`generateArtifactViewerHtml`) to keep the
artifact viewer's chunking visualization in sync. The viewer includes a version stamp
to help users verify they're comparing the correct algorithm version.
