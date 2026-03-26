import{j as e}from"./main-CiUJ7M4r.js";let a=`

Fixed extraction strategies work well when you know the document structure. But what if documents vary? What if you don't know which sections contain the data you need? An autonomous agent can explore documents and decide dynamically.

The Problem with Fixed Strategies [#the-problem-with-fixed-strategies]

Traditional extraction follows a fixed path:

1. Parse document
2. Split into chunks
3. Extract from each chunk
4. Merge results

This works when:

* Documents have consistent structure
* You know which sections matter
* The same approach works for all documents

But what if:

* Document structure varies wildly?
* Some documents are 5 pages, others 50?
* Relevant data could be anywhere?

You'd need to process everything, hoping to find what you need. Or write custom logic for each document type.

The Agent Approach [#the-agent-approach]

An extraction agent is an LLM with tools. It can:

* **Read** — View document content
* **Grep** — Search for patterns
* **Find** — Locate specific sections
* **Explore** — Navigate without predefined paths

Instead of processing every chunk, the agent decides what to read based on what it's learned so far.

How It Works [#how-it-works]

The Virtual Filesystem [#the-virtual-filesystem]

The agent sees the document as a filesystem:

\`\`\`
/artifacts/
├── document.pdf/
│   ├── page-1.txt
│   ├── page-2.txt
│   ├── page-3.txt
│   └── manifest.json
└── manifest.json
\`\`\`

The manifest describes the document:

\`\`\`json
{
  "name": "contract.pdf",
  "pages": 15,
  "hasTables": true,
  "hasImages": false
}
\`\`\`

The Tools [#the-tools]

The agent has access to tools:

| Tool                       | Purpose                 |
| -------------------------- | ----------------------- |
| \`read(path)\`               | Read file content       |
| \`grep(pattern)\`            | Search across all files |
| \`find(name)\`               | Find files by name      |
| \`ls(path)\`                 | List directory contents |
| \`set_output_data(data)\`    | Set extraction output   |
| \`update_output_data(data)\` | Update output (merge)   |
| \`finish()\`                 | Signal completion       |
| \`fail(reason)\`             | Signal failure          |

The Loop [#the-loop]

\`\`\`typescript
while (!finished) {
  const action = await llm.decide({
    tools: availableTools,
    goal: schema,
    context: whatWeveLearned,
  });
  
  const result = await execute(action);
  
  if (action.tool === 'finish' || action.tool === 'fail') {
    finished = true;
  }
}
\`\`\`

The LLM decides what to do next based on:

* The extraction goal (schema)
* What it's learned so far
* What tools are available

Example: Contract Analysis [#example-contract-analysis]

Let's trace an agent extracting from a 15-page contract:

**Initial state:**

\`\`\`
Goal: Extract { parties, effectiveDate, term, obligations }
Known: Document has 15 pages, has tables
\`\`\`

**Step 1: Explore**

\`\`\`
Agent: "I need to find the parties. Let me search."
→ grep("party|parties|between")
→ Found in page-2.txt, page-5.txt
\`\`\`

**Step 2: Read**

\`\`\`
Agent: "Let me read page 2 where 'parties' appears."
→ read("/artifacts/contract.pdf/page-2.txt")
→ Content: "This Agreement is between ACME Corp and Beta Inc..."
\`\`\`

**Step 3: Extract**

\`\`\`
Agent: "Found the parties. Let me set them."
→ set_output_data({
    parties: [
      { name: "ACME Corp", role: "Party A" },
      { name: "Beta Inc", role: "Party B" }
    ]
  })
\`\`\`

**Step 4: Continue**

\`\`\`
Agent: "Now I need the effective date."
→ grep("effective|date|commencement")
→ Found in page-2.txt, page-8.txt
\`\`\`

**Step 5: Read**

\`\`\`
Agent: "Page 2 already read. Let me check page 8."
→ read("/artifacts/contract.pdf/page-8.txt")
→ Content: "Term: This Agreement shall commence on January 1, 2025..."
\`\`\`

**Step 6: Extract**

\`\`\`
Agent: "Found the effective date and term."
→ update_output_data({
    effectiveDate: "2025-01-01",
    term: "2 years"
  })
\`\`\`

**Step 7: Search for obligations**

\`\`\`
Agent: "I need obligations. Let me search."
→ grep("shall|must|will|obligation")
→ Found in page-3.txt, page-4.txt, page-7.txt, page-10.txt
\`\`\`

**Step 8: Read selectively**

\`\`\`
Agent: "That's 4 pages. Let me read page 3 first."
→ read("/artifacts/contract.pdf/page-3.txt")
→ Content: "Party A shall provide services..."

Agent: "Found obligations. Let me read page 4 for more."
→ read("/artifacts/contract.pdf/page-4.txt")
→ Content: "Party B shall make payments..."
\`\`\`

**Step 9: Final extraction**

\`\`\`
Agent: "I have all required fields."
→ update_output_data({
    obligations: [
      { party: "Party A", obligation: "Provide services" },
      { party: "Party B", obligation: "Make payments" }
    ]
  })
→ finish()
\`\`\`

**Result:**

* Read 4 pages out of 15
* Found all required fields
* No wasted processing

Trade-offs [#trade-offs]

Advantages [#advantages]

* **Adapts to document structure** — No need to know layout upfront
* **Efficient** — Only reads relevant sections
* **Handles variation** — Different documents, same agent
* **Explainable** — Can trace decision path

Disadvantages [#disadvantages]

* **Variable token cost** — Depends on agent decisions
* **Requires tool-calling model** — GPT-4, Claude 3.5, etc.
* **Non-deterministic** — Same document might take different paths
* **More complex** — Harder to debug than fixed strategies

When to Use the Agent [#when-to-use-the-agent]

**Use agent when:**

* Document structure varies
* You don't know what sections matter
* Documents are long but sparse
* You need to cross-reference sections

**Use simpler strategies when:**

* Documents have consistent structure
* Entire document is relevant
* You know exactly what to extract
* Cost predictability matters

Implementation Details [#implementation-details]

Prompting Strategy [#prompting-strategy]

The agent prompt includes:

1. **Goal** — The output schema
2. **Available tools** — What it can do
3. **Current state** — What's been extracted
4. **Constraints** — Don't read everything, be efficient

Example system prompt:

\`\`\`
You are an extraction agent. Your goal is to extract data matching this schema:
{schema}

You have access to a document filesystem. Use tools to explore and extract.

Rules:
- Be efficient. Don't read everything.
- Use grep to find relevant sections.
- Set output data when you have confident extractions.
- Call finish() when all required fields are populated.
- Call fail() if you cannot complete the extraction.
\`\`\`

Error Handling [#error-handling]

If the agent:

* **Loops forever** — Max steps limit (default: 50)
* **Extracts invalid data** — Validation feedback sent back
* **Fails to extract** — Fallback to simple strategy

Token Tracking [#token-tracking]

Agent extractions track:

* Tokens per tool call
* Total tokens used
* Pages read
* Time taken

This helps optimize prompts and estimate costs.

Comparison with Other Strategies [#comparison-with-other-strategies]

| Strategy   | Pages Read | Tokens   | Best For          |
| ---------- | ---------- | -------- | ----------------- |
| Simple     | All        | High     | Small documents   |
| Parallel   | All        | High     | Speed over cost   |
| Sequential | All        | High     | Order matters     |
| **Agent**  | Variable   | Variable | Unknown structure |

The agent might read 3 pages or 30. It depends on the document.

See Also [#see-also]

* [What is an Extraction Agent?](/docs/what-is-an-extraction-agent)
* [Agent vs Simple vs Parallel](/blog/agent-vs-simple-vs-parallel)
* [Struktur Documentation](/docs)
`,r={title:"Building an Autonomous Extraction Agent",description:"How Struktur's agent explores documents and extracts data"},l={contents:[{heading:void 0,content:"Fixed extraction strategies work well when you know the document structure. But what if documents vary? What if you don't know which sections contain the data you need? An autonomous agent can explore documents and decide dynamically."},{heading:"the-problem-with-fixed-strategies",content:"Traditional extraction follows a fixed path:"},{heading:"the-problem-with-fixed-strategies",content:"Parse document"},{heading:"the-problem-with-fixed-strategies",content:"Split into chunks"},{heading:"the-problem-with-fixed-strategies",content:"Extract from each chunk"},{heading:"the-problem-with-fixed-strategies",content:"Merge results"},{heading:"the-problem-with-fixed-strategies",content:"This works when:"},{heading:"the-problem-with-fixed-strategies",content:"Documents have consistent structure"},{heading:"the-problem-with-fixed-strategies",content:"You know which sections matter"},{heading:"the-problem-with-fixed-strategies",content:"The same approach works for all documents"},{heading:"the-problem-with-fixed-strategies",content:"But what if:"},{heading:"the-problem-with-fixed-strategies",content:"Document structure varies wildly?"},{heading:"the-problem-with-fixed-strategies",content:"Some documents are 5 pages, others 50?"},{heading:"the-problem-with-fixed-strategies",content:"Relevant data could be anywhere?"},{heading:"the-problem-with-fixed-strategies",content:"You'd need to process everything, hoping to find what you need. Or write custom logic for each document type."},{heading:"the-agent-approach",content:"An extraction agent is an LLM with tools. It can:"},{heading:"the-agent-approach",content:"**Read** — View document content"},{heading:"the-agent-approach",content:"**Grep** — Search for patterns"},{heading:"the-agent-approach",content:"**Find** — Locate specific sections"},{heading:"the-agent-approach",content:"**Explore** — Navigate without predefined paths"},{heading:"the-agent-approach",content:"Instead of processing every chunk, the agent decides what to read based on what it's learned so far."},{heading:"the-virtual-filesystem",content:"The agent sees the document as a filesystem:"},{heading:"the-virtual-filesystem",content:"The manifest describes the document:"},{heading:"the-tools",content:"The agent has access to tools:"},{heading:"the-tools",content:"Tool"},{heading:"the-tools",content:"Purpose"},{heading:"the-tools",content:"`read(path)`"},{heading:"the-tools",content:"Read file content"},{heading:"the-tools",content:"`grep(pattern)`"},{heading:"the-tools",content:"Search across all files"},{heading:"the-tools",content:"`find(name)`"},{heading:"the-tools",content:"Find files by name"},{heading:"the-tools",content:"`ls(path)`"},{heading:"the-tools",content:"List directory contents"},{heading:"the-tools",content:"`set_output_data(data)`"},{heading:"the-tools",content:"Set extraction output"},{heading:"the-tools",content:"`update_output_data(data)`"},{heading:"the-tools",content:"Update output (merge)"},{heading:"the-tools",content:"`finish()`"},{heading:"the-tools",content:"Signal completion"},{heading:"the-tools",content:"`fail(reason)`"},{heading:"the-tools",content:"Signal failure"},{heading:"the-loop",content:"The LLM decides what to do next based on:"},{heading:"the-loop",content:"The extraction goal (schema)"},{heading:"the-loop",content:"What it's learned so far"},{heading:"the-loop",content:"What tools are available"},{heading:"example-contract-analysis",content:"Let's trace an agent extracting from a 15-page contract:"},{heading:"example-contract-analysis",content:"**Initial state:**"},{heading:"example-contract-analysis",content:"**Step 1: Explore**"},{heading:"example-contract-analysis",content:"**Step 2: Read**"},{heading:"example-contract-analysis",content:"**Step 3: Extract**"},{heading:"example-contract-analysis",content:"**Step 4: Continue**"},{heading:"example-contract-analysis",content:"**Step 5: Read**"},{heading:"example-contract-analysis",content:"**Step 6: Extract**"},{heading:"example-contract-analysis",content:"**Step 7: Search for obligations**"},{heading:"example-contract-analysis",content:"**Step 8: Read selectively**"},{heading:"example-contract-analysis",content:"**Step 9: Final extraction**"},{heading:"example-contract-analysis",content:"**Result:**"},{heading:"example-contract-analysis",content:"Read 4 pages out of 15"},{heading:"example-contract-analysis",content:"Found all required fields"},{heading:"example-contract-analysis",content:"No wasted processing"},{heading:"advantages",content:"**Adapts to document structure** — No need to know layout upfront"},{heading:"advantages",content:"**Efficient** — Only reads relevant sections"},{heading:"advantages",content:"**Handles variation** — Different documents, same agent"},{heading:"advantages",content:"**Explainable** — Can trace decision path"},{heading:"disadvantages",content:"**Variable token cost** — Depends on agent decisions"},{heading:"disadvantages",content:"**Requires tool-calling model** — GPT-4, Claude 3.5, etc."},{heading:"disadvantages",content:"**Non-deterministic** — Same document might take different paths"},{heading:"disadvantages",content:"**More complex** — Harder to debug than fixed strategies"},{heading:"when-to-use-the-agent",content:"**Use agent when:**"},{heading:"when-to-use-the-agent",content:"Document structure varies"},{heading:"when-to-use-the-agent",content:"You don't know what sections matter"},{heading:"when-to-use-the-agent",content:"Documents are long but sparse"},{heading:"when-to-use-the-agent",content:"You need to cross-reference sections"},{heading:"when-to-use-the-agent",content:"**Use simpler strategies when:**"},{heading:"when-to-use-the-agent",content:"Documents have consistent structure"},{heading:"when-to-use-the-agent",content:"Entire document is relevant"},{heading:"when-to-use-the-agent",content:"You know exactly what to extract"},{heading:"when-to-use-the-agent",content:"Cost predictability matters"},{heading:"prompting-strategy",content:"The agent prompt includes:"},{heading:"prompting-strategy",content:"**Goal** — The output schema"},{heading:"prompting-strategy",content:"**Available tools** — What it can do"},{heading:"prompting-strategy",content:"**Current state** — What's been extracted"},{heading:"prompting-strategy",content:"**Constraints** — Don't read everything, be efficient"},{heading:"prompting-strategy",content:"Example system prompt:"},{heading:"error-handling",content:"If the agent:"},{heading:"error-handling",content:"**Loops forever** — Max steps limit (default: 50)"},{heading:"error-handling",content:"**Extracts invalid data** — Validation feedback sent back"},{heading:"error-handling",content:"**Fails to extract** — Fallback to simple strategy"},{heading:"token-tracking",content:"Agent extractions track:"},{heading:"token-tracking",content:"Tokens per tool call"},{heading:"token-tracking",content:"Total tokens used"},{heading:"token-tracking",content:"Pages read"},{heading:"token-tracking",content:"Time taken"},{heading:"token-tracking",content:"This helps optimize prompts and estimate costs."},{heading:"comparison-with-other-strategies",content:"Strategy"},{heading:"comparison-with-other-strategies",content:"Pages Read"},{heading:"comparison-with-other-strategies",content:"Tokens"},{heading:"comparison-with-other-strategies",content:"Best For"},{heading:"comparison-with-other-strategies",content:"Simple"},{heading:"comparison-with-other-strategies",content:"All"},{heading:"comparison-with-other-strategies",content:"High"},{heading:"comparison-with-other-strategies",content:"Small documents"},{heading:"comparison-with-other-strategies",content:"Parallel"},{heading:"comparison-with-other-strategies",content:"All"},{heading:"comparison-with-other-strategies",content:"High"},{heading:"comparison-with-other-strategies",content:"Speed over cost"},{heading:"comparison-with-other-strategies",content:"Sequential"},{heading:"comparison-with-other-strategies",content:"All"},{heading:"comparison-with-other-strategies",content:"High"},{heading:"comparison-with-other-strategies",content:"Order matters"},{heading:"comparison-with-other-strategies",content:"**Agent**"},{heading:"comparison-with-other-strategies",content:"Variable"},{heading:"comparison-with-other-strategies",content:"Variable"},{heading:"comparison-with-other-strategies",content:"Unknown structure"},{heading:"comparison-with-other-strategies",content:"The agent might read 3 pages or 30. It depends on the document."},{heading:"see-also",content:"What is an Extraction Agent?"},{heading:"see-also",content:"Agent vs Simple vs Parallel"},{heading:"see-also",content:"Struktur Documentation"}],headings:[{id:"the-problem-with-fixed-strategies",content:"The Problem with Fixed Strategies"},{id:"the-agent-approach",content:"The Agent Approach"},{id:"how-it-works",content:"How It Works"},{id:"the-virtual-filesystem",content:"The Virtual Filesystem"},{id:"the-tools",content:"The Tools"},{id:"the-loop",content:"The Loop"},{id:"example-contract-analysis",content:"Example: Contract Analysis"},{id:"trade-offs",content:"Trade-offs"},{id:"advantages",content:"Advantages"},{id:"disadvantages",content:"Disadvantages"},{id:"when-to-use-the-agent",content:"When to Use the Agent"},{id:"implementation-details",content:"Implementation Details"},{id:"prompting-strategy",content:"Prompting Strategy"},{id:"error-handling",content:"Error Handling"},{id:"token-tracking",content:"Token Tracking"},{id:"comparison-with-other-strategies",content:"Comparison with Other Strategies"},{id:"see-also",content:"See Also"}]};const h=[{depth:2,url:"#the-problem-with-fixed-strategies",title:e.jsx(e.Fragment,{children:"The Problem with Fixed Strategies"})},{depth:2,url:"#the-agent-approach",title:e.jsx(e.Fragment,{children:"The Agent Approach"})},{depth:2,url:"#how-it-works",title:e.jsx(e.Fragment,{children:"How It Works"})},{depth:3,url:"#the-virtual-filesystem",title:e.jsx(e.Fragment,{children:"The Virtual Filesystem"})},{depth:3,url:"#the-tools",title:e.jsx(e.Fragment,{children:"The Tools"})},{depth:3,url:"#the-loop",title:e.jsx(e.Fragment,{children:"The Loop"})},{depth:2,url:"#example-contract-analysis",title:e.jsx(e.Fragment,{children:"Example: Contract Analysis"})},{depth:2,url:"#trade-offs",title:e.jsx(e.Fragment,{children:"Trade-offs"})},{depth:3,url:"#advantages",title:e.jsx(e.Fragment,{children:"Advantages"})},{depth:3,url:"#disadvantages",title:e.jsx(e.Fragment,{children:"Disadvantages"})},{depth:2,url:"#when-to-use-the-agent",title:e.jsx(e.Fragment,{children:"When to Use the Agent"})},{depth:2,url:"#implementation-details",title:e.jsx(e.Fragment,{children:"Implementation Details"})},{depth:3,url:"#prompting-strategy",title:e.jsx(e.Fragment,{children:"Prompting Strategy"})},{depth:3,url:"#error-handling",title:e.jsx(e.Fragment,{children:"Error Handling"})},{depth:3,url:"#token-tracking",title:e.jsx(e.Fragment,{children:"Token Tracking"})},{depth:2,url:"#comparison-with-other-strategies",title:e.jsx(e.Fragment,{children:"Comparison with Other Strategies"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See Also"})}];function s(t){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"Fixed extraction strategies work well when you know the document structure. But what if documents vary? What if you don't know which sections contain the data you need? An autonomous agent can explore documents and decide dynamically."}),`
`,e.jsx(n.h2,{id:"the-problem-with-fixed-strategies",children:"The Problem with Fixed Strategies"}),`
`,e.jsx(n.p,{children:"Traditional extraction follows a fixed path:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Parse document"}),`
`,e.jsx(n.li,{children:"Split into chunks"}),`
`,e.jsx(n.li,{children:"Extract from each chunk"}),`
`,e.jsx(n.li,{children:"Merge results"}),`
`]}),`
`,e.jsx(n.p,{children:"This works when:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Documents have consistent structure"}),`
`,e.jsx(n.li,{children:"You know which sections matter"}),`
`,e.jsx(n.li,{children:"The same approach works for all documents"}),`
`]}),`
`,e.jsx(n.p,{children:"But what if:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Document structure varies wildly?"}),`
`,e.jsx(n.li,{children:"Some documents are 5 pages, others 50?"}),`
`,e.jsx(n.li,{children:"Relevant data could be anywhere?"}),`
`]}),`
`,e.jsx(n.p,{children:"You'd need to process everything, hoping to find what you need. Or write custom logic for each document type."}),`
`,e.jsx(n.h2,{id:"the-agent-approach",children:"The Agent Approach"}),`
`,e.jsx(n.p,{children:"An extraction agent is an LLM with tools. It can:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Read"})," — View document content"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Grep"})," — Search for patterns"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Find"})," — Locate specific sections"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Explore"})," — Navigate without predefined paths"]}),`
`]}),`
`,e.jsx(n.p,{children:"Instead of processing every chunk, the agent decides what to read based on what it's learned so far."}),`
`,e.jsx(n.h2,{id:"how-it-works",children:"How It Works"}),`
`,e.jsx(n.h3,{id:"the-virtual-filesystem",children:"The Virtual Filesystem"}),`
`,e.jsx(n.p,{children:"The agent sees the document as a filesystem:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"/artifacts/"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"├── document.pdf/"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│   ├── page-1.txt"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│   ├── page-2.txt"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│   ├── page-3.txt"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│   └── manifest.json"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"└── manifest.json"})})]})})}),`
`,e.jsx(n.p,{children:"The manifest describes the document:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "name"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"contract.pdf"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "pages"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"15"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "hasTables"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "hasImages"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(n.h3,{id:"the-tools",children:"The Tools"}),`
`,e.jsx(n.p,{children:"The agent has access to tools:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Tool"}),e.jsx(n.th,{children:"Purpose"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"read(path)"})}),e.jsx(n.td,{children:"Read file content"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"grep(pattern)"})}),e.jsx(n.td,{children:"Search across all files"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"find(name)"})}),e.jsx(n.td,{children:"Find files by name"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"ls(path)"})}),e.jsx(n.td,{children:"List directory contents"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"set_output_data(data)"})}),e.jsx(n.td,{children:"Set extraction output"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"update_output_data(data)"})}),e.jsx(n.td,{children:"Update output (merge)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"finish()"})}),e.jsx(n.td,{children:"Signal completion"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"fail(reason)"})}),e.jsx(n.td,{children:"Signal failure"})]})]})]}),`
`,e.jsx(n.h3,{id:"the-loop",children:"The Loop"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"while"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"finished) {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  const"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" action"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" llm."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"decide"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    tools: availableTools,"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    goal: schema,"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    context: whatWeveLearned,"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  });"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  const"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" execute"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(action);"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (action.tool "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"==="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'finish'"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ||"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" action.tool "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"==="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'fail'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    finished "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(n.p,{children:"The LLM decides what to do next based on:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"The extraction goal (schema)"}),`
`,e.jsx(n.li,{children:"What it's learned so far"}),`
`,e.jsx(n.li,{children:"What tools are available"}),`
`]}),`
`,e.jsx(n.h2,{id:"example-contract-analysis",children:"Example: Contract Analysis"}),`
`,e.jsx(n.p,{children:"Let's trace an agent extracting from a 15-page contract:"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Initial state:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Goal: Extract { parties, effectiveDate, term, obligations }"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Known: Document has 15 pages, has tables"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Step 1: Explore"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "I need to find the parties. Let me search."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ grep("party|parties|between")'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ Found in page-2.txt, page-5.txt"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Step 2: Read"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:`Agent: "Let me read page 2 where 'parties' appears."`})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ read("/artifacts/contract.pdf/page-2.txt")'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ Content: "This Agreement is between ACME Corp and Beta Inc..."'})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Step 3: Extract"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "Found the parties. Let me set them."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ set_output_data({"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    parties: ["})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'      { name: "ACME Corp", role: "Party A" },'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'      { name: "Beta Inc", role: "Party B" }'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    ]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  })"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Step 4: Continue"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "Now I need the effective date."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ grep("effective|date|commencement")'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ Found in page-2.txt, page-8.txt"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Step 5: Read"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "Page 2 already read. Let me check page 8."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ read("/artifacts/contract.pdf/page-8.txt")'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ Content: "Term: This Agreement shall commence on January 1, 2025..."'})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Step 6: Extract"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "Found the effective date and term."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ update_output_data({"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'    effectiveDate: "2025-01-01",'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'    term: "2 years"'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  })"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Step 7: Search for obligations"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "I need obligations. Let me search."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ grep("shall|must|will|obligation")'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ Found in page-3.txt, page-4.txt, page-7.txt, page-10.txt"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Step 8: Read selectively"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:`Agent: "That's 4 pages. Let me read page 3 first."`})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ read("/artifacts/contract.pdf/page-3.txt")'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ Content: "Party A shall provide services..."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "Found obligations. Let me read page 4 for more."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ read("/artifacts/contract.pdf/page-4.txt")'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'→ Content: "Party B shall make payments..."'})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Step 9: Final extraction"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'Agent: "I have all required fields."'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ update_output_data({"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    obligations: ["})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'      { party: "Party A", obligation: "Provide services" },'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'      { party: "Party B", obligation: "Make payments" }'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    ]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  })"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"→ finish()"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Result:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Read 4 pages out of 15"}),`
`,e.jsx(n.li,{children:"Found all required fields"}),`
`,e.jsx(n.li,{children:"No wasted processing"}),`
`]}),`
`,e.jsx(n.h2,{id:"trade-offs",children:"Trade-offs"}),`
`,e.jsx(n.h3,{id:"advantages",children:"Advantages"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Adapts to document structure"})," — No need to know layout upfront"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Efficient"})," — Only reads relevant sections"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Handles variation"})," — Different documents, same agent"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Explainable"})," — Can trace decision path"]}),`
`]}),`
`,e.jsx(n.h3,{id:"disadvantages",children:"Disadvantages"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Variable token cost"})," — Depends on agent decisions"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Requires tool-calling model"})," — GPT-4, Claude 3.5, etc."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Non-deterministic"})," — Same document might take different paths"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"More complex"})," — Harder to debug than fixed strategies"]}),`
`]}),`
`,e.jsx(n.h2,{id:"when-to-use-the-agent",children:"When to Use the Agent"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Use agent when:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Document structure varies"}),`
`,e.jsx(n.li,{children:"You don't know what sections matter"}),`
`,e.jsx(n.li,{children:"Documents are long but sparse"}),`
`,e.jsx(n.li,{children:"You need to cross-reference sections"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Use simpler strategies when:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Documents have consistent structure"}),`
`,e.jsx(n.li,{children:"Entire document is relevant"}),`
`,e.jsx(n.li,{children:"You know exactly what to extract"}),`
`,e.jsx(n.li,{children:"Cost predictability matters"}),`
`]}),`
`,e.jsx(n.h2,{id:"implementation-details",children:"Implementation Details"}),`
`,e.jsx(n.h3,{id:"prompting-strategy",children:"Prompting Strategy"}),`
`,e.jsx(n.p,{children:"The agent prompt includes:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Goal"})," — The output schema"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Available tools"})," — What it can do"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Current state"})," — What's been extracted"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Constraints"})," — Don't read everything, be efficient"]}),`
`]}),`
`,e.jsx(n.p,{children:"Example system prompt:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"You are an extraction agent. Your goal is to extract data matching this schema:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"{schema}"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"You have access to a document filesystem. Use tools to explore and extract."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Rules:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- Be efficient. Don't read everything."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- Use grep to find relevant sections."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- Set output data when you have confident extractions."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- Call finish() when all required fields are populated."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"- Call fail() if you cannot complete the extraction."})})]})})}),`
`,e.jsx(n.h3,{id:"error-handling",children:"Error Handling"}),`
`,e.jsx(n.p,{children:"If the agent:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Loops forever"})," — Max steps limit (default: 50)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Extracts invalid data"})," — Validation feedback sent back"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Fails to extract"})," — Fallback to simple strategy"]}),`
`]}),`
`,e.jsx(n.h3,{id:"token-tracking",children:"Token Tracking"}),`
`,e.jsx(n.p,{children:"Agent extractions track:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Tokens per tool call"}),`
`,e.jsx(n.li,{children:"Total tokens used"}),`
`,e.jsx(n.li,{children:"Pages read"}),`
`,e.jsx(n.li,{children:"Time taken"}),`
`]}),`
`,e.jsx(n.p,{children:"This helps optimize prompts and estimate costs."}),`
`,e.jsx(n.h2,{id:"comparison-with-other-strategies",children:"Comparison with Other Strategies"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Strategy"}),e.jsx(n.th,{children:"Pages Read"}),e.jsx(n.th,{children:"Tokens"}),e.jsx(n.th,{children:"Best For"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Simple"}),e.jsx(n.td,{children:"All"}),e.jsx(n.td,{children:"High"}),e.jsx(n.td,{children:"Small documents"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Parallel"}),e.jsx(n.td,{children:"All"}),e.jsx(n.td,{children:"High"}),e.jsx(n.td,{children:"Speed over cost"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Sequential"}),e.jsx(n.td,{children:"All"}),e.jsx(n.td,{children:"High"}),e.jsx(n.td,{children:"Order matters"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Agent"})}),e.jsx(n.td,{children:"Variable"}),e.jsx(n.td,{children:"Variable"}),e.jsx(n.td,{children:"Unknown structure"})]})]})]}),`
`,e.jsx(n.p,{children:"The agent might read 3 pages or 30. It depends on the document."}),`
`,e.jsx(n.h2,{id:"see-also",children:"See Also"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs/what-is-an-extraction-agent",children:"What is an Extraction Agent?"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/blog/agent-vs-simple-vs-parallel",children:"Agent vs Simple vs Parallel"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs",children:"Struktur Documentation"})}),`
`]})]})}function c(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}export{a as _markdown,c as default,r as frontmatter,l as structuredData,h as toc};
