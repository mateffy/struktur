# Struktur Benchmark Results

Baseline run against `deepseek-v4-flash-vision-exp` via OpenRouter. Measures the
**harness** (strategies, prompts, schemas) against a fixed model — not
model-to-model comparison.

## Model

`openrouter/deepseek/deepseek-v4-flash-vision-exp`

~$0.60/M tokens, 1M context window, vision-capable. Supports structured output
(`response_format: json_schema`) via OpenRouter.

## Cases (28 total)

| Category | Cases | Schema | Description |
|---|---|---|---|
| Flat key-value | 20 | `{ company, date, amount, invoice_id }` | Deterministic `Key: Value` lines (seed 42) |
| Nested objects | 5 | `{ name, address{street, city, zip}, contact{email, phone} }` | Natural-language text, address in "City, ST ZIP" format |
| Line items | 3 | `{ customer, items[{name, qty, price}] }` | Bulleted item lists, array-aligned by `name` |

All schemas include `additionalProperties: false`. Generated 2026-09-03.

## Prompt changelog

### v3 (current)

Added `<field-separation>` section with explicit right/wrong examples to all
three prompts (ExtractorPrompt, ParallelMergerPrompt, SequentialExtractorPrompt),
plus a pre-task check in the user prompt.

| Prompt | Change | Effect |
|---|---|---|
| All three | New `<field-separation>` section: explicit examples + WRONG patterns | Field boundaries are structural constraints, not suggestions |
| ExtractorPrompt user | Pre-task check: "check EVERY field before outputting" | Last-chance reminder right before output |
| ParallelMergerPrompt | "Shorter, simpler values are correct — enrichment is the enemy" | Merge step picks cleaner value |
| SequentialExtractorPrompt | "Do NOT overwrite clean values with combined ones" | Sequential batches preserve correctness |

**Bleed-focused test (10 cases): 67% → 100% exact.**

### v2

Eliminated doublePass regression by fixing the merger to prefer atomic values
over "richer" combined values. Changed "preserve ALL data — losing information
breaks the chain" to "preserve correctly-filled fields; only overwrite when
more precise."

**doublePass: 92.9% → 100% exact.**

### v1 (baseline)

Original prompts. "Preserve all information" / "prefer richer data" caused
doublePass to regress and all strategies to bleed address fields.

## Results: text track

| strategy | cases | F1 | valid | exact | input tok | output tok | ms/case |
|---|---|---|---|---|---|---|---|
| doublePass | 28 | 100.0% | 100.0% | 100.0% | 49,819 | 9,274 | 3,630 |
| simple | 28 | 99.4% | 100.0% | 96.4% | 19,232 | 4,107 | 1,143 |
| sequential | 28 | 99.4% | 100.0% | 96.4% | 18,513 | 4,337 | 2,292 |
| parallel | 28 | 98.8% | 100.0% | 92.9% | 29,904 | 6,344 | 2,603 |

## Results: non-text tracks

| strategy | track | cases | F1 | valid | exact | input tok | output tok | ms/case |
|---|---|---|---|---|---|---|---|---|
| simple | text+embedded | 8 | 97.9% | 100.0% | 87.5% | 6,206 | 2,046 | 1,415 |
| simple | text+screenshots | 8 | 95.8% | 100.0% | 75.0% | 6,206 | 3,740 | 2,683 |
| simple | text+emb+screen | 8 | 97.9% | 100.0% | 87.5% | 6,206 | 2,158 | 2,447 |
| sequential | text+embedded | 8 | 97.9% | 100.0% | 87.5% | 5,607 | 1,610 | 3,160 |
| sequential | text+screenshots | 8 | 100.0% | 100.0% | 100.0% | 5,607 | 1,293 | 1,790 |
| sequential | text+emb+screen | 8 | 100.0% | 100.0% | 100.0% | 5,607 | 1,943 | 5,838 |
| parallel | text+embedded | 8 | 97.9% | 100.0% | 87.5% | 9,376 | 3,577 | 7,056 |
| parallel | text+screenshots | 8 | 100.0% | 100.0% | 100.0% | 9,213 | 2,518 | 3,792 |
| parallel | text+emb+screen | 8 | 100.0% | 100.0% | 100.0% | 9,213 | 2,383 | 3,065 |
| doublePass | text+embedded | 8 | 97.9% | 100.0% | 87.5% | 15,229 | 3,905 | 5,404 |
| doublePass | text+screenshots | 8 | 100.0% | 100.0% | 100.0% | 15,225 | 3,586 | 5,157 |
| doublePass | text+emb+screen | 8 | 93.8% | 100.0% | 62.5% | 15,398 | 4,401 | 8,463 |

