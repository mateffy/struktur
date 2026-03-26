import{j as e,aE as d,ax as a,ay as n,az as r,aC as l,aD as i}from"./main-CiUJ7M4r.js";let c=`

import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';

The **Agent** strategy is the default and recommended way to use Struktur. It gives the LLM a virtual filesystem and lets it autonomously decide how to extract your data.

For documents where you need more control, Struktur also provides alternative strategies that use fixed chunking and parallelism patterns.

Strategy comparison [#strategy-comparison]

| Strategy              | Speed    | Context  | Arrays        | Token Cost | Best For           |
| --------------------- | -------- | -------- | ------------- | ---------- | ------------------ |
| \`agent\` (default)     | Adaptive | Adaptive | Automatic     | Varies     | **Most documents** |
| \`simple\`              | Fastest  | Full     | —             | Lowest     | Small inputs       |
| \`parallel\`            | Fast     | None     | LLM merge     | Medium     | Speed priority     |
| \`sequential\`          | Medium   | Full     | Context       | Medium     | Context-dependent  |
| \`parallelAutoMerge\`   | Fast     | None     | Auto + dedupe | Medium     | Large arrays       |
| \`sequentialAutoMerge\` | Medium   | Full     | Auto + dedupe | Medium     | Ordered arrays     |
| \`doublePass\`          | Slow     | Full     | LLM merge     | High       | Maximum quality    |
| \`doublePassAutoMerge\` | Slow     | Full     | Auto + dedupe | High       | Quality + arrays   |

***

Agent (Default) [#agent-default]

<Callout type="info">
  **The Agent strategy is the default.** You don't need to specify \`--strategy agent\` — it's used automatically when you run \`struktur extract\`.
</Callout>

Autonomous extraction using a virtual filesystem. The agent decides when to read files, search for patterns, and build output incrementally.

<Cards>
  <Card title="Best For" description="Most documents — adapts automatically" />

  <Card title="Virtual FS" description="read, grep, find, ls, bash" />

  <Card title="Output Tools" description="set_output_data, update_output_data" />

  <Card title="Model Requirement" description="Must support tool calling" />
</Cards>

How it works [#how-it-works]

1. **Document loaded** into virtual filesystem (\`/artifacts/artifact.json\`, \`/artifacts/manifest.json\`, \`/artifacts/images/\`)
2. **Agent explores** using tools: read files, grep for patterns, list directories, execute commands
3. **Incremental extraction** — calls \`set_output_data\` when first data found, \`update_output_data\` as more discovered
4. **Validation** — schema validation on every output update, with automatic retry on errors
5. **Completion** — agent calls \`finish\` when done, or \`fail\` if extraction impossible

The agent adapts to your document:

* **Small documents** — reads everything at once
* **Large documents** — navigates systematically, searching for relevant sections
* **Complex schemas** — builds output incrementally, validating as it goes

Configuration [#configuration]

<TypeTable
  type={{
  provider: {
    description: 'Provider name (e.g., anthropic, openai)',
    type: 'string',
    required: true,
  },
  modelId: {
    description: 'Model identifier (e.g., claude-sonnet-4, gpt-4o)',
    type: 'string',
    required: true,
  },
  maxSteps: {
    description: 'Maximum agent steps/turns',
    type: 'number',
    default: '50',
    required: false,
  },
  apiKey: {
    description: 'API key (or use env vars)',
    type: 'string',
    required: false,
  },
  outputInstructions: {
    description: 'Additional extraction guidance',
    type: 'string',
    required: false,
  },
  systemPrompt: {
    description: 'Override default system prompt',
    type: 'string',
    required: false,
  },
}}
/>

Example [#example]

<Tabs items={['CLI', 'SDK']}>
  <Tab value="CLI">
    \`\`\`bash
    # Agent is the default — no --strategy needed
    struktur extract --input ./document.pdf \\
      --schema ./schema.json \\
      --model anthropic/claude-sonnet-4

    # With max steps limit
    struktur extract --input ./document.pdf \\
      --schema ./schema.json \\
      --model anthropic/claude-sonnet-4 \\
      --max-steps 30
    \`\`\`
  </Tab>

  <Tab value="SDK">
    \`\`\`ts
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
    \`\`\`
  </Tab>
</Tabs>

When to use [#when-to-use]

* **Always try agent first** — it's the default for a reason
* Works well for most document types and sizes
* Automatically adapts to document structure
* Best for complex schemas with nested objects

Model compatibility (March 2026) [#model-compatibility-march-2026]

The agent requires models that support tool/function calling:

| Provider  | Compatible Models (2026)                             |
| --------- | ---------------------------------------------------- |
| Anthropic | Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5 |
| OpenAI    | GPT-5.4, GPT-5.4 Pro, GPT-5.2, GPT-4o                |
| Google    | Gemini 3.1 Pro, Gemini 2.5 Pro, Gemini 2.5 Flash     |
| xAI       | Grok 4, Grok 4 Beta                                  |
| Mistral   | Mistral Large 3, Mistral Medium 3, Mistral Small 3.1 |

Recommended models for extraction [#recommended-models-for-extraction]

| Use Case              | Model             | Cost (per 1M tokens) | Why                              |
| --------------------- | ----------------- | -------------------- | -------------------------------- |
| **Best quality**      | Claude Sonnet 4.6 | $3/$15               | Best balance of quality and cost |
| **Latest frontier**   | GPT-5.4           | $2.50/$15            | Native computer use, 1M context  |
| **Large docs**        | Gemini 3.1 Pro    | $2/$12               | 2M token context                 |
| **Budget extraction** | Mistral Small 3.1 | $0.20/$0.60          | Cheapest capable                 |

OpenRouter budget picks [#openrouter-budget-picks]

| Model                        | Cost    | Best For                   |
| ---------------------------- | ------- | -------------------------- |
| Qwen3-235B-Thinking          | \\~$0.30 | Best reasoning at low cost |
| google/gemini-2.0-flash-lite | $0.25   | Fast, cheap, vision        |
| mistralai/mistral-small-2603 | $0.15   | Best price/quality         |
| deepseek/deepseek-chat       | \\~$0.28 | Excellent reasoning        |

<Callout type="warn">
  Some models claim tool support but don't work well with the agent. Avoid: older GPT-4o-mini (inconsistent tool calling), GPT-3.5 models.
</Callout>

Virtual filesystem [#virtual-filesystem]

The agent has access to a virtual filesystem containing:

* \`/artifacts/artifact.json\` — All artifacts in JSON format (images replaced by virtual paths)
* \`/artifacts/manifest.json\` — Summary and metadata
* \`/artifacts/images/\` — Extracted image files (when artifacts have embedded images)

The agent can:

* **Read** files with pagination (\`offset\`, \`limit\`)
* **Grep** for patterns
* **Find** files by name
* **List** directories
* **Bash** execute commands (on virtual filesystem only)

Output management [#output-management]

Special tools for building extraction output:

* **\`set_output_data(data)\`** — Set initial output (first time data is found)
* **\`update_output_data(changes)\`** — Merge changes into existing output
* **\`finish()\`** — Complete extraction (only works if data validates)
* **\`fail(reason)\`** — Mark extraction as impossible

The agent is encouraged to update output continuously as it explores, not wait until the end.

***

Simple [#simple]

Single-shot extraction for small inputs. Use when the agent is overkill for tiny documents.

<Cards>
  <Card title="LLM Calls" description="1" />

  <Card title="Parallelism" description="None" />

  <Card title="Best for" description="Small, single-chunk inputs" />
</Cards>

Configuration [#configuration-1]

<TypeTable
  type={{
  model: {
    description: 'Model instance from @ai-sdk/*',
    type: 'LanguageModel',
    required: true,
  },
  outputInstructions: {
    description: 'Extra instructions for the model',
    type: 'string',
    required: false,
  },
  strict: {
    description: 'Always true for simple (single-shot, no intermediate steps)',
    type: 'boolean',
    default: 'true',
    required: false,
  },
}}
/>

Algorithm [#algorithm]

1. Build extraction prompt from artifacts + schema
2. Send to LLM
3. Validate output against the schema
4. Retry on validation failure (up to 3 attempts)
5. Return validated output

Example [#example-1]

<Tabs items={['CLI', 'SDK']}>
  <Tab value="CLI">
    \`\`\`bash
    struktur extract --input document.txt --schema schema.json --strategy simple
    \`\`\`
  </Tab>

  <Tab value="SDK">
    \`\`\`js
    import { extract, simple } from "@struktur/sdk";
    import { openai } from "@ai-sdk/openai";

    const result = await extract({
      artifacts,
      schema,
      strategy: simple({
        model: openai("gpt-4o-mini"),
      }),
    });
    \`\`\`
  </Tab>
</Tabs>

When to use [#when-to-use-1]

* Document fits within the model's context window (\\~10k tokens)
* Simple schema without nested arrays
* Testing or prototyping
* Speed is the priority
* When you want predictable token costs (agent costs vary by document)

***

Parallel [#parallel]

Concurrent batch processing with LLM merge.

<Cards>
  <Card title="LLM Calls" description="N batches + 1 merge" />

  <Card title="Parallelism" description="Full" />

  <Card title="Best for" description="Large inputs, speed priority" />
</Cards>

Configuration [#configuration-2]

<TypeTable
  type={{
  model: {
    description: 'Model for extraction',
    type: 'LanguageModel',
    required: true,
  },
  mergeModel: {
    description: 'Model for merging partial results',
    type: 'LanguageModel',
    required: true,
  },
  chunkSize: {
    description: 'Token budget per batch',
    type: 'number',
    required: true,
  },
  concurrency: {
    description: 'Max parallel batches',
    type: 'number',
    default: 'All batches',
    required: false,
  },
  maxImages: {
    description: 'Max images per batch',
    type: 'number',
    default: 'Unlimited',
    required: false,
  },
  outputInstructions: {
    description: 'Extra instructions',
    type: 'string',
    required: false,
  },
  strict: {
    description: 'Validate required fields on every step',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}}
/>

Algorithm [#algorithm-1]

1. Split artifacts into batches (respecting \`chunkSize\` and \`maxImages\`)
2. Extract from each batch concurrently
3. Validate each batch output with retry
4. Send all partial results to \`mergeModel\` for LLM merge
5. Validate merged output
6. Return final result

Example [#example-2]

<Tabs items={['CLI', 'SDK']}>
  <Tab value="CLI">
    \`\`\`bash
    struktur extract --input large.pdf --schema schema.json --strategy parallel --model openai/gpt-4o-mini
    \`\`\`
  </Tab>

  <Tab value="SDK">
    \`\`\`js
    import { extract, parallel } from "@struktur/sdk";
    import { openai } from "@ai-sdk/openai";

    const result = await extract({
      artifacts,
      schema,
      strategy: parallel({
        model: openai("gpt-4o-mini"),
        mergeModel: openai("gpt-4o-mini"),
        chunkSize: 10000,
        concurrency: 3,
      }),
    });
    \`\`\`
  </Tab>
</Tabs>

When to use [#when-to-use-2]

* Speed is the top priority
* Chunks are relatively independent
* Many documents to process
* Can accept potential loss of cross-chunk context
* When agent costs are too high for your use case

***

Sequential [#sequential]

Process chunks in order with context preservation.

<Cards>
  <Card title="LLM Calls" description="N batches" />

  <Card title="Parallelism" description="None" />

  <Card title="Best for" description="Context-dependent documents" />
</Cards>

Configuration [#configuration-3]

<TypeTable
  type={{
  model: {
    description: 'Model for extraction',
    type: 'LanguageModel',
    required: true,
  },
  chunkSize: {
    description: 'Token budget per batch',
    type: 'number',
    required: true,
  },
  maxImages: {
    description: 'Max images per batch',
    type: 'number',
    default: 'Unlimited',
    required: false,
  },
  outputInstructions: {
    description: 'Extra instructions',
    type: 'string',
    required: false,
  },
  strict: {
    description: 'Validate required fields on every step',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}}
/>

Algorithm [#algorithm-2]

1. Split artifacts into batches
2. For each batch in order:
   * Build prompt including previous extraction result as context
   * Extract from batch
   * Validate with retry
   * Store result for next iteration
3. Return final result

Example [#example-3]

<Tabs items={['CLI', 'SDK']}>
  <Tab value="CLI">
    \`\`\`bash
    struktur extract --input report.pdf --schema schema.json --strategy sequential --model openai/gpt-4o-mini
    \`\`\`
  </Tab>

  <Tab value="SDK">
    \`\`\`js
    import { extract, sequential } from "@struktur/sdk";
    import { openai } from "@ai-sdk/openai";

    const result = await extract({
      artifacts,
      schema,
      strategy: sequential({
        model: openai("gpt-4o-mini"),
        chunkSize: 10000,
      }),
    });
    \`\`\`
  </Tab>
</Tabs>

When to use [#when-to-use-3]

* Context between chunks matters
* Building data incrementally (e.g., accumulating line items)
* Later sections reference earlier sections
* Need better accuracy than parallel
* Agent is making too many tool calls for your document structure

***

Auto-Merge Strategies [#auto-merge-strategies]

<Callout type="info">
  Strategies with "AutoMerge" in the name use schema-aware merge and deduplication. They're ideal for extracting arrays that may have duplicates across chunks.
</Callout>

parallelAutoMerge [#parallelautomerge]

Parallel extraction with schema-aware merge and deduplication.

**Best for:** Array extraction from large inputs where speed matters.

sequentialAutoMerge [#sequentialautomerge]

Sequential extraction with schema-aware merge and deduplication.

**Best for:** Ordered array extraction where context matters.

doublePassAutoMerge [#doublepassautomerge]

Double-pass extraction with schema-aware merge and deduplication.

**Best for:** Large array extraction with maximum quality requirement.

***

Choosing a Strategy [#choosing-a-strategy]

**Start with the Agent.** It's the default because it works best for most documents.

| Strategy              | When to use                                                |
| --------------------- | ---------------------------------------------------------- |
| \`agent\` (default)     | **Start here** — autonomous exploration for most documents |
| \`simple\`              | Small input, fits in one context window, predictable costs |
| \`parallel\`            | Large input, order doesn't matter, speed priority          |
| \`sequential\`          | Large input, context carries across chunks                 |
| \`parallelAutoMerge\`   | Large input with arrays — parallel + dedup                 |
| \`sequentialAutoMerge\` | Large input with arrays — sequential + dedup               |
| \`doublePass\`          | Quality matters, two-pass refinement                       |
| \`doublePassAutoMerge\` | Quality + arrays + dedup                                   |

Quick decision flowchart [#quick-decision-flowchart]

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Try Agent first?}
    B -->|Yes| C[Use agent — default]
    B -->|Need fixed costs| D{Input fits in context?}
    D -->|Yes| E[Use simple]
    D -->|No| F{Extracting arrays?}
    F -->|Yes| G{Cross-chunk context matters?}
    F -->|No| H{Cross-chunk context matters?}
    G -->|Yes| I[sequentialAutoMerge or doublePassAutoMerge]
    G -->|No| J[parallelAutoMerge]
    H -->|Yes| K[sequential or doublePass]
    H -->|No| L[parallel]
\`\`\`

***

See also [#see-also]

* [The Extraction Pipeline](/docs/explanation/pipeline) — where strategies fit
* [Chunking & Token Budgets](/docs/explanation/chunking) — how batches are formed
* [Validation & Retries](/docs/explanation/validation) — the retry loop
`,u={title:"Extraction Strategies",description:"The Agent strategy uses autonomous exploration. Other strategies are available for specific use cases."},p={contents:[{heading:void 0,content:"The **Agent** strategy is the default and recommended way to use Struktur. It gives the LLM a virtual filesystem and lets it autonomously decide how to extract your data."},{heading:void 0,content:"For documents where you need more control, Struktur also provides alternative strategies that use fixed chunking and parallelism patterns."},{heading:"strategy-comparison",content:"Strategy"},{heading:"strategy-comparison",content:"Speed"},{heading:"strategy-comparison",content:"Context"},{heading:"strategy-comparison",content:"Arrays"},{heading:"strategy-comparison",content:"Token Cost"},{heading:"strategy-comparison",content:"Best For"},{heading:"strategy-comparison",content:"`agent` (default)"},{heading:"strategy-comparison",content:"Adaptive"},{heading:"strategy-comparison",content:"Adaptive"},{heading:"strategy-comparison",content:"Automatic"},{heading:"strategy-comparison",content:"Varies"},{heading:"strategy-comparison",content:"**Most documents**"},{heading:"strategy-comparison",content:"`simple`"},{heading:"strategy-comparison",content:"Fastest"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"—"},{heading:"strategy-comparison",content:"Lowest"},{heading:"strategy-comparison",content:"Small inputs"},{heading:"strategy-comparison",content:"`parallel`"},{heading:"strategy-comparison",content:"Fast"},{heading:"strategy-comparison",content:"None"},{heading:"strategy-comparison",content:"LLM merge"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Speed priority"},{heading:"strategy-comparison",content:"`sequential`"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"Context"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Context-dependent"},{heading:"strategy-comparison",content:"`parallelAutoMerge`"},{heading:"strategy-comparison",content:"Fast"},{heading:"strategy-comparison",content:"None"},{heading:"strategy-comparison",content:"Auto + dedupe"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Large arrays"},{heading:"strategy-comparison",content:"`sequentialAutoMerge`"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"Auto + dedupe"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Ordered arrays"},{heading:"strategy-comparison",content:"`doublePass`"},{heading:"strategy-comparison",content:"Slow"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"LLM merge"},{heading:"strategy-comparison",content:"High"},{heading:"strategy-comparison",content:"Maximum quality"},{heading:"strategy-comparison",content:"`doublePassAutoMerge`"},{heading:"strategy-comparison",content:"Slow"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"Auto + dedupe"},{heading:"strategy-comparison",content:"High"},{heading:"strategy-comparison",content:"Quality + arrays"},{heading:"agent-default",content:"**The Agent strategy is the default.** You don't need to specify `--strategy agent` — it's used automatically when you run `struktur extract`."},{heading:"agent-default",content:"Autonomous extraction using a virtual filesystem. The agent decides when to read files, search for patterns, and build output incrementally."},{heading:"agent-default",content:'<Card title="Best For" description="Most documents — adapts automatically" />'},{heading:"agent-default",content:'<Card title="Virtual FS" description="read, grep, find, ls, bash" />'},{heading:"agent-default",content:'<Card title="Output Tools" description="set_output_data, update_output_data" />'},{heading:"agent-default",content:'<Card title="Model Requirement" description="Must support tool calling" />'},{heading:"how-it-works",content:"**Document loaded** into virtual filesystem (`/artifacts/artifact.json`, `/artifacts/manifest.json`, `/artifacts/images/`)"},{heading:"how-it-works",content:"**Agent explores** using tools: read files, grep for patterns, list directories, execute commands"},{heading:"how-it-works",content:"**Incremental extraction** — calls `set_output_data` when first data found, `update_output_data` as more discovered"},{heading:"how-it-works",content:"**Validation** — schema validation on every output update, with automatic retry on errors"},{heading:"how-it-works",content:"**Completion** — agent calls `finish` when done, or `fail` if extraction impossible"},{heading:"how-it-works",content:"The agent adapts to your document:"},{heading:"how-it-works",content:"**Small documents** — reads everything at once"},{heading:"how-it-works",content:"**Large documents** — navigates systematically, searching for relevant sections"},{heading:"how-it-works",content:"**Complex schemas** — builds output incrementally, validating as it goes"},{heading:"configuration",content:`<TypeTable
  type="{
  provider: {
    description: 'Provider name (e.g., anthropic, openai)',
    type: 'string',
    required: true,
  },
  modelId: {
    description: 'Model identifier (e.g., claude-sonnet-4, gpt-4o)',
    type: 'string',
    required: true,
  },
  maxSteps: {
    description: 'Maximum agent steps/turns',
    type: 'number',
    default: '50',
    required: false,
  },
  apiKey: {
    description: 'API key (or use env vars)',
    type: 'string',
    required: false,
  },
  outputInstructions: {
    description: 'Additional extraction guidance',
    type: 'string',
    required: false,
  },
  systemPrompt: {
    description: 'Override default system prompt',
    type: 'string',
    required: false,
  },
}"
/>`},{heading:"when-to-use",content:"**Always try agent first** — it's the default for a reason"},{heading:"when-to-use",content:"Works well for most document types and sizes"},{heading:"when-to-use",content:"Automatically adapts to document structure"},{heading:"when-to-use",content:"Best for complex schemas with nested objects"},{heading:"model-compatibility-march-2026",content:"The agent requires models that support tool/function calling:"},{heading:"model-compatibility-march-2026",content:"Provider"},{heading:"model-compatibility-march-2026",content:"Compatible Models (2026)"},{heading:"model-compatibility-march-2026",content:"Anthropic"},{heading:"model-compatibility-march-2026",content:"Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5"},{heading:"model-compatibility-march-2026",content:"OpenAI"},{heading:"model-compatibility-march-2026",content:"GPT-5.4, GPT-5.4 Pro, GPT-5.2, GPT-4o"},{heading:"model-compatibility-march-2026",content:"Google"},{heading:"model-compatibility-march-2026",content:"Gemini 3.1 Pro, Gemini 2.5 Pro, Gemini 2.5 Flash"},{heading:"model-compatibility-march-2026",content:"xAI"},{heading:"model-compatibility-march-2026",content:"Grok 4, Grok 4 Beta"},{heading:"model-compatibility-march-2026",content:"Mistral"},{heading:"model-compatibility-march-2026",content:"Mistral Large 3, Mistral Medium 3, Mistral Small 3.1"},{heading:"recommended-models-for-extraction",content:"Use Case"},{heading:"recommended-models-for-extraction",content:"Model"},{heading:"recommended-models-for-extraction",content:"Cost (per 1M tokens)"},{heading:"recommended-models-for-extraction",content:"Why"},{heading:"recommended-models-for-extraction",content:"**Best quality**"},{heading:"recommended-models-for-extraction",content:"Claude Sonnet 4.6"},{heading:"recommended-models-for-extraction",content:"$3/$15"},{heading:"recommended-models-for-extraction",content:"Best balance of quality and cost"},{heading:"recommended-models-for-extraction",content:"**Latest frontier**"},{heading:"recommended-models-for-extraction",content:"GPT-5.4"},{heading:"recommended-models-for-extraction",content:"$2.50/$15"},{heading:"recommended-models-for-extraction",content:"Native computer use, 1M context"},{heading:"recommended-models-for-extraction",content:"**Large docs**"},{heading:"recommended-models-for-extraction",content:"Gemini 3.1 Pro"},{heading:"recommended-models-for-extraction",content:"$2/$12"},{heading:"recommended-models-for-extraction",content:"2M token context"},{heading:"recommended-models-for-extraction",content:"**Budget extraction**"},{heading:"recommended-models-for-extraction",content:"Mistral Small 3.1"},{heading:"recommended-models-for-extraction",content:"$0.20/$0.60"},{heading:"recommended-models-for-extraction",content:"Cheapest capable"},{heading:"openrouter-budget-picks",content:"Model"},{heading:"openrouter-budget-picks",content:"Cost"},{heading:"openrouter-budget-picks",content:"Best For"},{heading:"openrouter-budget-picks",content:"Qwen3-235B-Thinking"},{heading:"openrouter-budget-picks",content:"\\~$0.30"},{heading:"openrouter-budget-picks",content:"Best reasoning at low cost"},{heading:"openrouter-budget-picks",content:"google/gemini-2.0-flash-lite"},{heading:"openrouter-budget-picks",content:"$0.25"},{heading:"openrouter-budget-picks",content:"Fast, cheap, vision"},{heading:"openrouter-budget-picks",content:"mistralai/mistral-small-2603"},{heading:"openrouter-budget-picks",content:"$0.15"},{heading:"openrouter-budget-picks",content:"Best price/quality"},{heading:"openrouter-budget-picks",content:"deepseek/deepseek-chat"},{heading:"openrouter-budget-picks",content:"\\~$0.28"},{heading:"openrouter-budget-picks",content:"Excellent reasoning"},{heading:"openrouter-budget-picks",content:"Some models claim tool support but don't work well with the agent. Avoid: older GPT-4o-mini (inconsistent tool calling), GPT-3.5 models."},{heading:"virtual-filesystem",content:"The agent has access to a virtual filesystem containing:"},{heading:"virtual-filesystem",content:"`/artifacts/artifact.json` — All artifacts in JSON format (images replaced by virtual paths)"},{heading:"virtual-filesystem",content:"`/artifacts/manifest.json` — Summary and metadata"},{heading:"virtual-filesystem",content:"`/artifacts/images/` — Extracted image files (when artifacts have embedded images)"},{heading:"virtual-filesystem",content:"The agent can:"},{heading:"virtual-filesystem",content:"**Read** files with pagination (`offset`, `limit`)"},{heading:"virtual-filesystem",content:"**Grep** for patterns"},{heading:"virtual-filesystem",content:"**Find** files by name"},{heading:"virtual-filesystem",content:"**List** directories"},{heading:"virtual-filesystem",content:"**Bash** execute commands (on virtual filesystem only)"},{heading:"output-management",content:"Special tools for building extraction output:"},{heading:"output-management",content:"**`set_output_data(data)`** — Set initial output (first time data is found)"},{heading:"output-management",content:"**`update_output_data(changes)`** — Merge changes into existing output"},{heading:"output-management",content:"**`finish()`** — Complete extraction (only works if data validates)"},{heading:"output-management",content:"**`fail(reason)`** — Mark extraction as impossible"},{heading:"output-management",content:"The agent is encouraged to update output continuously as it explores, not wait until the end."},{heading:"simple",content:"Single-shot extraction for small inputs. Use when the agent is overkill for tiny documents."},{heading:"simple",content:'<Card title="LLM Calls" description="1" />'},{heading:"simple",content:'<Card title="Parallelism" description="None" />'},{heading:"simple",content:'<Card title="Best for" description="Small, single-chunk inputs" />'},{heading:"configuration-1",content:`<TypeTable
  type="{
  model: {
    description: 'Model instance from @ai-sdk/*',
    type: 'LanguageModel',
    required: true,
  },
  outputInstructions: {
    description: 'Extra instructions for the model',
    type: 'string',
    required: false,
  },
  strict: {
    description: 'Always true for simple (single-shot, no intermediate steps)',
    type: 'boolean',
    default: 'true',
    required: false,
  },
}"
/>`},{heading:"algorithm",content:"Build extraction prompt from artifacts + schema"},{heading:"algorithm",content:"Send to LLM"},{heading:"algorithm",content:"Validate output against the schema"},{heading:"algorithm",content:"Retry on validation failure (up to 3 attempts)"},{heading:"algorithm",content:"Return validated output"},{heading:"when-to-use-1",content:"Document fits within the model's context window (\\~10k tokens)"},{heading:"when-to-use-1",content:"Simple schema without nested arrays"},{heading:"when-to-use-1",content:"Testing or prototyping"},{heading:"when-to-use-1",content:"Speed is the priority"},{heading:"when-to-use-1",content:"When you want predictable token costs (agent costs vary by document)"},{heading:"parallel",content:"Concurrent batch processing with LLM merge."},{heading:"parallel",content:'<Card title="LLM Calls" description="N batches + 1 merge" />'},{heading:"parallel",content:'<Card title="Parallelism" description="Full" />'},{heading:"parallel",content:'<Card title="Best for" description="Large inputs, speed priority" />'},{heading:"configuration-2",content:`<TypeTable
  type="{
  model: {
    description: 'Model for extraction',
    type: 'LanguageModel',
    required: true,
  },
  mergeModel: {
    description: 'Model for merging partial results',
    type: 'LanguageModel',
    required: true,
  },
  chunkSize: {
    description: 'Token budget per batch',
    type: 'number',
    required: true,
  },
  concurrency: {
    description: 'Max parallel batches',
    type: 'number',
    default: 'All batches',
    required: false,
  },
  maxImages: {
    description: 'Max images per batch',
    type: 'number',
    default: 'Unlimited',
    required: false,
  },
  outputInstructions: {
    description: 'Extra instructions',
    type: 'string',
    required: false,
  },
  strict: {
    description: 'Validate required fields on every step',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}"
/>`},{heading:"algorithm-1",content:"Split artifacts into batches (respecting `chunkSize` and `maxImages`)"},{heading:"algorithm-1",content:"Extract from each batch concurrently"},{heading:"algorithm-1",content:"Validate each batch output with retry"},{heading:"algorithm-1",content:"Send all partial results to `mergeModel` for LLM merge"},{heading:"algorithm-1",content:"Validate merged output"},{heading:"algorithm-1",content:"Return final result"},{heading:"when-to-use-2",content:"Speed is the top priority"},{heading:"when-to-use-2",content:"Chunks are relatively independent"},{heading:"when-to-use-2",content:"Many documents to process"},{heading:"when-to-use-2",content:"Can accept potential loss of cross-chunk context"},{heading:"when-to-use-2",content:"When agent costs are too high for your use case"},{heading:"sequential",content:"Process chunks in order with context preservation."},{heading:"sequential",content:'<Card title="LLM Calls" description="N batches" />'},{heading:"sequential",content:'<Card title="Parallelism" description="None" />'},{heading:"sequential",content:'<Card title="Best for" description="Context-dependent documents" />'},{heading:"configuration-3",content:`<TypeTable
  type="{
  model: {
    description: 'Model for extraction',
    type: 'LanguageModel',
    required: true,
  },
  chunkSize: {
    description: 'Token budget per batch',
    type: 'number',
    required: true,
  },
  maxImages: {
    description: 'Max images per batch',
    type: 'number',
    default: 'Unlimited',
    required: false,
  },
  outputInstructions: {
    description: 'Extra instructions',
    type: 'string',
    required: false,
  },
  strict: {
    description: 'Validate required fields on every step',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}"
/>`},{heading:"algorithm-2",content:"Split artifacts into batches"},{heading:"algorithm-2",content:"For each batch in order:"},{heading:"algorithm-2",content:"Build prompt including previous extraction result as context"},{heading:"algorithm-2",content:"Extract from batch"},{heading:"algorithm-2",content:"Validate with retry"},{heading:"algorithm-2",content:"Store result for next iteration"},{heading:"algorithm-2",content:"Return final result"},{heading:"when-to-use-3",content:"Context between chunks matters"},{heading:"when-to-use-3",content:"Building data incrementally (e.g., accumulating line items)"},{heading:"when-to-use-3",content:"Later sections reference earlier sections"},{heading:"when-to-use-3",content:"Need better accuracy than parallel"},{heading:"when-to-use-3",content:"Agent is making too many tool calls for your document structure"},{heading:"auto-merge-strategies",content:`Strategies with "AutoMerge" in the name use schema-aware merge and deduplication. They're ideal for extracting arrays that may have duplicates across chunks.`},{heading:"parallelautomerge",content:"Parallel extraction with schema-aware merge and deduplication."},{heading:"parallelautomerge",content:"**Best for:** Array extraction from large inputs where speed matters."},{heading:"sequentialautomerge",content:"Sequential extraction with schema-aware merge and deduplication."},{heading:"sequentialautomerge",content:"**Best for:** Ordered array extraction where context matters."},{heading:"doublepassautomerge",content:"Double-pass extraction with schema-aware merge and deduplication."},{heading:"doublepassautomerge",content:"**Best for:** Large array extraction with maximum quality requirement."},{heading:"choosing-a-strategy",content:"**Start with the Agent.** It's the default because it works best for most documents."},{heading:"choosing-a-strategy",content:"Strategy"},{heading:"choosing-a-strategy",content:"When to use"},{heading:"choosing-a-strategy",content:"`agent` (default)"},{heading:"choosing-a-strategy",content:"**Start here** — autonomous exploration for most documents"},{heading:"choosing-a-strategy",content:"`simple`"},{heading:"choosing-a-strategy",content:"Small input, fits in one context window, predictable costs"},{heading:"choosing-a-strategy",content:"`parallel`"},{heading:"choosing-a-strategy",content:"Large input, order doesn't matter, speed priority"},{heading:"choosing-a-strategy",content:"`sequential`"},{heading:"choosing-a-strategy",content:"Large input, context carries across chunks"},{heading:"choosing-a-strategy",content:"`parallelAutoMerge`"},{heading:"choosing-a-strategy",content:"Large input with arrays — parallel + dedup"},{heading:"choosing-a-strategy",content:"`sequentialAutoMerge`"},{heading:"choosing-a-strategy",content:"Large input with arrays — sequential + dedup"},{heading:"choosing-a-strategy",content:"`doublePass`"},{heading:"choosing-a-strategy",content:"Quality matters, two-pass refinement"},{heading:"choosing-a-strategy",content:"`doublePassAutoMerge`"},{heading:"choosing-a-strategy",content:"Quality + arrays + dedup"},{heading:"see-also",content:"The Extraction Pipeline — where strategies fit"},{heading:"see-also",content:"Chunking & Token Budgets — how batches are formed"},{heading:"see-also",content:"Validation & Retries — the retry loop"}],headings:[{id:"strategy-comparison",content:"Strategy comparison"},{id:"agent-default",content:"Agent (Default)"},{id:"how-it-works",content:"How it works"},{id:"configuration",content:"Configuration"},{id:"example",content:"Example"},{id:"when-to-use",content:"When to use"},{id:"model-compatibility-march-2026",content:"Model compatibility (March 2026)"},{id:"recommended-models-for-extraction",content:"Recommended models for extraction"},{id:"openrouter-budget-picks",content:"OpenRouter budget picks"},{id:"virtual-filesystem",content:"Virtual filesystem"},{id:"output-management",content:"Output management"},{id:"simple",content:"Simple"},{id:"configuration-1",content:"Configuration"},{id:"algorithm",content:"Algorithm"},{id:"example-1",content:"Example"},{id:"when-to-use-1",content:"When to use"},{id:"parallel",content:"Parallel"},{id:"configuration-2",content:"Configuration"},{id:"algorithm-1",content:"Algorithm"},{id:"example-2",content:"Example"},{id:"when-to-use-2",content:"When to use"},{id:"sequential",content:"Sequential"},{id:"configuration-3",content:"Configuration"},{id:"algorithm-2",content:"Algorithm"},{id:"example-3",content:"Example"},{id:"when-to-use-3",content:"When to use"},{id:"auto-merge-strategies",content:"Auto-Merge Strategies"},{id:"parallelautomerge",content:"parallelAutoMerge"},{id:"sequentialautomerge",content:"sequentialAutoMerge"},{id:"doublepassautomerge",content:"doublePassAutoMerge"},{id:"choosing-a-strategy",content:"Choosing a Strategy"},{id:"quick-decision-flowchart",content:"Quick decision flowchart"},{id:"see-also",content:"See also"}]};const g=[{depth:2,url:"#strategy-comparison",title:e.jsx(e.Fragment,{children:"Strategy comparison"})},{depth:2,url:"#agent-default",title:e.jsx(e.Fragment,{children:"Agent (Default)"})},{depth:3,url:"#how-it-works",title:e.jsx(e.Fragment,{children:"How it works"})},{depth:3,url:"#configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#example",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#when-to-use",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:3,url:"#model-compatibility-march-2026",title:e.jsx(e.Fragment,{children:"Model compatibility (March 2026)"})},{depth:3,url:"#recommended-models-for-extraction",title:e.jsx(e.Fragment,{children:"Recommended models for extraction"})},{depth:3,url:"#openrouter-budget-picks",title:e.jsx(e.Fragment,{children:"OpenRouter budget picks"})},{depth:3,url:"#virtual-filesystem",title:e.jsx(e.Fragment,{children:"Virtual filesystem"})},{depth:3,url:"#output-management",title:e.jsx(e.Fragment,{children:"Output management"})},{depth:2,url:"#simple",title:e.jsx(e.Fragment,{children:"Simple"})},{depth:3,url:"#configuration-1",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#example-1",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#when-to-use-1",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#parallel",title:e.jsx(e.Fragment,{children:"Parallel"})},{depth:3,url:"#configuration-2",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm-1",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#example-2",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#when-to-use-2",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#sequential",title:e.jsx(e.Fragment,{children:"Sequential"})},{depth:3,url:"#configuration-3",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm-2",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#example-3",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#when-to-use-3",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#auto-merge-strategies",title:e.jsx(e.Fragment,{children:"Auto-Merge Strategies"})},{depth:3,url:"#parallelautomerge",title:e.jsx(e.Fragment,{children:"parallelAutoMerge"})},{depth:3,url:"#sequentialautomerge",title:e.jsx(e.Fragment,{children:"sequentialAutoMerge"})},{depth:3,url:"#doublepassautomerge",title:e.jsx(e.Fragment,{children:"doublePassAutoMerge"})},{depth:2,url:"#choosing-a-strategy",title:e.jsx(e.Fragment,{children:"Choosing a Strategy"})},{depth:3,url:"#quick-decision-flowchart",title:e.jsx(e.Fragment,{children:"Quick decision flowchart"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function o(s){const t={a:"a",code:"code",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["The ",e.jsx(t.strong,{children:"Agent"})," strategy is the default and recommended way to use Struktur. It gives the LLM a virtual filesystem and lets it autonomously decide how to extract your data."]}),`
`,e.jsx(t.p,{children:"For documents where you need more control, Struktur also provides alternative strategies that use fixed chunking and parallelism patterns."}),`
`,e.jsx(t.h2,{id:"strategy-comparison",children:"Strategy comparison"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Strategy"}),e.jsx(t.th,{children:"Speed"}),e.jsx(t.th,{children:"Context"}),e.jsx(t.th,{children:"Arrays"}),e.jsx(t.th,{children:"Token Cost"}),e.jsx(t.th,{children:"Best For"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"agent"})," (default)"]}),e.jsx(t.td,{children:"Adaptive"}),e.jsx(t.td,{children:"Adaptive"}),e.jsx(t.td,{children:"Automatic"}),e.jsx(t.td,{children:"Varies"}),e.jsx(t.td,{children:e.jsx(t.strong,{children:"Most documents"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"simple"})}),e.jsx(t.td,{children:"Fastest"}),e.jsx(t.td,{children:"Full"}),e.jsx(t.td,{children:"—"}),e.jsx(t.td,{children:"Lowest"}),e.jsx(t.td,{children:"Small inputs"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"parallel"})}),e.jsx(t.td,{children:"Fast"}),e.jsx(t.td,{children:"None"}),e.jsx(t.td,{children:"LLM merge"}),e.jsx(t.td,{children:"Medium"}),e.jsx(t.td,{children:"Speed priority"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"sequential"})}),e.jsx(t.td,{children:"Medium"}),e.jsx(t.td,{children:"Full"}),e.jsx(t.td,{children:"Context"}),e.jsx(t.td,{children:"Medium"}),e.jsx(t.td,{children:"Context-dependent"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"parallelAutoMerge"})}),e.jsx(t.td,{children:"Fast"}),e.jsx(t.td,{children:"None"}),e.jsx(t.td,{children:"Auto + dedupe"}),e.jsx(t.td,{children:"Medium"}),e.jsx(t.td,{children:"Large arrays"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"sequentialAutoMerge"})}),e.jsx(t.td,{children:"Medium"}),e.jsx(t.td,{children:"Full"}),e.jsx(t.td,{children:"Auto + dedupe"}),e.jsx(t.td,{children:"Medium"}),e.jsx(t.td,{children:"Ordered arrays"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"doublePass"})}),e.jsx(t.td,{children:"Slow"}),e.jsx(t.td,{children:"Full"}),e.jsx(t.td,{children:"LLM merge"}),e.jsx(t.td,{children:"High"}),e.jsx(t.td,{children:"Maximum quality"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"doublePassAutoMerge"})}),e.jsx(t.td,{children:"Slow"}),e.jsx(t.td,{children:"Full"}),e.jsx(t.td,{children:"Auto + dedupe"}),e.jsx(t.td,{children:"High"}),e.jsx(t.td,{children:"Quality + arrays"})]})]})]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"agent-default",children:"Agent (Default)"}),`
`,e.jsx(d,{type:"info",children:e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"The Agent strategy is the default."})," You don't need to specify ",e.jsx(t.code,{children:"--strategy agent"})," — it's used automatically when you run ",e.jsx(t.code,{children:"struktur extract"}),"."]})}),`
`,e.jsx(t.p,{children:"Autonomous extraction using a virtual filesystem. The agent decides when to read files, search for patterns, and build output incrementally."}),`
`,e.jsxs(a,{children:[e.jsx(n,{title:"Best For",description:"Most documents — adapts automatically"}),e.jsx(n,{title:"Virtual FS",description:"read, grep, find, ls, bash"}),e.jsx(n,{title:"Output Tools",description:"set_output_data, update_output_data"}),e.jsx(n,{title:"Model Requirement",description:"Must support tool calling"})]}),`
`,e.jsx(t.h3,{id:"how-it-works",children:"How it works"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Document loaded"})," into virtual filesystem (",e.jsx(t.code,{children:"/artifacts/artifact.json"}),", ",e.jsx(t.code,{children:"/artifacts/manifest.json"}),", ",e.jsx(t.code,{children:"/artifacts/images/"}),")"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Agent explores"})," using tools: read files, grep for patterns, list directories, execute commands"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Incremental extraction"})," — calls ",e.jsx(t.code,{children:"set_output_data"})," when first data found, ",e.jsx(t.code,{children:"update_output_data"})," as more discovered"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Validation"})," — schema validation on every output update, with automatic retry on errors"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Completion"})," — agent calls ",e.jsx(t.code,{children:"finish"})," when done, or ",e.jsx(t.code,{children:"fail"})," if extraction impossible"]}),`
`]}),`
`,e.jsx(t.p,{children:"The agent adapts to your document:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Small documents"})," — reads everything at once"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Large documents"})," — navigates systematically, searching for relevant sections"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Complex schemas"})," — builds output incrementally, validating as it goes"]}),`
`]}),`
`,e.jsx(t.h3,{id:"configuration",children:"Configuration"}),`
`,e.jsx(r,{type:{provider:{description:"Provider name (e.g., anthropic, openai)",type:"string",required:!0},modelId:{description:"Model identifier (e.g., claude-sonnet-4, gpt-4o)",type:"string",required:!0},maxSteps:{description:"Maximum agent steps/turns",type:"number",default:"50",required:!1},apiKey:{description:"API key (or use env vars)",type:"string",required:!1},outputInstructions:{description:"Additional extraction guidance",type:"string",required:!1},systemPrompt:{description:"Override default system prompt",type:"string",required:!1}}}),`
`,e.jsx(t.h3,{id:"example",children:"Example"}),`
`,e.jsxs(l,{items:["CLI","SDK"],children:[e.jsx(i,{value:"CLI",children:e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Agent is the default — no --strategy needed"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --input"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./document.pdf"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  --schema"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./schema.json"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  --model"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" anthropic/claude-sonnet-4"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# With max steps limit"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --input"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./document.pdf"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  --schema"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./schema.json"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  --model"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" anthropic/claude-sonnet-4"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  --max-steps"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 30"})]})]})})})}),e.jsx(i,{value:"SDK",children:e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, agent } "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"agent"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    provider: "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"anthropic"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    modelId: "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"claude-sonnet-4"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    maxSteps: "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"50"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})})})]}),`
`,e.jsx(t.h3,{id:"when-to-use",children:"When to use"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Always try agent first"})," — it's the default for a reason"]}),`
`,e.jsx(t.li,{children:"Works well for most document types and sizes"}),`
`,e.jsx(t.li,{children:"Automatically adapts to document structure"}),`
`,e.jsx(t.li,{children:"Best for complex schemas with nested objects"}),`
`]}),`
`,e.jsx(t.h3,{id:"model-compatibility-march-2026",children:"Model compatibility (March 2026)"}),`
`,e.jsx(t.p,{children:"The agent requires models that support tool/function calling:"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Provider"}),e.jsx(t.th,{children:"Compatible Models (2026)"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Anthropic"}),e.jsx(t.td,{children:"Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"OpenAI"}),e.jsx(t.td,{children:"GPT-5.4, GPT-5.4 Pro, GPT-5.2, GPT-4o"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Google"}),e.jsx(t.td,{children:"Gemini 3.1 Pro, Gemini 2.5 Pro, Gemini 2.5 Flash"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"xAI"}),e.jsx(t.td,{children:"Grok 4, Grok 4 Beta"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Mistral"}),e.jsx(t.td,{children:"Mistral Large 3, Mistral Medium 3, Mistral Small 3.1"})]})]})]}),`
`,e.jsx(t.h3,{id:"recommended-models-for-extraction",children:"Recommended models for extraction"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Use Case"}),e.jsx(t.th,{children:"Model"}),e.jsx(t.th,{children:"Cost (per 1M tokens)"}),e.jsx(t.th,{children:"Why"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Best quality"})}),e.jsx(t.td,{children:"Claude Sonnet 4.6"}),e.jsx(t.td,{children:"$3/$15"}),e.jsx(t.td,{children:"Best balance of quality and cost"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Latest frontier"})}),e.jsx(t.td,{children:"GPT-5.4"}),e.jsx(t.td,{children:"$2.50/$15"}),e.jsx(t.td,{children:"Native computer use, 1M context"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Large docs"})}),e.jsx(t.td,{children:"Gemini 3.1 Pro"}),e.jsx(t.td,{children:"$2/$12"}),e.jsx(t.td,{children:"2M token context"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Budget extraction"})}),e.jsx(t.td,{children:"Mistral Small 3.1"}),e.jsx(t.td,{children:"$0.20/$0.60"}),e.jsx(t.td,{children:"Cheapest capable"})]})]})]}),`
`,e.jsx(t.h3,{id:"openrouter-budget-picks",children:"OpenRouter budget picks"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Model"}),e.jsx(t.th,{children:"Cost"}),e.jsx(t.th,{children:"Best For"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Qwen3-235B-Thinking"}),e.jsx(t.td,{children:"~$0.30"}),e.jsx(t.td,{children:"Best reasoning at low cost"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"google/gemini-2.0-flash-lite"}),e.jsx(t.td,{children:"$0.25"}),e.jsx(t.td,{children:"Fast, cheap, vision"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"mistralai/mistral-small-2603"}),e.jsx(t.td,{children:"$0.15"}),e.jsx(t.td,{children:"Best price/quality"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"deepseek/deepseek-chat"}),e.jsx(t.td,{children:"~$0.28"}),e.jsx(t.td,{children:"Excellent reasoning"})]})]})]}),`
`,e.jsx(d,{type:"warn",children:e.jsx(t.p,{children:"Some models claim tool support but don't work well with the agent. Avoid: older GPT-4o-mini (inconsistent tool calling), GPT-3.5 models."})}),`
`,e.jsx(t.h3,{id:"virtual-filesystem",children:"Virtual filesystem"}),`
`,e.jsx(t.p,{children:"The agent has access to a virtual filesystem containing:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"/artifacts/artifact.json"})," — All artifacts in JSON format (images replaced by virtual paths)"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"/artifacts/manifest.json"})," — Summary and metadata"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"/artifacts/images/"})," — Extracted image files (when artifacts have embedded images)"]}),`
`]}),`
`,e.jsx(t.p,{children:"The agent can:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Read"})," files with pagination (",e.jsx(t.code,{children:"offset"}),", ",e.jsx(t.code,{children:"limit"}),")"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Grep"})," for patterns"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Find"})," files by name"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"List"})," directories"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Bash"})," execute commands (on virtual filesystem only)"]}),`
`]}),`
`,e.jsx(t.h3,{id:"output-management",children:"Output management"}),`
`,e.jsx(t.p,{children:"Special tools for building extraction output:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"set_output_data(data)"})})," — Set initial output (first time data is found)"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"update_output_data(changes)"})})," — Merge changes into existing output"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"finish()"})})," — Complete extraction (only works if data validates)"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"fail(reason)"})})," — Mark extraction as impossible"]}),`
`]}),`
`,e.jsx(t.p,{children:"The agent is encouraged to update output continuously as it explores, not wait until the end."}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"simple",children:"Simple"}),`
`,e.jsx(t.p,{children:"Single-shot extraction for small inputs. Use when the agent is overkill for tiny documents."}),`
`,e.jsxs(a,{children:[e.jsx(n,{title:"LLM Calls",description:"1"}),e.jsx(n,{title:"Parallelism",description:"None"}),e.jsx(n,{title:"Best for",description:"Small, single-chunk inputs"})]}),`
`,e.jsx(t.h3,{id:"configuration-1",children:"Configuration"}),`
`,e.jsx(r,{type:{model:{description:"Model instance from @ai-sdk/*",type:"LanguageModel",required:!0},outputInstructions:{description:"Extra instructions for the model",type:"string",required:!1},strict:{description:"Always true for simple (single-shot, no intermediate steps)",type:"boolean",default:"true",required:!1}}}),`
`,e.jsx(t.h3,{id:"algorithm",children:"Algorithm"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Build extraction prompt from artifacts + schema"}),`
`,e.jsx(t.li,{children:"Send to LLM"}),`
`,e.jsx(t.li,{children:"Validate output against the schema"}),`
`,e.jsx(t.li,{children:"Retry on validation failure (up to 3 attempts)"}),`
`,e.jsx(t.li,{children:"Return validated output"}),`
`]}),`
`,e.jsx(t.h3,{id:"example-1",children:"Example"}),`
`,e.jsxs(l,{items:["CLI","SDK"],children:[e.jsx(i,{value:"CLI",children:e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --input"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" document.txt"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --schema"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --strategy"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" simple"})]})})})})}),e.jsx(i,{value:"SDK",children:e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, simple } "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"simple"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})})})]}),`
`,e.jsx(t.h3,{id:"when-to-use-1",children:"When to use"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Document fits within the model's context window (~10k tokens)"}),`
`,e.jsx(t.li,{children:"Simple schema without nested arrays"}),`
`,e.jsx(t.li,{children:"Testing or prototyping"}),`
`,e.jsx(t.li,{children:"Speed is the priority"}),`
`,e.jsx(t.li,{children:"When you want predictable token costs (agent costs vary by document)"}),`
`]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"parallel",children:"Parallel"}),`
`,e.jsx(t.p,{children:"Concurrent batch processing with LLM merge."}),`
`,e.jsxs(a,{children:[e.jsx(n,{title:"LLM Calls",description:"N batches + 1 merge"}),e.jsx(n,{title:"Parallelism",description:"Full"}),e.jsx(n,{title:"Best for",description:"Large inputs, speed priority"})]}),`
`,e.jsx(t.h3,{id:"configuration-2",children:"Configuration"}),`
`,e.jsx(r,{type:{model:{description:"Model for extraction",type:"LanguageModel",required:!0},mergeModel:{description:"Model for merging partial results",type:"LanguageModel",required:!0},chunkSize:{description:"Token budget per batch",type:"number",required:!0},concurrency:{description:"Max parallel batches",type:"number",default:"All batches",required:!1},maxImages:{description:"Max images per batch",type:"number",default:"Unlimited",required:!1},outputInstructions:{description:"Extra instructions",type:"string",required:!1},strict:{description:"Validate required fields on every step",type:"boolean",default:"false",required:!1}}}),`
`,e.jsx(t.h3,{id:"algorithm-1",children:"Algorithm"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Split artifacts into batches (respecting ",e.jsx(t.code,{children:"chunkSize"})," and ",e.jsx(t.code,{children:"maxImages"}),")"]}),`
`,e.jsx(t.li,{children:"Extract from each batch concurrently"}),`
`,e.jsx(t.li,{children:"Validate each batch output with retry"}),`
`,e.jsxs(t.li,{children:["Send all partial results to ",e.jsx(t.code,{children:"mergeModel"})," for LLM merge"]}),`
`,e.jsx(t.li,{children:"Validate merged output"}),`
`,e.jsx(t.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(t.h3,{id:"example-2",children:"Example"}),`
`,e.jsxs(l,{items:["CLI","SDK"],children:[e.jsx(i,{value:"CLI",children:e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --input"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" large.pdf"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --schema"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --strategy"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallel"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --model"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})})}),e.jsx(i,{value:"SDK",children:e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, parallel } "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parallel"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    mergeModel: "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    concurrency: "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})})})]}),`
`,e.jsx(t.h3,{id:"when-to-use-2",children:"When to use"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Speed is the top priority"}),`
`,e.jsx(t.li,{children:"Chunks are relatively independent"}),`
`,e.jsx(t.li,{children:"Many documents to process"}),`
`,e.jsx(t.li,{children:"Can accept potential loss of cross-chunk context"}),`
`,e.jsx(t.li,{children:"When agent costs are too high for your use case"}),`
`]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"sequential",children:"Sequential"}),`
`,e.jsx(t.p,{children:"Process chunks in order with context preservation."}),`
`,e.jsxs(a,{children:[e.jsx(n,{title:"LLM Calls",description:"N batches"}),e.jsx(n,{title:"Parallelism",description:"None"}),e.jsx(n,{title:"Best for",description:"Context-dependent documents"})]}),`
`,e.jsx(t.h3,{id:"configuration-3",children:"Configuration"}),`
`,e.jsx(r,{type:{model:{description:"Model for extraction",type:"LanguageModel",required:!0},chunkSize:{description:"Token budget per batch",type:"number",required:!0},maxImages:{description:"Max images per batch",type:"number",default:"Unlimited",required:!1},outputInstructions:{description:"Extra instructions",type:"string",required:!1},strict:{description:"Validate required fields on every step",type:"boolean",default:"false",required:!1}}}),`
`,e.jsx(t.h3,{id:"algorithm-2",children:"Algorithm"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Split artifacts into batches"}),`
`,e.jsxs(t.li,{children:["For each batch in order:",`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Build prompt including previous extraction result as context"}),`
`,e.jsx(t.li,{children:"Extract from batch"}),`
`,e.jsx(t.li,{children:"Validate with retry"}),`
`,e.jsx(t.li,{children:"Store result for next iteration"}),`
`]}),`
`]}),`
`,e.jsx(t.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(t.h3,{id:"example-3",children:"Example"}),`
`,e.jsxs(l,{items:["CLI","SDK"],children:[e.jsx(i,{value:"CLI",children:e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --input"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" report.pdf"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --schema"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --strategy"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sequential"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --model"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})})}),e.jsx(i,{value:"SDK",children:e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, sequential } "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"sequential"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})})})]}),`
`,e.jsx(t.h3,{id:"when-to-use-3",children:"When to use"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Context between chunks matters"}),`
`,e.jsx(t.li,{children:"Building data incrementally (e.g., accumulating line items)"}),`
`,e.jsx(t.li,{children:"Later sections reference earlier sections"}),`
`,e.jsx(t.li,{children:"Need better accuracy than parallel"}),`
`,e.jsx(t.li,{children:"Agent is making too many tool calls for your document structure"}),`
`]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"auto-merge-strategies",children:"Auto-Merge Strategies"}),`
`,e.jsx(d,{type:"info",children:e.jsx(t.p,{children:`Strategies with "AutoMerge" in the name use schema-aware merge and deduplication. They're ideal for extracting arrays that may have duplicates across chunks.`})}),`
`,e.jsx(t.h3,{id:"parallelautomerge",children:"parallelAutoMerge"}),`
`,e.jsx(t.p,{children:"Parallel extraction with schema-aware merge and deduplication."}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Best for:"})," Array extraction from large inputs where speed matters."]}),`
`,e.jsx(t.h3,{id:"sequentialautomerge",children:"sequentialAutoMerge"}),`
`,e.jsx(t.p,{children:"Sequential extraction with schema-aware merge and deduplication."}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Best for:"})," Ordered array extraction where context matters."]}),`
`,e.jsx(t.h3,{id:"doublepassautomerge",children:"doublePassAutoMerge"}),`
`,e.jsx(t.p,{children:"Double-pass extraction with schema-aware merge and deduplication."}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Best for:"})," Large array extraction with maximum quality requirement."]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"choosing-a-strategy",children:"Choosing a Strategy"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Start with the Agent."})," It's the default because it works best for most documents."]}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Strategy"}),e.jsx(t.th,{children:"When to use"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"agent"})," (default)"]}),e.jsxs(t.td,{children:[e.jsx(t.strong,{children:"Start here"})," — autonomous exploration for most documents"]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"simple"})}),e.jsx(t.td,{children:"Small input, fits in one context window, predictable costs"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"parallel"})}),e.jsx(t.td,{children:"Large input, order doesn't matter, speed priority"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"sequential"})}),e.jsx(t.td,{children:"Large input, context carries across chunks"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"parallelAutoMerge"})}),e.jsx(t.td,{children:"Large input with arrays — parallel + dedup"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"sequentialAutoMerge"})}),e.jsx(t.td,{children:"Large input with arrays — sequential + dedup"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"doublePass"})}),e.jsx(t.td,{children:"Quality matters, two-pass refinement"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"doublePassAutoMerge"})}),e.jsx(t.td,{children:"Quality + arrays + dedup"})]})]})]}),`
`,e.jsx(t.h3,{id:"quick-decision-flowchart",children:"Quick decision flowchart"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowchart TD"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    A[Start] --> B{Try Agent first?}"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    B -->|Yes| C[Use agent — default]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    B -->|Need fixed costs| D{Input fits in context?}"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    D -->|Yes| E[Use simple]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    D -->|No| F{Extracting arrays?}"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    F -->|Yes| G{Cross-chunk context matters?}"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    F -->|No| H{Cross-chunk context matters?}"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    G -->|Yes| I[sequentialAutoMerge or doublePassAutoMerge]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    G -->|No| J[parallelAutoMerge]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    H -->|Yes| K[sequential or doublePass]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    H -->|No| L[parallel]"})})]})})}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"})," — where strategies fit"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/chunking",children:"Chunking & Token Budgets"})," — how batches are formed"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/validation",children:"Validation & Retries"})," — the retry loop"]}),`
`]})]})}function m(s={}){const{wrapper:t}=s.components||{};return t?e.jsx(t,{...s,children:e.jsx(o,{...s})}):o(s)}export{c as _markdown,m as default,u as frontmatter,p as structuredData,g as toc};
