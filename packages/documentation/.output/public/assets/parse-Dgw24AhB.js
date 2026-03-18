import{j as e,az as l,aA as n,at as r,aw as d,ax as t}from"./main-Ca2d6S-S.js";let h=`

import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Callout } from 'fumadocs-ui/components/callout';
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';
import { Card, Cards } from 'fumadocs-ui/components/card';

Synopsis [#synopsis]

\`\`\`bash
struktur parse --input <file> [options]
struktur parse --stdin [options]
\`\`\`

Description [#description]

Converts a file or stdin to Artifact JSON. Use this to:

<Cards>
  <Card title="Inspect" description="See how Struktur will represent your document before running extraction" />

  <Card title="Cache" description="Pre-process files and cache the artifact JSON for repeated extraction" />

  <Card title="Debug" description="Debug parser output when configuring a custom parser" />

  <Card title="Pipeline" description="Pipe artifacts into extract for decoupled workflows" />
</Cards>

Options [#options]

Input (exactly one required) [#input-exactly-one-required]

<TypeTable
  type={{
  input: {
    description: 'File to parse',
    type: 'string',
    short: '-i',
    required: false,
  },
  stdin: {
    description: 'Read from stdin',
    type: 'boolean',
    short: '-s',
    required: false,
  },
}}
/>

Output [#output]

<TypeTable
  type={{
  output: {
    description: 'Write artifact JSON to file or stdout (-)',
    type: 'string',
    short: '-o',
    default: '- (stdout)',
    required: false,
  },
}}
/>

Parser control [#parser-control]

<TypeTable
  type={{
  mime: {
    description: 'Override MIME type detection',
    type: 'string',
    required: false,
  },
  parser: {
    description: 'Use this npm package as parser, overriding any configured parser',
    type: 'string',
    required: false,
  },
}}
/>

Image extraction (PDF inputs) [#image-extraction-pdf-inputs]

<TypeTable
  type={{
  images: {
    description: 'Extract embedded images from PDFs',
    type: 'boolean',
    default: 'false',
    required: false,
  },
  screenshots: {
    description: 'Render page screenshots',
    type: 'boolean',
    default: 'false',
    required: false,
  },
  'screenshot-scale': {
    description: 'Scale factor for screenshots',
    type: 'number',
    default: '1.5',
    required: false,
  },
  'screenshot-width': {
    description: 'Target screenshot width in pixels (overrides --screenshot-scale)',
    type: 'number',
    required: false,
  },
}}
/>

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

<Tabs items={['Inspect a PDF', 'Extract with images', 'Custom parser', 'Pipeline', 'Browser viewer']}>
  <Tab value="Inspect a PDF">
    \`\`\`bash
    struktur parse --input document.pdf
    \`\`\`
  </Tab>

  <Tab value="Extract with images">
    \`\`\`bash
    struktur parse --input slides.pdf --images --screenshots --output artifact.json
    \`\`\`
  </Tab>

  <Tab value="Custom parser">
    \`\`\`bash
    struktur parse --input data.xlsx --parser @myorg/xlsx-parser
    \`\`\`
  </Tab>

  <Tab value="Pipeline">
    \`\`\`bash
    struktur parse --input doc.pdf --images | \\
      struktur extract --artifact-file - --fields "title, author" --model openai/gpt-4o-mini
    \`\`\`
  </Tab>

  <Tab value="Browser viewer">
    \`\`\`bash
    struktur parse --input doc.pdf | struktur utils artifact-viewer --stdin > viewer.html
    open viewer.html
    \`\`\`
  </Tab>
</Tabs>

See also [#see-also]

* [config parsers](/docs/cli/config#config-parsers) — Configure custom parsers
* [Document Parsing](/docs/explanation/document-parsing) — Parser system overview
* [Artifact Format](/docs/explanation/artifact-format) — Output format
* [utils artifact-viewer](/docs/cli/utils) — Visualize parsed artifacts
`,c={title:"parse",description:"Convert files to Artifact JSON for inspection or pre-processing."},p={contents:[{heading:"description",content:"Converts a file or stdin to Artifact JSON. Use this to:"},{heading:"description",content:'<Card title="Inspect" description="See how Struktur will represent your document before running extraction" />'},{heading:"description",content:'<Card title="Cache" description="Pre-process files and cache the artifact JSON for repeated extraction" />'},{heading:"description",content:'<Card title="Debug" description="Debug parser output when configuring a custom parser" />'},{heading:"description",content:'<Card title="Pipeline" description="Pipe artifacts into extract for decoupled workflows" />'},{heading:"input-exactly-one-required",content:`<TypeTable
  type="{
  input: {
    description: 'File to parse',
    type: 'string',
    short: '-i',
    required: false,
  },
  stdin: {
    description: 'Read from stdin',
    type: 'boolean',
    short: '-s',
    required: false,
  },
}"
/>`},{heading:"output",content:`<TypeTable
  type="{
  output: {
    description: 'Write artifact JSON to file or stdout (-)',
    type: 'string',
    short: '-o',
    default: '- (stdout)',
    required: false,
  },
}"
/>`},{heading:"parser-control",content:`<TypeTable
  type="{
  mime: {
    description: 'Override MIME type detection',
    type: 'string',
    required: false,
  },
  parser: {
    description: 'Use this npm package as parser, overriding any configured parser',
    type: 'string',
    required: false,
  },
}"
/>`},{heading:"image-extraction-pdf-inputs",content:`<TypeTable
  type="{
  images: {
    description: 'Extract embedded images from PDFs',
    type: 'boolean',
    default: 'false',
    required: false,
  },
  screenshots: {
    description: 'Render page screenshots',
    type: 'boolean',
    default: 'false',
    required: false,
  },
  'screenshot-scale': {
    description: 'Scale factor for screenshots',
    type: 'number',
    default: '1.5',
    required: false,
  },
  'screenshot-width': {
    description: 'Target screenshot width in pixels (overrides --screenshot-scale)',
    type: 'number',
    required: false,
  },
}"
/>`},{heading:"parser-resolution-order",content:"`--parser <pkg>` flag — bypasses all config"},{heading:"parser-resolution-order",content:"Parser configured for the detected MIME type (`struktur config parsers add ...`)"},{heading:"parser-resolution-order",content:"Built-in parser for the MIME type"},{heading:"parser-resolution-order",content:"Error: no parser found — suggests `struktur config parsers add`"},{heading:"built-in-parsers",content:"MIME type"},{heading:"built-in-parsers",content:"Behavior"},{heading:"built-in-parsers",content:"`application/pdf`"},{heading:"built-in-parsers",content:"Per-page text via `pdf-parse`. Add `--images` for embedded images, `--screenshots` for page renders."},{heading:"built-in-parsers",content:"`text/*`"},{heading:"built-in-parsers",content:"Split on double newlines into content slices."},{heading:"built-in-parsers",content:"`image/*`"},{heading:"built-in-parsers",content:"Single-content artifact with the image as a media item."},{heading:"built-in-parsers",content:"`application/json`"},{heading:"built-in-parsers",content:"If it validates as `SerializedArtifact[]`, passed through unchanged."},{heading:"see-also",content:"config parsers — Configure custom parsers"},{heading:"see-also",content:"Document Parsing — Parser system overview"},{heading:"see-also",content:"Artifact Format — Output format"},{heading:"see-also",content:"utils artifact-viewer — Visualize parsed artifacts"}],headings:[{id:"synopsis",content:"Synopsis"},{id:"description",content:"Description"},{id:"options",content:"Options"},{id:"input-exactly-one-required",content:"Input (exactly one required)"},{id:"output",content:"Output"},{id:"parser-control",content:"Parser control"},{id:"image-extraction-pdf-inputs",content:"Image extraction (PDF inputs)"},{id:"parser-resolution-order",content:"Parser resolution order"},{id:"built-in-parsers",content:"Built-in parsers"},{id:"examples",content:"Examples"},{id:"see-also",content:"See also"}]};const u=[{depth:2,url:"#synopsis",title:e.jsx(e.Fragment,{children:"Synopsis"})},{depth:2,url:"#description",title:e.jsx(e.Fragment,{children:"Description"})},{depth:2,url:"#options",title:e.jsx(e.Fragment,{children:"Options"})},{depth:3,url:"#input-exactly-one-required",title:e.jsx(e.Fragment,{children:"Input (exactly one required)"})},{depth:3,url:"#output",title:e.jsx(e.Fragment,{children:"Output"})},{depth:3,url:"#parser-control",title:e.jsx(e.Fragment,{children:"Parser control"})},{depth:3,url:"#image-extraction-pdf-inputs",title:e.jsx(e.Fragment,{children:"Image extraction (PDF inputs)"})},{depth:2,url:"#parser-resolution-order",title:e.jsx(e.Fragment,{children:"Parser resolution order"})},{depth:2,url:"#built-in-parsers",title:e.jsx(e.Fragment,{children:"Built-in parsers"})},{depth:2,url:"#examples",title:e.jsx(e.Fragment,{children:"Examples"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function a(s){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"synopsis",children:"Synopsis"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"fil"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [options]"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [options]"})]})]})})}),`
`,e.jsx(i.h2,{id:"description",children:"Description"}),`
`,e.jsx(i.p,{children:"Converts a file or stdin to Artifact JSON. Use this to:"}),`
`,e.jsxs(l,{children:[e.jsx(n,{title:"Inspect",description:"See how Struktur will represent your document before running extraction"}),e.jsx(n,{title:"Cache",description:"Pre-process files and cache the artifact JSON for repeated extraction"}),e.jsx(n,{title:"Debug",description:"Debug parser output when configuring a custom parser"}),e.jsx(n,{title:"Pipeline",description:"Pipe artifacts into extract for decoupled workflows"})]}),`
`,e.jsx(i.h2,{id:"options",children:"Options"}),`
`,e.jsx(i.h3,{id:"input-exactly-one-required",children:"Input (exactly one required)"}),`
`,e.jsx(r,{type:{input:{description:"File to parse",type:"string",short:"-i",required:!1},stdin:{description:"Read from stdin",type:"boolean",short:"-s",required:!1}}}),`
`,e.jsx(i.h3,{id:"output",children:"Output"}),`
`,e.jsx(r,{type:{output:{description:"Write artifact JSON to file or stdout (-)",type:"string",short:"-o",default:"- (stdout)",required:!1}}}),`
`,e.jsx(i.h3,{id:"parser-control",children:"Parser control"}),`
`,e.jsx(r,{type:{mime:{description:"Override MIME type detection",type:"string",required:!1},parser:{description:"Use this npm package as parser, overriding any configured parser",type:"string",required:!1}}}),`
`,e.jsx(i.h3,{id:"image-extraction-pdf-inputs",children:"Image extraction (PDF inputs)"}),`
`,e.jsx(r,{type:{images:{description:"Extract embedded images from PDFs",type:"boolean",default:"false",required:!1},screenshots:{description:"Render page screenshots",type:"boolean",default:"false",required:!1},"screenshot-scale":{description:"Scale factor for screenshots",type:"number",default:"1.5",required:!1},"screenshot-width":{description:"Target screenshot width in pixels (overrides --screenshot-scale)",type:"number",required:!1}}}),`
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
`,e.jsxs(d,{items:["Inspect a PDF","Extract with images","Custom parser","Pipeline","Browser viewer"],children:[e.jsx(t,{value:"Inspect a PDF",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" document.pdf"})]})})})})}),e.jsx(t,{value:"Extract with images",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" slides.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --images"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --screenshots"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifact.json"})]})})})})}),e.jsx(t,{value:"Custom parser",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data.xlsx"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --parser"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @myorg/xlsx-parser"})]})})})})}),e.jsx(t,{value:"Pipeline",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doc.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --images"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --artifact-file"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "title, author"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})})}),e.jsx(t,{value:"Browser viewer",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doc.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" utils"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifact-viewer"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" viewer.html"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"open"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" viewer.html"})]})]})})})})]}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/config#config-parsers",children:"config parsers"})," — Configure custom parsers"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/document-parsing",children:"Document Parsing"})," — Parser system overview"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/artifact-format",children:"Artifact Format"})," — Output format"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/utils",children:"utils artifact-viewer"})," — Visualize parsed artifacts"]}),`
`]})]})}function g(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(a,{...s})}):a(s)}export{h as _markdown,g as default,c as frontmatter,p as structuredData,u as toc};
