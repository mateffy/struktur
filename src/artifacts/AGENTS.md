Artifacts module

- Purpose: convert external inputs into Artifact DTOs and manage provider registry.
- Key files: `fileToArtifact.ts`, `urlToArtifact.ts`, `providers.ts`, `input.ts`.
- Design: `fileToArtifact` delegates to registered providers by MIME type; `urlToArtifact` fetches JSON and normalizes to an Artifact; `input.ts` validates serialized artifacts and builds simple text/image artifacts.
- Tests: `fileToArtifact.test.ts`, `urlToArtifact.test.ts`, `input.test.ts`.
