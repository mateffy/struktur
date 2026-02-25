import type { Artifact, ExtractionEvents, Usage } from "../types";
import type { DebugLogger } from "../debug/logger";
import { batchArtifacts, type BatchOptions } from "../chunking/ArtifactBatcher";
import { buildUserContent } from "../llm/message";
import { runWithRetries } from "../llm/RetryingRunner";

export const serializeSchema = (schema: unknown) => {
  return JSON.stringify(schema);
};

export const mergeUsage = (usages: Usage[]) => {
  return usages.reduce(
    (acc, usage) => ({
      inputTokens: acc.inputTokens + usage.inputTokens,
      outputTokens: acc.outputTokens + usage.outputTokens,
      totalTokens: acc.totalTokens + usage.totalTokens,
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
  );
};

export const getBatches = (
  artifacts: Artifact[],
  options: BatchOptions,
  debug?: DebugLogger
) => {
  return batchArtifacts(artifacts, { ...options, debug });
};

export const extractWithPrompt = async <T>(options: {
  model: unknown;
  schema: unknown;
  system: string;
  user: string;
  artifacts: Artifact[];
  events?: ExtractionEvents;
  execute?: typeof runWithRetries<T>;
  strict?: boolean;
  debug?: DebugLogger;
  callId?: string;
}) => {
  const userContent = buildUserContent(options.user, options.artifacts);
  const result = await runWithRetries<T>({
    model: options.model,
    schema: options.schema,
    system: options.system,
    user: userContent,
    events: options.events,
    execute: options.execute,
    strict: options.strict,
    debug: options.debug,
    callId: options.callId,
  });

  return result;
};
