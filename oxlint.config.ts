import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: [
    "docs/**",
    "packages/app/build/**",
    "packages/app/dist/**",
    "packages/web/.dist/**",
    "packages/web/.output/**",
    "packages/documentation/.output/**",
  ],
  jsPlugins: ["eslint-plugin-unused-imports"],
  rules: {
    "unused-imports/no-unused-imports": "error",
  },
});
