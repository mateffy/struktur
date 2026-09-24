import{j as e,aC as a,aD as t,ax as d,ay as s}from"./main-CJmI79fM.js";let h=`

import { Tabs, Tab } from 'fumadocs-ui/components/tabs';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Callout } from 'fumadocs-ui/components/callout';

Install [#install]

<Tabs items={['npm', 'Bun']} groupId="package-manager">
  <Tab value="npm">
    \`\`\`bash
    npm install -g @struktur/cli
    \`\`\`
  </Tab>

  <Tab value="Bun">
    \`\`\`bash
    bun install -g @struktur/cli
    \`\`\`
  </Tab>
</Tabs>

Verify:

\`\`\`bash
struktur --help
\`\`\`

<Cards>
  <Card title="npm: @struktur/cli" href="https://www.npmjs.com/package/@struktur/cli" external />

  <Card title="GitHub: packages/cli" href="https://github.com/mateffy/struktur/tree/main/packages/cli" external />
</Cards>

Configure a provider (required) [#configure-a-provider-required]

Store your API key securely with the CLI:

\`\`\`bash
echo "$OPENAI_API_KEY" | struktur config providers add openai --token-stdin
\`\`\`

On macOS, tokens are stored in Keychain. On other platforms, \`~/.config/struktur/tokens.json\` (chmod 600).

Quick setup with --default [#quick-setup-with---default]

\`\`\`bash
echo "$OPENAI_API_KEY" | struktur config providers add openai --token-stdin --default
\`\`\`

The \`--default\` flag automatically queries the provider API and sets the cheapest available model as default. One command, fully ready.

Set a default model [#set-a-default-model]

\`\`\`bash
# Set explicitly
struktur config models use openai/gpt-4o-mini

# Or store a shortcut alias first
struktur config models alias set fast openai/gpt-4.1-mini
struktur config models use fast
\`\`\`

Once set, \`--model\` is optional in \`extract\` commands.

Environment variables [#environment-variables]

You can set provider API keys as environment variables. Use this method for CI/CD pipelines and Docker containers. Environment variables override stored tokens. For regular use, stored tokens are recommended.

Provider API keys [#provider-api-keys]

| Variable                       | Provider   |
| ------------------------------ | ---------- |
| \`OPENAI_API_KEY\`               | OpenAI     |
| \`ANTHROPIC_API_KEY\`            | Anthropic  |
| \`GOOGLE_GENERATIVE_AI_API_KEY\` | Google     |
| \`OPENCODE_API_KEY\`             | OpenCode   |
| \`OPENROUTER_API_KEY\`           | OpenRouter |

Local providers [#local-providers]

| Variable          | Provider                                       |
| ----------------- | ---------------------------------------------- |
| \`OLLAMA_BASE_URL\` | Ollama (default: \`http://localhost:11434/api\`) |

Custom endpoints [#custom-endpoints]

You can override the default API endpoint for OpenAI and Anthropic. Use custom endpoints for proxy servers and local models.

| Variable             | Provider  |
| -------------------- | --------- |
| \`OPENAI_BASE_URL\`    | OpenAI    |
| \`ANTHROPIC_BASE_URL\` | Anthropic |

Configuration [#configuration]

| Variable                    | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| \`STRUKTUR_CONFIG_DIR\`       | Override the config directory (default: \`~/.config/struktur\`) |
| \`STRUKTUR_DISABLE_KEYCHAIN\` | Set to any value to force file-based token storage on macOS   |
| \`STRUKTUR_KEYCHAIN_SERVICE\` | Override the Keychain service name                            |

Debug and output [#debug-and-output]

| Variable              | Effect                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| \`NO_COLOR\`            | Set to any value to disable colored output                             |
| \`CI\`                  | Set to any value to disable colored output (same effect as \`NO_COLOR\`) |
| \`DEBUG\`               | Set to any value to show debug messages                                |
| \`AI_SDK_LOG_WARNINGS\` | Set to \`true\` to show AI SDK warnings                                  |

See also [#see-also]

* [extract](/docs/cli/extract) — main extraction command
* [config](/docs/cli/config) — provider and model management
`,o={title:"Installation & Setup",description:"Install and configure Struktur."},c={contents:[{heading:"install",content:"Verify:"},{heading:"install",content:'<Card title="npm: @struktur/cli" href="https://www.npmjs.com/package/@struktur/cli" />'},{heading:"install",content:'<Card title="GitHub: packages/cli" href="https://github.com/mateffy/struktur/tree/main/packages/cli" />'},{heading:"configure-a-provider-required",content:"Store your API key securely with the CLI:"},{heading:"configure-a-provider-required",content:"On macOS, tokens are stored in Keychain. On other platforms, `~/.config/struktur/tokens.json` (chmod 600)."},{heading:"quick-setup-with---default",content:"The `--default` flag automatically queries the provider API and sets the cheapest available model as default. One command, fully ready."},{heading:"set-a-default-model",content:"Once set, `--model` is optional in `extract` commands."},{heading:"environment-variables",content:"You can set provider API keys as environment variables. Use this method for CI/CD pipelines and Docker containers. Environment variables override stored tokens. For regular use, stored tokens are recommended."},{heading:"provider-api-keys",content:"Variable"},{heading:"provider-api-keys",content:"Provider"},{heading:"provider-api-keys",content:"`OPENAI_API_KEY`"},{heading:"provider-api-keys",content:"OpenAI"},{heading:"provider-api-keys",content:"`ANTHROPIC_API_KEY`"},{heading:"provider-api-keys",content:"Anthropic"},{heading:"provider-api-keys",content:"`GOOGLE_GENERATIVE_AI_API_KEY`"},{heading:"provider-api-keys",content:"Google"},{heading:"provider-api-keys",content:"`OPENCODE_API_KEY`"},{heading:"provider-api-keys",content:"OpenCode"},{heading:"provider-api-keys",content:"`OPENROUTER_API_KEY`"},{heading:"provider-api-keys",content:"OpenRouter"},{heading:"local-providers",content:"Variable"},{heading:"local-providers",content:"Provider"},{heading:"local-providers",content:"`OLLAMA_BASE_URL`"},{heading:"local-providers",content:"Ollama (default: `http://localhost:11434/api`)"},{heading:"custom-endpoints",content:"You can override the default API endpoint for OpenAI and Anthropic. Use custom endpoints for proxy servers and local models."},{heading:"custom-endpoints",content:"Variable"},{heading:"custom-endpoints",content:"Provider"},{heading:"custom-endpoints",content:"`OPENAI_BASE_URL`"},{heading:"custom-endpoints",content:"OpenAI"},{heading:"custom-endpoints",content:"`ANTHROPIC_BASE_URL`"},{heading:"custom-endpoints",content:"Anthropic"},{heading:"configuration",content:"Variable"},{heading:"configuration",content:"Purpose"},{heading:"configuration",content:"`STRUKTUR_CONFIG_DIR`"},{heading:"configuration",content:"Override the config directory (default: `~/.config/struktur`)"},{heading:"configuration",content:"`STRUKTUR_DISABLE_KEYCHAIN`"},{heading:"configuration",content:"Set to any value to force file-based token storage on macOS"},{heading:"configuration",content:"`STRUKTUR_KEYCHAIN_SERVICE`"},{heading:"configuration",content:"Override the Keychain service name"},{heading:"debug-and-output",content:"Variable"},{heading:"debug-and-output",content:"Effect"},{heading:"debug-and-output",content:"`NO_COLOR`"},{heading:"debug-and-output",content:"Set to any value to disable colored output"},{heading:"debug-and-output",content:"`CI`"},{heading:"debug-and-output",content:"Set to any value to disable colored output (same effect as `NO_COLOR`)"},{heading:"debug-and-output",content:"`DEBUG`"},{heading:"debug-and-output",content:"Set to any value to show debug messages"},{heading:"debug-and-output",content:"`AI_SDK_LOG_WARNINGS`"},{heading:"debug-and-output",content:"Set to `true` to show AI SDK warnings"},{heading:"see-also",content:"extract — main extraction command"},{heading:"see-also",content:"config — provider and model management"}],headings:[{id:"install",content:"Install"},{id:"configure-a-provider-required",content:"Configure a provider (required)"},{id:"quick-setup-with---default",content:"Quick setup with --default"},{id:"set-a-default-model",content:"Set a default model"},{id:"environment-variables",content:"Environment variables"},{id:"provider-api-keys",content:"Provider API keys"},{id:"local-providers",content:"Local providers"},{id:"custom-endpoints",content:"Custom endpoints"},{id:"configuration",content:"Configuration"},{id:"debug-and-output",content:"Debug and output"},{id:"see-also",content:"See also"}]};const u=[{depth:2,url:"#install",title:e.jsx(e.Fragment,{children:"Install"})},{depth:2,url:"#configure-a-provider-required",title:e.jsx(e.Fragment,{children:"Configure a provider (required)"})},{depth:2,url:"#quick-setup-with---default",title:e.jsx(e.Fragment,{children:"Quick setup with --default"})},{depth:2,url:"#set-a-default-model",title:e.jsx(e.Fragment,{children:"Set a default model"})},{depth:2,url:"#environment-variables",title:e.jsx(e.Fragment,{children:"Environment variables"})},{depth:3,url:"#provider-api-keys",title:e.jsx(e.Fragment,{children:"Provider API keys"})},{depth:3,url:"#local-providers",title:e.jsx(e.Fragment,{children:"Local providers"})},{depth:3,url:"#custom-endpoints",title:e.jsx(e.Fragment,{children:"Custom endpoints"})},{depth:3,url:"#configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#debug-and-output",title:e.jsx(e.Fragment,{children:"Debug and output"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function r(n){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"install",children:"Install"}),`
`,e.jsxs(a,{items:["npm","Bun"],groupId:"package-manager",children:[e.jsx(t,{value:"npm",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/cli"})]})})})})}),e.jsx(t,{value:"Bun",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -g"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/cli"})]})})})})})]}),`
`,e.jsx(i.p,{children:"Verify:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --help"})]})})})}),`
`,e.jsxs(d,{children:[e.jsx(s,{title:"npm: @struktur/cli",href:"https://www.npmjs.com/package/@struktur/cli",external:!0}),e.jsx(s,{title:"GitHub: packages/cli",href:"https://github.com/mateffy/struktur/tree/main/packages/cli",external:!0})]}),`
`,e.jsx(i.h2,{id:"configure-a-provider-required",children:"Configure a provider (required)"}),`
`,e.jsx(i.p,{children:"Store your API key securely with the CLI:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$OPENAI_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" providers"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token-stdin"})]})})})}),`
`,e.jsxs(i.p,{children:["On macOS, tokens are stored in Keychain. On other platforms, ",e.jsx(i.code,{children:"~/.config/struktur/tokens.json"})," (chmod 600)."]}),`
`,e.jsx(i.h2,{id:"quick-setup-with---default",children:"Quick setup with --default"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$OPENAI_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" providers"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token-stdin"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --default"})]})})})}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"--default"})," flag automatically queries the provider API and sets the cheapest available model as default. One command, fully ready."]}),`
`,e.jsx(i.h2,{id:"set-a-default-model",children:"Set a default model"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Set explicitly"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Or store a shortcut alias first"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" alias"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" fast"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4.1-mini"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" fast"})]})]})})}),`
`,e.jsxs(i.p,{children:["Once set, ",e.jsx(i.code,{children:"--model"})," is optional in ",e.jsx(i.code,{children:"extract"})," commands."]}),`
`,e.jsx(i.h2,{id:"environment-variables",children:"Environment variables"}),`
`,e.jsx(i.p,{children:"You can set provider API keys as environment variables. Use this method for CI/CD pipelines and Docker containers. Environment variables override stored tokens. For regular use, stored tokens are recommended."}),`
`,e.jsx(i.h3,{id:"provider-api-keys",children:"Provider API keys"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Variable"}),e.jsx(i.th,{children:"Provider"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"OPENAI_API_KEY"})}),e.jsx(i.td,{children:"OpenAI"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"ANTHROPIC_API_KEY"})}),e.jsx(i.td,{children:"Anthropic"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"GOOGLE_GENERATIVE_AI_API_KEY"})}),e.jsx(i.td,{children:"Google"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"OPENCODE_API_KEY"})}),e.jsx(i.td,{children:"OpenCode"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"OPENROUTER_API_KEY"})}),e.jsx(i.td,{children:"OpenRouter"})]})]})]}),`
`,e.jsx(i.h3,{id:"local-providers",children:"Local providers"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Variable"}),e.jsx(i.th,{children:"Provider"})]})}),e.jsx(i.tbody,{children:e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"OLLAMA_BASE_URL"})}),e.jsxs(i.td,{children:["Ollama (default: ",e.jsx(i.code,{children:"http://localhost:11434/api"}),")"]})]})})]}),`
`,e.jsx(i.h3,{id:"custom-endpoints",children:"Custom endpoints"}),`
`,e.jsx(i.p,{children:"You can override the default API endpoint for OpenAI and Anthropic. Use custom endpoints for proxy servers and local models."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Variable"}),e.jsx(i.th,{children:"Provider"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"OPENAI_BASE_URL"})}),e.jsx(i.td,{children:"OpenAI"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"ANTHROPIC_BASE_URL"})}),e.jsx(i.td,{children:"Anthropic"})]})]})]}),`
`,e.jsx(i.h3,{id:"configuration",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Variable"}),e.jsx(i.th,{children:"Purpose"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"STRUKTUR_CONFIG_DIR"})}),e.jsxs(i.td,{children:["Override the config directory (default: ",e.jsx(i.code,{children:"~/.config/struktur"}),")"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"STRUKTUR_DISABLE_KEYCHAIN"})}),e.jsx(i.td,{children:"Set to any value to force file-based token storage on macOS"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"STRUKTUR_KEYCHAIN_SERVICE"})}),e.jsx(i.td,{children:"Override the Keychain service name"})]})]})]}),`
`,e.jsx(i.h3,{id:"debug-and-output",children:"Debug and output"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Variable"}),e.jsx(i.th,{children:"Effect"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"NO_COLOR"})}),e.jsx(i.td,{children:"Set to any value to disable colored output"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"CI"})}),e.jsxs(i.td,{children:["Set to any value to disable colored output (same effect as ",e.jsx(i.code,{children:"NO_COLOR"}),")"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"DEBUG"})}),e.jsx(i.td,{children:"Set to any value to show debug messages"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"AI_SDK_LOG_WARNINGS"})}),e.jsxs(i.td,{children:["Set to ",e.jsx(i.code,{children:"true"})," to show AI SDK warnings"]})]})]})]}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/extract",children:"extract"})," — main extraction command"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/config",children:"config"})," — provider and model management"]}),`
`]})]})}function p(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(r,{...n})}):r(n)}export{h as _markdown,p as default,o as frontmatter,c as structuredData,u as toc};
