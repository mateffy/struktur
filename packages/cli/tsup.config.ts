import { defineConfig } from "tsup";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync("package.json", "utf-8")) as { version: string };

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
  },
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["@struktur/sdk", "@struktur/telemetry"],
  banner: {
    js: "#!/usr/bin/env node",
  },
  define: {
    __CLI_VERSION__: JSON.stringify(version),
  },
});
