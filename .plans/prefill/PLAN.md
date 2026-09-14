# `--prefill` — front-load the extraction context with synthetic tool calls

> **Outcome (v2.8.0):** shipped, but not as planned below. Observation masking
> was removed outright rather than given a `floor`, which deleted the whole
> "Problem A" class of bug instead of patching it. `PrefillOptions` ended up as
> `textTokens` + `maxImages` + `maxImageBytes` — the 0.67/0.33 token split in
> the Design section conflated two unrelated budgets and could not express
> "300k of text and 4 images". Phase 1 (model-info/context-window lookup) was
> not needed: the budget is caller-supplied. Everything else matches.

## Goal

Give the extraction agent its full context **up front** instead of making it
discover it over many round trips. `--prefill <tokens>` seeds the conversation
with synthetic `read` / `view_image` tool calls (assistant tool-call + tool-result
pairs) that load the document text and images, bounded by a token budget.

Rationale, from the current benchmark:

- dock100.pdf used to take 4m04s because the agent emitted one ~55k-token tool
  call in a single silent step.
- It also spent steps re-discovering what it needed (11 blind `view_image` calls
  before the masking fix).
- Prompt caching only pays off if the prefix is **stable and big**. A prefill
  block is exactly that: built once, then identical on every subsequent step.

So prefill targets three things at once: fewer steps, a cacheable prefix, and
predictable payload size.

---

## Investigation findings

### Token accounting already exists

`packages/sdk/src/tokenization.ts` (all approximate, no tokenizer dependency):

| helper | rule |
| --- | --- |
| `estimateTextTokens(text)` | `ceil(length / 4)` (chars per token configurable via `textTokenRatio`) |
| `estimateImageTokens(image)` | flat `1000` per image (`defaultImageTokens`) |
| `countArtifactTokens(artifact)` | prefers `artifact.tokens`, else sums contents |
| `countArtifactImages(artifact)` | counts `content.media` entries |

`countArtifactTokens` honouring a pre-computed `artifact.tokens` means the PDF
layer can hand us a real number if it ever gets one; today it is the estimate.

### Context-window info is *available* but *never used*

The SDK already hits both catalogues in `detectInputModalities()` (added this
week, `AgentStrategy.ts` ~line 985):

- `https://openrouter.ai/api/v1/models/{id}` → `data.context_length`,
  `data.top_provider.max_completion_tokens`
- `https://openrouter.ai/api/v1/models` (list fallback, match by `id`)
- `https://models.dev/api.json` → `{provider}.models.{id}.limit.{context,input,output}`

Verified values:

| model | context | max completion |
| --- | --- | --- |
| `deepseek/deepseek-v4.1-flash` | 1 048 576 | 384 000 |
| `qwen/qwen3.8-flash` | 1 000 000 | 131 072 |

`chunking/ArtifactBatcher.ts` already accepts `modelMaxTokens` and clamps
`min(maxTokens, modelMaxTokens)` — the same pattern applies to prefill, so this
is a known-good shape in the codebase.

### The message shape is already understood by the whole pipeline

The agent loop pushes `result.response.messages`, and `maskImagePayloads()`
walks exactly this structure:

```ts
// assistant turn
{ role: "assistant", content: [{ type: "tool-call", toolCallId, toolName, input }] }
// tool turn
{ role: "tool", content: [{
    type: "tool-result", toolCallId, toolName,
    output: { type: "content", value: [
      { type: "text", text: "[Image: /images/…/image-overview-1.png]" },
      { type: "media", data: "<base64>", mediaType: "image/png" },
    ]},
}] }
```

Synthesising these means prefill reuses tested machinery — including image
delivery and masking — rather than inventing a second path.

### Where things are built today

`AgentStrategy.ts`:

- `createVirtualFilesystem(options.artifacts)` (~line 373) → `files` map plus
  `filesystem.virtualFiles` (the `/images/...` entries) and
  `filesystem["/artifact.json"]` / `["/manifest.json"]`.
- `bash = new Bash({ files, cwd: "/" })`
- `const messages: any[] = [{ role: "user", content: userMessage }]` (~line 764)
  — **this is the insertion point.**

### Two blockers to be aware of

1. **Provider payload limits.** `DEFAULT_MAX_IMAGES = 5` exists because Cerebras
   rejects >10 MB bodies. Prefill must therefore be gated on the provider, or at
   least warn and clamp for non-OpenRouter routes.
2. **`purgeImages` interacts badly if applied too early.** Masking runs on
   `messages` *before* each new step's messages. If prefill seeds images and then
   the first loop iteration masks everything prior, the model is blind again —
   exactly the bug fixed in `fd982ba`. Prefill images must be exempt for the
   first step (see Design).

---

## Design

### CLI surface

```
--prefill <tokens>      Pre-load up to <tokens> of document context as synthetic
                        tool calls before the agent starts. Reserves 1/3 for images
                        when images are enabled.
--prefill-text-ratio    Fraction of the budget for text (default 0.67)
--prefill-images <n>    Hard cap on prefilled images (default: budget / est. image tokens)
--no-prefill            Explicit off (default: off, so nothing changes for existing callers)
```

