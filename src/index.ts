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
export {
  parseFieldsString,
  buildSchemaFromParsedFields,
  buildSchemaFromFields,
} from "./fields";
export type { ParsedField, FieldType } from "./fields";

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
export type { ArtifactProvider, ArtifactProviders } from "./artifacts/providers";
export { defaultArtifactProviders } from "./artifacts/providers";
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
