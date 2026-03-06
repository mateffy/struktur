

Struktur is an all-in-one tool for structured data extraction that turns pre-parsed documents into validated, schema-typed JSON. It operates on Artifacts, chunks them by token budgets, runs extraction strategies, validates results against your schema, and merges or deduplicates outputs where needed.

Why Struktur? [#why-struktur]

Large document batches arrive with data locked in semi-structured text. Invoices need to flow into spreadsheets. Product datasheets need to become database rows. The tooling exists, but the orchestration overhead is disproportionate to the extraction task itself.

Managed APIs charge per page, impose schema constraints, and require document uploads to external infrastructure. LLM SDKs provide raw model access but leave you to write chunking, validation, retries, and merging every time.

Struktur fills the gap: a focused extraction engine that handles the orchestration so you can focus on the output.

Why not managed APIs? [#why-not-managed-apis]

| Limitation         | Impact                                  |
| ------------------ | --------------------------------------- |
| Per-page pricing   | Does not scale for large batches        |
| Schema constraints | You work within their data model        |
| Document upload    | Non-starter for confidential workloads  |
| Black-box behavior | Debugging extraction failures is opaque |

Why not a plain LLM SDK call? [#why-not-a-plain-llm-sdk-call]

A single `generateText()` call gives you:

* No chunking for large documents
* No retries on schema validation failure
* No merging of multi-chunk results
* No typed output inferred from your schema

You write the same orchestration boilerplate every time. Struktur packages that orchestration into tested, configurable strategies.

Design philosophy [#design-philosophy]

**Narrow scope, intentionally.** Struktur does extraction only. No parsing. No streaming. No general-purpose LLM orchestration. This focus keeps the API small and the behavior predictable.

**Shell-composable by default.** Reads stdin, writes stdout, speaks JSON. Integrates with `jq`, `find`, `curl`, and any tool in your pipeline.

**Strategy-first.** Different documents need different approaches. A single-page invoice needs simple extraction. A 100-page catalog with duplicate products needs parallel extraction with deduplication. Strategies encode these patterns.

**Validation in the loop.** Errors go back to the model, not to you. The retry loop means most extractions converge within two attempts.

**Schema-first.** You define the shape, Struktur guarantees it.

**Fields shorthand.** Skip the JSON Schema boilerplate with `--fields "title, price:number, status:enum{draft|live}"`.

Trade-offs [#trade-offs]

| Trade-off                          | Rationale                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Requires upstream preprocessing    | Keeps Struktur focused; use best-of-breed parsers per format                       |
| Batch-only, no streaming           | Simpler mental model; input in, JSON out                                           |
| Depends on Vercel AI SDK providers | OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API |
| Token costs depend on strategy     | `doublePass` costs more than `simple`; know your rates                             |

A 10-second demo [#a-10-second-demo]

```bash
struktur --input invoice.pdf \
  --fields "number, vendor, total:number" \
  --model openai/gpt-4o-mini
```

Expected output:

```json
{
  "number": "1042",
  "vendor": "Acme Corp",
  "total": 2400
}
```

What Struktur is NOT [#what-struktur-is-not]

* **It is not a general document conversion tool.** It parses files for extraction purposes, not for format conversion. It does not produce formatted output from documents.
* **It is not a managed API.** It runs locally and calls your provider directly.
* **It does not stream.** Input in, JSON out.
* **It is not a general LLM orchestration framework.**

For the full mental model, see [The Extraction Pipeline](/docs/explanation/pipeline).

Who is it for? [#who-is-it-for]

**CLI users** — data engineers, analysts, shell pipeline builders — use Struktur for one-off extractions, batch processing, and CI/CD automation without writing code.

**SDK users** — TypeScript developers embedding extraction in applications — use Struktur for typed results, custom strategies, and fine-grained control over the extraction pipeline.

What are Strategies? [#what-are-strategies]

A strategy implements:

* `name`: string identifier
* `run()`: the orchestration logic
* `getEstimatedSteps()`: optional, for progress tracking

Strategies own their config (model, chunk size, concurrency). All strategies guarantee: output validates against the schema or they throw.

Built-in strategies [#built-in-strategies]

| Strategy              | Description                                 |
| --------------------- | ------------------------------------------- |
| `simple`              | Single-shot extraction for small inputs     |
| `parallel`            | Concurrent batches with LLM merge           |
| `sequential`          | Ordered batches with context carryover      |
| `parallelAutoMerge`   | Parallel with schema-aware merge + dedupe   |
| `sequentialAutoMerge` | Sequential with schema-aware merge + dedupe |
| `doublePass`          | Parallel pass + sequential refinement       |
| `doublePassAutoMerge` | Double-pass with auto-merge                 |

See [Extraction Strategies](/docs/explanation/strategies) for details on each strategy and how to choose.

Quick navigation [#quick-navigation]

| Goal                               | Section                                                |
| ---------------------------------- | ------------------------------------------------------ |
| New here?                          | [Quickstart](/docs/quickstart)                         |
| Need to accomplish something?      | [Examples](/docs/examples)                             |
| Looking up a flag or type?         | [CLI Reference](/docs/cli)                             |
| Quick schema without writing JSON? | [Fields Shorthand](/docs/cli/fields)                   |
| Want to understand how it works?   | [Concepts](/docs/explanation)                          |
| Parse files into artifacts?        | [Document Parsing](/docs/explanation/document-parsing) |
