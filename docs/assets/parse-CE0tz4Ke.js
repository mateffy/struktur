import{j as e}from"./main-DFCjmrOs.js";let r=`

Synopsis [#synopsis]

\`\`\`bash
struktur parse --input <file> [options]
struktur parse --stdin [options]
\`\`\`

Description [#description]

Converts a file or stdin to Artifact JSON. Use this to:

* Inspect how Struktur will represent your document before running extraction
* Pre-process files and cache the artifact JSON for repeated extraction
* Debug parser output when configuring a custom parser
* Pipe artifacts into \`struktur extract --artifact -\` for decoupled workflows

Options [#options]

Input (exactly one required) [#input-exactly-one-required]

| Flag             | Short | Type    | Description     |
| ---------------- | ----- | ------- | --------------- |
| \`--input <path>\` | \`-i\`  | string  | File to parse   |
| \`--stdin\`        | \`-s\`  | boolean | Read from stdin |

Output [#output]

| Flag                 | Short | Type   | Default      | Description                           |
| -------------------- | ----- | ------ | ------------ | ------------------------------------- |
| \`--output <path\\|->\` | \`-o\`  | string | \`-\` (stdout) | Write artifact JSON to file or stdout |

Parser control [#parser-control]

| Flag             | Type   | Description                                                      |
| ---------------- | ------ | ---------------------------------------------------------------- |
| \`--mime <type>\`  | string | Override MIME type detection                                     |
| \`--parser <pkg>\` | string | Use this npm package as parser, overriding any configured parser |

Image extraction (PDF inputs) [#image-extraction-pdf-inputs]

| Flag                       | Type    | Default | Description                                                        |
| -------------------------- | ------- | ------- | ------------------------------------------------------------------ |
| \`--images\`                 | boolean | false   | Extract embedded images from PDFs                                  |
| \`--screenshots\`            | boolean | false   | Render page screenshots                                            |
| \`--screenshot-scale <num>\` | number  | 1.5     | Scale factor for screenshots                                       |
| \`--screenshot-width <px>\`  | number  | —       | Target screenshot width in pixels (overrides \`--screenshot-scale\`) |

Parser resolution order [#parser-resolution-order]

1. \`--parser <pkg>\` flag — bypasses all config
2. Parser configured for the detected MIME type (\`struktur config parsers add ...\`)
3. Built-in parser for the MIME type
4. Error: no parser found — suggests \`struktur config parsers add\`

Built-in parsers [#built-in-parsers]

| MIME type          | Behavior                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| \`application/pdf\`  | Per-page text via \`pdf-parse\`. Add \`--images\` for embedded images, \`--screenshots\` for page renders. |
| \`text/*\`           | Split on double newlines into content slices.                                                        |
| \`image/*\`          | Single-content artifact with the image as a media item.                                              |
| \`application/json\` | If it validates as \`SerializedArtifact[]\`, passed through unchanged.                                 |

Examples [#examples]

\`\`\`bash
# Inspect a PDF
struktur parse --input document.pdf

# Extract PDF with embedded images and page screenshots
struktur parse --input slides.pdf --images --screenshots --output artifact.json

# Use a configured custom parser
struktur parse --input report.docx --output artifact.json

# Override the parser on the fly
struktur parse --input data.xlsx --parser @myorg/xlsx-parser

# Pipe into extract
struktur parse --input doc.pdf --images | \\
  struktur extract --artifact - --fields "title, author" --model openai/gpt-4o-mini

# Inspect in the browser
struktur parse --input doc.pdf | struktur utils artifact-viewer --stdin > viewer.html
open viewer.html
\`\`\`

See also [#see-also]

* [config parsers](/docs/cli/config#config-parsers) — Configure custom parsers
* [Parsers](/docs/explanation/parsers) — Parser system overview
* [Artifact Format](/docs/explanation/preprocessing/artifact-format) — Output format
* [utils artifact-viewer](/docs/cli/utils) — Visualize parsed artifacts
`,a={title:"parse",description:"Convert files to Artifact JSON for inspection or pre-processing."},d={contents:[{heading:"description",content:"Converts a file or stdin to Artifact JSON. Use this to:"},{heading:"description",content:"Inspect how Struktur will represent your document before running extraction"},{heading:"description",content:"Pre-process files and cache the artifact JSON for repeated extraction"},{heading:"description",content:"Debug parser output when configuring a custom parser"},{heading:"description",content:"Pipe artifacts into `struktur extract --artifact -` for decoupled workflows"},{heading:"input-exactly-one-required",content:"Flag"},{heading:"input-exactly-one-required",content:"Short"},{heading:"input-exactly-one-required",content:"Type"},{heading:"input-exactly-one-required",content:"Description"},{heading:"input-exactly-one-required",content:"`--input <path>`"},{heading:"input-exactly-one-required",content:"`-i`"},{heading:"input-exactly-one-required",content:"string"},{heading:"input-exactly-one-required",content:"File to parse"},{heading:"input-exactly-one-required",content:"`--stdin`"},{heading:"input-exactly-one-required",content:"`-s`"},{heading:"input-exactly-one-required",content:"boolean"},{heading:"input-exactly-one-required",content:"Read from stdin"},{heading:"output",content:"Flag"},{heading:"output",content:"Short"},{heading:"output",content:"Type"},{heading:"output",content:"Default"},{heading:"output",content:"Description"},{heading:"output",content:"`--output <path\\|->`"},{heading:"output",content:"`-o`"},{heading:"output",content:"string"},{heading:"output",content:"`-` (stdout)"},{heading:"output",content:"Write artifact JSON to file or stdout"},{heading:"parser-control",content:"Flag"},{heading:"parser-control",content:"Type"},{heading:"parser-control",content:"Description"},{heading:"parser-control",content:"`--mime <type>`"},{heading:"parser-control",content:"string"},{heading:"parser-control",content:"Override MIME type detection"},{heading:"parser-control",content:"`--parser <pkg>`"},{heading:"parser-control",content:"string"},{heading:"parser-control",content:"Use this npm package as parser, overriding any configured parser"},{heading:"image-extraction-pdf-inputs",content:"Flag"},{heading:"image-extraction-pdf-inputs",content:"Type"},{heading:"image-extraction-pdf-inputs",content:"Default"},{heading:"image-extraction-pdf-inputs",content:"Description"},{heading:"image-extraction-pdf-inputs",content:"`--images`"},{heading:"image-extraction-pdf-inputs",content:"boolean"},{heading:"image-extraction-pdf-inputs",content:"false"},{heading:"image-extraction-pdf-inputs",content:"Extract embedded images from PDFs"},{heading:"image-extraction-pdf-inputs",content:"`--screenshots`"},{heading:"image-extraction-pdf-inputs",content:"boolean"},{heading:"image-extraction-pdf-inputs",content:"false"},{heading:"image-extraction-pdf-inputs",content:"Render page screenshots"},{heading:"image-extraction-pdf-inputs",content:"`--screenshot-scale <num>`"},{heading:"image-extraction-pdf-inputs",content:"number"},{heading:"image-extraction-pdf-inputs",content:"1.5"},{heading:"image-extraction-pdf-inputs",content:"Scale factor for screenshots"},{heading:"image-extraction-pdf-inputs",content:"`--screenshot-width <px>`"},{heading:"image-extraction-pdf-inputs",content:"number"},{heading:"image-extraction-pdf-inputs",content:"—"},{heading:"image-extraction-pdf-inputs",content:"Target screenshot width in pixels (overrides `--screenshot-scale`)"},{heading:"parser-resolution-order",content:"`--parser <pkg>` flag — bypasses all config"},{heading:"parser-resolution-order",content:"Parser configured for the detected MIME type (`struktur config parsers add ...`)"},{heading:"parser-resolution-order",content:"Built-in parser for the MIME type"},{heading:"parser-resolution-order",content:"Error: no parser found — suggests `struktur config parsers add`"},{heading:"built-in-parsers",content:"MIME type"},{heading:"built-in-parsers",content:"Behavior"},{heading:"built-in-parsers",content:"`application/pdf`"},{heading:"built-in-parsers",content:"Per-page text via `pdf-parse`. Add `--images` for embedded images, `--screenshots` for page renders."},{heading:"built-in-parsers",content:"`text/*`"},{heading:"built-in-parsers",content:"Split on double newlines into content slices."},{heading:"built-in-parsers",content:"`image/*`"},{heading:"built-in-parsers",content:"Single-content artifact with the image as a media item."},{heading:"built-in-parsers",content:"`application/json`"},{heading:"built-in-parsers",content:"If it validates as `SerializedArtifact[]`, passed through unchanged."},{heading:"see-also",content:"config parsers — Configure custom parsers"},{heading:"see-also",content:"Parsers — Parser system overview"},{heading:"see-also",content:"Artifact Format — Output format"},{heading:"see-also",content:"utils artifact-viewer — Visualize parsed artifacts"}],headings:[{id:"synopsis",content:"Synopsis"},{id:"description",content:"Description"},{id:"options",content:"Options"},{id:"input-exactly-one-required",content:"Input (exactly one required)"},{id:"output",content:"Output"},{id:"parser-control",content:"Parser control"},{id:"image-extraction-pdf-inputs",content:"Image extraction (PDF inputs)"},{id:"parser-resolution-order",content:"Parser resolution order"},{id:"built-in-parsers",content:"Built-in parsers"},{id:"examples",content:"Examples"},{id:"see-also",content:"See also"}]};const l=[{depth:2,url:"#synopsis",title:e.jsx(e.Fragment,{children:"Synopsis"})},{depth:2,url:"#description",title:e.jsx(e.Fragment,{children:"Description"})},{depth:2,url:"#options",title:e.jsx(e.Fragment,{children:"Options"})},{depth:3,url:"#input-exactly-one-required",title:e.jsx(e.Fragment,{children:"Input (exactly one required)"})},{depth:3,url:"#output",title:e.jsx(e.Fragment,{children:"Output"})},{depth:3,url:"#parser-control",title:e.jsx(e.Fragment,{children:"Parser control"})},{depth:3,url:"#image-extraction-pdf-inputs",title:e.jsx(e.Fragment,{children:"Image extraction (PDF inputs)"})},{depth:2,url:"#parser-resolution-order",title:e.jsx(e.Fragment,{children:"Parser resolution order"})},{depth:2,url:"#built-in-parsers",title:e.jsx(e.Fragment,{children:"Built-in parsers"})},{depth:2,url:"#examples",title:e.jsx(e.Fragment,{children:"Examples"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function t(s){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"synopsis",children:"Synopsis"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"fil"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [options]"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [options]"})]})]})})}),`
`,e.jsx(i.h2,{id:"description",children:"Description"}),`
`,e.jsx(i.p,{children:"Converts a file or stdin to Artifact JSON. Use this to:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Inspect how Struktur will represent your document before running extraction"}),`
`,e.jsx(i.li,{children:"Pre-process files and cache the artifact JSON for repeated extraction"}),`
`,e.jsx(i.li,{children:"Debug parser output when configuring a custom parser"}),`
`,e.jsxs(i.li,{children:["Pipe artifacts into ",e.jsx(i.code,{children:"struktur extract --artifact -"})," for decoupled workflows"]}),`
`]}),`
`,e.jsx(i.h2,{id:"options",children:"Options"}),`
`,e.jsx(i.h3,{id:"input-exactly-one-required",children:"Input (exactly one required)"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Flag"}),e.jsx(i.th,{children:"Short"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--input <path>"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"-i"})}),e.jsx(i.td,{children:"string"}),e.jsx(i.td,{children:"File to parse"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--stdin"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"-s"})}),e.jsx(i.td,{children:"boolean"}),e.jsx(i.td,{children:"Read from stdin"})]})]})]}),`
`,e.jsx(i.h3,{id:"output",children:"Output"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Flag"}),e.jsx(i.th,{children:"Short"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsx(i.tbody,{children:e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--output <path|->"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"-o"})}),e.jsx(i.td,{children:"string"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"-"})," (stdout)"]}),e.jsx(i.td,{children:"Write artifact JSON to file or stdout"})]})})]}),`
`,e.jsx(i.h3,{id:"parser-control",children:"Parser control"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Flag"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--mime <type>"})}),e.jsx(i.td,{children:"string"}),e.jsx(i.td,{children:"Override MIME type detection"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--parser <pkg>"})}),e.jsx(i.td,{children:"string"}),e.jsx(i.td,{children:"Use this npm package as parser, overriding any configured parser"})]})]})]}),`
`,e.jsx(i.h3,{id:"image-extraction-pdf-inputs",children:"Image extraction (PDF inputs)"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Flag"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--images"})}),e.jsx(i.td,{children:"boolean"}),e.jsx(i.td,{children:"false"}),e.jsx(i.td,{children:"Extract embedded images from PDFs"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--screenshots"})}),e.jsx(i.td,{children:"boolean"}),e.jsx(i.td,{children:"false"}),e.jsx(i.td,{children:"Render page screenshots"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--screenshot-scale <num>"})}),e.jsx(i.td,{children:"number"}),e.jsx(i.td,{children:"1.5"}),e.jsx(i.td,{children:"Scale factor for screenshots"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--screenshot-width <px>"})}),e.jsx(i.td,{children:"number"}),e.jsx(i.td,{children:"—"}),e.jsxs(i.td,{children:["Target screenshot width in pixels (overrides ",e.jsx(i.code,{children:"--screenshot-scale"}),")"]})]})]})]}),`
`,e.jsx(i.h2,{id:"parser-resolution-order",children:"Parser resolution order"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"--parser <pkg>"})," flag — bypasses all config"]}),`
`,e.jsxs(i.li,{children:["Parser configured for the detected MIME type (",e.jsx(i.code,{children:"struktur config parsers add ..."}),")"]}),`
`,e.jsx(i.li,{children:"Built-in parser for the MIME type"}),`
`,e.jsxs(i.li,{children:["Error: no parser found — suggests ",e.jsx(i.code,{children:"struktur config parsers add"})]}),`
`]}),`
`,e.jsx(i.h2,{id:"built-in-parsers",children:"Built-in parsers"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"MIME type"}),e.jsx(i.th,{children:"Behavior"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"application/pdf"})}),e.jsxs(i.td,{children:["Per-page text via ",e.jsx(i.code,{children:"pdf-parse"}),". Add ",e.jsx(i.code,{children:"--images"})," for embedded images, ",e.jsx(i.code,{children:"--screenshots"})," for page renders."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"text/*"})}),e.jsx(i.td,{children:"Split on double newlines into content slices."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"image/*"})}),e.jsx(i.td,{children:"Single-content artifact with the image as a media item."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"application/json"})}),e.jsxs(i.td,{children:["If it validates as ",e.jsx(i.code,{children:"SerializedArtifact[]"}),", passed through unchanged."]})]})]})]}),`
`,e.jsx(i.h2,{id:"examples",children:"Examples"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Inspect a PDF"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" document.pdf"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Extract PDF with embedded images and page screenshots"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" slides.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --images"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --screenshots"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifact.json"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Use a configured custom parser"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" report.docx"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifact.json"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Override the parser on the fly"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data.xlsx"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --parser"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @myorg/xlsx-parser"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Pipe into extract"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doc.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --images"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --artifact"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "title, author"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Inspect in the browser"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doc.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" utils"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifact-viewer"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" viewer.html"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"open"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" viewer.html"})]})]})})}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/config#config-parsers",children:"config parsers"})," — Configure custom parsers"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/parsers",children:"Parsers"})," — Parser system overview"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/preprocessing/artifact-format",children:"Artifact Format"})," — Output format"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/utils",children:"utils artifact-viewer"})," — Visualize parsed artifacts"]}),`
`]})]})}function h(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(t,{...s})}):t(s)}export{r as _markdown,h as default,a as frontmatter,d as structuredData,l as toc};
