---
name: struktur
description: Extracts structured JSON from documents using an autonomous agent with the Vercel AI SDK. The agent explores documents using a virtual filesystem (read, grep, find, bash tools) and extracts data incrementally. Also supports traditional strategies (simple/parallel/sequential/doublePass) for specific use cases. Use when working with @struktur/sdk — importing extract(), choosing extraction strategies, building Artifacts, defining schemas, or using the struktur CLI.
metadata:
  author: mateffy
  version: "2.0"
---

# Struktur

Struktur extracts structured JSON from documents using an **autonomous agent**. The agent explores documents via a virtual filesystem, deciding when to read files, search for patterns, and build output incrementally.

**Key concept**: The `agent` strategy is the default. It works best for most documents. Traditional strategies (`simple`, `parallel`, `sequential`, `doublePass`) are available for specific cases where you need more control.

**Package**: `@struktur/sdk`  
**Runtime**: Bun (use `bun install`, `bun test`, `bun run`)

## Core API

```typescript
import { extract, agent } from "@struktur/sdk";
import type { JSONSchemaType } from "ajv";

const result = await extract({
  artifacts,           // Artifact[]  — required
  schema,              // JSONSchemaType<T> | AnyJSONSchema — mutually exclusive with fields
  fields,              // string — shorthand, e.g. "title, price:number" — mutually exclusive with schema
  strategy,            // ExtractionStrategy<T> — required (use agent() for default)
  events?,             // ExtractionEvents — optional progress hooks
  debug?,              // DebugLogger — optional JSON logging
  strict?,             // boolean — strict schema validation
});

result.data    // T — extracted, validated output
result.usage   // { inputTokens, outputTokens, totalTokens }
result.error   // Error | undefined
```

## Agent Strategy (Default)

The agent strategy is the **default and recommended** way to use Struktur. It gives the LLM a virtual filesystem and lets it autonomously extract your data.

### How it works
1. Document loaded into virtual filesystem (`/artifacts/artifact.json`, `/artifacts/images/`)
2. Agent explores using tools: **read**, **grep**, **find**, **ls**, **bash**
3. Builds output incrementally via **set_output_data** and **update_output_data**
4. Calls **finish** when complete, or **fail** if impossible
5. Schema validation on every update with automatic retry

### Configuration

```typescript
import { extract, agent } from "@struktur/sdk";

strategy: agent({
  provider: "anthropic",           // Provider name (anthropic, openai, google, opencode)
  modelId: "claude-sonnet-4",      // Model identifier
  maxSteps?: 50,                   // Max agent steps (default: 50)
  apiKey?: "sk-...",              // API key (or use env vars)
  outputInstructions?: "string",   // Extra extraction guidance
})
```

### Model compatibility
The agent requires models with tool/function calling support:
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash

### Example

```typescript
import { extract, agent } from "@struktur/sdk";

const result = await extract({
  artifacts,
  schema,
  strategy: agent({
    provider: "anthropic",
    modelId: "claude-sonnet-4",
    maxSteps: 50,
  }),
});
```

### CLI usage

```bash
# Agent is the default — no --strategy needed
struktur extract --input ./document.pdf --schema ./schema.json

# With specific model and max steps
struktur extract --input ./document.pdf \
  --schema ./schema.json \
  --model anthropic/claude-sonnet-4 \
  --max-steps 30
```

## Traditional Strategies

For specific use cases where you need more control over chunking and parallelism.

| Strategy | When to use | Key config |
|---|---|---|
| `agent` (default) | **Most documents** — autonomous exploration | `provider`, `modelId`, `maxSteps` |
| `simple` | Small input, fits in one context window | `model` |
| `parallel` | Large input, array/list output, order doesn't matter | `model`, `mergeModel`, `chunkSize`, `concurrency?` |
| `sequential` | Large input, context must carry over between batches | `model`, `chunkSize` |
| `parallelAutoMerge` | Large input, array output, need dedup | `model`, `chunkSize`, `dedupeModel?` |
| `sequentialAutoMerge` | Large input, sequential + dedup | `model`, `chunkSize`, `dedupeModel?` |
| `doublePass` | Max accuracy: parallel merge then sequential refinement | `model`, `mergeModel`, `chunkSize` |
| `doublePassAutoMerge` | Max accuracy + dedup | `model`, `chunkSize`, `dedupeModel?` |

```typescript
import { extract, simple, parallel, sequential, parallelAutoMerge, doublePass } from "@struktur/sdk";
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

Struktur does NOT parse PDFs, HTML, or files — it expects pre-parsed Artifacts.

```typescript
import type { Artifact, ArtifactContent } from "@struktur/sdk";

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
import { urlToArtifact } from "@struktur/sdk";
const artifact = await urlToArtifact("https://example.com/artifact.json");

