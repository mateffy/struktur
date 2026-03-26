/**
 * RPC Type Definitions for Struktur App
 *
 * These types define the typed RPC interface between the main Bun process
 * and the webview. They enable type-safe communication for:
 * - Secure storage operations (API keys via SDK auth)
 * - Configuration management (aliases, default model)
 * - File system operations (file picking, reading)
 * - Window management
 * - Native OS integrations
 */

import { type RPCSchema } from "electrobun/bun";

// =============================================================================
// RPC Type Definition
// =============================================================================

export type StrukturAppRPC = {
  // Functions that execute in the main Bun process
  bun: RPCSchema<{
    requests: {
      // Secure Storage Operations (via @struktur/sdk)
      /**
       * Store API tokens securely using SDK auth system
       * Uses macOS Keychain when available, file-based otherwise
       */
      storeApiKeys: {
        params: {
          keys: Array<{
            provider: string;
            apiKey: string;
          }>;
        };
        response: {
          success: boolean;
          stored?: Array<{
            provider: string;
            storage: "keychain" | "file";
          }>;
          error?: string;
        };
      };

      /**
       * Retrieve stored API tokens
       */
      retrieveApiKeys: {
        params: {
          providers: string[];
        };
        response: {
          keys: Array<{
            provider: string;
            apiKey: string;
          }>;
          error?: string;
        };
      };

      /**
       * Check if API tokens exist for given providers
       */
      hasStoredKeys: {
        params: {
          providers: string[];
        };
        response: {
          hasKeys: boolean;
          providers: string[];
        };
      };

      /**
       * Clear all stored API tokens
       */
      clearApiKeys: {
        params: {};
        response: {
          success: boolean;
        };
      };

      // Configuration Management
      /**
       * Get the default model from config
       */
      getDefaultModel: {
        params: {};
        response: {
          model: string | null;
        };
      };

      /**
       * Set the default model
       */
      setDefaultModel: {
        params: {
          model: string;
        };
        response: {
          success: boolean;
          model?: string;
          error?: string;
        };
      };

      /**
       * List all model aliases
       */
      listAliases: {
        params: {};
        response: {
          aliases: Record<string, string>;
        };
      };

      /**
       * Create or update a model alias
       */
      setAlias: {
        params: {
          alias: string;
          model: string;
        };
        response: {
          success: boolean;
          error?: string;
        };
      };

      /**
       * Delete a model alias
       */
      deleteAlias: {
        params: {
          alias: string;
        };
        response: {
          success: boolean;
        };
      };

      // File System Operations
      /**
       * Open native file picker dialog
       */
      pickFiles: {
        params: {
          multiple?: boolean;
          filters?: Array<{
            name: string;
            extensions: string[];
          }>;
        };
        response: {
          files: Array<{
            path: string;
            name: string;
            size: number;
          }>;
          canceled: boolean;
        };
      };

      /**
       * Read file as ArrayBuffer for processing
       */
      readFile: {
        params: {
          path: string;
        };
        response: {
          data: ArrayBuffer;
          error?: string;
        };
      };

      // Window Management
      /**
       * Get current window state
       */
      getWindowState: {
        params: {};
        response: {
          isMaximized: boolean;
          isMinimized: boolean;
          isFocused: boolean;
        };
      };

      /**
       * Show native save dialog
       */
      showSaveDialog: {
        params: {
          defaultPath?: string;
          filters?: Array<{
            name: string;
            extensions: string[];
          }>;
        };
        response: {
          path: string | null;
          canceled: boolean;
        };
      };

      // Application Info
      /**
       * Get app version and system info
       */
      getAppInfo: {
        params: {};
        response: {
          version: string;
          platform: string;
          arch: string;
        };
      };
    };

    messages: {
      // One-way messages (no response expected)
      /**
       * Log message from webview to main process
       */
      log: {
        level: "debug" | "info" | "warn" | "error";
        message: string;
        context?: Record<string, unknown>;
      };

      /**
       * Window state changed
       */
      windowStateChanged: {
        state: "maximized" | "minimized" | "restored" | "focused" | "blurred";
      };

      /**
       * Notify that extraction process started/completed
       */
      extractionProgress: {
        status: "started" | "completed" | "failed";
        id: string;
        progress?: number;
      };
    };
  }>;

  // Functions that execute in the webview/browser context
  webview: RPCSchema<{
    requests: {
      /**
       * Request webview to update its configuration
       */
      updateConfig: {
        params: {
          theme?: "light" | "dark" | "system";
          zoom?: number;
        };
        response: {
          success: boolean;
        };
      };

      /**
       * Request webview to show a notification
       */
      showNotification: {
        params: {
          title: string;
          body: string;
          type?: "info" | "success" | "warning" | "error";
        };
        response: {
          success: boolean;
        };
      };
    };

    messages: {
      /**
       * Notify webview that API keys were updated
       */
      apiKeysUpdated: {
        providers: string[];
      };

      /**
       * Notify webview that a file was dropped on the app
       */
      fileDropped: {
        paths: string[];
      };

      /**
       * Deep link opened (e.g., struktur://open?file=...)
       */
      deepLinkOpened: {
        url: string;
      };
    };
  }>;
};
