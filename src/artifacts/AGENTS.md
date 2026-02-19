Artifacts module

- Purpose: convert external inputs into Artifact DTOs and manage provider registry.
- Key files: `fileToArtifact.ts`, `urlToArtifact.ts`, `providers.ts`, `input.ts`.
- Design: providers are passed as a simple plain object (`Record<string, ArtifactProvider>`) to `fileToArtifact` and `parseInputToArtifacts`. A default empty object is exported for convenience. For multi-tenant setups, create separate provider objects.
- Tests: `fileToArtifact.test.ts`, `urlToArtifact.test.ts`, `input.test.ts`, `providers.test.ts`.
