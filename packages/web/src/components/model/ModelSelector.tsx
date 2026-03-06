import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
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
  ModelSelectorTrigger,
  ModelSelectorSeparator,
} from '@/components/ai-elements/model-selector'
import { ChevronsUpDown, Sparkles, Zap, Check } from 'lucide-react'

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

async function fetchModels(): Promise<Model[]> {
  const response = await fetch('/api/models')
  if (!response.ok) {
    throw new Error('Failed to fetch models')
  }
  return response.json()
}

async function fetchConfig(): Promise<{ defaultModel: string | null; aliases: Record<string, string> }> {
  const response = await fetch('/api/config')
  if (!response.ok) {
    throw new Error('Failed to fetch config')
  }
  return response.json()
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

// Provider color mapping for spice
const PROVIDER_COLORS: Record<string, string> = {
  openai: '#10a37f',
  anthropic: '#d97757',
  google: '#4285f4',
  mistral: '#fd6c35',
  groq: '#f97316',
  togetherai: '#6366f1',
  fireworks: '#0ea5e9',
  cerebras: '#ec4899',
  perplexity: '#22c55e',
  deepseek: '#6366f1',
  xai: '#000000',
  azure: '#0078d4',
  nebius: '#8b5cf6',
  lmstudio: '#f59e0b',
}

function getProviderColor(provider: string): string {
  return PROVIDER_COLORS[provider.toLowerCase()] || '#7a5c3a'
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
        if (models.length === 0) {
          console.error('Failed to fetch models:', error)
        }
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!initialized && !loading && !value && defaultModel) {
      onChange(defaultModel)
      setInitialized(true)
    } else if (!initialized && !loading) {
      setInitialized(true)
    }
  }, [initialized, loading, value, defaultModel, onChange])

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

  // Get display info
  const displayName = selectedAlias?.alias || selectedModel?.name || (loading ? 'Loading...' : 'Select model')
  const displayProvider = selectedModel?.provider || selectedAlias?.model?.split('/')[0]
  const providerColor = displayProvider ? getProviderColor(displayProvider) : '#7a5c3a'

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
            <span className="truncate font-medium">
              {displayName}
            </span>
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
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          
          {aliases.length > 0 && (
            <>
              <ModelSelectorGroupHeading heading="Quick Picks" />
              <ModelSelectorGroup>
                {aliases.map((alias) => (
                  <ModelSelectorItem
                    key={alias.alias}
                    value={alias.alias}
                    onSelect={() => {
                      onChange(alias.alias)
                      setOpen(false)
                    }}
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
                    {value === alias.alias && (
                      <Check className="w-4 h-4 text-[#7a5c3a] ml-auto" />
                    )}
                  </ModelSelectorItem>
                ))}
              </ModelSelectorGroup>
              <ModelSelectorSeparator />
            </>
          )}
          
          {Object.entries(groupedModels).map(([provider, providerModels], groupIndex) => (
            <div key={provider}>
              {groupIndex > 0 && <ModelSelectorSeparator />}
              <ModelSelectorGroupHeading 
                heading={provider.charAt(0).toUpperCase() + provider.slice(1)} 
              />
              <ModelSelectorGroup>
                {providerModels.map((model) => {
                  const isSelected = value === model.fullId
                  const color = getProviderColor(provider)
                  
                  return (
                    <ModelSelectorItem
                      key={model.fullId}
                      value={model.fullId}
                      onSelect={() => {
                        onChange(model.fullId)
                        setOpen(false)
                      }}
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
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#7a5c3a] ml-auto" />
                      )}
                    </ModelSelectorItem>
                  )
                })}
              </ModelSelectorGroup>
            </div>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  )
}
