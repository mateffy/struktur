# Auto-Routing Extraction Strategy

## Goal

Build a `RouterStrategy` for `@struktur/sdk` that classifies input artifacts and
routes extraction down different paths to optimize cost/latency/quality per
document. It keeps the same contract as every other strategy: `schema` in →
`T` out. Only the internal path differs based on the input.

Two deliverables, in order:

1. **Chunk-size experiments** — benchmark `chunkSize` × strategy × dataset so
   the router can pick a chunk size from data instead of a hardcoded 10k.
2. **`RouterStrategy`** — a classifier step (cheap LLM call) + deterministic
   features (length, image count, page count) → route to simple / parallel /
   sequential / doublePass / agent with per-route prompts and chunk sizes.

## Context (what we know)

- Benchmark harness (`packages/benchmarks`) runs `case × track × strategy`,
  caches cells by `(case, track, strategy, model, variant, schema, gold)`,
  reports F1 / cost / latency. Already has SROIE (973 receipts), synthetic
  (28), expose (6 German real-estate PDFs).
- Strategies in `packages/sdk/src/strategies/`: simple, parallel, sequential,
  doublePass, *AutoMerge, agent. All take `chunkSize` except simple/agent.
- Chunking (`chunking/ArtifactBatcher.ts`): text split into
  `maxTokens * textTokenRatio` (ratio 4) char chunks; `maxTokens` default 10k
  in the benchmark's builtin factories.
- Classification signals available **for free** (no LLM): token count, image
  count, page count, artifact count — all derivable from `Artifact[]`.
- Classification signals needing an LLM: document type, context-dependence
  (are pages self-contained or do later pages reference earlier ones?).
- Model: pinned `openrouter/deepseek/deepseek-v4-flash-vision-exp`
  ($0.22/M in, $0.66/M out). Classifier reuses it with a tiny enum output +
  truncated input → classification is ~100× cheaper than a full extraction.

## Known findings from prior benchmarks

- Single-chunk docs: merge strategies are pure overhead (doublePassAutoMerge
  2.6× cost, −5 F1 vs simple). simple is the default winner.
- Multi-chunk is where parallel/sequential/doublePass earn their cost. We have
  no long-document benchmark yet → chunk-size experiment must add one.
- SROIE (short, independent receipts): sequential wins (80.6% F1, cheapest).
  Fields are independent but the "carry previous partial" refinement helps.
- Expose (mid-size, feature-heavy schema): simple ≈ sequential tie at 64%.

## Research design

### Phase 1 — Chunk-size experiments

Add a synthetic **long-document generator**: N self-contained "records" of
repeating structure (e.g. 40 records × ~250 tokens = 10k tokens, controllable)
with a schema that requires counting/collecting across records (arrays +
aggregates). This is the missing dataset — everything today is single-chunk.

Benchmark matrix:
- chunk sizes: 1k, 2k, 4k, 8k, 16k, 32k
- strategies: simple, parallel, sequential, doublePass
- document lengths: ~5k, ~10k, ~20k tokens

Measure F1 / cost / latency per cell. Learn:
- where parallel beats simple on wall-clock (the break-even N from earlier)
- where sequential quality beats parallel (cross-chunk context)
- optimal chunk size per length (too small = merge overhead + lost context,
  too big = exceeds context window)

### Phase 2 — Classifier

A cheap classifier step producing:

```
{
  document_type: "receipt" | "invoice" | "real_estate" | "resume" | "contract" | "generic",
  context_dependence: "independent" | "dependent",
  requires_vision: boolean          // fallback to image-presence heuristic
}
```

Deterministic pre-checks (no LLM): total tokens, image count, page count,
artifact count. Only invoke the classifier LLM when length > threshold or
multiple artifacts (single tiny doc → classify "generic/independent" for free).

### Phase 3 — RouterStrategy

```
run(artifacts, schema):
  features = deterministic(artifacts)          // tokens, images, pages, count
  if features.tokens < smallThreshold:          // fits one chunk comfortably
     return simple(artifacts, schema, routePrompt)
  class = classify(artifacts)                  // cheap LLM call, enum output
  route = pick(class, features):
     requires_vision && no text      -> agent(vision)
     context_dependence=independent  -> parallel(chunkSize=f(length))
     context_dependence=dependent    -> sequential(chunkSize=f(length))
  return route(artifacts, schema, routePrompt[class.document_type])
```

Per-document-type prompt injection: reuse the expose `instructions()`
disambiguation as the `real_estate` route prompt; receipts/invoices get
field-separation-heavy prompts; generic gets no extra instructions.

## Tasks

- [ ] `packages/benchmarks/src/datasets/longdoc.ts` — synthetic long-doc generator + tests
- [ ] `packages/benchmarks/run-chunks.ts` — chunk-size benchmark runner (matrix)
- [ ] run chunk-size matrix (parallel shards), record results
- [ ] `packages/sdk/src/strategies/RouterStrategy.ts` — classifier + router
- [ ] classifier prompt + schema (enum output, truncated input)
- [ ] RouterStrategy tests (mock model: assert route picked per input)
- [ ] benchmark RouterStrategy vs builtins on synthetic + SROIE + expose + longdoc
- [ ] write findings into BENCHMARK.md

## Progress

- [x] Plan written
- [x] Phase 1 chunk experiments (56 cells; 20k×doublePass@1000 + 20k×sequential@1000 partial)
- [ ] Phase 2 classifier
- [ ] Phase 3 router + benchmark

## Chunk-size findings (from cancelled run, 56 cells)

Long-doc cases (5k/10k/20k tokens, records with array+aggregate schema):

- **`simple` is the default winner when the doc fits in context.** 100%/99.9%/100%
  F1 at 5k/10k/20k — and 20k tokens is still tiny vs the 128k+ context window.
- **Small chunks are a trap**: more LLM calls + the merge re-reads every chunk,
  so cost *rises* as chunk size *falls* (parallel@1000 = $0.028 vs @16000 = $0.018
  on 5k). Quality also drops — records split across chunk boundaries.
- **Severe failure at chunk 1000 on 20k**: sequential@1000 = 53.5% F1
  (context lost across 18 passes), doublePass@1000 = 0% (0 tokens, crashed).
- **If you must chunk, use large chunks (16k–32k)** — 100% F1 and cheaper
  than small chunks. sequential@32k beat simple on cost at 5k/20k.
- **doublePass is never worth it** here: $0.35 / 51 min at 20k×@2000 for no
  quality gain over simple.

Routing implication: the dominant signal is **length** (fits-in-context →
simple), and it's deterministic/free. The LLM classifier only earns its keep
for (a) type-specific prompts and (b) choosing parallel vs sequential when the
*doc must be chunked* (larger than a single comfortable prompt).
