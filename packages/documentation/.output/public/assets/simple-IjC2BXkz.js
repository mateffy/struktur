import{j as e}from"./main-BVs-cBtG.js";let a=`

At a glance [#at-a-glance]

| Property    | Value                      |
| ----------- | -------------------------- |
| Name        | \`"simple"\`                 |
| LLM calls   | 1                          |
| Parallelism | None                       |
| Merge step  | None                       |
| Dedupe step | None                       |
| Best for    | Small, single-chunk inputs |

Configuration [#configuration]

| Field                | Required | Default | Description                                                   |
| -------------------- | -------- | ------- | ------------------------------------------------------------- |
| \`model\`              | Yes      | -       | Model instance from \`@ai-sdk/*\`                               |
| \`outputInstructions\` | No       | -       | Extra instructions for the model                              |
| \`strict\`             | No       | \`false\` | Always \`true\` for simple (single-shot, no intermediate steps) |

Algorithm [#algorithm]

1. Build extraction prompt from artifacts + schema
2. Send to LLM
3. Validate output with Ajv
4. Retry on validation failure (up to 3 attempts)
5. Return validated output

Validation behavior [#validation-behavior]

Each LLM call is validated with retry. If the LLM fails to produce valid output after 3 attempts, the strategy throws.

Merge behavior [#merge-behavior]

None. Single-shot.

Token cost profile [#token-cost-profile]

**Low** — 1 LLM call per extraction.

Example [#example]

\`\`\`js
import { extract, simple } from "@mateffy/struktur";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: simple({
    model: openai("gpt-4o-mini"),
  }),
});
\`\`\`

CLI [#cli]

\`\`\`bash
struktur --input document.txt --schema schema.json --model openai/gpt-4o-mini
# --strategy simple is the default
\`\`\`

When to use [#when-to-use]

* Document fits within the model's context window (\\~10k tokens)
* Simple schema without nested arrays
* Testing or prototyping
* Speed is the priority

When to avoid [#when-to-avoid]

* Large documents exceeding context window
* Complex schemas with many fields

See also [#see-also]

* [parallel](/docs/explanation/strategies/parallel) — for large documents
* [sequential](/docs/explanation/strategies/sequential) — for context-dependent documents
* [Choosing a Strategy](/docs/explanation/strategies/choosing) — decision guide
`,l={title:"simple",description:"Single-shot extraction for small inputs."},r={contents:[{heading:"at-a-glance",content:"Property"},{heading:"at-a-glance",content:"Value"},{heading:"at-a-glance",content:"Name"},{heading:"at-a-glance",content:'`"simple"`'},{heading:"at-a-glance",content:"LLM calls"},{heading:"at-a-glance",content:"1"},{heading:"at-a-glance",content:"Parallelism"},{heading:"at-a-glance",content:"None"},{heading:"at-a-glance",content:"Merge step"},{heading:"at-a-glance",content:"None"},{heading:"at-a-glance",content:"Dedupe step"},{heading:"at-a-glance",content:"None"},{heading:"at-a-glance",content:"Best for"},{heading:"at-a-glance",content:"Small, single-chunk inputs"},{heading:"configuration",content:"Field"},{heading:"configuration",content:"Required"},{heading:"configuration",content:"Default"},{heading:"configuration",content:"Description"},{heading:"configuration",content:"`model`"},{heading:"configuration",content:"Yes"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Model instance from `@ai-sdk/*`"},{heading:"configuration",content:"`outputInstructions`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"-"},{heading:"configuration",content:"Extra instructions for the model"},{heading:"configuration",content:"`strict`"},{heading:"configuration",content:"No"},{heading:"configuration",content:"`false`"},{heading:"configuration",content:"Always `true` for simple (single-shot, no intermediate steps)"},{heading:"algorithm",content:"Build extraction prompt from artifacts + schema"},{heading:"algorithm",content:"Send to LLM"},{heading:"algorithm",content:"Validate output with Ajv"},{heading:"algorithm",content:"Retry on validation failure (up to 3 attempts)"},{heading:"algorithm",content:"Return validated output"},{heading:"validation-behavior",content:"Each LLM call is validated with retry. If the LLM fails to produce valid output after 3 attempts, the strategy throws."},{heading:"merge-behavior",content:"None. Single-shot."},{heading:"token-cost-profile",content:"**Low** — 1 LLM call per extraction."},{heading:"when-to-use",content:"Document fits within the model's context window (\\~10k tokens)"},{heading:"when-to-use",content:"Simple schema without nested arrays"},{heading:"when-to-use",content:"Testing or prototyping"},{heading:"when-to-use",content:"Speed is the priority"},{heading:"when-to-avoid",content:"Large documents exceeding context window"},{heading:"when-to-avoid",content:"Complex schemas with many fields"},{heading:"see-also",content:"parallel — for large documents"},{heading:"see-also",content:"sequential — for context-dependent documents"},{heading:"see-also",content:"Choosing a Strategy — decision guide"}],headings:[{id:"at-a-glance",content:"At a glance"},{id:"configuration",content:"Configuration"},{id:"algorithm",content:"Algorithm"},{id:"validation-behavior",content:"Validation behavior"},{id:"merge-behavior",content:"Merge behavior"},{id:"token-cost-profile",content:"Token cost profile"},{id:"example",content:"Example"},{id:"cli",content:"CLI"},{id:"when-to-use",content:"When to use"},{id:"when-to-avoid",content:"When to avoid"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#at-a-glance",title:e.jsx(e.Fragment,{children:"At a glance"})},{depth:2,url:"#configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:2,url:"#algorithm",title:e.jsx(e.Fragment,{children:"Algorithm"})},{depth:2,url:"#validation-behavior",title:e.jsx(e.Fragment,{children:"Validation behavior"})},{depth:2,url:"#merge-behavior",title:e.jsx(e.Fragment,{children:"Merge behavior"})},{depth:2,url:"#token-cost-profile",title:e.jsx(e.Fragment,{children:"Token cost profile"})},{depth:2,url:"#example",title:e.jsx(e.Fragment,{children:"Example"})},{depth:2,url:"#cli",title:e.jsx(e.Fragment,{children:"CLI"})},{depth:2,url:"#when-to-use",title:e.jsx(e.Fragment,{children:"When to use"})},{depth:2,url:"#when-to-avoid",title:e.jsx(e.Fragment,{children:"When to avoid"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function t(i){const n={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"at-a-glance",children:"At a glance"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Value"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Name"}),e.jsx(n.td,{children:e.jsx(n.code,{children:'"simple"'})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"LLM calls"}),e.jsx(n.td,{children:"1"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Parallelism"}),e.jsx(n.td,{children:"None"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Merge step"}),e.jsx(n.td,{children:"None"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Dedupe step"}),e.jsx(n.td,{children:"None"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Best for"}),e.jsx(n.td,{children:"Small, single-chunk inputs"})]})]})]}),`
`,e.jsx(n.h2,{id:"configuration",children:"Configuration"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Field"}),e.jsx(n.th,{children:"Required"}),e.jsx(n.th,{children:"Default"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"model"})}),e.jsx(n.td,{children:"Yes"}),e.jsx(n.td,{children:"-"}),e.jsxs(n.td,{children:["Model instance from ",e.jsx(n.code,{children:"@ai-sdk/*"})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"outputInstructions"})}),e.jsx(n.td,{children:"No"}),e.jsx(n.td,{children:"-"}),e.jsx(n.td,{children:"Extra instructions for the model"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"strict"})}),e.jsx(n.td,{children:"No"}),e.jsx(n.td,{children:e.jsx(n.code,{children:"false"})}),e.jsxs(n.td,{children:["Always ",e.jsx(n.code,{children:"true"})," for simple (single-shot, no intermediate steps)"]})]})]})]}),`
`,e.jsx(n.h2,{id:"algorithm",children:"Algorithm"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Build extraction prompt from artifacts + schema"}),`
`,e.jsx(n.li,{children:"Send to LLM"}),`
`,e.jsx(n.li,{children:"Validate output with Ajv"}),`
`,e.jsx(n.li,{children:"Retry on validation failure (up to 3 attempts)"}),`
`,e.jsx(n.li,{children:"Return validated output"}),`
`]}),`
`,e.jsx(n.h2,{id:"validation-behavior",children:"Validation behavior"}),`
`,e.jsx(n.p,{children:"Each LLM call is validated with retry. If the LLM fails to produce valid output after 3 attempts, the strategy throws."}),`
`,e.jsx(n.h2,{id:"merge-behavior",children:"Merge behavior"}),`
`,e.jsx(n.p,{children:"None. Single-shot."}),`
`,e.jsx(n.h2,{id:"token-cost-profile",children:"Token cost profile"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Low"})," — 1 LLM call per extraction."]}),`
`,e.jsx(n.h2,{id:"example",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, simple } "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"simple"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(n.h2,{id:"cli",children:"CLI"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" document.txt"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# --strategy simple is the default"})})]})})}),`
`,e.jsx(n.h2,{id:"when-to-use",children:"When to use"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Document fits within the model's context window (~10k tokens)"}),`
`,e.jsx(n.li,{children:"Simple schema without nested arrays"}),`
`,e.jsx(n.li,{children:"Testing or prototyping"}),`
`,e.jsx(n.li,{children:"Speed is the priority"}),`
`]}),`
`,e.jsx(n.h2,{id:"when-to-avoid",children:"When to avoid"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Large documents exceeding context window"}),`
`,e.jsx(n.li,{children:"Complex schemas with many fields"}),`
`]}),`
`,e.jsx(n.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/explanation/strategies/parallel",children:"parallel"})," — for large documents"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/explanation/strategies/sequential",children:"sequential"})," — for context-dependent documents"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/explanation/strategies/choosing",children:"Choosing a Strategy"})," — decision guide"]}),`
`]})]})}function o(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{a as _markdown,o as default,l as frontmatter,r as structuredData,h as toc};
