import{j as e,ay as r,au as l,av as i,az as o,aA as s}from"./main-Ca2d6S-S.js";let h=`

import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';

How to use the Struktur agent skill with your AI coding assistant.

How It Works [#how-it-works]

The skill uses **progressive disclosure** to minimize token usage:

<Callout type="info">
  1. **Metadata Phase** (\\~100 tokens): Agent loads only the skill name and description
  2. **Activation Phase**: When your request matches the description, the agent asks permission to load the full skill
  3. **Full Load** (up to 5,000 tokens): Complete skill instructions load into context
  4. **On-Demand**: Supporting files (scripts, references) load as needed
</Callout>

This means you can have hundreds of skills installed without bloating the agent's context window.

Triggering the Skill [#triggering-the-skill]

The skill automatically activates when you mention Struktur-related tasks:

\`\`\`
"Use struktur to extract product data from this PDF"
"Set up struktur to parse invoices with parallel strategy"
"Help me configure the struktur CLI for my project"
"Import extract from @struktur/sdk and set up a schema"
\`\`\`

The agent will recognize these requests and load the skill automatically.

Example Conversations [#example-conversations]

<Accordions type="single">
  <Accordion title="Example 1: Basic Extraction">
    **You:**

    \`\`\`
    Use struktur to extract the title and author from this document.
    \`\`\`

    **Agent (with skill loaded):**

    \`\`\`
    I'll use Struktur's simple strategy for this extraction. Let me:

    1. Build an artifact from your document
    2. Define a schema with title and author fields
    3. Call extract() with the simple strategy

    [proceeds with correct API usage, proper schema definition, and best practices]
    \`\`\`
  </Accordion>

  <Accordion title="Example 2: Large Document with Parallel Strategy">
    **You:**

    \`\`\`
    I have a 500-page PDF with product listings. Extract all products with their names, prices, and categories.
    \`\`\`

    **Agent (with skill loaded):**

    \`\`\`
    For a 500-page document with multiple products, I'll use the parallel strategy:

    - It will chunk the document by token budget
    - Extract products from each chunk in parallel
    - Merge the results automatically

    Let me set this up with:
    - strategy: parallel with appropriate chunk size
    - schema: array of products with name, price, category
    - model: your configured default

    [proceeds with optimal configuration]
    \`\`\`
  </Accordion>

  <Accordion title="Example 3: CLI Configuration">
    **You:**

    \`\`\`
    Set up the struktur CLI to use OpenAI GPT-4o as the default model.
    \`\`\`

    **Agent (with skill loaded):**

    \`\`\`
    I'll configure the struktur CLI:

    1. Set your OpenAI API token
    2. Set gpt-4o as the default model
    3. Optionally create aliases for quick access

    [runs correct CLI commands]
    \`\`\`
  </Accordion>
</Accordions>

What the Skill Knows [#what-the-skill-knows]

When loaded, the skill provides the agent with:

API Knowledge [#api-knowledge]

* How to import and use \`extract()\`
* All strategy options and when to use them
* Schema definition patterns (JSON Schema and fields shorthand)
* Artifact building from files and URLs
* Event hooks for monitoring progress

Strategy Selection [#strategy-selection]

The skill teaches the agent to choose strategies based on:

| Input Size            | Output Shape        | Recommended Strategy              |
| --------------------- | ------------------- | --------------------------------- |
| Small (\`<10K\` tokens) | Any                 | \`simple\`                          |
| Large                 | Array/list          | \`parallel\` or \`parallelAutoMerge\` |
| Large                 | Object with context | \`sequential\`                      |
| Large                 | Maximum accuracy    | \`doublePass\`                      |

CLI Commands [#cli-commands]

All struktur CLI commands and options:

* \`struktur extract\` with all flags
* \`struktur models\` for model management
* \`struktur providers\` for API key setup
* Field shorthand syntax
* Debug and logging options

Best Practices [#best-practices]

* Token budget recommendations
* Validation retry patterns
* Merge and deduplication rules
* Schema strict mode usage
* Common pitfalls and how to avoid them

Manual Invocation [#manual-invocation]

Some tools allow manual skill invocation:

**Claude Code:**

\`\`\`
/struktur
\`\`\`

**OpenCode:**

\`\`\`
/load-skill struktur
\`\`\`

Check your tool's documentation for manual skill loading commands.

Troubleshooting [#troubleshooting]

<Accordions type="single">
  <Accordion title="Skill Not Loading">
    If the skill doesn't load automatically:

    1. **Check installation**: Verify the skill is in the correct directory
    2. **Restart the agent**: Some tools require a restart after installation
    3. **Be more specific**: Use explicit keywords like "struktur", "extract", "artifact"
    4. **Check logs**: Some tools show skill discovery in debug mode
  </Accordion>

  <Accordion title="Outdated Information">
    If the skill seems outdated:

    \`\`\`bash
    # Update to latest version
    npm update @struktur/skill
    cp -r node_modules/@struktur/skill/skills/struktur ~/.config/claude/skills/
    \`\`\`
  </Accordion>

  <Accordion title="Wrong Strategy Recommended">
    The skill provides general guidance, but you can override:

    \`\`\`
    Use struktur with the sequential strategy (not parallel) because order matters for this document.
    \`\`\`
  </Accordion>
</Accordions>

Advanced Usage [#advanced-usage]

Custom Instructions [#custom-instructions]

You can add project-specific instructions alongside the skill:

**In \`.agents/AGENTS.md\` or \`CLAUDE.md\`:**

\`\`\`markdown
When using struktur for this project:
- Always use the parallel strategy for invoice extraction
- Set chunkSize to 8000 for our PDF format
- Use the "smart" model alias for better accuracy
\`\`\`

Combining with Other Skills [#combining-with-other-skills]

The Struktur skill works alongside other skills:

<Cards>
  <Card title="Database Skills" description="For saving extracted data" />

  <Card title="Testing Skills" description="For validating extraction results" />

  <Card title="Deployment Skills" description="For CI/CD integration" />
</Cards>

Resources [#resources]

* [Struktur Documentation](/docs)
* [Agent Skills Specification](https://github.com/anthropics/skills)
* [Skills CLI](https://github.com/vercel/skills)
`,d={title:"Usage",description:"How to use the Struktur agent skill with your AI coding assistant."},g={contents:[{heading:void 0,content:"How to use the Struktur agent skill with your AI coding assistant."},{heading:"how-it-works",content:"The skill uses **progressive disclosure** to minimize token usage:"},{heading:"how-it-works",content:"**Metadata Phase** (\\~100 tokens): Agent loads only the skill name and description"},{heading:"how-it-works",content:"**Activation Phase**: When your request matches the description, the agent asks permission to load the full skill"},{heading:"how-it-works",content:"**Full Load** (up to 5,000 tokens): Complete skill instructions load into context"},{heading:"how-it-works",content:"**On-Demand**: Supporting files (scripts, references) load as needed"},{heading:"how-it-works",content:"This means you can have hundreds of skills installed without bloating the agent's context window."},{heading:"triggering-the-skill",content:"The skill automatically activates when you mention Struktur-related tasks:"},{heading:"triggering-the-skill",content:"The agent will recognize these requests and load the skill automatically."},{heading:"example-conversations",content:"**You:**"},{heading:"example-conversations",content:"**Agent (with skill loaded):**"},{heading:"example-conversations",content:"**You:**"},{heading:"example-conversations",content:"**Agent (with skill loaded):**"},{heading:"example-conversations",content:"**You:**"},{heading:"example-conversations",content:"**Agent (with skill loaded):**"},{heading:"what-the-skill-knows",content:"When loaded, the skill provides the agent with:"},{heading:"api-knowledge",content:"How to import and use `extract()`"},{heading:"api-knowledge",content:"All strategy options and when to use them"},{heading:"api-knowledge",content:"Schema definition patterns (JSON Schema and fields shorthand)"},{heading:"api-knowledge",content:"Artifact building from files and URLs"},{heading:"api-knowledge",content:"Event hooks for monitoring progress"},{heading:"strategy-selection",content:"The skill teaches the agent to choose strategies based on:"},{heading:"strategy-selection",content:"Input Size"},{heading:"strategy-selection",content:"Output Shape"},{heading:"strategy-selection",content:"Recommended Strategy"},{heading:"strategy-selection",content:"Small (`<10K` tokens)"},{heading:"strategy-selection",content:"Any"},{heading:"strategy-selection",content:"`simple`"},{heading:"strategy-selection",content:"Large"},{heading:"strategy-selection",content:"Array/list"},{heading:"strategy-selection",content:"`parallel` or `parallelAutoMerge`"},{heading:"strategy-selection",content:"Large"},{heading:"strategy-selection",content:"Object with context"},{heading:"strategy-selection",content:"`sequential`"},{heading:"strategy-selection",content:"Large"},{heading:"strategy-selection",content:"Maximum accuracy"},{heading:"strategy-selection",content:"`doublePass`"},{heading:"cli-commands",content:"All struktur CLI commands and options:"},{heading:"cli-commands",content:"`struktur extract` with all flags"},{heading:"cli-commands",content:"`struktur models` for model management"},{heading:"cli-commands",content:"`struktur providers` for API key setup"},{heading:"cli-commands",content:"Field shorthand syntax"},{heading:"cli-commands",content:"Debug and logging options"},{heading:"best-practices",content:"Token budget recommendations"},{heading:"best-practices",content:"Validation retry patterns"},{heading:"best-practices",content:"Merge and deduplication rules"},{heading:"best-practices",content:"Schema strict mode usage"},{heading:"best-practices",content:"Common pitfalls and how to avoid them"},{heading:"manual-invocation",content:"Some tools allow manual skill invocation:"},{heading:"manual-invocation",content:"**Claude Code:**"},{heading:"manual-invocation",content:"**OpenCode:**"},{heading:"manual-invocation",content:"Check your tool's documentation for manual skill loading commands."},{heading:"troubleshooting",content:"If the skill doesn't load automatically:"},{heading:"troubleshooting",content:"**Check installation**: Verify the skill is in the correct directory"},{heading:"troubleshooting",content:"**Restart the agent**: Some tools require a restart after installation"},{heading:"troubleshooting",content:'**Be more specific**: Use explicit keywords like "struktur", "extract", "artifact"'},{heading:"troubleshooting",content:"**Check logs**: Some tools show skill discovery in debug mode"},{heading:"troubleshooting",content:"If the skill seems outdated:"},{heading:"troubleshooting",content:"The skill provides general guidance, but you can override:"},{heading:"custom-instructions",content:"You can add project-specific instructions alongside the skill:"},{heading:"custom-instructions",content:"**In `.agents/AGENTS.md` or `CLAUDE.md`:**"},{heading:"combining-with-other-skills",content:"The Struktur skill works alongside other skills:"},{heading:"combining-with-other-skills",content:'<Card title="Database Skills" description="For saving extracted data" />'},{heading:"combining-with-other-skills",content:'<Card title="Testing Skills" description="For validating extraction results" />'},{heading:"combining-with-other-skills",content:'<Card title="Deployment Skills" description="For CI/CD integration" />'},{heading:"resources",content:"Struktur Documentation"},{heading:"resources",content:"Agent Skills Specification"},{heading:"resources",content:"Skills CLI"}],headings:[{id:"how-it-works",content:"How It Works"},{id:"triggering-the-skill",content:"Triggering the Skill"},{id:"example-conversations",content:"Example Conversations"},{id:"what-the-skill-knows",content:"What the Skill Knows"},{id:"api-knowledge",content:"API Knowledge"},{id:"strategy-selection",content:"Strategy Selection"},{id:"cli-commands",content:"CLI Commands"},{id:"best-practices",content:"Best Practices"},{id:"manual-invocation",content:"Manual Invocation"},{id:"troubleshooting",content:"Troubleshooting"},{id:"advanced-usage",content:"Advanced Usage"},{id:"custom-instructions",content:"Custom Instructions"},{id:"combining-with-other-skills",content:"Combining with Other Skills"},{id:"resources",content:"Resources"}]};const u=[{depth:2,url:"#how-it-works",title:e.jsx(e.Fragment,{children:"How It Works"})},{depth:2,url:"#triggering-the-skill",title:e.jsx(e.Fragment,{children:"Triggering the Skill"})},{depth:2,url:"#example-conversations",title:e.jsx(e.Fragment,{children:"Example Conversations"})},{depth:2,url:"#what-the-skill-knows",title:e.jsx(e.Fragment,{children:"What the Skill Knows"})},{depth:3,url:"#api-knowledge",title:e.jsx(e.Fragment,{children:"API Knowledge"})},{depth:3,url:"#strategy-selection",title:e.jsx(e.Fragment,{children:"Strategy Selection"})},{depth:3,url:"#cli-commands",title:e.jsx(e.Fragment,{children:"CLI Commands"})},{depth:3,url:"#best-practices",title:e.jsx(e.Fragment,{children:"Best Practices"})},{depth:2,url:"#manual-invocation",title:e.jsx(e.Fragment,{children:"Manual Invocation"})},{depth:2,url:"#troubleshooting",title:e.jsx(e.Fragment,{children:"Troubleshooting"})},{depth:2,url:"#advanced-usage",title:e.jsx(e.Fragment,{children:"Advanced Usage"})},{depth:3,url:"#custom-instructions",title:e.jsx(e.Fragment,{children:"Custom Instructions"})},{depth:3,url:"#combining-with-other-skills",title:e.jsx(e.Fragment,{children:"Combining with Other Skills"})},{depth:2,url:"#resources",title:e.jsx(e.Fragment,{children:"Resources"})}];function a(t){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"How to use the Struktur agent skill with your AI coding assistant."}),`
`,e.jsx(n.h2,{id:"how-it-works",children:"How It Works"}),`
`,e.jsxs(n.p,{children:["The skill uses ",e.jsx(n.strong,{children:"progressive disclosure"})," to minimize token usage:"]}),`
`,e.jsx(r,{type:"info",children:e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Metadata Phase"})," (~100 tokens): Agent loads only the skill name and description"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Activation Phase"}),": When your request matches the description, the agent asks permission to load the full skill"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Full Load"})," (up to 5,000 tokens): Complete skill instructions load into context"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"On-Demand"}),": Supporting files (scripts, references) load as needed"]}),`
`]})}),`
`,e.jsx(n.p,{children:"This means you can have hundreds of skills installed without bloating the agent's context window."}),`
`,e.jsx(n.h2,{id:"triggering-the-skill",children:"Triggering the Skill"}),`
`,e.jsx(n.p,{children:"The skill automatically activates when you mention Struktur-related tasks:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"Use struktur to extract product data from this PDF"'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"Set up struktur to parse invoices with parallel strategy"'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"Help me configure the struktur CLI for my project"'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"Import extract from @struktur/sdk and set up a schema"'})})]})})}),`
`,e.jsx(n.p,{children:"The agent will recognize these requests and load the skill automatically."}),`
`,e.jsx(n.h2,{id:"example-conversations",children:"Example Conversations"}),`
`,e.jsxs(l,{type:"single",children:[e.jsxs(i,{title:"Example 1: Basic Extraction",children:[e.jsx(n.p,{children:e.jsx(n.strong,{children:"You:"})}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Use struktur to extract the title and author from this document."})})})})}),e.jsx(n.p,{children:e.jsx(n.strong,{children:"Agent (with skill loaded):"})}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"I'll use Struktur's simple strategy for this extraction. Let me:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"1. Build an artifact from your document"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2. Define a schema with title and author fields"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"3. Call extract() with the simple strategy"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"[proceeds with correct API usage, proper schema definition, and best practices]"})})]})})})]}),e.jsxs(i,{title:"Example 2: Large Document with Parallel Strategy",children:[e.jsx(n.p,{children:e.jsx(n.strong,{children:"You:"})}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"I have a 500-page PDF with product listings. Extract all products with their names, prices, and categories."})})})})}),e.jsx(n.p,{children:e.jsx(n.strong,{children:"Agent (with skill loaded):"})}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"For a 500-page document with multiple products, I'll use the parallel strategy:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- It will chunk the document by token budget"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- Extract products from each chunk in parallel"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- Merge the results automatically"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Let me set this up with:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- strategy: parallel with appropriate chunk size"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- schema: array of products with name, price, category"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- model: your configured default"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"[proceeds with optimal configuration]"})})]})})})]}),e.jsxs(i,{title:"Example 3: CLI Configuration",children:[e.jsx(n.p,{children:e.jsx(n.strong,{children:"You:"})}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Set up the struktur CLI to use OpenAI GPT-4o as the default model."})})})})}),e.jsx(n.p,{children:e.jsx(n.strong,{children:"Agent (with skill loaded):"})}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"I'll configure the struktur CLI:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"1. Set your OpenAI API token"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2. Set gpt-4o as the default model"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"3. Optionally create aliases for quick access"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"[runs correct CLI commands]"})})]})})})]})]}),`
`,e.jsx(n.h2,{id:"what-the-skill-knows",children:"What the Skill Knows"}),`
`,e.jsx(n.p,{children:"When loaded, the skill provides the agent with:"}),`
`,e.jsx(n.h3,{id:"api-knowledge",children:"API Knowledge"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["How to import and use ",e.jsx(n.code,{children:"extract()"})]}),`
`,e.jsx(n.li,{children:"All strategy options and when to use them"}),`
`,e.jsx(n.li,{children:"Schema definition patterns (JSON Schema and fields shorthand)"}),`
`,e.jsx(n.li,{children:"Artifact building from files and URLs"}),`
`,e.jsx(n.li,{children:"Event hooks for monitoring progress"}),`
`]}),`
`,e.jsx(n.h3,{id:"strategy-selection",children:"Strategy Selection"}),`
`,e.jsx(n.p,{children:"The skill teaches the agent to choose strategies based on:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Input Size"}),e.jsx(n.th,{children:"Output Shape"}),e.jsx(n.th,{children:"Recommended Strategy"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:["Small (",e.jsx(n.code,{children:"<10K"})," tokens)"]}),e.jsx(n.td,{children:"Any"}),e.jsx(n.td,{children:e.jsx(n.code,{children:"simple"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Large"}),e.jsx(n.td,{children:"Array/list"}),e.jsxs(n.td,{children:[e.jsx(n.code,{children:"parallel"})," or ",e.jsx(n.code,{children:"parallelAutoMerge"})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Large"}),e.jsx(n.td,{children:"Object with context"}),e.jsx(n.td,{children:e.jsx(n.code,{children:"sequential"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Large"}),e.jsx(n.td,{children:"Maximum accuracy"}),e.jsx(n.td,{children:e.jsx(n.code,{children:"doublePass"})})]})]})]}),`
`,e.jsx(n.h3,{id:"cli-commands",children:"CLI Commands"}),`
`,e.jsx(n.p,{children:"All struktur CLI commands and options:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"struktur extract"})," with all flags"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"struktur models"})," for model management"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"struktur providers"})," for API key setup"]}),`
`,e.jsx(n.li,{children:"Field shorthand syntax"}),`
`,e.jsx(n.li,{children:"Debug and logging options"}),`
`]}),`
`,e.jsx(n.h3,{id:"best-practices",children:"Best Practices"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Token budget recommendations"}),`
`,e.jsx(n.li,{children:"Validation retry patterns"}),`
`,e.jsx(n.li,{children:"Merge and deduplication rules"}),`
`,e.jsx(n.li,{children:"Schema strict mode usage"}),`
`,e.jsx(n.li,{children:"Common pitfalls and how to avoid them"}),`
`]}),`
`,e.jsx(n.h2,{id:"manual-invocation",children:"Manual Invocation"}),`
`,e.jsx(n.p,{children:"Some tools allow manual skill invocation:"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Claude Code:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"/struktur"})})})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"OpenCode:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"/load-skill struktur"})})})})}),`
`,e.jsx(n.p,{children:"Check your tool's documentation for manual skill loading commands."}),`
`,e.jsx(n.h2,{id:"troubleshooting",children:"Troubleshooting"}),`
`,e.jsxs(l,{type:"single",children:[e.jsxs(i,{title:"Skill Not Loading",children:[e.jsx(n.p,{children:"If the skill doesn't load automatically:"}),e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Check installation"}),": Verify the skill is in the correct directory"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Restart the agent"}),": Some tools require a restart after installation"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Be more specific"}),': Use explicit keywords like "struktur", "extract", "artifact"']}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Check logs"}),": Some tools show skill discovery in debug mode"]}),`
`]})]}),e.jsxs(i,{title:"Outdated Information",children:[e.jsx(n.p,{children:"If the skill seems outdated:"}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Update to latest version"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" update"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/skill"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cp"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -r"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" node_modules/@struktur/skill/skills/struktur"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ~/.config/claude/skills/"})]})]})})})]}),e.jsxs(i,{title:"Wrong Strategy Recommended",children:[e.jsx(n.p,{children:"The skill provides general guidance, but you can override:"}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Use struktur with the sequential strategy (not parallel) because order matters for this document."})})})})})]})]}),`
`,e.jsx(n.h2,{id:"advanced-usage",children:"Advanced Usage"}),`
`,e.jsx(n.h3,{id:"custom-instructions",children:"Custom Instructions"}),`
`,e.jsx(n.p,{children:"You can add project-specific instructions alongside the skill:"}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["In ",e.jsx(n.code,{children:".agents/AGENTS.md"})," or ",e.jsx(n.code,{children:"CLAUDE.md"}),":"]})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"When using struktur for this project:"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"-"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Always use the parallel strategy for invoice extraction"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"-"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Set chunkSize to 8000 for our PDF format"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"-"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:' Use the "smart" model alias for better accuracy'})]})]})})}),`
`,e.jsx(n.h3,{id:"combining-with-other-skills",children:"Combining with Other Skills"}),`
`,e.jsx(n.p,{children:"The Struktur skill works alongside other skills:"}),`
`,e.jsxs(o,{children:[e.jsx(s,{title:"Database Skills",description:"For saving extracted data"}),e.jsx(s,{title:"Testing Skills",description:"For validating extraction results"}),e.jsx(s,{title:"Deployment Skills",description:"For CI/CD integration"})]}),`
`,e.jsx(n.h2,{id:"resources",children:"Resources"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs",children:"Struktur Documentation"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://github.com/anthropics/skills",children:"Agent Skills Specification"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://github.com/vercel/skills",children:"Skills CLI"})}),`
`]})]})}function m(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(a,{...t})}):a(t)}export{h as _markdown,m as default,d as frontmatter,g as structuredData,u as toc};
