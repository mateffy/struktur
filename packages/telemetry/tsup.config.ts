import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    types: "src/types.ts",
    factory: "src/factory.ts",
    "adapters/phoenix": "src/adapters/phoenix/index.ts",
    "adapters/langfuse": "src/adapters/langfuse/index.ts",
  },
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "@struktur/sdk",
    "@arizeai/phoenix-otel",
    "@arizeai/openinference-core",
    "@arizeai/openinference-semantic-conventions",
    "@langfuse/otel",
    "@opentelemetry/api",
    "@opentelemetry/sdk-node",
  ],
});
