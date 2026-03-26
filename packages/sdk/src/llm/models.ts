import type { ProviderModelsResult } from "../types";
import { resolveProviderEnvVar, resolveProviderToken, resolveOllamaBaseURL } from "../auth/tokens";

const openAiModelsUrl = "https://api.openai.com/v1/models";
const anthropicModelsUrl = "https://api.anthropic.com/v1/models";
const googleModelsUrl = "https://generativelanguage.googleapis.com/v1beta/models";
const openRouterModelsUrl = "https://openrouter.ai/api/v1/models";

const getTokenForProvider = async (provider: string) => {
  const envVar = resolveProviderEnvVar(provider);
  if (envVar && process.env[envVar]) {
    return process.env[envVar] as string;
  }
  return await resolveProviderToken(provider);
};

const parseOpenAiModels = (json: unknown) => {
  const data = (json as { data?: Array<{ id?: string }> } | undefined)?.data ?? [];
  return data.map((item) => item.id).filter((id): id is string => typeof id === "string");
};

const parseAnthropicModels = (json: unknown) => {
  const data = (json as { data?: Array<{ id?: string }> } | undefined)?.data ?? [];
  return data.map((item) => item.id).filter((id): id is string => typeof id === "string");
};

const parseGoogleModels = (json: unknown) => {
  const data = (json as { models?: Array<{ name?: string }> } | undefined)?.models ?? [];
  return data
    .map((item) => item.name)
    .filter((name): name is string => typeof name === "string")
    .map((name) => name.replace(/^models\//, ""));
};

const parseOpenRouterModels = (json: unknown) => {
  const data = (json as { data?: Array<{ id?: string }> } | undefined)?.data ?? [];
  return data.map((item) => item.id).filter((id): id is string => typeof id === "string");
};

const parseOllamaModels = (json: unknown) => {
  const models = (json as { models?: Array<{ name?: string }> } | undefined)?.models ?? [];
  return models.map((item) => item.name).filter((name): name is string => typeof name === "string");
};

const requestModels = async (provider: string, token: string): Promise<string[]> => {
  if (provider === "openai") {
    const response = await fetch(openAiModelsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const json = (await response.json()) as unknown;
    return parseOpenAiModels(json);
  }

  if (provider === "anthropic") {
    const response = await fetch(anthropicModelsUrl, {
      headers: {
        "x-api-key": token,
        "anthropic-version": "2023-06-01",
      },
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const json = (await response.json()) as unknown;
    return parseAnthropicModels(json);
  }

  if (provider === "google") {
    const response = await fetch(`${googleModelsUrl}?key=${encodeURIComponent(token)}`);
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const json = (await response.json()) as unknown;
    return parseGoogleModels(json);
  }

  if (provider === "openrouter") {
    const response = await fetch(openRouterModelsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const json = (await response.json()) as unknown;
    return parseOpenRouterModels(json);
  }

  if (provider === "ollama") {
    const baseURL = await resolveOllamaBaseURL();
    const tagsURL = new URL("tags", baseURL.endsWith("/") ? baseURL : `${baseURL}/`).href;
    const response = await fetch(tagsURL);
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const json = (await response.json()) as unknown;
    return parseOllamaModels(json);
  }

  if (provider === "opencode") {
    // OpenCode doesn't have a public models endpoint, return known models
    return [
      "gpt-5.2",
      "gpt-5.2-codex",
      "gpt-5.1",
      "gpt-5.1-codex",
      "gpt-5.1-codex-max",
      "gpt-5.1-codex-mini",
      "gpt-5",
      "gpt-5-codex",
      "gpt-5-nano",
      "claude-opus-4-6",
      "claude-opus-4-5",
      "claude-opus-4-1",
      "claude-sonnet-4-6",
      "claude-sonnet-4-5",
      "claude-sonnet-4",
      "claude-haiku-4-5",
      "claude-haiku-3.5",
      "gemini-3.1-pro",
      "gemini-3-pro",
      "gemini-3-flash",
      "minimax-m2.5",
      "minimax-m2.5-free",
      "minimax-m2.1",
      "glm-5",
      "glm-5-free",
      "glm-4.7",
      "glm-4.6",
      "kimi-k2.5",
      "kimi-k2.5-free",
      "kimi-k2-thinking",
      "kimi-k2",
      "qwen3-coder",
      "big-pickle",
    ];
  }

  throw new Error(`Unsupported provider: ${provider}`);
};

const cheapestModelPreferences: Record<string, string[]> = {
  openai: ["gpt-4.1-nano", "gpt-4.1-mini", "gpt-4o-mini", "gpt-4o"],
  anthropic: ["claude-3-5-haiku", "claude-3-haiku"],
  google: ["gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
  opencode: [
    "gpt-5-nano",
    "claude-haiku-3.5",
    "gemini-3-flash",
    "kimi-k2-free",
    "glm-5-free",
    "minimax-m2.5-free",
  ],
  openrouter: ["openai/gpt-4o-mini", "anthropic/claude-3.5-haiku", "google/gemini-flash-1.5"],
  ollama: ["llama3.2:1b", "llama3.2:3b", "phi3:mini", "gemma2:2b"],
};

const matchesPreference = (model: string, preference: string) => {
  return model === preference || model.startsWith(`${preference}-`);
};

export const listProviderModels = async (provider: string): Promise<ProviderModelsResult> => {
  if (provider !== "ollama") {
    const token = await getTokenForProvider(provider);
    if (!token) {
      return { provider, ok: false, error: "No token available" };
    }
    try {
      const models = await requestModels(provider, token);
      return { provider, ok: true, models };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { provider, ok: false, error: message };
    }
  }

  try {
    const models = await requestModels(provider, "");
    return { provider, ok: true, models };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { provider, ok: false, error: message };
  }
};

export const listAllProviderModels = async (providers: string[]) => {
  const results = await Promise.all(providers.map((provider) => listProviderModels(provider)));
  return results;
};

export const pickCheapestModel = (provider: string, models: string[]) => {
  const preferences = cheapestModelPreferences[provider] ?? [];
  for (const preference of preferences) {
    const match = models.find((model) => matchesPreference(model, preference));
    if (match) {
      return match;
    }
  }
  return models[0];
};

export const resolveCheapestModel = async (provider: string) => {
  const result = await listProviderModels(provider);
  if (!result.ok) {
    throw new Error(result.error ?? `Unable to list models for provider: ${provider}`);
  }
  const models = result.models ?? [];
  const model = pickCheapestModel(provider, models);
  if (!model) {
    throw new Error(`No models available for provider: ${provider}`);
  }
  return model;
};

export const __testing__ = {
  parseOpenAiModels,
  parseAnthropicModels,
  parseGoogleModels,
  parseOpenRouterModels,
  parseOllamaModels,
  pickCheapestModel,
};