`--prefill 500k` / `500000` / `500_000` should all parse. Keep the suffix parse
local and dumb.

### Placement in the message list

```
[ system: agent prompt (schema + instructions + manifest) ]   ← stable, cacheable
[ user:   task message                                     ]   ← stable
[ assistant: tool-call  read /artifact.json (chunk 1)      ]  ┐
[ tool:      tool-result  chunk 1 text                      ]  │
[ assistant: tool-call  read /artifact.json (chunk 2)      ]  │ prefill block
[ tool:      tool-result  chunk 2 text                      ]  │ (synthetic)
[ assistant: tool-call  view_image /images/.../overview     ]  │
[ tool:      tool-result  media + "[Image: path]"           ]  ┘
[ assistant: … the model's real first turn …               ]
```

The prefill block sits **after** the stable prefix so it is itself part of the
cached prefix on every later step.

### Budgeting

```
requested            = --prefill
modelContext         = from catalogue (or a conservative default)
reservedOutput       = maxCompletionTokens(schema) — see below
systemTokens         = estimateTextTokens(systemPrompt)
safety               = 5% of modelContext

available            = modelContext - reservedOutput - systemTokens - safety
budget               = min(requested, available)

textBudget           = budget * prefillTextRatio          (default 0.67)
imageBudget          = budget - textBudget                (default 0.33)
maxPrefillImages     = --prefill-images ?? floor(imageBudget / imageTokens)
```

`reservedOutput` is the one number we cannot measure up front. Start with a
heuristic (`ceil(schemaBytes / 4) * 1.5`, clamped to `min(32k, maxCompletion)`)
and make it overridable. Truncating the *output* is far worse than underfilling
prefill, so bias the reserve high.

### What gets prefilled

Text (up to `textBudget`):

1. `/artifact.json` is serialised (already built by
   `createVirtualFilesystem`).
2. Chunk it by **lines** to mimic the real `read` tool (offset/limit, limit ≤ 1000
   per its description). One synthetic `read` call + result per chunk.
3. Stop when `textBudget` is exhausted; if the document is larger, that is the
   signal to say so in the prompt (see Prompt changes) and let the agent continue.

Images (up to `maxPrefillImages`), in this order:

1. The `image-overview` sheet(s) first — one image, all thumbnails, best value
   per token.
2. Then individual images in manifest order, until the image budget is spent.

Each becomes an assistant `view_image` call + a tool result with the base64 media,
using the **same** `{type:"text"} + {type:"media"}` shape `view_image` returns.

### Prompt changes (required, not optional)

