import { defineConfig } from "gesetz";
import { typescriptSyntaxBackend } from "@gesetz/typescript";
import { oxlint } from "@gesetz/oxlint";
import { oxfmt } from "@gesetz/oxfmt";
import { vitest } from "@gesetz/vitest";

export default defineConfig({
  adapters: [typescriptSyntaxBackend],

  // Category rules are scored independently. oxlint/oxfmt scan the whole repo
  // (respecting their own configs' ignore patterns); the web app runs its Vitest
  // suite. The SDK/fields/http/telemetry suites use `bun test` (not vitest), so
  // they run via `pnpm -r run test` separately.
  rules: [
    oxlint({ category: "lint" }),
    oxfmt({ category: "format" }),
    vitest({
      cwd: "packages/web",
      configFile: "vitest.config.ts",
      category: "test",
      label: "vitest (web)",
    }),
  ],

  // Require a perfect score per category: any violation — even a warning —
  // drops the category below 10 and fails the gate.
  thresholds: [
    { category: "lint", minScore: 10 },
    { category: "format", minScore: 10 },
    { category: "test", minScore: 10 },
  ],
});
