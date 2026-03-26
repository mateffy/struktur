import { test, expect, mock } from "bun:test";
import type { ModelMessage } from "ai";

type GenerateTextParams = {
  model: unknown;
  output: unknown;
  system: string;
  messages: ModelMessage[];
  providerOptions?: unknown;
};

let generateTextImpl: (params: GenerateTextParams) => Promise<{
  output: unknown;
  usage?: Record<string, unknown>;
}>;

const calls: GenerateTextParams[] = [];

mock.module("ai", () => ({
  generateText: (params: GenerateTextParams) => {
    calls.push(params);
    return generateTextImpl(params);
  },
  Output: {
    object: (config: unknown) => config,
  },
  jsonSchema: (schema: unknown) => ({ wrapped: schema }),
}));

const { generateStructured } = await import("./LLMClient");

test("generateStructured maps prompt/completion token usage", async () => {
  calls.length = 0;
  generateTextImpl = async () => ({
    output: { title: "ok" },
    usage: { promptTokens: 2, completionTokens: 3, totalTokens: 9 },
  });

  const result = await generateStructured({
    model: {},
    schema: { type: "object" },
    system: "sys",
    user: "prompt",
  });

  expect(result.usage).toEqual({ inputTokens: 2, outputTokens: 3, totalTokens: 9 });
  expect(calls[0]?.output).toEqual({ schema: { wrapped: { type: "object" } }, name: "extract" });
  expect(calls[0]?.messages[0]).toEqual({ role: "user", content: "prompt" });
});

test("generateStructured uses explicit messages and totals usage", async () => {
  calls.length = 0;
  const messages: ModelMessage[] = [{ role: "user", content: "custom" }];
  generateTextImpl = async (_params) => ({
    output: { title: "ok" },
    usage: { inputTokens: 4, outputTokens: 6 },
  });

  const result = await generateStructured({
    model: {},
    schema: { type: "object" },
    system: "sys",
    user: "fallback",
    messages,
  });

  expect(calls[0]?.messages).toBe(messages);
  expect(result.usage).toEqual({ inputTokens: 4, outputTokens: 6, totalTokens: 10 });
});

test("generateStructured passes OpenRouter provider preference", async () => {
  calls.length = 0;
  generateTextImpl = async () => ({
    output: { title: "ok" },
    usage: { inputTokens: 1, outputTokens: 1 },
  });

  const model = { __openrouter_provider: "cerebras" };
  await generateStructured({
    model,
    schema: { type: "object" },
    system: "sys",
    user: "prompt",
  });

  expect(calls[0]?.providerOptions).toEqual({
    openrouter: {
      provider: {
        order: ["cerebras"],
      },
    },
  });
});

test("generateStructured does not add openrouter providerOptions without preference", async () => {
  calls.length = 0;
  generateTextImpl = async () => ({
    output: { title: "ok" },
    usage: { inputTokens: 1, outputTokens: 1 },
  });

  await generateStructured({
    model: {},
    schema: { type: "object" },
    system: "sys",
    user: "prompt",
  });

  expect(calls[0]?.providerOptions).not.toHaveProperty("openrouter");
});

test("generateStructured uses inputTokens/outputTokens when promptTokens missing", async () => {
  calls.length = 0;
  generateTextImpl = async () => ({
    output: { title: "ok" },
    usage: { inputTokens: 5, outputTokens: 7 },
  });

  const result = await generateStructured({
    model: {},
    schema: { type: "object" },
    system: "sys",
    user: "prompt",
  });

  expect(result.usage).toEqual({ inputTokens: 5, outputTokens: 7, totalTokens: 12 });
});

test("generateStructured uses totalTokens from response when present", async () => {
  calls.length = 0;
  generateTextImpl = async () => ({
    output: { title: "ok" },
    usage: { inputTokens: 3, outputTokens: 4, totalTokens: 100 },
  });

  const result = await generateStructured({
    model: {},
    schema: { type: "object" },
    system: "sys",
    user: "prompt",
  });

  expect(result.usage.totalTokens).toBe(100);
});

