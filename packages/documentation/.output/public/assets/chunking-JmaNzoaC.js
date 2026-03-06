import{j as e}from"./main-BBiFs8Yq.js";let i=`

The context window problem [#the-context-window-problem]

LLMs have finite context windows. Documents — especially multi-page PDFs, large datasets, or many files at once — often exceed them. Struktur's chunker splits artifact contents into batches that fit within a configurable token budget (\`chunkSize\`).

How splitting works [#how-splitting-works]

Splitting happens at two levels:

1. **ArtifactSplitter:** splits a single large artifact's contents into smaller parts, respecting content slice boundaries (e.g., page boundaries).
2. **ArtifactBatcher:** groups artifacts or artifact parts into batches that stay within the token budget and optional image count limit.

The tokenizer uses a character-approximation (not exact token counting). \`chunkSize\` defaults to 10,000 tokens.

Images and maxImages [#images-and-maximages]

Some strategies accept \`maxImages\` to cap how many images appear per chunk. This matters when images consume disproportionate context. If a batch would exceed \`maxImages\`, extra images are moved to the next batch.

Why simple does not chunk [#why-simple-does-not-chunk]

The \`simple\` strategy loads all artifacts as-is. If the input exceeds the context window, the LLM call may fail or produce degraded results. For large inputs, use a chunked strategy.

This is a deliberate trade-off: \`simple\` is fast and cheap for small inputs, not suitable for large ones.

Merging partial results [#merging-partial-results]

When a document is split into N chunks and each chunk is extracted independently, you get N partial objects.

For a scalar-heavy schema (title, author, date), you want the best answer from all chunks.

For an array-heavy schema (line items, product listings), you want to concatenate all arrays and remove duplicates.

LLM merge (parallel, doublePass) [#llm-merge-parallel-doublepass]

These strategies send all partial results to a **merge model** in a single call, with a prompt asking it to produce a single coherent output. The merge model sees the full schema and all partial outputs.

This is powerful but costs extra tokens.

Schema-aware auto-merge [#schema-aware-auto-merge]

\`parallelAutoMerge\`, \`sequentialAutoMerge\`, and \`doublePassAutoMerge\` use \`SmartDataMerger\`:

* **Arrays:** concatenated. \`items\` from chunk 1 + \`items\` from chunk 2 = \`items\` in merged.
* **Objects:** shallow-merged. Keys from later chunks overwrite keys from earlier ones.
* **Scalars:** prefer newer non-empty values.

This approach avoids an extra LLM call and works well for list-extraction schemas. It does not handle complex cross-chunk synthesis — for that, use LLM merge.

Deduplication [#deduplication]

After auto-merging concatenated arrays, there may be duplicates. Dedup runs in two stages:

**Stage 1: CRC32 hash-based.** Exact duplicates (byte-for-byte identical after stable JSON stringification) are removed without any LLM call. Fast and cheap.

**Stage 2: LLM-based semantic dedup.** A dedupe model is given the merged array and asked to identify semantically equivalent entries (e.g., "iPhone 15" vs "Apple iPhone 15 128GB"). It returns a list of dot-path keys to remove (e.g., \`items.3\`).

Only the auto-merge variants include this step.

When dedup matters [#when-dedup-matters]

Dedup is valuable when:

* The same item legitimately appears in multiple chunks.
* The same document segment appears in multiple artifacts.

Dedup adds token cost and latency. For schemas without arrays, or for inputs with no expected overlap, use strategies without auto-merge.

See also [#see-also]

* [The Extraction Pipeline](/docs/explanation/pipeline) — the full flow
* [Extraction Strategies](/docs/explanation/strategies) — which strategies use chunking
`,r={title:"Chunking & Token Budgets",description:"How large documents are split and merged to fit within context windows."},o={contents:[{heading:"the-context-window-problem",content:"LLMs have finite context windows. Documents — especially multi-page PDFs, large datasets, or many files at once — often exceed them. Struktur's chunker splits artifact contents into batches that fit within a configurable token budget (`chunkSize`)."},{heading:"how-splitting-works",content:"Splitting happens at two levels:"},{heading:"how-splitting-works",content:"**ArtifactSplitter:** splits a single large artifact's contents into smaller parts, respecting content slice boundaries (e.g., page boundaries)."},{heading:"how-splitting-works",content:"**ArtifactBatcher:** groups artifacts or artifact parts into batches that stay within the token budget and optional image count limit."},{heading:"how-splitting-works",content:"The tokenizer uses a character-approximation (not exact token counting). `chunkSize` defaults to 10,000 tokens."},{heading:"images-and-maximages",content:"Some strategies accept `maxImages` to cap how many images appear per chunk. This matters when images consume disproportionate context. If a batch would exceed `maxImages`, extra images are moved to the next batch."},{heading:"why-simple-does-not-chunk",content:"The `simple` strategy loads all artifacts as-is. If the input exceeds the context window, the LLM call may fail or produce degraded results. For large inputs, use a chunked strategy."},{heading:"why-simple-does-not-chunk",content:"This is a deliberate trade-off: `simple` is fast and cheap for small inputs, not suitable for large ones."},{heading:"merging-partial-results",content:"When a document is split into N chunks and each chunk is extracted independently, you get N partial objects."},{heading:"merging-partial-results",content:"For a scalar-heavy schema (title, author, date), you want the best answer from all chunks."},{heading:"merging-partial-results",content:"For an array-heavy schema (line items, product listings), you want to concatenate all arrays and remove duplicates."},{heading:"llm-merge-parallel-doublepass",content:"These strategies send all partial results to a **merge model** in a single call, with a prompt asking it to produce a single coherent output. The merge model sees the full schema and all partial outputs."},{heading:"llm-merge-parallel-doublepass",content:"This is powerful but costs extra tokens."},{heading:"schema-aware-auto-merge",content:"`parallelAutoMerge`, `sequentialAutoMerge`, and `doublePassAutoMerge` use `SmartDataMerger`:"},{heading:"schema-aware-auto-merge",content:"**Arrays:** concatenated. `items` from chunk 1 + `items` from chunk 2 = `items` in merged."},{heading:"schema-aware-auto-merge",content:"**Objects:** shallow-merged. Keys from later chunks overwrite keys from earlier ones."},{heading:"schema-aware-auto-merge",content:"**Scalars:** prefer newer non-empty values."},{heading:"schema-aware-auto-merge",content:"This approach avoids an extra LLM call and works well for list-extraction schemas. It does not handle complex cross-chunk synthesis — for that, use LLM merge."},{heading:"deduplication",content:"After auto-merging concatenated arrays, there may be duplicates. Dedup runs in two stages:"},{heading:"deduplication",content:"**Stage 1: CRC32 hash-based.** Exact duplicates (byte-for-byte identical after stable JSON stringification) are removed without any LLM call. Fast and cheap."},{heading:"deduplication",content:'**Stage 2: LLM-based semantic dedup.** A dedupe model is given the merged array and asked to identify semantically equivalent entries (e.g., "iPhone 15" vs "Apple iPhone 15 128GB"). It returns a list of dot-path keys to remove (e.g., `items.3`).'},{heading:"deduplication",content:"Only the auto-merge variants include this step."},{heading:"when-dedup-matters",content:"Dedup is valuable when:"},{heading:"when-dedup-matters",content:"The same item legitimately appears in multiple chunks."},{heading:"when-dedup-matters",content:"The same document segment appears in multiple artifacts."},{heading:"when-dedup-matters",content:"Dedup adds token cost and latency. For schemas without arrays, or for inputs with no expected overlap, use strategies without auto-merge."},{heading:"see-also",content:"The Extraction Pipeline — the full flow"},{heading:"see-also",content:"Extraction Strategies — which strategies use chunking"}],headings:[{id:"the-context-window-problem",content:"The context window problem"},{id:"how-splitting-works",content:"How splitting works"},{id:"images-and-maximages",content:"Images and `maxImages`"},{id:"why-simple-does-not-chunk",content:"Why `simple` does not chunk"},{id:"merging-partial-results",content:"Merging partial results"},{id:"llm-merge-parallel-doublepass",content:"LLM merge (parallel, doublePass)"},{id:"schema-aware-auto-merge",content:"Schema-aware auto-merge"},{id:"deduplication",content:"Deduplication"},{id:"when-dedup-matters",content:"When dedup matters"},{id:"see-also",content:"See also"}]};const l=[{depth:2,url:"#the-context-window-problem",title:e.jsx(e.Fragment,{children:"The context window problem"})},{depth:2,url:"#how-splitting-works",title:e.jsx(e.Fragment,{children:"How splitting works"})},{depth:2,url:"#images-and-maximages",title:e.jsxs(e.Fragment,{children:["Images and ",e.jsx("code",{children:"maxImages"})]})},{depth:2,url:"#why-simple-does-not-chunk",title:e.jsxs(e.Fragment,{children:["Why ",e.jsx("code",{children:"simple"})," does not chunk"]})},{depth:2,url:"#merging-partial-results",title:e.jsx(e.Fragment,{children:"Merging partial results"})},{depth:3,url:"#llm-merge-parallel-doublepass",title:e.jsx(e.Fragment,{children:"LLM merge (parallel, doublePass)"})},{depth:3,url:"#schema-aware-auto-merge",title:e.jsx(e.Fragment,{children:"Schema-aware auto-merge"})},{depth:2,url:"#deduplication",title:e.jsx(e.Fragment,{children:"Deduplication"})},{depth:3,url:"#when-dedup-matters",title:e.jsx(e.Fragment,{children:"When dedup matters"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function n(a){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h2,{id:"the-context-window-problem",children:"The context window problem"}),`
`,e.jsxs(t.p,{children:["LLMs have finite context windows. Documents — especially multi-page PDFs, large datasets, or many files at once — often exceed them. Struktur's chunker splits artifact contents into batches that fit within a configurable token budget (",e.jsx(t.code,{children:"chunkSize"}),")."]}),`
`,e.jsx(t.h2,{id:"how-splitting-works",children:"How splitting works"}),`
`,e.jsx(t.p,{children:"Splitting happens at two levels:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"ArtifactSplitter:"})," splits a single large artifact's contents into smaller parts, respecting content slice boundaries (e.g., page boundaries)."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"ArtifactBatcher:"})," groups artifacts or artifact parts into batches that stay within the token budget and optional image count limit."]}),`
`]}),`
`,e.jsxs(t.p,{children:["The tokenizer uses a character-approximation (not exact token counting). ",e.jsx(t.code,{children:"chunkSize"})," defaults to 10,000 tokens."]}),`
`,e.jsxs(t.h2,{id:"images-and-maximages",children:["Images and ",e.jsx(t.code,{children:"maxImages"})]}),`
`,e.jsxs(t.p,{children:["Some strategies accept ",e.jsx(t.code,{children:"maxImages"})," to cap how many images appear per chunk. This matters when images consume disproportionate context. If a batch would exceed ",e.jsx(t.code,{children:"maxImages"}),", extra images are moved to the next batch."]}),`
`,e.jsxs(t.h2,{id:"why-simple-does-not-chunk",children:["Why ",e.jsx(t.code,{children:"simple"})," does not chunk"]}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"simple"})," strategy loads all artifacts as-is. If the input exceeds the context window, the LLM call may fail or produce degraded results. For large inputs, use a chunked strategy."]}),`
`,e.jsxs(t.p,{children:["This is a deliberate trade-off: ",e.jsx(t.code,{children:"simple"})," is fast and cheap for small inputs, not suitable for large ones."]}),`
`,e.jsx(t.h2,{id:"merging-partial-results",children:"Merging partial results"}),`
`,e.jsx(t.p,{children:"When a document is split into N chunks and each chunk is extracted independently, you get N partial objects."}),`
`,e.jsx(t.p,{children:"For a scalar-heavy schema (title, author, date), you want the best answer from all chunks."}),`
`,e.jsx(t.p,{children:"For an array-heavy schema (line items, product listings), you want to concatenate all arrays and remove duplicates."}),`
`,e.jsx(t.h3,{id:"llm-merge-parallel-doublepass",children:"LLM merge (parallel, doublePass)"}),`
`,e.jsxs(t.p,{children:["These strategies send all partial results to a ",e.jsx(t.strong,{children:"merge model"})," in a single call, with a prompt asking it to produce a single coherent output. The merge model sees the full schema and all partial outputs."]}),`
`,e.jsx(t.p,{children:"This is powerful but costs extra tokens."}),`
`,e.jsx(t.h3,{id:"schema-aware-auto-merge",children:"Schema-aware auto-merge"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"parallelAutoMerge"}),", ",e.jsx(t.code,{children:"sequentialAutoMerge"}),", and ",e.jsx(t.code,{children:"doublePassAutoMerge"})," use ",e.jsx(t.code,{children:"SmartDataMerger"}),":"]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Arrays:"})," concatenated. ",e.jsx(t.code,{children:"items"})," from chunk 1 + ",e.jsx(t.code,{children:"items"})," from chunk 2 = ",e.jsx(t.code,{children:"items"})," in merged."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Objects:"})," shallow-merged. Keys from later chunks overwrite keys from earlier ones."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Scalars:"})," prefer newer non-empty values."]}),`
`]}),`
`,e.jsx(t.p,{children:"This approach avoids an extra LLM call and works well for list-extraction schemas. It does not handle complex cross-chunk synthesis — for that, use LLM merge."}),`
`,e.jsx(t.h2,{id:"deduplication",children:"Deduplication"}),`
`,e.jsx(t.p,{children:"After auto-merging concatenated arrays, there may be duplicates. Dedup runs in two stages:"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Stage 1: CRC32 hash-based."})," Exact duplicates (byte-for-byte identical after stable JSON stringification) are removed without any LLM call. Fast and cheap."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Stage 2: LLM-based semantic dedup."}),' A dedupe model is given the merged array and asked to identify semantically equivalent entries (e.g., "iPhone 15" vs "Apple iPhone 15 128GB"). It returns a list of dot-path keys to remove (e.g., ',e.jsx(t.code,{children:"items.3"}),")."]}),`
`,e.jsx(t.p,{children:"Only the auto-merge variants include this step."}),`
`,e.jsx(t.h3,{id:"when-dedup-matters",children:"When dedup matters"}),`
`,e.jsx(t.p,{children:"Dedup is valuable when:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"The same item legitimately appears in multiple chunks."}),`
`,e.jsx(t.li,{children:"The same document segment appears in multiple artifacts."}),`
`]}),`
`,e.jsx(t.p,{children:"Dedup adds token cost and latency. For schemas without arrays, or for inputs with no expected overlap, use strategies without auto-merge."}),`
`,e.jsx(t.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"})," — the full flow"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/strategies",children:"Extraction Strategies"})," — which strategies use chunking"]}),`
`]})]})}function c(a={}){const{wrapper:t}=a.components||{};return t?e.jsx(t,{...a,children:e.jsx(n,{...a})}):n(a)}export{i as _markdown,c as default,r as frontmatter,o as structuredData,l as toc};
