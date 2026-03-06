import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
  ModelSelectorLogo,
} from '@/components/ai-elements/model-selector'
import { ChevronsUpDown } from 'lucide-react'
import { fetchModels, fetchConfig } from '@/server/models'

type Model = {
  id: string
  name: string
  provider: string
  fullId: string
}

type Alias = {
  alias: string
  model: string
}

type ModelSelectorProps = {
  value: string
  onChange: (value: string) => void
}

const MODELS_CACHE_KEY = 'struktur-models-cache'
const CONFIG_CACHE_KEY = 'struktur-config-cache'
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

function getCachedModels(): Model[] | null {
  try {
    const cached = localStorage.getItem(MODELS_CACHE_KEY)
    if (!cached) return null
    
    const { models, timestamp } = JSON.parse(cached)
    const age = Date.now() - timestamp
    
    // Return cached models if they're less than 1 hour old
    if (age < CACHE_DURATION) {
      return models
    }
    
    return null
  } catch {
    return null
  }
}

function setCachedModels(models: Model[]) {
  try {
    localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify({
      models,
      timestamp: Date.now(),
    }))
  } catch {
    // Ignore storage errors
  }
}

function getCachedConfig(): { defaultModel: string | null; aliases: Alias[] } | null {
  try {
    const cached = localStorage.getItem(CONFIG_CACHE_KEY)
    if (!cached) return null
    
    const { config, timestamp } = JSON.parse(cached)
    const age = Date.now() - timestamp
    
    if (age < CACHE_DURATION) {
      return config
    }
    
    return null
  } catch {
    return null
  }
}

function setCachedConfig(config: { defaultModel: string | null; aliases: Alias[] }) {
  try {
    localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify({
      config,
      timestamp: Date.now(),
    }))
  } catch {
    // Ignore storage errors
  }
}

export function ModelSelectorComponent({ value, onChange }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>(() => getCachedModels() || [])
  const [aliases, setAliases] = useState<Alias[]>(() => {
    const cached = getCachedConfig()
    return cached?.aliases || []
  })
  const [defaultModel, setDefaultModel] = useState<string | null>(() => {
    const cached = getCachedConfig()
    return cached?.defaultModel || null
  })
  const [loading, setLoading] = useState(() => !getCachedModels() || !getCachedConfig())
  const [open, setOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Always fetch in background to keep cache fresh
    Promise.all([fetchModels(), fetchConfig()])
      .then(([fetchedModels, config]) => {
        setModels(fetchedModels)
        setCachedModels(fetchedModels)
        
        const aliasList = Object.entries(config.aliases).map(([alias, model]) => ({
          alias,
          model,
        }))
        setAliases(aliasList)
        setDefaultModel(config.defaultModel)
        setCachedConfig({
          defaultModel: config.defaultModel,
          aliases: aliasList,
        })
        setLoading(false)
      })
      .catch((error) => {
        // Only show error if we don't have cached data
        if (models.length === 0) {
          console.error('Failed to fetch models:', error)
        }
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Set default model on first load if no value is set
  useEffect(() => {
    if (!initialized && !loading && !value && defaultModel) {
      onChange(defaultModel)
      setInitialized(true)
    } else if (!initialized && !loading) {
      setInitialized(true)
    }
  }, [initialized, loading, value, defaultModel, onChange])

  // Group models by provider
  const groupedModels = useMemo(() => {
    return models.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    }, {} as Record<string, Model[]>)
  }, [models])

  const selectedModel = models.find(m => m.fullId === value)
  const selectedAlias = aliases.find(a => a.alias === value || a.model === value)

  return (
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={loading && models.length === 0}
        >
          {selectedAlias ? (
            <span className="truncate">
              {selectedAlias.alias}
            </span>
          ) : selectedModel ? (
            <span className="truncate">
              {selectedModel.name}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {loading && models.length === 0 ? 'Loading models...' : 'Select model...'}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent className="w-[400px]" title="Select Model">
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {aliases.length > 0 && (
            <ModelSelectorGroup key="aliases" heading="ALIASES">
              {aliases.map((alias) => (
                <ModelSelectorItem
                  key={alias.alias}
                  value={alias.alias}
                  onSelect={() => {
                    onChange(alias.alias)
                    setOpen(false)
                  }}
                >
                  <ModelSelectorName>
                    <div className="flex flex-col">
                      <span className="font-medium">{alias.alias}</span>
                      <span className="text-xs text-muted-foreground">{alias.model}</span>
                    </div>
                  </ModelSelectorName>
                </ModelSelectorItem>
              ))}
            </ModelSelectorGroup>
          )}
          {Object.entries(groupedModels).map(([provider, providerModels]) => (
            <ModelSelectorGroup key={provider} heading={provider.toUpperCase()}>
              {providerModels.map((model) => (
                <ModelSelectorItem
                  key={model.fullId}
                  value={model.fullId}
                  onSelect={() => {
                    onChange(model.fullId)
                    setOpen(false)
                  }}
                >
                  <ModelSelectorLogo provider={provider} />
                  <ModelSelectorName>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.id}</span>
                    </div>
                  </ModelSelectorName>
                </ModelSelectorItem>
              ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  )
}
