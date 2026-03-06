import{j as e}from"./main-PqBd4K9d.js";let i=`

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

A single \`generateText()\` call gives you:

* No chunking for large documents
* No retries on schema validation failure
* No merging of multi-chunk results
* No typed output inferred from your schema

You write the same orchestration boilerplate every time. Struktur packages that orchestration into tested, configurable strategies.

Design philosophy [#design-philosophy]

**Narrow scope, intentionally.** Struktur does extraction only. No parsing. No streaming. No general-purpose LLM orchestration. This focus keeps the API small and the behavior predictable.

**Shell-composable by default.** Reads stdin, writes stdout, speaks JSON. Integrates with \`jq\`, \`find\`, \`curl\`, and any tool in your pipeline.

**Strategy-first.** Different documents need different approaches. A single-page invoice needs simple extraction. A 100-page catalog with duplicate products needs parallel extraction with deduplication. Strategies encode these patterns.

**Validation in the loop.** Errors go back to the model, not to you. The retry loop means most extractions converge within two attempts.

Trade-offs [#trade-offs]

| Trade-off                          | Rationale                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Requires upstream preprocessing    | Keeps Struktur focused; use best-of-breed parsers per format                       |
| Batch-only, no streaming           | Simpler mental model; input in, JSON out                                           |
| Depends on Vercel AI SDK providers | OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API |
| Token costs depend on strategy     | \`doublePass\` costs more than \`simple\`; know your rates                             |

***

What are Strategies? [#what-are-strategies]

A strategy implements:

* \`name\`: string identifier
* \`run()\`: the orchestration logic
* \`getEstimatedSteps()\`: optional, for progress tracking

Strategies own their config (model, chunk size, concurrency). All strategies guarantee: output validates against the schema or they throw.

Built-in strategies [#built-in-strategies]

| Strategy                                                                   | Description                                 |
| -------------------------------------------------------------------------- | ------------------------------------------- |
| [simple](/docs/explanation/strategies/simple)                              | Single-shot extraction for small inputs     |
| [parallel](/docs/explanation/strategies/parallel)                          | Concurrent batches with LLM merge           |
| [sequential](/docs/explanation/strategies/sequential)                      | Ordered batches with context carryover      |
| [parallelAutoMerge](/docs/explanation/strategies/parallel-auto-merge)      | Parallel with schema-aware merge + dedupe   |
| [sequentialAutoMerge](/docs/explanation/strategies/sequential-auto-merge)  | Sequential with schema-aware merge + dedupe |
| [doublePass](/docs/explanation/strategies/double-pass)                     | Parallel pass + sequential refinement       |
| [doublePassAutoMerge](/docs/explanation/strategies/double-pass-auto-merge) | Double-pass with auto-merge                 |

Choosing a strategy [#choosing-a-strategy]

See [Choosing a Strategy](/docs/explanation/strategies/choosing) for a decision guide.

Custom strategies [#custom-strategies]

See [Writing a Custom Strategy](/docs/explanation/strategies/custom-strategy) to implement your own.

***

See also [#see-also]

* [The Extraction Pipeline](/docs/explanation/pipeline) — how data flows through Struktur
* [Quickstart](/docs/quickstart) — get started in 5 minutes
`,r={title:"Struktur",description:"The design philosophy, trade-offs, and extraction strategies behind Struktur."},o={contents:[{heading:"why-struktur",content:"Large document batches arrive with data locked in semi-structured text. Invoices need to flow into spreadsheets. Product datasheets need to become database rows. The tooling exists, but the orchestration overhead is disproportionate to the extraction task itself."},{heading:"why-struktur",content:"Managed APIs charge per page, impose schema constraints, and require document uploads to external infrastructure. LLM SDKs provide raw model access but leave you to write chunking, validation, retries, and merging every time."},{heading:"why-struktur",content:"Struktur fills the gap: a focused extraction engine that handles the orchestration so you can focus on the output."},{heading:"why-not-managed-apis",content:"Limitation"},{heading:"why-not-managed-apis",content:"Impact"},{heading:"why-not-managed-apis",content:"Per-page pricing"},{heading:"why-not-managed-apis",content:"Does not scale for large batches"},{heading:"why-not-managed-apis",content:"Schema constraints"},{heading:"why-not-managed-apis",content:"You work within their data model"},{heading:"why-not-managed-apis",content:"Document upload"},{heading:"why-not-managed-apis",content:"Non-starter for confidential workloads"},{heading:"why-not-managed-apis",content:"Black-box behavior"},{heading:"why-not-managed-apis",content:"Debugging extraction failures is opaque"},{heading:"why-not-a-plain-llm-sdk-call",content:"A single `generateText()` call gives you:"},{heading:"why-not-a-plain-llm-sdk-call",content:"No chunking for large documents"},{heading:"why-not-a-plain-llm-sdk-call",content:"No retries on schema validation failure"},{heading:"why-not-a-plain-llm-sdk-call",content:"No merging of multi-chunk results"},{heading:"why-not-a-plain-llm-sdk-call",content:"No typed output inferred from your schema"},{heading:"why-not-a-plain-llm-sdk-call",content:"You write the same orchestration boilerplate every time. Struktur packages that orchestration into tested, configurable strategies."},{heading:"design-philosophy",content:"**Narrow scope, intentionally.** Struktur does extraction only. No parsing. No streaming. No general-purpose LLM orchestration. This focus keeps the API small and the behavior predictable."},{heading:"design-philosophy",content:"**Shell-composable by default.** Reads stdin, writes stdout, speaks JSON. Integrates with `jq`, `find`, `curl`, and any tool in your pipeline."},{heading:"design-philosophy",content:"**Strategy-first.** Different documents need different approaches. A single-page invoice needs simple extraction. A 100-page catalog with duplicate products needs parallel extraction with deduplication. Strategies encode these patterns."},{heading:"design-philosophy",content:"**Validation in the loop.** Errors go back to the model, not to you. The retry loop means most extractions converge within two attempts."},{heading:"trade-offs",content:"Trade-off"},{heading:"trade-offs",content:"Rationale"},{heading:"trade-offs",content:"Requires upstream preprocessing"},{heading:"trade-offs",content:"Keeps Struktur focused; use best-of-breed parsers per format"},{heading:"trade-offs",content:"Batch-only, no streaming"},{heading:"trade-offs",content:"Simpler mental model; input in, JSON out"},{heading:"trade-offs",content:"Depends on Vercel AI SDK providers"},{heading:"trade-offs",content:"OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API"},{heading:"trade-offs",content:"Token costs depend on strategy"},{heading:"trade-offs",content:"`doublePass` costs more than `simple`; know your rates"},{heading:"what-are-strategies",content:"A strategy implements:"},{heading:"what-are-strategies",content:"`name`: string identifier"},{heading:"what-are-strategies",content:"`run()`: the orchestration logic"},{heading:"what-are-strategies",content:"`getEstimatedSteps()`: optional, for progress tracking"},{heading:"what-are-strategies",content:"Strategies own their config (model, chunk size, concurrency). All strategies guarantee: output validates against the schema or they throw."},{heading:"built-in-strategies",content:"Strategy"},{heading:"built-in-strategies",content:"Description"},{heading:"built-in-strategies",content:"simple"},{heading:"built-in-strategies",content:"Single-shot extraction for small inputs"},{heading:"built-in-strategies",content:"parallel"},{heading:"built-in-strategies",content:"Concurrent batches with LLM merge"},{heading:"built-in-strategies",content:"sequential"},{heading:"built-in-strategies",content:"Ordered batches with context carryover"},{heading:"built-in-strategies",content:"parallelAutoMerge"},{heading:"built-in-strategies",content:"Parallel with schema-aware merge + dedupe"},{heading:"built-in-strategies",content:"sequentialAutoMerge"},{heading:"built-in-strategies",content:"Sequential with schema-aware merge + dedupe"},{heading:"built-in-strategies",content:"doublePass"},{heading:"built-in-strategies",content:"Parallel pass + sequential refinement"},{heading:"built-in-strategies",content:"doublePassAutoMerge"},{heading:"built-in-strategies",content:"Double-pass with auto-merge"},{heading:"choosing-a-strategy",content:"See Choosing a Strategy for a decision guide."},{heading:"custom-strategies",content:"See Writing a Custom Strategy to implement your own."},{heading:"see-also",content:"The Extraction Pipeline — how data flows through Struktur"},{heading:"see-also",content:"Quickstart — get started in 5 minutes"}],headings:[{id:"why-struktur",content:"Why Struktur?"},{id:"why-not-managed-apis",content:"Why not managed APIs?"},{id:"why-not-a-plain-llm-sdk-call",content:"Why not a plain LLM SDK call?"},{id:"design-philosophy",content:"Design philosophy"},{id:"trade-offs",content:"Trade-offs"},{id:"what-are-strategies",content:"What are Strategies?"},{id:"built-in-strategies",content:"Built-in strategies"},{id:"choosing-a-strategy",content:"Choosing a strategy"},{id:"custom-strategies",content:"Custom strategies"},{id:"see-also",content:"See also"}]};const l=[{depth:3,url:"#why-struktur",title:e.jsx(e.Fragment,{children:"Why Struktur?"})},{depth:3,url:"#why-not-managed-apis",title:e.jsx(e.Fragment,{children:"Why not managed APIs?"})},{depth:3,url:"#why-not-a-plain-llm-sdk-call",title:e.jsx(e.Fragment,{children:"Why not a plain LLM SDK call?"})},{depth:3,url:"#design-philosophy",title:e.jsx(e.Fragment,{children:"Design philosophy"})},{depth:3,url:"#trade-offs",title:e.jsx(e.Fragment,{children:"Trade-offs"})},{depth:2,url:"#what-are-strategies",title:e.jsx(e.Fragment,{children:"What are Strategies?"})},{depth:3,url:"#built-in-strategies",title:e.jsx(e.Fragment,{children:"Built-in strategies"})},{depth:3,url:"#choosing-a-strategy",title:e.jsx(e.Fragment,{children:"Choosing a strategy"})},{depth:3,url:"#custom-strategies",title:e.jsx(e.Fragment,{children:"Custom strategies"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function s(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h3,{id:"why-struktur",children:"Why Struktur?"}),`
`,e.jsx(t.p,{children:"Large document batches arrive with data locked in semi-structured text. Invoices need to flow into spreadsheets. Product datasheets need to become database rows. The tooling exists, but the orchestration overhead is disproportionate to the extraction task itself."}),`
`,e.jsx(t.p,{children:"Managed APIs charge per page, impose schema constraints, and require document uploads to external infrastructure. LLM SDKs provide raw model access but leave you to write chunking, validation, retries, and merging every time."}),`
`,e.jsx(t.p,{children:"Struktur fills the gap: a focused extraction engine that handles the orchestration so you can focus on the output."}),`
`,e.jsx(t.h3,{id:"why-not-managed-apis",children:"Why not managed APIs?"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Limitation"}),e.jsx(t.th,{children:"Impact"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Per-page pricing"}),e.jsx(t.td,{children:"Does not scale for large batches"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Schema constraints"}),e.jsx(t.td,{children:"You work within their data model"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Document upload"}),e.jsx(t.td,{children:"Non-starter for confidential workloads"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Black-box behavior"}),e.jsx(t.td,{children:"Debugging extraction failures is opaque"})]})]})]}),`
`,e.jsx(t.h3,{id:"why-not-a-plain-llm-sdk-call",children:"Why not a plain LLM SDK call?"}),`
`,e.jsxs(t.p,{children:["A single ",e.jsx(t.code,{children:"generateText()"})," call gives you:"]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"No chunking for large documents"}),`
`,e.jsx(t.li,{children:"No retries on schema validation failure"}),`
`,e.jsx(t.li,{children:"No merging of multi-chunk results"}),`
`,e.jsx(t.li,{children:"No typed output inferred from your schema"}),`
`]}),`
`,e.jsx(t.p,{children:"You write the same orchestration boilerplate every time. Struktur packages that orchestration into tested, configurable strategies."}),`
`,e.jsx(t.h3,{id:"design-philosophy",children:"Design philosophy"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Narrow scope, intentionally."})," Struktur does extraction only. No parsing. No streaming. No general-purpose LLM orchestration. This focus keeps the API small and the behavior predictable."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Shell-composable by default."})," Reads stdin, writes stdout, speaks JSON. Integrates with ",e.jsx(t.code,{children:"jq"}),", ",e.jsx(t.code,{children:"find"}),", ",e.jsx(t.code,{children:"curl"}),", and any tool in your pipeline."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Strategy-first."})," Different documents need different approaches. A single-page invoice needs simple extraction. A 100-page catalog with duplicate products needs parallel extraction with deduplication. Strategies encode these patterns."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Validation in the loop."})," Errors go back to the model, not to you. The retry loop means most extractions converge within two attempts."]}),`
`,e.jsx(t.h3,{id:"trade-offs",children:"Trade-offs"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Trade-off"}),e.jsx(t.th,{children:"Rationale"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Requires upstream preprocessing"}),e.jsx(t.td,{children:"Keeps Struktur focused; use best-of-breed parsers per format"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Batch-only, no streaming"}),e.jsx(t.td,{children:"Simpler mental model; input in, JSON out"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Depends on Vercel AI SDK providers"}),e.jsx(t.td,{children:"OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Token costs depend on strategy"}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"doublePass"})," costs more than ",e.jsx(t.code,{children:"simple"}),"; know your rates"]})]})]})]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"what-are-strategies",children:"What are Strategies?"}),`
`,e.jsx(t.p,{children:"A strategy implements:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"name"}),": string identifier"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"run()"}),": the orchestration logic"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"getEstimatedSteps()"}),": optional, for progress tracking"]}),`
`]}),`
`,e.jsx(t.p,{children:"Strategies own their config (model, chunk size, concurrency). All strategies guarantee: output validates against the schema or they throw."}),`
`,e.jsx(t.h3,{id:"built-in-strategies",children:"Built-in strategies"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Strategy"}),e.jsx(t.th,{children:"Description"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation/strategies/simple",children:"simple"})}),e.jsx(t.td,{children:"Single-shot extraction for small inputs"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation/strategies/parallel",children:"parallel"})}),e.jsx(t.td,{children:"Concurrent batches with LLM merge"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation/strategies/sequential",children:"sequential"})}),e.jsx(t.td,{children:"Ordered batches with context carryover"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation/strategies/parallel-auto-merge",children:"parallelAutoMerge"})}),e.jsx(t.td,{children:"Parallel with schema-aware merge + dedupe"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation/strategies/sequential-auto-merge",children:"sequentialAutoMerge"})}),e.jsx(t.td,{children:"Sequential with schema-aware merge + dedupe"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation/strategies/double-pass",children:"doublePass"})}),e.jsx(t.td,{children:"Parallel pass + sequential refinement"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation/strategies/double-pass-auto-merge",children:"doublePassAutoMerge"})}),e.jsx(t.td,{children:"Double-pass with auto-merge"})]})]})]}),`
`,e.jsx(t.h3,{id:"choosing-a-strategy",children:"Choosing a strategy"}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/explanation/strategies/choosing",children:"Choosing a Strategy"})," for a decision guide."]}),`
`,e.jsx(t.h3,{id:"custom-strategies",children:"Custom strategies"}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/explanation/strategies/custom-strategy",children:"Writing a Custom Strategy"})," to implement your own."]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"})," — how data flows through Struktur"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/quickstart",children:"Quickstart"})," — get started in 5 minutes"]}),`
`]})]})}function d(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(s,{...n})}):s(n)}export{i as _markdown,d as default,r as frontmatter,o as structuredData,l as toc};
