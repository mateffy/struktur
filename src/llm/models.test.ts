import { test, expect } from "bun:test";
import { __testing__ } from "./models";

test("parseOpenAiModels returns model ids", () => {
  const models = __testing__.parseOpenAiModels({
    object: "list",
    data: [{ id: "gpt-4o-mini" }, { id: "gpt-4o" }],
  });

  expect(models).toEqual(["gpt-4o-mini", "gpt-4o"]);
});

test("parseAnthropicModels returns model ids", () => {
  const models = __testing__.parseAnthropicModels({
    data: [{ id: "claude-3-5-sonnet-20241022" }],
  });

  expect(models).toEqual(["claude-3-5-sonnet-20241022"]);
});

test("parseGoogleModels strips models prefix", () => {
  const models = __testing__.parseGoogleModels({
    models: [{ name: "models/gemini-1.5-flash" }],
  });

  expect(models).toEqual(["gemini-1.5-flash"]);
});

test("pickCheapestModel prefers known cheap models", () => {
  const models = ["gpt-4o", "gpt-4o-mini"];
  expect(__testing__.pickCheapestModel("openai", models)).toBe("gpt-4o-mini");
});
