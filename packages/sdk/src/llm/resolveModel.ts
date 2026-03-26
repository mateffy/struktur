import { resolveProviderEnvVar, resolveProviderToken, resolveOllamaBaseURL } from "../auth/tokens";

// AI SDK model types have private properties (config, getArgs) that can't be
// represented in .d.ts files. Using unknown to avoid TS4094 errors.
// See: https://github.com/microsoft/TypeScript/issues/30369
export type AiSdkModel = unknown;

export const resolveModel = async (model: string): Promise<AiSdkModel> => {
  (globalThis as { AI_SDK_LOG_WARNINGS?: boolean }).AI_SDK_LOG_WARNINGS ??= false;
  process.env.AI_SDK_LOG_WARNINGS ??= "false";
  const [provider, ...rest] = model.split("/");
  const modelName = rest.join("/");

  if (!provider || !modelName) {
    throw new Error(
      `Invalid model format: ${model}. Expected format: provider/model (e.g., openai/gpt-4)`,
    );
  }

  if (provider !== "ollama") {
    const envVar = resolveProviderEnvVar(provider);
    if (envVar && !process.env[envVar]) {
      const storedToken = await resolveProviderToken(provider);
      if (storedToken) {
        process.env[envVar] = storedToken;
      }
    }
  }

  switch (provider) {
    case "openai": {
      const { openai } = await import("@ai-sdk/openai");
      return openai(modelName);
    }
    case "anthropic": {
      const { anthropic } = await import("@ai-sdk/anthropic");
      return anthropic(modelName);
    }
    case "google": {
      const { google } = await import("@ai-sdk/google");
      return google(modelName);
    }
    case "opencode": {
      const envVar = resolveProviderEnvVar("opencode");
      let apiKey = envVar ? process.env[envVar] : undefined;
      if (!apiKey) {
        apiKey = await resolveProviderToken("opencode");
      }
      if (!apiKey) {
        throw new Error(
          "OpenCode API key is required. Set OPENCODE_API_KEY environment variable or run 'struktur auth set --provider opencode --token <token>'",
        );
      }

      if (modelName.startsWith("claude-")) {
        const { createAnthropic } = await import("@ai-sdk/anthropic");
        return createAnthropic({
          apiKey,
          baseURL: "https://opencode.ai/zen/v1",
        })(modelName);
      } else if (modelName.startsWith("gemini-")) {
        const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
        return createGoogleGenerativeAI({
          apiKey,
          baseURL: "https://opencode.ai/zen/v1",
        })(modelName);
      } else {
        const { createOpenAI } = await import("@ai-sdk/openai");
        return createOpenAI({
          apiKey,
          baseURL: "https://opencode.ai/zen/v1",
        })(modelName);
      }
    }
    case "openrouter": {
      const { openrouter } = await import("@openrouter/ai-sdk-provider");
      const hashIndex = modelName.indexOf("#");
      const actualModelName = hashIndex >= 0 ? modelName.slice(0, hashIndex) : modelName;
      const preferredProvider = hashIndex >= 0 ? modelName.slice(hashIndex + 1) : undefined;

      const modelInstance = openrouter(actualModelName);

      if (preferredProvider) {
        Object.defineProperty(modelInstance, "__openrouter_provider", {
          value: preferredProvider,
          writable: false,
          enumerable: false,
          configurable: false,
        });
      }

      return modelInstance;
    }
    case "ollama": {
      const { createOllama } = await import("ollama-ai-provider-v2");
      const baseURL = await resolveOllamaBaseURL();
      const ollama = createOllama({ baseURL });
      return ollama(modelName);
    }
    default:
      throw new Error(
        `Unsupported model provider: ${provider}. Supported providers: openai, anthropic, google, opencode, openrouter, ollama`,
      );
  }
};
