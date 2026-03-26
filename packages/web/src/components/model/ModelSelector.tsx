import { Check, ChevronsUpDown, Lock, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorGroupHeading,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorSeparator,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";
import { useApiKeys } from "@/components/auth/ApiKeyProvider";

type Model = {
  id: string;
  name: string;
  provider: string;
  fullId: string;
  hasGlobalKey: boolean;
};

type Alias = {
  alias: string;
  model: string;
};

type Config = {
  defaultModel: string | null;
  aliases: Alias[];
  availableProviders: string[];
  useGlobalProviders: boolean;
  allProviders: string[];
};

async function fetchModels(): Promise<Model[]> {
  const response = await fetch("/api/models");
  if (!response.ok) {
    throw new Error("Failed to fetch models");
  }
  return response.json();
}

async function fetchConfig(): Promise<{
  defaultModel: string | null;
  aliases: Record<string, string>;
  availableProviders: string[];
  useGlobalProviders: boolean;
  allProviders: string[];
}> {
  const response = await fetch("/api/config");
  if (!response.ok) {
    throw new Error("Failed to fetch config");
  }
  return response.json();
}

type ModelSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const MODELS_CACHE_KEY = "struktur-models-cache";
const CONFIG_CACHE_KEY = "struktur-config-cache";
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

function getCachedModels(): Model[] | null {
  try {
    const cached = localStorage.getItem(MODELS_CACHE_KEY);
    if (!cached) return null;

    const { models, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age < CACHE_DURATION) {
      return models;
    }

    return null;
  } catch {
    return null;
  }
}

function setCachedModels(models: Model[]) {
  try {
    localStorage.setItem(
      MODELS_CACHE_KEY,
      JSON.stringify({
        models,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // Ignore storage errors
  }
}

function getCachedConfig(): Config | null {
  try {
    const cached = localStorage.getItem(CONFIG_CACHE_KEY);
    if (!cached) return null;

    const { config, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age < CACHE_DURATION) {
      return config;
    }

    return null;
  } catch {
    return null;
  }
}

function setCachedConfig(config: Config) {
  try {
    localStorage.setItem(
      CONFIG_CACHE_KEY,
      JSON.stringify({
        config,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // Ignore storage errors
  }
}

// Provider color mapping for spice
const PROVIDER_COLORS: Record<string, string> = {
  openai: "#10a37f",
  anthropic: "#d97757",
  google: "#4285f4",
  mistral: "#fd6c35",
  groq: "#f97316",
  togetherai: "#6366f1",
  fireworks: "#0ea5e9",
  cerebras: "#ec4899",
  perplexity: "#22c55e",
  deepseek: "#6366f1",
  xai: "#000000",
  azure: "#0078d4",
  nebius: "#8b5cf6",
  lmstudio: "#f59e0b",
  opencode: "#7a5c3a",
  openrouter: "#7a5c3a",
};

function getProviderColor(provider: string): string {
  return PROVIDER_COLORS[provider.toLowerCase()] || "#7a5c3a";
}

export function ModelSelectorComponent({ value, onChange }: ModelSelectorProps) {
  const { storedProviders } = useApiKeys();
  const [models, setModels] = useState<Model[]>(() => getCachedModels() || []);
  const [aliases, setAliases] = useState<Alias[]>(() => {
    const cached = getCachedConfig();
    return cached?.aliases || [];
  });
  const [defaultModel, setDefaultModel] = useState<string | null>(() => {
    const cached = getCachedConfig();
    return cached?.defaultModel || null;
  });
  const [globalProviders, setGlobalProviders] = useState<string[]>(() => {
    const cached = getCachedConfig();
    return cached?.availableProviders || [];
  });
  const [useGlobal, setUseGlobal] = useState<boolean>(() => {
    const cached = getCachedConfig();
    return cached?.useGlobalProviders || false;
  });
  const [loading, setLoading] = useState(() => !getCachedModels() || !getCachedConfig());
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    Promise.all([fetchModels(), fetchConfig()])
      .then(([fetchedModels, config]) => {
        setModels(fetchedModels);
        setCachedModels(fetchedModels);

        const aliasList = Object.entries(config.aliases).map(([alias, model]) => ({
          alias,
          model,
        }));
        setAliases(aliasList);
        setDefaultModel(config.defaultModel);
        setGlobalProviders(config.availableProviders || []);
        setUseGlobal(config.useGlobalProviders || false);
        setCachedConfig({
          defaultModel: config.defaultModel,
          aliases: aliasList,
          availableProviders: config.availableProviders || [],
          useGlobalProviders: config.useGlobalProviders || false,
          allProviders: config.allProviders || [],
        });
        setLoading(false);
      })
      .catch((error) => {
        if (models.length === 0) {
          console.error("Failed to fetch models:", error);
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models.length]);

  useEffect(() => {
    if (!initialized && !loading && !value && defaultModel) {
      onChange(defaultModel);
      setInitialized(true);
    } else if (!initialized && !loading) {
      setInitialized(true);
    }
  }, [initialized, loading, value, defaultModel, onChange]);

  // Determine which providers have available keys (global or local)
  const enabledProviders = useMemo(() => {
    if (useGlobal) {
      // When using global providers, only those with global keys are enabled
      return new Set(globalProviders);
    }
    // When using local providers, use the stored providers from secure storage
    return new Set(storedProviders);
  }, [useGlobal, globalProviders, storedProviders]);

  // Group models by provider, separating enabled and disabled
  const { enabledModels, disabledModels } = useMemo(() => {
    const enabled: Record<string, Model[]> = {};
    const disabled: Record<string, Model[]> = {};

    for (const model of models) {
      const isEnabled = enabledProviders.has(model.provider);
      if (isEnabled) {
        if (!enabled[model.provider]) {
          enabled[model.provider] = [];
        }
        enabled[model.provider].push(model);
      } else {
        if (!disabled[model.provider]) {
          disabled[model.provider] = [];
        }
        disabled[model.provider].push(model);
      }
    }

    return { enabledModels: enabled, disabledModels: disabled };
  }, [models, enabledProviders]);

  const selectedModel = models.find((m) => m.fullId === value);
  const selectedAlias = aliases.find((a) => a.alias === value || a.model === value);

  // Get display info
  const hasEnabledProviders = enabledProviders.size > 0;

  // Build display name - show alias name with resolved model in parentheses
  let displayName: string;
  if (selectedAlias) {
    displayName = `${selectedAlias.alias} (${selectedAlias.model})`;
  } else if (selectedModel) {
    displayName = selectedModel.name;
  } else if (loading) {
    displayName = "Loading...";
  } else if (!hasEnabledProviders) {
    displayName = "Add API keys to use models";
  } else {
    displayName = "Select model";
  }

  const displayProvider = selectedModel?.provider || selectedAlias?.model?.split("/")[0];
  const providerColor = displayProvider ? getProviderColor(displayProvider) : "#7a5c3a";

  const handleModelSelect = (modelFullId: string) => {
    const model = models.find((m) => m.fullId === modelFullId);
    if (model && enabledProviders.has(model.provider)) {
      onChange(modelFullId);
      setOpen(false);
    }
  };

  return (
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 px-3 bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] hover:bg-[#ede5d8] hover:text-[#3d2b15] group transition-all"
          disabled={loading && models.length === 0}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedAlias && (
              <span className="flex items-center justify-center w-5 h-5 rounded bg-[#7a5c3a] text-white">
                <Zap className="w-3 h-3" />
              </span>
            )}
            {selectedModel && !selectedAlias && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: providerColor }}
              />
            )}
            <span className="truncate font-medium">{displayName}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#a0926f] group-hover:text-[#7a5c3a] transition-colors" />
        </Button>
      </ModelSelectorTrigger>

      <ModelSelectorContent>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#d4c8b8] bg-[#ede5d8]">
          <Sparkles className="w-4 h-4 text-[#7a5c3a]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7a5c3a]">
            Select Model
          </span>
        </div>

        <ModelSelectorInput placeholder="Search models or aliases..." />

        <ModelSelectorList>
          {!loading && models.length === 0 ? (
            <ModelSelectorEmpty>
              <div className="flex flex-col gap-2 text-center">
                <p className="font-medium">No models available</p>
                <p className="text-xs text-[#a0926f]">Unable to fetch models from providers.</p>
              </div>
            </ModelSelectorEmpty>
          ) : (
            <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          )}

          {aliases.length > 0 && (
            <>
              <ModelSelectorGroupHeading heading="Quick Picks" />
              <ModelSelectorGroup>
                {aliases.map((alias) => {
                  const aliasProvider = alias.model.split("/")[0];
                  const isEnabled = enabledProviders.has(aliasProvider);
                  return (
                    <ModelSelectorItem
                      key={alias.alias}
                      value={alias.alias}
                      onSelect={() => {
                        if (isEnabled) {
                          onChange(alias.alias);
                          setOpen(false);
                        }
                      }}
                      disabled={!isEnabled}
                      className={!isEnabled ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-[#7a5c3a] text-white mr-2">
                        <Zap className="w-3 h-3" />
                      </span>
                      <ModelSelectorName>
                        <div className="flex flex-col">
                          <span className="font-semibold">{alias.alias}</span>
                          <span className="text-xs text-[#a0926f]">{alias.model}</span>
                        </div>
                      </ModelSelectorName>
                      {!isEnabled && <Lock className="w-4 h-4 text-[#a0926f] ml-auto" />}
                      {value === alias.alias && (
                        <Check className="w-4 h-4 text-[#7a5c3a] ml-auto" />
                      )}
                    </ModelSelectorItem>
                  );
                })}
              </ModelSelectorGroup>
              <ModelSelectorSeparator />
            </>
          )}

          {/* Enabled Providers */}
          {Object.entries(enabledModels).map(([provider, providerModels], groupIndex) => (
            <div key={provider}>
              {groupIndex > 0 && <ModelSelectorSeparator />}
              <ModelSelectorGroupHeading
                heading={provider.charAt(0).toUpperCase() + provider.slice(1)}
              />
              <ModelSelectorGroup>
                {providerModels.map((model) => {
                  const isSelected = value === model.fullId;
                  const color = getProviderColor(provider);

                  return (
                    <ModelSelectorItem
                      key={model.fullId}
                      value={model.fullId}
                      onSelect={() => handleModelSelect(model.fullId)}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 mr-2"
                        style={{ backgroundColor: color }}
                      />
                      <ModelSelectorName>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-[#a0926f] font-mono">{model.id}</span>
                        </div>
                      </ModelSelectorName>
                      {isSelected && <Check className="w-4 h-4 text-[#7a5c3a] ml-auto" />}
                    </ModelSelectorItem>
                  );
                })}
              </ModelSelectorGroup>
            </div>
          ))}

          {/* Disabled Providers */}
          {Object.keys(disabledModels).length > 0 && (
            <>
              <ModelSelectorSeparator />
              <ModelSelectorGroupHeading heading="Add API Key to Enable" />
              {Object.entries(disabledModels).map(([provider, providerModels]) => (
                <ModelSelectorGroup key={provider}>
                  <div className="px-2 py-1.5 text-xs font-medium text-[#a0926f]">
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </div>
                  {providerModels.slice(0, 3).map((model) => {
                    const color = getProviderColor(provider);

                    return (
                      <ModelSelectorItem
                        key={model.fullId}
                        value={model.fullId}
                        disabled={true}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0 mr-2"
                          style={{
                            backgroundColor: color,
                            opacity: 0.5,
                          }}
                        />
                        <ModelSelectorName>
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-[#a0926f] font-mono">{model.id}</span>
                          </div>
                        </ModelSelectorName>
                        <Lock className="w-4 h-4 text-[#a0926f] ml-auto" />
                      </ModelSelectorItem>
                    );
                  })}
                  {providerModels.length > 3 && (
                    <div className="px-2 py-1 text-xs text-[#a0926f] italic">
                      ...and {providerModels.length - 3} more models
                    </div>
                  )}
                </ModelSelectorGroup>
              ))}
            </>
          )}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
