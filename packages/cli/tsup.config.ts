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
  // Fully self-contained CLI: bundle @struktur/* workspace packages AND all
  // npm deps (ai, zod, pdf-parse, …). Only native modules and the heavy
  // optional processor deps stay external (lazy-loaded at runtime).
  noExternal: [/^@struktur\//],
  external: [
    "@llamaindex/liteparse",
    "@kreuzberg/node",
    "@napi-rs/canvas",
    "canvas",
    "sharp",
    "tesseract.js",
    "@mongodb-js/zstd",
    "@langfuse/otel",
    "pdf-parse",
  ],
  banner: {
    // Aliased createRequire shim so bundled CJS deps can use dynamic require()
    // inside the ESM bundle (aliased to avoid colliding with deps that also
    // import createRequire themselves).
    js: "#!/usr/bin/env node\nimport { createRequire as __cliCreateRequire } from 'module';\nconst require = __cliCreateRequire(import.meta.url);",
  },
  define: {
    __CLI_VERSION__: JSON.stringify(version),
  },
});
