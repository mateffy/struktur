import { getDefaultModel, listAliases, listAllProviderModels } from "@struktur/sdk";
import { getAvailableGlobalProviders, useGlobalProviders } from "./config";

// All supported providers
const ALL_PROVIDERS = ["openai", "anthropic", "google", "opencode", "openrouter"];

export async function fetchModels() {
  // Get providers that have global keys available
  const globalProviders = getAvailableGlobalProviders();

  // Fetch models from ALL providers (not just those with global keys)
  const results = await listAllProviderModels(ALL_PROVIDERS);

  const models: Array<{
    id: string;
    name: string;
    provider: string;
    fullId: string;
    hasGlobalKey: boolean;
  }> = [];

  for (const result of results) {
    if (result.models && Array.isArray(result.models)) {
      const hasGlobalKey = globalProviders.includes(result.provider);
      for (const modelId of result.models) {
        const id = typeof modelId === "string" ? modelId : String(modelId);
        models.push({
          id,
          name: id,
          provider: result.provider,
          fullId: `${result.provider}/${id}`,
          hasGlobalKey,
        });
      }
    }
  }

  return models;
}

export async function fetchConfig() {
  const [defaultModel, aliases] = await Promise.all([getDefaultModel(), listAliases()]);

  const globalProviders = getAvailableGlobalProviders();

  return {
    defaultModel: defaultModel ?? null,
    aliases,
    availableProviders: globalProviders,
    useGlobalProviders: useGlobalProviders(),
    allProviders: ALL_PROVIDERS,
  };
}
