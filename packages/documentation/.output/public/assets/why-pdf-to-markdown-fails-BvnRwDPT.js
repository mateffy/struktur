import{j as e}from"./main-BiZqUaIh.js";let a=`

The common approach to document extraction is: PDF → Markdown → LLM → JSON. It seems straightforward. Convert your PDF to Markdown, feed it to an LLM, and get structured JSON out. But this approach loses critical information that makes extraction unreliable.

The Promise [#the-promise]

Markdown is a reasonable intermediate format:

* LLMs understand Markdown well
* It's token-efficient compared to raw text
* Preserves some structure (headings, lists, tables)
* Easy to debug and inspect

Tools like \`pandoc\`, \`marker\`, and \`pymupdf\` convert PDFs to Markdown with decent quality. For human reading, it works great.

What Gets Lost [#what-gets-lost]

For LLM extraction, Markdown loses information that matters:

1. Spatial Relationships [#1-spatial-relationships]

Markdown is linear. PDFs are 2D.

\`\`\`
PDF layout:                    Markdown output:
┌─────────────────────────┐    Total: $1,234.56
│ Total: $1,234.56         │    Date: 2024-03-15
│ Date: 2024-03-15         │    (no indication these are related)
│                         │
│ Line Items:             │    Line Items:
│  Widget A    $100.00    │    Widget A $100.00
│  Widget B    $200.00    │    Widget B $200.00
└─────────────────────────┘
\`\`\`

In the PDF, "Total" and "Date" are visually grouped. In Markdown, they're just sequential lines. The LLM has no signal that they're related.

2. Table Structure [#2-table-structure]

Markdown tables work for simple cases. But real-world tables have:

* **Merged cells** — Markdown can't represent
* **Nested tables** — Lost entirely
* **Multi-row headers** — Flattened incorrectly
* **Column alignment** — Not preserved

\`\`\`
PDF table with merged cell:    Markdown (broken):
┌──────────┬───────┐          | Category | Item |
│ Category │ Item  │          |----------|-------|
│          │ A     │          | A        | A     |  ← wrong
│ Widgets  ├───────┤          | B        | B     |  ← wrong
│          │ B     │          | C        | C     |  ← wrong
└──────────┴───────┘
\`\`\`

3. Reading Order [#3-reading-order]

Multi-column layouts get scrambled:

\`\`\`
PDF (2 columns):               Markdown (wrong order):
┌─────────┬─────────┐         Introduction text...
│ Intro   │ Sidebar │         More intro text...
│ text... │ text... │         Sidebar text...      ← should be later
│ More    │ More    │         More sidebar text... ← should be later
│ intro...│ sidebar │         Conclusion text...
│ Conclu- │         │
│ sion... │         │
└─────────┴─────────┘
\`\`\`

The LLM receives text in the wrong order, breaking context.

4. Confidence Signals [#4-confidence-signals]

OCR-generated Markdown has no confidence scores. The LLM sees:

\`\`\`
Invoice Number: lNVOlCE-2024-00l
\`\`\`

Is that "INVOICE-2024-001" or "lNVOlCE-2024-00l"? The LLM can't know the OCR was uncertain. It will hallucinate a reasonable interpretation.

5. Bounding Boxes [#5-bounding-boxes]

When extraction fails, you can't trace back:

* "Where did this value come from?"
* "Which page had the total?"
* "Was this handwritten or printed?"

Markdown has no location information. You can't cite sources or debug failures.

Real Example: Invoice Extraction [#real-example-invoice-extraction]

Consider this invoice:

\`\`\`
┌────────────────────────────────────┐
│ ACME Corp                          │
│ Invoice #12345                     │
│                                    │
│ Bill To:           Ship To:        │
│ John Smith         John Smith      │
│ 123 Main St        456 Oak Ave     │
│                    (different!)    │
│                                    │
│ Items:                             │
│ ┌──────────────┬───────┬──────┐   │
│ │ Description  │ Qty   │ Price│   │
│ ├──────────────┼───────┼──────┤   │
│ │ Widget A     │ 2     │ $50  │   │
│ │ Widget B     │ 1     │ $75  │   │
│ │ Widget C     │ 3     │ $25  │   │
│ └──────────────┴───────┴──────┘   │
│                         ───────── │
│ Subtotal:               $275.00   │
│ Tax (8%):               $22.00    │
│                         ───────── │
│ Total:                  $297.00   │
│                                    │
│ Notes: See attached terms.         │
└────────────────────────────────────┘
\`\`\`

**Markdown output:**

\`\`\`markdown
ACME Corp
Invoice #12345

Bill To: Ship To:
John Smith John Smith
123 Main St 456 Oak Ave

Items:
| Description | Qty | Price |
|-------------|-----|-------|
| Widget A | 2 | $50 |
| Widget B | 1 | $75 |
| Widget C | 3 | $25 |

Subtotal: $275.00
Tax (8%): $22.00
Total: $297.00

Notes: See attached terms.
\`\`\`

**Problems:**

1. "Bill To" and "Ship To" are now on one line — LLM might merge them
2. Table is correct, but no indication it's the main content
3. "Notes" is at the end — LLM might skip it
4. No indication that "Total" is the most important field

When Markdown IS Enough [#when-markdown-is-enough]

Markdown works fine for:

* **Simple text documents** — No tables, single column
* **Narrative content** — Articles, reports, books
* **When you don't need citations** — Just want the text
* **Human reading** — Not machine extraction

If your documents are simple, PDF-to-Markdown is reasonable.

What Struktur Does Instead [#what-struktur-does-instead]

Struktur's artifact format preserves more information:

\`\`\`typescript
{
  slices: [
    { type: "text", content: "ACME Corp", bbox: [0, 0, 100, 20] },
    { type: "text", content: "Invoice #12345", bbox: [0, 25, 100, 40] },
    { type: "table", rows: [...], bbox: [0, 100, 300, 200] },
  ],
  metadata: {
    pageCount: 1,
    hasImages: false,
  }
}
\`\`\`

This gives the LLM:

* **Spatial context** — Where elements are on the page
* **Type information** — This is a table, not just text
* **Bounding boxes** — Can cite sources
* **Metadata** — Document structure hints

The agent strategy can use this to explore documents intelligently:

1. "I need the total. Let me search for 'total' in the bottom-right area."
2. "I found a table. Let me read it row by row."
3. "There are two addresses. Let me check which is 'Bill To' vs 'Ship To'."

The Trade-off [#the-trade-off]

Markdown is simpler. It works for simple cases. But for production extraction:

* You'll hit edge cases
* Debugging is harder
* Accuracy suffers
* You can't trace failures

The artifact format is more complex, but it preserves what matters for reliable extraction.

See Also [#see-also]

* [What is Structured Data Extraction?](/docs/what-is-structured-data-extraction)
* [Building an Autonomous Extraction Agent](/blog/building-autonomous-extraction-agent)
* [Struktur vs Manual LLM Calls](/vs/manual-llm-calls)
`,r={title:"Why PDF-to-Markdown Fails for Structured Extraction",description:"The information loss that breaks LLM-based extraction"},l={contents:[{heading:void 0,content:"The common approach to document extraction is: PDF → Markdown → LLM → JSON. It seems straightforward. Convert your PDF to Markdown, feed it to an LLM, and get structured JSON out. But this approach loses critical information that makes extraction unreliable."},{heading:"the-promise",content:"Markdown is a reasonable intermediate format:"},{heading:"the-promise",content:"LLMs understand Markdown well"},{heading:"the-promise",content:"It's token-efficient compared to raw text"},{heading:"the-promise",content:"Preserves some structure (headings, lists, tables)"},{heading:"the-promise",content:"Easy to debug and inspect"},{heading:"the-promise",content:"Tools like `pandoc`, `marker`, and `pymupdf` convert PDFs to Markdown with decent quality. For human reading, it works great."},{heading:"what-gets-lost",content:"For LLM extraction, Markdown loses information that matters:"},{heading:"1-spatial-relationships",content:"Markdown is linear. PDFs are 2D."},{heading:"1-spatial-relationships",content:`In the PDF, "Total" and "Date" are visually grouped. In Markdown, they're just sequential lines. The LLM has no signal that they're related.`},{heading:"2-table-structure",content:"Markdown tables work for simple cases. But real-world tables have:"},{heading:"2-table-structure",content:"**Merged cells** — Markdown can't represent"},{heading:"2-table-structure",content:"**Nested tables** — Lost entirely"},{heading:"2-table-structure",content:"**Multi-row headers** — Flattened incorrectly"},{heading:"2-table-structure",content:"**Column alignment** — Not preserved"},{heading:"3-reading-order",content:"Multi-column layouts get scrambled:"},{heading:"3-reading-order",content:"The LLM receives text in the wrong order, breaking context."},{heading:"4-confidence-signals",content:"OCR-generated Markdown has no confidence scores. The LLM sees:"},{heading:"4-confidence-signals",content:`Is that "INVOICE-2024-001" or "lNVOlCE-2024-00l"? The LLM can't know the OCR was uncertain. It will hallucinate a reasonable interpretation.`},{heading:"5-bounding-boxes",content:"When extraction fails, you can't trace back:"},{heading:"5-bounding-boxes",content:'"Where did this value come from?"'},{heading:"5-bounding-boxes",content:'"Which page had the total?"'},{heading:"5-bounding-boxes",content:'"Was this handwritten or printed?"'},{heading:"5-bounding-boxes",content:"Markdown has no location information. You can't cite sources or debug failures."},{heading:"real-example-invoice-extraction",content:"Consider this invoice:"},{heading:"real-example-invoice-extraction",content:"**Markdown output:**"},{heading:"real-example-invoice-extraction",content:"**Problems:**"},{heading:"real-example-invoice-extraction",content:'"Bill To" and "Ship To" are now on one line — LLM might merge them'},{heading:"real-example-invoice-extraction",content:"Table is correct, but no indication it's the main content"},{heading:"real-example-invoice-extraction",content:'"Notes" is at the end — LLM might skip it'},{heading:"real-example-invoice-extraction",content:'No indication that "Total" is the most important field'},{heading:"when-markdown-is-enough",content:"Markdown works fine for:"},{heading:"when-markdown-is-enough",content:"**Simple text documents** — No tables, single column"},{heading:"when-markdown-is-enough",content:"**Narrative content** — Articles, reports, books"},{heading:"when-markdown-is-enough",content:"**When you don't need citations** — Just want the text"},{heading:"when-markdown-is-enough",content:"**Human reading** — Not machine extraction"},{heading:"when-markdown-is-enough",content:"If your documents are simple, PDF-to-Markdown is reasonable."},{heading:"what-struktur-does-instead",content:"Struktur's artifact format preserves more information:"},{heading:"what-struktur-does-instead",content:"This gives the LLM:"},{heading:"what-struktur-does-instead",content:"**Spatial context** — Where elements are on the page"},{heading:"what-struktur-does-instead",content:"**Type information** — This is a table, not just text"},{heading:"what-struktur-does-instead",content:"**Bounding boxes** — Can cite sources"},{heading:"what-struktur-does-instead",content:"**Metadata** — Document structure hints"},{heading:"what-struktur-does-instead",content:"The agent strategy can use this to explore documents intelligently:"},{heading:"what-struktur-does-instead",content:`"I need the total. Let me search for 'total' in the bottom-right area."`},{heading:"what-struktur-does-instead",content:'"I found a table. Let me read it row by row."'},{heading:"what-struktur-does-instead",content:`"There are two addresses. Let me check which is 'Bill To' vs 'Ship To'."`},{heading:"the-trade-off",content:"Markdown is simpler. It works for simple cases. But for production extraction:"},{heading:"the-trade-off",content:"You'll hit edge cases"},{heading:"the-trade-off",content:"Debugging is harder"},{heading:"the-trade-off",content:"Accuracy suffers"},{heading:"the-trade-off",content:"You can't trace failures"},{heading:"the-trade-off",content:"The artifact format is more complex, but it preserves what matters for reliable extraction."},{heading:"see-also",content:"What is Structured Data Extraction?"},{heading:"see-also",content:"Building an Autonomous Extraction Agent"},{heading:"see-also",content:"Struktur vs Manual LLM Calls"}],headings:[{id:"the-promise",content:"The Promise"},{id:"what-gets-lost",content:"What Gets Lost"},{id:"1-spatial-relationships",content:"1\\. Spatial Relationships"},{id:"2-table-structure",content:"2\\. Table Structure"},{id:"3-reading-order",content:"3\\. Reading Order"},{id:"4-confidence-signals",content:"4\\. Confidence Signals"},{id:"5-bounding-boxes",content:"5\\. Bounding Boxes"},{id:"real-example-invoice-extraction",content:"Real Example: Invoice Extraction"},{id:"when-markdown-is-enough",content:"When Markdown IS Enough"},{id:"what-struktur-does-instead",content:"What Struktur Does Instead"},{id:"the-trade-off",content:"The Trade-off"},{id:"see-also",content:"See Also"}]};const h=[{depth:2,url:"#the-promise",title:e.jsx(e.Fragment,{children:"The Promise"})},{depth:2,url:"#what-gets-lost",title:e.jsx(e.Fragment,{children:"What Gets Lost"})},{depth:3,url:"#1-spatial-relationships",title:e.jsx(e.Fragment,{children:"1. Spatial Relationships"})},{depth:3,url:"#2-table-structure",title:e.jsx(e.Fragment,{children:"2. Table Structure"})},{depth:3,url:"#3-reading-order",title:e.jsx(e.Fragment,{children:"3. Reading Order"})},{depth:3,url:"#4-confidence-signals",title:e.jsx(e.Fragment,{children:"4. Confidence Signals"})},{depth:3,url:"#5-bounding-boxes",title:e.jsx(e.Fragment,{children:"5. Bounding Boxes"})},{depth:2,url:"#real-example-invoice-extraction",title:e.jsx(e.Fragment,{children:"Real Example: Invoice Extraction"})},{depth:2,url:"#when-markdown-is-enough",title:e.jsx(e.Fragment,{children:"When Markdown IS Enough"})},{depth:2,url:"#what-struktur-does-instead",title:e.jsx(e.Fragment,{children:"What Struktur Does Instead"})},{depth:2,url:"#the-trade-off",title:e.jsx(e.Fragment,{children:"The Trade-off"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See Also"})}];function s(i){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"The common approach to document extraction is: PDF → Markdown → LLM → JSON. It seems straightforward. Convert your PDF to Markdown, feed it to an LLM, and get structured JSON out. But this approach loses critical information that makes extraction unreliable."}),`
`,e.jsx(n.h2,{id:"the-promise",children:"The Promise"}),`
`,e.jsx(n.p,{children:"Markdown is a reasonable intermediate format:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"LLMs understand Markdown well"}),`
`,e.jsx(n.li,{children:"It's token-efficient compared to raw text"}),`
`,e.jsx(n.li,{children:"Preserves some structure (headings, lists, tables)"}),`
`,e.jsx(n.li,{children:"Easy to debug and inspect"}),`
`]}),`
`,e.jsxs(n.p,{children:["Tools like ",e.jsx(n.code,{children:"pandoc"}),", ",e.jsx(n.code,{children:"marker"}),", and ",e.jsx(n.code,{children:"pymupdf"})," convert PDFs to Markdown with decent quality. For human reading, it works great."]}),`
`,e.jsx(n.h2,{id:"what-gets-lost",children:"What Gets Lost"}),`
`,e.jsx(n.p,{children:"For LLM extraction, Markdown loses information that matters:"}),`
`,e.jsx(n.h3,{id:"1-spatial-relationships",children:"1. Spatial Relationships"}),`
`,e.jsx(n.p,{children:"Markdown is linear. PDFs are 2D."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"PDF layout:                    Markdown output:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"┌─────────────────────────┐    Total: $1,234.56"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Total: $1,234.56         │    Date: 2024-03-15"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Date: 2024-03-15         │    (no indication these are related)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│                         │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Line Items:             │    Line Items:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│  Widget A    $100.00    │    Widget A $100.00"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│  Widget B    $200.00    │    Widget B $200.00"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"└─────────────────────────┘"})})]})})}),`
`,e.jsx(n.p,{children:`In the PDF, "Total" and "Date" are visually grouped. In Markdown, they're just sequential lines. The LLM has no signal that they're related.`}),`
`,e.jsx(n.h3,{id:"2-table-structure",children:"2. Table Structure"}),`
`,e.jsx(n.p,{children:"Markdown tables work for simple cases. But real-world tables have:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Merged cells"})," — Markdown can't represent"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Nested tables"})," — Lost entirely"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Multi-row headers"})," — Flattened incorrectly"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Column alignment"})," — Not preserved"]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"PDF table with merged cell:    Markdown (broken):"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"┌──────────┬───────┐          | Category | Item |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Category │ Item  │          |----------|-------|"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│          │ A     │          | A        | A     |  ← wrong"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Widgets  ├───────┤          | B        | B     |  ← wrong"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│          │ B     │          | C        | C     |  ← wrong"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"└──────────┴───────┘"})})]})})}),`
`,e.jsx(n.h3,{id:"3-reading-order",children:"3. Reading Order"}),`
`,e.jsx(n.p,{children:"Multi-column layouts get scrambled:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"PDF (2 columns):               Markdown (wrong order):"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"┌─────────┬─────────┐         Introduction text..."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Intro   │ Sidebar │         More intro text..."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ text... │ text... │         Sidebar text...      ← should be later"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ More    │ More    │         More sidebar text... ← should be later"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ intro...│ sidebar │         Conclusion text..."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Conclu- │         │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ sion... │         │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"└─────────┴─────────┘"})})]})})}),`
`,e.jsx(n.p,{children:"The LLM receives text in the wrong order, breaking context."}),`
`,e.jsx(n.h3,{id:"4-confidence-signals",children:"4. Confidence Signals"}),`
`,e.jsx(n.p,{children:"OCR-generated Markdown has no confidence scores. The LLM sees:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Invoice Number: lNVOlCE-2024-00l"})})})})}),`
`,e.jsx(n.p,{children:`Is that "INVOICE-2024-001" or "lNVOlCE-2024-00l"? The LLM can't know the OCR was uncertain. It will hallucinate a reasonable interpretation.`}),`
`,e.jsx(n.h3,{id:"5-bounding-boxes",children:"5. Bounding Boxes"}),`
`,e.jsx(n.p,{children:"When extraction fails, you can't trace back:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:'"Where did this value come from?"'}),`
`,e.jsx(n.li,{children:'"Which page had the total?"'}),`
`,e.jsx(n.li,{children:'"Was this handwritten or printed?"'}),`
`]}),`
`,e.jsx(n.p,{children:"Markdown has no location information. You can't cite sources or debug failures."}),`
`,e.jsx(n.h2,{id:"real-example-invoice-extraction",children:"Real Example: Invoice Extraction"}),`
`,e.jsx(n.p,{children:"Consider this invoice:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"┌────────────────────────────────────┐"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ ACME Corp                          │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Invoice #12345                     │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│                                    │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Bill To:           Ship To:        │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ John Smith         John Smith      │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ 123 Main St        456 Oak Ave     │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│                    (different!)    │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│                                    │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Items:                             │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ ┌──────────────┬───────┬──────┐   │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ │ Description  │ Qty   │ Price│   │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ ├──────────────┼───────┼──────┤   │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ │ Widget A     │ 2     │ $50  │   │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ │ Widget B     │ 1     │ $75  │   │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ │ Widget C     │ 3     │ $25  │   │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ └──────────────┴───────┴──────┘   │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│                         ───────── │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Subtotal:               $275.00   │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Tax (8%):               $22.00    │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│                         ───────── │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Total:                  $297.00   │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│                                    │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"│ Notes: See attached terms.         │"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"└────────────────────────────────────┘"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Markdown output:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ACME Corp"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Invoice #12345"})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Bill To: Ship To:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"John Smith John Smith"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"123 Main St 456 Oak Ave"})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Items:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"| Description | Qty | Price |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"|-------------|-----|-------|"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"| Widget A | 2 | $50 |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"| Widget B | 1 | $75 |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"| Widget C | 3 | $25 |"})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Subtotal: $275.00"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Tax (8%): $22.00"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Total: $297.00"})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Notes: See attached terms."})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Problems:"})}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:'"Bill To" and "Ship To" are now on one line — LLM might merge them'}),`
`,e.jsx(n.li,{children:"Table is correct, but no indication it's the main content"}),`
`,e.jsx(n.li,{children:'"Notes" is at the end — LLM might skip it'}),`
`,e.jsx(n.li,{children:'No indication that "Total" is the most important field'}),`
`]}),`
`,e.jsx(n.h2,{id:"when-markdown-is-enough",children:"When Markdown IS Enough"}),`
`,e.jsx(n.p,{children:"Markdown works fine for:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Simple text documents"})," — No tables, single column"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Narrative content"})," — Articles, reports, books"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"When you don't need citations"})," — Just want the text"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Human reading"})," — Not machine extraction"]}),`
`]}),`
`,e.jsx(n.p,{children:"If your documents are simple, PDF-to-Markdown is reasonable."}),`
`,e.jsx(n.h2,{id:"what-struktur-does-instead",children:"What Struktur Does Instead"}),`
`,e.jsx(n.p,{children:"Struktur's artifact format preserves more information:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  slices"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    { type: "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"text"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", content: "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ACME Corp"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", bbox: ["}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"100"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"20"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] },"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    { type: "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"text"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", content: "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Invoice #12345"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", bbox: ["}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"25"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"100"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"40"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] },"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    { type: "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"table"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", rows: ["}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"], bbox: ["}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"100"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"300"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"200"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] },"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ],"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  metadata"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    pageCount"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    hasImages"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(n.p,{children:"This gives the LLM:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Spatial context"})," — Where elements are on the page"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Type information"})," — This is a table, not just text"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Bounding boxes"})," — Can cite sources"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Metadata"})," — Document structure hints"]}),`
`]}),`
`,e.jsx(n.p,{children:"The agent strategy can use this to explore documents intelligently:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:`"I need the total. Let me search for 'total' in the bottom-right area."`}),`
`,e.jsx(n.li,{children:'"I found a table. Let me read it row by row."'}),`
`,e.jsx(n.li,{children:`"There are two addresses. Let me check which is 'Bill To' vs 'Ship To'."`}),`
`]}),`
`,e.jsx(n.h2,{id:"the-trade-off",children:"The Trade-off"}),`
`,e.jsx(n.p,{children:"Markdown is simpler. It works for simple cases. But for production extraction:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"You'll hit edge cases"}),`
`,e.jsx(n.li,{children:"Debugging is harder"}),`
`,e.jsx(n.li,{children:"Accuracy suffers"}),`
`,e.jsx(n.li,{children:"You can't trace failures"}),`
`]}),`
`,e.jsx(n.p,{children:"The artifact format is more complex, but it preserves what matters for reliable extraction."}),`
`,e.jsx(n.h2,{id:"see-also",children:"See Also"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs/what-is-structured-data-extraction",children:"What is Structured Data Extraction?"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/blog/building-autonomous-extraction-agent",children:"Building an Autonomous Extraction Agent"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/vs/manual-llm-calls",children:"Struktur vs Manual LLM Calls"})}),`
`]})]})}function o(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{a as _markdown,o as default,r as frontmatter,l as structuredData,h as toc};