> Non-text tracks use text artifacts (synthetic data). Image data carries no
> extractable signal. Variance is model non-determinism across API calls, not
> image understanding.

## Cost & latency summary (text track)

| Strategy | F1 | Total tokens | cost (USD) | vs simple | Mean ms/case | total ms | vs simple |
|---|---:|---:|---:|---:|---:|---:|---:|
| simple | 99.4% | 23,052 | 0.0069 | 1.0× | 1,754 | 49,102 | 1.0× |
| sequential | 100.0% | 24,000 | 0.0072 | 1.0× | 2,027 | 56,769 | 1.2× |
| parallel | 100.0% | 37,564 | 0.0114 | 1.7× | 3,508 | 98,221 | 2.0× |
| doublePass | 99.4% | 59,354 | 0.0176 | 2.6× | 8,538 | 239,052 | 4.9× |

Cost is estimated from token usage (deepseek-v4-flash-vision-exp: $0.22/M in,
$0.66/M out). Latency is measured wall-clock per extraction (excludes PDF
parsing, which happens once per case before strategies run).

## Error analysis

All errors are **address field bleeding**: when input contains `"Springfield, IL
62701"`, DeepSeek occasionally (~3-4% of API calls) puts `"Springfield, IL"`
into `city` instead of `"Springfield"`. The prompt now explicitly teaches field
boundaries with positive and negative examples, and a dedicated bleed-focused
test hits 100%, but the model has non-deterministic failures across larger runs.

| Case | Field | Expected | Got |
|---|---|---|---|
| nested-1 | city | `Springfield` | `Springfield, IL` (state bled in) |
| nested-2 | city | `Portland` | `Portland, OR` (state bled in) |

gpt-4o-mini handles this correctly in 100% of cases.

## Strategy recommendations

- **simple**: Best for single-document extraction. Lowest cost and latency.
  96%+ exact on text. Use as the default.
- **doublePass**: 100% exact on text track (v2 fix eliminated the merge
  regression that previously corrupted correct extractions). 2.5× cost — use
  when single-pass reliability is poor on complex schemas.
- **sequential**: Comparable cost to simple. Use when documents exceed context
  window and must stay ordered across batches.
- **parallel**: 1.6× token cost from merge step. Wins on wall-clock for large
  documents split across many parallel batches.

## Notes

- The benchmark cache is at `packages/benchmarks/.benchmark-cache/`. Re-running
  hits the cache instantly.
- Image tracks test the same synthetic text — adding real PDF+image cases
  (via `parsePdf` with screenshots) will exercise actual vision extraction.

---

# SROIE (ICDAR 2019 scanned receipts) benchmark

Real-world public dataset: 973 scanned receipts (Hugging Face mirror
`darentang/sroie`), key fields `company` / `date` / `address` / `total`
reconstructed from the per-word BIO tags. Text track: the receipt's OCR words
joined into a single string — the fair text-only baseline (the model never
sees the scan).

| strategy | F1 | precision | recall | valid | cost (USD) | ms/case | total ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| **sequential** | **80.6%** | 80.9% | 80.6% | 100.0% | **$0.681** | 7,572 | 7,367,563 |
| doublePass | 78.5% | 78.9% | 78.5% | 99.6% | $1.935 | 27,781 | 27,030,655 |
| simple | 76.4% | 77.7% | 76.3% | 99.8% | $1.269 | 16,605 | 16,156,688 |
| parallel | 75.2% | 77.6% | 75.1% | 99.1% | $1.506 | 21,034 | 20,465,862 |

