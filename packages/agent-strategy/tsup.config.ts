import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "@struktur/sdk",
    "@mariozechner/pi-coding-agent",
    "just-bash",
  ],
});
