import type { ExtractionEvents, StatusInfo } from "../types";

/**
 * Emit a human-facing status event. Fires asynchronously and ignores the
 * (void) return value; strategies use this so consumers get a consistent,
 * strategy-independent progress contract.
 */
export const emitStatus = (
  events: ExtractionEvents | undefined,
  info: StatusInfo,
): void => {
  void events?.onStatus?.(info);
};

/**
 * Map the built-in batch strategies' internal step labels to a coarse
 * human status. These labels are strategy internals and must not leak to
 * consumers — this helper is the single place that translates them.
 */
export const stepLabelToStatus = (
  label: string,
  step?: number,
  total?: number,
): StatusInfo => {
  const percent =
    step !== undefined && total !== undefined && total > 0
      ? Math.round((step / total) * 100)
      : null;

  if (label.startsWith("batch ")) {
    const match = label.match(/batch (\d+)\/(\d+)/);
    return match
      ? {
          phase: "extracting",
          message: {
            key: "batch",
            params: { current: Number(match[1]), total: Number(match[2]) },
          },
          percent,
        }
      : { phase: "extracting", message: { key: "extracting_data" }, percent };
  }

  if (label === "extract") {
    return { phase: "extracting", message: { key: "extracting_data" }, percent };
  }

  if (label === "merge") {
    return { phase: "extracting", message: { key: "merge" }, percent };
  }

  if (label === "dedupe") {
    return { phase: "extracting", message: { key: "dedupe" }, percent };
  }

  if (label.startsWith("pass ")) {
    const match = label.match(/pass (\d+)/);
    return {
      phase: "extracting",
      message: { key: "pass", params: { pass: match ? Number(match[1]) : 1 } },
      percent,
    };
  }

  return { phase: "extracting", percent };
};
