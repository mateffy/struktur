import type { ProviderModelsResult } from "../types";
import { resolveProviderEnvVar, resolveProviderToken } from "../auth/tokens";

const openAiModelsUrl = "https://api.openai.com/v1/models";
const anthropicModelsUrl = "https://api.anthropic.com/v1/models";
const googleModelsUrl = "https://generativelanguage.googleapis.com/v1beta/models";

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

  throw new Error(`Unsupported provider: ${provider}`);
};

const cheapestModelPreferences: Record<string, string[]> = {
  openai: ["gpt-4.1-nano", "gpt-4.1-mini", "gpt-4o-mini", "gpt-4o"],
  anthropic: ["claude-3-5-haiku", "claude-3-haiku"],
  google: ["gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
};

const matchesPreference = (model: string, preference: string) => {
  return model === preference || model.startsWith(`${preference}-`);
};

export const listProviderModels = async (provider: string): Promise<ProviderModelsResult> => {
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
  pickCheapestModel,
};
