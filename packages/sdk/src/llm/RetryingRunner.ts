import {
  createAjv,
  validateOrThrow,
  SchemaValidationError,
  validateAllowingMissingRequired,
} from "../validation/validator";
import type { ModelMessage } from "ai";
import type { ExtractionEvents, Usage, TelemetryAdapter } from "../types";
import type { DebugLogger } from "../debug/logger";
import { generateStructured } from "./LLMClient";
import type { UserContent } from "./message";

export type RetryOptions<T> = {
  model: unknown;
  schema: unknown;
  system: string;
  user: UserContent;
  events?: ExtractionEvents;
  maxAttempts?: number;
  schemaName?: string;
  execute?: typeof generateStructured<T>;
  strict?: boolean;
  debug?: DebugLogger;
  callId?: string;
  /**
   * Telemetry adapter for tracing validation and retries
   */
  telemetry?: TelemetryAdapter;
  /**
   * Parent span for creating hierarchical traces
   */
  parentSpan?: {
    id: string;
    traceId: string;
    name: string;
    kind: string;
    startTime: number;
    parentId?: string;
  };
};

export const runWithRetries = async <T>(options: RetryOptions<T>) => {
  const { telemetry, parentSpan } = options;

  // Start validation/retry span if telemetry is enabled
  const retrySpan = telemetry?.startSpan({
    name: "struktur.validation_retry",
    kind: "CHAIN",
    parentSpan,
    attributes: {
      "retry.max_attempts": options.maxAttempts ?? 3,
      "retry.schema_name": options.schemaName ?? "extract",
    },
  });

  const ajv = createAjv();
  const maxAttempts = options.maxAttempts ?? 3;
  const messages: ModelMessage[] = [{ role: "user", content: options.user }];
  const debug = options.debug;
  const callId = options.callId ?? `call_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  let usage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  let lastError: Error | undefined;

  // Log LLM call start
  const systemLength = options.system.length;
  const userLength =
    typeof options.user === "string" ? options.user.length : JSON.stringify(options.user).length;

  debug?.llmCallStart({
    callId,
    model: JSON.stringify(options.model),
    schemaName: options.schemaName,
    systemLength,
    userLength,
    artifactCount: Array.isArray(options.user) ? options.user.length : 0,
  });

  debug?.promptSystem({ callId, system: options.system });
  debug?.promptUser({ callId, user: options.user });

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const executor = options.execute ?? generateStructured;
    const isFinalAttempt = attempt === maxAttempts;
    const useStrictValidation = options.strict === true || isFinalAttempt;

    debug?.validationStart({
      callId,
      attempt,
      maxAttempts,
      strict: useStrictValidation,
    });

    const startTime = Date.now();
    const result = await executor({
      model: options.model,
      schema: options.schema,
      schemaName: options.schemaName,
      system: options.system,
      user: options.user,
      messages,
      strict: options.strict,
      telemetry,
      parentSpan: retrySpan,
    });
    const durationMs = Date.now() - startTime;

    usage = {
      inputTokens: usage.inputTokens + result.usage.inputTokens,
      outputTokens: usage.outputTokens + result.usage.outputTokens,
      totalTokens: usage.totalTokens + result.usage.totalTokens,
    };

    debug?.rawResponse({ callId, response: result.data });

    try {
      if (useStrictValidation) {
        const validated = validateOrThrow<T>(ajv, options.schema as never, result.data);

        debug?.validationSuccess({ callId, attempt });
        debug?.llmCallComplete({
          callId,
          success: true,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          durationMs,
        });

        // Record successful validation
        if (retrySpan && telemetry) {
          telemetry.recordEvent(retrySpan, {
            type: "validation",
            attempt,
            maxAttempts,
            schema: options.schema,
            input: result.data,
            success: true,
            latencyMs: durationMs,
          });
          telemetry.endSpan(retrySpan, {
            status: "ok",
            output: validated,
            latencyMs: durationMs,
          });
        }

        return { data: validated, usage };
      } else {
        const validationResult = validateAllowingMissingRequired<T>(
          ajv,
          options.schema as never,
          result.data,
          isFinalAttempt,
        );

        if (validationResult.valid) {
          debug?.validationSuccess({ callId, attempt });
          debug?.llmCallComplete({
            callId,
            success: true,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
            durationMs,
          });

          // Record successful validation
          if (retrySpan && telemetry) {
            telemetry.recordEvent(retrySpan, {
              type: "validation",
              attempt,
              maxAttempts,
              schema: options.schema,
              input: result.data,
              success: true,
              latencyMs: durationMs,
            });
            telemetry.endSpan(retrySpan, {
              status: "ok",
              output: validationResult.data,
              latencyMs: durationMs,
            });
          }

          return { data: validationResult.data, usage };
        }

        throw new SchemaValidationError("Schema validation failed", validationResult.errors);
      }
    } catch (error) {
      lastError = error as Error;

      if (error instanceof SchemaValidationError) {
        debug?.validationFailed({
          callId,
          attempt,
          errors: error.errors,
        });

        // Record failed validation
        if (retrySpan && telemetry) {
          telemetry.recordEvent(retrySpan, {
            type: "validation",
            attempt,
            maxAttempts,
            schema: options.schema,
            input: result.data,
            success: false,
            errors: error.errors,
            latencyMs: durationMs,
          });
        }

        // Emit retry event before attempting retry
        const nextAttempt = attempt + 1;
        if (nextAttempt <= maxAttempts) {
          await options.events?.onRetry?.({
            attempt: nextAttempt,
            maxAttempts,
            reason: "schema_validation_failed",
          });

          debug?.retry({
            callId,
            attempt: nextAttempt,
            maxAttempts,
            reason: "schema_validation_failed",
          });
        }

        const errorPayload = JSON.stringify(error.errors, null, 2);
        const errorMessage = `<validation-errors>\n${errorPayload}\n</validation-errors>`;
        messages.push({ role: "user", content: errorMessage });
        await options.events?.onMessage?.({
          role: "user",
          content: errorMessage,
        });
        continue;
      }

      debug?.llmCallComplete({
        callId,
        success: false,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        durationMs,
        error: (error as Error).message,
      });

      // Record error in telemetry
      if (retrySpan && telemetry) {
        telemetry.endSpan(retrySpan, {
          status: "error",
          error: error as Error,
          latencyMs: durationMs,
        });
      }

      break;
    }
  }

  throw lastError ?? new Error("Unknown extraction error");
};
