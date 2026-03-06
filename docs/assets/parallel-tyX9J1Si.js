import{j as e}from"./main-DFCjmrOs.js";let a=`

At a glance [#at-a-glance]

| Property    | Value                        |
| ----------- | ---------------------------- |
| Name        | \`"parallel"\`                 |
| LLM calls   | N batches + 1 merge          |
| Parallelism | Full                         |
| Merge step  | LLM merge                    |
| Dedupe step | None                         |
| Best for    | Large inputs, speed priority |

Configuration [#configuration]

| Field                | Required | Default     | Description                                                        |
| -------------------- | -------- | ----------- | ------------------------------------------------------------------ |
| \`model\`              | Yes      | -           | Model for extraction                                               |
| \`mergeModel\`         | Yes      | -           | Model for merging partial results                                  |
| \`chunkSize\`          | Yes      | -           | Token budget per batch                                             |
| \`concurrency\`        | No       | All batches | Max parallel batches                                               |
| \`maxImages\`          | No       | Unlimited   | Max images per batch                                               |
| \`outputInstructions\` | No       | -           | Extra instructions                                                 |
| \`strict\`             | No       | \`false\`     | Validate required fields on every step (disables smart validation) |

Algorithm [#algorithm]

1. Split artifacts into batches (respecting \`chunkSize\` and \`maxImages\`)
2. Extract from each batch concurrently
3. Validate each batch output with retry
4. Send all partial results to \`mergeModel\` for LLM merge
5. Validate merged output
6. Return final result

\`\`\`mermaid
flowchart LR
    A[Artifacts] --> B[Batch 1]
    A --> C[Batch 2]
    A --> D[Batch N]
    B --> E[Extract]
    C --> E
    D --> E
    E --> F[LLM Merge]
    F --> G[Output]
\`\`\`

Validation behavior [#validation-behavior]

Each batch extraction is validated with retry. The final merge is also validated.

Merge behavior [#merge-behavior]

LLM merge. All partial results are sent to a merge model with a prompt asking it to produce a single coherent output. The merge model sees the full schema and all partial outputs.

Token cost profile [#token-cost-profile]

**Medium** — N extraction calls + 1 merge call. Merge model can be cheaper than extraction model.

Example [#example]

\`\`\`js
import { extract, parallel } from "@mateffy/struktur";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: parallel({
    model: openai("gpt-4o-mini"),
    mergeModel: openai("gpt-4o-mini"),
    chunkSize: 10000,
    concurrency: 3,
  }),
});
\`\`\`

CLI [#cli]

\`\`\`bash
struktur --input large.pdf --schema schema.json --strategy parallel --model openai/gpt-4o-mini
\`\`\`

When to use [#when-to-use]

* Speed is the top priority
* Chunks are relatively independent
* Many documents to process
* Can accept potential loss of cross-chunk context

When to avoid [#when-to-avoid]

* Later chunks depend on earlier chunks (use \`sequential\`)
* Extracting arrays that may have duplicates (use \`parallelAutoMerge\`)

See also [#see-also]

* [sequential](/docs/explanation/strategies/sequential) — for context-dependent documents
* [parallelAutoMerge](/docs/explanation/strategies/parallel-auto-merge) — for array extraction with deduplication
* [Choosing a Strategy](/docs/explanation/strategies/choosing) — decision guide
`,l={title:"parallel",description:"Concurrent batch processing with LLM merge."},r={contents:[{heading:"at-a-glance",content:"Property"},{heading:"at-a-glance",content:"Value"},{heading:"at-a-glance",content:"Name"},{heading:"at-a-glance",content:'`"parallel"`'},{heading:"at-a-glance",content:"LLM calls"},{heading:"at-a-glance",content:"N batches + 1 merge"},{heading:"at-a-glance",content:"Parallelism"},{heading:"at-a-glance",content:"Full"},{heading:"at-a-glance",content:"Merge step"},{heading:"at-a-glance",content:"LLM merge"},{heading:"at-a-glance",content:"Dedupe step"},{heading:"at-a-glance",content:"None"},{heading:"at-a-glance",content:"Best for"},{heading:"at-a-glance",content:"Large inputs, speed priority"},{heading:"configuration",content:"Field"},{heading:"configuration",content:"Required"},{heading:"configuration",content:"Default"},{heading:"configuration",content:"Description"},{heading:"configuration",content:"`model`"},{heading:"configuration",content:"Yes"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Model for extraction"},{heading:"configuration",content:"`mergeModel`"},{heading:"configuration",content:"Yes"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Model for merging partial results"},{heading:"configuration",content:"`chunkSize`"},{heading:"configuration",content:"Yes"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Token budget per batch"},{heading:"configuration",content:"`concurrency`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"All batches"},{heading:"configuration",content:"Max parallel batches"},{heading:"configuration",content:"`maxImages`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"Unlimited"},{heading:"configuration",content:"Max images per batch"},{heading:"configuration",content:"`outputInstructions`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Extra instructions"},{heading:"configuration",content:"`strict`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"`false`"},{heading:"configuration",content:"Validate required fields on every step (disables smart validation)"},{heading:"algorithm",content:"Split artifacts into batches (respecting `chunkSize` and `maxImages`)"},{heading:"algorithm",content:"Extract from each batch concurrently"},{heading:"algorithm",content:"Validate each batch output with retry"},{heading:"algorithm",content:"Send all partial results to `mergeModel` for LLM merge"},{heading:"algorithm",content:"Validate merged output"},{heading:"algorithm",content:"Return final result"},{heading:"validation-behavior",content:"Each batch extraction is validated with retry. The final merge is also validated."},{heading:"merge-behavior",content:"LLM merge. All partial results are sent to a merge model with a prompt asking it to produce a single coherent output. The merge model sees the full schema and all partial outputs."},{heading:"token-cost-profile",content:"**Medium** — N extraction calls + 1 merge call. Merge model can be cheaper than extraction model."},{heading:"when-to-use",content:"Speed is the top priority"},{heading:"when-to-use",content:"Chunks are relatively independent"},{heading:"when-to-use",content:"Many documents to process"},{heading:"when-to-use",content:"Can accept potential loss of cross-chunk context"},{heading:"when-to-avoid",content:"Later chunks depend on earlier chunks (use `sequential`)"},{heading:"when-to-avoid",content:"Extracting arrays that may have duplicates (use `parallelAutoMerge`)"},{heading:"see-also",content:"sequential — for context-dependent documents"},{heading:"see-also",content:"parallelAutoMerge — for array extraction with deduplication"},{heading:"see-also",content:"Choosing a Strategy — decision guide"}],headings:[{id:"at-a-glance",content:"At a glance"},{id:"configuration",content:"Configuration"},{id:"algorithm",content:"Algorithm"},{id:"validation-behavior",content:"Validation behavior"},{id:"merge-behavior",content:"Merge behavior"},{id:"token-cost-profile",content:"Token cost profile"},{id:"example",content:"Example"},{id:"cli",content:"CLI"},{id:"when-to-use",content:"When to use"},{id:"when-to-avoid",content:"When to avoid"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#at-a-glance",title:e.jsx(e.Fragment,{children:"At a glance"})},{depth:2,url:"#configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:2,url:"#algorithm",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:2,url:"#validation-behavior",title:e.jsx(e.Fragment,{children:"Validation behavior"})},{depth:2,url:"#merge-behavior",title:e.jsx(e.Fragment,{children:"Merge behavior"})},{depth:2,url:"#token-cost-profile",title:e.jsx(e.Fragment,{children:"Token cost profile"})},{depth:2,url:"#example",title:e.jsx(e.Fragment,{children:"Example"})},{depth:2,url:"#cli",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:2,url:"#when-to-use",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#when-to-avoid",title:e.jsx(e.Fragment,{children:"When to avoid"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function t(n){const i={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"at-a-glance",children:"At a glance"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{children:"Value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Name"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'"parallel"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LLM calls"}),e.jsx(i.td,{children:"N batches + 1 merge"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Parallelism"}),e.jsx(i.td,{children:"Full"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Merge step"}),e.jsx(i.td,{children:"LLM merge"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dedupe step"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Best for"}),e.jsx(i.td,{children:"Large inputs, speed priority"})]})]})]}),`
`,e.jsx(i.h2,{id:"configuration",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"model"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for extraction"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"mergeModel"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for merging partial results"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"chunkSize"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Token budget per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"concurrency"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"All batches"}),e.jsx(i.td,{children:"Max parallel batches"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"maxImages"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Unlimited"}),e.jsx(i.td,{children:"Max images per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"outputInstructions"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Extra instructions"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"strict"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})}),e.jsx(i.td,{children:"Validate required fields on every step (disables smart validation)"})]})]})]}),`
`,e.jsx(i.h2,{id:"algorithm",children:"Algorithm"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["Split artifacts into batches (respecting ",e.jsx(i.code,{children:"chunkSize"})," and ",e.jsx(i.code,{children:"maxImages"}),")"]}),`
`,e.jsx(i.li,{children:"Extract from each batch concurrently"}),`
`,e.jsx(i.li,{children:"Validate each batch output with retry"}),`
`,e.jsxs(i.li,{children:["Send all partial results to ",e.jsx(i.code,{children:"mergeModel"})," for LLM merge"]}),`
`,e.jsx(i.li,{children:"Validate merged output"}),`
`,e.jsx(i.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowchart LR"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    A[Artifacts] --> B[Batch 1]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    A --> C[Batch 2]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    A --> D[Batch N]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    B --> E[Extract]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    C --> E"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    D --> E"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    E --> F[LLM Merge]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    F --> G[Output]"})})]})})}),`
`,e.jsx(i.h2,{id:"validation-behavior",children:"Validation behavior"}),`
`,e.jsx(i.p,{children:"Each batch extraction is validated with retry. The final merge is also validated."}),`
`,e.jsx(i.h2,{id:"merge-behavior",children:"Merge behavior"}),`
`,e.jsx(i.p,{children:"LLM merge. All partial results are sent to a merge model with a prompt asking it to produce a single coherent output. The merge model sees the full schema and all partial outputs."}),`
`,e.jsx(i.h2,{id:"token-cost-profile",children:"Token cost profile"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Medium"})," — N extraction calls + 1 merge call. Merge model can be cheaper than extraction model."]}),`
`,e.jsx(i.h2,{id:"example",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, parallel } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parallel"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    mergeModel: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    concurrency: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h2,{id:"cli",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" large.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallel"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsx(i.h2,{id:"when-to-use",children:"When to use"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Speed is the top priority"}),`
`,e.jsx(i.li,{children:"Chunks are relatively independent"}),`
`,e.jsx(i.li,{children:"Many documents to process"}),`
`,e.jsx(i.li,{children:"Can accept potential loss of cross-chunk context"}),`
`]}),`
`,e.jsx(i.h2,{id:"when-to-avoid",children:"When to avoid"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Later chunks depend on earlier chunks (use ",e.jsx(i.code,{children:"sequential"}),")"]}),`
`,e.jsxs(i.li,{children:["Extracting arrays that may have duplicates (use ",e.jsx(i.code,{children:"parallelAutoMerge"}),")"]}),`
`]}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/strategies/sequential",children:"sequential"})," — for context-dependent documents"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/strategies/parallel-auto-merge",children:"parallelAutoMerge"})," — for array extraction with deduplication"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/strategies/choosing",children:"Choosing a Strategy"})," — decision guide"]}),`
`]})]})}function c(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(t,{...n})}):t(n)}export{a as _markdown,c as default,l as frontmatter,r as structuredData,h as toc};
