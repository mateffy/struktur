import{j as e}from"./main-CY4pAMb7.js";let h=`

auth set [#auth-set]

Store a token for a provider.

\`\`\`bash
struktur auth set --provider <name> --token <token>
struktur auth set --provider <name> --token-stdin
\`\`\`

| Flag                               | Type    | Description                                                         |
| ---------------------------------- | ------- | ------------------------------------------------------------------- |
| \`--provider <name>\`                | string  | Required. Provider ID: \`openai\`, \`anthropic\`, \`google\`.             |
| \`--token <token>\`                  | string  | API token value (avoid — visible in shell history).                 |
| \`--token-stdin\`                    | boolean | Read token from stdin.                                              |
| \`--storage <auto\\|keychain\\|file>\` | string  | Storage backend. Default: \`auto\`.                                   |
| \`--default\`                        | boolean | After storing, set the cheapest model for this provider as default. |

Output: \`{ "provider": "openai", "stored": "keychain" }\` (or \`"file"\`).

auth get [#auth-get]

Retrieve a stored token (masked by default).

\`\`\`bash
struktur auth get --provider <name> [--raw]
\`\`\`

| Flag                | Type    | Description                       |
| ------------------- | ------- | --------------------------------- |
| \`--provider <name>\` | string  | Required.                         |
| \`--raw\`             | boolean | Print full token without masking. |

auth delete [#auth-delete]

Remove a stored token.

\`\`\`bash
struktur auth delete --provider <name>
\`\`\`

Output: \`{ "provider": "openai", "deleted": true }\`.

auth list [#auth-list]

List all configured providers and their storage backend.

\`\`\`bash
struktur auth list
\`\`\`

Output:

\`\`\`json
{
  "providers": [
    { "provider": "openai", "storage": "keychain" },
    { "provider": "anthropic", "storage": "file" }
  ]
}
\`\`\`

auth default [#auth-default]

Set or auto-select the default model.

\`\`\`bash
struktur auth default <provider>
struktur auth default --model <provider/model>
\`\`\`

When given a provider name, queries the API for available models and selects the cheapest.

Preference order for OpenAI: \`gpt-4.1-nano\`, \`gpt-4.1-mini\`, \`gpt-4o-mini\`, \`gpt-4o\`.

Output: \`{ "defaultModel": "openai/gpt-4o-mini" }\`.

See also [#see-also]

* [Installation & Setup](/docs/cli/installation) — initial setup
* [Environment Variables](/docs/cli/environment) — env vars
`,a={title:"auth",description:"Manage API tokens for providers."},l={contents:[{heading:"auth-set",content:"Store a token for a provider."},{heading:"auth-set",content:"Flag"},{heading:"auth-set",content:"Type"},{heading:"auth-set",content:"Description"},{heading:"auth-set",content:"`--provider <name>`"},{heading:"auth-set",content:"string"},{heading:"auth-set",content:"Required. Provider ID: `openai`, `anthropic`, `google`."},{heading:"auth-set",content:"`--token <token>`"},{heading:"auth-set",content:"string"},{heading:"auth-set",content:"API token value (avoid — visible in shell history)."},{heading:"auth-set",content:"`--token-stdin`"},{heading:"auth-set",content:"boolean"},{heading:"auth-set",content:"Read token from stdin."},{heading:"auth-set",content:"`--storage <auto\\|keychain\\|file>`"},{heading:"auth-set",content:"string"},{heading:"auth-set",content:"Storage backend. Default: `auto`."},{heading:"auth-set",content:"`--default`"},{heading:"auth-set",content:"boolean"},{heading:"auth-set",content:"After storing, set the cheapest model for this provider as default."},{heading:"auth-set",content:'Output: `{ "provider": "openai", "stored": "keychain" }` (or `"file"`).'},{heading:"auth-get",content:"Retrieve a stored token (masked by default)."},{heading:"auth-get",content:"Flag"},{heading:"auth-get",content:"Type"},{heading:"auth-get",content:"Description"},{heading:"auth-get",content:"`--provider <name>`"},{heading:"auth-get",content:"string"},{heading:"auth-get",content:"Required."},{heading:"auth-get",content:"`--raw`"},{heading:"auth-get",content:"boolean"},{heading:"auth-get",content:"Print full token without masking."},{heading:"auth-delete",content:"Remove a stored token."},{heading:"auth-delete",content:'Output: `{ "provider": "openai", "deleted": true }`.'},{heading:"auth-list",content:"List all configured providers and their storage backend."},{heading:"auth-list",content:"Output:"},{heading:"auth-default",content:"Set or auto-select the default model."},{heading:"auth-default",content:"When given a provider name, queries the API for available models and selects the cheapest."},{heading:"auth-default",content:"Preference order for OpenAI: `gpt-4.1-nano`, `gpt-4.1-mini`, `gpt-4o-mini`, `gpt-4o`."},{heading:"auth-default",content:'Output: `{ "defaultModel": "openai/gpt-4o-mini" }`.'},{heading:"see-also",content:"Installation & Setup — initial setup"},{heading:"see-also",content:"Environment Variables — env vars"}],headings:[{id:"auth-set",content:"auth set"},{id:"auth-get",content:"auth get"},{id:"auth-delete",content:"auth delete"},{id:"auth-list",content:"auth list"},{id:"auth-default",content:"auth default"},{id:"see-also",content:"See also"}]};const r=[{depth:2,url:"#auth-set",title:e.jsx(e.Fragment,{children:"auth set"})},{depth:2,url:"#auth-get",title:e.jsx(e.Fragment,{children:"auth get"})},{depth:2,url:"#auth-delete",title:e.jsx(e.Fragment,{children:"auth delete"})},{depth:2,url:"#auth-list",title:e.jsx(e.Fragment,{children:"auth list"})},{depth:2,url:"#auth-default",title:e.jsx(e.Fragment,{children:"auth default"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function s(t){const i={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"auth-set",children:"auth set"}),`
`,e.jsx(i.p,{children:"Store a token for a provider."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"nam"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"toke"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"n"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"nam"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token-stdin"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Flag"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--provider <name>"})}),e.jsx(i.td,{children:"string"}),e.jsxs(i.td,{children:["Required. Provider ID: ",e.jsx(i.code,{children:"openai"}),", ",e.jsx(i.code,{children:"anthropic"}),", ",e.jsx(i.code,{children:"google"}),"."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--token <token>"})}),e.jsx(i.td,{children:"string"}),e.jsx(i.td,{children:"API token value (avoid — visible in shell history)."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--token-stdin"})}),e.jsx(i.td,{children:"boolean"}),e.jsx(i.td,{children:"Read token from stdin."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--storage <auto|keychain|file>"})}),e.jsx(i.td,{children:"string"}),e.jsxs(i.td,{children:["Storage backend. Default: ",e.jsx(i.code,{children:"auto"}),"."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--default"})}),e.jsx(i.td,{children:"boolean"}),e.jsx(i.td,{children:"After storing, set the cheapest model for this provider as default."})]})]})]}),`
`,e.jsxs(i.p,{children:["Output: ",e.jsx(i.code,{children:'{ "provider": "openai", "stored": "keychain" }'})," (or ",e.jsx(i.code,{children:'"file"'}),")."]}),`
`,e.jsx(i.h2,{id:"auth-get",children:"auth get"}),`
`,e.jsx(i.p,{children:"Retrieve a stored token (masked by default)."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"nam"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [--raw]"})]})})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Flag"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--provider <name>"})}),e.jsx(i.td,{children:"string"}),e.jsx(i.td,{children:"Required."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--raw"})}),e.jsx(i.td,{children:"boolean"}),e.jsx(i.td,{children:"Print full token without masking."})]})]})]}),`
`,e.jsx(i.h2,{id:"auth-delete",children:"auth delete"}),`
`,e.jsx(i.p,{children:"Remove a stored token."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" delete"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"nam"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsxs(i.p,{children:["Output: ",e.jsx(i.code,{children:'{ "provider": "openai", "deleted": true }'}),"."]}),`
`,e.jsx(i.h2,{id:"auth-list",children:"auth list"}),`
`,e.jsx(i.p,{children:"List all configured providers and their storage backend."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" list"})]})})})}),`
`,e.jsx(i.p,{children:"Output:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "providers"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    { "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"provider"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"storage"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"keychain"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" },"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    { "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"provider"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"anthropic"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"storage"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"file"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"auth-default",children:"auth default"}),`
`,e.jsx(i.p,{children:"Set or auto-select the default model."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" default"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"provide"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" default"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"provider/mode"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"l"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})]})})}),`
`,e.jsx(i.p,{children:"When given a provider name, queries the API for available models and selects the cheapest."}),`
`,e.jsxs(i.p,{children:["Preference order for OpenAI: ",e.jsx(i.code,{children:"gpt-4.1-nano"}),", ",e.jsx(i.code,{children:"gpt-4.1-mini"}),", ",e.jsx(i.code,{children:"gpt-4o-mini"}),", ",e.jsx(i.code,{children:"gpt-4o"}),"."]}),`
`,e.jsxs(i.p,{children:["Output: ",e.jsx(i.code,{children:'{ "defaultModel": "openai/gpt-4o-mini" }'}),"."]}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/installation",children:"Installation & Setup"})," — initial setup"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/environment",children:"Environment Variables"})," — env vars"]}),`
`]})]})}function d(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(s,{...t})}):s(t)}export{h as _markdown,d as default,a as frontmatter,l as structuredData,r as toc};
