import type { ProviderId } from '../lib/secure-storage'

export interface ProviderConfig {
  id: ProviderId
  name: string
  logo: string // SVG string or component reference
  docsUrl: string
  keyUrl: string // URL to create/manage API keys
  description: string
  recommendedPermissions: string[]
  keyPlaceholder: string
  keyPrefix?: string // e.g., "sk-" for OpenAI
}

// Provider logos as SVG strings
const PROVIDER_LOGOS = {
  openai: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.606-1.5z"/>
  </svg>`,

  anthropic: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.304 3.541h-3.672l6.696 16.918h3.672zm-10.608 0L0 20.459h3.744l1.368-3.6h6.624l1.368 3.6h3.744L8.448 3.541zm-.264 10.656 1.944-5.088 1.944 5.088z"/>
  </svg>`,

  google: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896c1.944 0 3.696.78 4.992 2.04l-2.028 2.028C14.028 8.268 13.044 7.896 12 7.896c-2.268 0-4.104 1.836-4.104 4.104S9.732 16.104 12 16.104c1.944 0 3.576-1.368 3.96-3.192H12V9.912h6.984c.12.636.216 1.296.216 1.992 0 4.392-3.708 7.8-8.2 7.8z"/>
  </svg>`,

  opencode: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" opacity="0.6"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`,

  openrouter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2v20M2 12h20"/>
    <path d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
  </svg>`,
}

export const PROVIDER_CONFIGS: Record<ProviderId, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    logo: PROVIDER_LOGOS.openai,
    docsUrl: 'https://platform.openai.com/docs',
    keyUrl: 'https://platform.openai.com/api-keys',
    description:
      'Access GPT-4, GPT-3.5, and other OpenAI models. API keys start with "sk-".',
    recommendedPermissions: [
      'Restrict key to only necessary endpoints',
      'Set hard usage limits',
      'Enable usage notifications',
    ],
    keyPlaceholder: 'sk-...',
    keyPrefix: 'sk-',
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    logo: PROVIDER_LOGOS.anthropic,
    docsUrl: 'https://docs.anthropic.com',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    description:
      'Access Claude models. API keys start with "sk-ant-". Known for long context windows.',
    recommendedPermissions: [
      'Use restricted API keys',
      'Monitor usage carefully',
      'Set up billing alerts',
    ],
    keyPlaceholder: 'sk-ant-...',
    keyPrefix: 'sk-ant-',
  },

  google: {
    id: 'google',
    name: 'Google AI',
    logo: PROVIDER_LOGOS.google,
    docsUrl: 'https://ai.google.dev/docs',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    description:
      'Access Gemini models. API keys are alphanumeric strings.',
    recommendedPermissions: [
      'Restrict to specific APIs',
      'Set quota limits',
      'Use separate projects for testing',
    ],
    keyPlaceholder: 'AI...',
  },

  opencode: {
    id: 'opencode',
    name: 'Opencode',
    logo: PROVIDER_LOGOS.opencode,
    docsUrl: 'https://opencode.ai/docs',
    keyUrl: 'https://opencode.ai/settings/api',
    description: 'Access Opencode models through their API.',
    recommendedPermissions: [
      'Rotate keys regularly',
      'Use IP restrictions if available',
      'Monitor for unusual activity',
    ],
    keyPlaceholder: 'opc_...',
    keyPrefix: 'opc_',
  },

  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    logo: PROVIDER_LOGOS.openrouter,
    docsUrl: 'https://openrouter.ai/docs',
    keyUrl: 'https://openrouter.ai/keys',
    description:
      'Access models from multiple providers through a unified API.',
    recommendedPermissions: [
      'Set spending limits',
      'Enable email notifications',
      'Use separate keys for different apps',
    ],
    keyPlaceholder: 'sk-or-...',
    keyPrefix: 'sk-or-',
  },
}

export function getProviderConfig(provider: ProviderId): ProviderConfig {
  return PROVIDER_CONFIGS[provider]
}

export function getAllProviders(): ProviderConfig[] {
  return Object.values(PROVIDER_CONFIGS)
}

export function validateApiKeyFormat(
  provider: ProviderId,
  apiKey: string
): { valid: boolean; error?: string } {
  const config = PROVIDER_CONFIGS[provider]

  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: 'API key is required' }
  }

  if (config.keyPrefix && !apiKey.startsWith(config.keyPrefix)) {
    return {
      valid: false,
      error: `API key should start with "${config.keyPrefix}"`,
    }
  }

  // Basic length check
  if (apiKey.length < 10) {
    return { valid: false, error: 'API key seems too short' }
  }

  return { valid: true }
}
