import type { ExtractionOptions, ExtractionResult } from "./types";
import { buildSchemaFromFields } from "./fields";

const emptyUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

/**
 * Resolve and validate the schema from ExtractionOptions.
 * Exactly one of `schema` or `fields` must be provided.
 */
const resolveSchema = <T>(options: ExtractionOptions<T>) => {
  const hasSchema = options.schema !== undefined;
  const hasFields = options.fields !== undefined;

  if (hasSchema && hasFields) {
    throw new Error(
      "Provide either `schema` or `fields`, not both. They are mutually exclusive.",
    );
  }

  if (!hasSchema && !hasFields) {
    throw new Error(
      "A schema definition is required. Provide `schema` (a JSON Schema object) or `fields` (a shorthand fields string).",
    );
  }

  if (hasFields) {
    return buildSchemaFromFields(options.fields as string);
  }

  return options.schema as NonNullable<typeof options.schema>;
};

export const extract = async <T>(
  options: ExtractionOptions<T>,
): Promise<ExtractionResult<T>> => {
  const debug = options.debug;
  const telemetry = options.telemetry;

  // Initialize telemetry if provided
  if (telemetry) {
    await telemetry.initialize();
  }

  // Start root extraction span
  const rootSpan = telemetry?.startSpan({
    name: "struktur.extract",
    kind: "CHAIN",
    attributes: {
      "extraction.strategy": options.strategy?.name ?? "default",
      "extraction.artifacts.count": options.artifacts.length,
    },
  });

  try {
    // Validate mutual exclusion and resolve the concrete schema early so that
    // every strategy receives a fully-populated options object.
    let resolvedOptions: ExtractionOptions<T>;
    try {
      const schema = resolveSchema(options);
      resolvedOptions = { ...options, schema };
    } catch (error) {
      debug?.extractionComplete({
        success: false,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        error: (error as Error).message,
      });

      telemetry?.endSpan(rootSpan!, {
        status: "error",
        error: error as Error,
      });
      await telemetry?.shutdown();

      return {
        data: null as unknown as T,
        usage: emptyUsage,
        error: error as Error,
      };
    }

    const total = resolvedOptions.strategy.getEstimatedSteps?.(resolvedOptions.artifacts);

    debug?.strategyRunStart({
      strategy: resolvedOptions.strategy.name,
      estimatedSteps: total ?? 1,
      artifactCount: resolvedOptions.artifacts.length,
    });

    await resolvedOptions.events?.onStep?.({ step: 1, total, label: "start" });
    debug?.step({
      step: 1,
      total,
      label: "start",
      strategy: resolvedOptions.strategy.name,
    });

    const result = await resolvedOptions.strategy.run(resolvedOptions);

    await resolvedOptions.events?.onStep?.({
      step: total ?? 1,
      total,
      label: "complete",
    });
    debug?.step({
      step: total ?? 1,
      total,
      label: "complete",
      strategy: resolvedOptions.strategy.name,
    });

    debug?.extractionComplete({
      success: !result.error,
      totalInputTokens: result.usage.inputTokens,
      totalOutputTokens: result.usage.outputTokens,
      totalTokens: result.usage.totalTokens,
      error: result.error?.message,
    });

    telemetry?.endSpan(rootSpan!, {
      status: result.error ? "error" : "ok",
      output: result.data,
      error: result.error,
    });
    await telemetry?.shutdown();

    return result;
  } catch (error) {
    debug?.extractionComplete({
      success: false,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      error: (error as Error).message,
    });

    telemetry?.endSpan(rootSpan!, {
      status: "error",
      error: error as Error,
    });
    await telemetry?.shutdown();

    return {
      data: null as unknown as T,
      usage: emptyUsage,
      error: error as Error,
    };
  }
};
