# LLM Magic (TypeScript)

LLM Magic is a TypeScript-first extraction engine built on the Vercel AI SDK. It focuses on message contents, flexible chunking, and strategy-driven extraction flows. Artifacts are DTOs (already-parsed JSON), so you can plug in your own document pipeline.

## Architecture Overview

- Entry: `extract()` delegates to a strategy.
- Strategies: `simple`, `parallel`, `sequential`, `parallelAutoMerge`, `sequentialAutoMerge`, `doublePass`, `doublePassAutoMerge`.
- Chunking: artifacts split and batched by token counts and optional image limits.
- Prompts: exact prompt text from the PHP version, with artifact XML formatting.
- Validation: Ajv validates outputs; retries feed schema errors back to the LLM.
- Merging: smart schema-aware merge + hash dedupe + optional LLM dedupe.

```
extract()
  -> strategy.run()
     -> batchArtifacts() / splitArtifact()
        -> prompt builder(s)
           -> runWithRetries()
              -> Ajv validation / retry
              -> merge / dedupe (strategy-specific)
```

## Installation

```
bun install
```

## Core Concepts

- **Artifacts** are JSON DTOs with text and media slices. You control how they are produced.
- **Chunking** splits large artifacts and batches them by token budgets.
- **Strategies** define how batches are processed and merged.
- **Events** give you progress hooks for UI updates.

## Usage Examples

### 1) Basic Extraction
```ts
import { extract, simple } from "@mateffy/llm-magic";
import type { JSONSchemaType } from "ajv";
import { google } from "@ai-sdk/google";

type Output = { title: string };

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: { title: { type: "string" } },
  required: ["title"],
  additionalProperties: false,
};

const result = await extract({
  artifacts: [/* Artifact[] */],
  schema,
  strategy: simple({ model: google("claude-haiku-4-5") }),
});

result.data.title;
```

### 2) Parallel Strategy with Merge
```ts
import { extract, parallel } from "@mateffy/llm-magic";
import { google } from "@ai-sdk/google";

const result = await extract({
  artifacts,
  schema,
  strategy: parallel({
    model: google("claude-haiku-4-5"),
    mergeModel: google("claude-haiku-4-5"),
    chunkSize: 10_000,
  }),
});
```

### 3) Sequential Strategy with Context
```ts
import { extract, sequential } from "@mateffy/llm-magic";
import { google } from "@ai-sdk/google";

const result = await extract({
  artifacts,
  schema,
  strategy: sequential({
    model: google("claude-haiku-4-5"),
    chunkSize: 10_000,
  }),
});
```

### 4) Auto-Merge with Dedup
```ts
import { extract, parallelAutoMerge } from "@mateffy/llm-magic";
import { google } from "@ai-sdk/google";

const result = await extract({
  artifacts,
  schema,
  strategy: parallelAutoMerge({
    model: google("claude-haiku-4-5"),
    chunkSize: 10_000,
  }),
});
```

### 5) Double Pass Refinement
```ts
import { extract, doublePass } from "@mateffy/llm-magic";
import { google } from "@ai-sdk/google";

const result = await extract({
  artifacts,
  schema,
  strategy: doublePass({
    model: google("claude-haiku-4-5"),
    mergeModel: google("claude-haiku-4-5"),
    chunkSize: 10_000,
  }),
});
```

### 6) Artifact from URL
```ts
import { urlToArtifact } from "@mateffy/llm-magic";

const artifact = await urlToArtifact("https://example.com/artifact.json");
```

### 7) Custom File Provider
```ts
import { registerArtifactProvider, fileToArtifact } from "@mateffy/llm-magic";

registerArtifactProvider("application/pdf", async (buffer) => ({
  id: "pdf-1",
  type: "pdf",
  raw: async () => buffer,
  contents: [{ page: 1, text: "..." }],
}));

const artifact = await fileToArtifact(buffer, { mimeType: "application/pdf" });
```

### 8) Events for UI
```ts
import { extract, parallel } from "@mateffy/llm-magic";
import { google } from "@ai-sdk/google";

const result = await extract({
  artifacts,
  schema,
  strategy: parallel({
    model: google("claude-haiku-4-5"),
    mergeModel: google("claude-haiku-4-5"),
    chunkSize: 10_000,
  }),
  events: {
    onStep: ({ step, total, label }) => {
      console.log("step", step, total, label);
    },
    onMessage: ({ role, content }) => {
      console.log(role, content);
    },
  },
});
```

### 9) Typed Schema Support
```ts
import type { JSONSchemaType } from "ajv";

type Output = { title: string };
const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: { title: { type: "string" } },
  required: ["title"],
  additionalProperties: false,
};

const result = await extract({ artifacts, schema, strategy });
result.data.title; // typed
```

### 10) Custom Strategy
```ts
import type { ExtractionStrategy } from "@mateffy/llm-magic";

const custom: ExtractionStrategy<{ ok: boolean }> = {
  name: "custom",
  run: async () => ({
    data: { ok: true },
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  }),
};
```

## Strategy Guidance

- `simple`: single-shot extraction.
- `parallel`: batch concurrently, then LLM merge.
- `sequential`: batch sequentially with context preservation.
- `parallelAutoMerge`: fast merge + dedupe.
- `sequentialAutoMerge`: safe merge + dedupe.
- `doublePass`: refine after a full merge.

## Testing

```
bun test
```
