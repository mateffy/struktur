import type { Artifact, ExtractionEvents, Usage, TelemetryAdapter } from "../types";
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
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );
};

export const getBatches = (
  artifacts: Artifact[],
  options: BatchOptions,
  debug?: DebugLogger,
  telemetry?: TelemetryAdapter,
  parentSpan?: {
    id: string;
    traceId: string;
    name: string;
    kind: string;
    startTime: number;
    parentId?: string;
  },
) => {
  // Create chunking span if telemetry is enabled
  const chunkingSpan = telemetry?.startSpan({
    name: "struktur.chunking",
    kind: "RETRIEVER",
    parentSpan,
    attributes: {
      "chunking.artifact_count": artifacts.length,
      "chunking.max_tokens": options.maxTokens,
      "chunking.max_images": options.maxImages,
    },
  });

  const batches = batchArtifacts(artifacts, { ...options, debug });

  // Record chunking results
  if (chunkingSpan && telemetry) {
    batches.forEach((batch, index) => {
      telemetry.recordEvent(chunkingSpan, {
        type: "chunk",
        chunkIndex: index,
        totalChunks: batches.length,
        tokens: batch.reduce((sum, a) => sum + (a.tokens || 0), 0),
        images: batch.reduce(
          (sum, a) => sum + (a.contents?.flatMap((c) => c.media || []).length || 0),
          0,
        ),
      });
    });

    telemetry.endSpan(chunkingSpan, {
      status: "ok",
      output: { batchCount: batches.length },
    });
  }

  return batches;
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
  telemetry?: TelemetryAdapter;
  parentSpan?: {
    id: string;
    traceId: string;
    name: string;
    kind: string;
    startTime: number;
    parentId?: string;
  };
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
    telemetry: options.telemetry,
    parentSpan: options.parentSpan,
  });

  return result;
};
