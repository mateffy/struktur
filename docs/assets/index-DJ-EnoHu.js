import{j as e,az as s,aA as i,ay as a}from"./main-Ca2d6S-S.js";let d=`

import { Card, Cards } from 'fumadocs-ui/components/card';
import { Callout } from 'fumadocs-ui/components/callout';

Struktur is an all-in-one tool for structured data extraction using an **autonomous agent**. It turns documents into validated, schema-typed JSON by having an LLM agent explore the content, decide what to read, and build the output incrementally.

<Cards>
  <Card title="CLI Tool" description="Extract data from the command line with a simple, intuitive interface" href="/docs/cli" />

  <Card title="TypeScript SDK" description="Programmatic API for embedding extraction in your applications" href="/docs/sdk" />

  <Card title="Agent Strategy" description="Autonomous exploration with virtual filesystem tools" href="/docs/explanation/strategies#agent" />

  <Card title="Examples" description="Real-world extraction patterns and use cases" href="/docs/examples" />
</Cards>

Why Struktur? [#why-struktur]

Large document batches arrive with data locked in semi-structured text. Invoices need to flow into spreadsheets. Product datasheets need to become database rows. The tooling exists, but the orchestration overhead is disproportionate to the extraction task itself.

Managed APIs charge per page, impose schema constraints, and require document uploads to external infrastructure. LLM SDKs provide raw model access but leave you to write chunking, validation, retries, and merging every time.

Struktur fills the gap: a focused extraction engine with an **autonomous agent** that handles the orchestration so you can focus on the output.

Why an Agent? [#why-an-agent]

Traditional extraction strategies (simple, parallel, sequential) require you to choose the right approach upfront. The agent decides:

* **When to read** — entire document or specific sections
* **How to search** — grep for patterns, list directories, execute bash commands
* **What to extract** — build output incrementally as it explores
* **How to validate** — check against schema and retry automatically

The agent adapts to your document. Small invoices get read in one shot. Large catalogs get navigated systematically. The result is better accuracy without configuration complexity.

Why not managed APIs? [#why-not-managed-apis]

| Limitation         | Impact                                  |
| ------------------ | --------------------------------------- |
| Per-page pricing   | Does not scale for large batches        |
| Schema constraints | You work within their data model        |
| Document upload    | Non-starter for confidential workloads  |
| Black-box behavior | Debugging extraction failures is opaque |

Why not a plain LLM SDK call? [#why-not-a-plain-llm-sdk-call]

A single \`generateText()\` call gives you:

* No chunking for large documents
* No retries on schema validation failure
* No merging of multi-chunk results
* No typed output inferred from your schema

You write the same orchestration boilerplate every time. Struktur's agent packages that orchestration into a single, adaptive strategy.

Design philosophy [#design-philosophy]

<Callout type="info">
  **Agent-first, zero configuration.** The agent strategy is the default. It explores documents autonomously, deciding when to read, search, or extract. No need to pick chunk sizes or parallelism upfront.
</Callout>

* **Autonomous exploration.** The agent uses a virtual filesystem to read files, grep for patterns, find files, and execute commands. It builds output incrementally as it discovers data.
* **Shell-composable by default.** Reads stdin, writes stdout, speaks JSON. Integrates with \`jq\`, \`find\`, \`curl\`, and any tool in your pipeline.
* **Validation in the loop.** Errors go back to the model, not to you. The retry loop means most extractions converge within two attempts.
* **Schema-first.** You define the shape, Struktur guarantees it.
* **Fields shorthand.** Skip the JSON Schema boilerplate with \`--fields "title, price:number, status:enum{draft|live}"\`.

Trade-offs [#trade-offs]

| Trade-off                          | Rationale                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Requires tool-calling models       | The agent needs models that support function calling (Claude, GPT-4, etc.)         |
| Depends on Vercel AI SDK providers | OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API |
| Token costs vary by document       | The agent makes multiple tool calls; large documents cost more than small ones     |

A 10-second demo [#a-10-second-demo]

\`\`\`bash
struktur extract --input invoice.pdf \\
  --fields "number, vendor, total:number"
\`\`\`

Expected output:

\`\`\`json
{
  "number": "1042",
  "vendor": "Acme Corp",
  "total": 2400
}
\`\`\`

The agent reads the PDF, decides how to extract the fields, and returns validated JSON.

What Struktur is NOT [#what-struktur-is-not]

<Callout type="warn">
  **It is not a general document conversion tool.** It parses files for extraction purposes, not for format conversion. It does not produce formatted output from documents.
</Callout>

* **It is not a managed API.** It runs locally and calls your provider directly.
* **It does not stream.** Input in, JSON out.
* **It is not a general LLM orchestration framework.**

For the full mental model, see [The Extraction Pipeline](/docs/explanation/pipeline).

Who is it for? [#who-is-it-for]

<Cards>
  <Card title="CLI Users" description="Data engineers, analysts, shell pipeline builders — use Struktur for one-off extractions, batch processing, and CI/CD automation without writing code." />

  <Card title="SDK Users" description="TypeScript developers embedding extraction in applications — use Struktur for typed results, custom strategies, and fine-grained control over the extraction pipeline." />
</Cards>

What is the Agent Strategy? [#what-is-the-agent-strategy]

The agent strategy is the default and recommended way to use Struktur. It implements:

* **Virtual filesystem tools** — read, grep, find, ls, bash
* **Output management** — set\\_output\\_data, update\\_output\\_data, finish, fail
* **Autonomous exploration** — the agent decides what to do based on your schema
* **Incremental extraction** — builds output as it discovers data

How it works [#how-it-works]

1. The agent receives your schema and access to a virtual filesystem containing the document
2. It can read files, search for patterns, list directories, and execute commands
3. As it finds data, it calls \`set_output_data\` or \`update_output_data\` to build the result
4. When complete, it calls \`finish\` to return validated JSON

When to use other strategies [#when-to-use-other-strategies]

The agent is the default and works best for most documents. However, other strategies are available for specific cases:

| Strategy              | When to use                                             |
| --------------------- | ------------------------------------------------------- |
| \`agent\` (default)     | Autonomous exploration — best for most documents        |
| \`simple\`              | Small input that fits in one context window             |
| \`parallel\`            | Large input where speed matters more than accuracy      |
| \`sequential\`          | Large input where order matters                         |
| \`parallelAutoMerge\`   | Large arrays with parallel processing + deduplication   |
| \`sequentialAutoMerge\` | Large arrays with sequential processing + deduplication |
| \`doublePass\`          | Maximum quality with two-pass refinement                |
| \`doublePassAutoMerge\` | Maximum quality with arrays + deduplication             |

See [Extraction Strategies](/docs/explanation/strategies) for details on all strategies.

Quick navigation [#quick-navigation]

| Goal                               | Section                                                |
| ---------------------------------- | ------------------------------------------------------ |
| New here?                          | [Quickstart](/docs/quickstart)                         |
| Need to accomplish something?      | [Examples](/docs/examples)                             |
| Looking up a flag or type?         | [CLI Reference](/docs/cli)                             |
| Quick schema without writing JSON? | [Fields Shorthand](/docs/cli/fields)                   |
| Want to understand how it works?   | [Concepts](/docs/explanation)                          |
| Parse files into artifacts?        | [Document Parsing](/docs/explanation/document-parsing) |
`,l={title:"What is Struktur?",description:"All-in-one tool for structured data extraction using an autonomous agent that turns documents into validated JSON."},h={contents:[{heading:void 0,content:"Struktur is an all-in-one tool for structured data extraction using an **autonomous agent**. It turns documents into validated, schema-typed JSON by having an LLM agent explore the content, decide what to read, and build the output incrementally."},{heading:void 0,content:'<Card title="CLI Tool" description="Extract data from the command line with a simple, intuitive interface" href="/docs/cli" />'},{heading:void 0,content:'<Card title="TypeScript SDK" description="Programmatic API for embedding extraction in your applications" href="/docs/sdk" />'},{heading:void 0,content:'<Card title="Agent Strategy" description="Autonomous exploration with virtual filesystem tools" href="/docs/explanation/strategies#agent" />'},{heading:void 0,content:'<Card title="Examples" description="Real-world extraction patterns and use cases" href="/docs/examples" />'},{heading:"why-struktur",content:"Large document batches arrive with data locked in semi-structured text. Invoices need to flow into spreadsheets. Product datasheets need to become database rows. The tooling exists, but the orchestration overhead is disproportionate to the extraction task itself."},{heading:"why-struktur",content:"Managed APIs charge per page, impose schema constraints, and require document uploads to external infrastructure. LLM SDKs provide raw model access but leave you to write chunking, validation, retries, and merging every time."},{heading:"why-struktur",content:"Struktur fills the gap: a focused extraction engine with an **autonomous agent** that handles the orchestration so you can focus on the output."},{heading:"why-an-agent",content:"Traditional extraction strategies (simple, parallel, sequential) require you to choose the right approach upfront. The agent decides:"},{heading:"why-an-agent",content:"**When to read** — entire document or specific sections"},{heading:"why-an-agent",content:"**How to search** — grep for patterns, list directories, execute bash commands"},{heading:"why-an-agent",content:"**What to extract** — build output incrementally as it explores"},{heading:"why-an-agent",content:"**How to validate** — check against schema and retry automatically"},{heading:"why-an-agent",content:"The agent adapts to your document. Small invoices get read in one shot. Large catalogs get navigated systematically. The result is better accuracy without configuration complexity."},{heading:"why-not-managed-apis",content:"Limitation"},{heading:"why-not-managed-apis",content:"Impact"},{heading:"why-not-managed-apis",content:"Per-page pricing"},{heading:"why-not-managed-apis",content:"Does not scale for large batches"},{heading:"why-not-managed-apis",content:"Schema constraints"},{heading:"why-not-managed-apis",content:"You work within their data model"},{heading:"why-not-managed-apis",content:"Document upload"},{heading:"why-not-managed-apis",content:"Non-starter for confidential workloads"},{heading:"why-not-managed-apis",content:"Black-box behavior"},{heading:"why-not-managed-apis",content:"Debugging extraction failures is opaque"},{heading:"why-not-a-plain-llm-sdk-call",content:"A single `generateText()` call gives you:"},{heading:"why-not-a-plain-llm-sdk-call",content:"No chunking for large documents"},{heading:"why-not-a-plain-llm-sdk-call",content:"No retries on schema validation failure"},{heading:"why-not-a-plain-llm-sdk-call",content:"No merging of multi-chunk results"},{heading:"why-not-a-plain-llm-sdk-call",content:"No typed output inferred from your schema"},{heading:"why-not-a-plain-llm-sdk-call",content:"You write the same orchestration boilerplate every time. Struktur's agent packages that orchestration into a single, adaptive strategy."},{heading:"design-philosophy",content:"**Agent-first, zero configuration.** The agent strategy is the default. It explores documents autonomously, deciding when to read, search, or extract. No need to pick chunk sizes or parallelism upfront."},{heading:"design-philosophy",content:"**Autonomous exploration.** The agent uses a virtual filesystem to read files, grep for patterns, find files, and execute commands. It builds output incrementally as it discovers data."},{heading:"design-philosophy",content:"**Shell-composable by default.** Reads stdin, writes stdout, speaks JSON. Integrates with `jq`, `find`, `curl`, and any tool in your pipeline."},{heading:"design-philosophy",content:"**Validation in the loop.** Errors go back to the model, not to you. The retry loop means most extractions converge within two attempts."},{heading:"design-philosophy",content:"**Schema-first.** You define the shape, Struktur guarantees it."},{heading:"design-philosophy",content:'**Fields shorthand.** Skip the JSON Schema boilerplate with `--fields "title, price:number, status:enum{draft|live}"`.'},{heading:"trade-offs",content:"Trade-off"},{heading:"trade-offs",content:"Rationale"},{heading:"trade-offs",content:"Requires tool-calling models"},{heading:"trade-offs",content:"The agent needs models that support function calling (Claude, GPT-4, etc.)"},{heading:"trade-offs",content:"Depends on Vercel AI SDK providers"},{heading:"trade-offs",content:"OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API"},{heading:"trade-offs",content:"Token costs vary by document"},{heading:"trade-offs",content:"The agent makes multiple tool calls; large documents cost more than small ones"},{heading:"a-10-second-demo",content:"Expected output:"},{heading:"a-10-second-demo",content:"The agent reads the PDF, decides how to extract the fields, and returns validated JSON."},{heading:"what-struktur-is-not",content:"**It is not a general document conversion tool.** It parses files for extraction purposes, not for format conversion. It does not produce formatted output from documents."},{heading:"what-struktur-is-not",content:"**It is not a managed API.** It runs locally and calls your provider directly."},{heading:"what-struktur-is-not",content:"**It does not stream.** Input in, JSON out."},{heading:"what-struktur-is-not",content:"**It is not a general LLM orchestration framework.**"},{heading:"what-struktur-is-not",content:"For the full mental model, see The Extraction Pipeline."},{heading:"who-is-it-for",content:'<Card title="CLI Users" description="Data engineers, analysts, shell pipeline builders — use Struktur for one-off extractions, batch processing, and CI/CD automation without writing code." />'},{heading:"who-is-it-for",content:'<Card title="SDK Users" description="TypeScript developers embedding extraction in applications — use Struktur for typed results, custom strategies, and fine-grained control over the extraction pipeline." />'},{heading:"what-is-the-agent-strategy",content:"The agent strategy is the default and recommended way to use Struktur. It implements:"},{heading:"what-is-the-agent-strategy",content:"**Virtual filesystem tools** — read, grep, find, ls, bash"},{heading:"what-is-the-agent-strategy",content:"**Output management** — set\\_output\\_data, update\\_output\\_data, finish, fail"},{heading:"what-is-the-agent-strategy",content:"**Autonomous exploration** — the agent decides what to do based on your schema"},{heading:"what-is-the-agent-strategy",content:"**Incremental extraction** — builds output as it discovers data"},{heading:"how-it-works",content:"The agent receives your schema and access to a virtual filesystem containing the document"},{heading:"how-it-works",content:"It can read files, search for patterns, list directories, and execute commands"},{heading:"how-it-works",content:"As it finds data, it calls `set_output_data` or `update_output_data` to build the result"},{heading:"how-it-works",content:"When complete, it calls `finish` to return validated JSON"},{heading:"when-to-use-other-strategies",content:"The agent is the default and works best for most documents. However, other strategies are available for specific cases:"},{heading:"when-to-use-other-strategies",content:"Strategy"},{heading:"when-to-use-other-strategies",content:"When to use"},{heading:"when-to-use-other-strategies",content:"`agent` (default)"},{heading:"when-to-use-other-strategies",content:"Autonomous exploration — best for most documents"},{heading:"when-to-use-other-strategies",content:"`simple`"},{heading:"when-to-use-other-strategies",content:"Small input that fits in one context window"},{heading:"when-to-use-other-strategies",content:"`parallel`"},{heading:"when-to-use-other-strategies",content:"Large input where speed matters more than accuracy"},{heading:"when-to-use-other-strategies",content:"`sequential`"},{heading:"when-to-use-other-strategies",content:"Large input where order matters"},{heading:"when-to-use-other-strategies",content:"`parallelAutoMerge`"},{heading:"when-to-use-other-strategies",content:"Large arrays with parallel processing + deduplication"},{heading:"when-to-use-other-strategies",content:"`sequentialAutoMerge`"},{heading:"when-to-use-other-strategies",content:"Large arrays with sequential processing + deduplication"},{heading:"when-to-use-other-strategies",content:"`doublePass`"},{heading:"when-to-use-other-strategies",content:"Maximum quality with two-pass refinement"},{heading:"when-to-use-other-strategies",content:"`doublePassAutoMerge`"},{heading:"when-to-use-other-strategies",content:"Maximum quality with arrays + deduplication"},{heading:"when-to-use-other-strategies",content:"See Extraction Strategies for details on all strategies."},{heading:"quick-navigation",content:"Goal"},{heading:"quick-navigation",content:"Section"},{heading:"quick-navigation",content:"New here?"},{heading:"quick-navigation",content:"Quickstart"},{heading:"quick-navigation",content:"Need to accomplish something?"},{heading:"quick-navigation",content:"Examples"},{heading:"quick-navigation",content:"Looking up a flag or type?"},{heading:"quick-navigation",content:"CLI Reference"},{heading:"quick-navigation",content:"Quick schema without writing JSON?"},{heading:"quick-navigation",content:"Fields Shorthand"},{heading:"quick-navigation",content:"Want to understand how it works?"},{heading:"quick-navigation",content:"Concepts"},{heading:"quick-navigation",content:"Parse files into artifacts?"},{heading:"quick-navigation",content:"Document Parsing"}],headings:[{id:"why-struktur",content:"Why Struktur?"},{id:"why-an-agent",content:"Why an Agent?"},{id:"why-not-managed-apis",content:"Why not managed APIs?"},{id:"why-not-a-plain-llm-sdk-call",content:"Why not a plain LLM SDK call?"},{id:"design-philosophy",content:"Design philosophy"},{id:"trade-offs",content:"Trade-offs"},{id:"a-10-second-demo",content:"A 10-second demo"},{id:"what-struktur-is-not",content:"What Struktur is NOT"},{id:"who-is-it-for",content:"Who is it for?"},{id:"what-is-the-agent-strategy",content:"What is the Agent Strategy?"},{id:"how-it-works",content:"How it works"},{id:"when-to-use-other-strategies",content:"When to use other strategies"},{id:"quick-navigation",content:"Quick navigation"}]};const c=[{depth:2,url:"#why-struktur",title:e.jsx(e.Fragment,{children:"Why Struktur?"})},{depth:3,url:"#why-an-agent",title:e.jsx(e.Fragment,{children:"Why an Agent?"})},{depth:3,url:"#why-not-managed-apis",title:e.jsx(e.Fragment,{children:"Why not managed APIs?"})},{depth:3,url:"#why-not-a-plain-llm-sdk-call",title:e.jsx(e.Fragment,{children:"Why not a plain LLM SDK call?"})},{depth:2,url:"#design-philosophy",title:e.jsx(e.Fragment,{children:"Design philosophy"})},{depth:2,url:"#trade-offs",title:e.jsx(e.Fragment,{children:"Trade-offs"})},{depth:2,url:"#a-10-second-demo",title:e.jsx(e.Fragment,{children:"A 10-second demo"})},{depth:2,url:"#what-struktur-is-not",title:e.jsx(e.Fragment,{children:"What Struktur is NOT"})},{depth:2,url:"#who-is-it-for",title:e.jsx(e.Fragment,{children:"Who is it for?"})},{depth:2,url:"#what-is-the-agent-strategy",title:e.jsx(e.Fragment,{children:"What is the Agent Strategy?"})},{depth:3,url:"#how-it-works",title:e.jsx(e.Fragment,{children:"How it works"})},{depth:3,url:"#when-to-use-other-strategies",title:e.jsx(e.Fragment,{children:"When to use other strategies"})},{depth:2,url:"#quick-navigation",title:e.jsx(e.Fragment,{children:"Quick navigation"})}];function o(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["Struktur is an all-in-one tool for structured data extraction using an ",e.jsx(t.strong,{children:"autonomous agent"}),". It turns documents into validated, schema-typed JSON by having an LLM agent explore the content, decide what to read, and build the output incrementally."]}),`
`,e.jsxs(s,{children:[e.jsx(i,{title:"CLI Tool",description:"Extract data from the command line with a simple, intuitive interface",href:"/docs/cli"}),e.jsx(i,{title:"TypeScript SDK",description:"Programmatic API for embedding extraction in your applications",href:"/docs/sdk"}),e.jsx(i,{title:"Agent Strategy",description:"Autonomous exploration with virtual filesystem tools",href:"/docs/explanation/strategies#agent"}),e.jsx(i,{title:"Examples",description:"Real-world extraction patterns and use cases",href:"/docs/examples"})]}),`
`,e.jsx(t.h2,{id:"why-struktur",children:"Why Struktur?"}),`
`,e.jsx(t.p,{children:"Large document batches arrive with data locked in semi-structured text. Invoices need to flow into spreadsheets. Product datasheets need to become database rows. The tooling exists, but the orchestration overhead is disproportionate to the extraction task itself."}),`
`,e.jsx(t.p,{children:"Managed APIs charge per page, impose schema constraints, and require document uploads to external infrastructure. LLM SDKs provide raw model access but leave you to write chunking, validation, retries, and merging every time."}),`
`,e.jsxs(t.p,{children:["Struktur fills the gap: a focused extraction engine with an ",e.jsx(t.strong,{children:"autonomous agent"})," that handles the orchestration so you can focus on the output."]}),`
`,e.jsx(t.h3,{id:"why-an-agent",children:"Why an Agent?"}),`
`,e.jsx(t.p,{children:"Traditional extraction strategies (simple, parallel, sequential) require you to choose the right approach upfront. The agent decides:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"When to read"})," — entire document or specific sections"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"How to search"})," — grep for patterns, list directories, execute bash commands"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"What to extract"})," — build output incrementally as it explores"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"How to validate"})," — check against schema and retry automatically"]}),`
`]}),`
`,e.jsx(t.p,{children:"The agent adapts to your document. Small invoices get read in one shot. Large catalogs get navigated systematically. The result is better accuracy without configuration complexity."}),`
`,e.jsx(t.h3,{id:"why-not-managed-apis",children:"Why not managed APIs?"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Limitation"}),e.jsx(t.th,{children:"Impact"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Per-page pricing"}),e.jsx(t.td,{children:"Does not scale for large batches"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Schema constraints"}),e.jsx(t.td,{children:"You work within their data model"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Document upload"}),e.jsx(t.td,{children:"Non-starter for confidential workloads"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Black-box behavior"}),e.jsx(t.td,{children:"Debugging extraction failures is opaque"})]})]})]}),`
`,e.jsx(t.h3,{id:"why-not-a-plain-llm-sdk-call",children:"Why not a plain LLM SDK call?"}),`
`,e.jsxs(t.p,{children:["A single ",e.jsx(t.code,{children:"generateText()"})," call gives you:"]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"No chunking for large documents"}),`
`,e.jsx(t.li,{children:"No retries on schema validation failure"}),`
`,e.jsx(t.li,{children:"No merging of multi-chunk results"}),`
`,e.jsx(t.li,{children:"No typed output inferred from your schema"}),`
`]}),`
`,e.jsx(t.p,{children:"You write the same orchestration boilerplate every time. Struktur's agent packages that orchestration into a single, adaptive strategy."}),`
`,e.jsx(t.h2,{id:"design-philosophy",children:"Design philosophy"}),`
`,e.jsx(a,{type:"info",children:e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Agent-first, zero configuration."})," The agent strategy is the default. It explores documents autonomously, deciding when to read, search, or extract. No need to pick chunk sizes or parallelism upfront."]})}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Autonomous exploration."})," The agent uses a virtual filesystem to read files, grep for patterns, find files, and execute commands. It builds output incrementally as it discovers data."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Shell-composable by default."})," Reads stdin, writes stdout, speaks JSON. Integrates with ",e.jsx(t.code,{children:"jq"}),", ",e.jsx(t.code,{children:"find"}),", ",e.jsx(t.code,{children:"curl"}),", and any tool in your pipeline."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Validation in the loop."})," Errors go back to the model, not to you. The retry loop means most extractions converge within two attempts."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Schema-first."})," You define the shape, Struktur guarantees it."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Fields shorthand."})," Skip the JSON Schema boilerplate with ",e.jsx(t.code,{children:'--fields "title, price:number, status:enum{draft|live}"'}),"."]}),`
`]}),`
`,e.jsx(t.h2,{id:"trade-offs",children:"Trade-offs"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Trade-off"}),e.jsx(t.th,{children:"Rationale"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Requires tool-calling models"}),e.jsx(t.td,{children:"The agent needs models that support function calling (Claude, GPT-4, etc.)"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Depends on Vercel AI SDK providers"}),e.jsx(t.td,{children:"OpenAI, Anthropic, Google supported; self-hosted models need OpenAI-compatible API"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Token costs vary by document"}),e.jsx(t.td,{children:"The agent makes multiple tool calls; large documents cost more than small ones"})]})]})]}),`
`,e.jsx(t.h2,{id:"a-10-second-demo",children:"A 10-second demo"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "number, vendor, total:number"'})]})]})})}),`
`,e.jsx(t.p,{children:"Expected output:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "number"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1042"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "vendor"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Acme Corp"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "total"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2400"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(t.p,{children:"The agent reads the PDF, decides how to extract the fields, and returns validated JSON."}),`
`,e.jsx(t.h2,{id:"what-struktur-is-not",children:"What Struktur is NOT"}),`
`,e.jsx(a,{type:"warn",children:e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"It is not a general document conversion tool."})," It parses files for extraction purposes, not for format conversion. It does not produce formatted output from documents."]})}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"It is not a managed API."})," It runs locally and calls your provider directly."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"It does not stream."})," Input in, JSON out."]}),`
`,e.jsx(t.li,{children:e.jsx(t.strong,{children:"It is not a general LLM orchestration framework."})}),`
`]}),`
`,e.jsxs(t.p,{children:["For the full mental model, see ",e.jsx(t.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"}),"."]}),`
`,e.jsx(t.h2,{id:"who-is-it-for",children:"Who is it for?"}),`
`,e.jsxs(s,{children:[e.jsx(i,{title:"CLI Users",description:"Data engineers, analysts, shell pipeline builders — use Struktur for one-off extractions, batch processing, and CI/CD automation without writing code."}),e.jsx(i,{title:"SDK Users",description:"TypeScript developers embedding extraction in applications — use Struktur for typed results, custom strategies, and fine-grained control over the extraction pipeline."})]}),`
`,e.jsx(t.h2,{id:"what-is-the-agent-strategy",children:"What is the Agent Strategy?"}),`
`,e.jsx(t.p,{children:"The agent strategy is the default and recommended way to use Struktur. It implements:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Virtual filesystem tools"})," — read, grep, find, ls, bash"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Output management"})," — set_output_data, update_output_data, finish, fail"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Autonomous exploration"})," — the agent decides what to do based on your schema"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Incremental extraction"})," — builds output as it discovers data"]}),`
`]}),`
`,e.jsx(t.h3,{id:"how-it-works",children:"How it works"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"The agent receives your schema and access to a virtual filesystem containing the document"}),`
`,e.jsx(t.li,{children:"It can read files, search for patterns, list directories, and execute commands"}),`
`,e.jsxs(t.li,{children:["As it finds data, it calls ",e.jsx(t.code,{children:"set_output_data"})," or ",e.jsx(t.code,{children:"update_output_data"})," to build the result"]}),`
`,e.jsxs(t.li,{children:["When complete, it calls ",e.jsx(t.code,{children:"finish"})," to return validated JSON"]}),`
`]}),`
`,e.jsx(t.h3,{id:"when-to-use-other-strategies",children:"When to use other strategies"}),`
`,e.jsx(t.p,{children:"The agent is the default and works best for most documents. However, other strategies are available for specific cases:"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Strategy"}),e.jsx(t.th,{children:"When to use"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"agent"})," (default)"]}),e.jsx(t.td,{children:"Autonomous exploration — best for most documents"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"simple"})}),e.jsx(t.td,{children:"Small input that fits in one context window"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"parallel"})}),e.jsx(t.td,{children:"Large input where speed matters more than accuracy"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"sequential"})}),e.jsx(t.td,{children:"Large input where order matters"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"parallelAutoMerge"})}),e.jsx(t.td,{children:"Large arrays with parallel processing + deduplication"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"sequentialAutoMerge"})}),e.jsx(t.td,{children:"Large arrays with sequential processing + deduplication"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"doublePass"})}),e.jsx(t.td,{children:"Maximum quality with two-pass refinement"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"doublePassAutoMerge"})}),e.jsx(t.td,{children:"Maximum quality with arrays + deduplication"})]})]})]}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/explanation/strategies",children:"Extraction Strategies"})," for details on all strategies."]}),`
`,e.jsx(t.h2,{id:"quick-navigation",children:"Quick navigation"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Goal"}),e.jsx(t.th,{children:"Section"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"New here?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/quickstart",children:"Quickstart"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Need to accomplish something?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/examples",children:"Examples"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Looking up a flag or type?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/cli",children:"CLI Reference"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Quick schema without writing JSON?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/cli/fields",children:"Fields Shorthand"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Want to understand how it works?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation",children:"Concepts"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Parse files into artifacts?"}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/explanation/document-parsing",children:"Document Parsing"})})]})]})]})]})}function u(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}export{d as _markdown,u as default,l as frontmatter,h as structuredData,c as toc};
