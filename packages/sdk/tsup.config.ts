import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    strategies: "src/strategies/index.ts",
    parsers: "src/parsers/index.ts",
  },
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "@struktur/agent-strategy",
  ],
});
