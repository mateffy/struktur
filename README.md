<div align="center">
    <img src="./resources/struktur-icon.png" alt="Struktur Logo" width="120" />
</div>
<h1 align="center">Struktur</h1>

Structured data extraction for LLMs. Feed it documents, get back validated JSON. Handles chunking, retries, merging, and deduplication — you define the schema.

<br>
    
```bash
struktur extract --input ./invoice.pdf --fields "number, vendor, total:number"
```

```json
{ 
  "number": "1042", 
  "vendor": "Acme Corp", 
  "total": 2400 
}
```

Or using pipes:

```bash
curl https://example.com/rental-contract.docx | struktur extract --stdin \
  --schema ./contract-schema.json \
  --model openai/gpt-4o-mini
```

```json
{ 
  "tenant": "Jane Doe", 
  "rent": 1500, 
  "term_months": 12, 
  "start_date": "2026-05-01" 
}
```

<br>

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
echo "sk-..." | struktur config providers add openai --token-stdin

# Set a default model (so you can skip --model every time)
struktur config models use openai/gpt-4o-mini
```

**2. Extract**

```bash
# From a PDF — parsed automatically
struktur extract --input ./contract.pdf \
  --fields "parties:array{string}, effective_date, governing_law"

# From a plain text file
echo "Invoice #1042 from Acme Corp. Total: $2,400. Due: April 1, 2026." | \
  struktur extract \
  --fields "invoice_number, vendor, total:number, due_date" \
  --model openai/gpt-4o-mini
```

Use `--fields` for quick one-liners. For full control, pass `--schema schema.json` instead.

→ [Full CLI reference](https://struktur.sh/docs/cli)

---

## SDK quickstart

```ts
import { extract, simple, urlToArtifact } from "@mateffy/struktur";
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

const artifact = await urlToArtifact("https://example.com/invoice.pdf");

const result = await extract({
  artifacts: [artifact],
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

Struktur operates on **Artifacts** — normalized JSON DTOs with text and media slices. Pass in a file path, URL, or raw text; Struktur parses it automatically and hands the content to the LLM.

```
input → parse → artifacts → strategy → [chunk] → [LLM call(s)] → [validate + retry] → [merge/dedupe] → result
```

Every LLM response is validated against your schema with Ajv. If it fails, the errors are sent back to the model automatically. Most extractions converge in one or two attempts.

→ [Extraction pipeline explained](https://struktur.sh/docs/explanation/pipeline)

---

## Parsing

Struktur has a built-in parsing layer that converts files into Artifacts before extraction. You can use it standalone via the `parse` command, or it runs automatically when you pass `--input` to `extract`.

### Built-in formats

| Format | MIME type | Notes |
|---|---|---|
| PDF | `application/pdf` | Per-page text + embedded images |
| Plain text | `text/plain` | Split into paragraph blocks |
| Markdown | `text/markdown` | Treated as text |
| HTML | `text/html` | Treated as text |
| Images | `image/png`, `image/jpeg`, etc. | Passed through as image artifacts |
| Artifact JSON | `application/json` | Hydrated directly if valid `SerializedArtifact[]` |

### `struktur parse`

Convert any file or stdin to Artifact JSON. Useful for inspecting what Struktur sees before running extraction, or for building pipelines that cache parsed artifacts.

```bash
# Parse a PDF to Artifact JSON
struktur parse --input ./report.pdf

# Parse and save for later
struktur parse --input ./report.pdf --output ./report-artifact.json

# Skip image extraction from PDFs
struktur parse --input ./report.pdf --no-images

# Override MIME detection
struktur parse --input ./data.bin --mime application/pdf

# Pipe through stdin
cat ./report.pdf | struktur parse --stdin --mime application/pdf
```

### Custom parsers

Register external parsers for any MIME type — they handle the conversion and output `SerializedArtifact[]` JSON.

**npm package parser:**

```bash
struktur config parsers add --mime application/vnd.ms-excel --npm @myorg/excel-parser
```

The package must export at least one of `parseStream(stream, mimeType)` or `parseFile(path, mimeType)`, each returning `Promise<Artifact[]>`. Optionally export `detectFileType(header: Uint8Array): boolean` for magic-byte detection.

**Command-line parsers:**

```bash
# Command receives a file path via FILE_PATH placeholder
struktur config parsers add \
  --mime application/vnd.openxmlformats-officedocument.wordprocessingml.document \
  --file-command "markitdown FILE_PATH"

# Command reads from stdin, outputs SerializedArtifact[] JSON to stdout
struktur config parsers add \
  --mime text/html \
  --stdin-command "my-html-parser"
```

**Per-invocation override** (skips stored config):

```bash
struktur extract --input ./file.docx --parser @myorg/docx-parser --fields "title, summary"
```

**Manage configured parsers:**

```bash
struktur config parsers list
struktur config parsers get --mime application/vnd.ms-excel
struktur config parsers remove --mime application/vnd.ms-excel
```

### MIME detection

MIME type is detected automatically in this order:

1. **`--mime` flag** — always wins if provided
2. **Magic bytes** — `%PDF`, PNG header, JPEG/GIF/WebP markers, Office ZIP signatures
3. **npm parser `detectFileType`** — called with the first 512 bytes if the parser exports it
4. **File extension** — `.pdf`, `.txt`, `.md`, `.html`, `.json`, `.csv`, `.xml`, `.yaml`, `.docx`, `.xlsx`, `.pptx`, and more

For stdin with no `--mime`, falls back to `text/plain`.

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

## Configuration

All persistent settings live under `struktur config`.

### Providers

```bash
# Add a provider token
struktur config providers add openai --token sk-...
echo "sk-..." | struktur config providers add anthropic --token-stdin

# List all providers and their status
struktur config providers list

# Remove a token
struktur config providers remove openai
```

### Models

```bash
# Set a default model
struktur config models use openai/gpt-4o-mini

# List available models for a provider
struktur config models list --provider openai

# Aliases
struktur config models alias set fast openai/gpt-4o-mini
struktur config models alias set smart anthropic/claude-opus-4
struktur config models use fast
```

### Parsers

```bash
struktur config parsers list
struktur config parsers add --mime application/vnd.ms-excel --npm @myorg/excel-parser
struktur config parsers remove --mime application/vnd.ms-excel
```

---

## Documentation

Full documentation at **[struktur.sh](https://struktur.sh)**

- [Quickstart](https://struktur.sh/docs/quickstart)
- [CLI reference](https://struktur.sh/docs/cli)
- [SDK reference](https://struktur.sh/docs/sdk)
- [Strategies](https://struktur.sh/docs/explanation/strategies)
- [Examples](https://struktur.sh/docs/examples)
