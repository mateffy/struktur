import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: [
    "docs/**",
    "packages/app/build/**",
    "packages/app/dist/**",
    "packages/web/.dist/**",
    "packages/web/.output/**",
    "packages/documentation/.output/**",
    "packages/documentation/.source/**",
    "**/routeTree.gen.ts",
  ],
  jsPlugins: ["eslint-plugin-unused-imports"],
  rules: {
    "unused-imports/no-unused-imports": "error",
  },
});