With prefill on, the current workflow instruction is actively wrong ("read
/artifact.json first, then the image overview, then individual images") because
the agent has already done that. Add a prefill variant of the workflow section:

```
## Context already loaded
The document text (and N images) have already been read for you and appear
above as completed tool calls. Do not re-read them.
1. Extract directly from the loaded context.
2. Use update_output_data for anything you still need (see "Build the output
   incrementally" below).
3. Only call view_image on an individual image if the loaded thumbnails are
   genuinely unreadable for that image.
```

Prefer a small branch in `defaultSystemPrompt()` — a `prefill` boolean — over a
second prompt template.

### Masking interaction

Prefill images are part of `messages` before the loop starts. The mask call is:

```ts
maskPriorImagePayloads(messages, firstNewMessageIndex);
```

On the **first** iteration `firstNewMessageIndex` equals the length of the whole
prefill block, so prefill images are *inside* the masked range and would be
wiped before the model ever sees them — the same class of bug as `fd982ba`.

Fix: compute a floor once before the loop and never mask below it.

```ts
const prefillLength = messages.length;   // after seeding
…
maskPriorImagePayloads(messages.slice(0, prefillFloor), firstNewMessageIndex - prefillFloor)
// or, simpler: pass a `floor` argument
maskPriorImagePayloads(messages, firstNewMessageIndex, /* floor */ prefillLength);
```

Extend `maskImagePayloads`/`maskPriorImagePayloads` with a `floor` parameter and
add a test asserting prefilled media survives step 1.

### Caching interaction (the real prize)

`deepseek-v4.1-flash` caches **only when pinned to the official DeepSeek
provider** (measured: 4096/4247 on the 2nd call with `provider.only =
["DeepSeek"]`; 0 with default routing). Since prefill creates a large, stable,
identical prefix, prefill + provider pinning is where the cost win comes from.

Recommendation: when `--prefill` is set and the model is OpenRouter, default to
`providerOptions.openrouter.provider = { order: ["DeepSeek"], allow_fallbacks: true }`
for DeepSeek-family models, or expose `--provider-order` / a
`services.struktur.provider_order` config. `LLMClient` already understands a
`__openrouter_provider` marker on the model object — reuse it.

Must be measured, not assumed: log `prompt_tokens_details.cached_tokens` per step
(see Observability).

---

## Implementation phases

### Phase 1 — model metadata (no behaviour change)

1. `packages/sdk/src/llm/modelInfo.ts` (new): move `detectInputModalities` here
   and generalise it to return
   `{ inputModalities, contextLength, maxCompletionTokens, source }`.
   Memoize per `provider/modelId` in a module-level `Map` — it is a network call
   on the hot path.
2. Update `AgentStrategy` to consume it for `visionEnabled`.
3. Add `getModelContextLength()` used by prefill, with a conservative fallback
   (`128_000`) when the catalogue is unreachable.

### Phase 2 — prefill builder (pure, fully testable)

1. `packages/sdk/src/strategies/agent/prefill.ts` (new):

   ```ts
   export type PrefillOptions = {
     tokens: number;
     textRatio?: number;         // default 0.67
     maxImages?: number;
     textTokenRatio?: number;
     defaultImageTokens?: number;
   };

   export type PrefillResult = {
     messages: any[];            // assistant/tool pairs
     tokens: number;
     textTokens: number;
     imageTokens: number;
     imagePaths: string[];
     truncated: boolean;         // budget < available document
   };

   export const buildPrefill = (
     filesystem: VirtualFilesystem,
     options: PrefillOptions,
   ): PrefillResult;
   ```

   Pure function over the filesystem + budget. No network, no LLM. This is where
   the value is and it should be trivially unit-testable.
2. Image ordering helper: overview sheet(s) first, then individual, dedup by path.
3. Text chunking by lines, `limit ≤ 1000`, matching the `read` tool contract.

### Phase 3 — wire into the agent

1. `AgentStrategyConfig.prefill?: PrefillOptions`.
2. After the `messages` array is created and before the loop:
   `messages.push(...buildPrefill(filesystem, config.prefill).messages)`.
3. Emit a status event with the achieved split
   (`{ key: "prefill_loaded", params: { textTokens, imageCount } }`).
4. Add the `prefill` branch to `defaultSystemPrompt()`.
5. Add the masking `floor` so prefill media survives the first step.

### Phase 4 — CLI + PHP

1. CLI: flags in `extract` (`--prefill`, `--prefill-text-ratio`,
   `--prefill-images`, `--no-prefill`), parse suffixes, thread into the agent
   factory (`packages/cli/src/cli.ts` ~line 1104).
2. `ExtractionOptions.prefill` in the SDK so library callers get it too.
3. PHP (`packages/struktur-php`): `ExtractionRequest::$prefill` + pass
   `--prefill` in `Client.php`.
4. immocore: `config/services.php` `struktur.prefill`, pass through
   `StrukturEstateImportService`, expose in the import modal strategy selector
   if it proves useful.

### Phase 5 — observability

1. Include cache metrics in the existing debug logger
   (`llmCallComplete` already records token counts): add
   `cachedInputTokens` from `result.usage.inputTokenDetails` /
   `providerMetadata`.
2. Surface in the job log for immocore: `Prefill: 182k Text / 41 Bilder, Cache 168k`.
   Without this, none of the above can be validated in production.

---

## Risks and edge cases

| risk | handling |
| --- | --- |
| Provider rejects a huge body (Cerebras 10 MB) | clamp prefill per provider; skip images for providers known to reject; warn loudly rather than silently degrading |
| Image token estimate (1000) is provider-specific | treat as a knob (`--prefill-image-tokens`); bias conservative |
| Model still re-reads despite loaded context | the prompt branch must explicitly say the context is already loaded; verify in a benchmark |
| Truncating the output is worse than underfilling | reserve generously; never let prefill eat `maxCompletionTokens` |
| Faked history looks odd to the model | keep it byte-identical in shape to real tool results; no synthetic "thinking" text |
| Prefill + `purgeImages` blinds the model | masking `floor` (see above) + test |
| Cache miss because the prefix changed | the prefill block must be deterministic for identical inputs — no timestamps, no random ids (use stable `toolCallId`s derived from the path) |
| `max-steps` semantics | prefill is history, not steps; document that it does not consume `max-steps` |

## Testing

- **Unit** (`prefill.test.ts`): budget honoured exactly; 2/3-1/3 split; overview
  first; determinism (same input → identical bytes, so caching can hit); truncation
  flag; zero/negative budget; no images when images disabled; `read` chunk
  boundaries respect the 1000-line limit.
- **Unit**: `maskImagePayloads` with a floor keeps prefilled media on step 1.
- **Unit**: context-length resolution falls back to `128_000` when offline.
- **Integration** (real provider, opt-in): run dock100 with
  `--prefill 200k` and assert (a) step count drops, (b) `cached_tokens > 0` when
  pinned to DeepSeek, (c) the extraction still fills the schema.
- **Regression**: without `--prefill`, behaviour is byte-identical to today.

## Open questions

1. Should prefill default **on** for the agent strategy once proven, or stay
   opt-in? Leaning opt-in until there is cache-metric evidence in production.
2. Do we want prefill for the chunked (non-agent) strategies too? The
   `batchArtifacts` path already packs tight batches; prefill mainly helps the
   agent. Deferring.
3. Is `1/3` the right image share? Should be tuned per document type — an exposé
   with a floorplan-only requirement wants far less.
4. Should the prefill block include `/manifest.json` explicitly, or is it already
   in the system prompt? It is in the system prompt today — avoid duplicating it
   (duplication costs tokens and gives the model two sources of truth).