test("generateStructured handles missing usage", async () => {
  calls.length = 0;
  generateTextImpl = async () => ({
    output: { title: "ok" },
  });

  const result = await generateStructured({
    model: {},
    schema: { type: "object" },
    system: "sys",
    user: "prompt",
  });

  expect(result.usage).toEqual({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
});

test("generateStructured uses custom schema name", async () => {
  calls.length = 0;
  generateTextImpl = async () => ({
    output: { title: "ok" },
    usage: {},
  });

  await generateStructured({
    model: {},
    schema: { type: "object" },
    schemaName: "custom_schema",
    system: "sys",
    user: "prompt",
  });

  expect(calls[0]?.output).toHaveProperty("name", "custom_schema");
});

test("generateStructured uses custom schema description", async () => {
  calls.length = 0;
  generateTextImpl = async () => ({
    output: { title: "ok" },
    usage: {},
  });

  await generateStructured({
    model: {},
    schema: { type: "object" },
    schemaDescription: "Extract data",
    system: "sys",
    user: "prompt",
  });

  expect(calls[0]?.output).toHaveProperty("description", "Extract data");
});

test("generateStructured shows friendly error when model doesn't support images", async () => {
  calls.length = 0;
  generateTextImpl = async () => {
    throw {
      responseBody:
        '{"error":{"message":"No endpoints found that support image input","code":404}}',
      statusCode: 404,
    };
  };

  expect(
    async () =>
      await generateStructured({
        model: { modelId: "meta-llama/llama-3.1-8b-instruct" },
        schema: { type: "object" },
        system: "sys",
        user: [
          { type: "text", text: "prompt" },
          { type: "image", image: "base64data" },
        ],
      }),
  ).toThrow(
    'Model "meta-llama/llama-3.1-8b-instruct" does not support image input. Please use a model that supports images (e.g., gpt-4o, claude-3-5-sonnet, gemini-1.5-pro) or remove the --images and --screenshots flags.',
  );
});

test("generateStructured rethrows other API errors", async () => {
  calls.length = 0;
  const originalError = new Error("Some other error");
  generateTextImpl = async () => {
    throw originalError;
  };

  expect(
    async () =>
      await generateStructured({
        model: {},
        schema: { type: "object" },
        system: "sys",
        user: "prompt",
      }),
  ).toThrow("Some other error");
});

test("generateStructured shows friendly error for internal server error", async () => {
  calls.length = 0;
  generateTextImpl = async () => {
    throw {
      statusCode: 200,
      responseBody: undefined,
      data: {
        code: 500,
        message: "Internal Server Error",
        type: null,
        param: null,
      },
    };
  };

  expect(
    async () =>
      await generateStructured({
        model: { modelId: "openai/gpt-5-mini" },
        schema: { type: "object" },
        system: "sys",
        user: "prompt",
      }),
  ).toThrow(
    'Provider error for model "openai/gpt-5-mini": Internal server error. The model or provider may be experiencing issues. Please try again or use a different model.',
  );
});

test("generateStructured shows friendly error for authentication failure", async () => {
  calls.length = 0;
  generateTextImpl = async () => {
    throw {
      statusCode: 401,
      responseBody: '{"error":{"message":"Invalid API key"}}',
      data: {
        code: 401,
        message: "Invalid API key",
      },
    };
  };

  expect(
    async () =>
      await generateStructured({
        model: { modelId: "gpt-4o" },
        schema: { type: "object" },
        system: "sys",
        user: "prompt",
      }),
  ).toThrow(
    'Authentication failed for model "gpt-4o". Please check your API key is valid and has the necessary permissions.',
  );
});

test("generateStructured shows friendly error for rate limit", async () => {
  calls.length = 0;
  generateTextImpl = async () => {
    throw {
      statusCode: 429,
      responseBody: '{"error":{"message":"Rate limit exceeded"}}',
      data: {
        code: 429,
        message: "Rate limit exceeded",
      },
    };
  };

  expect(
    async () =>
      await generateStructured({
        model: { modelId: "claude-3-5-sonnet" },
        schema: { type: "object" },
        system: "sys",
        user: "prompt",
      }),
  ).toThrow(
    'Rate limit exceeded for model "claude-3-5-sonnet". Please wait a moment and try again, or use a different model.',
  );
});

test("generateStructured shows friendly error for model not found", async () => {
  calls.length = 0;
  generateTextImpl = async () => {
    throw {
      statusCode: 404,
      responseBody: '{"error":{"message":"Model not found"}}',
      data: {
        code: 404,
        message: "Model not found",
      },
    };
  };

  expect(
    async () =>
      await generateStructured({
        model: { modelId: "nonexistent-model" },
        schema: { type: "object" },
        system: "sys",
        user: "prompt",
      }),
  ).toThrow(
    'Model "nonexistent-model" not found or unavailable. Model not found Please check the model name or try a different model.',
  );
});

test("generateStructured shows friendly error for access denied", async () => {
  calls.length = 0;
  generateTextImpl = async () => {
    throw {
      statusCode: 403,
      responseBody: '{"error":{"message":"Access denied"}}',
      data: {
        code: 403,
        message: "Access denied",
      },
    };
  };

  expect(
    async () =>
      await generateStructured({
        model: { modelId: "gpt-4-turbo" },
        schema: { type: "object" },
        system: "sys",
        user: "prompt",
      }),
  ).toThrow(
    'Access denied for model "gpt-4-turbo". Your API key may not have access to this model. Please check your subscription or try a different model.',
  );
});

test("generateStructured shows generic provider error message", async () => {
  calls.length = 0;
  generateTextImpl = async () => {
    throw {
      statusCode: 400,
      responseBody: '{"error":{"message":"Context length exceeded"}}',
      data: {
        code: 400,
        message: "Context length exceeded",
      },
    };
  };

  expect(
    async () =>
      await generateStructured({
        model: { modelId: "gpt-3.5-turbo" },
        schema: { type: "object" },
        system: "sys",
        user: "prompt",
      }),
  ).toThrow('Provider error for model "gpt-3.5-turbo": Context length exceeded');
});
