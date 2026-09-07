import { test, expect } from "bun:test";
import { estimateCostUsd, pricingFor } from "./pricing";

test("estimateCostUsd uses input/output pricing per 1M tokens", () => {
  const cost = estimateCostUsd("openrouter/deepseek/deepseek-v4-flash-vision-exp", {
    inputTokens: 1_000_000,
    outputTokens: 1_000_000,
    totalTokens: 2_000_000,
  });
  expect(cost).toBeCloseTo(0.22 + 0.66, 10);
});

test("estimateCostUsd returns 0 for unknown models", () => {
  expect(
    estimateCostUsd("openrouter/unknown/model", {
      inputTokens: 100,
      outputTokens: 100,
      totalTokens: 200,
    }),
  ).toBe(0);
});

test("pricingFor strips an OpenRouter provider suffix", () => {
  const p = pricingFor("openrouter/deepseek/deepseek-v4-flash-vision-exp#deepseek");
  expect(p?.input).toBeCloseTo(0.22, 10);
});