// From file buffer with custom provider
import { fileToArtifact } from "@struktur/sdk";
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
    onStep: ({ step, total, label, detail }) => {
      console.log(`[${step}/${total}] ${label} ${detail || ""}`);
      // label examples: "extract", "Read manifest.json", "Set Output", "agent_explore"
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
import type { ExtractionStrategy, ExtractionOptions, ExtractionResult } from "@struktur/sdk";

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
# Extract with agent (default) — no --strategy needed
struktur extract --input ./document.pdf --schema ./schema.json

# Extract with specific model
struktur extract -i document.txt -s schema.json -m anthropic/claude-sonnet-4

# Extract with max steps limit
struktur extract -i docs.pdf -s schema.json -m anthropic/claude-sonnet-4 --max-steps 30

# Extract with inline text
struktur extract -t "Invoice #1234, total $99" -f "invoice_number, total:number"

# Use traditional strategy (for specific cases)
struktur extract -i docs.txt -s schema.json -S parallel --chunk-size 8000

# Pipe stdin
cat document.txt | struktur extract -f "title, summary" -m anthropic/claude-sonnet-4

# Debug mode (verbose JSON logs to stderr)
struktur extract --debug -t "text" -s schema.json

# Model management
struktur models list
struktur models use anthropic/claude-sonnet-4          # set default model
struktur models alias set fast anthropic/claude-haiku-4
struktur models alias set smart anthropic/claude-opus-4
struktur extract -t "text" -f "title" -m fast  # use alias

# Provider setup
struktur providers add anthropic --token sk-ant-...
struktur providers add openai --token sk-...
struktur providers list
```

**Model format**: `provider/model-name`  
**Providers**: `anthropic`, `openai`, `google`, `opencode`, `openrouter`  
**OpenRouter provider routing**: `openrouter/anthropic/claude-3.5-sonnet#cerebras`

## Agent TUI

When using the agent strategy in the CLI, you'll see a live TUI showing:

```
  ◈  Read manifest.json
  ◉  Grep "property"  in artifact.json
  ◐  Set Output  {"real_estate_property":{"name":"Dock 100"...
  ◆  Bash: head -20 /artifacts/artifact.json
  ▸  Now let me add the building details
  ◑  Update Output  {"buildings":[...
⠋ Agent: completing...
```

**Icons:**
- ▸ model thinking/exploring
- ◈ read file / agent lifecycle
- ◆ bash command
- ◉ grep search
- ◊ find files
- ◇ list directory
- ◐ set output data
- ◑ update output data
- ◒ finish extraction
- ◓ fail extraction

## Internal Architecture

**Agent Strategy:**
```
extract()
  → agent.run()
     → VirtualFilesystem         (src/agent-strategy/ArtifactFilesystem.ts)
        → Tool definitions       (src/agent-strategy/AgentTools.ts)
           → Agent session       (@mariozechner/pi-coding-agent)
              → Tool calls       (read, grep, find, ls, bash)
              → Output updates   (set_output_data, update_output_data)
                 → Validation    (schema check + retry)
                    → finish()   (return validated JSON)
```

**Traditional Strategies:**
```
extract()
  → strategy.run()
     → batchArtifacts() / splitArtifact()   (src/chunking/)
        → buildExtractorPrompt()             (src/prompts/)
           → runWithRetries()                (src/llm/)
              → generateStructured()         (Vercel AI SDK)
               → schema validation / retry
              → merge / dedupe               (src/merge/)
```

**Key modules**:
- `packages/agent-strategy/` — Agent strategy with virtual filesystem
- `packages/sdk/src/strategies/` — Traditional strategy implementations
- `packages/sdk/src/artifacts/` — `fileToArtifact`, `urlToArtifact`, `parseInputToArtifacts`
- `packages/sdk/src/chunking/` — `ArtifactSplitter`, `ArtifactBatcher`
- `packages/sdk/src/llm/` — `LLMClient`, `RetryingRunner`, `models`
- `packages/sdk/src/prompts/` — `ExtractorPrompt`, `SequentialExtractorPrompt`, `ParallelMergerPrompt`
- `packages/sdk/src/merge/` — `SmartDataMerger`, `Deduplicator`
- `packages/sdk/src/validation/` — schema validator, `SchemaValidationError`
- `packages/sdk/src/auth/` — token storage, alias/default model config
- `packages/sdk/src/debug/` — structured JSON logger

## Patterns

**Agent strategy best practices:**
- Always try agent first — it's the default for a reason
- Use models with strong tool-calling (Claude 3.5 Sonnet, GPT-4o)
- Adjust `maxSteps` if the agent needs more exploration time (default: 50)
- Use traditional strategies only when you need predictable costs or specific chunking

**Merge rules** (SmartDataMerger): arrays concatenate, objects shallow-merge, scalars prefer newest value.

**Validation retries**: `runWithRetries` feeds validation errors back to the LLM (max 3 attempts). `onRetry` fires with `{ attempt, maxAttempts, reason }`.

**Token budget**: `chunkSize` is in tokens. Default `10_000`. Images default to 1000 tokens each. Adjust `maxImages` to control multimodal batch costs.

**Schema strict mode**: Pass `strict: true` to use OpenAI's `strictJsonSchema` — requires `additionalProperties: false` everywhere and no `$ref`.

**Fields shorthand** builds a JSON Schema automatically. Use for quick CLIs or simple schemas; use `JSONSchemaType<T>` for full type inference.

**Debug logs**: Single-line JSON to stderr. Types include `cli_init`, `artifacts_loaded`, `batching_complete`, `llm_call_start`, `llm_call_complete`, `validation_failed`, `retry`, `merge_start`, `extraction_complete`.

## Tests

```bash
bun test                        # run all tests
bun test packages/agent-strategy/  # agent strategy tests
bun test packages/sdk/src/strategies/  # traditional strategy tests
```

Tests are colocated: `foo.ts` → `foo.test.ts`. Add or update tests whenever behavior changes.
