import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    datasets: "src/datasets/index.ts",
    cli: "src/cli.ts",
  },
  format: ["esm"],
  // dts is handled separately by `tsc --project tsconfig.build.json`.
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
});
