import{j as e}from"./main-Bqss_295.js";let a=`

\`\`\`mermaid
flowchart LR
    A[Input] --> B[Parse]
    B --> C[Artifacts]
    C --> D[Strategy]
    D --> E[Output]
    
    subgraph StrategyInternals [Strategy]
        direction TB
        D1[Chunking] --> D2[LLM Calls]
        D2 --> D3[Validation + Retry]
        D3 --> D4[Merge/Dedupe]
    end
    
    D --> StrategyInternals --> E
\`\`\`

Inputs and Artifacts [#inputs-and-artifacts]

Struktur converts input files into **Artifacts** before extraction. For plain text or stdin, this is trivial. For structured files (PDFs, Office documents), Struktur runs a parser — built-in or custom — that extracts text and images per-page.

See [Document Parsing](/docs/explanation/document-parsing) for how files are converted to artifacts.
See [Artifact Format](/docs/explanation/artifact-format) for the data structure.

The Strategy layer [#the-strategy-layer]

A strategy is the orchestration engine. It decides how to split the input, how many LLM calls to make, whether to run them concurrently or sequentially, and how to combine results.

Built-in strategies cover the common patterns. You can also write your own.

See [Strategies](/docs/explanation/strategies) for the strategy concept.

Validation inside the loop [#validation-inside-the-loop]

The validation loop is a key differentiator. Every LLM response is validated against the schema **before** the strategy considers it done. If validation fails, the errors are serialized and sent back to the model as a follow-up message.

**Smart validation**: For multi-step strategies (parallel, sequential, double-pass), Struktur uses lenient validation during intermediate steps—required field violations are allowed until the final step. This prevents false failures when data is split across chunks. Use the \`strict\` option to disable this behavior.

Most extractions converge within two attempts. This happens **inside** the strategy, not as a post-processing step.

Default: \`maxAttempts\` = 3.

See [Validation & Retries](/docs/explanation/validation) for the validation concept.

The result [#the-result]

The extraction result has three fields:

| Field   | Description                                                                       |
| ------- | --------------------------------------------------------------------------------- |
| \`data\`  | Validated output matching your schema. If \`error\` is set, may not be trustworthy. |
| \`usage\` | Aggregated token counts across all LLM calls.                                     |
| \`error\` | Set if extraction encountered a non-fatal error.                                  |

See also [#see-also]

* [Document Parsing](/docs/explanation/document-parsing) — how files are converted to artifacts
* [Artifacts](/docs/explanation/artifact-format) — the input format
* [Strategies](/docs/explanation/strategies) — orchestration patterns
* [Chunking & Token Budgets](/docs/explanation/chunking) — how large documents are split
* [Validation & Retries](/docs/explanation/validation) — the retry loop
`,r={title:"Extraction Lifecycle",description:"How data flows through Struktur from input to output."},o={contents:[{heading:"inputs-and-artifacts",content:"Struktur converts input files into **Artifacts** before extraction. For plain text or stdin, this is trivial. For structured files (PDFs, Office documents), Struktur runs a parser — built-in or custom — that extracts text and images per-page."},{heading:"inputs-and-artifacts",content:`See Document Parsing for how files are converted to artifacts.
See Artifact Format for the data structure.`},{heading:"the-strategy-layer",content:"A strategy is the orchestration engine. It decides how to split the input, how many LLM calls to make, whether to run them concurrently or sequentially, and how to combine results."},{heading:"the-strategy-layer",content:"Built-in strategies cover the common patterns. You can also write your own."},{heading:"the-strategy-layer",content:"See Strategies for the strategy concept."},{heading:"validation-inside-the-loop",content:"The validation loop is a key differentiator. Every LLM response is validated against the schema **before** the strategy considers it done. If validation fails, the errors are serialized and sent back to the model as a follow-up message."},{heading:"validation-inside-the-loop",content:"**Smart validation**: For multi-step strategies (parallel, sequential, double-pass), Struktur uses lenient validation during intermediate steps—required field violations are allowed until the final step. This prevents false failures when data is split across chunks. Use the `strict` option to disable this behavior."},{heading:"validation-inside-the-loop",content:"Most extractions converge within two attempts. This happens **inside** the strategy, not as a post-processing step."},{heading:"validation-inside-the-loop",content:"Default: `maxAttempts` = 3."},{heading:"validation-inside-the-loop",content:"See Validation & Retries for the validation concept."},{heading:"the-result",content:"The extraction result has three fields:"},{heading:"the-result",content:"Field"},{heading:"the-result",content:"Description"},{heading:"the-result",content:"`data`"},{heading:"the-result",content:"Validated output matching your schema. If `error` is set, may not be trustworthy."},{heading:"the-result",content:"`usage`"},{heading:"the-result",content:"Aggregated token counts across all LLM calls."},{heading:"the-result",content:"`error`"},{heading:"the-result",content:"Set if extraction encountered a non-fatal error."},{heading:"see-also",content:"Document Parsing — how files are converted to artifacts"},{heading:"see-also",content:"Artifacts — the input format"},{heading:"see-also",content:"Strategies — orchestration patterns"},{heading:"see-also",content:"Chunking & Token Budgets — how large documents are split"},{heading:"see-also",content:"Validation & Retries — the retry loop"}],headings:[{id:"inputs-and-artifacts",content:"Inputs and Artifacts"},{id:"the-strategy-layer",content:"The Strategy layer"},{id:"validation-inside-the-loop",content:"Validation inside the loop"},{id:"the-result",content:"The result"},{id:"see-also",content:"See also"}]};const l=[{depth:2,url:"#inputs-and-artifacts",title:e.jsx(e.Fragment,{children:"Inputs and Artifacts"})},{depth:2,url:"#the-strategy-layer",title:e.jsx(e.Fragment,{children:"The Strategy layer"})},{depth:2,url:"#validation-inside-the-loop",title:e.jsx(e.Fragment,{children:"Validation inside the loop"})},{depth:2,url:"#the-result",title:e.jsx(e.Fragment,{children:"The result"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function s(n){const t={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowchart LR"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    A[Input] --> B[Parse]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    B --> C[Artifacts]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    C --> D[Strategy]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    D --> E[Output]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    "})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    subgraph StrategyInternals [Strategy]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        direction TB"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        D1[Chunking] --> D2[LLM Calls]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        D2 --> D3[Validation + Retry]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        D3 --> D4[Merge/Dedupe]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    end"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    "})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    D --> StrategyInternals --> E"})})]})})}),`
`,e.jsx(t.h2,{id:"inputs-and-artifacts",children:"Inputs and Artifacts"}),`
`,e.jsxs(t.p,{children:["Struktur converts input files into ",e.jsx(t.strong,{children:"Artifacts"})," before extraction. For plain text or stdin, this is trivial. For structured files (PDFs, Office documents), Struktur runs a parser — built-in or custom — that extracts text and images per-page."]}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/explanation/document-parsing",children:"Document Parsing"}),` for how files are converted to artifacts.
See `,e.jsx(t.a,{href:"/docs/explanation/artifact-format",children:"Artifact Format"})," for the data structure."]}),`
`,e.jsx(t.h2,{id:"the-strategy-layer",children:"The Strategy layer"}),`
`,e.jsx(t.p,{children:"A strategy is the orchestration engine. It decides how to split the input, how many LLM calls to make, whether to run them concurrently or sequentially, and how to combine results."}),`
`,e.jsx(t.p,{children:"Built-in strategies cover the common patterns. You can also write your own."}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/explanation/strategies",children:"Strategies"})," for the strategy concept."]}),`
`,e.jsx(t.h2,{id:"validation-inside-the-loop",children:"Validation inside the loop"}),`
`,e.jsxs(t.p,{children:["The validation loop is a key differentiator. Every LLM response is validated against the schema ",e.jsx(t.strong,{children:"before"})," the strategy considers it done. If validation fails, the errors are serialized and sent back to the model as a follow-up message."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Smart validation"}),": For multi-step strategies (parallel, sequential, double-pass), Struktur uses lenient validation during intermediate steps—required field violations are allowed until the final step. This prevents false failures when data is split across chunks. Use the ",e.jsx(t.code,{children:"strict"})," option to disable this behavior."]}),`
`,e.jsxs(t.p,{children:["Most extractions converge within two attempts. This happens ",e.jsx(t.strong,{children:"inside"})," the strategy, not as a post-processing step."]}),`
`,e.jsxs(t.p,{children:["Default: ",e.jsx(t.code,{children:"maxAttempts"})," = 3."]}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/explanation/validation",children:"Validation & Retries"})," for the validation concept."]}),`
`,e.jsx(t.h2,{id:"the-result",children:"The result"}),`
`,e.jsx(t.p,{children:"The extraction result has three fields:"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Field"}),e.jsx(t.th,{children:"Description"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"data"})}),e.jsxs(t.td,{children:["Validated output matching your schema. If ",e.jsx(t.code,{children:"error"})," is set, may not be trustworthy."]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"usage"})}),e.jsx(t.td,{children:"Aggregated token counts across all LLM calls."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"error"})}),e.jsx(t.td,{children:"Set if extraction encountered a non-fatal error."})]})]})]}),`
`,e.jsx(t.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/document-parsing",children:"Document Parsing"})," — how files are converted to artifacts"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/artifact-format",children:"Artifacts"})," — the input format"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/strategies",children:"Strategies"})," — orchestration patterns"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/chunking",children:"Chunking & Token Budgets"})," — how large documents are split"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/validation",children:"Validation & Retries"})," — the retry loop"]}),`
`]})]})}function h(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(s,{...n})}):s(n)}export{a as _markdown,h as default,r as frontmatter,o as structuredData,l as toc};
