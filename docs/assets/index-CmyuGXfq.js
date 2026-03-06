import{j as e}from"./main-Bqss_295.js";let i=`

Struktur provides an Agent Skill that teaches AI coding assistants (like Claude Code, OpenCode, Codex, etc.) how to use Struktur effectively.

What is an Agent Skill? [#what-is-an-agent-skill]

An Agent Skill is a modular knowledge package that AI coding agents can discover and load automatically. Skills follow an open standard and work across 16+ AI agent tools.

When you ask your AI agent to work with Struktur, the skill automatically loads and provides:

* **API Usage**: How to use \`extract()\`, build artifacts, define schemas
* **Strategy Selection**: When to use \`simple\`, \`parallel\`, \`sequential\`, \`doublePass\`, etc.
* **Schema Definition**: JSON Schema patterns and shorthand field syntax
* **CLI Commands**: All struktur CLI commands and options
* **Best Practices**: Token budgets, validation retries, merge rules

Why Use the Skill? [#why-use-the-skill]

Without the skill, you'd need to explain Struktur's API, strategies, and best practices in every conversation. With the skill installed, your AI agent already knows:

* Which strategy to use for your use case
* How to define schemas correctly
* How to configure the CLI
* Common patterns and gotchas

Supported Tools [#supported-tools]

The skill works with any tool that supports the [Agent Skills open standard](https://github.com/anthropics/skills):

| Tool              | Support | Notes                                    |
| ----------------- | ------- | ---------------------------------------- |
| Claude Code       | ✅       | Full support with progressive disclosure |
| OpenCode          | ✅       | Full support                             |
| OpenAI Codex      | ✅       | Works alongside AGENTS.md                |
| Amp               | ✅       | Full support                             |
| VS Code (Copilot) | ✅       | Workspace-level installation             |
| Cursor            | ✅       | Project-level installation               |
| Gemini CLI        | ✅       | Full support                             |
| JetBrains (Junie) | ✅       | IDE integration                          |

And 10+ more tools.

Package [#package]

The skill is distributed as an npm package: \`@struktur/skill\`

\`\`\`bash
npm install @struktur/skill
# or
bun add @struktur/skill
\`\`\`

Next Steps [#next-steps]

* [Installation Guide](/docs/skill/installation) — Install for your preferred tool
* [Usage Examples](/docs/skill/usage) — How to use the skill with your AI agent
`,o={title:"Struktur Agent Skill",description:"Install the Struktur agent skill to teach AI coding assistants how to use Struktur."},a={contents:[{heading:void 0,content:"Struktur provides an Agent Skill that teaches AI coding assistants (like Claude Code, OpenCode, Codex, etc.) how to use Struktur effectively."},{heading:"what-is-an-agent-skill",content:"An Agent Skill is a modular knowledge package that AI coding agents can discover and load automatically. Skills follow an open standard and work across 16+ AI agent tools."},{heading:"what-is-an-agent-skill",content:"When you ask your AI agent to work with Struktur, the skill automatically loads and provides:"},{heading:"what-is-an-agent-skill",content:"**API Usage**: How to use `extract()`, build artifacts, define schemas"},{heading:"what-is-an-agent-skill",content:"**Strategy Selection**: When to use `simple`, `parallel`, `sequential`, `doublePass`, etc."},{heading:"what-is-an-agent-skill",content:"**Schema Definition**: JSON Schema patterns and shorthand field syntax"},{heading:"what-is-an-agent-skill",content:"**CLI Commands**: All struktur CLI commands and options"},{heading:"what-is-an-agent-skill",content:"**Best Practices**: Token budgets, validation retries, merge rules"},{heading:"why-use-the-skill",content:"Without the skill, you'd need to explain Struktur's API, strategies, and best practices in every conversation. With the skill installed, your AI agent already knows:"},{heading:"why-use-the-skill",content:"Which strategy to use for your use case"},{heading:"why-use-the-skill",content:"How to define schemas correctly"},{heading:"why-use-the-skill",content:"How to configure the CLI"},{heading:"why-use-the-skill",content:"Common patterns and gotchas"},{heading:"supported-tools",content:"The skill works with any tool that supports the Agent Skills open standard:"},{heading:"supported-tools",content:"Tool"},{heading:"supported-tools",content:"Support"},{heading:"supported-tools",content:"Notes"},{heading:"supported-tools",content:"Claude Code"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Full support with progressive disclosure"},{heading:"supported-tools",content:"OpenCode"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Full support"},{heading:"supported-tools",content:"OpenAI Codex"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Works alongside AGENTS.md"},{heading:"supported-tools",content:"Amp"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Full support"},{heading:"supported-tools",content:"VS Code (Copilot)"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Workspace-level installation"},{heading:"supported-tools",content:"Cursor"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Project-level installation"},{heading:"supported-tools",content:"Gemini CLI"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Full support"},{heading:"supported-tools",content:"JetBrains (Junie)"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"IDE integration"},{heading:"supported-tools",content:"And 10+ more tools."},{heading:"package",content:"The skill is distributed as an npm package: `@struktur/skill`"},{heading:"next-steps",content:"Installation Guide — Install for your preferred tool"},{heading:"next-steps",content:"Usage Examples — How to use the skill with your AI agent"}],headings:[{id:"what-is-an-agent-skill",content:"What is an Agent Skill?"},{id:"why-use-the-skill",content:"Why Use the Skill?"},{id:"supported-tools",content:"Supported Tools"},{id:"package",content:"Package"},{id:"next-steps",content:"Next Steps"}]};const r=[{depth:2,url:"#what-is-an-agent-skill",title:e.jsx(e.Fragment,{children:"What is an Agent Skill?"})},{depth:2,url:"#why-use-the-skill",title:e.jsx(e.Fragment,{children:"Why Use the Skill?"})},{depth:2,url:"#supported-tools",title:e.jsx(e.Fragment,{children:"Supported Tools"})},{depth:2,url:"#package",title:e.jsx(e.Fragment,{children:"Package"})},{depth:2,url:"#next-steps",title:e.jsx(e.Fragment,{children:"Next Steps"})}];function s(n){const t={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Struktur provides an Agent Skill that teaches AI coding assistants (like Claude Code, OpenCode, Codex, etc.) how to use Struktur effectively."}),`
`,e.jsx(t.h2,{id:"what-is-an-agent-skill",children:"What is an Agent Skill?"}),`
`,e.jsx(t.p,{children:"An Agent Skill is a modular knowledge package that AI coding agents can discover and load automatically. Skills follow an open standard and work across 16+ AI agent tools."}),`
`,e.jsx(t.p,{children:"When you ask your AI agent to work with Struktur, the skill automatically loads and provides:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"API Usage"}),": How to use ",e.jsx(t.code,{children:"extract()"}),", build artifacts, define schemas"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Strategy Selection"}),": When to use ",e.jsx(t.code,{children:"simple"}),", ",e.jsx(t.code,{children:"parallel"}),", ",e.jsx(t.code,{children:"sequential"}),", ",e.jsx(t.code,{children:"doublePass"}),", etc."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Schema Definition"}),": JSON Schema patterns and shorthand field syntax"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"CLI Commands"}),": All struktur CLI commands and options"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Best Practices"}),": Token budgets, validation retries, merge rules"]}),`
`]}),`
`,e.jsx(t.h2,{id:"why-use-the-skill",children:"Why Use the Skill?"}),`
`,e.jsx(t.p,{children:"Without the skill, you'd need to explain Struktur's API, strategies, and best practices in every conversation. With the skill installed, your AI agent already knows:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Which strategy to use for your use case"}),`
`,e.jsx(t.li,{children:"How to define schemas correctly"}),`
`,e.jsx(t.li,{children:"How to configure the CLI"}),`
`,e.jsx(t.li,{children:"Common patterns and gotchas"}),`
`]}),`
`,e.jsx(t.h2,{id:"supported-tools",children:"Supported Tools"}),`
`,e.jsxs(t.p,{children:["The skill works with any tool that supports the ",e.jsx(t.a,{href:"https://github.com/anthropics/skills",children:"Agent Skills open standard"}),":"]}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Tool"}),e.jsx(t.th,{children:"Support"}),e.jsx(t.th,{children:"Notes"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Claude Code"}),e.jsx(t.td,{children:"✅"}),e.jsx(t.td,{children:"Full support with progressive disclosure"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"OpenCode"}),e.jsx(t.td,{children:"✅"}),e.jsx(t.td,{children:"Full support"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"OpenAI Codex"}),e.jsx(t.td,{children:"✅"}),e.jsx(t.td,{children:"Works alongside AGENTS.md"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Amp"}),e.jsx(t.td,{children:"✅"}),e.jsx(t.td,{children:"Full support"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"VS Code (Copilot)"}),e.jsx(t.td,{children:"✅"}),e.jsx(t.td,{children:"Workspace-level installation"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Cursor"}),e.jsx(t.td,{children:"✅"}),e.jsx(t.td,{children:"Project-level installation"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Gemini CLI"}),e.jsx(t.td,{children:"✅"}),e.jsx(t.td,{children:"Full support"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"JetBrains (Junie)"}),e.jsx(t.td,{children:"✅"}),e.jsx(t.td,{children:"IDE integration"})]})]})]}),`
`,e.jsx(t.p,{children:"And 10+ more tools."}),`
`,e.jsx(t.h2,{id:"package",children:"Package"}),`
`,e.jsxs(t.p,{children:["The skill is distributed as an npm package: ",e.jsx(t.code,{children:"@struktur/skill"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/skill"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# or"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/skill"})]})]})})}),`
`,e.jsx(t.h2,{id:"next-steps",children:"Next Steps"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/skill/installation",children:"Installation Guide"})," — Install for your preferred tool"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/skill/usage",children:"Usage Examples"})," — How to use the skill with your AI agent"]}),`
`]})]})}function d(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(s,{...n})}):s(n)}export{i as _markdown,d as default,o as frontmatter,a as structuredData,r as toc};
