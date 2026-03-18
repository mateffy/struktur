import{j as e,az as n,aE as r,aC as l,aD as s}from"./main-BiZqUaIh.js";let h=`

import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Callout } from 'fumadocs-ui/components/callout';
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';

Synopsis [#synopsis]

\`\`\`bash
struktur [extract] [options]
\`\`\`

\`extract\` is the default command — \`struktur --input file.pdf ...\` and \`struktur extract --input file.pdf ...\` are equivalent.

Input options (exactly one required) [#input-options-exactly-one-required]

<TypeTable
  type={{
  input: {
    description: 'Read from a file path. MIME type auto-detected from magic bytes and file extension.',
    type: 'string',
    required: false,
  },
  stdin: {
    description: 'Read from stdin. Auto-detects artifact JSON or raw text. Auto-detected when piped with no other input flag.',
    type: 'boolean',
    required: false,
  },
  text: {
    description: 'Use inline text as input.',
    type: 'string',
    required: false,
  },
  'artifact-file': {
    description: 'Read pre-built artifact JSON from file path or HTTP(S) URL.',
    type: 'string',
    required: false,
  },
  'artifact-json': {
    description: 'Inline artifact JSON string.',
    type: 'string',
    required: false,
  },
}}
/>

Schema options (exactly one required) [#schema-options-exactly-one-required]

<TypeTable
  type={{
  schema: {
    description: 'JSON Schema file path or HTTP(S) URL.',
    type: 'string',
    required: false,
  },
  'schema-json': {
    description: 'Inline JSON Schema string.',
    type: 'string',
    required: false,
  },
  fields: {
    description: 'Fields shorthand — comma-separated field definitions. See Fields reference.',
    type: 'string',
    required: false,
  },
}}
/>

<Callout type="info">
  \`--fields\` is the quickest way to define a schema without writing JSON. See [--fields reference](/docs/cli/fields) for the full syntax.
</Callout>

Model [#model]

<TypeTable
  type={{
  model: {
    description: 'Model spec in provider/model format, or a stored alias.',
    type: 'string',
    default: 'configured default',
    required: false,
  },
}}
/>

Supported providers: \`openai\`, \`anthropic\`, \`google\`, \`opencode\`, \`openrouter\`.

For OpenRouter, you can specify a preferred inference provider using \`#\` syntax:

\`\`\`bash
--model "openrouter/anthropic/claude-3.5-sonnet#cerebras"
\`\`\`

Parsing options [#parsing-options]

These flags control how \`--input\` files are parsed before extraction.

<TypeTable
  type={{
  'no-parse': {
    description: 'Skip custom parsers; use only built-in text/image/artifact-JSON detection. Ignores any parsers configured via config parsers add.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
  mime: {
    description: 'Override MIME type detection. Useful when extension is missing or wrong.',
    type: 'string',
    required: false,
  },
  parser: {
    description: 'Use this npm package as parser for the detected MIME type, overriding any configured parser.',
    type: 'string',
    required: false,
  },
}}
/>

Image options (PDF inputs) [#image-options-pdf-inputs]

<TypeTable
  type={{
  images: {
    description: 'Extract embedded images from PDFs and include them in the artifact.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
  screenshots: {
    description: 'Render each PDF page as a screenshot image.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}}
/>

<Callout type="info">
  For custom screenshot dimensions, use \`struktur parse --screenshots --screenshot-scale <num>\` and pipe the artifact to \`struktur extract --artifact-file -\`.
</Callout>

Strategy [#strategy]

<TypeTable
  type={{
  strategy: {
    description: 'Strategy name.',
    type: 'string',
    default: 'simple',
    required: false,
  },
  'chunk-size': {
    description: 'Token budget per batch.',
    type: 'number',
    default: '10000',
    required: false,
  },
  strict: {
    description: 'Enforce required-field validation on every step, not just the final one. Useful for single-chunk inputs where partial data is never expected.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}}
/>

Strategy names: \`simple\`, \`parallel\`, \`sequential\`, \`parallelAutoMerge\`, \`sequentialAutoMerge\`, \`doublePass\`, \`doublePassAutoMerge\`.

<Callout type="info">
  When using \`--strategy\` other than \`simple\`, both \`model\` and \`mergeModel\`/\`dedupeModel\` are set to the same model. For different models per role, use the TypeScript SDK.
</Callout>

Output [#output]

<TypeTable
  type={{
  output: {
    description: 'Write JSON to file or stdout (-).',
    type: 'string',
    default: '- (stdout)',
    required: false,
  },
  debug: {
    description: 'Enable verbose JSON debug logging to stderr. Shows model resolution, artifact loading, schema details, and per-step LLM events.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}}
/>

Progress [#progress]

When stderr is a TTY, a progress bar is shown:

\`\`\`
◈ ▰▰▰▰▰▱▱▱▱▱ 50% | batch 2/5
\`\`\`

The bar is suppressed in non-interactive mode (piped stderr).

Examples [#examples]

<Tabs items={['Fields shorthand', 'PDF input', 'PDF with images', 'Screenshots', 'Inline schema', 'Stdin', 'Parallel strategy', 'MIME override', 'Custom parser', 'Schema from URL', 'Debug mode']}>
  <Tab value="Fields shorthand">
    \`\`\`bash
    echo "Invoice #1042 from Acme Corp. Total: $2,400.00." | \\
      struktur --stdin -f "invoice_number, vendor, total:number" \\
      --model openai/gpt-4o-mini
    \`\`\`
  </Tab>

  <Tab value="PDF input">
    \`\`\`bash
    struktur --input invoice.pdf \\
      --fields "invoice_number, vendor, total:number" \\
      --model openai/gpt-4o-mini
    \`\`\`
  </Tab>

  <Tab value="PDF with images">
    \`\`\`bash
    struktur --input invoice.pdf --images \\
      --schema invoice-schema.json \\
      --model openai/gpt-4o
    \`\`\`
  </Tab>

  <Tab value="Screenshots">
    \`\`\`bash
    # Use parse for custom screenshot settings, then pipe to extract
    struktur parse --input slides.pdf --screenshots --screenshot-scale 2 | \\
      struktur --artifact-file - \\
      --fields "title, slide_count:integer" \\
      --model openai/gpt-4o
    \`\`\`
  </Tab>

  <Tab value="Inline schema">
    \`\`\`bash
    struktur --input report.txt \\
      --schema-json '{"type":"object","properties":{"summary":{"type":"string"}},"required":["summary"],"additionalProperties":false}' \\
      --model openai/gpt-4o-mini
    \`\`\`
  </Tab>

  <Tab value="Stdin">
    \`\`\`bash
    cat document.md | struktur --stdin --schema schema.json --model anthropic/claude-3-5-haiku-20241022
    \`\`\`
  </Tab>

  <Tab value="Parallel strategy">
    \`\`\`bash
    struktur --input large.md --schema schema.json --model openai/gpt-4o \\
      --strategy parallel --output result.json
    \`\`\`
  </Tab>

  <Tab value="MIME override">
    \`\`\`bash
    struktur --input data.bin --mime application/pdf \\
      --fields "title, author" --model openai/gpt-4o-mini
    \`\`\`
  </Tab>

  <Tab value="Custom parser">
    \`\`\`bash
    struktur --input report.docx --parser @myorg/docx-parser \\
      --fields "title, summary" --model openai/gpt-4o-mini
    \`\`\`
  </Tab>

  <Tab value="Schema from URL">
    \`\`\`bash
    struktur --input data.txt --schema https://myserver.com/schemas/invoice.json --model openai/gpt-4o-mini
    \`\`\`
  </Tab>

  <Tab value="Debug mode">
    \`\`\`bash
    struktur --input doc.pdf --fields "title" --model openai/gpt-4o-mini --debug
    \`\`\`
  </Tab>
</Tabs>

See also [#see-also]

* [--fields reference](/docs/cli/fields) — fields shorthand syntax and examples
* [parse](/docs/cli/parse) — convert files to artifact JSON for inspection
* [config](/docs/cli/config) — provider and model management
* [Document Parsing](/docs/explanation/document-parsing) — how file parsing works
* [Strategies](/docs/explanation/strategies) — strategy reference
`,o={title:"extract",description:"Main extraction command for Struktur CLI."},c={contents:[{heading:"synopsis",content:"`extract` is the default command — `struktur --input file.pdf ...` and `struktur extract --input file.pdf ...` are equivalent."},{heading:"input-options-exactly-one-required",content:`<TypeTable
  type="{
  input: {
    description: 'Read from a file path. MIME type auto-detected from magic bytes and file extension.',
    type: 'string',
    required: false,
  },
  stdin: {
    description: 'Read from stdin. Auto-detects artifact JSON or raw text. Auto-detected when piped with no other input flag.',
    type: 'boolean',
    required: false,
  },
  text: {
    description: 'Use inline text as input.',
    type: 'string',
    required: false,
  },
  'artifact-file': {
    description: 'Read pre-built artifact JSON from file path or HTTP(S) URL.',
    type: 'string',
    required: false,
  },
  'artifact-json': {
    description: 'Inline artifact JSON string.',
    type: 'string',
    required: false,
  },
}"
/>`},{heading:"schema-options-exactly-one-required",content:`<TypeTable
  type="{
  schema: {
    description: 'JSON Schema file path or HTTP(S) URL.',
    type: 'string',
    required: false,
  },
  'schema-json': {
    description: 'Inline JSON Schema string.',
    type: 'string',
    required: false,
  },
  fields: {
    description: 'Fields shorthand — comma-separated field definitions. See Fields reference.',
    type: 'string',
    required: false,
  },
}"
/>`},{heading:"schema-options-exactly-one-required",content:"`--fields` is the quickest way to define a schema without writing JSON. See --fields reference for the full syntax."},{heading:"model",content:`<TypeTable
  type="{
  model: {
    description: 'Model spec in provider/model format, or a stored alias.',
    type: 'string',
    default: 'configured default',
    required: false,
  },
}"
/>`},{heading:"model",content:"Supported providers: `openai`, `anthropic`, `google`, `opencode`, `openrouter`."},{heading:"model",content:"For OpenRouter, you can specify a preferred inference provider using `#` syntax:"},{heading:"parsing-options",content:"These flags control how `--input` files are parsed before extraction."},{heading:"parsing-options",content:`<TypeTable
  type="{
  'no-parse': {
    description: 'Skip custom parsers; use only built-in text/image/artifact-JSON detection. Ignores any parsers configured via config parsers add.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
  mime: {
    description: 'Override MIME type detection. Useful when extension is missing or wrong.',
    type: 'string',
    required: false,
  },
  parser: {
    description: 'Use this npm package as parser for the detected MIME type, overriding any configured parser.',
    type: 'string',
    required: false,
  },
}"
/>`},{heading:"image-options-pdf-inputs",content:`<TypeTable
  type="{
  images: {
    description: 'Extract embedded images from PDFs and include them in the artifact.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
  screenshots: {
    description: 'Render each PDF page as a screenshot image.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}"
/>`},{heading:"image-options-pdf-inputs",content:"For custom screenshot dimensions, use `struktur parse --screenshots --screenshot-scale <num>` and pipe the artifact to `struktur extract --artifact-file -`."},{heading:"strategy",content:`<TypeTable
  type="{
  strategy: {
    description: 'Strategy name.',
    type: 'string',
    default: 'simple',
    required: false,
  },
  'chunk-size': {
    description: 'Token budget per batch.',
    type: 'number',
    default: '10000',
    required: false,
  },
  strict: {
    description: 'Enforce required-field validation on every step, not just the final one. Useful for single-chunk inputs where partial data is never expected.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}"
/>`},{heading:"strategy",content:"Strategy names: `simple`, `parallel`, `sequential`, `parallelAutoMerge`, `sequentialAutoMerge`, `doublePass`, `doublePassAutoMerge`."},{heading:"strategy",content:"When using `--strategy` other than `simple`, both `model` and `mergeModel`/`dedupeModel` are set to the same model. For different models per role, use the TypeScript SDK."},{heading:"output",content:`<TypeTable
  type="{
  output: {
    description: 'Write JSON to file or stdout (-).',
    type: 'string',
    default: '- (stdout)',
    required: false,
  },
  debug: {
    description: 'Enable verbose JSON debug logging to stderr. Shows model resolution, artifact loading, schema details, and per-step LLM events.',
    type: 'boolean',
    default: 'false',
    required: false,
  },
}"
/>`},{heading:"progress",content:"When stderr is a TTY, a progress bar is shown:"},{heading:"progress",content:"The bar is suppressed in non-interactive mode (piped stderr)."},{heading:"see-also",content:"\\--fields reference — fields shorthand syntax and examples"},{heading:"see-also",content:"parse — convert files to artifact JSON for inspection"},{heading:"see-also",content:"config — provider and model management"},{heading:"see-also",content:"Document Parsing — how file parsing works"},{heading:"see-also",content:"Strategies — strategy reference"}],headings:[{id:"synopsis",content:"Synopsis"},{id:"input-options-exactly-one-required",content:"Input options (exactly one required)"},{id:"schema-options-exactly-one-required",content:"Schema options (exactly one required)"},{id:"model",content:"Model"},{id:"parsing-options",content:"Parsing options"},{id:"image-options-pdf-inputs",content:"Image options (PDF inputs)"},{id:"strategy",content:"Strategy"},{id:"output",content:"Output"},{id:"progress",content:"Progress"},{id:"examples",content:"Examples"},{id:"see-also",content:"See also"}]};const p=[{depth:2,url:"#synopsis",title:e.jsx(e.Fragment,{children:"Synopsis"})},{depth:2,url:"#input-options-exactly-one-required",title:e.jsx(e.Fragment,{children:"Input options (exactly one required)"})},{depth:2,url:"#schema-options-exactly-one-required",title:e.jsx(e.Fragment,{children:"Schema options (exactly one required)"})},{depth:2,url:"#model",title:e.jsx(e.Fragment,{children:"Model"})},{depth:2,url:"#parsing-options",title:e.jsx(e.Fragment,{children:"Parsing options"})},{depth:2,url:"#image-options-pdf-inputs",title:e.jsx(e.Fragment,{children:"Image options (PDF inputs)"})},{depth:2,url:"#strategy",title:e.jsx(e.Fragment,{children:"Strategy"})},{depth:2,url:"#output",title:e.jsx(e.Fragment,{children:"Output"})},{depth:2,url:"#progress",title:e.jsx(e.Fragment,{children:"Progress"})},{depth:2,url:"#examples",title:e.jsx(e.Fragment,{children:"Examples"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function a(t){const i={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"synopsis",children:"Synopsis"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [extract] [options]"})]})})})}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"extract"})," is the default command — ",e.jsx(i.code,{children:"struktur --input file.pdf ..."})," and ",e.jsx(i.code,{children:"struktur extract --input file.pdf ..."})," are equivalent."]}),`
`,e.jsx(i.h2,{id:"input-options-exactly-one-required",children:"Input options (exactly one required)"}),`
`,e.jsx(n,{type:{input:{description:"Read from a file path. MIME type auto-detected from magic bytes and file extension.",type:"string",required:!1},stdin:{description:"Read from stdin. Auto-detects artifact JSON or raw text. Auto-detected when piped with no other input flag.",type:"boolean",required:!1},text:{description:"Use inline text as input.",type:"string",required:!1},"artifact-file":{description:"Read pre-built artifact JSON from file path or HTTP(S) URL.",type:"string",required:!1},"artifact-json":{description:"Inline artifact JSON string.",type:"string",required:!1}}}),`
`,e.jsx(i.h2,{id:"schema-options-exactly-one-required",children:"Schema options (exactly one required)"}),`
`,e.jsx(n,{type:{schema:{description:"JSON Schema file path or HTTP(S) URL.",type:"string",required:!1},"schema-json":{description:"Inline JSON Schema string.",type:"string",required:!1},fields:{description:"Fields shorthand — comma-separated field definitions. See Fields reference.",type:"string",required:!1}}}),`
`,e.jsx(r,{type:"info",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"--fields"})," is the quickest way to define a schema without writing JSON. See ",e.jsx(i.a,{href:"/docs/cli/fields",children:"--fields reference"})," for the full syntax."]})}),`
`,e.jsx(i.h2,{id:"model",children:"Model"}),`
`,e.jsx(n,{type:{model:{description:"Model spec in provider/model format, or a stored alias.",type:"string",default:"configured default",required:!1}}}),`
`,e.jsxs(i.p,{children:["Supported providers: ",e.jsx(i.code,{children:"openai"}),", ",e.jsx(i.code,{children:"anthropic"}),", ",e.jsx(i.code,{children:"google"}),", ",e.jsx(i.code,{children:"opencode"}),", ",e.jsx(i.code,{children:"openrouter"}),"."]}),`
`,e.jsxs(i.p,{children:["For OpenRouter, you can specify a preferred inference provider using ",e.jsx(i.code,{children:"#"})," syntax:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "openrouter/anthropic/claude-3.5-sonnet#cerebras"'})]})})})}),`
`,e.jsx(i.h2,{id:"parsing-options",children:"Parsing options"}),`
`,e.jsxs(i.p,{children:["These flags control how ",e.jsx(i.code,{children:"--input"})," files are parsed before extraction."]}),`
`,e.jsx(n,{type:{"no-parse":{description:"Skip custom parsers; use only built-in text/image/artifact-JSON detection. Ignores any parsers configured via config parsers add.",type:"boolean",default:"false",required:!1},mime:{description:"Override MIME type detection. Useful when extension is missing or wrong.",type:"string",required:!1},parser:{description:"Use this npm package as parser for the detected MIME type, overriding any configured parser.",type:"string",required:!1}}}),`
`,e.jsx(i.h2,{id:"image-options-pdf-inputs",children:"Image options (PDF inputs)"}),`
`,e.jsx(n,{type:{images:{description:"Extract embedded images from PDFs and include them in the artifact.",type:"boolean",default:"false",required:!1},screenshots:{description:"Render each PDF page as a screenshot image.",type:"boolean",default:"false",required:!1}}}),`
`,e.jsx(r,{type:"info",children:e.jsxs(i.p,{children:["For custom screenshot dimensions, use ",e.jsx(i.code,{children:"struktur parse --screenshots --screenshot-scale <num>"})," and pipe the artifact to ",e.jsx(i.code,{children:"struktur extract --artifact-file -"}),"."]})}),`
`,e.jsx(i.h2,{id:"strategy",children:"Strategy"}),`
`,e.jsx(n,{type:{strategy:{description:"Strategy name.",type:"string",default:"simple",required:!1},"chunk-size":{description:"Token budget per batch.",type:"number",default:"10000",required:!1},strict:{description:"Enforce required-field validation on every step, not just the final one. Useful for single-chunk inputs where partial data is never expected.",type:"boolean",default:"false",required:!1}}}),`
`,e.jsxs(i.p,{children:["Strategy names: ",e.jsx(i.code,{children:"simple"}),", ",e.jsx(i.code,{children:"parallel"}),", ",e.jsx(i.code,{children:"sequential"}),", ",e.jsx(i.code,{children:"parallelAutoMerge"}),", ",e.jsx(i.code,{children:"sequentialAutoMerge"}),", ",e.jsx(i.code,{children:"doublePass"}),", ",e.jsx(i.code,{children:"doublePassAutoMerge"}),"."]}),`
`,e.jsx(r,{type:"info",children:e.jsxs(i.p,{children:["When using ",e.jsx(i.code,{children:"--strategy"})," other than ",e.jsx(i.code,{children:"simple"}),", both ",e.jsx(i.code,{children:"model"})," and ",e.jsx(i.code,{children:"mergeModel"}),"/",e.jsx(i.code,{children:"dedupeModel"})," are set to the same model. For different models per role, use the TypeScript SDK."]})}),`
`,e.jsx(i.h2,{id:"output",children:"Output"}),`
`,e.jsx(n,{type:{output:{description:"Write JSON to file or stdout (-).",type:"string",default:"- (stdout)",required:!1},debug:{description:"Enable verbose JSON debug logging to stderr. Shows model resolution, artifact loading, schema details, and per-step LLM events.",type:"boolean",default:"false",required:!1}}}),`
`,e.jsx(i.h2,{id:"progress",children:"Progress"}),`
`,e.jsx(i.p,{children:"When stderr is a TTY, a progress bar is shown:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"◈ ▰▰▰▰▰▱▱▱▱▱ 50% | batch 2/5"})})})})}),`
`,e.jsx(i.p,{children:"The bar is suppressed in non-interactive mode (piped stderr)."}),`
`,e.jsx(i.h2,{id:"examples",children:"Examples"}),`
`,e.jsxs(l,{items:["Fields shorthand","PDF input","PDF with images","Screenshots","Inline schema","Stdin","Parallel strategy","MIME override","Custom parser","Schema from URL","Debug mode"],children:[e.jsx(s,{value:"Fields shorthand",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Invoice #1042 from Acme Corp. Total: '}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"$2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:',400.00."'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -f"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "invoice_number, vendor, total:number"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})})}),e.jsx(s,{value:"PDF input",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "invoice_number, vendor, total:number"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})})}),e.jsx(s,{value:"PDF with images",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --images"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice-schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o"})]})]})})})}),e.jsx(s,{value:"Screenshots",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Use parse for custom screenshot settings, then pipe to extract"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" slides.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --screenshots"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --screenshot-scale"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --artifact-file"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "title, slide_count:integer"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o"})]})]})})})}),e.jsx(s,{value:"Inline schema",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" report.txt"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --schema-json"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:` '{"type":"object","properties":{"summary":{"type":"string"}},"required":["summary"],"additionalProperties":false}'`}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})})}),e.jsx(s,{value:"Stdin",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cat"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" document.md"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" anthropic/claude-3-5-haiku-20241022"})]})})})})}),e.jsx(s,{value:"Parallel strategy",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" large.md"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --strategy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parallel"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" result.json"})]})]})})})}),e.jsx(s,{value:"MIME override",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data.bin"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --mime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" application/pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "title, author"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})})}),e.jsx(s,{value:"Custom parser",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" report.docx"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --parser"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @myorg/docx-parser"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "title, summary"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})})}),e.jsx(s,{value:"Schema from URL",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data.txt"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --schema"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://myserver.com/schemas/invoice.json"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})})}),e.jsx(s,{value:"Debug mode",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doc.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "title"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --debug"})]})})})})})]}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/fields",children:"--fields reference"})," — fields shorthand syntax and examples"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/parse",children:"parse"})," — convert files to artifact JSON for inspection"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/config",children:"config"})," — provider and model management"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/document-parsing",children:"Document Parsing"})," — how file parsing works"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/strategies",children:"Strategies"})," — strategy reference"]}),`
`]})]})}function u(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(a,{...t})}):a(t)}export{h as _markdown,u as default,o as frontmatter,c as structuredData,p as toc};
