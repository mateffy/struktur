import { test, expect } from "bun:test";
import type { Artifact, ExtractionResult, ExtractionStrategy, Usage } from "./types";

test("types can be used to build core DTOs", async () => {
  const usage: Usage = { inputTokens: 1, outputTokens: 2, totalTokens: 3 };
  const artifact: Artifact = {
    id: "a1",
    type: "text",
    raw: async () => Buffer.from(""),
    contents: [{ text: "hello" }],
  };

  const strategy: ExtractionStrategy<{ title: string }> = {
    name: "test",
    run: async () => ({ data: { title: "ok" }, usage }),
  };

  const result: ExtractionResult<{ title: string }> = await strategy.run({
    artifacts: [artifact],
    schema: { type: "object" },
    strategy,
  });

  expect(result.data.title).toBe("ok");
});
