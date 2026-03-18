import{j as t,ax as l,ay as n,aE as o}from"./main-BiZqUaIh.js";let r=`

import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';

Struktur provides an Agent Skill that teaches AI coding assistants (like Claude Code, OpenCode, Codex, etc.) how to use Struktur effectively.

<Cards>
  <Card title="Raw Skill File" description="View the skill source on GitHub" href="https://raw.githubusercontent.com/mateffy/struktur/refs/heads/main/packages/skill/skills/struktur/SKILL.md" external />
</Cards>

What is an Agent Skill? [#what-is-an-agent-skill]

An Agent Skill is a modular knowledge package that AI coding agents can discover and load automatically. Skills follow an open standard and work across 16+ AI agent tools.

<Callout type="info">
  When you ask your AI agent to work with Struktur, the skill automatically loads and provides:

  * **API Usage**: How to use \`extract()\`, build artifacts, define schemas
  * **Strategy Selection**: When to use \`simple\`, \`parallel\`, \`sequential\`, \`doublePass\`, etc.
  * **Schema Definition**: JSON Schema patterns and shorthand field syntax
  * **CLI Commands**: All struktur CLI commands and options
  * **Best Practices**: Token budgets, validation retries, merge rules
</Callout>

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

<Cards>
  <Card title="Installation Guide" description="Install for your preferred tool" href="/docs/skill/installation" />

  <Card title="Usage Examples" description="How to use the skill with your AI agent" href="/docs/skill/usage" />
</Cards>
`,d={title:"Struktur Agent Skill",description:"Install the Struktur agent skill to teach AI coding assistants how to use Struktur."},h={contents:[{heading:void 0,content:"Struktur provides an Agent Skill that teaches AI coding assistants (like Claude Code, OpenCode, Codex, etc.) how to use Struktur effectively."},{heading:void 0,content:'<Card title="Raw Skill File" description="View the skill source on GitHub" href="https://raw.githubusercontent.com/mateffy/struktur/refs/heads/main/packages/skill/skills/struktur/SKILL.md" />'},{heading:"what-is-an-agent-skill",content:"An Agent Skill is a modular knowledge package that AI coding agents can discover and load automatically. Skills follow an open standard and work across 16+ AI agent tools."},{heading:"what-is-an-agent-skill",content:"When you ask your AI agent to work with Struktur, the skill automatically loads and provides:"},{heading:"what-is-an-agent-skill",content:"**API Usage**: How to use `extract()`, build artifacts, define schemas"},{heading:"what-is-an-agent-skill",content:"**Strategy Selection**: When to use `simple`, `parallel`, `sequential`, `doublePass`, etc."},{heading:"what-is-an-agent-skill",content:"**Schema Definition**: JSON Schema patterns and shorthand field syntax"},{heading:"what-is-an-agent-skill",content:"**CLI Commands**: All struktur CLI commands and options"},{heading:"what-is-an-agent-skill",content:"**Best Practices**: Token budgets, validation retries, merge rules"},{heading:"why-use-the-skill",content:"Without the skill, you'd need to explain Struktur's API, strategies, and best practices in every conversation. With the skill installed, your AI agent already knows:"},{heading:"why-use-the-skill",content:"Which strategy to use for your use case"},{heading:"why-use-the-skill",content:"How to define schemas correctly"},{heading:"why-use-the-skill",content:"How to configure the CLI"},{heading:"why-use-the-skill",content:"Common patterns and gotchas"},{heading:"supported-tools",content:"The skill works with any tool that supports the Agent Skills open standard:"},{heading:"supported-tools",content:"Tool"},{heading:"supported-tools",content:"Support"},{heading:"supported-tools",content:"Notes"},{heading:"supported-tools",content:"Claude Code"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Full support with progressive disclosure"},{heading:"supported-tools",content:"OpenCode"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Full support"},{heading:"supported-tools",content:"OpenAI Codex"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Works alongside AGENTS.md"},{heading:"supported-tools",content:"Amp"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Full support"},{heading:"supported-tools",content:"VS Code (Copilot)"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Workspace-level installation"},{heading:"supported-tools",content:"Cursor"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Project-level installation"},{heading:"supported-tools",content:"Gemini CLI"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"Full support"},{heading:"supported-tools",content:"JetBrains (Junie)"},{heading:"supported-tools",content:"✅"},{heading:"supported-tools",content:"IDE integration"},{heading:"supported-tools",content:"And 10+ more tools."},{heading:"package",content:"The skill is distributed as an npm package: `@struktur/skill`"},{heading:"next-steps",content:'<Card title="Installation Guide" description="Install for your preferred tool" href="/docs/skill/installation" />'},{heading:"next-steps",content:'<Card title="Usage Examples" description="How to use the skill with your AI agent" href="/docs/skill/usage" />'}],headings:[{id:"what-is-an-agent-skill",content:"What is an Agent Skill?"},{id:"why-use-the-skill",content:"Why Use the Skill?"},{id:"supported-tools",content:"Supported Tools"},{id:"package",content:"Package"},{id:"next-steps",content:"Next Steps"}]};const c=[{depth:2,url:"#what-is-an-agent-skill",title:t.jsx(t.Fragment,{children:"What is an Agent Skill?"})},{depth:2,url:"#why-use-the-skill",title:t.jsx(t.Fragment,{children:"Why Use the Skill?"})},{depth:2,url:"#supported-tools",title:t.jsx(t.Fragment,{children:"Supported Tools"})},{depth:2,url:"#package",title:t.jsx(t.Fragment,{children:"Package"})},{depth:2,url:"#next-steps",title:t.jsx(t.Fragment,{children:"Next Steps"})}];function i(s){const e={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return t.jsxs(t.Fragment,{children:[t.jsx(e.p,{children:"Struktur provides an Agent Skill that teaches AI coding assistants (like Claude Code, OpenCode, Codex, etc.) how to use Struktur effectively."}),`
`,t.jsx(l,{children:t.jsx(n,{title:"Raw Skill File",description:"View the skill source on GitHub",href:"https://raw.githubusercontent.com/mateffy/struktur/refs/heads/main/packages/skill/skills/struktur/SKILL.md",external:!0})}),`
`,t.jsx(e.h2,{id:"what-is-an-agent-skill",children:"What is an Agent Skill?"}),`
`,t.jsx(e.p,{children:"An Agent Skill is a modular knowledge package that AI coding agents can discover and load automatically. Skills follow an open standard and work across 16+ AI agent tools."}),`
`,t.jsxs(o,{type:"info",children:[t.jsx(e.p,{children:"When you ask your AI agent to work with Struktur, the skill automatically loads and provides:"}),t.jsxs(e.ul,{children:[`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"API Usage"}),": How to use ",t.jsx(e.code,{children:"extract()"}),", build artifacts, define schemas"]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Strategy Selection"}),": When to use ",t.jsx(e.code,{children:"simple"}),", ",t.jsx(e.code,{children:"parallel"}),", ",t.jsx(e.code,{children:"sequential"}),", ",t.jsx(e.code,{children:"doublePass"}),", etc."]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Schema Definition"}),": JSON Schema patterns and shorthand field syntax"]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"CLI Commands"}),": All struktur CLI commands and options"]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Best Practices"}),": Token budgets, validation retries, merge rules"]}),`
`]})]}),`
`,t.jsx(e.h2,{id:"why-use-the-skill",children:"Why Use the Skill?"}),`
`,t.jsx(e.p,{children:"Without the skill, you'd need to explain Struktur's API, strategies, and best practices in every conversation. With the skill installed, your AI agent already knows:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"Which strategy to use for your use case"}),`
`,t.jsx(e.li,{children:"How to define schemas correctly"}),`
`,t.jsx(e.li,{children:"How to configure the CLI"}),`
`,t.jsx(e.li,{children:"Common patterns and gotchas"}),`
`]}),`
`,t.jsx(e.h2,{id:"supported-tools",children:"Supported Tools"}),`
`,t.jsxs(e.p,{children:["The skill works with any tool that supports the ",t.jsx(e.a,{href:"https://github.com/anthropics/skills",children:"Agent Skills open standard"}),":"]}),`
`,t.jsxs(e.table,{children:[t.jsx(e.thead,{children:t.jsxs(e.tr,{children:[t.jsx(e.th,{children:"Tool"}),t.jsx(e.th,{children:"Support"}),t.jsx(e.th,{children:"Notes"})]})}),t.jsxs(e.tbody,{children:[t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"Claude Code"}),t.jsx(e.td,{children:"✅"}),t.jsx(e.td,{children:"Full support with progressive disclosure"})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"OpenCode"}),t.jsx(e.td,{children:"✅"}),t.jsx(e.td,{children:"Full support"})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"OpenAI Codex"}),t.jsx(e.td,{children:"✅"}),t.jsx(e.td,{children:"Works alongside AGENTS.md"})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"Amp"}),t.jsx(e.td,{children:"✅"}),t.jsx(e.td,{children:"Full support"})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"VS Code (Copilot)"}),t.jsx(e.td,{children:"✅"}),t.jsx(e.td,{children:"Workspace-level installation"})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"Cursor"}),t.jsx(e.td,{children:"✅"}),t.jsx(e.td,{children:"Project-level installation"})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"Gemini CLI"}),t.jsx(e.td,{children:"✅"}),t.jsx(e.td,{children:"Full support"})]}),t.jsxs(e.tr,{children:[t.jsx(e.td,{children:"JetBrains (Junie)"}),t.jsx(e.td,{children:"✅"}),t.jsx(e.td,{children:"IDE integration"})]})]})]}),`
`,t.jsx(e.p,{children:"And 10+ more tools."}),`
`,t.jsx(e.h2,{id:"package",children:"Package"}),`
`,t.jsxs(e.p,{children:["The skill is distributed as an npm package: ",t.jsx(e.code,{children:"@struktur/skill"})]}),`
`,t.jsx(t.Fragment,{children:t.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:t.jsxs(e.code,{children:[t.jsxs(e.span,{className:"line",children:[t.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),t.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),t.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/skill"})]}),`
`,t.jsx(e.span,{className:"line",children:t.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# or"})}),`
`,t.jsxs(e.span,{className:"line",children:[t.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),t.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),t.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/skill"})]})]})})}),`
`,t.jsx(e.h2,{id:"next-steps",children:"Next Steps"}),`
`,t.jsxs(l,{children:[t.jsx(n,{title:"Installation Guide",description:"Install for your preferred tool",href:"/docs/skill/installation"}),t.jsx(n,{title:"Usage Examples",description:"How to use the skill with your AI agent",href:"/docs/skill/usage"})]})]})}function u(s={}){const{wrapper:e}=s.components||{};return e?t.jsx(e,{...s,children:t.jsx(i,{...s})}):i(s)}export{r as _markdown,u as default,d as frontmatter,h as structuredData,c as toc};
