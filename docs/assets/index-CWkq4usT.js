import{j as t}from"./main-lZB4Rnhx.js";let r=`

Struktur is a structured data extraction engine that turns pre-parsed documents into validated, schema-typed JSON. It operates on JSON-based artifact DTOs, chunks them by token budgets, runs extraction strategies, validates results with Ajv, and merges or deduplicates outputs where needed.

Why Struktur? [#why-struktur]

* **Schema-first:** You define the shape, Struktur guarantees it.
* **Fields shorthand:** Skip the JSON Schema boilerplate with \`--fields "title, price:number, status:enum{draft|live}"\`.
* **Strategy-driven:** From single-shot to double-pass refinement.
* **Pipeline-native:** Reads stdin, writes stdout, composes with \`jq\`.

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

Quick navigation [#quick-navigation]

| Goal                               | Section                              |
| ---------------------------------- | ------------------------------------ |
| New here?                          | [Quickstart](/docs/quickstart)       |
| Need to accomplish something?      | [Examples](/docs/examples)           |
| Looking up a flag or type?         | [CLI Reference](/docs/cli)           |
| Quick schema without writing JSON? | [Fields Shorthand](/docs/cli/fields) |
| Want to understand how it works?   | [Concepts](/docs/explanation)        |
| Parse files into artifacts?        | [Parsers](/docs/explanation/parsers) |
`,a={title:"What is Struktur?",description:"Struktur is a structured data extraction engine that turns pre-parsed documents into validated JSON using LLMs."},o={contents:[{heading:void 0,content:"Struktur is a structured data extraction engine that turns pre-parsed documents into validated, schema-typed JSON. It operates on JSON-based artifact DTOs, chunks them by token budgets, runs extraction strategies, validates results with Ajv, and merges or deduplicates outputs where needed."},{heading:"why-struktur",content:"**Schema-first:** You define the shape, Struktur guarantees it."},{heading:"why-struktur",content:'**Fields shorthand:** Skip the JSON Schema boilerplate with `--fields "title, price:number, status:enum{draft|live}"`.'},{heading:"why-struktur",content:"**Strategy-driven:** From single-shot to double-pass refinement."},{heading:"why-struktur",content:"**Pipeline-native:** Reads stdin, writes stdout, composes with `jq`."},{heading:"a-10-second-demo",content:"Expected output:"},{heading:"what-struktur-is-not",content:"**It is not a general document conversion tool.** It parses files for extraction purposes, not for format conversion. It does not produce formatted output from documents."},{heading:"what-struktur-is-not",content:"**It is not a managed API.** It runs locally and calls your provider directly."},{heading:"what-struktur-is-not",content:"**It does not stream.** Input in, JSON out."},{heading:"what-struktur-is-not",content:"**It is not a general LLM orchestration framework.**"},{heading:"what-struktur-is-not",content:"For the full mental model, see The Extraction Pipeline."},{heading:"who-is-it-for",content:"**CLI users** — data engineers, analysts, shell pipeline builders — use Struktur for one-off extractions, batch processing, and CI/CD automation without writing code."},{heading:"who-is-it-for",content:"**SDK users** — TypeScript developers embedding extraction in applications — use Struktur for typed results, custom strategies, and fine-grained control over the extraction pipeline."},{heading:"quick-navigation",content:"Goal"},{heading:"quick-navigation",content:"Section"},{heading:"quick-navigation",content:"New here?"},{heading:"quick-navigation",content:"Quickstart"},{heading:"quick-navigation",content:"Need to accomplish something?"},{heading:"quick-navigation",content:"Examples"},{heading:"quick-navigation",content:"Looking up a flag or type?"},{heading:"quick-navigation",content:"CLI Reference"},{heading:"quick-navigation",content:"Quick schema without writing JSON?"},{heading:"quick-navigation",content:"Fields Shorthand"},{heading:"quick-navigation",content:"Want to understand how it works?"},{heading:"quick-navigation",content:"Concepts"},{heading:"quick-navigation",content:"Parse files into artifacts?"},{heading:"quick-navigation",content:"Parsers"}],headings:[{id:"why-struktur",content:"Why Struktur?"},{id:"a-10-second-demo",content:"A 10-second demo"},{id:"what-struktur-is-not",content:"What Struktur is NOT"},{id:"who-is-it-for",content:"Who is it for?"},{id:"quick-navigation",content:"Quick navigation"}]};const d=[{depth:2,url:"#why-struktur",title:t.jsx(t.Fragment,{children:"Why Struktur?"})},{depth:2,url:"#a-10-second-demo",title:t.jsx(t.Fragment,{children:"A 10-second demo"})},{depth:2,url:"#what-struktur-is-not",title:t.jsx(t.Fragment,{children:"What Struktur is NOT"})},{depth:2,url:"#who-is-it-for",title:t.jsx(t.Fragment,{children:"Who is it for?"})},{depth:2,url:"#quick-navigation",title:t.jsx(t.Fragment,{children:"Quick navigation"})}];function i(n){const e={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return t.jsxs(t.Fragment,{children:[t.jsx(e.p,{children:"Struktur is a structured data extraction engine that turns pre-parsed documents into validated, schema-typed JSON. It operates on JSON-based artifact DTOs, chunks them by token budgets, runs extraction strategies, validates results with Ajv, and merges or deduplicates outputs where needed."}),`
`,t.jsx(e.h2,{id:"why-struktur",children:"Why Struktur?"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Schema-first:"})," You define the shape, Struktur guarantees it."]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Fields shorthand:"})," Skip the JSON Schema boilerplate with ",t.jsx(e.code,{children:'--fields "title, price:number, status:enum{draft|live}"'}),"."]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Strategy-driven:"})," From single-shot to double-pass refinement."]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Pipeline-native:"})," Reads stdin, writes stdout, composes with ",t.jsx(e.code,{children:"jq"}),"."]}),`
`]}),`
`,t.jsx(e.h2,{id:"a-10-second-demo",children:"A 10-second demo"}),`
`,t.jsx(t.Fragment,{children:t.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:t.jsxs(e.code,{children:[t.jsxs(e.span,{className:"line",children:[t.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),t.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),t.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),t.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,t.jsxs(e.span,{className:"line",children:[t.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),t.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "number, vendor, total:number"'}),t.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,t.jsxs(e.span,{className:"line",children:[t.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),t.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,t.jsx(e.p,{children:"Expected output:"}),`
`,t.jsx(t.Fragment,{children:t.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:t.jsxs(e.code,{children:[t.jsx(e.span,{className:"line",children:t.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,t.jsxs(e.span,{className:"line",children:[t.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "number"'}),t.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),t.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1042"'}),t.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,t.jsxs(e.span,{className:"line",children:[t.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "vendor"'}),t.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),t.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Acme Corp"'}),t.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,t.jsxs(e.span,{className:"line",children:[t.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "total"'}),t.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),t.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2400"})]}),`
`,t.jsx(e.span,{className:"line",children:t.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,t.jsx(e.h2,{id:"what-struktur-is-not",children:"What Struktur is NOT"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"It is not a general document conversion tool."})," It parses files for extraction purposes, not for format conversion. It does not produce formatted output from documents."]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"It is not a managed API."})," It runs locally and calls your provider directly."]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"It does not stream."})," Input in, JSON out."]}),`
`,t.jsx(e.li,{children:t.jsx(e.strong,{children:"It is not a general LLM orchestration framework."})}),`
`]}),`
`,t.jsxs(e.p,{children:["For the full mental model, see ",t.jsx(e.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"}),"."]}),`
`,t.jsx(e.h2,{id:"who-is-it-for",children:"Who is it for?"}),`
`,t.jsxs(e.p,{children:[t.jsx(e.strong,{children:"CLI users"})," — data engineers, analysts, shell pipeline builders — use Struktur for one-off extractions, batch processing, and CI/CD automation without writing code."]}),`
`,t.jsxs(e.p,{children:[t.jsx(e.strong,{children:"SDK users"})," — TypeScript developers embedding extraction in applications — use Struktur for typed results, custom strategies, and fine-grained control over the extraction pipeline."]}),`
`,t.jsx(e.h2,{id:"quick-navigation",children:"Quick navigation"}),`
`,t.jsxs(e.table,{children:[t.jsx(e.thead,{children:t.jsxs(e.tr,{children:[t.jsx(e.th,{children:"Goal"}),t.jsx(e.th,{children:"Section"})]})}),t.jsxs(e.tbody,{children:[t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"New here?"}),t.jsx(e.td,{children:t.jsx(e.a,{href:"/docs/quickstart",children:"Quickstart"})})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"Need to accomplish something?"}),t.jsx(e.td,{children:t.jsx(e.a,{href:"/docs/examples",children:"Examples"})})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"Looking up a flag or type?"}),t.jsx(e.td,{children:t.jsx(e.a,{href:"/docs/cli",children:"CLI Reference"})})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"Quick schema without writing JSON?"}),t.jsx(e.td,{children:t.jsx(e.a,{href:"/docs/cli/fields",children:"Fields Shorthand"})})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"Want to understand how it works?"}),t.jsx(e.td,{children:t.jsx(e.a,{href:"/docs/explanation",children:"Concepts"})})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"Parse files into artifacts?"}),t.jsx(e.td,{children:t.jsx(e.a,{href:"/docs/explanation/parsers",children:"Parsers"})})]})]})]})]})}function h(n={}){const{wrapper:e}=n.components||{};return e?t.jsx(e,{...n,children:t.jsx(i,{...n})}):i(n)}export{r as _markdown,h as default,a as frontmatter,o as structuredData,d as toc};
