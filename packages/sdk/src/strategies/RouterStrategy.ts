import type { Artifact, ExtractionOptions, ExtractionResult, ExtractionStrategy } from "../types";
import type { createDebugLogger } from "../debug/logger";
import { simple } from "./SimpleStrategy";
import { parallel } from "./ParallelStrategy";
import { sequential } from "./SequentialStrategy";
import { agent } from "./agent/AgentStrategy";
import { classifyDocument, type DocumentClass } from "./classifier";

/**
 * Auto-routing strategy: classify the input, then delegate extraction to the
 * strategy that fits. Same contract as every strategy — `schema` in → `T` out
 * — but the internal path depends on the artifacts.
 *
 * Routing (deterministic where possible, classifier only when needed):
 *
 *  1. no text + images       → agent (vision)
 *  2. fits in `simpleThreshold` → simple (covers ~all single-chunk docs)
 *  3. otherwise classify:
 *     - context_dependence = independent → parallel (large chunks)
 *     - context_dependence = dependent   → sequential (carries context)
 *
 * Document-type-specific prompts are injected via `routeInstructions` (e.g.
 * the real-estate feature disambiguation prompt). Deterministic features —
 * token count, image count, page count — are computed from the artifacts
 * without any LLM call.
 */

export type RouterStrategyConfig = {
  model: unknown;
  /** Model for the classification step. Defaults to `model`. */
  classifierModel?: unknown;
  /** Docs at or under this many tokens go straight to `simple`. */
  simpleThreshold?: number;
  /** Chunk size for the parallel/sequential paths. */
  chunkSize?: number;
  /** Whether vision is enabled for the agent path. */
  vision?: boolean;
  /** Base output instructions appended to every path. */
  outputInstructions?: string;
  /** Per-document-type extra instructions injected on the matching route. */
  routeInstructions?: Partial<Record<DocumentClass["document_type"], string>>;
  strict?: boolean;
  debug?: ReturnType<typeof createDebugLogger>;
};

/** Deterministic, LLM-free features derived from the artifacts. */
export type RouterFeatures = {
  totalTokens: number;
  imageCount: number;
  pageCount: number;
  hasText: boolean;
};

const estimateTokens = (artifacts: Artifact[]): number => {
  let tokens = 0;
  for (const a of artifacts) {
    if (typeof a.tokens === "number") {
      tokens += a.tokens;
      continue;
    }
    for (const c of a.contents) {
      if (c.text) tokens += Math.ceil(c.text.length / 4);
      tokens += (c.media?.length ?? 0) * 1000;
    }
  }
  return tokens;
};

export const routerFeatures = (artifacts: Artifact[]): RouterFeatures => {
  let imageCount = 0;
  let pageCount = 0;
  let hasText = false;
  for (const a of artifacts) {
    for (const c of a.contents) {
      if (c.text) hasText = true;
      imageCount += c.media?.length ?? 0;
      if (c.page !== undefined && c.page > pageCount) pageCount = c.page;
    }
  }
  return { totalTokens: estimateTokens(artifacts), imageCount, pageCount, hasText };
};

export class RouterStrategy<T> implements ExtractionStrategy<T> {
  public name = "router";
  private config: RouterStrategyConfig;

  constructor(config: RouterStrategyConfig) {
    this.config = config;
  }

  getEstimatedSteps(artifacts: Artifact[]): number {
    return Math.max(
      3,
      Math.ceil(routerFeatures(artifacts).totalTokens / (this.config.simpleThreshold ?? 10_000)) +
        1,
    );
  }

  async run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>> {
    const debug = options.debug ?? this.config.debug;
    const features = routerFeatures(options.artifacts);
    const simpleThreshold = this.config.simpleThreshold ?? 10_000;
    const chunkSize = this.config.chunkSize ?? 16_000;

    debug?.step({
      step: 1,
      total: this.getEstimatedSteps(options.artifacts),
      label: `route_features`,
      strategy: this.name,
    });

    // 1. Image-only → agent (vision).
    if (!features.hasText && features.imageCount > 0) {
      debug?.step({ step: 2, label: "route: agent (vision)", strategy: this.name });
      return agent<T>({
        model: this.config.model as never,
        vision: this.config.vision ?? true,
        outputInstructions: this.config.outputInstructions,
      }).run(options);
    }

    // 2. Fits in one chunk → simple.
    if (features.totalTokens <= simpleThreshold) {
      debug?.step({ step: 2, label: "route: simple", strategy: this.name });
      return simple<T>({
        model: this.config.model,
        outputInstructions: this.config.outputInstructions,
        strict: this.config.strict,
      }).run(options);
    }

    // 3. Large document → classify and pick a chunked path.
    const classifierModel = this.config.classifierModel ?? this.config.model;
    const docClass = await classifyDocument(classifierModel, options.artifacts);

    const routeInstructions = [
      this.config.outputInstructions,
      this.config.routeInstructions?.[docClass.document_type],
    ]
      .filter(Boolean)
      .join("\n\n");

    debug?.step({
      step: 2,
      label: `route: ${docClass.context_dependence} (${docClass.document_type})`,
      strategy: this.name,
    });

    if (docClass.context_dependence === "independent") {
      return parallel<T>({
        model: this.config.model,
        mergeModel: this.config.model,
        chunkSize,
        outputInstructions: routeInstructions,
        strict: this.config.strict,
      }).run(options);
    }

    return sequential<T>({
      model: this.config.model,
      chunkSize,
      outputInstructions: routeInstructions,
      strict: this.config.strict,
    }).run(options);
  }
}

export const router = <T>(config: RouterStrategyConfig) => new RouterStrategy<T>(config);
