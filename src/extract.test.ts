import { test, expect } from "bun:test";
import { extract } from "./extract";
import type { ExtractionStrategy, ExtractionOptions } from "./types";

test("extract delegates to strategy", async () => {
  const strategy: ExtractionStrategy<{ ok: boolean }> = {
    name: "mock",
    run: async () => ({
      data: { ok: true },
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    }),
  };

  const options: ExtractionOptions<{ ok: boolean }> = {
    artifacts: [],
    schema: {},
    strategy,
  };

  const result = await extract(options);
  expect(result.data.ok).toBe(true);
});
