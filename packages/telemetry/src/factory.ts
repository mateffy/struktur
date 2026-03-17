/**
 * Factory function for creating telemetry adapters
 * 
 * This module provides a factory function to create telemetry adapters
 * based on the specified provider. It supports lazy loading of adapter
 * implementations to avoid loading unused dependencies.
 */

import type { 
  TelemetryAdapter, 
  TelemetryOptions, 
  PhoenixConfig, 
  LangfuseConfig 
} from "./types.js";
import { NoopTelemetryAdapter } from "./types.js";

/**
 * Create a telemetry adapter based on the specified provider.
 * 
 * @param options - Telemetry configuration options
 * @returns A telemetry adapter instance, or null if disabled
 * @throws Error if the provider is unknown or required deps are missing
 * 
 * @example
 * ```typescript
 * // Phoenix
 * const telemetry = await createTelemetry({
 *   provider: "phoenix",
 *   config: {
 *     projectName: "my-app",
 *     url: "http://localhost:6006",
 *   } satisfies PhoenixConfig
 * });
 * 
 * // Langfuse
 * const telemetry = await createTelemetry({
 *   provider: "langfuse",
 *   config: {
 *     publicKey: "pk-lf-xxx",
 *     secretKey: "sk-lf-xxx",
 *   } satisfies LangfuseConfig
 * });
 * ```
 */
export async function createTelemetry(options: TelemetryOptions): Promise<TelemetryAdapter | null> {
  if (options.enabled === false) {
    return null;
  }

  const { provider, config } = options;

  try {
    switch (provider) {
      case "phoenix": {
        const { PhoenixAdapter } = await import("./adapters/phoenix/index.js");
        return new PhoenixAdapter(config as unknown as PhoenixConfig);
      }
      
      case "langfuse": {
        const { LangfuseAdapter } = await import("./adapters/langfuse/index.js");
        return new LangfuseAdapter(config as unknown as LangfuseConfig);
      }
      
      default:
        throw new Error(
          `Unknown telemetry provider: ${provider}. ` +
          `Supported providers: phoenix, langfuse`
        );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cannot find module")) {
      throw new Error(
        `Provider '${provider}' requires optional dependencies. ` +
        `Install them with: bun add @arizeai/phoenix-otel @arizeai/openinference-core ` +
        `or bun add @langfuse/otel`
      );
    }
    throw error;
  }
}

/**
 * Create a Phoenix telemetry adapter.
 * 
 * @param config - Phoenix configuration
 * @returns Phoenix telemetry adapter
 * 
 * @example
 * ```typescript
 * import { createPhoenixTelemetry } from "@struktur/telemetry";
 * 
 * const telemetry = await createPhoenixTelemetry({
 *   projectName: "production-extractions",
 *   url: "https://app.phoenix.arize.com/s/my-space",
 *   apiKey: process.env.PHOENIX_API_KEY,
 * });
 * ```
 */
export async function createPhoenixTelemetry(config: PhoenixConfig): Promise<TelemetryAdapter> {
  const { PhoenixAdapter } = await import("./adapters/phoenix/index.js");
  return new PhoenixAdapter(config);
}

/**
 * Create a Langfuse telemetry adapter.
 * 
 * @param config - Langfuse configuration
 * @returns Langfuse telemetry adapter
 * 
 * @example
 * ```typescript
 * import { createLangfuseTelemetry } from "@struktur/telemetry";
 * 
 * const telemetry = await createLangfuseTelemetry({
 *   publicKey: process.env.LANGFUSE_PUBLIC_KEY,
 *   secretKey: process.env.LANGFUSE_SECRET_KEY,
 *   baseUrl: "https://cloud.langfuse.com",
 * });
 * ```
 */
export async function createLangfuseTelemetry(config: LangfuseConfig): Promise<TelemetryAdapter> {
  const { LangfuseAdapter } = await import("./adapters/langfuse/index.js");
  return new LangfuseAdapter(config);
}

/**
 * Create a no-op telemetry adapter (for testing or when telemetry is disabled).
 * 
 * @returns No-op telemetry adapter
 */
export function createNoopTelemetry(): TelemetryAdapter {
  return new NoopTelemetryAdapter();
}
