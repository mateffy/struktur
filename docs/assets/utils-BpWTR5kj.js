import{j as e}from"./main-BU_tQzVR.js";let a=`

utils artifact-viewer [#utils-artifact-viewer]

Generates a self-contained HTML file for exploring artifact JSON in a browser.

\`\`\`bash
struktur utils artifact-viewer --input artifacts.json --output viewer.html
struktur parse --input doc.pdf --images | struktur utils artifact-viewer --stdin > viewer.html
\`\`\`

Options [#options]

| Flag                 | Short | Type    | Default      | Description                   |
| -------------------- | ----- | ------- | ------------ | ----------------------------- |
| \`--input <path>\`     | \`-i\`  | string  | —            | Artifact JSON file            |
| \`--stdin\`            | \`-s\`  | boolean | false        | Read artifact JSON from stdin |
| \`--output <path\\|->\` | \`-o\`  | string  | \`-\` (stdout) | Write HTML to file or stdout  |

What the viewer shows [#what-the-viewer-shows]

**Default view** (artifact-by-artifact):

* Each artifact as a card with header showing type, page count, and image count
* Text content with expand/collapse per-slice (truncated at 500 chars, full text on click)
* Image thumbnails with click-to-enlarge modal
* Screenshot images marked with an orange "screenshot" badge
* Image dimensions overlaid on each thumbnail
* Metadata section (collapsible)

**Batching Mode** (chunking visualization):

* Sidebar listing batches and chunks with token and image counts
* Main area shows each chunk with a dashed amber border at chunk boundaries
* Configurable chunking parameters: Max Tokens, Max Images, Text Ratio, Image Tokens
* Image type filter: show/hide embedded images and screenshots independently
* Token and image counts update live as parameters change

The viewer embeds a JavaScript implementation of Struktur's chunking algorithm so batching mode accurately reflects what \`parallel\`, \`sequential\`, and other chunked strategies will do with your documents.

Workflow example [#workflow-example]

\`\`\`bash
# Parse a PDF, inspect it in the browser before extracting
struktur parse --input contract.pdf --images --screenshots --output contract-artifacts.json
struktur utils artifact-viewer --input contract-artifacts.json --output viewer.html
open viewer.html

# Decide on chunking parameters, then extract
struktur extract --input contract.pdf --images --schema schema.json \\
  --strategy parallelAutoMerge --chunk-size 8000 --model openai/gpt-4o
\`\`\`

See also [#see-also]

* [parse](/docs/cli/parse) — Generate artifact JSON from files
* [Artifact Format](/docs/explanation/artifact-format) — Understanding artifacts
* [Chunking & Token Budgets](/docs/explanation/chunking) — How chunking works
`,h={title:"utils",description:"Utility commands for working with artifacts."},r={contents:[{heading:"utils-artifact-viewer",content:"Generates a self-contained HTML file for exploring artifact JSON in a browser."},{heading:"options",content:"Flag"},{heading:"options",content:"Short"},{heading:"options",content:"Type"},{heading:"options",content:"Default"},{heading:"options",content:"Description"},{heading:"options",content:"`--input <path>`"},{heading:"options",content:"`-i`"},{heading:"options",content:"string"},{heading:"options",content:"—"},{heading:"options",content:"Artifact JSON file"},{heading:"options",content:"`--stdin`"},{heading:"options",content:"`-s`"},{heading:"options",content:"boolean"},{heading:"options",content:"false"},{heading:"options",content:"Read artifact JSON from stdin"},{heading:"options",content:"`--output <path\\|->`"},{heading:"options",content:"`-o`"},{heading:"options",content:"string"},{heading:"options",content:"`-` (stdout)"},{heading:"options",content:"Write HTML to file or stdout"},{heading:"what-the-viewer-shows",content:"**Default view** (artifact-by-artifact):"},{heading:"what-the-viewer-shows",content:"Each artifact as a card with header showing type, page count, and image count"},{heading:"what-the-viewer-shows",content:"Text content with expand/collapse per-slice (truncated at 500 chars, full text on click)"},{heading:"what-the-viewer-shows",content:"Image thumbnails with click-to-enlarge modal"},{heading:"what-the-viewer-shows",content:'Screenshot images marked with an orange "screenshot" badge'},{heading:"what-the-viewer-shows",content:"Image dimensions overlaid on each thumbnail"},{heading:"what-the-viewer-shows",content:"Metadata section (collapsible)"},{heading:"what-the-viewer-shows",content:"**Batching Mode** (chunking visualization):"},{heading:"what-the-viewer-shows",content:"Sidebar listing batches and chunks with token and image counts"},{heading:"what-the-viewer-shows",content:"Main area shows each chunk with a dashed amber border at chunk boundaries"},{heading:"what-the-viewer-shows",content:"Configurable chunking parameters: Max Tokens, Max Images, Text Ratio, Image Tokens"},{heading:"what-the-viewer-shows",content:"Image type filter: show/hide embedded images and screenshots independently"},{heading:"what-the-viewer-shows",content:"Token and image counts update live as parameters change"},{heading:"what-the-viewer-shows",content:"The viewer embeds a JavaScript implementation of Struktur's chunking algorithm so batching mode accurately reflects what `parallel`, `sequential`, and other chunked strategies will do with your documents."},{heading:"see-also",content:"parse — Generate artifact JSON from files"},{heading:"see-also",content:"Artifact Format — Understanding artifacts"},{heading:"see-also",content:"Chunking & Token Budgets — How chunking works"}],headings:[{id:"utils-artifact-viewer",content:"utils artifact-viewer"},{id:"options",content:"Options"},{id:"what-the-viewer-shows",content:"What the viewer shows"},{id:"workflow-example",content:"Workflow example"},{id:"see-also",content:"See also"}]};const l=[{depth:2,url:"#utils-artifact-viewer",title:e.jsx(e.Fragment,{children:"utils artifact-viewer"})},{depth:3,url:"#options",title:e.jsx(e.Fragment,{children:"Options"})},{depth:3,url:"#what-the-viewer-shows",title:e.jsx(e.Fragment,{children:"What the viewer shows"})},{depth:3,url:"#workflow-example",title:e.jsx(e.Fragment,{children:"Workflow example"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function s(t){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"utils-artifact-viewer",children:"utils artifact-viewer"}),`
`,e.jsx(i.p,{children:"Generates a self-contained HTML file for exploring artifact JSON in a browser."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" utils"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifact-viewer"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifacts.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" viewer.html"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doc.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --images"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" utils"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifact-viewer"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" viewer.html"})]})]})})}),`
`,e.jsx(i.h3,{id:"options",children:"Options"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Flag"}),e.jsx(i.th,{children:"Short"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--input <path>"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"-i"})}),e.jsx(i.td,{children:"string"}),e.jsx(i.td,{children:"—"}),e.jsx(i.td,{children:"Artifact JSON file"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--stdin"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"-s"})}),e.jsx(i.td,{children:"boolean"}),e.jsx(i.td,{children:"false"}),e.jsx(i.td,{children:"Read artifact JSON from stdin"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--output <path|->"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"-o"})}),e.jsx(i.td,{children:"string"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"-"})," (stdout)"]}),e.jsx(i.td,{children:"Write HTML to file or stdout"})]})]})]}),`
`,e.jsx(i.h3,{id:"what-the-viewer-shows",children:"What the viewer shows"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Default view"})," (artifact-by-artifact):"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Each artifact as a card with header showing type, page count, and image count"}),`
`,e.jsx(i.li,{children:"Text content with expand/collapse per-slice (truncated at 500 chars, full text on click)"}),`
`,e.jsx(i.li,{children:"Image thumbnails with click-to-enlarge modal"}),`
`,e.jsx(i.li,{children:'Screenshot images marked with an orange "screenshot" badge'}),`
`,e.jsx(i.li,{children:"Image dimensions overlaid on each thumbnail"}),`
`,e.jsx(i.li,{children:"Metadata section (collapsible)"}),`
`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Batching Mode"})," (chunking visualization):"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Sidebar listing batches and chunks with token and image counts"}),`
`,e.jsx(i.li,{children:"Main area shows each chunk with a dashed amber border at chunk boundaries"}),`
`,e.jsx(i.li,{children:"Configurable chunking parameters: Max Tokens, Max Images, Text Ratio, Image Tokens"}),`
`,e.jsx(i.li,{children:"Image type filter: show/hide embedded images and screenshots independently"}),`
`,e.jsx(i.li,{children:"Token and image counts update live as parameters change"}),`
`]}),`
`,e.jsxs(i.p,{children:["The viewer embeds a JavaScript implementation of Struktur's chunking algorithm so batching mode accurately reflects what ",e.jsx(i.code,{children:"parallel"}),", ",e.jsx(i.code,{children:"sequential"}),", and other chunked strategies will do with your documents."]}),`
`,e.jsx(i.h3,{id:"workflow-example",children:"Workflow example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Parse a PDF, inspect it in the browser before extracting"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" contract.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --images"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --screenshots"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" contract-artifacts.json"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" utils"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifact-viewer"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" contract-artifacts.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" viewer.html"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"open"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" viewer.html"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Decide on chunking parameters, then extract"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" contract.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --images"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallelAutoMerge"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --chunk-size"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 8000"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o"})]})]})})}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/parse",children:"parse"})," — Generate artifact JSON from files"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/artifact-format",children:"Artifact Format"})," — Understanding artifacts"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/chunking",children:"Chunking & Token Budgets"})," — How chunking works"]}),`
`]})]})}function c(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(s,{...t})}):s(t)}export{a as _markdown,c as default,h as frontmatter,r as structuredData,l as toc};
