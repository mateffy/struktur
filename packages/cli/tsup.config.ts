import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
  },
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "@struktur/sdk",
    "@struktur/telemetry",
  ],
  banner: {
    js: "#!/usr/bin/env node",
  },
});
