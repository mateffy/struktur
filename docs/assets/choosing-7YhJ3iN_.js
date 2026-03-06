import{j as e}from"./main-BVs-cBtG.js";let a=`

Quick decision flowchart [#quick-decision-flowchart]

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Input fits in context?}
    B -->|Yes| C[Use simple]
    B -->|No| D{Extracting arrays?}
    D -->|Yes| E{Cross-chunk context matters?}
    D -->|No| F{Cross-chunk context matters?}
    E -->|Yes| G[sequentialAutoMerge or doublePassAutoMerge]
    E -->|No| H[parallelAutoMerge]
    F -->|Yes| I[sequential or doublePass]
    F -->|No| J[parallel]
\`\`\`

Strategy comparison [#strategy-comparison]

| Strategy              | Speed   | Context | Arrays        | Token Cost |
| --------------------- | ------- | ------- | ------------- | ---------- |
| \`simple\`              | Fastest | Full    | —             | Lowest     |
| \`parallel\`            | Fast    | None    | LLM merge     | Medium     |
| \`sequential\`          | Medium  | Full    | Context       | Medium     |
| \`parallelAutoMerge\`   | Fast    | None    | Auto + dedupe | Medium     |
| \`sequentialAutoMerge\` | Medium  | Full    | Auto + dedupe | Medium     |
| \`doublePass\`          | Slow    | Full    | LLM merge     | High       |
| \`doublePassAutoMerge\` | Slow    | Full    | Auto + dedupe | High       |

Worked examples [#worked-examples]

50-page PDF invoice with 200 line items [#50-page-pdf-invoice-with-200-line-items]

**Use:** \`parallelAutoMerge\` or \`sequentialAutoMerge\`

\`\`\`bash
struktur --input invoice.pdf --schema invoice.json --strategy parallelAutoMerge --model openai/gpt-4o-mini
\`\`\`

Choose \`sequentialAutoMerge\` if line items span page boundaries and reference earlier context.

3-page real estate exposé with floor plan images [#3-page-real-estate-exposé-with-floor-plan-images]

**Use:** \`sequential\` or \`sequentialAutoMerge\`

\`\`\`bash
struktur --input expose.pdf --schema property.json --strategy sequentialAutoMerge --model openai/gpt-4o-mini
\`\`\`

Images are handled by vision models without OCR.

2-page contract — parties, dates, value [#2-page-contract--parties-dates-value]

**Use:** \`simple\` or \`sequential\`

\`\`\`bash
struktur --input contract.pdf --schema contract.json --model openai/gpt-4o-mini
\`\`\`

\`simple\` if it fits in context; \`sequential\` if you need incremental building.

500 product datasheets [#500-product-datasheets]

**Use:** \`parallelAutoMerge\` with concurrency

\`\`\`bash
for f in datasheets/*.pdf; do
  markitdown "$f" | struktur --stdin --schema product.json --strategy parallelAutoMerge --model openai/gpt-4o-mini
done | jq -s '.'
\`\`\`

When speed matters [#when-speed-matters]

Use \`parallel\` or \`parallelAutoMerge\`. Accept that cross-chunk context is limited.

When quality matters [#when-quality-matters]

Use \`doublePass\` or \`doublePassAutoMerge\`. Accept higher token cost.

When arrays matter [#when-arrays-matter]

Use auto-merge variants (\`parallelAutoMerge\`, \`sequentialAutoMerge\`, \`doublePassAutoMerge\`). They handle deduplication automatically.

See also [#see-also]

* [Strategies](/docs/explanation/strategies) — all strategies
* [simple](/docs/explanation/strategies/simple) — single-shot extraction
* [parallel](/docs/explanation/strategies/parallel) — concurrent processing
* [sequential](/docs/explanation/strategies/sequential) — ordered processing
`,r={title:"Choosing a Strategy",description:"Decision guide for selecting the right extraction strategy."},l={contents:[{heading:"strategy-comparison",content:"Strategy"},{heading:"strategy-comparison",content:"Speed"},{heading:"strategy-comparison",content:"Context"},{heading:"strategy-comparison",content:"Arrays"},{heading:"strategy-comparison",content:"Token Cost"},{heading:"strategy-comparison",content:"`simple`"},{heading:"strategy-comparison",content:"Fastest"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"—"},{heading:"strategy-comparison",content:"Lowest"},{heading:"strategy-comparison",content:"`parallel`"},{heading:"strategy-comparison",content:"Fast"},{heading:"strategy-comparison",content:"None"},{heading:"strategy-comparison",content:"LLM merge"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"`sequential`"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"Context"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"`parallelAutoMerge`"},{heading:"strategy-comparison",content:"Fast"},{heading:"strategy-comparison",content:"None"},{heading:"strategy-comparison",content:"Auto + dedupe"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"`sequentialAutoMerge`"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"Auto + dedupe"},{heading:"strategy-comparison",content:"Medium"},{heading:"strategy-comparison",content:"`doublePass`"},{heading:"strategy-comparison",content:"Slow"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"LLM merge"},{heading:"strategy-comparison",content:"High"},{heading:"strategy-comparison",content:"`doublePassAutoMerge`"},{heading:"strategy-comparison",content:"Slow"},{heading:"strategy-comparison",content:"Full"},{heading:"strategy-comparison",content:"Auto + dedupe"},{heading:"strategy-comparison",content:"High"},{heading:"50-page-pdf-invoice-with-200-line-items",content:"**Use:** `parallelAutoMerge` or `sequentialAutoMerge`"},{heading:"50-page-pdf-invoice-with-200-line-items",content:"Choose `sequentialAutoMerge` if line items span page boundaries and reference earlier context."},{heading:"3-page-real-estate-exposé-with-floor-plan-images",content:"**Use:** `sequential` or `sequentialAutoMerge`"},{heading:"3-page-real-estate-exposé-with-floor-plan-images",content:"Images are handled by vision models without OCR."},{heading:"2-page-contract--parties-dates-value",content:"**Use:** `simple` or `sequential`"},{heading:"2-page-contract--parties-dates-value",content:"`simple` if it fits in context; `sequential` if you need incremental building."},{heading:"500-product-datasheets",content:"**Use:** `parallelAutoMerge` with concurrency"},{heading:"when-speed-matters",content:"Use `parallel` or `parallelAutoMerge`. Accept that cross-chunk context is limited."},{heading:"when-quality-matters",content:"Use `doublePass` or `doublePassAutoMerge`. Accept higher token cost."},{heading:"when-arrays-matter",content:"Use auto-merge variants (`parallelAutoMerge`, `sequentialAutoMerge`, `doublePassAutoMerge`). They handle deduplication automatically."},{heading:"see-also",content:"Strategies — all strategies"},{heading:"see-also",content:"simple — single-shot extraction"},{heading:"see-also",content:"parallel — concurrent processing"},{heading:"see-also",content:"sequential — ordered processing"}],headings:[{id:"quick-decision-flowchart",content:"Quick decision flowchart"},{id:"strategy-comparison",content:"Strategy comparison"},{id:"worked-examples",content:"Worked examples"},{id:"50-page-pdf-invoice-with-200-line-items",content:"50-page PDF invoice with 200 line items"},{id:"3-page-real-estate-exposé-with-floor-plan-images",content:"3-page real estate exposé with floor plan images"},{id:"2-page-contract--parties-dates-value",content:"2-page contract — parties, dates, value"},{id:"500-product-datasheets",content:"500 product datasheets"},{id:"when-speed-matters",content:"When speed matters"},{id:"when-quality-matters",content:"When quality matters"},{id:"when-arrays-matter",content:"When arrays matter"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#quick-decision-flowchart",title:e.jsx(e.Fragment,{children:"Quick decision flowchart"})},{depth:2,url:"#strategy-comparison",title:e.jsx(e.Fragment,{children:"Strategy comparison"})},{depth:2,url:"#worked-examples",title:e.jsx(e.Fragment,{children:"Worked examples"})},{depth:3,url:"#50-page-pdf-invoice-with-200-line-items",title:e.jsx(e.Fragment,{children:"50-page PDF invoice with 200 line items"})},{depth:3,url:"#3-page-real-estate-exposé-with-floor-plan-images",title:e.jsx(e.Fragment,{children:"3-page real estate exposé with floor plan images"})},{depth:3,url:"#2-page-contract--parties-dates-value",title:e.jsx(e.Fragment,{children:"2-page contract — parties, dates, value"})},{depth:3,url:"#500-product-datasheets",title:e.jsx(e.Fragment,{children:"500 product datasheets"})},{depth:2,url:"#when-speed-matters",title:e.jsx(e.Fragment,{children:"When speed matters"})},{depth:2,url:"#when-quality-matters",title:e.jsx(e.Fragment,{children:"When quality matters"})},{depth:2,url:"#when-arrays-matter",title:e.jsx(e.Fragment,{children:"When arrays matter"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function t(i){const s={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"quick-decision-flowchart",children:"Quick decision flowchart"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowchart TD"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    A[Start] --> B{Input fits in context?}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    B -->|Yes| C[Use simple]"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    B -->|No| D{Extracting arrays?}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    D -->|Yes| E{Cross-chunk context matters?}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    D -->|No| F{Cross-chunk context matters?}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    E -->|Yes| G[sequentialAutoMerge or doublePassAutoMerge]"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    E -->|No| H[parallelAutoMerge]"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    F -->|Yes| I[sequential or doublePass]"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    F -->|No| J[parallel]"})})]})})}),`
`,e.jsx(s.h2,{id:"strategy-comparison",children:"Strategy comparison"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Strategy"}),e.jsx(s.th,{children:"Speed"}),e.jsx(s.th,{children:"Context"}),e.jsx(s.th,{children:"Arrays"}),e.jsx(s.th,{children:"Token Cost"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"simple"})}),e.jsx(s.td,{children:"Fastest"}),e.jsx(s.td,{children:"Full"}),e.jsx(s.td,{children:"—"}),e.jsx(s.td,{children:"Lowest"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"parallel"})}),e.jsx(s.td,{children:"Fast"}),e.jsx(s.td,{children:"None"}),e.jsx(s.td,{children:"LLM merge"}),e.jsx(s.td,{children:"Medium"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"sequential"})}),e.jsx(s.td,{children:"Medium"}),e.jsx(s.td,{children:"Full"}),e.jsx(s.td,{children:"Context"}),e.jsx(s.td,{children:"Medium"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"parallelAutoMerge"})}),e.jsx(s.td,{children:"Fast"}),e.jsx(s.td,{children:"None"}),e.jsx(s.td,{children:"Auto + dedupe"}),e.jsx(s.td,{children:"Medium"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"sequentialAutoMerge"})}),e.jsx(s.td,{children:"Medium"}),e.jsx(s.td,{children:"Full"}),e.jsx(s.td,{children:"Auto + dedupe"}),e.jsx(s.td,{children:"Medium"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"doublePass"})}),e.jsx(s.td,{children:"Slow"}),e.jsx(s.td,{children:"Full"}),e.jsx(s.td,{children:"LLM merge"}),e.jsx(s.td,{children:"High"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"doublePassAutoMerge"})}),e.jsx(s.td,{children:"Slow"}),e.jsx(s.td,{children:"Full"}),e.jsx(s.td,{children:"Auto + dedupe"}),e.jsx(s.td,{children:"High"})]})]})]}),`
`,e.jsx(s.h2,{id:"worked-examples",children:"Worked examples"}),`
`,e.jsx(s.h3,{id:"50-page-pdf-invoice-with-200-line-items",children:"50-page PDF invoice with 200 line items"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Use:"})," ",e.jsx(s.code,{children:"parallelAutoMerge"})," or ",e.jsx(s.code,{children:"sequentialAutoMerge"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.json"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallelAutoMerge"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsxs(s.p,{children:["Choose ",e.jsx(s.code,{children:"sequentialAutoMerge"})," if line items span page boundaries and reference earlier context."]}),`
`,e.jsx(s.h3,{id:"3-page-real-estate-exposé-with-floor-plan-images",children:"3-page real estate exposé with floor plan images"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Use:"})," ",e.jsx(s.code,{children:"sequential"})," or ",e.jsx(s.code,{children:"sequentialAutoMerge"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" expose.pdf"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" property.json"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sequentialAutoMerge"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsx(s.p,{children:"Images are handled by vision models without OCR."}),`
`,e.jsx(s.h3,{id:"2-page-contract--parties-dates-value",children:"2-page contract — parties, dates, value"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Use:"})," ",e.jsx(s.code,{children:"simple"})," or ",e.jsx(s.code,{children:"sequential"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" contract.pdf"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" contract.json"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"simple"})," if it fits in context; ",e.jsx(s.code,{children:"sequential"})," if you need incremental building."]}),`
`,e.jsx(s.h3,{id:"500-product-datasheets",children:"500 product datasheets"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Use:"})," ",e.jsx(s.code,{children:"parallelAutoMerge"})," with concurrency"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" f "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" datasheets/*.pdf"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"do"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  markitdown"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$f"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" product.json"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --strategy"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallelAutoMerge"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"done"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" jq"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -s"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '.'"})]})]})})}),`
`,e.jsx(s.h2,{id:"when-speed-matters",children:"When speed matters"}),`
`,e.jsxs(s.p,{children:["Use ",e.jsx(s.code,{children:"parallel"})," or ",e.jsx(s.code,{children:"parallelAutoMerge"}),". Accept that cross-chunk context is limited."]}),`
`,e.jsx(s.h2,{id:"when-quality-matters",children:"When quality matters"}),`
`,e.jsxs(s.p,{children:["Use ",e.jsx(s.code,{children:"doublePass"})," or ",e.jsx(s.code,{children:"doublePassAutoMerge"}),". Accept higher token cost."]}),`
`,e.jsx(s.h2,{id:"when-arrays-matter",children:"When arrays matter"}),`
`,e.jsxs(s.p,{children:["Use auto-merge variants (",e.jsx(s.code,{children:"parallelAutoMerge"}),", ",e.jsx(s.code,{children:"sequentialAutoMerge"}),", ",e.jsx(s.code,{children:"doublePassAutoMerge"}),"). They handle deduplication automatically."]}),`
`,e.jsx(s.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/docs/explanation/strategies",children:"Strategies"})," — all strategies"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/docs/explanation/strategies/simple",children:"simple"})," — single-shot extraction"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/docs/explanation/strategies/parallel",children:"parallel"})," — concurrent processing"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/docs/explanation/strategies/sequential",children:"sequential"})," — ordered processing"]}),`
`]})]})}function d(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(t,{...i})}):t(i)}export{a as _markdown,d as default,r as frontmatter,l as structuredData,h as toc};
