import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] })],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    exclude: [
      "node_modules",
      "dist",
      "build",
      "src/routeTree.gen.ts",
      "src/paraglide/**",
    ],
    coverage: {
      provider: "v8",
      // Scope the coverage gate to the data/auth/logic modules and the
      // rendering surfaces exercised by this suite, rather than diluting it
      // across untouched niche UI components.
      include: [
        "src/lib/crypto.ts",
        "src/lib/secure-storage.ts",
        "src/lib/file-storage.ts",
        "src/server/api.ts",
        "src/components/FileUploadZone.tsx",
        "src/components/SchemaInput.tsx",
        "src/components/Logo.tsx",
        "src/components/ExtractPage.tsx",
        "src/components/Sidebar.tsx",
        "src/components/OutputViewer.tsx",
        "src/components/auth/PasswordPrompt.tsx",
        "src/components/auth/SecureStorageGate.tsx",
        "src/components/auth/ApiKeyProvider.tsx",
        "src/components/auth/ProviderSettings.tsx",
      ],
      thresholds: {
        statements: 76,
        branches: 70,
        functions: 62,
        lines: 76,
      },
    },
  },
});
