import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    strategies: "src/strategies/index.ts",
    parsers: "src/parsers/index.ts",
  },
  format: ["esm"],
  // dts is handled separately by `tsc --project tsconfig.build.json`
  // to avoid tsup's bundled-output dts generation which fails on AI SDK's
  // private class members (TS4094).
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
});
