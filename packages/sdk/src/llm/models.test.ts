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

test("parseOpenRouterModels returns model ids", () => {
  const models = __testing__.parseOpenRouterModels({
    data: [{ id: "openai/gpt-4o" }, { id: "anthropic/claude-3.5-sonnet" }],
  });

  expect(models).toEqual(["openai/gpt-4o", "anthropic/claude-3.5-sonnet"]);
});

test("parseOpenAiModels handles empty data", () => {
  const models = __testing__.parseOpenAiModels({});
  expect(models).toEqual([]);
});

test("parseOpenAiModels filters out undefined ids", () => {
  const models = __testing__.parseOpenAiModels({
    data: [{ id: "gpt-4" }, { notId: "bad" }],
  });
  expect(models).toEqual(["gpt-4"]);
});

test("parseGoogleModels handles empty models", () => {
  const models = __testing__.parseGoogleModels({});
  expect(models).toEqual([]);
});

test("pickCheapestModel prefers known cheap models", () => {
  const models = ["gpt-4o", "gpt-4o-mini"];
  expect(__testing__.pickCheapestModel("openai", models)).toBe("gpt-4o-mini");
});

test("pickCheapestModel returns first model if no preference matches", () => {
  const models = ["unknown-model-1", "unknown-model-2"];
  expect(__testing__.pickCheapestModel("openai", models)).toBe("unknown-model-1");
});

test("pickCheapestModel matches prefix for versioned models", () => {
  const models = ["gpt-4o-mini-2024-07-18", "gpt-4o-2024-05-13"];
  expect(__testing__.pickCheapestModel("openai", models)).toBe("gpt-4o-mini-2024-07-18");
});

test("pickCheapestModel handles anthropic preferences", () => {
  const models = ["claude-3-opus", "claude-3-5-haiku-20241022"];
  expect(__testing__.pickCheapestModel("anthropic", models)).toBe("claude-3-5-haiku-20241022");
});

test("pickCheapestModel handles google preferences", () => {
  const models = ["gemini-1.5-pro", "gemini-2.0-flash"];
  expect(__testing__.pickCheapestModel("google", models)).toBe("gemini-2.0-flash");
});

test("pickCheapestModel handles unknown provider", () => {
  const models = ["model-a", "model-b"];
  expect(__testing__.pickCheapestModel("unknown", models)).toBe("model-a");
});

test("parseOllamaModels returns model names", () => {
  const models = __testing__.parseOllamaModels({
    models: [{ name: "llama3.2:3b" }, { name: "phi3:mini" }, { name: "gemma2:2b" }],
  });
  expect(models).toEqual(["llama3.2:3b", "phi3:mini", "gemma2:2b"]);
});

test("parseOllamaModels handles empty models", () => {
  const models = __testing__.parseOllamaModels({});
  expect(models).toEqual([]);
});

test("parseOllamaModels filters out entries without name", () => {
  const models = __testing__.parseOllamaModels({
    models: [{ name: "llama3.2:3b" }, { digest: "sha256:abc" }],
  });
  expect(models).toEqual(["llama3.2:3b"]);
});

test("pickCheapestModel handles ollama preferences", () => {
  const models = ["llama3.2:70b", "llama3.2:3b", "phi3:mini"];
  expect(__testing__.pickCheapestModel("ollama", models)).toBe("llama3.2:3b");
});
