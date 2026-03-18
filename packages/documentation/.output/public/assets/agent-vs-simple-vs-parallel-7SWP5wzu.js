import{j as e}from"./main-DdjoLdxK.js";let a=`

Struktur offers multiple extraction strategies. Each has different trade-offs. Here's how to choose the right one for your use case.

The Decision Tree [#the-decision-tree]

\`\`\`
Start: What's your document like?
│
├─ Fits in context window?
│   └─ YES → Use "simple"
│
├─ Need speed over cross-chunk context?
│   └─ YES → Use "parallel"
│
├─ Order matters (building up results)?
│   └─ YES → Use "sequential"
│
├─ Unknown structure, need exploration?
│   └─ YES → Use "agent"
│
└─ Need maximum quality?
    └─ YES → Use "doublePass"
\`\`\`

Strategy Overview [#strategy-overview]

| Strategy   | Chunks   | Parallelism | Best For          |
| ---------- | -------- | ----------- | ----------------- |
| Simple     | 1        | N/A         | Small documents   |
| Parallel   | Many     | Yes         | Speed             |
| Sequential | Many     | No          | Order matters     |
| Agent      | Variable | No          | Unknown structure |
| DoublePass | Many     | No          | Quality           |

Simple Strategy [#simple-strategy]

**When to use:**

* Document fits in context window
* No chunking needed
* Single LLM call

**How it works:**

\`\`\`
Document → [LLM] → Output
\`\`\`

**Example:**

\`\`\`typescript
const result = await extract({
  artifacts: [{ path: 'invoice.pdf' }],
  schema: invoiceSchema,
  strategy: 'simple',
});
\`\`\`

**Pros:**

* Fastest (single LLM call)
* Lowest cost
* No merging complexity

**Cons:**

* Only works for small documents
* No cross-chunk context (not applicable)

**Typical use case:** Single-page invoices, short forms, simple contracts.

Parallel Strategy [#parallel-strategy]

**When to use:**

* Document doesn't fit in context
* Speed matters more than cross-chunk context
* Chunks are independent

**How it works:**

\`\`\`
Document → [Chunk 1] → [LLM] → Result 1 ┐
         → [Chunk 2] → [LLM] → Result 2 ├→ Merge → Output
         → [Chunk 3] → [LLM] → Result 3 ┘
\`\`\`

All chunks processed simultaneously.

**Example:**

\`\`\`typescript
const result = await extract({
  artifacts: [{ path: 'catalog.pdf' }],
  schema: productSchema,
  strategy: 'parallel',
});
\`\`\`

**Pros:**

* Fast (parallel processing)
* Scales to large documents
* Good for independent chunks

**Cons:**

* No cross-chunk context
* May miss relationships between chunks
* Merging can introduce errors

**Typical use case:** Product catalogs, directories, documents with independent sections.

Sequential Strategy [#sequential-strategy]

**When to use:**

* Order matters
* Building up results across chunks
* Later chunks depend on earlier context

**How it works:**

\`\`\`
Document → [Chunk 1] → [LLM] → Result 1
         → [Chunk 2] → [LLM] → Result 2 (with context from 1)
         → [Chunk 3] → [LLM] → Result 3 (with context from 1,2)
         → Merge → Output
\`\`\`

**Example:**

\`\`\`typescript
const result = await extract({
  artifacts: [{ path: 'contract.pdf' }],
  schema: contractSchema,
  strategy: 'sequential',
});
\`\`\`

**Pros:**

* Maintains context across chunks
* Good for building up results
* Handles cross-chunk references

**Cons:**

* Slower than parallel (sequential processing)
* Higher cost (more context per call)

**Typical use case:** Multi-page contracts, documents with running totals, narratives.

Agent Strategy [#agent-strategy]

**When to use:**

* Document structure unknown
* Need to explore before extracting
* Variable document types

**How it works:**

\`\`\`
Document → [Agent explores] → [Agent reads relevant sections] → Output
\`\`\`

The agent decides what to read based on what it finds.

**Example:**

\`\`\`typescript
const result = await extract({
  artifacts: [{ path: 'legal-brief.pdf' }],
  schema: briefSchema,
  strategy: 'agent',
});
\`\`\`

**Pros:**

* Adapts to document structure
* Only reads relevant sections
* Handles variation well

**Cons:**

* Variable cost (depends on agent decisions)
* Requires tool-calling model
* Non-deterministic

**Typical use case:** Legal documents, research papers, documents with unknown structure.

Auto-Merge Variants [#auto-merge-variants]

Both parallel and sequential have auto-merge variants:

* \`parallelAutoMerge\` — Parallel + automatic deduplication
* \`sequentialAutoMerge\` — Sequential + automatic deduplication

Use these when:

* Schema has arrays
* Chunks might extract same entities
* You want automatic deduplication

**Example:**

\`\`\`typescript
const result = await extract({
  artifacts: [{ path: 'report.pdf' }],
  schema: reportSchema, // has arrays
  strategy: 'parallelAutoMerge',
});
\`\`\`

DoublePass Strategy [#doublepass-strategy]

**When to use:**

* Quality is critical
* Willing to pay for verification
* High-stakes extractions

**How it works:**

\`\`\`
Document → [Pass 1: Extract] → Result 1
         → [Pass 2: Verify]  → Verified Result
\`\`\`

Second LLM call verifies the first.

**Example:**

\`\`\`typescript
const result = await extract({
  artifacts: [{ path: 'financial-statement.pdf' }],
  schema: financialSchema,
  strategy: 'doublePass',
});
\`\`\`

**Pros:**

* Higher accuracy
* Catches extraction errors
* Good for critical data

**Cons:**

* 2x cost (two LLM passes)
* Slower

**Typical use case:** Financial documents, legal contracts, medical records.

Token Cost Comparison [#token-cost-comparison]

Processing a 20-page contract:

| Strategy   | LLM Calls | Approx Tokens     | Cost (GPT-4o) |
| ---------- | --------- | ----------------- | ------------- |
| Simple     | 1         | N/A (doesn't fit) | N/A           |
| Parallel   | 5         | 50k               | $0.125        |
| Sequential | 5         | 75k               | $0.19         |
| Agent      | 3-10      | 30k-100k          | $0.08-$0.25   |
| DoublePass | 10        | 100k              | $0.25         |

*Approximate. Actual costs vary by document and model.*

Real Examples [#real-examples]

Invoice (1 page) [#invoice-1-page]

\`\`\`typescript
// Simple is best
strategy: 'simple'
// Single call, fast, cheap
\`\`\`

Product Catalog (50 pages) [#product-catalog-50-pages]

\`\`\`typescript
// Parallel is best
strategy: 'parallelAutoMerge'
// Products are independent, dedupe similar items
\`\`\`

Legal Contract (30 pages) [#legal-contract-30-pages]

\`\`\`typescript
// Sequential or Agent
strategy: 'sequential'  // if structure is known
strategy: 'agent'       // if structure varies
\`\`\`

Financial Statement (20 pages) [#financial-statement-20-pages]

\`\`\`typescript
// DoublePass for quality
strategy: 'doublePass'
// Verify critical numbers
\`\`\`

Combining Strategies [#combining-strategies]

You can use different strategies for different document types:

\`\`\`typescript
function chooseStrategy(document: Document): Strategy {
  if (document.pageCount === 1) return 'simple';
  if (document.type === 'catalog') return 'parallelAutoMerge';
  if (document.type === 'contract') return 'agent';
  if (document.type === 'financial') return 'doublePass';
  return 'sequential';
}

const result = await extract({
  artifacts: [document],
  schema: schema,
  strategy: chooseStrategy(document),
});
\`\`\`

See Also [#see-also]

* [What is an Extraction Agent?](/docs/what-is-an-extraction-agent)
* [Building an Autonomous Extraction Agent](/blog/building-autonomous-extraction-agent)
* [Struktur Documentation](/docs)
`,l={title:"Agent vs Simple vs Parallel: Choosing a Strategy",description:"When to use each extraction strategy"},r={contents:[{heading:void 0,content:"Struktur offers multiple extraction strategies. Each has different trade-offs. Here's how to choose the right one for your use case."},{heading:"strategy-overview",content:"Strategy"},{heading:"strategy-overview",content:"Chunks"},{heading:"strategy-overview",content:"Parallelism"},{heading:"strategy-overview",content:"Best For"},{heading:"strategy-overview",content:"Simple"},{heading:"strategy-overview",content:"1"},{heading:"strategy-overview",content:"N/A"},{heading:"strategy-overview",content:"Small documents"},{heading:"strategy-overview",content:"Parallel"},{heading:"strategy-overview",content:"Many"},{heading:"strategy-overview",content:"Yes"},{heading:"strategy-overview",content:"Speed"},{heading:"strategy-overview",content:"Sequential"},{heading:"strategy-overview",content:"Many"},{heading:"strategy-overview",content:"No"},{heading:"strategy-overview",content:"Order matters"},{heading:"strategy-overview",content:"Agent"},{heading:"strategy-overview",content:"Variable"},{heading:"strategy-overview",content:"No"},{heading:"strategy-overview",content:"Unknown structure"},{heading:"strategy-overview",content:"DoublePass"},{heading:"strategy-overview",content:"Many"},{heading:"strategy-overview",content:"No"},{heading:"strategy-overview",content:"Quality"},{heading:"simple-strategy",content:"**When to use:**"},{heading:"simple-strategy",content:"Document fits in context window"},{heading:"simple-strategy",content:"No chunking needed"},{heading:"simple-strategy",content:"Single LLM call"},{heading:"simple-strategy",content:"**How it works:**"},{heading:"simple-strategy",content:"**Example:**"},{heading:"simple-strategy",content:"**Pros:**"},{heading:"simple-strategy",content:"Fastest (single LLM call)"},{heading:"simple-strategy",content:"Lowest cost"},{heading:"simple-strategy",content:"No merging complexity"},{heading:"simple-strategy",content:"**Cons:**"},{heading:"simple-strategy",content:"Only works for small documents"},{heading:"simple-strategy",content:"No cross-chunk context (not applicable)"},{heading:"simple-strategy",content:"**Typical use case:** Single-page invoices, short forms, simple contracts."},{heading:"parallel-strategy",content:"**When to use:**"},{heading:"parallel-strategy",content:"Document doesn't fit in context"},{heading:"parallel-strategy",content:"Speed matters more than cross-chunk context"},{heading:"parallel-strategy",content:"Chunks are independent"},{heading:"parallel-strategy",content:"**How it works:**"},{heading:"parallel-strategy",content:"All chunks processed simultaneously."},{heading:"parallel-strategy",content:"**Example:**"},{heading:"parallel-strategy",content:"**Pros:**"},{heading:"parallel-strategy",content:"Fast (parallel processing)"},{heading:"parallel-strategy",content:"Scales to large documents"},{heading:"parallel-strategy",content:"Good for independent chunks"},{heading:"parallel-strategy",content:"**Cons:**"},{heading:"parallel-strategy",content:"No cross-chunk context"},{heading:"parallel-strategy",content:"May miss relationships between chunks"},{heading:"parallel-strategy",content:"Merging can introduce errors"},{heading:"parallel-strategy",content:"**Typical use case:** Product catalogs, directories, documents with independent sections."},{heading:"sequential-strategy",content:"**When to use:**"},{heading:"sequential-strategy",content:"Order matters"},{heading:"sequential-strategy",content:"Building up results across chunks"},{heading:"sequential-strategy",content:"Later chunks depend on earlier context"},{heading:"sequential-strategy",content:"**How it works:**"},{heading:"sequential-strategy",content:"**Example:**"},{heading:"sequential-strategy",content:"**Pros:**"},{heading:"sequential-strategy",content:"Maintains context across chunks"},{heading:"sequential-strategy",content:"Good for building up results"},{heading:"sequential-strategy",content:"Handles cross-chunk references"},{heading:"sequential-strategy",content:"**Cons:**"},{heading:"sequential-strategy",content:"Slower than parallel (sequential processing)"},{heading:"sequential-strategy",content:"Higher cost (more context per call)"},{heading:"sequential-strategy",content:"**Typical use case:** Multi-page contracts, documents with running totals, narratives."},{heading:"agent-strategy",content:"**When to use:**"},{heading:"agent-strategy",content:"Document structure unknown"},{heading:"agent-strategy",content:"Need to explore before extracting"},{heading:"agent-strategy",content:"Variable document types"},{heading:"agent-strategy",content:"**How it works:**"},{heading:"agent-strategy",content:"The agent decides what to read based on what it finds."},{heading:"agent-strategy",content:"**Example:**"},{heading:"agent-strategy",content:"**Pros:**"},{heading:"agent-strategy",content:"Adapts to document structure"},{heading:"agent-strategy",content:"Only reads relevant sections"},{heading:"agent-strategy",content:"Handles variation well"},{heading:"agent-strategy",content:"**Cons:**"},{heading:"agent-strategy",content:"Variable cost (depends on agent decisions)"},{heading:"agent-strategy",content:"Requires tool-calling model"},{heading:"agent-strategy",content:"Non-deterministic"},{heading:"agent-strategy",content:"**Typical use case:** Legal documents, research papers, documents with unknown structure."},{heading:"auto-merge-variants",content:"Both parallel and sequential have auto-merge variants:"},{heading:"auto-merge-variants",content:"`parallelAutoMerge` — Parallel + automatic deduplication"},{heading:"auto-merge-variants",content:"`sequentialAutoMerge` — Sequential + automatic deduplication"},{heading:"auto-merge-variants",content:"Use these when:"},{heading:"auto-merge-variants",content:"Schema has arrays"},{heading:"auto-merge-variants",content:"Chunks might extract same entities"},{heading:"auto-merge-variants",content:"You want automatic deduplication"},{heading:"auto-merge-variants",content:"**Example:**"},{heading:"doublepass-strategy",content:"**When to use:**"},{heading:"doublepass-strategy",content:"Quality is critical"},{heading:"doublepass-strategy",content:"Willing to pay for verification"},{heading:"doublepass-strategy",content:"High-stakes extractions"},{heading:"doublepass-strategy",content:"**How it works:**"},{heading:"doublepass-strategy",content:"Second LLM call verifies the first."},{heading:"doublepass-strategy",content:"**Example:**"},{heading:"doublepass-strategy",content:"**Pros:**"},{heading:"doublepass-strategy",content:"Higher accuracy"},{heading:"doublepass-strategy",content:"Catches extraction errors"},{heading:"doublepass-strategy",content:"Good for critical data"},{heading:"doublepass-strategy",content:"**Cons:**"},{heading:"doublepass-strategy",content:"2x cost (two LLM passes)"},{heading:"doublepass-strategy",content:"Slower"},{heading:"doublepass-strategy",content:"**Typical use case:** Financial documents, legal contracts, medical records."},{heading:"token-cost-comparison",content:"Processing a 20-page contract:"},{heading:"token-cost-comparison",content:"Strategy"},{heading:"token-cost-comparison",content:"LLM Calls"},{heading:"token-cost-comparison",content:"Approx Tokens"},{heading:"token-cost-comparison",content:"Cost (GPT-4o)"},{heading:"token-cost-comparison",content:"Simple"},{heading:"token-cost-comparison",content:"1"},{heading:"token-cost-comparison",content:"N/A (doesn't fit)"},{heading:"token-cost-comparison",content:"N/A"},{heading:"token-cost-comparison",content:"Parallel"},{heading:"token-cost-comparison",content:"5"},{heading:"token-cost-comparison",content:"50k"},{heading:"token-cost-comparison",content:"$0.125"},{heading:"token-cost-comparison",content:"Sequential"},{heading:"token-cost-comparison",content:"5"},{heading:"token-cost-comparison",content:"75k"},{heading:"token-cost-comparison",content:"$0.19"},{heading:"token-cost-comparison",content:"Agent"},{heading:"token-cost-comparison",content:"3-10"},{heading:"token-cost-comparison",content:"30k-100k"},{heading:"token-cost-comparison",content:"$0.08-$0.25"},{heading:"token-cost-comparison",content:"DoublePass"},{heading:"token-cost-comparison",content:"10"},{heading:"token-cost-comparison",content:"100k"},{heading:"token-cost-comparison",content:"$0.25"},{heading:"token-cost-comparison",content:"*Approximate. Actual costs vary by document and model.*"},{heading:"combining-strategies",content:"You can use different strategies for different document types:"},{heading:"see-also",content:"What is an Extraction Agent?"},{heading:"see-also",content:"Building an Autonomous Extraction Agent"},{heading:"see-also",content:"Struktur Documentation"}],headings:[{id:"the-decision-tree",content:"The Decision Tree"},{id:"strategy-overview",content:"Strategy Overview"},{id:"simple-strategy",content:"Simple Strategy"},{id:"parallel-strategy",content:"Parallel Strategy"},{id:"sequential-strategy",content:"Sequential Strategy"},{id:"agent-strategy",content:"Agent Strategy"},{id:"auto-merge-variants",content:"Auto-Merge Variants"},{id:"doublepass-strategy",content:"DoublePass Strategy"},{id:"token-cost-comparison",content:"Token Cost Comparison"},{id:"real-examples",content:"Real Examples"},{id:"invoice-1-page",content:"Invoice (1 page)"},{id:"product-catalog-50-pages",content:"Product Catalog (50 pages)"},{id:"legal-contract-30-pages",content:"Legal Contract (30 pages)"},{id:"financial-statement-20-pages",content:"Financial Statement (20 pages)"},{id:"combining-strategies",content:"Combining Strategies"},{id:"see-also",content:"See Also"}]};const h=[{depth:2,url:"#the-decision-tree",title:e.jsx(e.Fragment,{children:"The Decision Tree"})},{depth:2,url:"#strategy-overview",title:e.jsx(e.Fragment,{children:"Strategy Overview"})},{depth:2,url:"#simple-strategy",title:e.jsx(e.Fragment,{children:"Simple Strategy"})},{depth:2,url:"#parallel-strategy",title:e.jsx(e.Fragment,{children:"Parallel Strategy"})},{depth:2,url:"#sequential-strategy",title:e.jsx(e.Fragment,{children:"Sequential Strategy"})},{depth:2,url:"#agent-strategy",title:e.jsx(e.Fragment,{children:"Agent Strategy"})},{depth:2,url:"#auto-merge-variants",title:e.jsx(e.Fragment,{children:"Auto-Merge Variants"})},{depth:2,url:"#doublepass-strategy",title:e.jsx(e.Fragment,{children:"DoublePass Strategy"})},{depth:2,url:"#token-cost-comparison",title:e.jsx(e.Fragment,{children:"Token Cost Comparison"})},{depth:2,url:"#real-examples",title:e.jsx(e.Fragment,{children:"Real Examples"})},{depth:3,url:"#invoice-1-page",title:e.jsx(e.Fragment,{children:"Invoice (1 page)"})},{depth:3,url:"#product-catalog-50-pages",title:e.jsx(e.Fragment,{children:"Product Catalog (50 pages)"})},{depth:3,url:"#legal-contract-30-pages",title:e.jsx(e.Fragment,{children:"Legal Contract (30 pages)"})},{depth:3,url:"#financial-statement-20-pages",title:e.jsx(e.Fragment,{children:"Financial Statement (20 pages)"})},{depth:2,url:"#combining-strategies",title:e.jsx(e.Fragment,{children:"Combining Strategies"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See Also"})}];function i(n){const s={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.p,{children:"Struktur offers multiple extraction strategies. Each has different trade-offs. Here's how to choose the right one for your use case."}),`
`,e.jsx(s.h2,{id:"the-decision-tree",children:"The Decision Tree"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Start: What's your document like?"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"│"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"├─ Fits in context window?"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'│   └─ YES → Use "simple"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"│"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"├─ Need speed over cross-chunk context?"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'│   └─ YES → Use "parallel"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"│"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"├─ Order matters (building up results)?"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'│   └─ YES → Use "sequential"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"│"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"├─ Unknown structure, need exploration?"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'│   └─ YES → Use "agent"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"│"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"└─ Need maximum quality?"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'    └─ YES → Use "doublePass"'})})]})})}),`
`,e.jsx(s.h2,{id:"strategy-overview",children:"Strategy Overview"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Strategy"}),e.jsx(s.th,{children:"Chunks"}),e.jsx(s.th,{children:"Parallelism"}),e.jsx(s.th,{children:"Best For"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Simple"}),e.jsx(s.td,{children:"1"}),e.jsx(s.td,{children:"N/A"}),e.jsx(s.td,{children:"Small documents"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Parallel"}),e.jsx(s.td,{children:"Many"}),e.jsx(s.td,{children:"Yes"}),e.jsx(s.td,{children:"Speed"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Sequential"}),e.jsx(s.td,{children:"Many"}),e.jsx(s.td,{children:"No"}),e.jsx(s.td,{children:"Order matters"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Agent"}),e.jsx(s.td,{children:"Variable"}),e.jsx(s.td,{children:"No"}),e.jsx(s.td,{children:"Unknown structure"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"DoublePass"}),e.jsx(s.td,{children:"Many"}),e.jsx(s.td,{children:"No"}),e.jsx(s.td,{children:"Quality"})]})]})]}),`
`,e.jsx(s.h2,{id:"simple-strategy",children:"Simple Strategy"}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"When to use:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Document fits in context window"}),`
`,e.jsx(s.li,{children:"No chunking needed"}),`
`,e.jsx(s.li,{children:"Single LLM call"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"How it works:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Document → [LLM] → Output"})})})})}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Example:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'invoice.pdf'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: invoiceSchema,"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'simple'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Pros:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Fastest (single LLM call)"}),`
`,e.jsx(s.li,{children:"Lowest cost"}),`
`,e.jsx(s.li,{children:"No merging complexity"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Cons:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Only works for small documents"}),`
`,e.jsx(s.li,{children:"No cross-chunk context (not applicable)"}),`
`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Typical use case:"})," Single-page invoices, short forms, simple contracts."]}),`
`,e.jsx(s.h2,{id:"parallel-strategy",children:"Parallel Strategy"}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"When to use:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Document doesn't fit in context"}),`
`,e.jsx(s.li,{children:"Speed matters more than cross-chunk context"}),`
`,e.jsx(s.li,{children:"Chunks are independent"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"How it works:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Document → [Chunk 1] → [LLM] → Result 1 ┐"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"         → [Chunk 2] → [LLM] → Result 2 ├→ Merge → Output"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"         → [Chunk 3] → [LLM] → Result 3 ┘"})})]})})}),`
`,e.jsx(s.p,{children:"All chunks processed simultaneously."}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Example:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'catalog.pdf'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: productSchema,"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'parallel'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Pros:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Fast (parallel processing)"}),`
`,e.jsx(s.li,{children:"Scales to large documents"}),`
`,e.jsx(s.li,{children:"Good for independent chunks"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Cons:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"No cross-chunk context"}),`
`,e.jsx(s.li,{children:"May miss relationships between chunks"}),`
`,e.jsx(s.li,{children:"Merging can introduce errors"}),`
`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Typical use case:"})," Product catalogs, directories, documents with independent sections."]}),`
`,e.jsx(s.h2,{id:"sequential-strategy",children:"Sequential Strategy"}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"When to use:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Order matters"}),`
`,e.jsx(s.li,{children:"Building up results across chunks"}),`
`,e.jsx(s.li,{children:"Later chunks depend on earlier context"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"How it works:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Document → [Chunk 1] → [LLM] → Result 1"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"         → [Chunk 2] → [LLM] → Result 2 (with context from 1)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"         → [Chunk 3] → [LLM] → Result 3 (with context from 1,2)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"         → Merge → Output"})})]})})}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Example:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'contract.pdf'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: contractSchema,"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'sequential'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Pros:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Maintains context across chunks"}),`
`,e.jsx(s.li,{children:"Good for building up results"}),`
`,e.jsx(s.li,{children:"Handles cross-chunk references"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Cons:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Slower than parallel (sequential processing)"}),`
`,e.jsx(s.li,{children:"Higher cost (more context per call)"}),`
`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Typical use case:"})," Multi-page contracts, documents with running totals, narratives."]}),`
`,e.jsx(s.h2,{id:"agent-strategy",children:"Agent Strategy"}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"When to use:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Document structure unknown"}),`
`,e.jsx(s.li,{children:"Need to explore before extracting"}),`
`,e.jsx(s.li,{children:"Variable document types"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"How it works:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Document → [Agent explores] → [Agent reads relevant sections] → Output"})})})})}),`
`,e.jsx(s.p,{children:"The agent decides what to read based on what it finds."}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Example:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'legal-brief.pdf'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: briefSchema,"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'agent'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Pros:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Adapts to document structure"}),`
`,e.jsx(s.li,{children:"Only reads relevant sections"}),`
`,e.jsx(s.li,{children:"Handles variation well"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Cons:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Variable cost (depends on agent decisions)"}),`
`,e.jsx(s.li,{children:"Requires tool-calling model"}),`
`,e.jsx(s.li,{children:"Non-deterministic"}),`
`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Typical use case:"})," Legal documents, research papers, documents with unknown structure."]}),`
`,e.jsx(s.h2,{id:"auto-merge-variants",children:"Auto-Merge Variants"}),`
`,e.jsx(s.p,{children:"Both parallel and sequential have auto-merge variants:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"parallelAutoMerge"})," — Parallel + automatic deduplication"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"sequentialAutoMerge"})," — Sequential + automatic deduplication"]}),`
`]}),`
`,e.jsx(s.p,{children:"Use these when:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Schema has arrays"}),`
`,e.jsx(s.li,{children:"Chunks might extract same entities"}),`
`,e.jsx(s.li,{children:"You want automatic deduplication"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Example:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'report.pdf'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: reportSchema, "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// has arrays"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'parallelAutoMerge'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(s.h2,{id:"doublepass-strategy",children:"DoublePass Strategy"}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"When to use:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Quality is critical"}),`
`,e.jsx(s.li,{children:"Willing to pay for verification"}),`
`,e.jsx(s.li,{children:"High-stakes extractions"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"How it works:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Document → [Pass 1: Extract] → Result 1"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"         → [Pass 2: Verify]  → Verified Result"})})]})})}),`
`,e.jsx(s.p,{children:"Second LLM call verifies the first."}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Example:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'financial-statement.pdf'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: financialSchema,"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'doublePass'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Pros:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Higher accuracy"}),`
`,e.jsx(s.li,{children:"Catches extraction errors"}),`
`,e.jsx(s.li,{children:"Good for critical data"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Cons:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"2x cost (two LLM passes)"}),`
`,e.jsx(s.li,{children:"Slower"}),`
`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Typical use case:"})," Financial documents, legal contracts, medical records."]}),`
`,e.jsx(s.h2,{id:"token-cost-comparison",children:"Token Cost Comparison"}),`
`,e.jsx(s.p,{children:"Processing a 20-page contract:"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Strategy"}),e.jsx(s.th,{children:"LLM Calls"}),e.jsx(s.th,{children:"Approx Tokens"}),e.jsx(s.th,{children:"Cost (GPT-4o)"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Simple"}),e.jsx(s.td,{children:"1"}),e.jsx(s.td,{children:"N/A (doesn't fit)"}),e.jsx(s.td,{children:"N/A"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Parallel"}),e.jsx(s.td,{children:"5"}),e.jsx(s.td,{children:"50k"}),e.jsx(s.td,{children:"$0.125"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Sequential"}),e.jsx(s.td,{children:"5"}),e.jsx(s.td,{children:"75k"}),e.jsx(s.td,{children:"$0.19"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Agent"}),e.jsx(s.td,{children:"3-10"}),e.jsx(s.td,{children:"30k-100k"}),e.jsx(s.td,{children:"$0.08-$0.25"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"DoublePass"}),e.jsx(s.td,{children:"10"}),e.jsx(s.td,{children:"100k"}),e.jsx(s.td,{children:"$0.25"})]})]})]}),`
`,e.jsx(s.p,{children:e.jsx(s.em,{children:"Approximate. Actual costs vary by document and model."})}),`
`,e.jsx(s.h2,{id:"real-examples",children:"Real Examples"}),`
`,e.jsx(s.h3,{id:"invoice-1-page",children:"Invoice (1 page)"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Simple is best"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"strategy"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'simple'"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Single call, fast, cheap"})})]})})}),`
`,e.jsx(s.h3,{id:"product-catalog-50-pages",children:"Product Catalog (50 pages)"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Parallel is best"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"strategy"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'parallelAutoMerge'"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Products are independent, dedupe similar items"})})]})})}),`
`,e.jsx(s.h3,{id:"legal-contract-30-pages",children:"Legal Contract (30 pages)"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Sequential or Agent"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"strategy"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'sequential'"}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // if structure is known"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"strategy"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'agent'"}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"       // if structure varies"})]})]})})}),`
`,e.jsx(s.h3,{id:"financial-statement-20-pages",children:"Financial Statement (20 pages)"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// DoublePass for quality"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"strategy"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'doublePass'"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Verify critical numbers"})})]})})}),`
`,e.jsx(s.h2,{id:"combining-strategies",children:"Combining Strategies"}),`
`,e.jsx(s.p,{children:"You can use different strategies for different document types:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"function"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" chooseStrategy"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"document"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Document"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Strategy"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (document.pageCount "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"==="}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"return"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'simple'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (document.type "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"==="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'catalog'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"return"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'parallelAutoMerge'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (document.type "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"==="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'contract'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"return"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'agent'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (document.type "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"==="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'financial'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"return"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'doublePass'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  return"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'sequential'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [document],"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: schema,"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"chooseStrategy"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(document),"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(s.h2,{id:"see-also",children:"See Also"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:e.jsx(s.a,{href:"/docs/what-is-an-extraction-agent",children:"What is an Extraction Agent?"})}),`
`,e.jsx(s.li,{children:e.jsx(s.a,{href:"/blog/building-autonomous-extraction-agent",children:"Building an Autonomous Extraction Agent"})}),`
`,e.jsx(s.li,{children:e.jsx(s.a,{href:"/docs",children:"Struktur Documentation"})}),`
`]})]})}function c(n={}){const{wrapper:s}=n.components||{};return s?e.jsx(s,{...n,children:e.jsx(i,{...n})}):i(n)}export{a as _markdown,c as default,l as frontmatter,r as structuredData,h as toc};
