import type { StepInfo, ProgressInfo, RetryInfo, TokenUsageInfo } from "../types";

export type DebugLogger = ReturnType<typeof createDebugLogger>;

export const createDebugLogger = (enabled: boolean) => {
  const log = (entry: Record<string, unknown>) => {
    if (!enabled) return;
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, ...entry };
    process.stderr.write(JSON.stringify(logEntry) + "\n");
  };

  return {
    // CLI initialization
    cliInit: (data: { args: Record<string, unknown> }) => {
      log({ type: "cli_init", ...data });
    },

    schemaLoaded: (data: { source: string; schemaSize: number }) => {
      log({ type: "schema_loaded", ...data });
    },

    artifactsLoaded: (data: {
      count: number;
      artifacts: Array<{ id: string; type: string; contentCount: number; tokens?: number }>;
      totalTokens: number;
      totalImages: number;
    }) => {
      log({ type: "artifacts_loaded", ...data });
    },

    modelResolved: (data: { modelSpec: string; resolvedModel: string }) => {
      log({ type: "model_resolved", ...data });
    },

    strategyCreated: (data: { strategy: string; config: Record<string, unknown> }) => {
      log({ type: "strategy_created", ...data });
    },

    // Chunking
    chunkingStart: (data: {
      artifactId: string;
      totalTokens: number;
      maxTokens: number;
      maxImages?: number;
    }) => {
      log({ type: "chunking_start", ...data });
    },

    chunkingSplit: (data: {
      artifactId: string;
      originalContentCount: number;
      splitContentCount: number;
      splitReason: "text_too_long" | "content_limit";
      originalTokens: number;
      chunkSize: number;
    }) => {
      log({ type: "chunking_split", ...data });
    },

    chunkingResult: (data: { artifactId: string; chunksCreated: number; chunkSizes: number[] }) => {
      log({ type: "chunking_result", ...data });
    },

    batchingStart: (data: {
      totalArtifacts: number;
      maxTokens: number;
      maxImages?: number;
      modelMaxTokens?: number;
      effectiveMaxTokens: number;
    }) => {
      log({ type: "batching_start", ...data });
    },

    batchCreated: (data: {
      batchIndex: number;
      artifactCount: number;
      totalTokens: number;
      totalImages: number;
      artifactIds: string[];
    }) => {
      log({ type: "batch_created", ...data });
    },

    batchingComplete: (data: {
      totalBatches: number;
      batches: Array<{ index: number; artifactCount: number; tokens: number; images: number }>;
    }) => {
      log({ type: "batching_complete", ...data });
    },

    // Strategy execution
    strategyRunStart: (data: {
      strategy: string;
      estimatedSteps: number;
      artifactCount: number;
    }) => {
      log({ type: "strategy_run_start", ...data });
    },

    step: (data: StepInfo & { strategy: string }) => {
      log({ type: "step", ...data });
    },

    progress: (data: ProgressInfo & { strategy: string; context?: string }) => {
      log({ type: "progress", ...data });
    },

    // LLM calls
    llmCallStart: (data: {
      callId: string;
      model: string;
      schemaName?: string;
      systemLength: number;
      userLength: number;
      artifactCount: number;
    }) => {
      log({ type: "llm_call_start", ...data });
    },

    llmCallComplete: (data: {
      callId: string;
      success: boolean;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      durationMs?: number;
      error?: string;
    }) => {
      log({ type: "llm_call_complete", ...data });
    },

    // Retry events
    retry: (data: RetryInfo & { callId: string }) => {
      log({ type: "retry", ...data });
    },

    // Validation
    validationStart: (data: {
      callId: string;
      attempt: number;
      maxAttempts: number;
      strict: boolean;
    }) => {
      log({ type: "validation_start", ...data });
    },

    validationSuccess: (data: { callId: string; attempt: number }) => {
      log({ type: "validation_success", ...data });
    },

    validationFailed: (data: { callId: string; attempt: number; errors: unknown[] }) => {
      log({ type: "validation_failed", ...data });
    },

    // Merging
    mergeStart: (data: { mergeId: string; inputCount: number; strategy: string }) => {
      log({ type: "merge_start", ...data });
    },

    mergeComplete: (data: { mergeId: string; success: boolean; error?: string }) => {
      log({ type: "merge_complete", ...data });
    },

    // Deduplication
    dedupeStart: (data: { dedupeId: string; itemCount: number }) => {
      log({ type: "dedupe_start", ...data });
    },

    dedupeComplete: (data: { dedupeId: string; duplicatesFound: number; itemsRemoved: number }) => {
      log({ type: "dedupe_complete", ...data });
    },

    // Token usage tracking
    tokenUsage: (data: TokenUsageInfo & { context: string }) => {
      log({ type: "token_usage", ...data });
    },

    // Results
    extractionComplete: (data: {
      success: boolean;
      totalInputTokens: number;
      totalOutputTokens: number;
      totalTokens: number;
      error?: string;
    }) => {
      log({ type: "extraction_complete", ...data });
    },

    // Prompt details (verbose)
    promptSystem: (data: { callId: string; system: string }) => {
      log({ type: "prompt_system", ...data });
    },

    promptUser: (data: { callId: string; user: unknown }) => {
      log({ type: "prompt_user", ...data });
    },

    // Raw response
    rawResponse: (data: { callId: string; response: unknown }) => {
      log({ type: "raw_response", ...data });
    },

    // Smart merge details
    smartMergeField: (data: {
      mergeId: string;
      field: string;
      operation: "merge_arrays" | "merge_objects" | "replace" | "concat";
      leftCount?: number;
      rightCount?: number;
      resultCount?: number;
    }) => {
      log({ type: "smart_merge_field", ...data });
    },
  };
};
