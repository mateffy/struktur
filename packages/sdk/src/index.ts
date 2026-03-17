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
  // Agent event types
  AgentEvents,
  AgentToolStartInfo,
  AgentToolEndInfo,
  AgentMessageInfo,
  AgentReasoningInfo,
  // Telemetry
  TelemetryAdapter,
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
  parse,
  splitTextIntoContents,
} from "./artifacts/input";

export * from "./strategies";

// Agent strategy (re-exported from @struktur/agent-strategy)
export { AgentStrategy, agent, type AgentStrategyConfig } from "@struktur/agent-strategy";

// Parsers public API
export { collectStream } from "./parsers/collect";
export type { ParserDef, ParsersConfig, InlineParserDef, NpmParserDef } from "./parsers/types";
export { detectMimeType } from "./parsers/mime";
export type { NpmParserEntry } from "./parsers/mime";
export { runParser } from "./parsers/runner";
export { parsePdf } from "./parsers/pdf";

// Debug
export { createDebugLogger } from "./debug/logger";

// LLM models
export {
  listAllProviderModels,
  listProviderModels,
  resolveCheapestModel,
} from "./llm/models";
export { resolveModel } from "./llm/resolveModel";

// Validation
export { SchemaValidationError } from "./validation/validator";

// Auth (for CLI and SDK users who want to manage tokens)
export {
  getDefaultModel,
  setDefaultModel,
  listAliases,
  getAlias,
  setAlias,
  deleteAlias,
  resolveAlias,
  listParsers,
  getParser,
  setParser,
  deleteParser,
  getTelemetryConfig,
  setTelemetryConfig,
  enableTelemetry,
  disableTelemetry,
  deleteTelemetryConfig,
} from "./auth/config";
export {
  listStoredProviders,
  setProviderToken,
  deleteProviderToken,
  resolveProviderToken,
  getProviderTokenOrThrow,
  resolveProviderEnvVar,
  maskToken,
  type TokenStorageType,
  type TokenEntry,
} from "./auth/tokens";
