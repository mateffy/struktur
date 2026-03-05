import{j as e}from"./main-CY4pAMb7.js";let r=`

Install [#install]

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

Configure a provider (required) [#configure-a-provider-required]

Two methods:

Option A: Environment variable (not persisted) [#option-a-environment-variable-not-persisted]

\`\`\`bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_GENERATIVE_AI_API_KEY=AI...
\`\`\`

Option B: Stored token (persisted) [#option-b-stored-token-persisted]

\`\`\`bash
echo "$OPENAI_API_KEY" | struktur auth set --provider openai --token-stdin
\`\`\`

**Storage:**

* macOS: Keychain (auto)
* Linux/Windows: \`~/.config/struktur/tokens.json\`

**Permissions:**

* Config dir: \`chmod 700\`
* Tokens file: \`chmod 600\`

Set a default model [#set-a-default-model]

\`\`\`bash
struktur auth default openai
# or explicitly:
struktur auth default --model openai/gpt-4o-mini
\`\`\`

Once set, \`--model\` is optional in extract commands.

Environment variables [#environment-variables]

Provider API keys [#provider-api-keys]

| Variable                       | Purpose                        |
| ------------------------------ | ------------------------------ |
| \`OPENAI_API_KEY\`               | OpenAI API token               |
| \`ANTHROPIC_API_KEY\`            | Anthropic API token            |
| \`GOOGLE_GENERATIVE_AI_API_KEY\` | Google Generative AI API token |

Environment variables override stored tokens.

Configuration [#configuration]

| Variable                    | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| \`STRUKTUR_CONFIG_DIR\`       | Override config directory (default: \`~/.config/struktur\`) |
| \`STRUKTUR_DISABLE_KEYCHAIN\` | Set to any value to disable macOS Keychain                |
| \`STRUKTUR_KEYCHAIN_SERVICE\` | Override Keychain service name                            |

SDK behavior [#sdk-behavior]

| Variable              | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| \`AI_SDK_LOG_WARNINGS\` | Set to \`false\` to suppress AI SDK warnings (default: \`false\` in CLI) |

See also [#see-also]

* [extract](/docs/cli/extract) — main extraction command
* [auth](/docs/cli/auth) — token management
`,a={title:"Installation & Setup",description:"Install and configure Struktur."},d={contents:[{heading:"install",content:"Verify:"},{heading:"configure-a-provider-required",content:"Two methods:"},{heading:"option-b-stored-token-persisted",content:"**Storage:**"},{heading:"option-b-stored-token-persisted",content:"macOS: Keychain (auto)"},{heading:"option-b-stored-token-persisted",content:"Linux/Windows: `~/.config/struktur/tokens.json`"},{heading:"option-b-stored-token-persisted",content:"**Permissions:**"},{heading:"option-b-stored-token-persisted",content:"Config dir: `chmod 700`"},{heading:"option-b-stored-token-persisted",content:"Tokens file: `chmod 600`"},{heading:"set-a-default-model",content:"Once set, `--model` is optional in extract commands."},{heading:"provider-api-keys",content:"Variable"},{heading:"provider-api-keys",content:"Purpose"},{heading:"provider-api-keys",content:"`OPENAI_API_KEY`"},{heading:"provider-api-keys",content:"OpenAI API token"},{heading:"provider-api-keys",content:"`ANTHROPIC_API_KEY`"},{heading:"provider-api-keys",content:"Anthropic API token"},{heading:"provider-api-keys",content:"`GOOGLE_GENERATIVE_AI_API_KEY`"},{heading:"provider-api-keys",content:"Google Generative AI API token"},{heading:"provider-api-keys",content:"Environment variables override stored tokens."},{heading:"configuration",content:"Variable"},{heading:"configuration",content:"Purpose"},{heading:"configuration",content:"`STRUKTUR_CONFIG_DIR`"},{heading:"configuration",content:"Override config directory (default: `~/.config/struktur`)"},{heading:"configuration",content:"`STRUKTUR_DISABLE_KEYCHAIN`"},{heading:"configuration",content:"Set to any value to disable macOS Keychain"},{heading:"configuration",content:"`STRUKTUR_KEYCHAIN_SERVICE`"},{heading:"configuration",content:"Override Keychain service name"},{heading:"sdk-behavior",content:"Variable"},{heading:"sdk-behavior",content:"Purpose"},{heading:"sdk-behavior",content:"`AI_SDK_LOG_WARNINGS`"},{heading:"sdk-behavior",content:"Set to `false` to suppress AI SDK warnings (default: `false` in CLI)"},{heading:"see-also",content:"extract — main extraction command"},{heading:"see-also",content:"auth — token management"}],headings:[{id:"install",content:"Install"},{id:"configure-a-provider-required",content:"Configure a provider (required)"},{id:"option-a-environment-variable-not-persisted",content:"Option A: Environment variable (not persisted)"},{id:"option-b-stored-token-persisted",content:"Option B: Stored token (persisted)"},{id:"set-a-default-model",content:"Set a default model"},{id:"environment-variables",content:"Environment variables"},{id:"provider-api-keys",content:"Provider API keys"},{id:"configuration",content:"Configuration"},{id:"sdk-behavior",content:"SDK behavior"},{id:"see-also",content:"See also"}]};const l=[{depth:2,url:"#install",title:e.jsx(e.Fragment,{children:"Install"})},{depth:2,url:"#configure-a-provider-required",title:e.jsx(e.Fragment,{children:"Configure a provider (required)"})},{depth:3,url:"#option-a-environment-variable-not-persisted",title:e.jsx(e.Fragment,{children:"Option A: Environment variable (not persisted)"})},{depth:3,url:"#option-b-stored-token-persisted",title:e.jsx(e.Fragment,{children:"Option B: Stored token (persisted)"})},{depth:2,url:"#set-a-default-model",title:e.jsx(e.Fragment,{children:"Set a default model"})},{depth:2,url:"#environment-variables",title:e.jsx(e.Fragment,{children:"Environment variables"})},{depth:3,url:"#provider-api-keys",title:e.jsx(e.Fragment,{children:"Provider API keys"})},{depth:3,url:"#configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#sdk-behavior",title:e.jsx(e.Fragment,{children:"SDK behavior"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function s(n){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"install",children:"Install"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Using npm"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @mateffy/struktur"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Or using Bun (recommended)"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @mateffy/struktur"})]})]})})}),`
`,e.jsx(i.p,{children:"Verify:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --help"})]})})})}),`
`,e.jsx(i.h2,{id:"configure-a-provider-required",children:"Configure a provider (required)"}),`
`,e.jsx(i.p,{children:"Two methods:"}),`
`,e.jsx(i.h3,{id:"option-a-environment-variable-not-persisted",children:"Option A: Environment variable (not persisted)"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENAI_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"sk-..."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ANTHROPIC_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"sk-ant-..."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" GOOGLE_GENERATIVE_AI_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"AI..."})]})]})})}),`
`,e.jsx(i.h3,{id:"option-b-stored-token-persisted",children:"Option B: Stored token (persisted)"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$OPENAI_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token-stdin"})]})})})}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Storage:"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"macOS: Keychain (auto)"}),`
`,e.jsxs(i.li,{children:["Linux/Windows: ",e.jsx(i.code,{children:"~/.config/struktur/tokens.json"})]}),`
`]}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Permissions:"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Config dir: ",e.jsx(i.code,{children:"chmod 700"})]}),`
`,e.jsxs(i.li,{children:["Tokens file: ",e.jsx(i.code,{children:"chmod 600"})]}),`
`]}),`
`,e.jsx(i.h2,{id:"set-a-default-model",children:"Set a default model"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" default"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# or explicitly:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" default"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,e.jsxs(i.p,{children:["Once set, ",e.jsx(i.code,{children:"--model"})," is optional in extract commands."]}),`
`,e.jsx(i.h2,{id:"environment-variables",children:"Environment variables"}),`
`,e.jsx(i.h3,{id:"provider-api-keys",children:"Provider API keys"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Variable"}),e.jsx(i.th,{children:"Purpose"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"OPENAI_API_KEY"})}),e.jsx(i.td,{children:"OpenAI API token"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"ANTHROPIC_API_KEY"})}),e.jsx(i.td,{children:"Anthropic API token"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"GOOGLE_GENERATIVE_AI_API_KEY"})}),e.jsx(i.td,{children:"Google Generative AI API token"})]})]})]}),`
`,e.jsx(i.p,{children:"Environment variables override stored tokens."}),`
`,e.jsx(i.h3,{id:"configuration",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Variable"}),e.jsx(i.th,{children:"Purpose"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"STRUKTUR_CONFIG_DIR"})}),e.jsxs(i.td,{children:["Override config directory (default: ",e.jsx(i.code,{children:"~/.config/struktur"}),")"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"STRUKTUR_DISABLE_KEYCHAIN"})}),e.jsx(i.td,{children:"Set to any value to disable macOS Keychain"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"STRUKTUR_KEYCHAIN_SERVICE"})}),e.jsx(i.td,{children:"Override Keychain service name"})]})]})]}),`
`,e.jsx(i.h3,{id:"sdk-behavior",children:"SDK behavior"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Variable"}),e.jsx(i.th,{children:"Purpose"})]})}),e.jsx(i.tbody,{children:e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"AI_SDK_LOG_WARNINGS"})}),e.jsxs(i.td,{children:["Set to ",e.jsx(i.code,{children:"false"})," to suppress AI SDK warnings (default: ",e.jsx(i.code,{children:"false"})," in CLI)"]})]})})]}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/extract",children:"extract"})," — main extraction command"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/auth",children:"auth"})," — token management"]}),`
`]})]})}function h(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(s,{...n})}):s(n)}export{r as _markdown,h as default,a as frontmatter,d as structuredData,l as toc};
