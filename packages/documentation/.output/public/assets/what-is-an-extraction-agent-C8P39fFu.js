import{j as e}from"./main-CiUJ7M4r.js";let i=`

An extraction agent is an autonomous LLM that explores documents and decides how to extract data, rather than following a fixed extraction strategy. It uses tools to read, search, and navigate documents before producing output.

How It Differs from Fixed Strategies [#how-it-differs-from-fixed-strategies]

| Approach   | How It Works                                               |
| ---------- | ---------------------------------------------------------- |
| Simple     | Process entire document in one LLM call                    |
| Parallel   | Split into chunks, process simultaneously                  |
| Sequential | Process chunks in order, building up results               |
| **Agent**  | Explore document, decide what to read, extract iteratively |

Why Use an Agent? [#why-use-an-agent]

Fixed strategies work well when you know the document structure upfront. But when documents vary:

* **Unknown structure** — Agent discovers layout dynamically
* **Variable length** — Agent reads only what's needed
* **Complex navigation** — Agent can search, skip, revisit sections
* **Adaptive extraction** — Agent adjusts strategy per document

How Agents Work [#how-agents-work]

An extraction agent is given:

1. **A virtual filesystem** — Access to document content
2. **Tools** — Read, grep, find, explore
3. **Output schema** — What data to extract
4. **Control tools** — Set/update output, finish, fail

The agent:

1. Explores the document using tools
2. Identifies relevant sections
3. Extracts data iteratively
4. Validates and corrects
5. Signals completion

Example: Contract Analysis [#example-contract-analysis]

\`\`\`
Agent: "I need to find the parties involved."
→ uses grep("party") 
→ finds section 2.1

Agent: "Let me read section 2.1"
→ uses read("/artifacts/contract.pdf#section-2.1")
→ extracts party names

Agent: "Now I need the effective date"
→ uses grep("effective date")
→ extracts date

Agent: "I have all required fields"
→ uses finish()
\`\`\`

Trade-offs [#trade-offs]

| Advantage                     | Disadvantage                |
| ----------------------------- | --------------------------- |
| Handles unknown structures    | Variable token cost         |
| Adapts to document variations | Requires tool-calling model |
| Can skip irrelevant sections  | More complex to debug       |
| Better for complex documents  | Overkill for simple cases   |

When to Use an Agent [#when-to-use-an-agent]

Use an agent strategy when:

* Document structure varies significantly
* You don't know what sections contain relevant data
* Documents are long but only parts are relevant
* You need to cross-reference within the document

Use simpler strategies when:

* Documents have consistent structure
* Entire document is relevant
* You know exactly what to extract

See Also [#see-also]

* [What is Structured Data Extraction?](/docs/what-is-structured-data-extraction)
* [Choosing an Extraction Strategy](/blog/agent-vs-simple-vs-parallel)
* [Struktur Documentation](/docs)
`,r={title:"What is an Extraction Agent?",description:"An extraction agent is an autonomous LLM that explores documents and decides how to extract data, rather than following a fixed extraction strategy."},o={contents:[{heading:void 0,content:"An extraction agent is an autonomous LLM that explores documents and decides how to extract data, rather than following a fixed extraction strategy. It uses tools to read, search, and navigate documents before producing output."},{heading:"how-it-differs-from-fixed-strategies",content:"Approach"},{heading:"how-it-differs-from-fixed-strategies",content:"How It Works"},{heading:"how-it-differs-from-fixed-strategies",content:"Simple"},{heading:"how-it-differs-from-fixed-strategies",content:"Process entire document in one LLM call"},{heading:"how-it-differs-from-fixed-strategies",content:"Parallel"},{heading:"how-it-differs-from-fixed-strategies",content:"Split into chunks, process simultaneously"},{heading:"how-it-differs-from-fixed-strategies",content:"Sequential"},{heading:"how-it-differs-from-fixed-strategies",content:"Process chunks in order, building up results"},{heading:"how-it-differs-from-fixed-strategies",content:"**Agent**"},{heading:"how-it-differs-from-fixed-strategies",content:"Explore document, decide what to read, extract iteratively"},{heading:"why-use-an-agent",content:"Fixed strategies work well when you know the document structure upfront. But when documents vary:"},{heading:"why-use-an-agent",content:"**Unknown structure** — Agent discovers layout dynamically"},{heading:"why-use-an-agent",content:"**Variable length** — Agent reads only what's needed"},{heading:"why-use-an-agent",content:"**Complex navigation** — Agent can search, skip, revisit sections"},{heading:"why-use-an-agent",content:"**Adaptive extraction** — Agent adjusts strategy per document"},{heading:"how-agents-work",content:"An extraction agent is given:"},{heading:"how-agents-work",content:"**A virtual filesystem** — Access to document content"},{heading:"how-agents-work",content:"**Tools** — Read, grep, find, explore"},{heading:"how-agents-work",content:"**Output schema** — What data to extract"},{heading:"how-agents-work",content:"**Control tools** — Set/update output, finish, fail"},{heading:"how-agents-work",content:"The agent:"},{heading:"how-agents-work",content:"Explores the document using tools"},{heading:"how-agents-work",content:"Identifies relevant sections"},{heading:"how-agents-work",content:"Extracts data iteratively"},{heading:"how-agents-work",content:"Validates and corrects"},{heading:"how-agents-work",content:"Signals completion"},{heading:"trade-offs",content:"Advantage"},{heading:"trade-offs",content:"Disadvantage"},{heading:"trade-offs",content:"Handles unknown structures"},{heading:"trade-offs",content:"Variable token cost"},{heading:"trade-offs",content:"Adapts to document variations"},{heading:"trade-offs",content:"Requires tool-calling model"},{heading:"trade-offs",content:"Can skip irrelevant sections"},{heading:"trade-offs",content:"More complex to debug"},{heading:"trade-offs",content:"Better for complex documents"},{heading:"trade-offs",content:"Overkill for simple cases"},{heading:"when-to-use-an-agent",content:"Use an agent strategy when:"},{heading:"when-to-use-an-agent",content:"Document structure varies significantly"},{heading:"when-to-use-an-agent",content:"You don't know what sections contain relevant data"},{heading:"when-to-use-an-agent",content:"Documents are long but only parts are relevant"},{heading:"when-to-use-an-agent",content:"You need to cross-reference within the document"},{heading:"when-to-use-an-agent",content:"Use simpler strategies when:"},{heading:"when-to-use-an-agent",content:"Documents have consistent structure"},{heading:"when-to-use-an-agent",content:"Entire document is relevant"},{heading:"when-to-use-an-agent",content:"You know exactly what to extract"},{heading:"see-also",content:"What is Structured Data Extraction?"},{heading:"see-also",content:"Choosing an Extraction Strategy"},{heading:"see-also",content:"Struktur Documentation"}],headings:[{id:"how-it-differs-from-fixed-strategies",content:"How It Differs from Fixed Strategies"},{id:"why-use-an-agent",content:"Why Use an Agent?"},{id:"how-agents-work",content:"How Agents Work"},{id:"example-contract-analysis",content:"Example: Contract Analysis"},{id:"trade-offs",content:"Trade-offs"},{id:"when-to-use-an-agent",content:"When to Use an Agent"},{id:"see-also",content:"See Also"}]};const d=[{depth:2,url:"#how-it-differs-from-fixed-strategies",title:e.jsx(e.Fragment,{children:"How It Differs from Fixed Strategies"})},{depth:2,url:"#why-use-an-agent",title:e.jsx(e.Fragment,{children:"Why Use an Agent?"})},{depth:2,url:"#how-agents-work",title:e.jsx(e.Fragment,{children:"How Agents Work"})},{depth:2,url:"#example-contract-analysis",title:e.jsx(e.Fragment,{children:"Example: Contract Analysis"})},{depth:2,url:"#trade-offs",title:e.jsx(e.Fragment,{children:"Trade-offs"})},{depth:2,url:"#when-to-use-an-agent",title:e.jsx(e.Fragment,{children:"When to Use an Agent"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See Also"})}];function s(t){const n={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"An extraction agent is an autonomous LLM that explores documents and decides how to extract data, rather than following a fixed extraction strategy. It uses tools to read, search, and navigate documents before producing output."}),`
`,e.jsx(n.h2,{id:"how-it-differs-from-fixed-strategies",children:"How It Differs from Fixed Strategies"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Approach"}),e.jsx(n.th,{children:"How It Works"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Simple"}),e.jsx(n.td,{children:"Process entire document in one LLM call"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Parallel"}),e.jsx(n.td,{children:"Split into chunks, process simultaneously"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Sequential"}),e.jsx(n.td,{children:"Process chunks in order, building up results"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Agent"})}),e.jsx(n.td,{children:"Explore document, decide what to read, extract iteratively"})]})]})]}),`
`,e.jsx(n.h2,{id:"why-use-an-agent",children:"Why Use an Agent?"}),`
`,e.jsx(n.p,{children:"Fixed strategies work well when you know the document structure upfront. But when documents vary:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Unknown structure"})," — Agent discovers layout dynamically"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Variable length"})," — Agent reads only what's needed"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Complex navigation"})," — Agent can search, skip, revisit sections"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Adaptive extraction"})," — Agent adjusts strategy per document"]}),`
`]}),`
`,e.jsx(n.h2,{id:"how-agents-work",children:"How Agents Work"}),`
`,e.jsx(n.p,{children:"An extraction agent is given:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"A virtual filesystem"})," — Access to document content"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tools"})," — Read, grep, find, explore"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Output schema"})," — What data to extract"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Control tools"})," — Set/update output, finish, fail"]}),`
`]}),`
`,e.jsx(n.p,{children:"The agent:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Explores the document using tools"}),`
`,e.jsx(n.li,{children:"Identifies relevant sections"}),`
`,e.jsx(n.li,{children:"Extracts data iteratively"}),`
`,e.jsx(n.li,{children:"Validates and corrects"}),`
`,e.jsx(n.li,{children:"Signals completion"}),`
`]}),`
`,e.jsx(n.h2,{id:"example-contract-analysis",children:"Example: Contract Analysis"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "I need to find the parties involved."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ uses grep("party") '})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ finds section 2.1"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "Let me read section 2.1"'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ uses read("/artifacts/contract.pdf#section-2.1")'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ extracts party names"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "Now I need the effective date"'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ uses grep("effective date")'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ extracts date"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "I have all required fields"'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ uses finish()"})})]})})}),`
`,e.jsx(n.h2,{id:"trade-offs",children:"Trade-offs"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Advantage"}),e.jsx(n.th,{children:"Disadvantage"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Handles unknown structures"}),e.jsx(n.td,{children:"Variable token cost"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Adapts to document variations"}),e.jsx(n.td,{children:"Requires tool-calling model"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Can skip irrelevant sections"}),e.jsx(n.td,{children:"More complex to debug"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Better for complex documents"}),e.jsx(n.td,{children:"Overkill for simple cases"})]})]})]}),`
`,e.jsx(n.h2,{id:"when-to-use-an-agent",children:"When to Use an Agent"}),`
`,e.jsx(n.p,{children:"Use an agent strategy when:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Document structure varies significantly"}),`
`,e.jsx(n.li,{children:"You don't know what sections contain relevant data"}),`
`,e.jsx(n.li,{children:"Documents are long but only parts are relevant"}),`
`,e.jsx(n.li,{children:"You need to cross-reference within the document"}),`
`]}),`
`,e.jsx(n.p,{children:"Use simpler strategies when:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Documents have consistent structure"}),`
`,e.jsx(n.li,{children:"Entire document is relevant"}),`
`,e.jsx(n.li,{children:"You know exactly what to extract"}),`
`]}),`
`,e.jsx(n.h2,{id:"see-also",children:"See Also"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs/what-is-structured-data-extraction",children:"What is Structured Data Extraction?"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/blog/agent-vs-simple-vs-parallel",children:"Choosing an Extraction Strategy"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs",children:"Struktur Documentation"})}),`
`]})]})}function c(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}export{i as _markdown,c as default,r as frontmatter,o as structuredData,d as toc};
