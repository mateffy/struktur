# Struktur: Structured Data Extraction for the Shell

At Mateffy Software Research, we kept encountering a familiar bottleneck: large document batches arriving on tight deadlines, with the actual value locked inside semi-structured text. The pattern repeated across domains. Hundreds of PDF datasheets had to become database rows. Invoices needed to flow into spreadsheets before anyone could even begin analysis. The tooling existed, but the orchestration overhead was disproportionate.

Struktur is our response: a CLI designed for high-throughput, schema-first extraction of structured JSON. You provide a schema and an input stream, and Struktur handles chunking, validation, retries, and output formatting. It reads from stdin, writes to stdout, and integrates naturally with `jq` and standard shell pipelines. Minimal ceremony, maximal signal. No cap.

## What it looks like

Extract product data from a PDF:

```bash
markitdown datasheet.pdf | struktur \
  --stdin \
  --schema products.json \
  --model openai/gpt-4o-mini
```

Process a directory of invoices and dump them into Postgres:

```bash
find ./invoices -name "*.pdf" -exec markitdown {} \; | \
  struktur --stdin \
    --schema-json '{"type":"object","properties":{"invoices":{"type":"array","items":{"type":"object","properties":{"number":{"type":"string"},"total":{"type":"number"}}}}}}' \
    --model openai/gpt-4o-mini | \
  jq '.invoices[]' | \
  psql -c "COPY invoices FROM STDIN"
```

No Python. No notebooks. Just pipes.

## The problem with existing tools

Most AI extraction products implicitly assume you are building a bespoke application. They ship as SDKs, not utilities, and expect you to write orchestration code that is orthogonal to the extraction problem itself. That is reasonable if extraction is your core product. It is inefficient when you simply need reliable data output.

Managed APIs compound the issue. They charge per page, impose schema constraints, and often require document uploads to external infrastructure. That is a non-starter for many confidential workloads.

We wanted an equivalent of `jq` for documents: a dependable, composable CLI that can be dropped into a pipeline and forgotten.

## How it works

Struktur does not parse documents; it operates on normalized text artifacts. You preprocess with the tool best suited to your format, such as `markitdown` for Office/PDF or `pdftotext` for plain text. Struktur assumes the parsing step is handled upstream and focuses on extraction quality and reliability downstream.

The extraction loop:

1. Split the input into chunks that fit in the model's context window
2. Send each chunk to the LLM with your schema
3. Validate the output against the schema
4. If validation fails, feed the errors back to the model and retry
5. Merge results from all chunks

The retry step is critical. LLMs can self-correct when the failure mode is explicit. Struktur surfaces Ajv validation errors and feeds them back to the model for correction. In practice, most extractions converge within two attempts.

## CLI reference

**Extract from a file:**
```bash
struktur --input report.pdf --schema schema.json --model openai/gpt-4o-mini
```

**Read from stdin:**
```bash
cat document.txt | struktur --stdin --schema schema.json --model anthropic/claude-3-haiku-20240307
```

**Inline schema for quick jobs:**
```bash
struktur --input memo.txt \
  --schema-json '{"type":"object","properties":{"summary":{"type":"string"}}}' \
  --model openai/gpt-4o-mini
```

**Manage API tokens:**
```bash
# Store a token (reads from stdin to avoid shell history)
echo "$OPENAI_API_KEY" | struktur auth set --provider openai --token-stdin

# List configured providers
struktur auth list

# Environment variables override stored tokens
export OPENAI_API_KEY=sk-...
```

**See available models:**
```bash
struktur models --provider openai
struktur models --all
```

## Strategies

The CLI defaults to a simple single-shot strategy. For larger documents or programmatic workflows, the TypeScript API exposes additional strategies:

**simple** — Send everything at once. Works when your input fits in context.

**parallel** — Chunk the input, process batches concurrently, merge with an LLM. Fast but can miss cross-document context.

**sequential** — Process chunks in order, passing previous results as context. Slower but maintains coherence.

**parallelAutoMerge** — Parallel extraction with smart merging. Uses schema structure to concatenate arrays and merge objects correctly, then runs deduplication to remove redundant items.

**doublePass** — First pass parallel for speed, second pass sequential for refinement. For complex extractions where quality matters more than speed.

The auto-merge strategies are schema-aware. Arrays are concatenated rather than overwritten, and objects are merged with structural intent. Deduplication runs in two stages: a hash-based pass for exact duplicates, followed by an LLM pass for semantic duplicates (e.g., "iPhone 15" vs "Apple iPhone 15 128GB").

## TypeScript API

The CLI covers most workflows, but research and production integrations often need more control:

```typescript
import { extract, parallelAutoMerge } from "@mateffy/struktur";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts: documents,
  schema: productSchema,
  strategy: parallelAutoMerge({
    model: openai("gpt-4o"),
    chunkSize: 8000,
    concurrency: 4,
  }),
  events: {
    onProgress: ({ percent }) => console.log(`${percent}%`),
    onTokenUsage: ({ outputTokens }) => console.log(`${outputTokens} tokens`),
  }
});
```

The API provides all strategies, event hooks for progress and token telemetry, and TypeScript types inferred directly from your JSON schema.

## Patterns

**Watch a folder and process new files:**
```bash
inotifywait -m ./incoming -e create -e moved_to |
  while read -r path action file; do
    [[ "$file" == *.pdf ]] && markitdown "$path/$file" | \
      struktur --stdin --schema invoice.json --model openai/gpt-4o-mini >> processed.jsonl
  done
```

**Enrich existing records:**
```bash
cat customers.json | jq -c '.[]' | while read -r row; do
  url=$(echo "$row" | jq -r '.contract_url')
  curl -s "$url" | struktur --stdin \
    --schema-json '{"type":"object","properties":{"start_date":{"type":"string"},"value":{"type":"number"}}}' \
    --model openai/gpt-4o-mini | \
  jq --argjson orig "$row" '$orig + .'
done | jq -s '.'
```

**Test a schema against sample data:**
```bash
for f in samples/*.pdf; do
  markitdown "$f" | struktur --stdin --schema v2.json --model openai/gpt-4o-mini 2>&1 | \
  jq -e '.' || echo "FAILED: $f"
done
```

## Tradeoffs

Struktur is intentionally scoped:

**It does not parse documents.** You handle parsing upstream. This keeps Struktur focused and allows best-of-breed parsers per format.

**It is batch-oriented.** There is no streaming mode. You provide a document and receive JSON.

**It requires a Vercel AI SDK-compatible provider.** OpenAI, Anthropic, and Google work out of the box; self-hosted models need an OpenAI-compatible API.

**Costs depend on your provider.** A 50-page PDF might consume 100k tokens. Know your rates.

## Installation

```bash
npm install -g @mateffy/struktur
```

Store your API key:

```bash
struktur auth set --provider openai --token-stdin
# paste key, ctrl+d
```

Extract something:

```bash
struktur --input document.pdf --schema schema.json --model openai/gpt-4o-mini
```
