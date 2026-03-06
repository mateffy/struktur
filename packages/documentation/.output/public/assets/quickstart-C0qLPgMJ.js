import{j as e}from"./main-BI0ZjDJr.js";let a=`

Extract structured data from any file in 3 commands. About 5 minutes.

> **Using an AI assistant?** Point it at \`https://struktur.sh/llms.txt\` for LLM-optimized docs, or install the [Agent Skill](/docs/skill) for built-in Struktur knowledge.

Prerequisites [#prerequisites]

* Node.js 18+ or Bun installed
* An API key from OpenAI, Anthropic, Google, OpenCode, or OpenRouter

Step 1: Install [#step-1-install]

\`\`\`bash
# Using npm
npm install -g @struktur/cli

# Or using Bun (recommended)
bun install -g @struktur/cli
\`\`\`

Verify:

\`\`\`bash
struktur --help
\`\`\`

You should see the usage output.

Step 2: Configure your API key [#step-2-configure-your-api-key]

Store your API key securely with the CLI:

\`\`\`bash
echo "sk-..." | struktur config providers add openai --token-stdin --default
\`\`\`

The \`--default\` flag automatically queries the provider API and sets the cheapest available model as default, so \`--model\` becomes optional in all future commands.

Output: \`{ "provider": "openai", "stored": "keychain" }\` (or \`"file"\` on Linux).

Set a default model (if not using --default) [#set-a-default-model-if-not-using---default]

\`\`\`bash
struktur config models use openai/gpt-4o-mini
\`\`\`

Once set, \`--model\` is optional in all \`extract\` commands.

Step 3: Extract your first data [#step-3-extract-your-first-data]

**From text:**

\`\`\`bash
echo "Invoice #1042 from Acme Corp. Total: $2,400.00. Due: April 1, 2026." | \\
  struktur --stdin \\
  --fields "invoice_number, vendor, total:number, due_date" \\
  --model openai/gpt-4o-mini
\`\`\`

**From a PDF directly:**

\`\`\`bash
struktur --input invoice.pdf \\
  --fields "invoice_number, vendor, total:number, due_date" \\
  --model openai/gpt-4o-mini
\`\`\`

The \`--fields\` flag builds a JSON Schema on the fly. Each field defaults to \`string\`; append \`:number\`, \`:integer\`, \`:bool\`, etc. to set the type. See [Fields Shorthand](/docs/cli/fields) for the full syntax.

If you need more control (optional fields, nested objects), pass a full schema instead:

\`\`\`bash
struktur --input invoice.pdf \\
  --schema-json '{"type":"object","properties":{"invoice_number":{"type":"string"},"vendor":{"type":"string"},"total":{"type":"number"},"due_date":{"type":"string"}},"required":["invoice_number","vendor","total","due_date"],"additionalProperties":false}' \\
  --model openai/gpt-4o-mini
\`\`\`

Notice that \`total\` is a number, not a string — Struktur enforced the schema.

What happened? [#what-happened]

For the text example, stdin input was loaded as an artifact, the LLM generated output, and it was validated against your schema. The \`simple\` strategy handled this in a single LLM call.

For the PDF example, an extra step happened first: the built-in PDF parser extracted text (and optionally images) from the file and converted it into an artifact, then extraction proceeded as normal. Add \`--images\` to include embedded images, or \`--screenshots\` to render page screenshots.

To understand what happened inside, read [The Extraction Pipeline](/docs/explanation/pipeline).

Where to go next [#where-to-go-next]

| Goal                    | Link                                                   |
| ----------------------- | ------------------------------------------------------ |
| Keep learning           | [The Extraction Pipeline](/docs/explanation/pipeline)  |
| Solve a real problem    | [Extract Invoice Data](/docs/examples/extract-invoice) |
| Look up all CLI flags   | [CLI Reference](/docs/cli/extract)                     |
| Use it in TypeScript    | [TypeScript SDK](/docs/sdk/installation)               |
| Understand file parsing | [Document Parsing](/docs/explanation/document-parsing) |
`,r={title:"Quickstart",description:"Get started with Struktur in under 5 minutes. Extract structured data from any file."},l={contents:[{heading:void 0,content:"Extract structured data from any file in 3 commands. About 5 minutes."},{heading:void 0,content:"> **Using an AI assistant?** Point it at `https://struktur.sh/llms.txt` for LLM-optimized docs, or install the Agent Skill for built-in Struktur knowledge."},{heading:"prerequisites",content:"Node.js 18+ or Bun installed"},{heading:"prerequisites",content:"An API key from OpenAI, Anthropic, Google, OpenCode, or OpenRouter"},{heading:"step-1-install",content:"Verify:"},{heading:"step-1-install",content:"You should see the usage output."},{heading:"step-2-configure-your-api-key",content:"Store your API key securely with the CLI:"},{heading:"step-2-configure-your-api-key",content:"The `--default` flag automatically queries the provider API and sets the cheapest available model as default, so `--model` becomes optional in all future commands."},{heading:"step-2-configure-your-api-key",content:'Output: `{ "provider": "openai", "stored": "keychain" }` (or `"file"` on Linux).'},{heading:"set-a-default-model-if-not-using---default",content:"Once set, `--model` is optional in all `extract` commands."},{heading:"step-3-extract-your-first-data",content:"**From text:**"},{heading:"step-3-extract-your-first-data",content:"**From a PDF directly:**"},{heading:"step-3-extract-your-first-data",content:"The `--fields` flag builds a JSON Schema on the fly. Each field defaults to `string`; append `:number`, `:integer`, `:bool`, etc. to set the type. See Fields Shorthand for the full syntax."},{heading:"step-3-extract-your-first-data",content:"If you need more control (optional fields, nested objects), pass a full schema instead:"},{heading:"step-3-extract-your-first-data",content:"Notice that `total` is a number, not a string — Struktur enforced the schema."},{heading:"what-happened",content:"For the text example, stdin input was loaded as an artifact, the LLM generated output, and it was validated against your schema. The `simple` strategy handled this in a single LLM call."},{heading:"what-happened",content:"For the PDF example, an extra step happened first: the built-in PDF parser extracted text (and optionally images) from the file and converted it into an artifact, then extraction proceeded as normal. Add `--images` to include embedded images, or `--screenshots` to render page screenshots."},{heading:"what-happened",content:"To understand what happened inside, read The Extraction Pipeline."},{heading:"where-to-go-next",content:"Goal"},{heading:"where-to-go-next",content:"Link"},{heading:"where-to-go-next",content:"Keep learning"},{heading:"where-to-go-next",content:"The Extraction Pipeline"},{heading:"where-to-go-next",content:"Solve a real problem"},{heading:"where-to-go-next",content:"Extract Invoice Data"},{heading:"where-to-go-next",content:"Look up all CLI flags"},{heading:"where-to-go-next",content:"CLI Reference"},{heading:"where-to-go-next",content:"Use it in TypeScript"},{heading:"where-to-go-next",content:"TypeScript SDK"},{heading:"where-to-go-next",content:"Understand file parsing"},{heading:"where-to-go-next",content:"Document Parsing"}],headings:[{id:"prerequisites",content:"Prerequisites"},{id:"step-1-install",content:"Step 1: Install"},{id:"step-2-configure-your-api-key",content:"Step 2: Configure your API key"},{id:"set-a-default-model-if-not-using---default",content:"Set a default model (if not using --default)"},{id:"step-3-extract-your-first-data",content:"Step 3: Extract your first data"},{id:"what-happened",content:"What happened?"},{id:"where-to-go-next",content:"Where to go next"}]};const d=[{depth:2,url:"#prerequisites",title:e.jsx(e.Fragment,{children:"Prerequisites"})},{depth:2,url:"#step-1-install",title:e.jsx(e.Fragment,{children:"Step 1: Install"})},{depth:2,url:"#step-2-configure-your-api-key",title:e.jsx(e.Fragment,{children:"Step 2: Configure your API key"})},{depth:3,url:"#set-a-default-model-if-not-using---default",title:e.jsx(e.Fragment,{children:"Set a default model (if not using --default)"})},{depth:2,url:"#step-3-extract-your-first-data",title:e.jsx(e.Fragment,{children:"Step 3: Extract your first data"})},{depth:2,url:"#what-happened",title:e.jsx(e.Fragment,{children:"What happened?"})},{depth:2,url:"#where-to-go-next",title:e.jsx(e.Fragment,{children:"Where to go next"})}];function n(t){const i={a:"a",blockquote:"blockquote",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Extract structured data from any file in 3 commands. About 5 minutes."}),`
`,e.jsxs(i.blockquote,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Using an AI assistant?"})," Point it at ",e.jsx(i.code,{children:"https://struktur.sh/llms.txt"})," for LLM-optimized docs, or install the ",e.jsx(i.a,{href:"/docs/skill",children:"Agent Skill"})," for built-in Struktur knowledge."]}),`
`]}),`
`,e.jsx(i.h2,{id:"prerequisites",children:"Prerequisites"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Node.js 18+ or Bun installed"}),`
`,e.jsx(i.li,{children:"An API key from OpenAI, Anthropic, Google, OpenCode, or OpenRouter"}),`
`]}),`
`,e.jsx(i.h2,{id:"step-1-install",children:"Step 1: Install"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Using npm"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/cli"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Or using Bun (recommended)"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/cli"})]})]})})}),`
`,e.jsx(i.p,{children:"Verify:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --help"})]})})})}),`
`,e.jsx(i.p,{children:"You should see the usage output."}),`
`,e.jsx(i.h2,{id:"step-2-configure-your-api-key",children:"Step 2: Configure your API key"}),`
`,e.jsx(i.p,{children:"Store your API key securely with the CLI:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "sk-..."'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" providers"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token-stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --default"})]})})})}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"--default"})," flag automatically queries the provider API and sets the cheapest available model as default, so ",e.jsx(i.code,{children:"--model"})," becomes optional in all future commands."]}),`
`,e.jsxs(i.p,{children:["Output: ",e.jsx(i.code,{children:'{ "provider": "openai", "stored": "keychain" }'})," (or ",e.jsx(i.code,{children:'"file"'})," on Linux)."]}),`
`,e.jsx(i.h3,{id:"set-a-default-model-if-not-using---default",children:"Set a default model (if not using --default)"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})})})}),`
`,e.jsxs(i.p,{children:["Once set, ",e.jsx(i.code,{children:"--model"})," is optional in all ",e.jsx(i.code,{children:"extract"})," commands."]}),`
`,e.jsx(i.h2,{id:"step-3-extract-your-first-data",children:"Step 3: Extract your first data"}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"From text:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Invoice #1042 from Acme Corp. Total: '}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"$2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:',400.00. Due: April 1, 2026."'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "invoice_number, vendor, total:number, due_date"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"From a PDF directly:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "invoice_number, vendor, total:number, due_date"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"--fields"})," flag builds a JSON Schema on the fly. Each field defaults to ",e.jsx(i.code,{children:"string"}),"; append ",e.jsx(i.code,{children:":number"}),", ",e.jsx(i.code,{children:":integer"}),", ",e.jsx(i.code,{children:":bool"}),", etc. to set the type. See ",e.jsx(i.a,{href:"/docs/cli/fields",children:"Fields Shorthand"})," for the full syntax."]}),`
`,e.jsx(i.p,{children:"If you need more control (optional fields, nested objects), pass a full schema instead:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --schema-json"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:` '{"type":"object","properties":{"invoice_number":{"type":"string"},"vendor":{"type":"string"},"total":{"type":"number"},"due_date":{"type":"string"}},"required":["invoice_number","vendor","total","due_date"],"additionalProperties":false}'`}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,e.jsxs(i.p,{children:["Notice that ",e.jsx(i.code,{children:"total"})," is a number, not a string — Struktur enforced the schema."]}),`
`,e.jsx(i.h2,{id:"what-happened",children:"What happened?"}),`
`,e.jsxs(i.p,{children:["For the text example, stdin input was loaded as an artifact, the LLM generated output, and it was validated against your schema. The ",e.jsx(i.code,{children:"simple"})," strategy handled this in a single LLM call."]}),`
`,e.jsxs(i.p,{children:["For the PDF example, an extra step happened first: the built-in PDF parser extracted text (and optionally images) from the file and converted it into an artifact, then extraction proceeded as normal. Add ",e.jsx(i.code,{children:"--images"})," to include embedded images, or ",e.jsx(i.code,{children:"--screenshots"})," to render page screenshots."]}),`
`,e.jsxs(i.p,{children:["To understand what happened inside, read ",e.jsx(i.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"}),"."]}),`
`,e.jsx(i.h2,{id:"where-to-go-next",children:"Where to go next"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Goal"}),e.jsx(i.th,{children:"Link"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Keep learning"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Solve a real problem"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/examples/extract-invoice",children:"Extract Invoice Data"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Look up all CLI flags"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/cli/extract",children:"CLI Reference"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Use it in TypeScript"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/sdk/installation",children:"TypeScript SDK"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Understand file parsing"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/explanation/document-parsing",children:"Document Parsing"})})]})]})]})]})}function h(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(n,{...t})}):n(t)}export{a as _markdown,h as default,r as frontmatter,l as structuredData,d as toc};
