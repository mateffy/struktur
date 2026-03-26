// Environment and configuration utilities

/**
 * Check if global providers (environment variables / CLI stored tokens) are enabled
 * Default is false - only client-supplied keys are used
 * Set STRUKTUR_USE_GLOBAL_PROVIDERS=true to enable global provider keys
 */
export function useGlobalProviders(): boolean {
  const envValue = process.env.STRUKTUR_USE_GLOBAL_PROVIDERS;
  return envValue === "true" || envValue === "1";
}

/**
 * Get the environment variable name for a provider
 */
export function getProviderEnvVar(provider: string): string | undefined {
  switch (provider) {
    case "openai":
      return "OPENAI_API_KEY";
    case "anthropic":
      return "ANTHROPIC_API_KEY";
    case "google":
      return "GOOGLE_GENERATIVE_AI_API_KEY";
    case "opencode":
      return "OPENCODE_API_KEY";
    case "openrouter":
      return "OPENROUTER_API_KEY";
    default:
      return undefined;
  }
}

/**
 * Check if a global API key is available for a provider
 * Only returns true if STRUKTUR_USE_GLOBAL_PROVIDERS is enabled
 */
export function hasGlobalProviderKey(provider: string): boolean {
  if (!useGlobalProviders()) {
    return false;
  }

  const envVar = getProviderEnvVar(provider);
  if (!envVar) {
    return false;
  }

  return !!process.env[envVar];
}

/**
 * Get available providers that have global keys configured
 */
export function getAvailableGlobalProviders(): string[] {
  if (!useGlobalProviders()) {
    return [];
  }

  const providers = ["openai", "anthropic", "google", "opencode", "openrouter"];
  return providers.filter((p) => hasGlobalProviderKey(p));
}
