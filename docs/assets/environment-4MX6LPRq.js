import{j as e}from"./main-CY4pAMb7.js";let r=`

Struktur can be configured via environment variables as an alternative to CLI flags or the config file.

Provider Tokens [#provider-tokens]

Instead of using \`struktur auth set\`, you can set provider tokens via environment variables:

| Variable             | Description          |
| -------------------- | -------------------- |
| \`OPENAI_API_KEY\`     | OpenAI API token     |
| \`ANTHROPIC_API_KEY\`  | Anthropic API token  |
| \`GOOGLE_API_KEY\`     | Google AI API token  |
| \`MIXEDBREAD_API_KEY\` | Mixedbread API token |

Default Model [#default-model]

Set the default model for extractions:

| Variable                 | Description                                |
| ------------------------ | ------------------------------------------ |
| \`STRUKTUR_DEFAULT_MODEL\` | Default model (e.g., \`openai/gpt-4o-mini\`) |

Config File Location [#config-file-location]

Override the default config file location:

| Variable               | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| \`STRUKTUR_CONFIG_PATH\` | Path to config file (default: \`~/.struktur/config.json\`) |

Token Storage [#token-storage]

Control how tokens are stored:

| Variable                 | Description                                    |
| ------------------------ | ---------------------------------------------- |
| \`STRUKTUR_TOKEN_STORAGE\` | Storage backend: \`auto\`, \`keychain\`, or \`file\` |

Precedence [#precedence]

Configuration is resolved in this order (later overrides earlier):

1. Built-in defaults
2. Config file (\`~/.struktur/config.json\`)
3. Environment variables
4. CLI flags

See also [#see-also]

* [auth](/docs/cli/auth) — token management commands
* [Installation & Setup](/docs/cli/installation) — initial setup
`,d={title:"Environment Variables",description:"Configure Struktur via environment variables."},l={contents:[{heading:void 0,content:"Struktur can be configured via environment variables as an alternative to CLI flags or the config file."},{heading:"provider-tokens",content:"Instead of using `struktur auth set`, you can set provider tokens via environment variables:"},{heading:"provider-tokens",content:"Variable"},{heading:"provider-tokens",content:"Description"},{heading:"provider-tokens",content:"`OPENAI_API_KEY`"},{heading:"provider-tokens",content:"OpenAI API token"},{heading:"provider-tokens",content:"`ANTHROPIC_API_KEY`"},{heading:"provider-tokens",content:"Anthropic API token"},{heading:"provider-tokens",content:"`GOOGLE_API_KEY`"},{heading:"provider-tokens",content:"Google AI API token"},{heading:"provider-tokens",content:"`MIXEDBREAD_API_KEY`"},{heading:"provider-tokens",content:"Mixedbread API token"},{heading:"default-model",content:"Set the default model for extractions:"},{heading:"default-model",content:"Variable"},{heading:"default-model",content:"Description"},{heading:"default-model",content:"`STRUKTUR_DEFAULT_MODEL`"},{heading:"default-model",content:"Default model (e.g., `openai/gpt-4o-mini`)"},{heading:"config-file-location",content:"Override the default config file location:"},{heading:"config-file-location",content:"Variable"},{heading:"config-file-location",content:"Description"},{heading:"config-file-location",content:"`STRUKTUR_CONFIG_PATH`"},{heading:"config-file-location",content:"Path to config file (default: `~/.struktur/config.json`)"},{heading:"token-storage",content:"Control how tokens are stored:"},{heading:"token-storage",content:"Variable"},{heading:"token-storage",content:"Description"},{heading:"token-storage",content:"`STRUKTUR_TOKEN_STORAGE`"},{heading:"token-storage",content:"Storage backend: `auto`, `keychain`, or `file`"},{heading:"precedence",content:"Configuration is resolved in this order (later overrides earlier):"},{heading:"precedence",content:"Built-in defaults"},{heading:"precedence",content:"Config file (`~/.struktur/config.json`)"},{heading:"precedence",content:"Environment variables"},{heading:"precedence",content:"CLI flags"},{heading:"see-also",content:"auth — token management commands"},{heading:"see-also",content:"Installation & Setup — initial setup"}],headings:[{id:"provider-tokens",content:"Provider Tokens"},{id:"default-model",content:"Default Model"},{id:"config-file-location",content:"Config File Location"},{id:"token-storage",content:"Token Storage"},{id:"precedence",content:"Precedence"},{id:"see-also",content:"See also"}]};const a=[{depth:2,url:"#provider-tokens",title:e.jsx(e.Fragment,{children:"Provider Tokens"})},{depth:2,url:"#default-model",title:e.jsx(e.Fragment,{children:"Default Model"})},{depth:2,url:"#config-file-location",title:e.jsx(e.Fragment,{children:"Config File Location"})},{depth:2,url:"#token-storage",title:e.jsx(e.Fragment,{children:"Token Storage"})},{depth:2,url:"#precedence",title:e.jsx(e.Fragment,{children:"Precedence"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function i(t){const n={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"Struktur can be configured via environment variables as an alternative to CLI flags or the config file."}),`
`,e.jsx(n.h2,{id:"provider-tokens",children:"Provider Tokens"}),`
`,e.jsxs(n.p,{children:["Instead of using ",e.jsx(n.code,{children:"struktur auth set"}),", you can set provider tokens via environment variables:"]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Variable"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"OPENAI_API_KEY"})}),e.jsx(n.td,{children:"OpenAI API token"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"ANTHROPIC_API_KEY"})}),e.jsx(n.td,{children:"Anthropic API token"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"GOOGLE_API_KEY"})}),e.jsx(n.td,{children:"Google AI API token"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"MIXEDBREAD_API_KEY"})}),e.jsx(n.td,{children:"Mixedbread API token"})]})]})]}),`
`,e.jsx(n.h2,{id:"default-model",children:"Default Model"}),`
`,e.jsx(n.p,{children:"Set the default model for extractions:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Variable"}),e.jsx(n.th,{children:"Description"})]})}),e.jsx(n.tbody,{children:e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"STRUKTUR_DEFAULT_MODEL"})}),e.jsxs(n.td,{children:["Default model (e.g., ",e.jsx(n.code,{children:"openai/gpt-4o-mini"}),")"]})]})})]}),`
`,e.jsx(n.h2,{id:"config-file-location",children:"Config File Location"}),`
`,e.jsx(n.p,{children:"Override the default config file location:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Variable"}),e.jsx(n.th,{children:"Description"})]})}),e.jsx(n.tbody,{children:e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"STRUKTUR_CONFIG_PATH"})}),e.jsxs(n.td,{children:["Path to config file (default: ",e.jsx(n.code,{children:"~/.struktur/config.json"}),")"]})]})})]}),`
`,e.jsx(n.h2,{id:"token-storage",children:"Token Storage"}),`
`,e.jsx(n.p,{children:"Control how tokens are stored:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Variable"}),e.jsx(n.th,{children:"Description"})]})}),e.jsx(n.tbody,{children:e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"STRUKTUR_TOKEN_STORAGE"})}),e.jsxs(n.td,{children:["Storage backend: ",e.jsx(n.code,{children:"auto"}),", ",e.jsx(n.code,{children:"keychain"}),", or ",e.jsx(n.code,{children:"file"})]})]})})]}),`
`,e.jsx(n.h2,{id:"precedence",children:"Precedence"}),`
`,e.jsx(n.p,{children:"Configuration is resolved in this order (later overrides earlier):"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Built-in defaults"}),`
`,e.jsxs(n.li,{children:["Config file (",e.jsx(n.code,{children:"~/.struktur/config.json"}),")"]}),`
`,e.jsx(n.li,{children:"Environment variables"}),`
`,e.jsx(n.li,{children:"CLI flags"}),`
`]}),`
`,e.jsx(n.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/cli/auth",children:"auth"})," — token management commands"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/cli/installation",children:"Installation & Setup"})," — initial setup"]}),`
`]})]})}function s(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{r as _markdown,s as default,d as frontmatter,l as structuredData,a as toc};
