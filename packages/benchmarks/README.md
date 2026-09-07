# @struktur/benchmarks

Benchmark harness for `@struktur/sdk` structured extraction. Runs a matrix of
`case × track × strategy` through `extract()`, scores the output field-by-field
against a gold answer, and reports F1 / validity / token cost / latency.

It measures the **harness** (strategies, prompts, schemas, chunking) — the model
is a fixed baseline: `openrouter/deepseek/deepseek-v4-flash-vision-exp`
(~$0.60/M tokens, vision-capable), overridable via `runBenchmark({ model })`.

## Concepts

- **case** — one input + one schema + one `gold` answer (a fully-populated
  instance of the schema). The unit that everything else is built from.
- **track** — which images accompany the (always-present) text:
  `text`, `text+embedded`, `text+screenshots`, `text+embedded+screenshots`.
- **gold** — ground truth. For upstream datasets it's their annotation files,
  converted by an importer into a schema instance. For your own data you write
  it by hand.

## Usage

```ts
import { z } from "zod";
import { parse } from "@struktur/sdk";
import { defineCase, runBenchmark, saveReport } from "@struktur/benchmarks";

const invoiceSchema = z.object({
  company: z.string().nullable(),
  total: z.number().nullable(),
  items: z.array(z.object({ name: z.string(), qty: z.number() })),
});

const myCase = defineCase({
  id: "invoice-1",
  schema: invoiceSchema, // gold is type-checked against this
  gold: { company: "ACME Inc", total: 42.5, items: [{ name: "Widget", qty: 2 }] },
  artifacts: await parse(
    { kind: "buffer", buffer: pdfBytes, mimeType: "application/pdf" },
    { includeImages: true },
  ),
  // tracks default to all four; PDFs are re-parsed per track automatically
});

const report = await runBenchmark({
  cases: [myCase],
  strategies: [
    "simple",
    "parallel",
    // prompt variant:
    { builtin: "simple", instructions: "Extract only totals.", label: "simple+totals" },
    // custom strategy (anything implementing ExtractionStrategy, or a factory):
    (model) => myCustomStrategy(model),
  ],
});

console.log(report.summary); // strategy × track → F1 / precision / recall / valid / tokens / ms
await saveReport(report, "results/run-1.json"); // writes .json + .md
```

## Scoring

Leaf fields are compared individually with per-field metrics
(`exact`, `normalized` [default], `tolerance`, `semantic`) and arrays can be
aligned by a key field instead of position:

```ts
defineCase({
  id: "x",
  schema,
  gold,
  artifacts,
  metrics: {
    default: "normalized",
    fields: { total: "tolerance" },
    arrays: [{ path: "items", key: "name" }],
  },
});
```

`null`/absent/`undefined` are equivalent: extracting nothing where there is
nothing is correct. Omission (gold field missing from output) and hallucination
(extra field) are counted separately and feed precision/recall/F1.

## Datasets

Downloaded on demand into `~/.struktur/benchmarks/<id>/<version>/` (override
with `STRUKTUR_BENCHMARKS_DIR`), cached after first conversion.

```ts
import { loadDataset, sroie, generateKeyValueCases } from "@struktur/benchmarks/datasets";

const cases = await loadDataset(sroie, { limit: 20 }); // SROIE receipts (HF mirror)

const offline = generateKeyValueCases("kv", [
  { name: "name" },
  { name: "price", type: "number" },
], 100, /* seed */ 42); // deterministic, no network
```

CLI: `struktur-benchmarks ls` / `struktur-benchmarks fetch sroie` /
`struktur-benchmarks fetch --all`.

## Caching

Result cells are cached by `(case, track, strategy, schema, gold, model,
variant)`. Re-runs only pay for changed cells. Pass `variant` to invalidate
when a strategy's config changes, or `cache: false` to skip.
