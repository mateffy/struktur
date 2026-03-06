import{j as e}from"./main-DFCjmrOs.js";let s=`

At a glance [#at-a-glance]

| Property    | Value                                   |
| ----------- | --------------------------------------- |
| Name        | \`"double-pass-auto-merge"\`              |
| LLM calls   | N × 2 batches + 1 dedupe                |
| Parallelism | First pass full, second pass none       |
| Merge step  | Schema-aware auto-merge                 |
| Dedupe step | CRC32 hash + LLM semantic               |
| Best for    | Large array extraction, maximum quality |

Configuration [#configuration]

| Field                | Required | Default         | Description                                                        |
| -------------------- | -------- | --------------- | ------------------------------------------------------------------ |
| \`model\`              | Yes      | -               | Model for extraction                                               |
| \`chunkSize\`          | Yes      | -               | Token budget per batch                                             |
| \`concurrency\`        | No       | All batches     | Max parallel batches                                               |
| \`maxImages\`          | No       | Unlimited       | Max images per batch                                               |
| \`outputInstructions\` | No       | -               | Extra instructions                                                 |
| \`dedupeModel\`        | No       | Same as \`model\` | Model for semantic dedupe                                          |
| \`strict\`             | No       | \`false\`         | Validate required fields on every step (disables smart validation) |

Algorithm [#algorithm]

**Pass 1 (parallel):**

1. Split artifacts into batches
2. Extract from each batch concurrently
3. Validate each batch output with retry
4. **Schema-aware merge** all partial results
5. **Hash dedupe:** CRC32
6. **Semantic dedupe:** LLM

**Pass 2 (sequential):**

7. For each batch in order:
   * Build prompt including deduped pass 1 result as context
   * Extract from batch
   * Validate with retry
   * Store result for next iteration
8. Return final result

Validation behavior [#validation-behavior]

Each batch extraction (both passes) is validated with retry.

Merge behavior [#merge-behavior]

Schema-aware auto-merge after pass 1 extraction:

* **Arrays:** concatenated
* **Objects:** shallow-merged
* **Scalars:** prefer newer non-empty values

No LLM merge call.

Deduplication [#deduplication]

After pass 1 merge:

1. **CRC32 hash:** Exact duplicates
2. **LLM semantic:** Near-duplicates

Token cost profile [#token-cost-profile]

**High** — 2 × N extraction calls + 1 dedupe call. High cost, maximum quality for array extraction.

Example [#example]

\`\`\`js
import { extract, doublePassAutoMerge } from "@mateffy/struktur";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: doublePassAutoMerge({
    model: openai("gpt-4o-mini"),
    dedupeModel: openai("gpt-4o-mini"),
    chunkSize: 10000,
  }),
});
\`\`\`

CLI [#cli]

\`\`\`bash
struktur --input catalog.pdf --schema schema.json --strategy doublePassAutoMerge --model openai/gpt-4o
\`\`\`

When to use [#when-to-use]

* Large array extraction with maximum quality requirement
* Arrays may have duplicates
* Cross-chunk context matters
* Quality trumps cost

When to avoid [#when-to-avoid]

* Cost is a concern (use \`parallelAutoMerge\`)
* Speed is critical
* Schema is primarily scalars (use \`doublePass\`)

See also [#see-also]

* [doublePass](/docs/explanation/strategies/double-pass) — for scalar schemas
* [parallelAutoMerge](/docs/explanation/strategies/parallel-auto-merge) — for speed priority
* [Choosing a Strategy](/docs/explanation/strategies/choosing) — decision guide
`,r={title:"doublePassAutoMerge",description:"Double-pass extraction with schema-aware merge and deduplication."},l={contents:[{heading:"at-a-glance",content:"Property"},{heading:"at-a-glance",content:"Value"},{heading:"at-a-glance",content:"Name"},{heading:"at-a-glance",content:'`"double-pass-auto-merge"`'},{heading:"at-a-glance",content:"LLM calls"},{heading:"at-a-glance",content:"N × 2 batches + 1 dedupe"},{heading:"at-a-glance",content:"Parallelism"},{heading:"at-a-glance",content:"First pass full, second pass none"},{heading:"at-a-glance",content:"Merge step"},{heading:"at-a-glance",content:"Schema-aware auto-merge"},{heading:"at-a-glance",content:"Dedupe step"},{heading:"at-a-glance",content:"CRC32 hash + LLM semantic"},{heading:"at-a-glance",content:"Best for"},{heading:"at-a-glance",content:"Large array extraction, maximum quality"},{heading:"configuration",content:"Field"},{heading:"configuration",content:"Required"},{heading:"configuration",content:"Default"},{heading:"configuration",content:"Description"},{heading:"configuration",content:"`model`"},{heading:"configuration",content:"Yes"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Model for extraction"},{heading:"configuration",content:"`chunkSize`"},{heading:"configuration",content:"Yes"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Token budget per batch"},{heading:"configuration",content:"`concurrency`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"All batches"},{heading:"configuration",content:"Max parallel batches"},{heading:"configuration",content:"`maxImages`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"Unlimited"},{heading:"configuration",content:"Max images per batch"},{heading:"configuration",content:"`outputInstructions`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Extra instructions"},{heading:"configuration",content:"`dedupeModel`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"Same as `model`"},{heading:"configuration",content:"Model for semantic dedupe"},{heading:"configuration",content:"`strict`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"`false`"},{heading:"configuration",content:"Validate required fields on every step (disables smart validation)"},{heading:"algorithm",content:"**Pass 1 (parallel):**"},{heading:"algorithm",content:"Split artifacts into batches"},{heading:"algorithm",content:"Extract from each batch concurrently"},{heading:"algorithm",content:"Validate each batch output with retry"},{heading:"algorithm",content:"**Schema-aware merge** all partial results"},{heading:"algorithm",content:"**Hash dedupe:** CRC32"},{heading:"algorithm",content:"**Semantic dedupe:** LLM"},{heading:"algorithm",content:"**Pass 2 (sequential):**"},{heading:"algorithm",content:"For each batch in order:"},{heading:"algorithm",content:"Build prompt including deduped pass 1 result as context"},{heading:"algorithm",content:"Extract from batch"},{heading:"algorithm",content:"Validate with retry"},{heading:"algorithm",content:"Store result for next iteration"},{heading:"algorithm",content:"Return final result"},{heading:"validation-behavior",content:"Each batch extraction (both passes) is validated with retry."},{heading:"merge-behavior",content:"Schema-aware auto-merge after pass 1 extraction:"},{heading:"merge-behavior",content:"**Arrays:** concatenated"},{heading:"merge-behavior",content:"**Objects:** shallow-merged"},{heading:"merge-behavior",content:"**Scalars:** prefer newer non-empty values"},{heading:"merge-behavior",content:"No LLM merge call."},{heading:"deduplication",content:"After pass 1 merge:"},{heading:"deduplication",content:"**CRC32 hash:** Exact duplicates"},{heading:"deduplication",content:"**LLM semantic:** Near-duplicates"},{heading:"token-cost-profile",content:"**High** — 2 × N extraction calls + 1 dedupe call. High cost, maximum quality for array extraction."},{heading:"when-to-use",content:"Large array extraction with maximum quality requirement"},{heading:"when-to-use",content:"Arrays may have duplicates"},{heading:"when-to-use",content:"Cross-chunk context matters"},{heading:"when-to-use",content:"Quality trumps cost"},{heading:"when-to-avoid",content:"Cost is a concern (use `parallelAutoMerge`)"},{heading:"when-to-avoid",content:"Speed is critical"},{heading:"when-to-avoid",content:"Schema is primarily scalars (use `doublePass`)"},{heading:"see-also",content:"doublePass — for scalar schemas"},{heading:"see-also",content:"parallelAutoMerge — for speed priority"},{heading:"see-also",content:"Choosing a Strategy — decision guide"}],headings:[{id:"at-a-glance",content:"At a glance"},{id:"configuration",content:"Configuration"},{id:"algorithm",content:"Algorithm"},{id:"validation-behavior",content:"Validation behavior"},{id:"merge-behavior",content:"Merge behavior"},{id:"deduplication",content:"Deduplication"},{id:"token-cost-profile",content:"Token cost profile"},{id:"example",content:"Example"},{id:"cli",content:"CLI"},{id:"when-to-use",content:"When to use"},{id:"when-to-avoid",content:"When to avoid"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#at-a-glance",title:e.jsx(e.Fragment,{children:"At a glance"})},{depth:2,url:"#configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:2,url:"#algorithm",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:2,url:"#validation-behavior",title:e.jsx(e.Fragment,{children:"Validation behavior"})},{depth:2,url:"#merge-behavior",title:e.jsx(e.Fragment,{children:"Merge behavior"})},{depth:2,url:"#deduplication",title:e.jsx(e.Fragment,{children:"Deduplication"})},{depth:2,url:"#token-cost-profile",title:e.jsx(e.Fragment,{children:"Token cost profile"})},{depth:2,url:"#example",title:e.jsx(e.Fragment,{children:"Example"})},{depth:2,url:"#cli",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:2,url:"#when-to-use",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#when-to-avoid",title:e.jsx(e.Fragment,{children:"When to avoid"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function t(i){const n={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"at-a-glance",children:"At a glance"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Value"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Name"}),e.jsx(n.td,{children:e.jsx(n.code,{children:'"double-pass-auto-merge"'})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"LLM calls"}),e.jsx(n.td,{children:"N × 2 batches + 1 dedupe"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Parallelism"}),e.jsx(n.td,{children:"First pass full, second pass none"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Merge step"}),e.jsx(n.td,{children:"Schema-aware auto-merge"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Dedupe step"}),e.jsx(n.td,{children:"CRC32 hash + LLM semantic"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Best for"}),e.jsx(n.td,{children:"Large array extraction, maximum quality"})]})]})]}),`
`,e.jsx(n.h2,{id:"configuration",children:"Configuration"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Field"}),e.jsx(n.th,{children:"Required"}),e.jsx(n.th,{children:"Default"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"model"})}),e.jsx(n.td,{children:"Yes"}),e.jsx(n.td,{children:"-"}),e.jsx(n.td,{children:"Model for extraction"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"chunkSize"})}),e.jsx(n.td,{children:"Yes"}),e.jsx(n.td,{children:"-"}),e.jsx(n.td,{children:"Token budget per batch"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"concurrency"})}),e.jsx(n.td,{children:"No"}),e.jsx(n.td,{children:"All batches"}),e.jsx(n.td,{children:"Max parallel batches"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"maxImages"})}),e.jsx(n.td,{children:"No"}),e.jsx(n.td,{children:"Unlimited"}),e.jsx(n.td,{children:"Max images per batch"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"outputInstructions"})}),e.jsx(n.td,{children:"No"}),e.jsx(n.td,{children:"-"}),e.jsx(n.td,{children:"Extra instructions"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"dedupeModel"})}),e.jsx(n.td,{children:"No"}),e.jsxs(n.td,{children:["Same as ",e.jsx(n.code,{children:"model"})]}),e.jsx(n.td,{children:"Model for semantic dedupe"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"strict"})}),e.jsx(n.td,{children:"No"}),e.jsx(n.td,{children:e.jsx(n.code,{children:"false"})}),e.jsx(n.td,{children:"Validate required fields on every step (disables smart validation)"})]})]})]}),`
`,e.jsx(n.h2,{id:"algorithm",children:"Algorithm"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pass 1 (parallel):"})}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Split artifacts into batches"}),`
`,e.jsx(n.li,{children:"Extract from each batch concurrently"}),`
`,e.jsx(n.li,{children:"Validate each batch output with retry"}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Schema-aware merge"})," all partial results"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Hash dedupe:"})," CRC32"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Semantic dedupe:"})," LLM"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pass 2 (sequential):"})}),`
`,e.jsxs(n.ol,{start:"7",children:[`
`,e.jsxs(n.li,{children:["For each batch in order:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Build prompt including deduped pass 1 result as context"}),`
`,e.jsx(n.li,{children:"Extract from batch"}),`
`,e.jsx(n.li,{children:"Validate with retry"}),`
`,e.jsx(n.li,{children:"Store result for next iteration"}),`
`]}),`
`]}),`
`,e.jsx(n.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(n.h2,{id:"validation-behavior",children:"Validation behavior"}),`
`,e.jsx(n.p,{children:"Each batch extraction (both passes) is validated with retry."}),`
`,e.jsx(n.h2,{id:"merge-behavior",children:"Merge behavior"}),`
`,e.jsx(n.p,{children:"Schema-aware auto-merge after pass 1 extraction:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Arrays:"})," concatenated"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Objects:"})," shallow-merged"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Scalars:"})," prefer newer non-empty values"]}),`
`]}),`
`,e.jsx(n.p,{children:"No LLM merge call."}),`
`,e.jsx(n.h2,{id:"deduplication",children:"Deduplication"}),`
`,e.jsx(n.p,{children:"After pass 1 merge:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"CRC32 hash:"})," Exact duplicates"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"LLM semantic:"})," Near-duplicates"]}),`
`]}),`
`,e.jsx(n.h2,{id:"token-cost-profile",children:"Token cost profile"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"High"})," — 2 × N extraction calls + 1 dedupe call. High cost, maximum quality for array extraction."]}),`
`,e.jsx(n.h2,{id:"example",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, doublePassAutoMerge } "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"doublePassAutoMerge"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    dedupeModel: "}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(n.h2,{id:"cli",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" catalog.pdf"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doublePassAutoMerge"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o"})]})})})}),`
`,e.jsx(n.h2,{id:"when-to-use",children:"When to use"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Large array extraction with maximum quality requirement"}),`
`,e.jsx(n.li,{children:"Arrays may have duplicates"}),`
`,e.jsx(n.li,{children:"Cross-chunk context matters"}),`
`,e.jsx(n.li,{children:"Quality trumps cost"}),`
`]}),`
`,e.jsx(n.h2,{id:"when-to-avoid",children:"When to avoid"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Cost is a concern (use ",e.jsx(n.code,{children:"parallelAutoMerge"}),")"]}),`
`,e.jsx(n.li,{children:"Speed is critical"}),`
`,e.jsxs(n.li,{children:["Schema is primarily scalars (use ",e.jsx(n.code,{children:"doublePass"}),")"]}),`
`]}),`
`,e.jsx(n.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/explanation/strategies/double-pass",children:"doublePass"})," — for scalar schemas"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/explanation/strategies/parallel-auto-merge",children:"parallelAutoMerge"})," — for speed priority"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/explanation/strategies/choosing",children:"Choosing a Strategy"})," — decision guide"]}),`
`]})]})}function c(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{s as _markdown,c as default,r as frontmatter,l as structuredData,h as toc};
