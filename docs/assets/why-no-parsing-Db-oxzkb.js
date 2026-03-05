import{j as e}from"./main-CY4pAMb7.js";let r=`

Parsing is hard and format-specific [#parsing-is-hard-and-format-specific]

PDF parsing, HTML extraction, Excel reading, email decoding — each format has edge cases, vendor quirks, and library ecosystems. Bundling any of them into Struktur would:

* Add dependencies you may not need
* Force a specific parser even when you have a better one
* Conflate two distinct problems (format parsing + structured extraction)

Best-of-breed parsers [#best-of-breed-parsers]

Use the right tool for your format:

| Format                         | Recommended tools                                  |
| ------------------------------ | -------------------------------------------------- |
| **PDF**                        | \`markitdown\` (Microsoft), \`pdftotext\`, \`pdf-parse\` |
| **HTML/web**                   | \`markitdown\`, \`readability-js\`, \`cheerio\`          |
| **Office docs** (.docx, .xlsx) | \`markitdown\`, \`xlsx\`, \`mammoth\`                    |
| **Images (OCR)**               | Tesseract, Google Vision, AWS Textract             |

:::note
Struktur *can* receive base64-encoded images directly in artifacts — OCR is not always needed if the vision model is good enough.
:::

The integration pattern [#the-integration-pattern]

The canonical two-command pipeline:

\`\`\`bash
markitdown document.pdf | struktur --stdin --schema schema.json --model openai/gpt-4o-mini
\`\`\`

This is the idiomatic usage. You control parsing; Struktur controls extraction.

See also [#see-also]

* [The Artifact Format](/docs/explanation/preprocessing/artifact-format) — the input contract
* [Built-in Input Types](/docs/explanation/preprocessing/built-in-inputs) — how to get data into Struktur
* [Writing a Custom Provider](/docs/explanation/preprocessing/custom-provider) — extending MIME type support
`,a={title:"Why Struktur Does Not Parse Files",description:"The design decision behind Struktur's focus on extraction, not parsing."},o={contents:[{heading:"parsing-is-hard-and-format-specific",content:"PDF parsing, HTML extraction, Excel reading, email decoding — each format has edge cases, vendor quirks, and library ecosystems. Bundling any of them into Struktur would:"},{heading:"parsing-is-hard-and-format-specific",content:"Add dependencies you may not need"},{heading:"parsing-is-hard-and-format-specific",content:"Force a specific parser even when you have a better one"},{heading:"parsing-is-hard-and-format-specific",content:"Conflate two distinct problems (format parsing + structured extraction)"},{heading:"best-of-breed-parsers",content:"Use the right tool for your format:"},{heading:"best-of-breed-parsers",content:"Format"},{heading:"best-of-breed-parsers",content:"Recommended tools"},{heading:"best-of-breed-parsers",content:"**PDF**"},{heading:"best-of-breed-parsers",content:"`markitdown` (Microsoft), `pdftotext`, `pdf-parse`"},{heading:"best-of-breed-parsers",content:"**HTML/web**"},{heading:"best-of-breed-parsers",content:"`markitdown`, `readability-js`, `cheerio`"},{heading:"best-of-breed-parsers",content:"**Office docs** (.docx, .xlsx)"},{heading:"best-of-breed-parsers",content:"`markitdown`, `xlsx`, `mammoth`"},{heading:"best-of-breed-parsers",content:"**Images (OCR)**"},{heading:"best-of-breed-parsers",content:"Tesseract, Google Vision, AWS Textract"},{heading:"best-of-breed-parsers",content:`:::note
Struktur *can* receive base64-encoded images directly in artifacts — OCR is not always needed if the vision model is good enough.
:::`},{heading:"the-integration-pattern",content:"The canonical two-command pipeline:"},{heading:"the-integration-pattern",content:"This is the idiomatic usage. You control parsing; Struktur controls extraction."},{heading:"see-also",content:"The Artifact Format — the input contract"},{heading:"see-also",content:"Built-in Input Types — how to get data into Struktur"},{heading:"see-also",content:"Writing a Custom Provider — extending MIME type support"}],headings:[{id:"parsing-is-hard-and-format-specific",content:"Parsing is hard and format-specific"},{id:"best-of-breed-parsers",content:"Best-of-breed parsers"},{id:"the-integration-pattern",content:"The integration pattern"},{id:"see-also",content:"See also"}]};const d=[{depth:2,url:"#parsing-is-hard-and-format-specific",title:e.jsx(e.Fragment,{children:"Parsing is hard and format-specific"})},{depth:2,url:"#best-of-breed-parsers",title:e.jsx(e.Fragment,{children:"Best-of-breed parsers"})},{depth:2,url:"#the-integration-pattern",title:e.jsx(e.Fragment,{children:"The integration pattern"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function i(n){const t={a:"a",code:"code",em:"em",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h2,{id:"parsing-is-hard-and-format-specific",children:"Parsing is hard and format-specific"}),`
`,e.jsx(t.p,{children:"PDF parsing, HTML extraction, Excel reading, email decoding — each format has edge cases, vendor quirks, and library ecosystems. Bundling any of them into Struktur would:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Add dependencies you may not need"}),`
`,e.jsx(t.li,{children:"Force a specific parser even when you have a better one"}),`
`,e.jsx(t.li,{children:"Conflate two distinct problems (format parsing + structured extraction)"}),`
`]}),`
`,e.jsx(t.h2,{id:"best-of-breed-parsers",children:"Best-of-breed parsers"}),`
`,e.jsx(t.p,{children:"Use the right tool for your format:"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Format"}),e.jsx(t.th,{children:"Recommended tools"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"PDF"})}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"markitdown"})," (Microsoft), ",e.jsx(t.code,{children:"pdftotext"}),", ",e.jsx(t.code,{children:"pdf-parse"})]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"HTML/web"})}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"markitdown"}),", ",e.jsx(t.code,{children:"readability-js"}),", ",e.jsx(t.code,{children:"cheerio"})]})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.strong,{children:"Office docs"})," (.docx, .xlsx)"]}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"markitdown"}),", ",e.jsx(t.code,{children:"xlsx"}),", ",e.jsx(t.code,{children:"mammoth"})]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Images (OCR)"})}),e.jsx(t.td,{children:"Tesseract, Google Vision, AWS Textract"})]})]})]}),`
`,e.jsxs(t.p,{children:[`:::note
Struktur `,e.jsx(t.em,{children:"can"}),` receive base64-encoded images directly in artifacts — OCR is not always needed if the vision model is good enough.
:::`]}),`
`,e.jsx(t.h2,{id:"the-integration-pattern",children:"The integration pattern"}),`
`,e.jsx(t.p,{children:"The canonical two-command pipeline:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"markitdown"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" document.pdf"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsx(t.p,{children:"This is the idiomatic usage. You control parsing; Struktur controls extraction."}),`
`,e.jsx(t.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/preprocessing/artifact-format",children:"The Artifact Format"})," — the input contract"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/preprocessing/built-in-inputs",children:"Built-in Input Types"})," — how to get data into Struktur"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/explanation/preprocessing/custom-provider",children:"Writing a Custom Provider"})," — extending MIME type support"]}),`
`]})]})}function c(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}export{r as _markdown,c as default,a as frontmatter,o as structuredData,d as toc};
