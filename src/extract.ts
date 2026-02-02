import type { ExtractionOptions, ExtractionResult } from "./types";

const emptyUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

export const extract = async <T>(
  options: ExtractionOptions<T>
): Promise<ExtractionResult<T>> => {
  try {
    const total = options.strategy.getEstimatedSteps?.(options.artifacts);
    await options.events?.onStep?.({ step: 1, total, label: "start" });

    const result = await options.strategy.run(options);

    await options.events?.onStep?.({ step: total ?? 1, total, label: "complete" });
    return result;
  } catch (error) {
    return {
      data: null as unknown as T,
      usage: emptyUsage,
      error: error as Error,
    };
  }
};
