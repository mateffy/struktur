import { listAllProviderModels, getDefaultModel, listAliases } from '@struktur/sdk'

const SUPPORTED_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'opencode',
  'openrouter',
]

export async function fetchModels() {
  const results = await listAllProviderModels(SUPPORTED_PROVIDERS)
  
  const models: Array<{
    id: string
    name: string
    provider: string
    fullId: string
  }> = []
  
  for (const result of results) {
    if (result.models && Array.isArray(result.models)) {
      for (const modelId of result.models) {
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
}

export async function fetchConfig() {
  const [defaultModel, aliases] = await Promise.all([
    getDefaultModel(),
    listAliases(),
  ])
  
  return {
    defaultModel: defaultModel ?? null,
    aliases,
  }
}
