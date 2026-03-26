import{j as e}from"./main-CiUJ7M4r.js";let o=`

LlamaIndex offers LlamaParse for document parsing and LlamaExtract for structured data extraction. Both are managed cloud services with per-page pricing. Struktur is open source, self-hosted, and uses an autonomous agent approach.

Quick Comparison [#quick-comparison]

| Aspect              | Struktur                    | LlamaIndex                |
| ------------------- | --------------------------- | ------------------------- |
| License             | MIT (open source)           | Proprietary               |
| Deployment          | Self-hosted                 | Cloud only                |
| Pricing             | Your LLM API costs          | $0.005-$0.075/page        |
| Data privacy        | Full control                | Uploaded to their servers |
| Extraction approach | Agent + multiple strategies | Single extraction method  |
| Citations           | Not yet                     | Yes, with bounding boxes  |
| Confidence scores   | Not yet                     | Yes, per-field            |
| Chunking            | Token-aware, automatic      | Built-in                  |
| Validation + retry  | Built-in                    | Built-in                  |
| Merging             | LLM merge or auto-merge     | Built-in                  |

LlamaIndex Overview [#llamaindex-overview]

LlamaIndex provides two main products:

**LlamaParse** — Document parsing service that converts PDFs, images, and other formats into structured text. Supports multiple parsing modes from fast (3 credits/page) to premium (60 credits/page).

**LlamaExtract** — Structured extraction built on LlamaParse. Define a schema, upload documents, get validated JSON output with citations and confidence scores.

Pricing Model [#pricing-model]

LlamaIndex uses a credit system:

* 1,000 credits = $1.25 (US) or $1.50 (EU)
* Fast mode: 5 credits/page
* Balanced mode: 10 credits/page
* Premium mode: 60 credits/page

For 10,000 pages at balanced mode: \\~$125 in credits.

Strengths [#strengths]

* **Citations with bounding boxes** — Know exactly where each extracted value came from
* **Confidence scores** — Per-field certainty metrics
* **Managed infrastructure** — No servers to maintain
* **Excellent parsing quality** — LlamaParse handles complex layouts well

Limitations [#limitations]

* **Cloud-only** — Documents must be uploaded to their servers
* **Per-page costs** — Scales with document volume
* **Single extraction approach** — No strategy selection
* **Vendor lock-in** — Proprietary platform

Struktur Overview [#struktur-overview]

Struktur is an open source extraction library and CLI. It provides multiple extraction strategies including an autonomous agent that explores documents dynamically.

Pricing Model [#pricing-model-1]

You pay only for your LLM API calls. Using GPT-4o at \\~$2.50/1M input tokens:

* Typical invoice: \\~2,000 tokens input → $0.005
* 10,000 invoices: \\~$50 in API costs

Costs vary by model choice. Use cheaper models (GPT-4o-mini, local LLMs) for lower costs.

Strengths [#strengths-1]

* **Self-hosted** — Data never leaves your infrastructure
* **Multiple strategies** — Agent, simple, parallel, sequential, double-pass
* **Autonomous agent** — Explores documents, adapts to structure
* **Cost control** — Choose your model, pay your API rates
* **Open source** — MIT licensed, fully customizable

Limitations [#limitations-1]

* **No citations** — Can't trace extracted values to source locations
* **No confidence scores** — No per-field certainty metrics
* **Requires setup** — Need to configure LLM provider
* **Manual scaling** — Handle your own infrastructure

When to Choose Struktur [#when-to-choose-struktur]

* **Data cannot leave your infrastructure** — Healthcare, finance, legal documents
* **Cost-sensitive at scale** — High document volumes where per-page fees add up
* **Variable document structures** — Agent adapts to unknown layouts
* **Want control over LLM provider** — Use OpenAI, Anthropic, local models
* **Need multiple extraction strategies** — Different approaches for different documents
* **TypeScript/JavaScript stack** — Native SDK support

When to Choose LlamaIndex [#when-to-choose-llamaindex]

* **Need citations** — Must trace extracted values to source locations
* **Need confidence scores** — Require certainty metrics for each field
* **Want managed infrastructure** — Don't want to manage servers
* **Quality > cost** — Willing to pay for excellent parsing quality
* **Single extraction approach is fine** — Don't need strategy selection
* **Documents can be uploaded** — No data residency requirements

Cost Comparison Example [#cost-comparison-example]

Processing 10,000 invoices per month:

| Solution                | Monthly Cost        |
| ----------------------- | ------------------- |
| LlamaExtract (balanced) | \\~$125              |
| Struktur + GPT-4o       | \\~$50               |
| Struktur + GPT-4o-mini  | \\~$5                |
| Struktur + Local LLM    | Hardware costs only |

Technical Differences [#technical-differences]

Extraction Approach [#extraction-approach]

**LlamaExtract** uses a single extraction pipeline: parse → extract → validate. The extraction logic is fixed.

**Struktur** offers multiple strategies:

* **Simple** — Single LLM call for small documents
* **Parallel** — Process chunks simultaneously for speed
* **Sequential** — Process in order for context
* **Agent** — Autonomous exploration for unknown structures
* **Double-pass** — Extract, then verify for quality

Validation [#validation]

Both handle schema validation and retry with error feedback. LlamaExtract provides confidence scores; Struktur provides token usage tracking.

Integration [#integration]

**LlamaExtract** — REST API, Python SDK, TypeScript SDK

**Struktur** — TypeScript SDK, CLI, programmatic API

Migration Path [#migration-path]

If you start with LlamaExtract and later need self-hosting:

1. Export your schemas from LlamaExtract
2. Convert to JSON Schema format
3. Use Struktur SDK with same schema
4. Deploy on your infrastructure

The schemas are compatible. The main difference is extraction approach and infrastructure.

See Also [#see-also]

* [Struktur vs Unstract](/compare/unstract) — Open source alternatives
* [Struktur vs Instructor](/compare/instructor) — Python library comparison
* [What is Structured Data Extraction?](/docs/what-is-structured-data-extraction)
`,a={title:"Struktur vs LlamaIndex",description:"Compare Struktur to LlamaParse and LlamaExtract for structured data extraction"},s={contents:[{heading:void 0,content:"LlamaIndex offers LlamaParse for document parsing and LlamaExtract for structured data extraction. Both are managed cloud services with per-page pricing. Struktur is open source, self-hosted, and uses an autonomous agent approach."},{heading:"quick-comparison",content:"Aspect"},{heading:"quick-comparison",content:"Struktur"},{heading:"quick-comparison",content:"LlamaIndex"},{heading:"quick-comparison",content:"License"},{heading:"quick-comparison",content:"MIT (open source)"},{heading:"quick-comparison",content:"Proprietary"},{heading:"quick-comparison",content:"Deployment"},{heading:"quick-comparison",content:"Self-hosted"},{heading:"quick-comparison",content:"Cloud only"},{heading:"quick-comparison",content:"Pricing"},{heading:"quick-comparison",content:"Your LLM API costs"},{heading:"quick-comparison",content:"$0.005-$0.075/page"},{heading:"quick-comparison",content:"Data privacy"},{heading:"quick-comparison",content:"Full control"},{heading:"quick-comparison",content:"Uploaded to their servers"},{heading:"quick-comparison",content:"Extraction approach"},{heading:"quick-comparison",content:"Agent + multiple strategies"},{heading:"quick-comparison",content:"Single extraction method"},{heading:"quick-comparison",content:"Citations"},{heading:"quick-comparison",content:"Not yet"},{heading:"quick-comparison",content:"Yes, with bounding boxes"},{heading:"quick-comparison",content:"Confidence scores"},{heading:"quick-comparison",content:"Not yet"},{heading:"quick-comparison",content:"Yes, per-field"},{heading:"quick-comparison",content:"Chunking"},{heading:"quick-comparison",content:"Token-aware, automatic"},{heading:"quick-comparison",content:"Built-in"},{heading:"quick-comparison",content:"Validation + retry"},{heading:"quick-comparison",content:"Built-in"},{heading:"quick-comparison",content:"Built-in"},{heading:"quick-comparison",content:"Merging"},{heading:"quick-comparison",content:"LLM merge or auto-merge"},{heading:"quick-comparison",content:"Built-in"},{heading:"llamaindex-overview",content:"LlamaIndex provides two main products:"},{heading:"llamaindex-overview",content:"**LlamaParse** — Document parsing service that converts PDFs, images, and other formats into structured text. Supports multiple parsing modes from fast (3 credits/page) to premium (60 credits/page)."},{heading:"llamaindex-overview",content:"**LlamaExtract** — Structured extraction built on LlamaParse. Define a schema, upload documents, get validated JSON output with citations and confidence scores."},{heading:"pricing-model",content:"LlamaIndex uses a credit system:"},{heading:"pricing-model",content:"1,000 credits = $1.25 (US) or $1.50 (EU)"},{heading:"pricing-model",content:"Fast mode: 5 credits/page"},{heading:"pricing-model",content:"Balanced mode: 10 credits/page"},{heading:"pricing-model",content:"Premium mode: 60 credits/page"},{heading:"pricing-model",content:"For 10,000 pages at balanced mode: \\~$125 in credits."},{heading:"strengths",content:"**Citations with bounding boxes** — Know exactly where each extracted value came from"},{heading:"strengths",content:"**Confidence scores** — Per-field certainty metrics"},{heading:"strengths",content:"**Managed infrastructure** — No servers to maintain"},{heading:"strengths",content:"**Excellent parsing quality** — LlamaParse handles complex layouts well"},{heading:"limitations",content:"**Cloud-only** — Documents must be uploaded to their servers"},{heading:"limitations",content:"**Per-page costs** — Scales with document volume"},{heading:"limitations",content:"**Single extraction approach** — No strategy selection"},{heading:"limitations",content:"**Vendor lock-in** — Proprietary platform"},{heading:"struktur-overview",content:"Struktur is an open source extraction library and CLI. It provides multiple extraction strategies including an autonomous agent that explores documents dynamically."},{heading:"pricing-model-1",content:"You pay only for your LLM API calls. Using GPT-4o at \\~$2.50/1M input tokens:"},{heading:"pricing-model-1",content:"Typical invoice: \\~2,000 tokens input → $0.005"},{heading:"pricing-model-1",content:"10,000 invoices: \\~$50 in API costs"},{heading:"pricing-model-1",content:"Costs vary by model choice. Use cheaper models (GPT-4o-mini, local LLMs) for lower costs."},{heading:"strengths-1",content:"**Self-hosted** — Data never leaves your infrastructure"},{heading:"strengths-1",content:"**Multiple strategies** — Agent, simple, parallel, sequential, double-pass"},{heading:"strengths-1",content:"**Autonomous agent** — Explores documents, adapts to structure"},{heading:"strengths-1",content:"**Cost control** — Choose your model, pay your API rates"},{heading:"strengths-1",content:"**Open source** — MIT licensed, fully customizable"},{heading:"limitations-1",content:"**No citations** — Can't trace extracted values to source locations"},{heading:"limitations-1",content:"**No confidence scores** — No per-field certainty metrics"},{heading:"limitations-1",content:"**Requires setup** — Need to configure LLM provider"},{heading:"limitations-1",content:"**Manual scaling** — Handle your own infrastructure"},{heading:"when-to-choose-struktur",content:"**Data cannot leave your infrastructure** — Healthcare, finance, legal documents"},{heading:"when-to-choose-struktur",content:"**Cost-sensitive at scale** — High document volumes where per-page fees add up"},{heading:"when-to-choose-struktur",content:"**Variable document structures** — Agent adapts to unknown layouts"},{heading:"when-to-choose-struktur",content:"**Want control over LLM provider** — Use OpenAI, Anthropic, local models"},{heading:"when-to-choose-struktur",content:"**Need multiple extraction strategies** — Different approaches for different documents"},{heading:"when-to-choose-struktur",content:"**TypeScript/JavaScript stack** — Native SDK support"},{heading:"when-to-choose-llamaindex",content:"**Need citations** — Must trace extracted values to source locations"},{heading:"when-to-choose-llamaindex",content:"**Need confidence scores** — Require certainty metrics for each field"},{heading:"when-to-choose-llamaindex",content:"**Want managed infrastructure** — Don't want to manage servers"},{heading:"when-to-choose-llamaindex",content:"**Quality > cost** — Willing to pay for excellent parsing quality"},{heading:"when-to-choose-llamaindex",content:"**Single extraction approach is fine** — Don't need strategy selection"},{heading:"when-to-choose-llamaindex",content:"**Documents can be uploaded** — No data residency requirements"},{heading:"cost-comparison-example",content:"Processing 10,000 invoices per month:"},{heading:"cost-comparison-example",content:"Solution"},{heading:"cost-comparison-example",content:"Monthly Cost"},{heading:"cost-comparison-example",content:"LlamaExtract (balanced)"},{heading:"cost-comparison-example",content:"\\~$125"},{heading:"cost-comparison-example",content:"Struktur + GPT-4o"},{heading:"cost-comparison-example",content:"\\~$50"},{heading:"cost-comparison-example",content:"Struktur + GPT-4o-mini"},{heading:"cost-comparison-example",content:"\\~$5"},{heading:"cost-comparison-example",content:"Struktur + Local LLM"},{heading:"cost-comparison-example",content:"Hardware costs only"},{heading:"extraction-approach",content:"**LlamaExtract** uses a single extraction pipeline: parse → extract → validate. The extraction logic is fixed."},{heading:"extraction-approach",content:"**Struktur** offers multiple strategies:"},{heading:"extraction-approach",content:"**Simple** — Single LLM call for small documents"},{heading:"extraction-approach",content:"**Parallel** — Process chunks simultaneously for speed"},{heading:"extraction-approach",content:"**Sequential** — Process in order for context"},{heading:"extraction-approach",content:"**Agent** — Autonomous exploration for unknown structures"},{heading:"extraction-approach",content:"**Double-pass** — Extract, then verify for quality"},{heading:"validation",content:"Both handle schema validation and retry with error feedback. LlamaExtract provides confidence scores; Struktur provides token usage tracking."},{heading:"integration",content:"**LlamaExtract** — REST API, Python SDK, TypeScript SDK"},{heading:"integration",content:"**Struktur** — TypeScript SDK, CLI, programmatic API"},{heading:"migration-path",content:"If you start with LlamaExtract and later need self-hosting:"},{heading:"migration-path",content:"Export your schemas from LlamaExtract"},{heading:"migration-path",content:"Convert to JSON Schema format"},{heading:"migration-path",content:"Use Struktur SDK with same schema"},{heading:"migration-path",content:"Deploy on your infrastructure"},{heading:"migration-path",content:"The schemas are compatible. The main difference is extraction approach and infrastructure."},{heading:"see-also",content:"Struktur vs Unstract — Open source alternatives"},{heading:"see-also",content:"Struktur vs Instructor — Python library comparison"},{heading:"see-also",content:"What is Structured Data Extraction?"}],headings:[{id:"quick-comparison",content:"Quick Comparison"},{id:"llamaindex-overview",content:"LlamaIndex Overview"},{id:"pricing-model",content:"Pricing Model"},{id:"strengths",content:"Strengths"},{id:"limitations",content:"Limitations"},{id:"struktur-overview",content:"Struktur Overview"},{id:"pricing-model-1",content:"Pricing Model"},{id:"strengths-1",content:"Strengths"},{id:"limitations-1",content:"Limitations"},{id:"when-to-choose-struktur",content:"When to Choose Struktur"},{id:"when-to-choose-llamaindex",content:"When to Choose LlamaIndex"},{id:"cost-comparison-example",content:"Cost Comparison Example"},{id:"technical-differences",content:"Technical Differences"},{id:"extraction-approach",content:"Extraction Approach"},{id:"validation",content:"Validation"},{id:"integration",content:"Integration"},{id:"migration-path",content:"Migration Path"},{id:"see-also",content:"See Also"}]};const c=[{depth:2,url:"#quick-comparison",title:e.jsx(e.Fragment,{children:"Quick Comparison"})},{depth:2,url:"#llamaindex-overview",title:e.jsx(e.Fragment,{children:"LlamaIndex Overview"})},{depth:3,url:"#pricing-model",title:e.jsx(e.Fragment,{children:"Pricing Model"})},{depth:3,url:"#strengths",title:e.jsx(e.Fragment,{children:"Strengths"})},{depth:3,url:"#limitations",title:e.jsx(e.Fragment,{children:"Limitations"})},{depth:2,url:"#struktur-overview",title:e.jsx(e.Fragment,{children:"Struktur Overview"})},{depth:3,url:"#pricing-model-1",title:e.jsx(e.Fragment,{children:"Pricing Model"})},{depth:3,url:"#strengths-1",title:e.jsx(e.Fragment,{children:"Strengths"})},{depth:3,url:"#limitations-1",title:e.jsx(e.Fragment,{children:"Limitations"})},{depth:2,url:"#when-to-choose-struktur",title:e.jsx(e.Fragment,{children:"When to Choose Struktur"})},{depth:2,url:"#when-to-choose-llamaindex",title:e.jsx(e.Fragment,{children:"When to Choose LlamaIndex"})},{depth:2,url:"#cost-comparison-example",title:e.jsx(e.Fragment,{children:"Cost Comparison Example"})},{depth:2,url:"#technical-differences",title:e.jsx(e.Fragment,{children:"Technical Differences"})},{depth:3,url:"#extraction-approach",title:e.jsx(e.Fragment,{children:"Extraction Approach"})},{depth:3,url:"#validation",title:e.jsx(e.Fragment,{children:"Validation"})},{depth:3,url:"#integration",title:e.jsx(e.Fragment,{children:"Integration"})},{depth:2,url:"#migration-path",title:e.jsx(e.Fragment,{children:"Migration Path"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See Also"})}];function r(t){const n={a:"a",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"LlamaIndex offers LlamaParse for document parsing and LlamaExtract for structured data extraction. Both are managed cloud services with per-page pricing. Struktur is open source, self-hosted, and uses an autonomous agent approach."}),`
`,e.jsx(n.h2,{id:"quick-comparison",children:"Quick Comparison"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Aspect"}),e.jsx(n.th,{children:"Struktur"}),e.jsx(n.th,{children:"LlamaIndex"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"License"}),e.jsx(n.td,{children:"MIT (open source)"}),e.jsx(n.td,{children:"Proprietary"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Deployment"}),e.jsx(n.td,{children:"Self-hosted"}),e.jsx(n.td,{children:"Cloud only"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Pricing"}),e.jsx(n.td,{children:"Your LLM API costs"}),e.jsx(n.td,{children:"$0.005-$0.075/page"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Data privacy"}),e.jsx(n.td,{children:"Full control"}),e.jsx(n.td,{children:"Uploaded to their servers"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Extraction approach"}),e.jsx(n.td,{children:"Agent + multiple strategies"}),e.jsx(n.td,{children:"Single extraction method"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Citations"}),e.jsx(n.td,{children:"Not yet"}),e.jsx(n.td,{children:"Yes, with bounding boxes"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Confidence scores"}),e.jsx(n.td,{children:"Not yet"}),e.jsx(n.td,{children:"Yes, per-field"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Chunking"}),e.jsx(n.td,{children:"Token-aware, automatic"}),e.jsx(n.td,{children:"Built-in"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Validation + retry"}),e.jsx(n.td,{children:"Built-in"}),e.jsx(n.td,{children:"Built-in"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Merging"}),e.jsx(n.td,{children:"LLM merge or auto-merge"}),e.jsx(n.td,{children:"Built-in"})]})]})]}),`
`,e.jsx(n.h2,{id:"llamaindex-overview",children:"LlamaIndex Overview"}),`
`,e.jsx(n.p,{children:"LlamaIndex provides two main products:"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"LlamaParse"})," — Document parsing service that converts PDFs, images, and other formats into structured text. Supports multiple parsing modes from fast (3 credits/page) to premium (60 credits/page)."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"LlamaExtract"})," — Structured extraction built on LlamaParse. Define a schema, upload documents, get validated JSON output with citations and confidence scores."]}),`
`,e.jsx(n.h3,{id:"pricing-model",children:"Pricing Model"}),`
`,e.jsx(n.p,{children:"LlamaIndex uses a credit system:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"1,000 credits = $1.25 (US) or $1.50 (EU)"}),`
`,e.jsx(n.li,{children:"Fast mode: 5 credits/page"}),`
`,e.jsx(n.li,{children:"Balanced mode: 10 credits/page"}),`
`,e.jsx(n.li,{children:"Premium mode: 60 credits/page"}),`
`]}),`
`,e.jsx(n.p,{children:"For 10,000 pages at balanced mode: ~$125 in credits."}),`
`,e.jsx(n.h3,{id:"strengths",children:"Strengths"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Citations with bounding boxes"})," — Know exactly where each extracted value came from"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Confidence scores"})," — Per-field certainty metrics"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Managed infrastructure"})," — No servers to maintain"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Excellent parsing quality"})," — LlamaParse handles complex layouts well"]}),`
`]}),`
`,e.jsx(n.h3,{id:"limitations",children:"Limitations"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Cloud-only"})," — Documents must be uploaded to their servers"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Per-page costs"})," — Scales with document volume"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Single extraction approach"})," — No strategy selection"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Vendor lock-in"})," — Proprietary platform"]}),`
`]}),`
`,e.jsx(n.h2,{id:"struktur-overview",children:"Struktur Overview"}),`
`,e.jsx(n.p,{children:"Struktur is an open source extraction library and CLI. It provides multiple extraction strategies including an autonomous agent that explores documents dynamically."}),`
`,e.jsx(n.h3,{id:"pricing-model-1",children:"Pricing Model"}),`
`,e.jsx(n.p,{children:"You pay only for your LLM API calls. Using GPT-4o at ~$2.50/1M input tokens:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Typical invoice: ~2,000 tokens input → $0.005"}),`
`,e.jsx(n.li,{children:"10,000 invoices: ~$50 in API costs"}),`
`]}),`
`,e.jsx(n.p,{children:"Costs vary by model choice. Use cheaper models (GPT-4o-mini, local LLMs) for lower costs."}),`
`,e.jsx(n.h3,{id:"strengths-1",children:"Strengths"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Self-hosted"})," — Data never leaves your infrastructure"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Multiple strategies"})," — Agent, simple, parallel, sequential, double-pass"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Autonomous agent"})," — Explores documents, adapts to structure"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Cost control"})," — Choose your model, pay your API rates"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Open source"})," — MIT licensed, fully customizable"]}),`
`]}),`
`,e.jsx(n.h3,{id:"limitations-1",children:"Limitations"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"No citations"})," — Can't trace extracted values to source locations"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"No confidence scores"})," — No per-field certainty metrics"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Requires setup"})," — Need to configure LLM provider"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Manual scaling"})," — Handle your own infrastructure"]}),`
`]}),`
`,e.jsx(n.h2,{id:"when-to-choose-struktur",children:"When to Choose Struktur"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Data cannot leave your infrastructure"})," — Healthcare, finance, legal documents"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Cost-sensitive at scale"})," — High document volumes where per-page fees add up"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Variable document structures"})," — Agent adapts to unknown layouts"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Want control over LLM provider"})," — Use OpenAI, Anthropic, local models"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Need multiple extraction strategies"})," — Different approaches for different documents"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"TypeScript/JavaScript stack"})," — Native SDK support"]}),`
`]}),`
`,e.jsx(n.h2,{id:"when-to-choose-llamaindex",children:"When to Choose LlamaIndex"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Need citations"})," — Must trace extracted values to source locations"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Need confidence scores"})," — Require certainty metrics for each field"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Want managed infrastructure"})," — Don't want to manage servers"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Quality > cost"})," — Willing to pay for excellent parsing quality"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Single extraction approach is fine"})," — Don't need strategy selection"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Documents can be uploaded"})," — No data residency requirements"]}),`
`]}),`
`,e.jsx(n.h2,{id:"cost-comparison-example",children:"Cost Comparison Example"}),`
`,e.jsx(n.p,{children:"Processing 10,000 invoices per month:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Solution"}),e.jsx(n.th,{children:"Monthly Cost"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"LlamaExtract (balanced)"}),e.jsx(n.td,{children:"~$125"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Struktur + GPT-4o"}),e.jsx(n.td,{children:"~$50"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Struktur + GPT-4o-mini"}),e.jsx(n.td,{children:"~$5"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Struktur + Local LLM"}),e.jsx(n.td,{children:"Hardware costs only"})]})]})]}),`
`,e.jsx(n.h2,{id:"technical-differences",children:"Technical Differences"}),`
`,e.jsx(n.h3,{id:"extraction-approach",children:"Extraction Approach"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"LlamaExtract"})," uses a single extraction pipeline: parse → extract → validate. The extraction logic is fixed."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Struktur"})," offers multiple strategies:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Simple"})," — Single LLM call for small documents"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Parallel"})," — Process chunks simultaneously for speed"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Sequential"})," — Process in order for context"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Agent"})," — Autonomous exploration for unknown structures"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Double-pass"})," — Extract, then verify for quality"]}),`
`]}),`
`,e.jsx(n.h3,{id:"validation",children:"Validation"}),`
`,e.jsx(n.p,{children:"Both handle schema validation and retry with error feedback. LlamaExtract provides confidence scores; Struktur provides token usage tracking."}),`
`,e.jsx(n.h3,{id:"integration",children:"Integration"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"LlamaExtract"})," — REST API, Python SDK, TypeScript SDK"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Struktur"})," — TypeScript SDK, CLI, programmatic API"]}),`
`,e.jsx(n.h2,{id:"migration-path",children:"Migration Path"}),`
`,e.jsx(n.p,{children:"If you start with LlamaExtract and later need self-hosting:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Export your schemas from LlamaExtract"}),`
`,e.jsx(n.li,{children:"Convert to JSON Schema format"}),`
`,e.jsx(n.li,{children:"Use Struktur SDK with same schema"}),`
`,e.jsx(n.li,{children:"Deploy on your infrastructure"}),`
`]}),`
`,e.jsx(n.p,{children:"The schemas are compatible. The main difference is extraction approach and infrastructure."}),`
`,e.jsx(n.h2,{id:"see-also",children:"See Also"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/compare/unstract",children:"Struktur vs Unstract"})," — Open source alternatives"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/compare/instructor",children:"Struktur vs Instructor"})," — Python library comparison"]}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs/what-is-structured-data-extraction",children:"What is Structured Data Extraction?"})}),`
`]})]})}function l(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(r,{...t})}):r(t)}export{o as _markdown,l as default,a as frontmatter,s as structuredData,c as toc};
