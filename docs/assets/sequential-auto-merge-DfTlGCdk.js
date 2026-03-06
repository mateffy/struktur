import{j as e}from"./main-lZB4Rnhx.js";let a=`

At a glance [#at-a-glance]

| Property    | Value                                     |
| ----------- | ----------------------------------------- |
| Name        | \`"sequential-auto-merge"\`                 |
| LLM calls   | N batches + 1 dedupe                      |
| Parallelism | None                                      |
| Merge step  | Schema-aware auto-merge                   |
| Dedupe step | CRC32 hash + LLM semantic                 |
| Best for    | Ordered array extraction, context matters |

Configuration [#configuration]

| Field                | Required | Default         | Description                                                        |
| -------------------- | -------- | --------------- | ------------------------------------------------------------------ |
| \`model\`              | Yes      | -               | Model for extraction                                               |
| \`chunkSize\`          | Yes      | -               | Token budget per batch                                             |
| \`maxImages\`          | No       | Unlimited       | Max images per batch                                               |
| \`outputInstructions\` | No       | -               | Extra instructions                                                 |
| \`dedupeModel\`        | No       | Same as \`model\` | Model for semantic dedupe                                          |
| \`strict\`             | No       | \`false\`         | Validate required fields on every step (disables smart validation) |

Algorithm [#algorithm]

1. Split artifacts into batches
2. For each batch in order:
   * Extract from batch
   * Validate with retry
   * **Schema-aware merge** with previous results
3. **Hash dedupe:** CRC32 to remove exact duplicates
4. **Semantic dedupe:** LLM identifies semantically equivalent entries
5. Return final result

Validation behavior [#validation-behavior]

Each batch extraction is validated with retry.

Merge behavior [#merge-behavior]

Schema-aware auto-merge after each batch:

* **Arrays:** concatenated
* **Objects:** shallow-merged
* **Scalars:** prefer newer non-empty values

No LLM merge call.

Deduplication [#deduplication]

Two-stage:

1. **CRC32 hash:** Exact duplicates
2. **LLM semantic:** Near-duplicates

Token cost profile [#token-cost-profile]

**Medium** — N extraction calls + 1 dedupe call. Each call builds on previous results.

Example [#example]

\`\`\`js
import { extract, sequentialAutoMerge } from "@mateffy/struktur";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: sequentialAutoMerge({
    model: openai("gpt-4o-mini"),
    dedupeModel: openai("gpt-4o-mini"),
    chunkSize: 10000,
  }),
});
\`\`\`

CLI [#cli]

\`\`\`bash
struktur --input invoice.pdf --schema schema.json --strategy sequentialAutoMerge --model openai/gpt-4o-mini
\`\`\`

When to use [#when-to-use]

* Ordered list extraction with cross-chunk dependencies
* Later chunks need context from earlier chunks
* Arrays may have duplicates across pages
* Context preservation matters

Best for: multi-page invoices with line items that span pages, real estate exposés with units referenced across pages.

When to avoid [#when-to-avoid]

* Speed is critical (use \`parallelAutoMerge\`)
* Schema is primarily scalars (use \`sequential\`)

See also [#see-also]

* [parallelAutoMerge](/docs/explanation/strategies/parallel-auto-merge) — for speed priority
* [sequential](/docs/explanation/strategies/sequential) — for scalar schemas
* [Choosing a Strategy](/docs/explanation/strategies/choosing) — decision guide
`,r={title:"sequentialAutoMerge",description:"Sequential extraction with schema-aware merge and deduplication."},l={contents:[{heading:"at-a-glance",content:"Property"},{heading:"at-a-glance",content:"Value"},{heading:"at-a-glance",content:"Name"},{heading:"at-a-glance",content:'`"sequential-auto-merge"`'},{heading:"at-a-glance",content:"LLM calls"},{heading:"at-a-glance",content:"N batches + 1 dedupe"},{heading:"at-a-glance",content:"Parallelism"},{heading:"at-a-glance",content:"None"},{heading:"at-a-glance",content:"Merge step"},{heading:"at-a-glance",content:"Schema-aware auto-merge"},{heading:"at-a-glance",content:"Dedupe step"},{heading:"at-a-glance",content:"CRC32 hash + LLM semantic"},{heading:"at-a-glance",content:"Best for"},{heading:"at-a-glance",content:"Ordered array extraction, context matters"},{heading:"configuration",content:"Field"},{heading:"configuration",content:"Required"},{heading:"configuration",content:"Default"},{heading:"configuration",content:"Description"},{heading:"configuration",content:"`model`"},{heading:"configuration",content:"Yes"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Model for extraction"},{heading:"configuration",content:"`chunkSize`"},{heading:"configuration",content:"Yes"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Token budget per batch"},{heading:"configuration",content:"`maxImages`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"Unlimited"},{heading:"configuration",content:"Max images per batch"},{heading:"configuration",content:"`outputInstructions`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Extra instructions"},{heading:"configuration",content:"`dedupeModel`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"Same as `model`"},{heading:"configuration",content:"Model for semantic dedupe"},{heading:"configuration",content:"`strict`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"`false`"},{heading:"configuration",content:"Validate required fields on every step (disables smart validation)"},{heading:"algorithm",content:"Split artifacts into batches"},{heading:"algorithm",content:"For each batch in order:"},{heading:"algorithm",content:"Extract from batch"},{heading:"algorithm",content:"Validate with retry"},{heading:"algorithm",content:"**Schema-aware merge** with previous results"},{heading:"algorithm",content:"**Hash dedupe:** CRC32 to remove exact duplicates"},{heading:"algorithm",content:"**Semantic dedupe:** LLM identifies semantically equivalent entries"},{heading:"algorithm",content:"Return final result"},{heading:"validation-behavior",content:"Each batch extraction is validated with retry."},{heading:"merge-behavior",content:"Schema-aware auto-merge after each batch:"},{heading:"merge-behavior",content:"**Arrays:** concatenated"},{heading:"merge-behavior",content:"**Objects:** shallow-merged"},{heading:"merge-behavior",content:"**Scalars:** prefer newer non-empty values"},{heading:"merge-behavior",content:"No LLM merge call."},{heading:"deduplication",content:"Two-stage:"},{heading:"deduplication",content:"**CRC32 hash:** Exact duplicates"},{heading:"deduplication",content:"**LLM semantic:** Near-duplicates"},{heading:"token-cost-profile",content:"**Medium** — N extraction calls + 1 dedupe call. Each call builds on previous results."},{heading:"when-to-use",content:"Ordered list extraction with cross-chunk dependencies"},{heading:"when-to-use",content:"Later chunks need context from earlier chunks"},{heading:"when-to-use",content:"Arrays may have duplicates across pages"},{heading:"when-to-use",content:"Context preservation matters"},{heading:"when-to-use",content:"Best for: multi-page invoices with line items that span pages, real estate exposés with units referenced across pages."},{heading:"when-to-avoid",content:"Speed is critical (use `parallelAutoMerge`)"},{heading:"when-to-avoid",content:"Schema is primarily scalars (use `sequential`)"},{heading:"see-also",content:"parallelAutoMerge — for speed priority"},{heading:"see-also",content:"sequential — for scalar schemas"},{heading:"see-also",content:"Choosing a Strategy — decision guide"}],headings:[{id:"at-a-glance",content:"At a glance"},{id:"configuration",content:"Configuration"},{id:"algorithm",content:"Algorithm"},{id:"validation-behavior",content:"Validation behavior"},{id:"merge-behavior",content:"Merge behavior"},{id:"deduplication",content:"Deduplication"},{id:"token-cost-profile",content:"Token cost profile"},{id:"example",content:"Example"},{id:"cli",content:"CLI"},{id:"when-to-use",content:"When to use"},{id:"when-to-avoid",content:"When to avoid"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#at-a-glance",title:e.jsx(e.Fragment,{children:"At a glance"})},{depth:2,url:"#configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:2,url:"#algorithm",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:2,url:"#validation-behavior",title:e.jsx(e.Fragment,{children:"Validation behavior"})},{depth:2,url:"#merge-behavior",title:e.jsx(e.Fragment,{children:"Merge behavior"})},{depth:2,url:"#deduplication",title:e.jsx(e.Fragment,{children:"Deduplication"})},{depth:2,url:"#token-cost-profile",title:e.jsx(e.Fragment,{children:"Token cost profile"})},{depth:2,url:"#example",title:e.jsx(e.Fragment,{children:"Example"})},{depth:2,url:"#cli",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:2,url:"#when-to-use",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#when-to-avoid",title:e.jsx(e.Fragment,{children:"When to avoid"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function t(n){const i={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"at-a-glance",children:"At a glance"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{children:"Value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Name"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'"sequential-auto-merge"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LLM calls"}),e.jsx(i.td,{children:"N batches + 1 dedupe"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Parallelism"}),e.jsx(i.td,{children:"None"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Merge step"}),e.jsx(i.td,{children:"Schema-aware auto-merge"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Dedupe step"}),e.jsx(i.td,{children:"CRC32 hash + LLM semantic"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Best for"}),e.jsx(i.td,{children:"Ordered array extraction, context matters"})]})]})]}),`
`,e.jsx(i.h2,{id:"configuration",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"model"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Model for extraction"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"chunkSize"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Token budget per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"maxImages"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Unlimited"}),e.jsx(i.td,{children:"Max images per batch"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"outputInstructions"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"Extra instructions"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"dedupeModel"})}),e.jsx(i.td,{children:"No"}),e.jsxs(i.td,{children:["Same as ",e.jsx(i.code,{children:"model"})]}),e.jsx(i.td,{children:"Model for semantic dedupe"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"strict"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})}),e.jsx(i.td,{children:"Validate required fields on every step (disables smart validation)"})]})]})]}),`
`,e.jsx(i.h2,{id:"algorithm",children:"Algorithm"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Split artifacts into batches"}),`
`,e.jsxs(i.li,{children:["For each batch in order:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Extract from batch"}),`
`,e.jsx(i.li,{children:"Validate with retry"}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Schema-aware merge"})," with previous results"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Hash dedupe:"})," CRC32 to remove exact duplicates"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Semantic dedupe:"})," LLM identifies semantically equivalent entries"]}),`
`,e.jsx(i.li,{children:"Return final result"}),`
`]}),`
`,e.jsx(i.h2,{id:"validation-behavior",children:"Validation behavior"}),`
`,e.jsx(i.p,{children:"Each batch extraction is validated with retry."}),`
`,e.jsx(i.h2,{id:"merge-behavior",children:"Merge behavior"}),`
`,e.jsx(i.p,{children:"Schema-aware auto-merge after each batch:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Arrays:"})," concatenated"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Objects:"})," shallow-merged"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Scalars:"})," prefer newer non-empty values"]}),`
`]}),`
`,e.jsx(i.p,{children:"No LLM merge call."}),`
`,e.jsx(i.h2,{id:"deduplication",children:"Deduplication"}),`
`,e.jsx(i.p,{children:"Two-stage:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"CRC32 hash:"})," Exact duplicates"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"LLM semantic:"})," Near-duplicates"]}),`
`]}),`
`,e.jsx(i.h2,{id:"token-cost-profile",children:"Token cost profile"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Medium"})," — N extraction calls + 1 dedupe call. Each call builds on previous results."]}),`
`,e.jsx(i.h2,{id:"example",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, sequentialAutoMerge } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"sequentialAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    dedupeModel: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    chunkSize: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h2,{id:"cli",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sequentialAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsx(i.h2,{id:"when-to-use",children:"When to use"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Ordered list extraction with cross-chunk dependencies"}),`
`,e.jsx(i.li,{children:"Later chunks need context from earlier chunks"}),`
`,e.jsx(i.li,{children:"Arrays may have duplicates across pages"}),`
`,e.jsx(i.li,{children:"Context preservation matters"}),`
`]}),`
`,e.jsx(i.p,{children:"Best for: multi-page invoices with line items that span pages, real estate exposés with units referenced across pages."}),`
`,e.jsx(i.h2,{id:"when-to-avoid",children:"When to avoid"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Speed is critical (use ",e.jsx(i.code,{children:"parallelAutoMerge"}),")"]}),`
`,e.jsxs(i.li,{children:["Schema is primarily scalars (use ",e.jsx(i.code,{children:"sequential"}),")"]}),`
`]}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/strategies/parallel-auto-merge",children:"parallelAutoMerge"})," — for speed priority"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/strategies/sequential",children:"sequential"})," — for scalar schemas"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/strategies/choosing",children:"Choosing a Strategy"})," — decision guide"]}),`
`]})]})}function d(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(t,{...n})}):t(n)}export{a as _markdown,d as default,r as frontmatter,l as structuredData,h as toc};
