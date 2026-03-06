import{j as e}from"./main-DSPhsHwQ.js";let r=`

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

**Schema-first.** You define the shape, Struktur guarantees it.

**Fields shorthand.** Skip the JSON Schema boilerplate with \`--fields "title, price:number, status:enum{draft|live}"\`.

Trade-offs [#trade-offs]

| Trade-off                          | Rationale                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Requires upstream preprocessing    | Keeps Struktur focused; use best-of-breed parsers per format                       |
| Batch-only, no streaming           | Simpler mental model; input in, JSON out                                           |
| Depends on Vercel AI SDK providers | OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API |
| Token costs depend on strategy     | \`doublePass\` costs more than \`simple\`; know your rates                             |

A 10-second demo [#a-10-second-demo]

\`\`\`bash
struktur --input invoice.pdf \\
  --fields "number, vendor, total:number" \\
  --model openai/gpt-4o-mini
\`\`\`

Expected output:

\`\`\`json
{
  "number": "1042",
  "vendor": "Acme Corp",
  "total": 2400
}
\`\`\`

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

* \`name\`: string identifier
* \`run()\`: the orchestration logic
* \`getEstimatedSteps()\`: optional, for progress tracking

Strategies own their config (model, chunk size, concurrency). All strategies guarantee: output validates against the schema or they throw.

Built-in strategies [#built-in-strategies]

| Strategy              | Description                                 |
| --------------------- | ------------------------------------------- |
| \`simple\`              | Single-shot extraction for small inputs     |
| \`parallel\`            | Concurrent batches with LLM merge           |
| \`sequential\`          | Ordered batches with context carryover      |
| \`parallelAutoMerge\`   | Parallel with schema-aware merge + dedupe   |
| \`sequentialAutoMerge\` | Sequential with schema-aware merge + dedupe |
| \`doublePass\`          | Parallel pass + sequential refinement       |
| \`doublePassAutoMerge\` | Double-pass with auto-merge                 |

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
`,a={title:"What is Struktur?",description:"All-in-one tool for structured data extraction that turns pre-parsed documents into validated JSON using LLMs."},o={contents:[{heading:void 0,content:"Struktur is an all-in-one tool for structured data extraction that turns pre-parsed documents into validated, schema-typed JSON. It operates on Artifacts, chunks them by token budgets, runs extraction strategies, validates results against your schema, and merges or deduplicates outputs where needed."},{heading:"why-struktur",content:"Large document batches arrive with data locked in semi-structured text. Invoices need to flow into spreadsheets. Product datasheets need to become database rows. The tooling exists, but the orchestration overhead is disproportionate to the extraction task itself."},{heading:"why-struktur",content:"Managed APIs charge per page, impose schema constraints, and require document uploads to external infrastructure. LLM SDKs provide raw model access but leave you to write chunking, validation, retries, and merging every time."},{heading:"why-struktur",content:"Struktur fills the gap: a focused extraction engine that handles the orchestration so you can focus on the output."},{heading:"why-not-managed-apis",content:"Limitation"},{heading:"why-not-managed-apis",content:"Impact"},{heading:"why-not-managed-apis",content:"Per-page pricing"},{heading:"why-not-managed-apis",content:"Does not scale for large batches"},{heading:"why-not-managed-apis",content:"Schema constraints"},{heading:"why-not-managed-apis",content:"You work within their data model"},{heading:"why-not-managed-apis",content:"Document upload"},{heading:"why-not-managed-apis",content:"Non-starter for confidential workloads"},{heading:"why-not-managed-apis",content:"Black-box behavior"},{heading:"why-not-managed-apis",content:"Debugging extraction failures is opaque"},{heading:"why-not-a-plain-llm-sdk-call",content:"A single `generateText()` call gives you:"},{heading:"why-not-a-plain-llm-sdk-call",content:"No chunking for large documents"},{heading:"why-not-a-plain-llm-sdk-call",content:"No retries on schema validation failure"},{heading:"why-not-a-plain-llm-sdk-call",content:"No merging of multi-chunk results"},{heading:"why-not-a-plain-llm-sdk-call",content:"No typed output inferred from your schema"},{heading:"why-not-a-plain-llm-sdk-call",content:"You write the same orchestration boilerplate every time. Struktur packages that orchestration into tested, configurable strategies."},{heading:"design-philosophy",content:"**Narrow scope, intentionally.** Struktur does extraction only. No parsing. No streaming. No general-purpose LLM orchestration. This focus keeps the API small and the behavior predictable."},{heading:"design-philosophy",content:"**Shell-composable by default.** Reads stdin, writes stdout, speaks JSON. Integrates with `jq`, `find`, `curl`, and any tool in your pipeline."},{heading:"design-philosophy",content:"**Strategy-first.** Different documents need different approaches. A single-page invoice needs simple extraction. A 100-page catalog with duplicate products needs parallel extraction with deduplication. Strategies encode these patterns."},{heading:"design-philosophy",content:"**Validation in the loop.** Errors go back to the model, not to you. The retry loop means most extractions converge within two attempts."},{heading:"design-philosophy",content:"**Schema-first.** You define the shape, Struktur guarantees it."},{heading:"design-philosophy",content:'**Fields shorthand.** Skip the JSON Schema boilerplate with `--fields "title, price:number, status:enum{draft|live}"`.'},{heading:"trade-offs",content:"Trade-off"},{heading:"trade-offs",content:"Rationale"},{heading:"trade-offs",content:"Requires upstream preprocessing"},{heading:"trade-offs",content:"Keeps Struktur focused; use best-of-breed parsers per format"},{heading:"trade-offs",content:"Batch-only, no streaming"},{heading:"trade-offs",content:"Simpler mental model; input in, JSON out"},{heading:"trade-offs",content:"Depends on Vercel AI SDK providers"},{heading:"trade-offs",content:"OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API"},{heading:"trade-offs",content:"Token costs depend on strategy"},{heading:"trade-offs",content:"`doublePass` costs more than `simple`; know your rates"},{heading:"a-10-second-demo",content:"Expected output:"},{heading:"what-struktur-is-not",content:"**It is not a general document conversion tool.** It parses files for extraction purposes, not for format conversion. It does not produce formatted output from documents."},{heading:"what-struktur-is-not",content:"**It is not a managed API.** It runs locally and calls your provider directly."},{heading:"what-struktur-is-not",content:"**It does not stream.** Input in, JSON out."},{heading:"what-struktur-is-not",content:"**It is not a general LLM orchestration framework.**"},{heading:"what-struktur-is-not",content:"For the full mental model, see The Extraction Pipeline."},{heading:"who-is-it-for",content:"**CLI users** — data engineers, analysts, shell pipeline builders — use Struktur for one-off extractions, batch processing, and CI/CD automation without writing code."},{heading:"who-is-it-for",content:"**SDK users** — TypeScript developers embedding extraction in applications — use Struktur for typed results, custom strategies, and fine-grained control over the extraction pipeline."},{heading:"what-are-strategies",content:"A strategy implements:"},{heading:"what-are-strategies",content:"`name`: string identifier"},{heading:"what-are-strategies",content:"`run()`: the orchestration logic"},{heading:"what-are-strategies",content:"`getEstimatedSteps()`: optional, for progress tracking"},{heading:"what-are-strategies",content:"Strategies own their config (model, chunk size, concurrency). All strategies guarantee: output validates against the schema or they throw."},{heading:"built-in-strategies",content:"Strategy"},{heading:"built-in-strategies",content:"Description"},{heading:"built-in-strategies",content:"`simple`"},{heading:"built-in-strategies",content:"Single-shot extraction for small inputs"},{heading:"built-in-strategies",content:"`parallel`"},{heading:"built-in-strategies",content:"Concurrent batches with LLM merge"},{heading:"built-in-strategies",content:"`sequential`"},{heading:"built-in-strategies",content:"Ordered batches with context carryover"},{heading:"built-in-strategies",content:"`parallelAutoMerge`"},{heading:"built-in-strategies",content:"Parallel with schema-aware merge + dedupe"},{heading:"built-in-strategies",content:"`sequentialAutoMerge`"},{heading:"built-in-strategies",content:"Sequential with schema-aware merge + dedupe"},{heading:"built-in-strategies",content:"`doublePass`"},{heading:"built-in-strategies",content:"Parallel pass + sequential refinement"},{heading:"built-in-strategies",content:"`doublePassAutoMerge`"},{heading:"built-in-strategies",content:"Double-pass with auto-merge"},{heading:"built-in-strategies",content:"See Extraction Strategies for details on each strategy and how to choose."},{heading:"quick-navigation",content:"Goal"},{heading:"quick-navigation",content:"Section"},{heading:"quick-navigation",content:"New here?"},{heading:"quick-navigation",content:"Quickstart"},{heading:"quick-navigation",content:"Need to accomplish something?"},{heading:"quick-navigation",content:"Examples"},{heading:"quick-navigation",content:"Looking up a flag or type?"},{heading:"quick-navigation",content:"CLI Reference"},{heading:"quick-navigation",content:"Quick schema without writing JSON?"},{heading:"quick-navigation",content:"Fields Shorthand"},{heading:"quick-navigation",content:"Want to understand how it works?"},{heading:"quick-navigation",content:"Concepts"},{heading:"quick-navigation",content:"Parse files into artifacts?"},{heading:"quick-navigation",content:"Document Parsing"}],headings:[{id:"why-struktur",content:"Why Struktur?"},{id:"why-not-managed-apis",content:"Why not managed APIs?"},{id:"why-not-a-plain-llm-sdk-call",content:"Why not a plain LLM SDK call?"},{id:"design-philosophy",content:"Design philosophy"},{id:"trade-offs",content:"Trade-offs"},{id:"a-10-second-demo",content:"A 10-second demo"},{id:"what-struktur-is-not",content:"What Struktur is NOT"},{id:"who-is-it-for",content:"Who is it for?"},{id:"what-are-strategies",content:"What are Strategies?"},{id:"built-in-strategies",content:"Built-in strategies"},{id:"quick-navigation",content:"Quick navigation"}]};const d=[{depth:2,url:"#why-struktur",title:e.jsx(e.Fragment,{children:"Why Struktur?"})},{depth:3,url:"#why-not-managed-apis",title:e.jsx(e.Fragment,{children:"Why not managed APIs?"})},{depth:3,url:"#why-not-a-plain-llm-sdk-call",title:e.jsx(e.Fragment,{children:"Why not a plain LLM SDK call?"})},{depth:2,url:"#design-philosophy",title:e.jsx(e.Fragment,{children:"Design philosophy"})},{depth:2,url:"#trade-offs",title:e.jsx(e.Fragment,{children:"Trade-offs"})},{depth:2,url:"#a-10-second-demo",title:e.jsx(e.Fragment,{children:"A 10-second demo"})},{depth:2,url:"#what-struktur-is-not",title:e.jsx(e.Fragment,{children:"What Struktur is NOT"})},{depth:2,url:"#who-is-it-for",title:e.jsx(e.Fragment,{children:"Who is it for?"})},{depth:2,url:"#what-are-strategies",title:e.jsx(e.Fragment,{children:"What are Strategies?"})},{depth:3,url:"#built-in-strategies",title:e.jsx(e.Fragment,{children:"Built-in strategies"})},{depth:2,url:"#quick-navigation",title:e.jsx(e.Fragment,{children:"Quick navigation"})}];function i(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Struktur is an all-in-one tool for structured data extraction that turns pre-parsed documents into validated, schema-typed JSON. It operates on Artifacts, chunks them by token budgets, runs extraction strategies, validates results against your schema, and merges or deduplicates outputs where needed."}),`
`,e.jsx(t.h2,{id:"why-struktur",children:"Why Struktur?"}),`
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
`,e.jsx(t.h2,{id:"design-philosophy",children:"Design philosophy"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Narrow scope, intentionally."})," Struktur does extraction only. No parsing. No streaming. No general-purpose LLM orchestration. This focus keeps the API small and the behavior predictable."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Shell-composable by default."})," Reads stdin, writes stdout, speaks JSON. Integrates with ",e.jsx(t.code,{children:"jq"}),", ",e.jsx(t.code,{children:"find"}),", ",e.jsx(t.code,{children:"curl"}),", and any tool in your pipeline."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Strategy-first."})," Different documents need different approaches. A single-page invoice needs simple extraction. A 100-page catalog with duplicate products needs parallel extraction with deduplication. Strategies encode these patterns."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Validation in the loop."})," Errors go back to the model, not to you. The retry loop means most extractions converge within two attempts."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Schema-first."})," You define the shape, Struktur guarantees it."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Fields shorthand."})," Skip the JSON Schema boilerplate with ",e.jsx(t.code,{children:'--fields "title, price:number, status:enum{draft|live}"'}),"."]}),`
`,e.jsx(t.h2,{id:"trade-offs",children:"Trade-offs"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Trade-off"}),e.jsx(t.th,{children:"Rationale"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Requires upstream preprocessing"}),e.jsx(t.td,{children:"Keeps Struktur focused; use best-of-breed parsers per format"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Batch-only, no streaming"}),e.jsx(t.td,{children:"Simpler mental model; input in, JSON out"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Depends on Vercel AI SDK providers"}),e.jsx(t.td,{children:"OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Token costs depend on strategy"}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"doublePass"})," costs more than ",e.jsx(t.code,{children:"simple"}),"; know your rates"]})]})]})]}),`
`,e.jsx(t.h2,{id:"a-10-second-demo",children:"A 10-second demo"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "number, vendor, total:number"'}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,e.jsx(t.p,{children:"Expected output:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "number"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1042"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "vendor"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Acme Corp"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "total"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2400"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(t.h2,{id:"what-struktur-is-not",children:"What Struktur is NOT"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"It is not a general document conversion tool."})," It parses files for extraction purposes, not for format conversion. It does not produce formatted output from documents."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"It is not a managed API."})," It runs locally and calls your provider directly."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"It does not stream."})," Input in, JSON out."]}),`
`,e.jsx(t.li,{children:e.jsx(t.strong,{children:"It is not a general LLM orchestration framework."})}),`
`]}),`
`,e.jsxs(t.p,{children:["For the full mental model, see ",e.jsx(t.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"}),"."]}),`
`,e.jsx(t.h2,{id:"who-is-it-for",children:"Who is it for?"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"CLI users"})," — data engineers, analysts, shell pipeline builders — use Struktur for one-off extractions, batch processing, and CI/CD automation without writing code."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"SDK users"})," — TypeScript developers embedding extraction in applications — use Struktur for typed results, custom strategies, and fine-grained control over the extraction pipeline."]}),`
`,e.jsx(t.h2,{id:"what-are-strategies",children:"What are Strategies?"}),`
`,e.jsx(t.p,{children:"A strategy implements:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"name"}),": string identifier"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"run()"}),": the orchestration logic"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"getEstimatedSteps()"}),": optional, for progress tracking"]}),`
`]}),`
`,e.jsx(t.p,{children:"Strategies own their config (model, chunk size, concurrency). All strategies guarantee: output validates against the schema or they throw."}),`
`,e.jsx(t.h3,{id:"built-in-strategies",children:"Built-in strategies"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Strategy"}),e.jsx(t.th,{children:"Description"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"simple"})}),e.jsx(t.td,{children:"Single-shot extraction for small inputs"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"parallel"})}),e.jsx(t.td,{children:"Concurrent batches with LLM merge"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"sequential"})}),e.jsx(t.td,{children:"Ordered batches with context carryover"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"parallelAutoMerge"})}),e.jsx(t.td,{children:"Parallel with schema-aware merge + dedupe"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"sequentialAutoMerge"})}),e.jsx(t.td,{children:"Sequential with schema-aware merge + dedupe"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"doublePass"})}),e.jsx(t.td,{children:"Parallel pass + sequential refinement"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"doublePassAutoMerge"})}),e.jsx(t.td,{children:"Double-pass with auto-merge"})]})]})]}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/explanation/strategies",children:"Extraction Strategies"})," for details on each strategy and how to choose."]}),`
`,e.jsx(t.h2,{id:"quick-navigation",children:"Quick navigation"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Goal"}),e.jsx(t.th,{children:"Section"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"New here?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/quickstart",children:"Quickstart"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Need to accomplish something?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/examples",children:"Examples"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Looking up a flag or type?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/cli",children:"CLI Reference"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Quick schema without writing JSON?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/cli/fields",children:"Fields Shorthand"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Want to understand how it works?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation",children:"Concepts"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Parse files into artifacts?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation/document-parsing",children:"Document Parsing"})})]})]})]})]})}function l(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}export{r as _markdown,l as default,a as frontmatter,o as structuredData,d as toc};
