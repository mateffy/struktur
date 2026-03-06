import { createServerFn } from '@tanstack/react-start'
import { listAllProviderModels, getDefaultModel, listAliases } from '@struktur/sdk'

const SUPPORTED_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'opencode',
  'openrouter',
]

export const fetchModels = createServerFn({ method: 'GET' })
  .handler(async () => {
    const results = await listAllProviderModels(SUPPORTED_PROVIDERS)
    
    // Flatten all models into a single array with provider info
    const models: Array<{
      id: string
      name: string
      provider: string
      fullId: string
    }> = []
    
    for (const result of results) {
      if (result.models && Array.isArray(result.models)) {
        for (const modelId of result.models) {
          // Models are returned as strings
          const id = typeof modelId === 'string' ? modelId : String(modelId)
          models.push({
            id,
            name: id,
            provider: result.provider,
            fullId: `${result.provider}/${id}`,
          })
        }
      }
    }
    
    return models
  })

export const fetchConfig = createServerFn({ method: 'GET' })
  .handler(async () => {
    const [defaultModel, aliases] = await Promise.all([
      getDefaultModel(),
      listAliases(),
    ])
    
    return {
      defaultModel: defaultModel ?? null,
      aliases,
    }
  })
