import{j as e}from"./main-CY4pAMb7.js";let r=`

Extract structured data from any file in 3 commands. About 5 minutes.

What we'll build [#what-well-build]

We will extract structured invoice data from a text string using the CLI.

Expected output:

\`\`\`json
{
  "invoice_number": "1042",
  "vendor": "Acme Corp",
  "total": 2400,
  "due_date": "April 1, 2026"
}
\`\`\`

Prerequisites [#prerequisites]

* Node.js 18+ or Bun installed
* An API key from OpenAI, Anthropic, or Google

Step 1: Install [#step-1-install]

\`\`\`bash
# Using npm
npm install -g @mateffy/struktur

# Or using Bun (recommended)
bun install -g @mateffy/struktur
\`\`\`

Verify:

\`\`\`bash
struktur --help
\`\`\`

You should see the usage output.

Step 2: Configure your API key [#step-2-configure-your-api-key]

**Option A (quick, for testing):**

\`\`\`bash
export OPENAI_API_KEY=sk-...
\`\`\`

**Option B (secure, persisted):**

\`\`\`bash
echo "sk-..." | struktur auth set --provider openai --token-stdin
\`\`\`

Output: \`{ "provider": "openai", "stored": "keychain" }\` (or \`"file"\` on Linux).

Step 3: Extract your first data [#step-3-extract-your-first-data]

\`\`\`bash
echo "Invoice #1042 from Acme Corp. Total: $2,400.00. Due: April 1, 2026." | \\
  struktur --stdin \\
  --fields "invoice_number, vendor, total:number, due_date" \\
  --model openai/gpt-4o-mini
\`\`\`

The \`--fields\` flag builds a JSON Schema on the fly. Each field defaults to \`string\`; append \`:number\`, \`:integer\`, \`:bool\`, etc. to set the type. See [--fields reference](/docs/cli/fields) for the full syntax.

If you need more control (optional fields, nested objects), pass a full schema instead:

\`\`\`bash
echo "Invoice #1042 from Acme Corp. Total: $2,400.00. Due: April 1, 2026." | \\
struktur --stdin \\
--schema-json '{"type":"object","properties":{"invoice_number":{"type":"string"},"vendor":{"type":"string"},"total":{"type":"number"},"due_date":{"type":"string"}},"required":["invoice_number","vendor","total","due_date"],"additionalProperties":false}' \\
--model openai/gpt-4o-mini
\`\`\`

Notice that \`total\` is a number, not a string — Struktur enforced the schema.

What happened? [#what-happened]

Three things: stdin input was loaded as an artifact, the LLM generated output, and Ajv validated it against your schema. The \`simple\` strategy handled this in a single LLM call.

To understand what happened inside, read [The Extraction Pipeline](/docs/explanation/pipeline).

Where to go next [#where-to-go-next]

| Goal                  | Link                                                   |
| --------------------- | ------------------------------------------------------ |
| Keep learning         | [The Extraction Pipeline](/docs/explanation/pipeline)  |
| Solve a real problem  | [Extract Invoice Data](/docs/examples/extract-invoice) |
| Look up all CLI flags | [CLI Reference](/docs/cli/extract)                     |
| Use it in TypeScript  | [TypeScript SDK](/docs/sdk/installation)               |
`,a={title:"Quickstart",description:"Get started with Struktur in under 5 minutes. Extract structured data from any file."},h={contents:[{heading:void 0,content:"Extract structured data from any file in 3 commands. About 5 minutes."},{heading:"what-well-build",content:"We will extract structured invoice data from a text string using the CLI."},{heading:"what-well-build",content:"Expected output:"},{heading:"prerequisites",content:"Node.js 18+ or Bun installed"},{heading:"prerequisites",content:"An API key from OpenAI, Anthropic, or Google"},{heading:"step-1-install",content:"Verify:"},{heading:"step-1-install",content:"You should see the usage output."},{heading:"step-2-configure-your-api-key",content:"**Option A (quick, for testing):**"},{heading:"step-2-configure-your-api-key",content:"**Option B (secure, persisted):**"},{heading:"step-2-configure-your-api-key",content:'Output: `{ "provider": "openai", "stored": "keychain" }` (or `"file"` on Linux).'},{heading:"step-3-extract-your-first-data",content:"The `--fields` flag builds a JSON Schema on the fly. Each field defaults to `string`; append `:number`, `:integer`, `:bool`, etc. to set the type. See --fields reference for the full syntax."},{heading:"step-3-extract-your-first-data",content:"If you need more control (optional fields, nested objects), pass a full schema instead:"},{heading:"step-3-extract-your-first-data",content:"Notice that `total` is a number, not a string — Struktur enforced the schema."},{heading:"what-happened",content:"Three things: stdin input was loaded as an artifact, the LLM generated output, and Ajv validated it against your schema. The `simple` strategy handled this in a single LLM call."},{heading:"what-happened",content:"To understand what happened inside, read The Extraction Pipeline."},{heading:"where-to-go-next",content:"Goal"},{heading:"where-to-go-next",content:"Link"},{heading:"where-to-go-next",content:"Keep learning"},{heading:"where-to-go-next",content:"The Extraction Pipeline"},{heading:"where-to-go-next",content:"Solve a real problem"},{heading:"where-to-go-next",content:"Extract Invoice Data"},{heading:"where-to-go-next",content:"Look up all CLI flags"},{heading:"where-to-go-next",content:"CLI Reference"},{heading:"where-to-go-next",content:"Use it in TypeScript"},{heading:"where-to-go-next",content:"TypeScript SDK"}],headings:[{id:"what-well-build",content:"What we'll build"},{id:"prerequisites",content:"Prerequisites"},{id:"step-1-install",content:"Step 1: Install"},{id:"step-2-configure-your-api-key",content:"Step 2: Configure your API key"},{id:"step-3-extract-your-first-data",content:"Step 3: Extract your first data"},{id:"what-happened",content:"What happened?"},{id:"where-to-go-next",content:"Where to go next"}]};const l=[{depth:2,url:"#what-well-build",title:e.jsx(e.Fragment,{children:"What we'll build"})},{depth:2,url:"#prerequisites",title:e.jsx(e.Fragment,{children:"Prerequisites"})},{depth:2,url:"#step-1-install",title:e.jsx(e.Fragment,{children:"Step 1: Install"})},{depth:2,url:"#step-2-configure-your-api-key",title:e.jsx(e.Fragment,{children:"Step 2: Configure your API key"})},{depth:2,url:"#step-3-extract-your-first-data",title:e.jsx(e.Fragment,{children:"Step 3: Extract your first data"})},{depth:2,url:"#what-happened",title:e.jsx(e.Fragment,{children:"What happened?"})},{depth:2,url:"#where-to-go-next",title:e.jsx(e.Fragment,{children:"Where to go next"})}];function t(s){const i={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Extract structured data from any file in 3 commands. About 5 minutes."}),`
`,e.jsx(i.h2,{id:"what-well-build",children:"What we'll build"}),`
`,e.jsx(i.p,{children:"We will extract structured invoice data from a text string using the CLI."}),`
`,e.jsx(i.p,{children:"Expected output:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "invoice_number"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1042"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "vendor"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Acme Corp"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "total"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2400"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "due_date"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"April 1, 2026"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"prerequisites",children:"Prerequisites"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Node.js 18+ or Bun installed"}),`
`,e.jsx(i.li,{children:"An API key from OpenAI, Anthropic, or Google"}),`
`]}),`
`,e.jsx(i.h2,{id:"step-1-install",children:"Step 1: Install"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Using npm"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @mateffy/struktur"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Or using Bun (recommended)"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @mateffy/struktur"})]})]})})}),`
`,e.jsx(i.p,{children:"Verify:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --help"})]})})})}),`
`,e.jsx(i.p,{children:"You should see the usage output."}),`
`,e.jsx(i.h2,{id:"step-2-configure-your-api-key",children:"Step 2: Configure your API key"}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Option A (quick, for testing):"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENAI_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"sk-..."})]})})})}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Option B (secure, persisted):"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "sk-..."'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token-stdin"})]})})})}),`
`,e.jsxs(i.p,{children:["Output: ",e.jsx(i.code,{children:'{ "provider": "openai", "stored": "keychain" }'})," (or ",e.jsx(i.code,{children:'"file"'})," on Linux)."]}),`
`,e.jsx(i.h2,{id:"step-3-extract-your-first-data",children:"Step 3: Extract your first data"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Invoice #1042 from Acme Corp. Total: '}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"$2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:',400.00. Due: April 1, 2026."'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "invoice_number, vendor, total:number, due_date"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"--fields"})," flag builds a JSON Schema on the fly. Each field defaults to ",e.jsx(i.code,{children:"string"}),"; append ",e.jsx(i.code,{children:":number"}),", ",e.jsx(i.code,{children:":integer"}),", ",e.jsx(i.code,{children:":bool"}),", etc. to set the type. See ",e.jsx(i.a,{href:"/docs/cli/fields",children:"--fields reference"})," for the full syntax."]}),`
`,e.jsx(i.p,{children:"If you need more control (optional fields, nested objects), pass a full schema instead:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Invoice #1042 from Acme Corp. Total: '}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"$2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:',400.00. Due: April 1, 2026."'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"--schema-json "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`'{"type":"object","properties":{"invoice_number":{"type":"string"},"vendor":{"type":"string"},"total":{"type":"number"},"due_date":{"type":"string"}},"required":["invoice_number","vendor","total","due_date"],"additionalProperties":false}'`}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"--model "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"openai/gpt-4o-mini"})]})]})})}),`
`,e.jsxs(i.p,{children:["Notice that ",e.jsx(i.code,{children:"total"})," is a number, not a string — Struktur enforced the schema."]}),`
`,e.jsx(i.h2,{id:"what-happened",children:"What happened?"}),`
`,e.jsxs(i.p,{children:["Three things: stdin input was loaded as an artifact, the LLM generated output, and Ajv validated it against your schema. The ",e.jsx(i.code,{children:"simple"})," strategy handled this in a single LLM call."]}),`
`,e.jsxs(i.p,{children:["To understand what happened inside, read ",e.jsx(i.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"}),"."]}),`
`,e.jsx(i.h2,{id:"where-to-go-next",children:"Where to go next"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Goal"}),e.jsx(i.th,{children:"Link"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Keep learning"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Solve a real problem"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/examples/extract-invoice",children:"Extract Invoice Data"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Look up all CLI flags"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/cli/extract",children:"CLI Reference"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Use it in TypeScript"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/sdk/installation",children:"TypeScript SDK"})})]})]})]})]})}function d(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(t,{...s})}):t(s)}export{r as _markdown,d as default,a as frontmatter,h as structuredData,l as toc};
