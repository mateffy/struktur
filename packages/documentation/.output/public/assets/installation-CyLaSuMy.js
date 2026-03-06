import{j as i}from"./main-BVs-cBtG.js";let r=`

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

Option A: Environment variable (not persisted) [#option-a-environment-variable-not-persisted]

\`\`\`bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_GENERATIVE_AI_API_KEY=AI...
export OPENCODE_API_KEY=...
export OPENROUTER_API_KEY=...
\`\`\`

Option B: Stored token (persisted) [#option-b-stored-token-persisted]

\`\`\`bash
echo "$OPENAI_API_KEY" | struktur config providers add openai --token-stdin
\`\`\`

On macOS, tokens are stored in Keychain. On other platforms, \`~/.config/struktur/tokens.json\` (chmod 600).

Set a default model [#set-a-default-model]

\`\`\`bash
# Set explicitly
struktur config models use openai/gpt-4o-mini

# Or store a shortcut alias first
struktur config models alias set fast openai/gpt-4.1-mini
struktur config models use fast
\`\`\`

Once set, \`--model\` is optional in \`extract\` commands.

Quick setup with --default [#quick-setup-with---default]

\`\`\`bash
echo "$OPENAI_API_KEY" | struktur config providers add openai --token-stdin --default
\`\`\`

The \`--default\` flag automatically queries the provider API and sets the cheapest available model as default. One command, fully ready.

Environment variables [#environment-variables]

Provider API keys [#provider-api-keys]

| Variable                       | Provider   |
| ------------------------------ | ---------- |
| \`OPENAI_API_KEY\`               | OpenAI     |
| \`ANTHROPIC_API_KEY\`            | Anthropic  |
| \`GOOGLE_GENERATIVE_AI_API_KEY\` | Google     |
| \`OPENCODE_API_KEY\`             | OpenCode   |
| \`OPENROUTER_API_KEY\`           | OpenRouter |

Environment variables override stored tokens.

Configuration [#configuration]

| Variable                    | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| \`STRUKTUR_CONFIG_DIR\`       | Override config directory (default: \`~/.config/struktur\`) |
| \`STRUKTUR_DISABLE_KEYCHAIN\` | Set to any value to disable macOS Keychain                |
| \`STRUKTUR_KEYCHAIN_SERVICE\` | Override Keychain service name                            |

SDK behavior [#sdk-behavior]

| Variable              | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| \`AI_SDK_LOG_WARNINGS\` | Set to \`true\` to enable AI SDK warning messages |

See also [#see-also]

* [extract](/docs/cli/extract) — main extraction command
* [config](/docs/cli/config) — provider and model management
`,a={title:"Installation & Setup",description:"Install and configure Struktur."},l={contents:[{heading:"install",content:"Verify:"},{heading:"option-b-stored-token-persisted",content:"On macOS, tokens are stored in Keychain. On other platforms, `~/.config/struktur/tokens.json` (chmod 600)."},{heading:"set-a-default-model",content:"Once set, `--model` is optional in `extract` commands."},{heading:"quick-setup-with---default",content:"The `--default` flag automatically queries the provider API and sets the cheapest available model as default. One command, fully ready."},{heading:"provider-api-keys",content:"Variable"},{heading:"provider-api-keys",content:"Provider"},{heading:"provider-api-keys",content:"`OPENAI_API_KEY`"},{heading:"provider-api-keys",content:"OpenAI"},{heading:"provider-api-keys",content:"`ANTHROPIC_API_KEY`"},{heading:"provider-api-keys",content:"Anthropic"},{heading:"provider-api-keys",content:"`GOOGLE_GENERATIVE_AI_API_KEY`"},{heading:"provider-api-keys",content:"Google"},{heading:"provider-api-keys",content:"`OPENCODE_API_KEY`"},{heading:"provider-api-keys",content:"OpenCode"},{heading:"provider-api-keys",content:"`OPENROUTER_API_KEY`"},{heading:"provider-api-keys",content:"OpenRouter"},{heading:"provider-api-keys",content:"Environment variables override stored tokens."},{heading:"configuration",content:"Variable"},{heading:"configuration",content:"Purpose"},{heading:"configuration",content:"`STRUKTUR_CONFIG_DIR`"},{heading:"configuration",content:"Override config directory (default: `~/.config/struktur`)"},{heading:"configuration",content:"`STRUKTUR_DISABLE_KEYCHAIN`"},{heading:"configuration",content:"Set to any value to disable macOS Keychain"},{heading:"configuration",content:"`STRUKTUR_KEYCHAIN_SERVICE`"},{heading:"configuration",content:"Override Keychain service name"},{heading:"sdk-behavior",content:"Variable"},{heading:"sdk-behavior",content:"Purpose"},{heading:"sdk-behavior",content:"`AI_SDK_LOG_WARNINGS`"},{heading:"sdk-behavior",content:"Set to `true` to enable AI SDK warning messages"},{heading:"see-also",content:"extract — main extraction command"},{heading:"see-also",content:"config — provider and model management"}],headings:[{id:"install",content:"Install"},{id:"configure-a-provider-required",content:"Configure a provider (required)"},{id:"option-a-environment-variable-not-persisted",content:"Option A: Environment variable (not persisted)"},{id:"option-b-stored-token-persisted",content:"Option B: Stored token (persisted)"},{id:"set-a-default-model",content:"Set a default model"},{id:"quick-setup-with---default",content:"Quick setup with --default"},{id:"environment-variables",content:"Environment variables"},{id:"provider-api-keys",content:"Provider API keys"},{id:"configuration",content:"Configuration"},{id:"sdk-behavior",content:"SDK behavior"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#install",title:i.jsx(i.Fragment,{children:"Install"})},{depth:2,url:"#configure-a-provider-required",title:i.jsx(i.Fragment,{children:"Configure a provider (required)"})},{depth:3,url:"#option-a-environment-variable-not-persisted",title:i.jsx(i.Fragment,{children:"Option A: Environment variable (not persisted)"})},{depth:3,url:"#option-b-stored-token-persisted",title:i.jsx(i.Fragment,{children:"Option B: Stored token (persisted)"})},{depth:2,url:"#set-a-default-model",title:i.jsx(i.Fragment,{children:"Set a default model"})},{depth:2,url:"#quick-setup-with---default",title:i.jsx(i.Fragment,{children:"Quick setup with --default"})},{depth:2,url:"#environment-variables",title:i.jsx(i.Fragment,{children:"Environment variables"})},{depth:3,url:"#provider-api-keys",title:i.jsx(i.Fragment,{children:"Provider API keys"})},{depth:3,url:"#configuration",title:i.jsx(i.Fragment,{children:"Configuration"})},{depth:3,url:"#sdk-behavior",title:i.jsx(i.Fragment,{children:"SDK behavior"})},{depth:2,url:"#see-also",title:i.jsx(i.Fragment,{children:"See also"})}];function n(s){const e={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsx(e.h2,{id:"install",children:"Install"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Using npm"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @mateffy/struktur"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Or using Bun (recommended)"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @mateffy/struktur"})]})]})})}),`
`,i.jsx(e.p,{children:"Verify:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --help"})]})})})}),`
`,i.jsx(e.h2,{id:"configure-a-provider-required",children:"Configure a provider (required)"}),`
`,i.jsx(e.h3,{id:"option-a-environment-variable-not-persisted",children:"Option A: Environment variable (not persisted)"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENAI_API_KEY"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"sk-..."})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ANTHROPIC_API_KEY"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"sk-ant-..."})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" GOOGLE_GENERATIVE_AI_API_KEY"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"AI..."})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENCODE_API_KEY"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENROUTER_API_KEY"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})]})]})})}),`
`,i.jsx(e.h3,{id:"option-b-stored-token-persisted",children:"Option B: Stored token (persisted)"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$OPENAI_API_KEY"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" providers"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token-stdin"})]})})})}),`
`,i.jsxs(e.p,{children:["On macOS, tokens are stored in Keychain. On other platforms, ",i.jsx(e.code,{children:"~/.config/struktur/tokens.json"})," (chmod 600)."]}),`
`,i.jsx(e.h2,{id:"set-a-default-model",children:"Set a default model"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Set explicitly"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Or store a shortcut alias first"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" alias"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" fast"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4.1-mini"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" fast"})]})]})})}),`
`,i.jsxs(e.p,{children:["Once set, ",i.jsx(e.code,{children:"--model"})," is optional in ",i.jsx(e.code,{children:"extract"})," commands."]}),`
`,i.jsx(e.h2,{id:"quick-setup-with---default",children:"Quick setup with --default"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$OPENAI_API_KEY"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" providers"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token-stdin"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --default"})]})})})}),`
`,i.jsxs(e.p,{children:["The ",i.jsx(e.code,{children:"--default"})," flag automatically queries the provider API and sets the cheapest available model as default. One command, fully ready."]}),`
`,i.jsx(e.h2,{id:"environment-variables",children:"Environment variables"}),`
`,i.jsx(e.h3,{id:"provider-api-keys",children:"Provider API keys"}),`
`,i.jsxs(e.table,{children:[i.jsx(e.thead,{children:i.jsxs(e.tr,{children:[i.jsx(e.th,{children:"Variable"}),i.jsx(e.th,{children:"Provider"})]})}),i.jsxs(e.tbody,{children:[i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"OPENAI_API_KEY"})}),i.jsx(e.td,{children:"OpenAI"})]}),i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"ANTHROPIC_API_KEY"})}),i.jsx(e.td,{children:"Anthropic"})]}),i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"GOOGLE_GENERATIVE_AI_API_KEY"})}),i.jsx(e.td,{children:"Google"})]}),i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"OPENCODE_API_KEY"})}),i.jsx(e.td,{children:"OpenCode"})]}),i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"OPENROUTER_API_KEY"})}),i.jsx(e.td,{children:"OpenRouter"})]})]})]}),`
`,i.jsx(e.p,{children:"Environment variables override stored tokens."}),`
`,i.jsx(e.h3,{id:"configuration",children:"Configuration"}),`
`,i.jsxs(e.table,{children:[i.jsx(e.thead,{children:i.jsxs(e.tr,{children:[i.jsx(e.th,{children:"Variable"}),i.jsx(e.th,{children:"Purpose"})]})}),i.jsxs(e.tbody,{children:[i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"STRUKTUR_CONFIG_DIR"})}),i.jsxs(e.td,{children:["Override config directory (default: ",i.jsx(e.code,{children:"~/.config/struktur"}),")"]})]}),i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"STRUKTUR_DISABLE_KEYCHAIN"})}),i.jsx(e.td,{children:"Set to any value to disable macOS Keychain"})]}),i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"STRUKTUR_KEYCHAIN_SERVICE"})}),i.jsx(e.td,{children:"Override Keychain service name"})]})]})]}),`
`,i.jsx(e.h3,{id:"sdk-behavior",children:"SDK behavior"}),`
`,i.jsxs(e.table,{children:[i.jsx(e.thead,{children:i.jsxs(e.tr,{children:[i.jsx(e.th,{children:"Variable"}),i.jsx(e.th,{children:"Purpose"})]})}),i.jsx(e.tbody,{children:i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"AI_SDK_LOG_WARNINGS"})}),i.jsxs(e.td,{children:["Set to ",i.jsx(e.code,{children:"true"})," to enable AI SDK warning messages"]})]})})]}),`
`,i.jsx(e.h2,{id:"see-also",children:"See also"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"/docs/cli/extract",children:"extract"})," — main extraction command"]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"/docs/cli/config",children:"config"})," — provider and model management"]}),`
`]})]})}function d(s={}){const{wrapper:e}=s.components||{};return e?i.jsx(e,{...s,children:i.jsx(n,{...s})}):n(s)}export{r as _markdown,d as default,a as frontmatter,l as structuredData,h as toc};
