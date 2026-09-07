import type { Usage } from "@struktur/sdk";

/**
 * Token pricing in USD per 1M tokens, keyed by the benchmark model string
 * (`provider/model`). Prices are snapshot baselines; the harness, not the
 * model, is what's measured, so a small table covering the pinned models is
 * enough. Override with STRUKTUR_BENCHMARK_PRICES (JSON: `{ "<model>": { input, output } }`).
 */

export type ModelPricing = { input: number; output: number };

const PRICING: Record<string, ModelPricing> = {
  // OpenRouter: $0.22/M input, $0.66/M output
  "openrouter/deepseek/deepseek-v4-flash-vision-exp": { input: 0.22, output: 0.66 },
  // OpenAI via OpenRouter: $0.15/M input, $0.60/M output
  "openrouter/openai/gpt-4o-mini": { input: 0.15, output: 0.6 },
};

const envOverride = ((): Record<string, ModelPricing> | undefined => {
  const raw = process.env.STRUKTUR_BENCHMARK_PRICES;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Record<string, ModelPricing>;
  } catch {
    return undefined;
  }
})();

/** Strip an OpenRouter `#provider` suffix (`model#provider` → `model`). */
const normalizeModel = (model: string): string => model.replace(/#.*$/, "");

export function pricingFor(model: string): ModelPricing | undefined {
  const key = normalizeModel(model);
  return envOverride?.[key] ?? PRICING[key];
}

/** Estimated USD cost of a token usage for a model. 0 when pricing is unknown. */
export function estimateCostUsd(model: string, usage: Usage): number {
  const p = pricingFor(model);
  if (!p) return 0;
  return (usage.inputTokens / 1_000_000) * p.input + (usage.outputTokens / 1_000_000) * p.output;
}
