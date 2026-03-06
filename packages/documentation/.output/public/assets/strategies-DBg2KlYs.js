import{j as e}from"./main-BBiFs8Yq.js";let a=`

A strategy is the orchestration engine. It decides how to split the input, how many LLM calls to make, whether to run them concurrently or sequentially, and how to combine results.

Strategy comparison [#strategy-comparison]

| Strategy              | Speed   | Context | Arrays        | Token Cost |
| --------------------- | ------- | ------- | ------------- | ---------- |
| \`simple\`              | Fastest | Full    | —             | Lowest     |
| \`parallel\`            | Fast    | None    | LLM merge     | Medium     |
| \`sequential\`          | Medium  | Full    | Context       | Medium     |
| \`parallelAutoMerge\`   | Fast    | None    | Auto + dedupe | Medium     |
| \`sequentialAutoMerge\` | Medium  | Full    | Auto + dedupe | Medium     |
| \`doublePass\`          | Slow    | Full    | LLM merge     | High       |
| \`doublePassAutoMerge\` | Slow    | Full    | Auto + dedupe | High       |

***

simple [#simple]

Single-shot extraction for small inputs.

| Property    | Value                      |
| ----------- | -------------------------- |
| Name        | \`"simple"\`                 |
| LLM calls   | 1                          |
| Parallelism | None                       |
| Merge step  | None                       |
| Dedupe step | None                       |
| Best for    | Small, single-chunk inputs |

Configuration [#configuration]

| Field                | Required | Default | Description                                                   |
| -------------------- | -------- | ------- | ------------------------------------------------------------- |
| \`model\`              | Yes      | -       | Model instance from \`@ai-sdk/*\`                               |
| \`outputInstructions\` | No       | -       | Extra instructions for the model                              |
| \`strict\`             | No       | \`false\` | Always \`true\` for simple (single-shot, no intermediate steps) |

Algorithm [#algorithm]

1. Build extraction prompt from artifacts + schema
2. Send to LLM
3. Validate output against the schema
4. Retry on validation failure (up to 3 attempts)
5. Return validated output

Example [#example]

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

CLI [#cli]

\`\`\`bash
struktur --input document.txt --schema schema.json --model openai/gpt-4o-mini
# --strategy simple is the default
\`\`\`

When to use [#when-to-use]

* Document fits within the model's context window (\\~10k tokens)
* Simple schema without nested arrays
* Testing or prototyping
* Speed is the priority

***

parallel [#parallel]

Concurrent batch processing with LLM merge.

| Property    | Value                        |
| ----------- | ---------------------------- |
| Name        | \`"parallel"\`                 |
| LLM calls   | N batches + 1 merge          |
| Parallelism | Full                         |
| Merge step  | LLM merge                    |
| Dedupe step | None                         |
| Best for    | Large inputs, speed priority |

Configuration [#configuration-1]

| Field                | Required | Default     | Description                            |
| -------------------- | -------- | ----------- | -------------------------------------- |
| \`model\`              | Yes      | -           | Model for extraction                   |
| \`mergeModel\`         | Yes      | -           | Model for merging partial results      |
| \`chunkSize\`          | Yes      | -           | Token budget per batch                 |
| \`concurrency\`        | No       | All batches | Max parallel batches                   |
| \`maxImages\`          | No       | Unlimited   | Max images per batch                   |
| \`outputInstructions\` | No       | -           | Extra instructions                     |
| \`strict\`             | No       | \`false\`     | Validate required fields on every step |

Algorithm [#algorithm-1]

1. Split artifacts into batches (respecting \`chunkSize\` and \`maxImages\`)
2. Extract from each batch concurrently
3. Validate each batch output with retry
4. Send all partial results to \`mergeModel\` for LLM merge
5. Validate merged output
6. Return final result

Example [#example-1]

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

CLI [#cli-1]

\`\`\`bash
struktur --input large.pdf --schema schema.json --strategy parallel --model openai/gpt-4o-mini
\`\`\`

When to use [#when-to-use-1]

* Speed is the top priority
* Chunks are relatively independent
* Many documents to process
* Can accept potential loss of cross-chunk context

***

sequential [#sequential]

Process chunks in order with context preservation.

| Property    | Value                       |
| ----------- | --------------------------- |
| Name        | \`"sequential"\`              |
| LLM calls   | N batches                   |
| Parallelism | None                        |
| Merge step  | Context carryover           |
| Dedupe step | None                        |
| Best for    | Context-dependent documents |

Configuration [#configuration-2]

| Field                | Required | Default   | Description                            |
| -------------------- | -------- | --------- | -------------------------------------- |
| \`model\`              | Yes      | -         | Model for extraction                   |
| \`chunkSize\`          | Yes      | -         | Token budget per batch                 |
| \`maxImages\`          | No       | Unlimited | Max images per batch                   |
| \`outputInstructions\` | No       | -         | Extra instructions                     |
| \`strict\`             | No       | \`false\`   | Validate required fields on every step |

Algorithm [#algorithm-2]

1. Split artifacts into batches
2. For each batch in order:
   * Build prompt including previous extraction result as context
   * Extract from batch
   * Validate with retry
   * Store result for next iteration
3. Return final result

Example [#example-2]

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

CLI [#cli-2]

\`\`\`bash
struktur --input report.pdf --schema schema.json --strategy sequential --model openai/gpt-4o-mini
\`\`\`

When to use [#when-to-use-2]

* Context between chunks matters
* Building data incrementally (e.g., accumulating line items)
* Later sections reference earlier sections
* Need better accuracy than parallel

***

parallelAutoMerge [#parallelautomerge]

Parallel extraction with schema-aware merge and deduplication.

| Property    | Value                                 |
| ----------- | ------------------------------------- |
| Name        | \`"parallel-auto-merge"\`               |
| LLM calls   | N batches + 1 dedupe                  |
| Parallelism | Full                                  |
| Merge step  | Schema-aware auto-merge               |
| Dedupe step | CRC32 hash + LLM semantic             |
| Best for    | Array extraction, duplicates possible |

Configuration [#configuration-3]

| Field                | Required | Default         | Description                            |
| -------------------- | -------- | --------------- | -------------------------------------- |
| \`model\`              | Yes      | -               | Model for extraction                   |
| \`chunkSize\`          | Yes      | -               | Token budget per batch                 |
| \`concurrency\`        | No       | All batches     | Max parallel batches                   |
| \`maxImages\`          | No       | Unlimited       | Max images per batch                   |
| \`outputInstructions\` | No       | -               | Extra instructions                     |
| \`dedupeModel\`        | No       | Same as \`model\` | Model for semantic dedupe              |
| \`strict\`             | No       | \`false\`         | Validate required fields on every step |

Algorithm [#algorithm-3]

1. Split artifacts into batches
2. Extract from each batch concurrently
3. Validate each batch output with retry
4. **Schema-aware merge:** arrays concatenate, objects shallow-merge, scalars prefer new values
5. **Hash dedupe:** CRC32 to remove exact duplicates
6. **Semantic dedupe:** LLM identifies semantically equivalent entries
7. Return final result

Merge behavior [#merge-behavior]

Schema-aware auto-merge via \`SmartDataMerger\`:

* **Arrays:** concatenated
* **Objects:** shallow-merged (later keys overwrite earlier)
* **Scalars:** prefer newer non-empty values

No LLM merge call — deterministic.

Deduplication [#deduplication]

Two-stage:

1. **CRC32 hash:** Exact duplicates removed without LLM call
2. **LLM semantic:** Model identifies near-duplicates (e.g., "iPhone 15" vs "Apple iPhone 15 128GB")

Example [#example-3]

\`\`\`js
import { extract, parallelAutoMerge } from "@struktur/sdk";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: parallelAutoMerge({
    model: openai("gpt-4o-mini"),
    dedupeModel: openai("gpt-4o-mini"),
    chunkSize: 10000,
    concurrency: 3,
  }),
});
\`\`\`

CLI [#cli-3]

\`\`\`bash
struktur --input catalog.pdf --schema schema.json --strategy parallelAutoMerge --model openai/gpt-4o-mini
\`\`\`

When to use [#when-to-use-3]

* Extracting arrays that may have duplicates across chunks
* Want to consolidate results without LLM merge cost
* Documents have repeated information across pages
* Need deterministic merge behavior

Best for: invoices with line items, real estate with multiple units, catalogs with products that appear on multiple pages.

***

sequentialAutoMerge [#sequentialautomerge]

Sequential extraction with schema-aware merge and deduplication.

| Property    | Value                                     |
| ----------- | ----------------------------------------- |
| Name        | \`"sequential-auto-merge"\`                 |
| LLM calls   | N batches + 1 dedupe                      |
| Parallelism | None                                      |
| Merge step  | Schema-aware auto-merge                   |
| Dedupe step | CRC32 hash + LLM semantic                 |
| Best for    | Ordered array extraction, context matters |

Configuration [#configuration-4]

| Field                | Required | Default         | Description                            |
| -------------------- | -------- | --------------- | -------------------------------------- |
| \`model\`              | Yes      | -               | Model for extraction                   |
| \`chunkSize\`          | Yes      | -               | Token budget per batch                 |
| \`maxImages\`          | No       | Unlimited       | Max images per batch                   |
| \`outputInstructions\` | No       | -               | Extra instructions                     |
| \`dedupeModel\`        | No       | Same as \`model\` | Model for semantic dedupe              |
| \`strict\`             | No       | \`false\`         | Validate required fields on every step |

Algorithm [#algorithm-4]

1. Split artifacts into batches
2. For each batch in order:
   * Extract from batch
   * Validate with retry
   * **Schema-aware merge** with previous results
3. **Hash dedupe:** CRC32 to remove exact duplicates
4. **Semantic dedupe:** LLM identifies semantically equivalent entries
5. Return final result

Example [#example-4]

\`\`\`js
import { extract, sequentialAutoMerge } from "@struktur/sdk";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: sequentialAutoMerge({
    model: openai("gpt-4o-mini"),
    dedupeModel: openai("gpt-4o-mini"),
    chunkSize: 10000,
  }),
});
\`\`\`

CLI [#cli-4]

\`\`\`bash
struktur --input invoice.pdf --schema schema.json --strategy sequentialAutoMerge --model openai/gpt-4o-mini
\`\`\`

When to use [#when-to-use-4]

* Ordered list extraction with cross-chunk dependencies
* Later chunks need context from earlier chunks
* Arrays may have duplicates across pages
* Context preservation matters

Best for: multi-page invoices with line items that span pages, real estate exposés with units referenced across pages.

***

doublePass [#doublepass]

Parallel pass for speed, sequential pass for refinement.

| Property    | Value                                          |
| ----------- | ---------------------------------------------- |
| Name        | \`"double-pass"\`                                |
| LLM calls   | N × 2 batches + 1 merge                        |
| Parallelism | First pass full, second pass none              |
| Merge step  | LLM merge (pass 1), context carryover (pass 2) |
| Dedupe step | None                                           |
| Best for    | High-stakes extraction, maximum quality        |

Configuration [#configuration-5]

| Field                | Required | Default     | Description                            |
| -------------------- | -------- | ----------- | -------------------------------------- |
| \`model\`              | Yes      | -           | Model for extraction                   |
| \`mergeModel\`         | Yes      | -           | Model for merging partial results      |
| \`chunkSize\`          | Yes      | -           | Token budget per batch                 |
| \`concurrency\`        | No       | All batches | Max parallel batches                   |
| \`maxImages\`          | No       | Unlimited   | Max images per batch                   |
| \`outputInstructions\` | No       | -           | Extra instructions                     |
| \`strict\`             | No       | \`false\`     | Validate required fields on every step |

Algorithm [#algorithm-5]

**Pass 1 (parallel):**

1. Split artifacts into batches
2. Extract from each batch concurrently
3. Validate each batch output with retry
4. LLM merge all partial results

**Pass 2 (sequential):**

5. For each batch in order:
   * Build prompt including pass 1 result as context
   * Extract from batch
   * Validate with retry
   * Store result for next iteration
6. Return final result

Example [#example-5]

\`\`\`js
import { extract, doublePass } from "@struktur/sdk";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: doublePass({
    model: openai("gpt-4o-mini"),
    mergeModel: openai("gpt-4o-mini"),
    chunkSize: 10000,
  }),
});
\`\`\`

CLI [#cli-5]

\`\`\`bash
struktur --input critical.pdf --schema schema.json --strategy doublePass --model openai/gpt-4o
\`\`\`

When to use [#when-to-use-5]

* Accuracy is more important than cost
* High-stakes extractions
* Complex schemas
* Can afford two full passes

***

doublePassAutoMerge [#doublepassautomerge]

Double-pass extraction with schema-aware merge and deduplication.

| Property    | Value                                   |
| ----------- | --------------------------------------- |
| Name        | \`"double-pass-auto-merge"\`              |
| LLM calls   | N × 2 batches + 1 dedupe                |
| Parallelism | First pass full, second pass none       |
| Merge step  | Schema-aware auto-merge                 |
| Dedupe step | CRC32 hash + LLM semantic               |
| Best for    | Large array extraction, maximum quality |

Configuration [#configuration-6]

| Field                | Required | Default         | Description                            |
| -------------------- | -------- | --------------- | -------------------------------------- |
| \`model\`              | Yes      | -               | Model for extraction                   |
| \`chunkSize\`          | Yes      | -               | Token budget per batch                 |
| \`concurrency\`        | No       | All batches     | Max parallel batches                   |
| \`maxImages\`          | No       | Unlimited       | Max images per batch                   |
| \`outputInstructions\` | No       | -               | Extra instructions                     |
| \`dedupeModel\`        | No       | Same as \`model\` | Model for semantic dedupe              |
| \`strict\`             | No       | \`false\`         | Validate required fields on every step |

Algorithm [#algorithm-6]

**Pass 1 (parallel):**

1. Split artifacts into batches
2. Extract from each batch concurrently
3. Validate each batch output with retry
4. **Schema-aware merge** all partial results
5. **Hash dedupe:** CRC32
6. **Semantic dedupe:** LLM

**Pass 2 (sequential):**

7. For each batch in order:
   * Build prompt including deduped pass 1 result as context
   * Extract from batch
   * Validate with retry
   * Store result for next iteration
8. Return final result

Example [#example-6]

\`\`\`js
import { extract, doublePassAutoMerge } from "@struktur/sdk";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: doublePassAutoMerge({
    model: openai("gpt-4o-mini"),
    dedupeModel: openai("gpt-4o-mini"),
    chunkSize: 10000,
  }),
});
\`\`\`

CLI [#cli-6]

\`\`\`bash
struktur --input catalog.pdf --schema schema.json --strategy doublePassAutoMerge --model openai/gpt-4o
\`\`\`

When to use [#when-to-use-6]

* Large array extraction with maximum quality requirement
* Arrays may have duplicates
* Cross-chunk context matters
* Quality trumps cost

***

Choosing a Strategy [#choosing-a-strategy]

Pick based on input size and whether you're extracting arrays:

| Strategy              | When to use                                      |
| --------------------- | ------------------------------------------------ |
| \`simple\`              | Small input, fits in one context window          |
| \`parallel\`            | Large input, order doesn't matter, scalar fields |
| \`sequential\`          | Large input, context carries across chunks       |
| \`parallelAutoMerge\`   | Large input with arrays — parallel + dedup       |
| \`sequentialAutoMerge\` | Large input with arrays — sequential + dedup     |
| \`doublePass\`          | Quality matters, two-pass refinement             |
| \`doublePassAutoMerge\` | Quality + arrays + dedup                         |

When speed matters [#when-speed-matters]

Use \`parallel\` or \`parallelAutoMerge\`. Accept that cross-chunk context is limited.

When quality matters [#when-quality-matters]

Use \`doublePass\` or \`doublePassAutoMerge\`. Accept higher token cost.

When arrays matter [#when-arrays-matter]

Use auto-merge variants (\`parallelAutoMerge\`, \`sequentialAutoMerge\`, \`doublePassAutoMerge\`). They handle deduplication automatically.

Quick decision flowchart [#quick-decision-flowchart]

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Input fits in context?}
    B -->|Yes| C[Use simple]
    B -->|No| D{Extracting arrays?}
    D -->|Yes| E{Cross-chunk context matters?}
    D -->|No| F{Cross-chunk context matters?}
    E -->|Yes| G[sequentialAutoMerge or doublePassAutoMerge]
    E -->|No| H[parallelAutoMerge]
    F -->|Yes| I[sequential or doublePass]
    F -->|No| J[parallel]
\`\`\`

Worked examples [#worked-examples]

50-page PDF invoice with 200 line items [#50-page-pdf-invoice-with-200-line-items]

**Use:** \`parallelAutoMerge\` or \`sequentialAutoMerge\`

\`\`\`bash
struktur --input invoice.pdf --schema invoice.json --strategy parallelAutoMerge --model openai/gpt-4o-mini
\`\`\`

Choose \`sequentialAutoMerge\` if line items span page boundaries and reference earlier context.

3-page real estate exposé with floor plan images [#3-page-real-estate-exposé-with-floor-plan-images]

**Use:** \`sequential\` or \`sequentialAutoMerge\`

\`\`\`bash
struktur --input expose.pdf --schema property.json --strategy sequentialAutoMerge --model openai/gpt-4o-mini
\`\`\`

Images are handled by vision models without OCR.

2-page contract — parties, dates, value [#2-page-contract--parties-dates-value]

**Use:** \`simple\` or \`sequential\`

\`\`\`bash
struktur --input contract.pdf --schema contract.json --model openai/gpt-4o-mini
\`\`\`

\`simple\` if it fits in context; \`sequential\` if you need incremental building.

500 product datasheets [#500-product-datasheets]

**Use:** \`parallelAutoMerge\` with concurrency

\`\`\`bash
for f in datasheets/*.pdf; do
  markitdown "$f" | struktur --stdin --schema product.json --strategy parallelAutoMerge --model openai/gpt-4o-mini
done | jq -s '.'
\`\`\`

***

Writing a Custom Strategy [#writing-a-custom-strategy]

The interface [#the-interface]

A strategy has:

\`\`\`js
const myStrategy = {
  name: "my-strategy",

  // Optional: used by CLI progress bar.
  getEstimatedSteps(artifacts) {
    return 3;
  },

  async run(options) {
    // Your orchestration logic here.
    return { data: ..., usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } };
  },
};
\`\`\`

Using built-in helpers [#using-built-in-helpers]

Key internal helpers from \`strategies/utils.ts\`:

| Helper                                                                            | Description                              |
| --------------------------------------------------------------------------------- | ---------------------------------------- |
| \`getBatches(artifacts, { maxTokens, maxImages? })\`                                | Chunk artifacts into batches             |
| \`extractWithPrompt({ model, schema, system, user, artifacts, events, execute? })\` | Run one LLM extraction with retries      |
| \`serializeSchema(schema)\`                                                         | Convert schema to JSON string for prompt |
| \`mergeUsage([...usages])\`                                                         | Accumulate usage across calls            |

A complete example [#a-complete-example]

\`\`\`js
import { extractWithPrompt, getBatches, mergeUsage, serializeSchema } from "@struktur/sdk/strategies/utils";
import { buildExtractorPrompt } from "@struktur/sdk/prompts/ExtractorPrompt";

const myStrategy = (config) => ({
  name: "my-strategy",

  getEstimatedSteps(artifacts) {
    const batches = getBatches(artifacts, { maxTokens: config.chunkSize });
    return batches.length + 1;
  },

  async run(options) {
    const batches = getBatches(options.artifacts, {
      maxTokens: config.chunkSize,
    });

    const schema = serializeSchema(options.schema);
    const usages = [];
    let currentData = {};

    for (const [index, batch] of batches.entries()) {
      const prompt = buildExtractorPrompt(batch, schema);

      const result = await extractWithPrompt({
        model: config.model,
        schema: options.schema,
        system: prompt.system,
        user: prompt.user,
        artifacts: batch,
        events: options.events,
      });

      currentData = { ...currentData, ...result.data };
      usages.push(result.usage);

      await options.events?.onStep?.({
        step: index + 1,
        total: batches.length + 1,
        label: \`batch \${index + 1}/\${batches.length}\`,
      });
    }

    return { data: currentData, usage: mergeUsage(usages) };
  },
});
\`\`\`

Emitting step events [#emitting-step-events]

Strategies should emit \`events.onStep\` for progress tracking:

\`\`\`js
await options.events?.onStep?.({
  step: 1,
  total: 3,
  label: "extract",
});
\`\`\`

***

See also [#see-also]

* [The Extraction Pipeline](/docs/explanation/pipeline) — where strategies fit
* [Chunking & Token Budgets](/docs/explanation/chunking) — how batches are formed
* [Validation & Retries](/docs/explanation/validation) — the retry loop
`,l={title:"Extraction Strategies",description:"Built-in strategies for different extraction patterns and how to choose the right one."},r={contents:[{heading:void 0,content:"A strategy is the orchestration engine. It decides how to split the input, how many LLM calls to make, whether to run them concurrently or sequentially, and how to combine results."},{heading:"strategy-comparison",content:"Strategy"},{heading:"strategy-comparison",content:"Speed"},{heading:"strategy-comparison",content:"Context"},{heading:"strategy-comparison",content:"Arrays"},{heading:"strategy-comparison",content:"Token Cost"},{heading:"strategy-comparison",content:"`simple`"},{heading:"strategy-comparison",content:"Fastest"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"—"},{heading:"strategy-comparison",content:"Lowest"},{heading:"strategy-comparison",content:"`parallel`"},{heading:"strategy-comparison",content:"Fast"},{heading:"strategy-comparison",content:"None"},{heading:"strategy-comparison",content:"LLM merge"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"`sequential`"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"Context"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"`parallelAutoMerge`"},{heading:"strategy-comparison",content:"Fast"},{heading:"strategy-comparison",content:"None"},{heading:"strategy-comparison",content:"Auto + dedupe"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"`sequentialAutoMerge`"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"Auto + dedupe"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"`doublePass`"},{heading:"strategy-comparison",content:"Slow"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"LLM merge"},{heading:"strategy-comparison",content:"High"},{heading:"strategy-comparison",content:"`doublePassAutoMerge`"},{heading:"strategy-comparison",content:"Slow"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"Auto + dedupe"},{heading:"strategy-comparison",content:"High"},{heading:"simple",content:"Single-shot extraction for small inputs."},{heading:"simple",content:"Property"},{heading:"simple",content:"Value"},{heading:"simple",content:"Name"},{heading:"simple",content:'`"simple"`'},{heading:"simple",content:"LLM calls"},{heading:"simple",content:"1"},{heading:"simple",content:"Parallelism"},{heading:"simple",content:"None"},{heading:"simple",content:"Merge step"},{heading:"simple",content:"None"},{heading:"simple",content:"Dedupe step"},{heading:"simple",content:"None"},{heading:"simple",content:"Best for"},{heading:"simple",content:"Small, single-chunk inputs"},{heading:"configuration",content:"Field"},{heading:"configuration",content:"Required"},{heading:"configuration",content:"Default"},{heading:"configuration",content:"Description"},{heading:"configuration",content:"`model`"},{heading:"configuration",content:"Yes"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Model instance from `@ai-sdk/*`"},{heading:"configuration",content:"`outputInstructions`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Extra instructions for the model"},{heading:"configuration",content:"`strict`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"`false`"},{heading:"configuration",content:"Always `true` for simple (single-shot, no intermediate steps)"},{heading:"algorithm",content:"Build extraction prompt from artifacts + schema"},{heading:"algorithm",content:"Send to LLM"},{heading:"algorithm",content:"Validate output against the schema"},{heading:"algorithm",content:"Retry on validation failure (up to 3 attempts)"},{heading:"algorithm",content:"Return validated output"},{heading:"when-to-use",content:"Document fits within the model's context window (\\~10k tokens)"},{heading:"when-to-use",content:"Simple schema without nested arrays"},{heading:"when-to-use",content:"Testing or prototyping"},{heading:"when-to-use",content:"Speed is the priority"},{heading:"parallel",content:"Concurrent batch processing with LLM merge."},{heading:"parallel",content:"Property"},{heading:"parallel",content:"Value"},{heading:"parallel",content:"Name"},{heading:"parallel",content:'`"parallel"`'},{heading:"parallel",content:"LLM calls"},{heading:"parallel",content:"N batches + 1 merge"},{heading:"parallel",content:"Parallelism"},{heading:"parallel",content:"Full"},{heading:"parallel",content:"Merge step"},{heading:"parallel",content:"LLM merge"},{heading:"parallel",content:"Dedupe step"},{heading:"parallel",content:"None"},{heading:"parallel",content:"Best for"},{heading:"parallel",content:"Large inputs, speed priority"},{heading:"configuration-1",content:"Field"},{heading:"configuration-1",content:"Required"},{heading:"configuration-1",content:"Default"},{heading:"configuration-1",content:"Description"},{heading:"configuration-1",content:"`model`"},{heading:"configuration-1",content:"Yes"},{heading:"configuration-1",content:"-"},{heading:"configuration-1",content:"Model for extraction"},{heading:"configuration-1",content:"`mergeModel`"},{heading:"configuration-1",content:"Yes"},{heading:"configuration-1",content:"-"},{heading:"configuration-1",content:"Model for merging partial results"},{heading:"configuration-1",content:"`chunkSize`"},{heading:"configuration-1",content:"Yes"},{heading:"configuration-1",content:"-"},{heading:"configuration-1",content:"Token budget per batch"},{heading:"configuration-1",content:"`concurrency`"},{heading:"configuration-1",content:"No"},{heading:"configuration-1",content:"All batches"},{heading:"configuration-1",content:"Max parallel batches"},{heading:"configuration-1",content:"`maxImages`"},{heading:"configuration-1",content:"No"},{heading:"configuration-1",content:"Unlimited"},{heading:"configuration-1",content:"Max images per batch"},{heading:"configuration-1",content:"`outputInstructions`"},{heading:"configuration-1",content:"No"},{heading:"configuration-1",content:"-"},{heading:"configuration-1",content:"Extra instructions"},{heading:"configuration-1",content:"`strict`"},{heading:"configuration-1",content:"No"},{heading:"configuration-1",content:"`false`"},{heading:"configuration-1",content:"Validate required fields on every step"},{heading:"algorithm-1",content:"Split artifacts into batches (respecting `chunkSize` and `maxImages`)"},{heading:"algorithm-1",content:"Extract from each batch concurrently"},{heading:"algorithm-1",content:"Validate each batch output with retry"},{heading:"algorithm-1",content:"Send all partial results to `mergeModel` for LLM merge"},{heading:"algorithm-1",content:"Validate merged output"},{heading:"algorithm-1",content:"Return final result"},{heading:"when-to-use-1",content:"Speed is the top priority"},{heading:"when-to-use-1",content:"Chunks are relatively independent"},{heading:"when-to-use-1",content:"Many documents to process"},{heading:"when-to-use-1",content:"Can accept potential loss of cross-chunk context"},{heading:"sequential",content:"Process chunks in order with context preservation."},{heading:"sequential",content:"Property"},{heading:"sequential",content:"Value"},{heading:"sequential",content:"Name"},{heading:"sequential",content:'`"sequential"`'},{heading:"sequential",content:"LLM calls"},{heading:"sequential",content:"N batches"},{heading:"sequential",content:"Parallelism"},{heading:"sequential",content:"None"},{heading:"sequential",content:"Merge step"},{heading:"sequential",content:"Context carryover"},{heading:"sequential",content:"Dedupe step"},{heading:"sequential",content:"None"},{heading:"sequential",content:"Best for"},{heading:"sequential",content:"Context-dependent documents"},{heading:"configuration-2",content:"Field"},{heading:"configuration-2",content:"Required"},{heading:"configuration-2",content:"Default"},{heading:"configuration-2",content:"Description"},{heading:"configuration-2",content:"`model`"},{heading:"configuration-2",content:"Yes"},{heading:"configuration-2",content:"-"},{heading:"configuration-2",content:"Model for extraction"},{heading:"configuration-2",content:"`chunkSize`"},{heading:"configuration-2",content:"Yes"},{heading:"configuration-2",content:"-"},{heading:"configuration-2",content:"Token budget per batch"},{heading:"configuration-2",content:"`maxImages`"},{heading:"configuration-2",content:"No"},{heading:"configuration-2",content:"Unlimited"},{heading:"configuration-2",content:"Max images per batch"},{heading:"configuration-2",content:"`outputInstructions`"},{heading:"configuration-2",content:"No"},{heading:"configuration-2",content:"-"},{heading:"configuration-2",content:"Extra instructions"},{heading:"configuration-2",content:"`strict`"},{heading:"configuration-2",content:"No"},{heading:"configuration-2",content:"`false`"},{heading:"configuration-2",content:"Validate required fields on every step"},{heading:"algorithm-2",content:"Split artifacts into batches"},{heading:"algorithm-2",content:"For each batch in order:"},{heading:"algorithm-2",content:"Build prompt including previous extraction result as context"},{heading:"algorithm-2",content:"Extract from batch"},{heading:"algorithm-2",content:"Validate with retry"},{heading:"algorithm-2",content:"Store result for next iteration"},{heading:"algorithm-2",content:"Return final result"},{heading:"when-to-use-2",content:"Context between chunks matters"},{heading:"when-to-use-2",content:"Building data incrementally (e.g., accumulating line items)"},{heading:"when-to-use-2",content:"Later sections reference earlier sections"},{heading:"when-to-use-2",content:"Need better accuracy than parallel"},{heading:"parallelautomerge",content:"Parallel extraction with schema-aware merge and deduplication."},{heading:"parallelautomerge",content:"Property"},{heading:"parallelautomerge",content:"Value"},{heading:"parallelautomerge",content:"Name"},{heading:"parallelautomerge",content:'`"parallel-auto-merge"`'},{heading:"parallelautomerge",content:"LLM calls"},{heading:"parallelautomerge",content:"N batches + 1 dedupe"},{heading:"parallelautomerge",content:"Parallelism"},{heading:"parallelautomerge",content:"Full"},{heading:"parallelautomerge",content:"Merge step"},{heading:"parallelautomerge",content:"Schema-aware auto-merge"},{heading:"parallelautomerge",content:"Dedupe step"},{heading:"parallelautomerge",content:"CRC32 hash + LLM semantic"},{heading:"parallelautomerge",content:"Best for"},{heading:"parallelautomerge",content:"Array extraction, duplicates possible"},{heading:"configuration-3",content:"Field"},{heading:"configuration-3",content:"Required"},{heading:"configuration-3",content:"Default"},{heading:"configuration-3",content:"Description"},{heading:"configuration-3",content:"`model`"},{heading:"configuration-3",content:"Yes"},{heading:"configuration-3",content:"-"},{heading:"configuration-3",content:"Model for extraction"},{heading:"configuration-3",content:"`chunkSize`"},{heading:"configuration-3",content:"Yes"},{heading:"configuration-3",content:"-"},{heading:"configuration-3",content:"Token budget per batch"},{heading:"configuration-3",content:"`concurrency`"},{heading:"configuration-3",content:"No"},{heading:"configuration-3",content:"All batches"},{heading:"configuration-3",content:"Max parallel batches"},{heading:"configuration-3",content:"`maxImages`"},{heading:"configuration-3",content:"No"},{heading:"configuration-3",content:"Unlimited"},{heading:"configuration-3",content:"Max images per batch"},{heading:"configuration-3",content:"`outputInstructions`"},{heading:"configuration-3",content:"No"},{heading:"configuration-3",content:"-"},{heading:"configuration-3",content:"Extra instructions"},{heading:"configuration-3",content:"`dedupeModel`"},{heading:"configuration-3",content:"No"},{heading:"configuration-3",content:"Same as `model`"},{heading:"configuration-3",content:"Model for semantic dedupe"},{heading:"configuration-3",content:"`strict`"},{heading:"configuration-3",content:"No"},{heading:"configuration-3",content:"`false`"},{heading:"configuration-3",content:"Validate required fields on every step"},{heading:"algorithm-3",content:"Split artifacts into batches"},{heading:"algorithm-3",content:"Extract from each batch concurrently"},{heading:"algorithm-3",content:"Validate each batch output with retry"},{heading:"algorithm-3",content:"**Schema-aware merge:** arrays concatenate, objects shallow-merge, scalars prefer new values"},{heading:"algorithm-3",content:"**Hash dedupe:** CRC32 to remove exact duplicates"},{heading:"algorithm-3",content:"**Semantic dedupe:** LLM identifies semantically equivalent entries"},{heading:"algorithm-3",content:"Return final result"},{heading:"merge-behavior",content:"Schema-aware auto-merge via `SmartDataMerger`:"},{heading:"merge-behavior",content:"**Arrays:** concatenated"},{heading:"merge-behavior",content:"**Objects:** shallow-merged (later keys overwrite earlier)"},{heading:"merge-behavior",content:"**Scalars:** prefer newer non-empty values"},{heading:"merge-behavior",content:"No LLM merge call — deterministic."},{heading:"deduplication",content:"Two-stage:"},{heading:"deduplication",content:"**CRC32 hash:** Exact duplicates removed without LLM call"},{heading:"deduplication",content:'**LLM semantic:** Model identifies near-duplicates (e.g., "iPhone 15" vs "Apple iPhone 15 128GB")'},{heading:"when-to-use-3",content:"Extracting arrays that may have duplicates across chunks"},{heading:"when-to-use-3",content:"Want to consolidate results without LLM merge cost"},{heading:"when-to-use-3",content:"Documents have repeated information across pages"},{heading:"when-to-use-3",content:"Need deterministic merge behavior"},{heading:"when-to-use-3",content:"Best for: invoices with line items, real estate with multiple units, catalogs with products that appear on multiple pages."},{heading:"sequentialautomerge",content:"Sequential extraction with schema-aware merge and deduplication."},{heading:"sequentialautomerge",content:"Property"},{heading:"sequentialautomerge",content:"Value"},{heading:"sequentialautomerge",content:"Name"},{heading:"sequentialautomerge",content:'`"sequential-auto-merge"`'},{heading:"sequentialautomerge",content:"LLM calls"},{heading:"sequentialautomerge",content:"N batches + 1 dedupe"},{heading:"sequentialautomerge",content:"Parallelism"},{heading:"sequentialautomerge",content:"None"},{heading:"sequentialautomerge",content:"Merge step"},{heading:"sequentialautomerge",content:"Schema-aware auto-merge"},{heading:"sequentialautomerge",content:"Dedupe step"},{heading:"sequentialautomerge",content:"CRC32 hash + LLM semantic"},{heading:"sequentialautomerge",content:"Best for"},{heading:"sequentialautomerge",content:"Ordered array extraction, context matters"},{heading:"configuration-4",content:"Field"},{heading:"configuration-4",content:"Required"},{heading:"configuration-4",content:"Default"},{heading:"configuration-4",content:"Description"},{heading:"configuration-4",content:"`model`"},{heading:"configuration-4",content:"Yes"},{heading:"configuration-4",content:"-"},{heading:"configuration-4",content:"Model for extraction"},{heading:"configuration-4",content:"`chunkSize`"},{heading:"configuration-4",content:"Yes"},{heading:"configuration-4",content:"-"},{heading:"configuration-4",content:"Token budget per batch"},{heading:"configuration-4",content:"`maxImages`"},{heading:"configuration-4",content:"No"},{heading:"configuration-4",content:"Unlimited"},{heading:"configuration-4",content:"Max images per batch"},{heading:"configuration-4",content:"`outputInstructions`"},{heading:"configuration-4",content:"No"},{heading:"configuration-4",content:"-"},{heading:"configuration-4",content:"Extra instructions"},{heading:"configuration-4",content:"`dedupeModel`"},{heading:"configuration-4",content:"No"},{heading:"configuration-4",content:"Same as `model`"},{heading:"configuration-4",content:"Model for semantic dedupe"},{heading:"configuration-4",content:"`strict`"},{heading:"configuration-4",content:"No"},{heading:"configuration-4",content:"`false`"},{heading:"configuration-4",content:"Validate required fields on every step"},{heading:"algorithm-4",content:"Split artifacts into batches"},{heading:"algorithm-4",content:"For each batch in order:"},{heading:"algorithm-4",content:"Extract from batch"},{heading:"algorithm-4",content:"Validate with retry"},{heading:"algorithm-4",content:"**Schema-aware merge** with previous results"},{heading:"algorithm-4",content:"**Hash dedupe:** CRC32 to remove exact duplicates"},{heading:"algorithm-4",content:"**Semantic dedupe:** LLM identifies semantically equivalent entries"},{heading:"algorithm-4",content:"Return final result"},{heading:"when-to-use-4",content:"Ordered list extraction with cross-chunk dependencies"},{heading:"when-to-use-4",content:"Later chunks need context from earlier chunks"},{heading:"when-to-use-4",content:"Arrays may have duplicates across pages"},{heading:"when-to-use-4",content:"Context preservation matters"},{heading:"when-to-use-4",content:"Best for: multi-page invoices with line items that span pages, real estate exposés with units referenced across pages."},{heading:"doublepass",content:"Parallel pass for speed, sequential pass for refinement."},{heading:"doublepass",content:"Property"},{heading:"doublepass",content:"Value"},{heading:"doublepass",content:"Name"},{heading:"doublepass",content:'`"double-pass"`'},{heading:"doublepass",content:"LLM calls"},{heading:"doublepass",content:"N × 2 batches + 1 merge"},{heading:"doublepass",content:"Parallelism"},{heading:"doublepass",content:"First pass full, second pass none"},{heading:"doublepass",content:"Merge step"},{heading:"doublepass",content:"LLM merge (pass 1), context carryover (pass 2)"},{heading:"doublepass",content:"Dedupe step"},{heading:"doublepass",content:"None"},{heading:"doublepass",content:"Best for"},{heading:"doublepass",content:"High-stakes extraction, maximum quality"},{heading:"configuration-5",content:"Field"},{heading:"configuration-5",content:"Required"},{heading:"configuration-5",content:"Default"},{heading:"configuration-5",content:"Description"},{heading:"configuration-5",content:"`model`"},{heading:"configuration-5",content:"Yes"},{heading:"configuration-5",content:"-"},{heading:"configuration-5",content:"Model for extraction"},{heading:"configuration-5",content:"`mergeModel`"},{heading:"configuration-5",content:"Yes"},{heading:"configuration-5",content:"-"},{heading:"configuration-5",content:"Model for merging partial results"},{heading:"configuration-5",content:"`chunkSize`"},{heading:"configuration-5",content:"Yes"},{heading:"configuration-5",content:"-"},{heading:"configuration-5",content:"Token budget per batch"},{heading:"configuration-5",content:"`concurrency`"},{heading:"configuration-5",content:"No"},{heading:"configuration-5",content:"All batches"},{heading:"configuration-5",content:"Max parallel batches"},{heading:"configuration-5",content:"`maxImages`"},{heading:"configuration-5",content:"No"},{heading:"configuration-5",content:"Unlimited"},{heading:"configuration-5",content:"Max images per batch"},{heading:"configuration-5",content:"`outputInstructions`"},{heading:"configuration-5",content:"No"},{heading:"configuration-5",content:"-"},{heading:"configuration-5",content:"Extra instructions"},{heading:"configuration-5",content:"`strict`"},{heading:"configuration-5",content:"No"},{heading:"configuration-5",content:"`false`"},{heading:"configuration-5",content:"Validate required fields on every step"},{heading:"algorithm-5",content:"**Pass 1 (parallel):**"},{heading:"algorithm-5",content:"Split artifacts into batches"},{heading:"algorithm-5",content:"Extract from each batch concurrently"},{heading:"algorithm-5",content:"Validate each batch output with retry"},{heading:"algorithm-5",content:"LLM merge all partial results"},{heading:"algorithm-5",content:"**Pass 2 (sequential):**"},{heading:"algorithm-5",content:"For each batch in order:"},{heading:"algorithm-5",content:"Build prompt including pass 1 result as context"},{heading:"algorithm-5",content:"Extract from batch"},{heading:"algorithm-5",content:"Validate with retry"},{heading:"algorithm-5",content:"Store result for next iteration"},{heading:"algorithm-5",content:"Return final result"},{heading:"when-to-use-5",content:"Accuracy is more important than cost"},{heading:"when-to-use-5",content:"High-stakes extractions"},{heading:"when-to-use-5",content:"Complex schemas"},{heading:"when-to-use-5",content:"Can afford two full passes"},{heading:"doublepassautomerge",content:"Double-pass extraction with schema-aware merge and deduplication."},{heading:"doublepassautomerge",content:"Property"},{heading:"doublepassautomerge",content:"Value"},{heading:"doublepassautomerge",content:"Name"},{heading:"doublepassautomerge",content:'`"double-pass-auto-merge"`'},{heading:"doublepassautomerge",content:"LLM calls"},{heading:"doublepassautomerge",content:"N × 2 batches + 1 dedupe"},{heading:"doublepassautomerge",content:"Parallelism"},{heading:"doublepassautomerge",content:"First pass full, second pass none"},{heading:"doublepassautomerge",content:"Merge step"},{heading:"doublepassautomerge",content:"Schema-aware auto-merge"},{heading:"doublepassautomerge",content:"Dedupe step"},{heading:"doublepassautomerge",content:"CRC32 hash + LLM semantic"},{heading:"doublepassautomerge",content:"Best for"},{heading:"doublepassautomerge",content:"Large array extraction, maximum quality"},{heading:"configuration-6",content:"Field"},{heading:"configuration-6",content:"Required"},{heading:"configuration-6",content:"Default"},{heading:"configuration-6",content:"Description"},{heading:"configuration-6",content:"`model`"},{heading:"configuration-6",content:"Yes"},{heading:"configuration-6",content:"-"},{heading:"configuration-6",content:"Model for extraction"},{heading:"configuration-6",content:"`chunkSize`"},{heading:"configuration-6",content:"Yes"},{heading:"configuration-6",content:"-"},{heading:"configuration-6",content:"Token budget per batch"},{heading:"configuration-6",content:"`concurrency`"},{heading:"configuration-6",content:"No"},{heading:"configuration-6",content:"All batches"},{heading:"configuration-6",content:"Max parallel batches"},{heading:"configuration-6",content:"`maxImages`"},{heading:"configuration-6",content:"No"},{heading:"configuration-6",content:"Unlimited"},{heading:"configuration-6",content:"Max images per batch"},{heading:"configuration-6",content:"`outputInstructions`"},{heading:"configuration-6",content:"No"},{heading:"configuration-6",content:"-"},{heading:"configuration-6",content:"Extra instructions"},{heading:"configuration-6",content:"`dedupeModel`"},{heading:"configuration-6",content:"No"},{heading:"configuration-6",content:"Same as `model`"},{heading:"configuration-6",content:"Model for semantic dedupe"},{heading:"configuration-6",content:"`strict`"},{heading:"configuration-6",content:"No"},{heading:"configuration-6",content:"`false`"},{heading:"configuration-6",content:"Validate required fields on every step"},{heading:"algorithm-6",content:"**Pass 1 (parallel):**"},{heading:"algorithm-6",content:"Split artifacts into batches"},{heading:"algorithm-6",content:"Extract from each batch concurrently"},{heading:"algorithm-6",content:"Validate each batch output with retry"},{heading:"algorithm-6",content:"**Schema-aware merge** all partial results"},{heading:"algorithm-6",content:"**Hash dedupe:** CRC32"},{heading:"algorithm-6",content:"**Semantic dedupe:** LLM"},{heading:"algorithm-6",content:"**Pass 2 (sequential):**"},{heading:"algorithm-6",content:"For each batch in order:"},{heading:"algorithm-6",content:"Build prompt including deduped pass 1 result as context"},{heading:"algorithm-6",content:"Extract from batch"},{heading:"algorithm-6",content:"Validate with retry"},{heading:"algorithm-6",content:"Store result for next iteration"},{heading:"algorithm-6",content:"Return final result"},{heading:"when-to-use-6",content:"Large array extraction with maximum quality requirement"},{heading:"when-to-use-6",content:"Arrays may have duplicates"},{heading:"when-to-use-6",content:"Cross-chunk context matters"},{heading:"when-to-use-6",content:"Quality trumps cost"},{heading:"choosing-a-strategy",content:"Pick based on input size and whether you're extracting arrays:"},{heading:"choosing-a-strategy",content:"Strategy"},{heading:"choosing-a-strategy",content:"When to use"},{heading:"choosing-a-strategy",content:"`simple`"},{heading:"choosing-a-strategy",content:"Small input, fits in one context window"},{heading:"choosing-a-strategy",content:"`parallel`"},{heading:"choosing-a-strategy",content:"Large input, order doesn't matter, scalar fields"},{heading:"choosing-a-strategy",content:"`sequential`"},{heading:"choosing-a-strategy",content:"Large input, context carries across chunks"},{heading:"choosing-a-strategy",content:"`parallelAutoMerge`"},{heading:"choosing-a-strategy",content:"Large input with arrays — parallel + dedup"},{heading:"choosing-a-strategy",content:"`sequentialAutoMerge`"},{heading:"choosing-a-strategy",content:"Large input with arrays — sequential + dedup"},{heading:"choosing-a-strategy",content:"`doublePass`"},{heading:"choosing-a-strategy",content:"Quality matters, two-pass refinement"},{heading:"choosing-a-strategy",content:"`doublePassAutoMerge`"},{heading:"choosing-a-strategy",content:"Quality + arrays + dedup"},{heading:"when-speed-matters",content:"Use `parallel` or `parallelAutoMerge`. Accept that cross-chunk context is limited."},{heading:"when-quality-matters",content:"Use `doublePass` or `doublePassAutoMerge`. Accept higher token cost."},{heading:"when-arrays-matter",content:"Use auto-merge variants (`parallelAutoMerge`, `sequentialAutoMerge`, `doublePassAutoMerge`). They handle deduplication automatically."},{heading:"50-page-pdf-invoice-with-200-line-items",content:"**Use:** `parallelAutoMerge` or `sequentialAutoMerge`"},{heading:"50-page-pdf-invoice-with-200-line-items",content:"Choose `sequentialAutoMerge` if line items span page boundaries and reference earlier context."},{heading:"3-page-real-estate-exposé-with-floor-plan-images",content:"**Use:** `sequential` or `sequentialAutoMerge`"},{heading:"3-page-real-estate-exposé-with-floor-plan-images",content:"Images are handled by vision models without OCR."},{heading:"2-page-contract--parties-dates-value",content:"**Use:** `simple` or `sequential`"},{heading:"2-page-contract--parties-dates-value",content:"`simple` if it fits in context; `sequential` if you need incremental building."},{heading:"500-product-datasheets",content:"**Use:** `parallelAutoMerge` with concurrency"},{heading:"the-interface",content:"A strategy has:"},{heading:"using-built-in-helpers",content:"Key internal helpers from `strategies/utils.ts`:"},{heading:"using-built-in-helpers",content:"Helper"},{heading:"using-built-in-helpers",content:"Description"},{heading:"using-built-in-helpers",content:"`getBatches(artifacts, { maxTokens, maxImages? })`"},{heading:"using-built-in-helpers",content:"Chunk artifacts into batches"},{heading:"using-built-in-helpers",content:"`extractWithPrompt({ model, schema, system, user, artifacts, events, execute? })`"},{heading:"using-built-in-helpers",content:"Run one LLM extraction with retries"},{heading:"using-built-in-helpers",content:"`serializeSchema(schema)`"},{heading:"using-built-in-helpers",content:"Convert schema to JSON string for prompt"},{heading:"using-built-in-helpers",content:"`mergeUsage([...usages])`"},{heading:"using-built-in-helpers",content:"Accumulate usage across calls"},{heading:"emitting-step-events",content:"Strategies should emit `events.onStep` for progress tracking:"},{heading:"see-also",content:"The Extraction Pipeline — where strategies fit"},{heading:"see-also",content:"Chunking & Token Budgets — how batches are formed"},{heading:"see-also",content:"Validation & Retries — the retry loop"}],headings:[{id:"strategy-comparison",content:"Strategy comparison"},{id:"simple",content:"simple"},{id:"configuration",content:"Configuration"},{id:"algorithm",content:"Algorithm"},{id:"example",content:"Example"},{id:"cli",content:"CLI"},{id:"when-to-use",content:"When to use"},{id:"parallel",content:"parallel"},{id:"configuration-1",content:"Configuration"},{id:"algorithm-1",content:"Algorithm"},{id:"example-1",content:"Example"},{id:"cli-1",content:"CLI"},{id:"when-to-use-1",content:"When to use"},{id:"sequential",content:"sequential"},{id:"configuration-2",content:"Configuration"},{id:"algorithm-2",content:"Algorithm"},{id:"example-2",content:"Example"},{id:"cli-2",content:"CLI"},{id:"when-to-use-2",content:"When to use"},{id:"parallelautomerge",content:"parallelAutoMerge"},{id:"configuration-3",content:"Configuration"},{id:"algorithm-3",content:"Algorithm"},{id:"merge-behavior",content:"Merge behavior"},{id:"deduplication",content:"Deduplication"},{id:"example-3",content:"Example"},{id:"cli-3",content:"CLI"},{id:"when-to-use-3",content:"When to use"},{id:"sequentialautomerge",content:"sequentialAutoMerge"},{id:"configuration-4",content:"Configuration"},{id:"algorithm-4",content:"Algorithm"},{id:"example-4",content:"Example"},{id:"cli-4",content:"CLI"},{id:"when-to-use-4",content:"When to use"},{id:"doublepass",content:"doublePass"},{id:"configuration-5",content:"Configuration"},{id:"algorithm-5",content:"Algorithm"},{id:"example-5",content:"Example"},{id:"cli-5",content:"CLI"},{id:"when-to-use-5",content:"When to use"},{id:"doublepassautomerge",content:"doublePassAutoMerge"},{id:"configuration-6",content:"Configuration"},{id:"algorithm-6",content:"Algorithm"},{id:"example-6",content:"Example"},{id:"cli-6",content:"CLI"},{id:"when-to-use-6",content:"When to use"},{id:"choosing-a-strategy",content:"Choosing a Strategy"},{id:"when-speed-matters",content:"When speed matters"},{id:"when-quality-matters",content:"When quality matters"},{id:"when-arrays-matter",content:"When arrays matter"},{id:"quick-decision-flowchart",content:"Quick decision flowchart"},{id:"worked-examples",content:"Worked examples"},{id:"50-page-pdf-invoice-with-200-line-items",content:"50-page PDF invoice with 200 line items"},{id:"3-page-real-estate-exposé-with-floor-plan-images",content:"3-page real estate exposé with floor plan images"},{id:"2-page-contract--parties-dates-value",content:"2-page contract — parties, dates, value"},{id:"500-product-datasheets",content:"500 product datasheets"},{id:"writing-a-custom-strategy",content:"Writing a Custom Strategy"},{id:"the-interface",content:"The interface"},{id:"using-built-in-helpers",content:"Using built-in helpers"},{id:"a-complete-example",content:"A complete example"},{id:"emitting-step-events",content:"Emitting step events"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#strategy-comparison",title:e.jsx(e.Fragment,{children:"Strategy comparison"})},{depth:2,url:"#simple",title:e.jsx(e.Fragment,{children:"simple"})},{depth:3,url:"#configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#example",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#cli",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:3,url:"#when-to-use",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#parallel",title:e.jsx(e.Fragment,{children:"parallel"})},{depth:3,url:"#configuration-1",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm-1",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#example-1",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#cli-1",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:3,url:"#when-to-use-1",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#sequential",title:e.jsx(e.Fragment,{children:"sequential"})},{depth:3,url:"#configuration-2",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm-2",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#example-2",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#cli-2",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:3,url:"#when-to-use-2",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#parallelautomerge",title:e.jsx(e.Fragment,{children:"parallelAutoMerge"})},{depth:3,url:"#configuration-3",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm-3",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#merge-behavior",title:e.jsx(e.Fragment,{children:"Merge behavior"})},{depth:3,url:"#deduplication",title:e.jsx(e.Fragment,{children:"Deduplication"})},{depth:3,url:"#example-3",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#cli-3",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:3,url:"#when-to-use-3",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#sequentialautomerge",title:e.jsx(e.Fragment,{children:"sequentialAutoMerge"})},{depth:3,url:"#configuration-4",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm-4",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#example-4",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#cli-4",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:3,url:"#when-to-use-4",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#doublepass",title:e.jsx(e.Fragment,{children:"doublePass"})},{depth:3,url:"#configuration-5",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm-5",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#example-5",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#cli-5",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:3,url:"#when-to-use-5",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#doublepassautomerge",title:e.jsx(e.Fragment,{children:"doublePassAutoMerge"})},{depth:3,url:"#configuration-6",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#algorithm-6",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:3,url:"#example-6",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#cli-6",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:3,url:"#when-to-use-6",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#choosing-a-strategy",title:e.jsx(e.Fragment,{children:"Choosing a Strategy"})},{depth:3,url:"#when-speed-matters",title:e.jsx(e.Fragment,{children:"When speed matters"})},{depth:3,url:"#when-quality-matters",title:e.jsx(e.Fragment,{children:"When quality matters"})},{depth:3,url:"#when-arrays-matter",title:e.jsx(e.Fragment,{children:"When arrays matter"})},{depth:3,url:"#quick-decision-flowchart",title:e.jsx(e.Fragment,{children:"Quick decision flowchart"})},{depth:3,url:"#worked-examples",title:e.jsx(e.Fragment,{children:"Worked examples"})},{depth:4,url:"#50-page-pdf-invoice-with-200-line-items",title:e.jsx(e.Fragment,{children:"50-page PDF invoice with 200 line items"})},{depth:4,url:"#3-page-real-estate-exposé-with-floor-plan-images",title:e.jsx(e.Fragment,{children:"3-page real estate exposé with floor plan images"})},{depth:4,url:"#2-page-contract--parties-dates-value",title:e.jsx(e.Fragment,{children:"2-page contract — parties, dates, value"})},{depth:4,url:"#500-product-datasheets",title:e.jsx(e.Fragment,{children:"500 product datasheets"})},{depth:2,url:"#writing-a-custom-strategy",title:e.jsx(e.Fragment,{children:"Writing a Custom Strategy"})},{depth:3,url:"#the-interface",title:e.jsx(e.Fragment,{children:"The interface"})},{depth:3,url:"#using-built-in-helpers",title:e.jsx(e.Fragment,{children:"Using built-in helpers"})},{depth:3,url:"#a-complete-example",title:e.jsx(e.Fragment,{children:"A complete example"})},{depth:3,url:"#emitting-step-events",title:e.jsx(e.Fragment,{children:"Emitting step events"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function s(n){const i={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"A strategy is the orchestration engine. It decides how to split the input, how many LLM calls to make, whether to run them concurrently or sequentially, and how to combine results."}),`
`,e.jsx(i.h2,{id:"strategy-comparison",children:"Strategy comparison"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Strategy"}),e.jsx(i.th,{children:"Speed"}),e.jsx(i.th,{children:"Context"}),e.jsx(i.th,{children:"Arrays"}),e.jsx(i.th,{children:"Token Cost"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"simple"})}),e.jsx(i.td,{children:"Fastest"}),e.jsx(i.td,{children:"Full"}),e.jsx(i.td,{children:"—"}),e.jsx(i.td,{children:"Lowest"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"parallel"})}),e.jsx(i.td,{children:"Fast"}),e.jsx(i.td,{children:"None"}),e.jsx(i.td,{children:"LLM merge"}),e.jsx(i.td,{children:"Medium"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"sequential"})}),e.jsx(i.td,{children:"Medium"}),e.jsx(i.td,{children:"Full"}),e.jsx(i.td,{children:"Context"}),e.jsx(i.td,{children:"Medium"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"parallelAutoMerge"})}),e.jsx(i.td,{children:"Fast"}),e.jsx(i.td,{children:"None"}),e.jsx(i.td,{children:"Auto + dedupe"}),e.jsx(i.td,{children:"Medium"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"sequentialAutoMerge"})}),e.jsx(i.td,{children:"Medium"}),e.jsx(i.td,{children:"Full"}),e.jsx(i.td,{children:"Auto + dedupe"}),e.jsx(i.td,{children:"Medium"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"doublePass"})}),e.jsx(i.td,{children:"Slow"}),e.jsx(i.td,{children:"Full"}),e.jsx(i.td,{children:"LLM merge"}),e.jsx(i.td,{children:"High"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"doublePassAutoMerge"})}),e.jsx(i.td,{children:"Slow"}),e.jsx(i.td,{children:"Full"}),e.jsx(i.td,{children:"Auto + dedupe"}),e.jsx(i.td,{children:"High"})]})]})]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"simple",children:"simple"}),`
`,e.jsx(i.p,{children:"Single-shot extraction for small inputs."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{children:"Value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Name"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'"simple"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LLM calls"}),e.jsx(i.td,{children:"1"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Parallelism"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Merge step"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dedupe step"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Best for"}),e.jsx(i.td,{children:"Small, single-chunk inputs"})]})]})]}),`
`,e.jsx(i.h3,{id:"configuration",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"model"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsxs(i.td,{children:["Model instance from ",e.jsx(i.code,{children:"@ai-sdk/*"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"outputInstructions"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Extra instructions for the model"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"strict"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})}),e.jsxs(i.td,{children:["Always ",e.jsx(i.code,{children:"true"})," for simple (single-shot, no intermediate steps)"]})]})]})]}),`
`,e.jsx(i.h3,{id:"algorithm",children:"Algorithm"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Build extraction prompt from artifacts + schema"}),`
`,e.jsx(i.li,{children:"Send to LLM"}),`
`,e.jsx(i.li,{children:"Validate output against the schema"}),`
`,e.jsx(i.li,{children:"Retry on validation failure (up to 3 attempts)"}),`
`,e.jsx(i.li,{children:"Return validated output"}),`
`]}),`
`,e.jsx(i.h3,{id:"example",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, simple } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"simple"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h3,{id:"cli",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" document.txt"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# --strategy simple is the default"})})]})})}),`
`,e.jsx(i.h3,{id:"when-to-use",children:"When to use"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Document fits within the model's context window (~10k tokens)"}),`
`,e.jsx(i.li,{children:"Simple schema without nested arrays"}),`
`,e.jsx(i.li,{children:"Testing or prototyping"}),`
`,e.jsx(i.li,{children:"Speed is the priority"}),`
`]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"parallel",children:"parallel"}),`
`,e.jsx(i.p,{children:"Concurrent batch processing with LLM merge."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{children:"Value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Name"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'"parallel"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LLM calls"}),e.jsx(i.td,{children:"N batches + 1 merge"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Parallelism"}),e.jsx(i.td,{children:"Full"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Merge step"}),e.jsx(i.td,{children:"LLM merge"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dedupe step"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Best for"}),e.jsx(i.td,{children:"Large inputs, speed priority"})]})]})]}),`
`,e.jsx(i.h3,{id:"configuration-1",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"model"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for extraction"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"mergeModel"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for merging partial results"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"chunkSize"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Token budget per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"concurrency"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"All batches"}),e.jsx(i.td,{children:"Max parallel batches"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"maxImages"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Unlimited"}),e.jsx(i.td,{children:"Max images per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"outputInstructions"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Extra instructions"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"strict"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})}),e.jsx(i.td,{children:"Validate required fields on every step"})]})]})]}),`
`,e.jsx(i.h3,{id:"algorithm-1",children:"Algorithm"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["Split artifacts into batches (respecting ",e.jsx(i.code,{children:"chunkSize"})," and ",e.jsx(i.code,{children:"maxImages"}),")"]}),`
`,e.jsx(i.li,{children:"Extract from each batch concurrently"}),`
`,e.jsx(i.li,{children:"Validate each batch output with retry"}),`
`,e.jsxs(i.li,{children:["Send all partial results to ",e.jsx(i.code,{children:"mergeModel"})," for LLM merge"]}),`
`,e.jsx(i.li,{children:"Validate merged output"}),`
`,e.jsx(i.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(i.h3,{id:"example-1",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, parallel } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parallel"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    mergeModel: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    concurrency: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h3,{id:"cli-1",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" large.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallel"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsx(i.h3,{id:"when-to-use-1",children:"When to use"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Speed is the top priority"}),`
`,e.jsx(i.li,{children:"Chunks are relatively independent"}),`
`,e.jsx(i.li,{children:"Many documents to process"}),`
`,e.jsx(i.li,{children:"Can accept potential loss of cross-chunk context"}),`
`]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"sequential",children:"sequential"}),`
`,e.jsx(i.p,{children:"Process chunks in order with context preservation."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{children:"Value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Name"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'"sequential"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LLM calls"}),e.jsx(i.td,{children:"N batches"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Parallelism"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Merge step"}),e.jsx(i.td,{children:"Context carryover"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dedupe step"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Best for"}),e.jsx(i.td,{children:"Context-dependent documents"})]})]})]}),`
`,e.jsx(i.h3,{id:"configuration-2",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"model"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for extraction"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"chunkSize"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Token budget per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"maxImages"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Unlimited"}),e.jsx(i.td,{children:"Max images per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"outputInstructions"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Extra instructions"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"strict"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})}),e.jsx(i.td,{children:"Validate required fields on every step"})]})]})]}),`
`,e.jsx(i.h3,{id:"algorithm-2",children:"Algorithm"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Split artifacts into batches"}),`
`,e.jsxs(i.li,{children:["For each batch in order:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Build prompt including previous extraction result as context"}),`
`,e.jsx(i.li,{children:"Extract from batch"}),`
`,e.jsx(i.li,{children:"Validate with retry"}),`
`,e.jsx(i.li,{children:"Store result for next iteration"}),`
`]}),`
`]}),`
`,e.jsx(i.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(i.h3,{id:"example-2",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, sequential } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"sequential"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h3,{id:"cli-2",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" report.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sequential"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsx(i.h3,{id:"when-to-use-2",children:"When to use"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Context between chunks matters"}),`
`,e.jsx(i.li,{children:"Building data incrementally (e.g., accumulating line items)"}),`
`,e.jsx(i.li,{children:"Later sections reference earlier sections"}),`
`,e.jsx(i.li,{children:"Need better accuracy than parallel"}),`
`]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"parallelautomerge",children:"parallelAutoMerge"}),`
`,e.jsx(i.p,{children:"Parallel extraction with schema-aware merge and deduplication."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{children:"Value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Name"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'"parallel-auto-merge"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LLM calls"}),e.jsx(i.td,{children:"N batches + 1 dedupe"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Parallelism"}),e.jsx(i.td,{children:"Full"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Merge step"}),e.jsx(i.td,{children:"Schema-aware auto-merge"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dedupe step"}),e.jsx(i.td,{children:"CRC32 hash + LLM semantic"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Best for"}),e.jsx(i.td,{children:"Array extraction, duplicates possible"})]})]})]}),`
`,e.jsx(i.h3,{id:"configuration-3",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"model"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for extraction"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"chunkSize"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Token budget per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"concurrency"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"All batches"}),e.jsx(i.td,{children:"Max parallel batches"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"maxImages"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Unlimited"}),e.jsx(i.td,{children:"Max images per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"outputInstructions"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Extra instructions"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"dedupeModel"})}),e.jsx(i.td,{children:"No"}),e.jsxs(i.td,{children:["Same as ",e.jsx(i.code,{children:"model"})]}),e.jsx(i.td,{children:"Model for semantic dedupe"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"strict"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})}),e.jsx(i.td,{children:"Validate required fields on every step"})]})]})]}),`
`,e.jsx(i.h3,{id:"algorithm-3",children:"Algorithm"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Split artifacts into batches"}),`
`,e.jsx(i.li,{children:"Extract from each batch concurrently"}),`
`,e.jsx(i.li,{children:"Validate each batch output with retry"}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Schema-aware merge:"})," arrays concatenate, objects shallow-merge, scalars prefer new values"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Hash dedupe:"})," CRC32 to remove exact duplicates"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Semantic dedupe:"})," LLM identifies semantically equivalent entries"]}),`
`,e.jsx(i.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(i.h3,{id:"merge-behavior",children:"Merge behavior"}),`
`,e.jsxs(i.p,{children:["Schema-aware auto-merge via ",e.jsx(i.code,{children:"SmartDataMerger"}),":"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Arrays:"})," concatenated"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Objects:"})," shallow-merged (later keys overwrite earlier)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Scalars:"})," prefer newer non-empty values"]}),`
`]}),`
`,e.jsx(i.p,{children:"No LLM merge call — deterministic."}),`
`,e.jsx(i.h3,{id:"deduplication",children:"Deduplication"}),`
`,e.jsx(i.p,{children:"Two-stage:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"CRC32 hash:"})," Exact duplicates removed without LLM call"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"LLM semantic:"}),' Model identifies near-duplicates (e.g., "iPhone 15" vs "Apple iPhone 15 128GB")']}),`
`]}),`
`,e.jsx(i.h3,{id:"example-3",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, parallelAutoMerge } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parallelAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    dedupeModel: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    concurrency: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h3,{id:"cli-3",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" catalog.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallelAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsx(i.h3,{id:"when-to-use-3",children:"When to use"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Extracting arrays that may have duplicates across chunks"}),`
`,e.jsx(i.li,{children:"Want to consolidate results without LLM merge cost"}),`
`,e.jsx(i.li,{children:"Documents have repeated information across pages"}),`
`,e.jsx(i.li,{children:"Need deterministic merge behavior"}),`
`]}),`
`,e.jsx(i.p,{children:"Best for: invoices with line items, real estate with multiple units, catalogs with products that appear on multiple pages."}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"sequentialautomerge",children:"sequentialAutoMerge"}),`
`,e.jsx(i.p,{children:"Sequential extraction with schema-aware merge and deduplication."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{children:"Value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Name"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'"sequential-auto-merge"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LLM calls"}),e.jsx(i.td,{children:"N batches + 1 dedupe"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Parallelism"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Merge step"}),e.jsx(i.td,{children:"Schema-aware auto-merge"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dedupe step"}),e.jsx(i.td,{children:"CRC32 hash + LLM semantic"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Best for"}),e.jsx(i.td,{children:"Ordered array extraction, context matters"})]})]})]}),`
`,e.jsx(i.h3,{id:"configuration-4",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"model"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for extraction"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"chunkSize"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Token budget per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"maxImages"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Unlimited"}),e.jsx(i.td,{children:"Max images per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"outputInstructions"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Extra instructions"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"dedupeModel"})}),e.jsx(i.td,{children:"No"}),e.jsxs(i.td,{children:["Same as ",e.jsx(i.code,{children:"model"})]}),e.jsx(i.td,{children:"Model for semantic dedupe"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"strict"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})}),e.jsx(i.td,{children:"Validate required fields on every step"})]})]})]}),`
`,e.jsx(i.h3,{id:"algorithm-4",children:"Algorithm"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Split artifacts into batches"}),`
`,e.jsxs(i.li,{children:["For each batch in order:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Extract from batch"}),`
`,e.jsx(i.li,{children:"Validate with retry"}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Schema-aware merge"})," with previous results"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Hash dedupe:"})," CRC32 to remove exact duplicates"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Semantic dedupe:"})," LLM identifies semantically equivalent entries"]}),`
`,e.jsx(i.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(i.h3,{id:"example-4",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, sequentialAutoMerge } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"sequentialAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    dedupeModel: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h3,{id:"cli-4",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sequentialAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsx(i.h3,{id:"when-to-use-4",children:"When to use"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ordered list extraction with cross-chunk dependencies"}),`
`,e.jsx(i.li,{children:"Later chunks need context from earlier chunks"}),`
`,e.jsx(i.li,{children:"Arrays may have duplicates across pages"}),`
`,e.jsx(i.li,{children:"Context preservation matters"}),`
`]}),`
`,e.jsx(i.p,{children:"Best for: multi-page invoices with line items that span pages, real estate exposés with units referenced across pages."}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"doublepass",children:"doublePass"}),`
`,e.jsx(i.p,{children:"Parallel pass for speed, sequential pass for refinement."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{children:"Value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Name"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'"double-pass"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LLM calls"}),e.jsx(i.td,{children:"N × 2 batches + 1 merge"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Parallelism"}),e.jsx(i.td,{children:"First pass full, second pass none"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Merge step"}),e.jsx(i.td,{children:"LLM merge (pass 1), context carryover (pass 2)"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dedupe step"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Best for"}),e.jsx(i.td,{children:"High-stakes extraction, maximum quality"})]})]})]}),`
`,e.jsx(i.h3,{id:"configuration-5",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"model"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for extraction"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"mergeModel"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for merging partial results"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"chunkSize"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Token budget per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"concurrency"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"All batches"}),e.jsx(i.td,{children:"Max parallel batches"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"maxImages"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Unlimited"}),e.jsx(i.td,{children:"Max images per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"outputInstructions"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Extra instructions"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"strict"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})}),e.jsx(i.td,{children:"Validate required fields on every step"})]})]})]}),`
`,e.jsx(i.h3,{id:"algorithm-5",children:"Algorithm"}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Pass 1 (parallel):"})}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Split artifacts into batches"}),`
`,e.jsx(i.li,{children:"Extract from each batch concurrently"}),`
`,e.jsx(i.li,{children:"Validate each batch output with retry"}),`
`,e.jsx(i.li,{children:"LLM merge all partial results"}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Pass 2 (sequential):"})}),`
`,e.jsxs(i.ol,{start:"5",children:[`
`,e.jsxs(i.li,{children:["For each batch in order:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Build prompt including pass 1 result as context"}),`
`,e.jsx(i.li,{children:"Extract from batch"}),`
`,e.jsx(i.li,{children:"Validate with retry"}),`
`,e.jsx(i.li,{children:"Store result for next iteration"}),`
`]}),`
`]}),`
`,e.jsx(i.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(i.h3,{id:"example-5",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, doublePass } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"doublePass"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    mergeModel: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h3,{id:"cli-5",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" critical.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doublePass"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o"})]})})})}),`
`,e.jsx(i.h3,{id:"when-to-use-5",children:"When to use"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Accuracy is more important than cost"}),`
`,e.jsx(i.li,{children:"High-stakes extractions"}),`
`,e.jsx(i.li,{children:"Complex schemas"}),`
`,e.jsx(i.li,{children:"Can afford two full passes"}),`
`]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"doublepassautomerge",children:"doublePassAutoMerge"}),`
`,e.jsx(i.p,{children:"Double-pass extraction with schema-aware merge and deduplication."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{children:"Value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Name"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'"double-pass-auto-merge"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LLM calls"}),e.jsx(i.td,{children:"N × 2 batches + 1 dedupe"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Parallelism"}),e.jsx(i.td,{children:"First pass full, second pass none"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Merge step"}),e.jsx(i.td,{children:"Schema-aware auto-merge"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dedupe step"}),e.jsx(i.td,{children:"CRC32 hash + LLM semantic"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Best for"}),e.jsx(i.td,{children:"Large array extraction, maximum quality"})]})]})]}),`
`,e.jsx(i.h3,{id:"configuration-6",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"model"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for extraction"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"chunkSize"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Token budget per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"concurrency"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"All batches"}),e.jsx(i.td,{children:"Max parallel batches"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"maxImages"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Unlimited"}),e.jsx(i.td,{children:"Max images per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"outputInstructions"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Extra instructions"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"dedupeModel"})}),e.jsx(i.td,{children:"No"}),e.jsxs(i.td,{children:["Same as ",e.jsx(i.code,{children:"model"})]}),e.jsx(i.td,{children:"Model for semantic dedupe"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"strict"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})}),e.jsx(i.td,{children:"Validate required fields on every step"})]})]})]}),`
`,e.jsx(i.h3,{id:"algorithm-6",children:"Algorithm"}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Pass 1 (parallel):"})}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Split artifacts into batches"}),`
`,e.jsx(i.li,{children:"Extract from each batch concurrently"}),`
`,e.jsx(i.li,{children:"Validate each batch output with retry"}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Schema-aware merge"})," all partial results"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Hash dedupe:"})," CRC32"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Semantic dedupe:"})," LLM"]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Pass 2 (sequential):"})}),`
`,e.jsxs(i.ol,{start:"7",children:[`
`,e.jsxs(i.li,{children:["For each batch in order:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Build prompt including deduped pass 1 result as context"}),`
`,e.jsx(i.li,{children:"Extract from batch"}),`
`,e.jsx(i.li,{children:"Validate with retry"}),`
`,e.jsx(i.li,{children:"Store result for next iteration"}),`
`]}),`
`]}),`
`,e.jsx(i.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(i.h3,{id:"example-6",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, doublePassAutoMerge } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"doublePassAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    dedupeModel: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h3,{id:"cli-6",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" catalog.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doublePassAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o"})]})})})}),`
`,e.jsx(i.h3,{id:"when-to-use-6",children:"When to use"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Large array extraction with maximum quality requirement"}),`
`,e.jsx(i.li,{children:"Arrays may have duplicates"}),`
`,e.jsx(i.li,{children:"Cross-chunk context matters"}),`
`,e.jsx(i.li,{children:"Quality trumps cost"}),`
`]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"choosing-a-strategy",children:"Choosing a Strategy"}),`
`,e.jsx(i.p,{children:"Pick based on input size and whether you're extracting arrays:"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Strategy"}),e.jsx(i.th,{children:"When to use"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"simple"})}),e.jsx(i.td,{children:"Small input, fits in one context window"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"parallel"})}),e.jsx(i.td,{children:"Large input, order doesn't matter, scalar fields"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"sequential"})}),e.jsx(i.td,{children:"Large input, context carries across chunks"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"parallelAutoMerge"})}),e.jsx(i.td,{children:"Large input with arrays — parallel + dedup"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"sequentialAutoMerge"})}),e.jsx(i.td,{children:"Large input with arrays — sequential + dedup"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"doublePass"})}),e.jsx(i.td,{children:"Quality matters, two-pass refinement"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"doublePassAutoMerge"})}),e.jsx(i.td,{children:"Quality + arrays + dedup"})]})]})]}),`
`,e.jsx(i.h3,{id:"when-speed-matters",children:"When speed matters"}),`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.code,{children:"parallel"})," or ",e.jsx(i.code,{children:"parallelAutoMerge"}),". Accept that cross-chunk context is limited."]}),`
`,e.jsx(i.h3,{id:"when-quality-matters",children:"When quality matters"}),`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.code,{children:"doublePass"})," or ",e.jsx(i.code,{children:"doublePassAutoMerge"}),". Accept higher token cost."]}),`
`,e.jsx(i.h3,{id:"when-arrays-matter",children:"When arrays matter"}),`
`,e.jsxs(i.p,{children:["Use auto-merge variants (",e.jsx(i.code,{children:"parallelAutoMerge"}),", ",e.jsx(i.code,{children:"sequentialAutoMerge"}),", ",e.jsx(i.code,{children:"doublePassAutoMerge"}),"). They handle deduplication automatically."]}),`
`,e.jsx(i.h3,{id:"quick-decision-flowchart",children:"Quick decision flowchart"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowchart TD"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    A[Start] --> B{Input fits in context?}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    B -->|Yes| C[Use simple]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    B -->|No| D{Extracting arrays?}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    D -->|Yes| E{Cross-chunk context matters?}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    D -->|No| F{Cross-chunk context matters?}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    E -->|Yes| G[sequentialAutoMerge or doublePassAutoMerge]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    E -->|No| H[parallelAutoMerge]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    F -->|Yes| I[sequential or doublePass]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    F -->|No| J[parallel]"})})]})})}),`
`,e.jsx(i.h3,{id:"worked-examples",children:"Worked examples"}),`
`,e.jsx(i.h4,{id:"50-page-pdf-invoice-with-200-line-items",children:"50-page PDF invoice with 200 line items"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Use:"})," ",e.jsx(i.code,{children:"parallelAutoMerge"})," or ",e.jsx(i.code,{children:"sequentialAutoMerge"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallelAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsxs(i.p,{children:["Choose ",e.jsx(i.code,{children:"sequentialAutoMerge"})," if line items span page boundaries and reference earlier context."]}),`
`,e.jsx(i.h4,{id:"3-page-real-estate-exposé-with-floor-plan-images",children:"3-page real estate exposé with floor plan images"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Use:"})," ",e.jsx(i.code,{children:"sequential"})," or ",e.jsx(i.code,{children:"sequentialAutoMerge"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" expose.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" property.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sequentialAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsx(i.p,{children:"Images are handled by vision models without OCR."}),`
`,e.jsx(i.h4,{id:"2-page-contract--parties-dates-value",children:"2-page contract — parties, dates, value"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Use:"})," ",e.jsx(i.code,{children:"simple"})," or ",e.jsx(i.code,{children:"sequential"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" contract.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" contract.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"simple"})," if it fits in context; ",e.jsx(i.code,{children:"sequential"})," if you need incremental building."]}),`
`,e.jsx(i.h4,{id:"500-product-datasheets",children:"500 product datasheets"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Use:"})," ",e.jsx(i.code,{children:"parallelAutoMerge"})," with concurrency"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" f "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" datasheets/*.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"do"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  markitdown"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$f"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" product.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallelAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"done"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" jq"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -s"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '.'"})]})]})})}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"writing-a-custom-strategy",children:"Writing a Custom Strategy"}),`
`,e.jsx(i.h3,{id:"the-interface",children:"The interface"}),`
`,e.jsx(i.p,{children:"A strategy has:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" myStrategy"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  name: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"my-strategy"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // Optional: used by CLI progress bar."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  getEstimatedSteps"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"artifacts"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 3"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  async"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"options"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Your orchestration logic here."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { data: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", usage: { inputTokens: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", outputTokens: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", totalTokens: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" } };"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"};"})})]})})}),`
`,e.jsx(i.h3,{id:"using-built-in-helpers",children:"Using built-in helpers"}),`
`,e.jsxs(i.p,{children:["Key internal helpers from ",e.jsx(i.code,{children:"strategies/utils.ts"}),":"]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Helper"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"getBatches(artifacts, { maxTokens, maxImages? })"})}),e.jsx(i.td,{children:"Chunk artifacts into batches"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"extractWithPrompt({ model, schema, system, user, artifacts, events, execute? })"})}),e.jsx(i.td,{children:"Run one LLM extraction with retries"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"serializeSchema(schema)"})}),e.jsx(i.td,{children:"Convert schema to JSON string for prompt"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"mergeUsage([...usages])"})}),e.jsx(i.td,{children:"Accumulate usage across calls"})]})]})]}),`
`,e.jsx(i.h3,{id:"a-complete-example",children:"A complete example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extractWithPrompt, getBatches, mergeUsage, serializeSchema } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk/strategies/utils"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { buildExtractorPrompt } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk/prompts/ExtractorPrompt"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" myStrategy"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"config"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  name: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"my-strategy"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  getEstimatedSteps"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"artifacts"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" batches"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getBatches"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(artifacts, { maxTokens: config.chunkSize });"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" batches."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"length"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  async"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"options"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" batches"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getBatches"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(options.artifacts, {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      maxTokens: config.chunkSize,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    });"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" schema"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" serializeSchema"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(options.schema);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" usages"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [];"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" currentData "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {};"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"index"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"batch"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"of"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" batches."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"entries"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" prompt"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" buildExtractorPrompt"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(batch, schema);"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extractWithPrompt"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        model: config.model,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        schema: options.schema,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        system: prompt.system,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        user: prompt.user,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        artifacts: batch,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        events: options.events,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      });"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      currentData "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"currentData, "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"result.data };"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      usages."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"push"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result.usage);"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      await"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" options.events?."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"onStep"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?.({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        step: index "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        total: batches."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"length"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        label: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`batch ${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"index"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"batches"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"length"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}`"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      });"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { data: currentData, usage: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mergeUsage"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(usages) };"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h3,{id:"emitting-step-events",children:"Emitting step events"}),`
`,e.jsxs(i.p,{children:["Strategies should emit ",e.jsx(i.code,{children:"events.onStep"})," for progress tracking:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"await"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" options.events?."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"onStep"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?.({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  step: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  total: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  label: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"extract"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"})," — where strategies fit"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/chunking",children:"Chunking & Token Budgets"})," — how batches are formed"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/validation",children:"Validation & Retries"})," — the retry loop"]}),`
`]})]})}function d(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(s,{...n})}):s(n)}export{a as _markdown,d as default,l as frontmatter,r as structuredData,h as toc};