Key finding: **sequential wins on SROIE** — both highest F1 and lowest cost.
Receipt fields are short and independent, so carrying the previous batch's
partial data forward (sequential's incremental refinement) beats both
single-pass and merge-based strategies. This is the opposite of the synthetic
suite, where the documents are trivial and all strategies tie.

> Run via 8 parallel shard processes; wall-clock ≈ 3 h (8 × ~120 cases × 4
> strategies). All cells cached — re-runs are free.

---

# Real-Estate Exposés benchmark

End-to-end benchmark on six real German real-estate exposés (PDF → structured
property data), using the production schema + instructions from immocore
(`StrukturEstateSchema` + its `instructions()` prompt). The exposes are:

1. **Sandstraße 8/12, Lübeck** — retail, total rent, CBRE
2. **Augustaanlage 62-64, Mannheim** — „PRIME PULSE OFFICES", office, per-m² rents
3. **Flottenstraße 54-55, Berlin** — industrial, 3 halls, production+office, 100% let
4. **DOCK 100, Berlin** — logistics park, 3 buildings (Factory Dock, Office Dock, Veithalle)
5. **Holzhauser Quartier, Berlin** — mixed commercial, 3 buildings, per-m² rents
6. **Elsenstraße 87, Berlin** — historic office conversion, 7 units, per-m² + extra costs

## Schema (immocore)

Three-level hierarchy: `real_estate_property` → `buildings[]` → `units[]`. Each
unit carries `label`, `usages`, `area`, `floor`, `rent_per_m2`,
`extra_costs_per_m2`, `features`. The instructions in the strategy inject the
full `<available-usages>` (17) and `<available-features>` (160) slug lists so
the model maps to standardised slugs. Runs text-only (`parsePdf` without images).

Scoring: `usages`/`features` are order-insensitive sets; `area`/rents use
`tolerance`; `buildings`/`units` are key-aligned by `label`;
`description_text`/`location_text` are free prose scored by exact match
(conservative floor).

## Results (model: `deepseek-v4-flash-vision-exp`, strategy: `simple`)

| case | F1 | precision | recall | valid | tokens | cost (USD) | latency |
|---|---:|---:|---:|---:|---:|---:|---:|
| Sandstraße 8/12 | 69.0% | 59.6% | 81.9% | ✓ | 17,924 | 0.0068 | 29 s |
| PRIME PULSE OFFICES | 52.3% | 38.6% | 81.0% | ✓ | 24,995 | 0.0110 | 54 s |
| Flottenstraße 54-55 | 68.8% | 58.0% | 84.5% | ✓ | 29,007 | 0.0129 | 69 s |
| DOCK 100 | 65.4% | 52.8% | 85.8% | ✓ | 26,898 | 0.0120 | 61 s |
| Holzhauser Quartier | 58.2% | 47.9% | 74.0% | ✓ | 27,357 | 0.0139 | 277 s |
| Elsenstraße 87 | 68.3% | 57.3% | 84.6% | ✓ | 25,132 | 0.0112 | 60 s |
| **mean / total** | **63.7%** | 52.4% | 82.0% | **100%** | 151,313 | **0.0678** | **549 s** |

Cost is estimated from token usage ($0.22/M input, $0.66/M output). Latency is
measured wall-clock per extraction (excludes PDF parsing, which happens once
per case before strategies run).

## Cost & latency (per-case, text track)

| case | in tok | out tok | cost (USD) | latency (ms) |
|---|---:|---:|---:|---:|
| Sandstraße 8/12 | 13,168 | 4,756 | 0.0068 | 28,631 |
| PRIME PULSE OFFICES | 19,988 | 5,007 | 0.0110 | 54,404 |
| Flottenstraße 54-55 | 24,007 | 5,000 | 0.0129 | 68,841 |
| DOCK 100 | 21,797 | 5,101 | 0.0120 | 60,581 |
| Holzhauser Quartier | 22,532 | 4,825 | 0.0139 | 277,298 |
| Elsenstraße 87 | 20,019 | 5,113 | 0.0112 | 59,592 |
| **total** | 121,511 | 29,802 | **0.0678** | 549,347 |

> The Holzhauser case hit an API retry (277 s vs ~60 s median) — real
> wall-clock variance, not a strategy difference. All six cases are cached; a
> re-run reads them instantly.

## Strategy comparison (all strategies, text track)

Run via 6 parallel processes (one per expose file). Same model, schema, gold,
and instructions for every strategy.

| strategy | sandstrasse | primePulse | flottenstrasse | dock100 | holzhauser | elsenstrasse | mean F1 | cost | total ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| simple | 65.1% | 54.3% | **70.8%** | 67.8% | **64.7%** | 61.8% | **64.1%** | $0.0781 | 535s |
| sequential | 67.4% | 55.3% | 68.4% | 63.9% | 64.0% | 65.5% | **64.1%** | **$0.0646** | 1032s |
| sequentialAutoMerge | 67.9% | 56.1% | 59.1% | **71.5%** | 57.8% | 69.3% | 63.6% | $0.1056 | 1466s |
| parallelAutoMerge | 63.1% | **57.6%** | 67.4% | 58.9% | 54.9% | **71.7%** | 62.3% | $0.0844 | 954s |
| parallel | **71.0%** | 49.7% | 61.9% | 68.1% | 56.4% | 64.4% | 61.9% | $0.0867 | 729s |
| doublePass | 70.9% | 50.0% | 61.2% | 57.3% | 61.9% | 63.0% | 60.7% | $0.1374 | 1494s |
| agent | 55.4% | 51.6% | 64.2% | 79.9% | 54.1% | 57.0% | 60.4% | $0.0952 | 259s |
| doublePassAutoMerge | 64.4% | 50.3% | 62.1% | 57.0% | 56.2% | 63.6% | 58.9% | $0.1658 | 2853s |

Observations:

- **simple and sequential tie at 64.1%** mean F1. sequential is 17% cheaper
  ($0.0646) but 2× the latency; simple is the latency/quality sweet spot.
- **No strategy dominates per-file** — best-per-file bounces between simple,
  parallel, sequentialAutoMerge, and parallelAutoMerge. The spread is model
  non-determinism, not strategy effect; everything clusters 59-64%.
- **Merge strategies are pure overhead on these documents.** doublePass
  (+$0.06, +960s) and the AutoMerge variants score *lower* than simple — the
  merge step adds a full extra LLM pass with no benefit when a document fits
  in a single chunk (all six exposés are single-chunk).
- **agent** (multi-step tool-calling) is middle-of-pack (60.4%) at 1.2× simple's
  cost — but note it's the only strategy that doesn't rely on
  `response_format: json_schema`; it extracts via tool calls and parses its own
  JSON-string output. It wins dock100 (79.9%, best of all strategies) but loses
  badly on primePulse (51.6%).

## Findings

1. **100% schema validity.** Every output parses against the strict schema
   (all `additionalProperties:false`, all fields in `required`). The
   `response_format: json_schema` route is solid on this hierarchical schema.

2. **Features are the dominant error source.** The model consistently:
   - **over-assigns estate-level features** that belong at unit/building level
     (``elevators``, ``representative-foyer``, ``handicap-accessible``,
     ``completely-renovated`` placed on `real_estate_property.features`)
   - picks **plausible-but-wrong slugs** (``distance-highway``,
     ``commercial-building``, ``mixed-use-building`` instead of the source's
     actual features)
   - **misses** the correct slugs (gold ``plot-area``, ``storefront``,
     ``high-foot-traffic``, ``near-water`` returned `null`)
   Level assignment (estate vs unit) is the clearest failure mode.

3. **Prose fields are exact-scored and never match.** `description_text` and
   `location_text` differ in wording between gold and prediction even when the
   content is equivalent — two writers don't produce identical prose. Since the
   schema doesn't enforce exact phrasing, this drags F1 down for every case.
   A coverage/semantic scorer is needed for a fair number.

4. **`name` occasionally picks up extras** (e.g. `"Sandstraße 8/12, Lübeck"`
   vs gold `"Sandstraße 8/12"`), and `description_text` sometimes inverts
   (model writes headline then content, gold writes content first).

5. **Structural units are mostly correct** — building/unit counts, floors,
   areas, and rents resolve well on the units that produce the highest F1
   (Elsenstraße 62.6%). The hierarchical nesting, label alignment, and rent
   tolerance scoring are working.

## Next

- Add a **semantic/coverage scorer** for `description_text`/`location_text`
  (feature-entity or sentence overlap) so prose isn't penalised for wording.
- Improve **feature level-assignment** guidance: teach the model to put
  building/unit-scoped features (elevators, foyer, handicap) at the lower level.
- Re-run with `--all` (parallel/sequential/doublePass) to compare strategies on
  the hierarchical schema.