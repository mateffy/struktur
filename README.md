<div align="center">
    <img src="./resources/struktur-icon.png" alt="Struktur Logo" width="120" />
</div>
<h1 align="center">Struktur</h1>

Structured data extraction for LLMs. Feed it documents, get back validated JSON. Handles chunking, retries, merging, and deduplication — you define the schema.

```bash
struktur extract --input ./invoice.txt --fields "number, vendor, total:number"

# or using pipes:

echo "Invoice #1042, Acme Corp, $2,400.00 due April 1" | struktur extract --stdin \
  --schema ./invoice-schema.json \
  --model openai/gpt-5-mini
```

```json
{ "number": "1042", "vendor": "Acme Corp", "total": 2400 }
```

---

## Install

```bash
npm install -g @mateffy/struktur
# or
bun add -g @mateffy/struktur
```

---

## CLI quickstart

**1. Set your API key**

Works with env variables or Struktur's built-in secure credential manager:

```bash
export OPENAI_API_KEY=sk-...
# or store it securely:
echo "sk-..." | struktur auth set --provider openai --token-stdin

# Set a default model (so you can skip `--model` every time)
struktur auth default openai
```

**2. Extract**

```bash
echo "Invoice #1042 from Acme Corp. Total: $2,400. Due: April 1, 2026." | \
  struktur --stdin \
  --fields "invoice_number, vendor, total:number, due_date" \
  --model openai/gpt-5-mini
```

Use `--fields` for quick one-liners. For full control, pass `--schema schema.json` instead.

→ [Full CLI reference](https://struktur.sh/docs/cli)

---

## SDK quickstart

```ts
import { extract, simple } from "@mateffy/struktur";
import { openai } from "@ai-sdk/openai";
import type { JSONSchemaType } from "ajv";

type Invoice = { number: string; vendor: string; total: number };

const schema: JSONSchemaType<Invoice> = {
  type: "object",
  properties: {
    number: { type: "string" },
    vendor: { type: "string" },
    total: { type: "number" },
  },
  required: ["number", "vendor", "total"],
  additionalProperties: false,
};

const result = await extract({
  artifacts: [/* Artifact[] */],
  schema,
  strategy: simple({ model: openai("gpt-4o-mini") }),
});

console.log(result.data.number); // fully typed
console.log(result.usage.totalTokens);
```

For quick extractions without writing a full JSON Schema, use the `fields` shorthand:

```ts
const result = await extract({
  artifacts,
  fields: "invoice_number, vendor, total:number, due_date",
  strategy: simple({ model: openai("gpt-4o-mini") }),
});
```

→ [Full SDK reference](https://struktur.sh/docs/sdk)

---

## How it works

Struktur operates on **Artifacts** — normalized JSON DTOs with text and media slices. It does not parse PDFs or HTML; that's your job upstream using standard tools (e.g. `markitdown`, `pdftotext`).

Once you have artifacts, a **strategy** takes over:

```
artifacts → strategy → [chunk] → [LLM call(s)] → [validate + retry] → [merge/dedupe] → result
```

Every LLM response is validated against your schema with Ajv. If it fails, the errors are sent back to the model automatically. Most extractions converge in one or two attempts.

→ [Extraction pipeline explained](https://struktur.sh/docs/explanation/pipeline)

---

## Strategies

Pick based on input size and whether you're extracting arrays:

| Strategy | When to use |
|---|---|
| `simple` | Small input, fits in one context window |
| `parallel` | Large input, order doesn't matter, scalar fields |
| `sequential` | Large input, context carries across chunks |
| `parallelAutoMerge` | Large input with arrays — parallel + dedup |
| `sequentialAutoMerge` | Large input with arrays — sequential + dedup |
| `doublePass` | Quality matters, two-pass refinement |
| `doublePassAutoMerge` | Quality + arrays + dedup |

```ts
import { extract, parallelAutoMerge } from "@mateffy/struktur";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: parallelAutoMerge({
    model: openai("gpt-4o-mini"),
    chunkSize: 10_000,
    concurrency: 4,
  }),
});
```

→ [Choosing a strategy](https://struktur.sh/docs/explanation/strategies/choosing)

---

## Fields shorthand

Skip the JSON Schema boilerplate for flat extractions:

```
"title, price:number, status:enum{draft|live}, tags:array{string}"
```

Supported types: `string` (default), `number`, `integer`, `boolean`, `enum{a|b}`, `array{type}`.

For optional fields, nested objects, or TypeScript inference on `result.data`, use a full `JSONSchemaType<T>` schema instead.

→ [Fields reference](https://struktur.sh/docs/sdk/fields)

---

## Documentation

Full documentation at **[struktur.sh](https://struktur.sh)**

- [Quickstart](https://struktur.sh/docs/quickstart)
- [CLI reference](https://struktur.sh/docs/cli)
- [SDK reference](https://struktur.sh/docs/sdk)
- [Strategies](https://struktur.sh/docs/explanation/strategies)
- [Examples](https://struktur.sh/docs/examples)
