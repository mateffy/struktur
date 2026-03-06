---
name: struktur
description: Extracts structured JSON from pre-parsed artifacts using the Vercel AI SDK. Use when working with @mateffy/struktur — importing extract(), choosing extraction strategies (simple/parallel/sequential/doublePass), building Artifact DTOs, defining schemas, or using the struktur CLI. Handles multi-document extraction, token-aware chunking, Ajv validation with retries, and merge/dedup workflows.
metadata:
  author: mateffy
  version: "1.0"
---

# Struktur

Struktur turns pre-parsed artifact DTOs into validated JSON via Vercel AI SDK. It chunks by token budget, runs strategy workflows, validates with Ajv, and merges/dedupes outputs.

**Package**: `@mateffy/struktur`  
**Runtime**: Bun (use `bun install`, `bun test`, `bun run`)

## Core API

```typescript
import { extract, simple } from "@mateffy/struktur";
import type { JSONSchemaType } from "ajv";

const result = await extract({
  artifacts,           // Artifact[]  — required
  schema,              // JSONSchemaType<T> | AnyJSONSchema — mutually exclusive with fields
  fields,              // string — shorthand, e.g. "title, price:number" — mutually exclusive with schema
  strategy,            // ExtractionStrategy<T> — required
  events?,             // ExtractionEvents — optional progress hooks
  debug?,              // DebugLogger — optional JSON logging
  strict?,             // boolean — strict Ajv validation
});

result.data    // T — extracted, validated output
result.usage   // { inputTokens, outputTokens, totalTokens }
result.error   // Error | undefined
```

## Strategies

Pick based on input size and output shape.

| Strategy | When to use | Key config |
|---|---|---|
| `simple` | Small input, fits in one context window | `model` |
| `parallel` | Large input, array/list output, order doesn't matter | `model`, `mergeModel`, `chunkSize`, `concurrency?` |
| `sequential` | Large input, context must carry over between batches | `model`, `chunkSize` |
| `parallelAutoMerge` | Large input, array output, need dedup | `model`, `chunkSize`, `dedupeModel?` |
| `sequentialAutoMerge` | Large input, sequential + dedup | `model`, `chunkSize`, `dedupeModel?` |
| `doublePass` | Max accuracy: parallel merge then sequential refinement | `model`, `mergeModel`, `chunkSize` |
| `doublePassAutoMerge` | Max accuracy + dedup | `model`, `chunkSize`, `dedupeModel?` |

```typescript
import { extract, simple, parallel, sequential, parallelAutoMerge, doublePass } from "@mateffy/struktur";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

// Simple — small inputs
strategy: simple({ model: google("gemini-2.0-flash") })

// Parallel — large inputs, list output
strategy: parallel({
  model: google("gemini-2.0-flash"),
  mergeModel: google("gemini-2.0-flash"),
  chunkSize: 10_000,
  concurrency: 4,
})

// Sequential — context carryover between batches
strategy: sequential({ model: anthropic("claude-sonnet-4-5"), chunkSize: 8_000 })

// Double pass — highest accuracy
strategy: doublePass({
  model: openai("gpt-4o"),
  mergeModel: openai("gpt-4o"),
  chunkSize: 12_000,
  concurrency: 3,
})
```

**Common config options** (all strategies):
- `model` — Vercel AI SDK model instance
- `chunkSize` — token budget per batch (default: 10_000)
- `maxImages?` — max images per batch
- `outputInstructions?` — extra extraction guidance in system prompt
- `strict?` — strict schema validation

## Schema Definition

Two approaches — mutually exclusive:

### JSON Schema (typed)
```typescript
import type { JSONSchemaType } from "ajv";

type Output = {
  title: string;
  items: Array<{ name: string; price: number }>;
};

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: {
    title: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "number" },
        },
        required: ["name", "price"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "items"],
  additionalProperties: false,
};
```

### Shorthand fields string
```typescript
// "name" defaults to string; "name:type" for explicit types
const fields = "title, price:number, active:boolean, tags:array";
// Supported: string, number, boolean, integer, int, float, bool, enum{a|b|c}, array (defaults to array{string}), array{type}
```

## Building Artifacts

Struktur does NOT parse PDFs, HTML, or files — it expects pre-parsed DTOs.

```typescript
import type { Artifact, ArtifactContent } from "@mateffy/struktur";

// Manual construction
const artifact: Artifact = {
  id: "doc-1",
  type: "text",            // "text" | "image" | "pdf" | "file"
  raw: async () => Buffer.from("source content"),
  contents: [
    { page: 1, text: "Extracted text content here..." },
    { page: 2, text: "More content...", media: [{ type: "image", url: "..." }] },
  ],
};

// From URL (fetches Artifact JSON)
import { urlToArtifact } from "@mateffy/struktur";
const artifact = await urlToArtifact("https://example.com/artifact.json");

// From file buffer with custom provider
import { fileToArtifact } from "@mateffy/struktur";
const providers = {
  "application/pdf": async (buffer: Buffer) => ({
    id: "pdf-1",
    type: "pdf" as const,
    raw: async () => buffer,
    contents: [{ page: 1, text: "..." }],
  }),
};
const artifact = await fileToArtifact(buffer, { mimeType: "application/pdf", providers });
```

