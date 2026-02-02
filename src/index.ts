export type {
  Artifact,
  ArtifactContent,
  ArtifactImage,
  ArtifactType,
  ExtractionEvents,
  ExtractionOptions,
  ExtractionResult,
  ExtractionStrategy,
  Usage,
  AnyJSONSchema,
  TypedJSONSchema,
} from "./types";

export { extract } from "./extract";

export type {
  ArtifactInput,
  ArtifactInputParser,
  SerializedArtifact,
  SerializedArtifactContent,
  SerializedArtifactImage,
  SerializedArtifacts,
} from "./artifacts/input";

export { urlToArtifact } from "./artifacts/urlToArtifact";
export { fileToArtifact } from "./artifacts/fileToArtifact";
export { registerArtifactProvider, clearArtifactProviders } from "./artifacts/providers";
export {
  registerArtifactInputParser,
  clearArtifactInputParsers,
  validateSerializedArtifacts,
  parseSerializedArtifacts,
  hydrateSerializedArtifacts,
  parseInputToArtifacts,
  splitTextIntoContents,
} from "./artifacts/input";

export * from "./strategies";