**ArtifactImage** fields: `type`, `url?`, `base64?`, `contents?` (Buffer), `text?`, `x?`, `y?`, `width?`, `height?`

## Events

```typescript
const result = await extract({
  artifacts,
  schema,
  strategy,
  events: {
    onStep: ({ step, total, label }) => {
      console.log(`[${step}/${total}] ${label}`);
      // label examples: "extract", "batch 2/5", "merge", "pass 1 merge"
    },
    onRetry: ({ attempt, maxAttempts, reason }) => {
      console.warn(`Retry ${attempt}/${maxAttempts}: ${reason}`);
    },
    onTokenUsage: ({ inputTokens, outputTokens, totalTokens, model }) => {
      console.log(`Tokens: ${totalTokens} (${model})`);
    },
    onMessage: ({ role, content }) => { /* full LLM messages */ },
    onProgress: ({ current, total, percent }) => { /* batch progress */ },
  },
});
```

## Custom Strategy

```typescript
import type { ExtractionStrategy, ExtractionOptions, ExtractionResult } from "@mateffy/struktur";

const myStrategy: ExtractionStrategy<Output> = {
  name: "my-strategy",
  getEstimatedSteps: (artifacts) => 3,
  async run(options: ExtractionOptions<Output>): Promise<ExtractionResult<Output>> {
    return {
      data: { /* ... */ },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    };
  },
};
```

## CLI

```bash
# Extract with inline text
struktur extract -t "Invoice #1234, total $99" -f "invoice_number, total:number"

# Extract from file with schema
struktur extract -i document.txt -s schema.json -m openai/gpt-4o

# Extract with strategy
struktur extract -i docs.txt -s schema.json -m google/gemini-2.0-flash -S parallel --chunk-size 8000

# Pipe stdin
cat document.txt | struktur extract -f "title, summary" -m anthropic/claude-sonnet-4-5

# Debug mode (verbose JSON logs to stderr)
struktur extract --debug -t "text" -s schema.json

# Model management
struktur models list
struktur models use openai/gpt-4o          # set default model
struktur models alias set fast google/gemini-2.0-flash
struktur models alias set smart anthropic/claude-opus-4-5
struktur extract -t "text" -f "title" -m fast  # use alias

# Provider setup
struktur providers add openai --token sk-...
struktur providers add anthropic --token sk-ant-...
struktur providers list
```

**Model format**: `provider/model-name`  
**Providers**: `openai`, `anthropic`, `google`, `opencode`, `openrouter`  
**OpenRouter provider routing**: `openrouter/anthropic/claude-3.5-sonnet#cerebras`

## Internal Architecture

```
extract()
  → strategy.run()
     → batchArtifacts() / splitArtifact()   (src/chunking/)
        → buildExtractorPrompt()             (src/prompts/)
           → runWithRetries()                (src/llm/)
              → generateStructured()         (Vercel AI SDK)
              → Ajv validation / retry
              → merge / dedupe               (src/merge/)
```

**Key modules**:
- `src/strategies/` — all strategy implementations
- `src/artifacts/` — `fileToArtifact`, `urlToArtifact`, `parseInputToArtifacts`, provider registry
- `src/chunking/` — `ArtifactSplitter`, `ArtifactBatcher`
- `src/llm/` — `LLMClient`, `RetryingRunner`, `models`
- `src/prompts/` — `ExtractorPrompt`, `SequentialExtractorPrompt`, `ParallelMergerPrompt`
- `src/merge/` — `SmartDataMerger` (arrays concat, objects shallow-merge), `Deduplicator` (CRC32)
- `src/validation/` — Ajv validator, `SchemaValidationError`
- `src/auth/` — token storage (Keychain / `~/.config/struktur/`), alias/default model config
- `src/debug/` — structured JSON logger (`--debug` flag)

## Patterns

**Merge rules** (SmartDataMerger): arrays concatenate, objects shallow-merge, scalars prefer newest value.

**Validation retries**: `runWithRetries` feeds Ajv errors back to the LLM (max 3 attempts). `onRetry` fires with `{ attempt, maxAttempts, reason }`.

**Token budget**: `chunkSize` is in tokens. Default `10_000`. Images default to 1000 tokens each. Adjust `maxImages` to control multimodal batch costs.

**Schema strict mode**: Pass `strict: true` to use OpenAI's `strictJsonSchema` — requires `additionalProperties: false` everywhere and no `$ref`.

**Fields shorthand** builds a JSON Schema automatically. Use for quick CLIs or simple schemas; use `JSONSchemaType<T>` for full type inference.

**Debug logs**: Single-line JSON to stderr. Types include `cli_init`, `artifacts_loaded`, `batching_complete`, `llm_call_start`, `llm_call_complete`, `validation_failed`, `retry`, `merge_start`, `extraction_complete`.

## Tests

```bash
bun test                        # run all tests
bun test src/strategies/        # strategy tests
bun test src/chunking/          # chunking tests
```

Tests are colocated: `foo.ts` → `foo.test.ts`. Add or update tests whenever behavior changes.
