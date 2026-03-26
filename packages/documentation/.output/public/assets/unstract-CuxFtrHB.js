import{j as e}from"./main-CiUJ7M4r.js";let r=`

Unstract and Struktur are both open source tools for structured data extraction. Unstract offers a visual prompt engineering interface and n8n integration. Struktur focuses on an autonomous agent approach and CLI-first workflow.

Quick Comparison [#quick-comparison]

| Aspect               | Struktur            | Unstract                |
| -------------------- | ------------------- | ----------------------- |
| License              | MIT                 | Apache 2.0              |
| Approach             | Agent-first         | Prompt-based            |
| Self-hosted          | Yes, lightweight    | Yes, Docker stack       |
| Visual tools         | None                | Prompt Studio           |
| Verification         | Schema validation   | LLMChallenge (dual LLM) |
| Cost optimization    | Multiple strategies | Summarized/SinglePass   |
| Workflow integration | CLI/SDK             | n8n, API                |
| Language             | TypeScript          | Python                  |

Unstract Overview [#unstract-overview]

Unstract is an open source document processing platform with both a self-hosted edition and cloud offering. It emphasizes visual prompt engineering and workflow automation.

Key Features [#key-features]

**Prompt Studio** — Visual interface for designing extraction prompts. See how prompts perform, iterate without code changes.

**LLMChallenge** — Uses two LLMs: one extracts, one challenges. Either get the right answer or NULL (no wrong answers). Available in cloud/on-prem, not open source edition.

**SummarizedExtraction** — Summarizes document sections before extraction, reducing token usage up to 6x.

**SinglePass Extraction** — Combines all prompts into one, reducing token usage up to 8x.

**n8n Integration** — Connect extraction to 400+ integrations via n8n workflows.

Open Source Edition Limitations [#open-source-edition-limitations]

The open source edition lacks:

* SSO support
* Human quality review
* LLMChallenge verification
* SummarizedExtraction
* SinglePass Extraction

These features require cloud or on-prem licenses.

Deployment [#deployment]

Unstract requires Docker Compose with multiple containers:

* PostgreSQL with PGVector
* Unstructured.io for parsing
* Ollama for local LLMs
* Unstract platform

Minimum 8GB RAM recommended.

Struktur Overview [#struktur-overview]

Struktur is a lightweight extraction library and CLI. It provides multiple extraction strategies including an autonomous agent that explores documents without predefined prompts.

Key Features [#key-features-1]

**Autonomous Agent** — LLM explores documents using tools (read, grep, find), decides what to extract dynamically.

**Multiple Strategies** — Simple, parallel, sequential, agent, double-pass. Choose based on document type.

**Schema-aware Auto-merge** — Automatically deduplicates and merges array results.

**CLI-first** — Extract from command line without writing code.

**Lightweight** — Single npm package, no Docker required.

Deployment [#deployment-1]

Install via npm/bun:

\`\`\`bash
npm install @struktur/sdk
# or
bun add @struktur/sdk
\`\`\`

Or use CLI:

\`\`\`bash
npx struktur extract invoice.pdf --schema schema.json
\`\`\`

No infrastructure required beyond an LLM API key.

Approach Differences [#approach-differences]

Prompt-based (Unstract) [#prompt-based-unstract]

1. Design prompts for each field in Prompt Studio
2. Test prompts against sample documents
3. Deploy prompts to production
4. Documents processed through fixed prompt pipeline

Works well when:

* Document structure is known
* You want visual iteration
* Non-technical users design extractions

Agent-based (Struktur) [#agent-based-struktur]

1. Define output schema
2. Agent explores document, decides what to read
3. Agent extracts iteratively
4. Output validated against schema

Works well when:

* Document structure varies
* You don't know what sections matter
* You want adaptive extraction

Verification Differences [#verification-differences]

Schema Validation (Struktur) [#schema-validation-struktur]

Struktur validates output against JSON Schema. If validation fails, it sends errors back to the LLM for retry. Most extractions converge in 2-3 attempts.

LLMChallenge (Unstract) [#llmchallenge-unstract]

Unstract's LLMChallenge uses two LLMs:

1. Extractor LLM produces output
2. Challenger LLM verifies correctness
3. If challenger disagrees, return NULL instead of wrong answer

This prevents hallucinations but doubles token costs. Not available in open source edition.

Cost Optimization [#cost-optimization]

Struktur [#struktur]

* Choose cheaper models (GPT-4o-mini, local LLMs)
* Use parallel strategy for speed
* Use simple strategy for small documents
* Agent only explores relevant sections

Unstract [#unstract]

* SummarizedExtraction reduces tokens 6x
* SinglePass reduces tokens 8x
* Both require cloud/on-prem license

When to Choose Struktur [#when-to-choose-struktur]

* **Want autonomous agent** — Documents explore themselves
* **Prefer CLI-first workflow** — Extract without writing code
* **Lightweight self-hosting** — No Docker stack required
* **TypeScript/JavaScript stack** — Native SDK
* **Variable document structures** — Agent adapts
* **Full open source features** — No feature-gated capabilities

When to Choose Unstract [#when-to-choose-unstract]

* **Need visual prompt engineering** — Prompt Studio for iteration
* **Want LLMChallenge verification** — Dual-LLM validation
* **Using n8n workflows** — Native integration
* **Python-centric stack** — Python SDK
* **Non-technical users** — Visual interface
* **Enterprise features** — SSO, human review (cloud/on-prem)

Integration Comparison [#integration-comparison]

Struktur [#struktur-1]

\`\`\`typescript
import { extract } from '@struktur/sdk';

const result = await extract({
  artifacts: [{ path: 'invoice.pdf' }],
  schema: invoiceSchema,
  strategy: 'agent',
});

console.log(result.data);
\`\`\`

Unstract [#unstract-1]

\`\`\`python
from unstract.sdk import UnstractSDK

client = UnstractSDK(api_key="...")
result = client.extract(
    document="invoice.pdf",
    schema=invoice_schema,
    prompt_profile="invoice_extraction"
)
\`\`\`

Architecture Comparison [#architecture-comparison]

| Aspect         | Struktur                 | Unstract                  |
| -------------- | ------------------------ | ------------------------- |
| Runtime        | Node.js/Bun              | Python                    |
| Parsing        | Built-in providers       | Unstructured.io           |
| Vector DB      | Not required             | PGVector                  |
| LLM support    | OpenAI, Anthropic, local | OpenAI, Anthropic, Ollama |
| Infrastructure | Single process           | Docker Compose            |

Migration Path [#migration-path]

Both use JSON Schema for output definitions. Schemas are portable between platforms.

From Unstract to Struktur:

1. Export schema from Unstract
2. Use directly in Struktur (compatible format)
3. Replace prompt profiles with strategy selection
4. Deploy without Docker stack

From Struktur to Unstract:

1. Use same schema
2. Create prompt profile in Prompt Studio
3. Deploy via Docker Compose

See Also [#see-also]

* [Struktur vs LlamaIndex](/compare/llamaindex) — Cloud vs self-hosted
* [Struktur vs Instructor](/compare/instructor) — Full pipeline vs library
* [What is an Extraction Agent?](/docs/what-is-an-extraction-agent)
`,a={title:"Struktur vs Unstract",description:"Compare two open source document extraction platforms"},o={contents:[{heading:void 0,content:"Unstract and Struktur are both open source tools for structured data extraction. Unstract offers a visual prompt engineering interface and n8n integration. Struktur focuses on an autonomous agent approach and CLI-first workflow."},{heading:"quick-comparison",content:"Aspect"},{heading:"quick-comparison",content:"Struktur"},{heading:"quick-comparison",content:"Unstract"},{heading:"quick-comparison",content:"License"},{heading:"quick-comparison",content:"MIT"},{heading:"quick-comparison",content:"Apache 2.0"},{heading:"quick-comparison",content:"Approach"},{heading:"quick-comparison",content:"Agent-first"},{heading:"quick-comparison",content:"Prompt-based"},{heading:"quick-comparison",content:"Self-hosted"},{heading:"quick-comparison",content:"Yes, lightweight"},{heading:"quick-comparison",content:"Yes, Docker stack"},{heading:"quick-comparison",content:"Visual tools"},{heading:"quick-comparison",content:"None"},{heading:"quick-comparison",content:"Prompt Studio"},{heading:"quick-comparison",content:"Verification"},{heading:"quick-comparison",content:"Schema validation"},{heading:"quick-comparison",content:"LLMChallenge (dual LLM)"},{heading:"quick-comparison",content:"Cost optimization"},{heading:"quick-comparison",content:"Multiple strategies"},{heading:"quick-comparison",content:"Summarized/SinglePass"},{heading:"quick-comparison",content:"Workflow integration"},{heading:"quick-comparison",content:"CLI/SDK"},{heading:"quick-comparison",content:"n8n, API"},{heading:"quick-comparison",content:"Language"},{heading:"quick-comparison",content:"TypeScript"},{heading:"quick-comparison",content:"Python"},{heading:"unstract-overview",content:"Unstract is an open source document processing platform with both a self-hosted edition and cloud offering. It emphasizes visual prompt engineering and workflow automation."},{heading:"key-features",content:"**Prompt Studio** — Visual interface for designing extraction prompts. See how prompts perform, iterate without code changes."},{heading:"key-features",content:"**LLMChallenge** — Uses two LLMs: one extracts, one challenges. Either get the right answer or NULL (no wrong answers). Available in cloud/on-prem, not open source edition."},{heading:"key-features",content:"**SummarizedExtraction** — Summarizes document sections before extraction, reducing token usage up to 6x."},{heading:"key-features",content:"**SinglePass Extraction** — Combines all prompts into one, reducing token usage up to 8x."},{heading:"key-features",content:"**n8n Integration** — Connect extraction to 400+ integrations via n8n workflows."},{heading:"open-source-edition-limitations",content:"The open source edition lacks:"},{heading:"open-source-edition-limitations",content:"SSO support"},{heading:"open-source-edition-limitations",content:"Human quality review"},{heading:"open-source-edition-limitations",content:"LLMChallenge verification"},{heading:"open-source-edition-limitations",content:"SummarizedExtraction"},{heading:"open-source-edition-limitations",content:"SinglePass Extraction"},{heading:"open-source-edition-limitations",content:"These features require cloud or on-prem licenses."},{heading:"deployment",content:"Unstract requires Docker Compose with multiple containers:"},{heading:"deployment",content:"PostgreSQL with PGVector"},{heading:"deployment",content:"Unstructured.io for parsing"},{heading:"deployment",content:"Ollama for local LLMs"},{heading:"deployment",content:"Unstract platform"},{heading:"deployment",content:"Minimum 8GB RAM recommended."},{heading:"struktur-overview",content:"Struktur is a lightweight extraction library and CLI. It provides multiple extraction strategies including an autonomous agent that explores documents without predefined prompts."},{heading:"key-features-1",content:"**Autonomous Agent** — LLM explores documents using tools (read, grep, find), decides what to extract dynamically."},{heading:"key-features-1",content:"**Multiple Strategies** — Simple, parallel, sequential, agent, double-pass. Choose based on document type."},{heading:"key-features-1",content:"**Schema-aware Auto-merge** — Automatically deduplicates and merges array results."},{heading:"key-features-1",content:"**CLI-first** — Extract from command line without writing code."},{heading:"key-features-1",content:"**Lightweight** — Single npm package, no Docker required."},{heading:"deployment-1",content:"Install via npm/bun:"},{heading:"deployment-1",content:"Or use CLI:"},{heading:"deployment-1",content:"No infrastructure required beyond an LLM API key."},{heading:"prompt-based-unstract",content:"Design prompts for each field in Prompt Studio"},{heading:"prompt-based-unstract",content:"Test prompts against sample documents"},{heading:"prompt-based-unstract",content:"Deploy prompts to production"},{heading:"prompt-based-unstract",content:"Documents processed through fixed prompt pipeline"},{heading:"prompt-based-unstract",content:"Works well when:"},{heading:"prompt-based-unstract",content:"Document structure is known"},{heading:"prompt-based-unstract",content:"You want visual iteration"},{heading:"prompt-based-unstract",content:"Non-technical users design extractions"},{heading:"agent-based-struktur",content:"Define output schema"},{heading:"agent-based-struktur",content:"Agent explores document, decides what to read"},{heading:"agent-based-struktur",content:"Agent extracts iteratively"},{heading:"agent-based-struktur",content:"Output validated against schema"},{heading:"agent-based-struktur",content:"Works well when:"},{heading:"agent-based-struktur",content:"Document structure varies"},{heading:"agent-based-struktur",content:"You don't know what sections matter"},{heading:"agent-based-struktur",content:"You want adaptive extraction"},{heading:"schema-validation-struktur",content:"Struktur validates output against JSON Schema. If validation fails, it sends errors back to the LLM for retry. Most extractions converge in 2-3 attempts."},{heading:"llmchallenge-unstract",content:"Unstract's LLMChallenge uses two LLMs:"},{heading:"llmchallenge-unstract",content:"Extractor LLM produces output"},{heading:"llmchallenge-unstract",content:"Challenger LLM verifies correctness"},{heading:"llmchallenge-unstract",content:"If challenger disagrees, return NULL instead of wrong answer"},{heading:"llmchallenge-unstract",content:"This prevents hallucinations but doubles token costs. Not available in open source edition."},{heading:"struktur",content:"Choose cheaper models (GPT-4o-mini, local LLMs)"},{heading:"struktur",content:"Use parallel strategy for speed"},{heading:"struktur",content:"Use simple strategy for small documents"},{heading:"struktur",content:"Agent only explores relevant sections"},{heading:"unstract",content:"SummarizedExtraction reduces tokens 6x"},{heading:"unstract",content:"SinglePass reduces tokens 8x"},{heading:"unstract",content:"Both require cloud/on-prem license"},{heading:"when-to-choose-struktur",content:"**Want autonomous agent** — Documents explore themselves"},{heading:"when-to-choose-struktur",content:"**Prefer CLI-first workflow** — Extract without writing code"},{heading:"when-to-choose-struktur",content:"**Lightweight self-hosting** — No Docker stack required"},{heading:"when-to-choose-struktur",content:"**TypeScript/JavaScript stack** — Native SDK"},{heading:"when-to-choose-struktur",content:"**Variable document structures** — Agent adapts"},{heading:"when-to-choose-struktur",content:"**Full open source features** — No feature-gated capabilities"},{heading:"when-to-choose-unstract",content:"**Need visual prompt engineering** — Prompt Studio for iteration"},{heading:"when-to-choose-unstract",content:"**Want LLMChallenge verification** — Dual-LLM validation"},{heading:"when-to-choose-unstract",content:"**Using n8n workflows** — Native integration"},{heading:"when-to-choose-unstract",content:"**Python-centric stack** — Python SDK"},{heading:"when-to-choose-unstract",content:"**Non-technical users** — Visual interface"},{heading:"when-to-choose-unstract",content:"**Enterprise features** — SSO, human review (cloud/on-prem)"},{heading:"architecture-comparison",content:"Aspect"},{heading:"architecture-comparison",content:"Struktur"},{heading:"architecture-comparison",content:"Unstract"},{heading:"architecture-comparison",content:"Runtime"},{heading:"architecture-comparison",content:"Node.js/Bun"},{heading:"architecture-comparison",content:"Python"},{heading:"architecture-comparison",content:"Parsing"},{heading:"architecture-comparison",content:"Built-in providers"},{heading:"architecture-comparison",content:"Unstructured.io"},{heading:"architecture-comparison",content:"Vector DB"},{heading:"architecture-comparison",content:"Not required"},{heading:"architecture-comparison",content:"PGVector"},{heading:"architecture-comparison",content:"LLM support"},{heading:"architecture-comparison",content:"OpenAI, Anthropic, local"},{heading:"architecture-comparison",content:"OpenAI, Anthropic, Ollama"},{heading:"architecture-comparison",content:"Infrastructure"},{heading:"architecture-comparison",content:"Single process"},{heading:"architecture-comparison",content:"Docker Compose"},{heading:"migration-path",content:"Both use JSON Schema for output definitions. Schemas are portable between platforms."},{heading:"migration-path",content:"From Unstract to Struktur:"},{heading:"migration-path",content:"Export schema from Unstract"},{heading:"migration-path",content:"Use directly in Struktur (compatible format)"},{heading:"migration-path",content:"Replace prompt profiles with strategy selection"},{heading:"migration-path",content:"Deploy without Docker stack"},{heading:"migration-path",content:"From Struktur to Unstract:"},{heading:"migration-path",content:"Use same schema"},{heading:"migration-path",content:"Create prompt profile in Prompt Studio"},{heading:"migration-path",content:"Deploy via Docker Compose"},{heading:"see-also",content:"Struktur vs LlamaIndex — Cloud vs self-hosted"},{heading:"see-also",content:"Struktur vs Instructor — Full pipeline vs library"},{heading:"see-also",content:"What is an Extraction Agent?"}],headings:[{id:"quick-comparison",content:"Quick Comparison"},{id:"unstract-overview",content:"Unstract Overview"},{id:"key-features",content:"Key Features"},{id:"open-source-edition-limitations",content:"Open Source Edition Limitations"},{id:"deployment",content:"Deployment"},{id:"struktur-overview",content:"Struktur Overview"},{id:"key-features-1",content:"Key Features"},{id:"deployment-1",content:"Deployment"},{id:"approach-differences",content:"Approach Differences"},{id:"prompt-based-unstract",content:"Prompt-based (Unstract)"},{id:"agent-based-struktur",content:"Agent-based (Struktur)"},{id:"verification-differences",content:"Verification Differences"},{id:"schema-validation-struktur",content:"Schema Validation (Struktur)"},{id:"llmchallenge-unstract",content:"LLMChallenge (Unstract)"},{id:"cost-optimization",content:"Cost Optimization"},{id:"struktur",content:"Struktur"},{id:"unstract",content:"Unstract"},{id:"when-to-choose-struktur",content:"When to Choose Struktur"},{id:"when-to-choose-unstract",content:"When to Choose Unstract"},{id:"integration-comparison",content:"Integration Comparison"},{id:"struktur-1",content:"Struktur"},{id:"unstract-1",content:"Unstract"},{id:"architecture-comparison",content:"Architecture Comparison"},{id:"migration-path",content:"Migration Path"},{id:"see-also",content:"See Also"}]};const c=[{depth:2,url:"#quick-comparison",title:e.jsx(e.Fragment,{children:"Quick Comparison"})},{depth:2,url:"#unstract-overview",title:e.jsx(e.Fragment,{children:"Unstract Overview"})},{depth:3,url:"#key-features",title:e.jsx(e.Fragment,{children:"Key Features"})},{depth:3,url:"#open-source-edition-limitations",title:e.jsx(e.Fragment,{children:"Open Source Edition Limitations"})},{depth:3,url:"#deployment",title:e.jsx(e.Fragment,{children:"Deployment"})},{depth:2,url:"#struktur-overview",title:e.jsx(e.Fragment,{children:"Struktur Overview"})},{depth:3,url:"#key-features-1",title:e.jsx(e.Fragment,{children:"Key Features"})},{depth:3,url:"#deployment-1",title:e.jsx(e.Fragment,{children:"Deployment"})},{depth:2,url:"#approach-differences",title:e.jsx(e.Fragment,{children:"Approach Differences"})},{depth:3,url:"#prompt-based-unstract",title:e.jsx(e.Fragment,{children:"Prompt-based (Unstract)"})},{depth:3,url:"#agent-based-struktur",title:e.jsx(e.Fragment,{children:"Agent-based (Struktur)"})},{depth:2,url:"#verification-differences",title:e.jsx(e.Fragment,{children:"Verification Differences"})},{depth:3,url:"#schema-validation-struktur",title:e.jsx(e.Fragment,{children:"Schema Validation (Struktur)"})},{depth:3,url:"#llmchallenge-unstract",title:e.jsx(e.Fragment,{children:"LLMChallenge (Unstract)"})},{depth:2,url:"#cost-optimization",title:e.jsx(e.Fragment,{children:"Cost Optimization"})},{depth:3,url:"#struktur",title:e.jsx(e.Fragment,{children:"Struktur"})},{depth:3,url:"#unstract",title:e.jsx(e.Fragment,{children:"Unstract"})},{depth:2,url:"#when-to-choose-struktur",title:e.jsx(e.Fragment,{children:"When to Choose Struktur"})},{depth:2,url:"#when-to-choose-unstract",title:e.jsx(e.Fragment,{children:"When to Choose Unstract"})},{depth:2,url:"#integration-comparison",title:e.jsx(e.Fragment,{children:"Integration Comparison"})},{depth:3,url:"#struktur-1",title:e.jsx(e.Fragment,{children:"Struktur"})},{depth:3,url:"#unstract-1",title:e.jsx(e.Fragment,{children:"Unstract"})},{depth:2,url:"#architecture-comparison",title:e.jsx(e.Fragment,{children:"Architecture Comparison"})},{depth:2,url:"#migration-path",title:e.jsx(e.Fragment,{children:"Migration Path"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See Also"})}];function i(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Unstract and Struktur are both open source tools for structured data extraction. Unstract offers a visual prompt engineering interface and n8n integration. Struktur focuses on an autonomous agent approach and CLI-first workflow."}),`
`,e.jsx(t.h2,{id:"quick-comparison",children:"Quick Comparison"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Aspect"}),e.jsx(t.th,{children:"Struktur"}),e.jsx(t.th,{children:"Unstract"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"License"}),e.jsx(t.td,{children:"MIT"}),e.jsx(t.td,{children:"Apache 2.0"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Approach"}),e.jsx(t.td,{children:"Agent-first"}),e.jsx(t.td,{children:"Prompt-based"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Self-hosted"}),e.jsx(t.td,{children:"Yes, lightweight"}),e.jsx(t.td,{children:"Yes, Docker stack"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Visual tools"}),e.jsx(t.td,{children:"None"}),e.jsx(t.td,{children:"Prompt Studio"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Verification"}),e.jsx(t.td,{children:"Schema validation"}),e.jsx(t.td,{children:"LLMChallenge (dual LLM)"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Cost optimization"}),e.jsx(t.td,{children:"Multiple strategies"}),e.jsx(t.td,{children:"Summarized/SinglePass"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Workflow integration"}),e.jsx(t.td,{children:"CLI/SDK"}),e.jsx(t.td,{children:"n8n, API"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Language"}),e.jsx(t.td,{children:"TypeScript"}),e.jsx(t.td,{children:"Python"})]})]})]}),`
`,e.jsx(t.h2,{id:"unstract-overview",children:"Unstract Overview"}),`
`,e.jsx(t.p,{children:"Unstract is an open source document processing platform with both a self-hosted edition and cloud offering. It emphasizes visual prompt engineering and workflow automation."}),`
`,e.jsx(t.h3,{id:"key-features",children:"Key Features"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Prompt Studio"})," — Visual interface for designing extraction prompts. See how prompts perform, iterate without code changes."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"LLMChallenge"})," — Uses two LLMs: one extracts, one challenges. Either get the right answer or NULL (no wrong answers). Available in cloud/on-prem, not open source edition."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"SummarizedExtraction"})," — Summarizes document sections before extraction, reducing token usage up to 6x."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"SinglePass Extraction"})," — Combines all prompts into one, reducing token usage up to 8x."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"n8n Integration"})," — Connect extraction to 400+ integrations via n8n workflows."]}),`
`,e.jsx(t.h3,{id:"open-source-edition-limitations",children:"Open Source Edition Limitations"}),`
`,e.jsx(t.p,{children:"The open source edition lacks:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"SSO support"}),`
`,e.jsx(t.li,{children:"Human quality review"}),`
`,e.jsx(t.li,{children:"LLMChallenge verification"}),`
`,e.jsx(t.li,{children:"SummarizedExtraction"}),`
`,e.jsx(t.li,{children:"SinglePass Extraction"}),`
`]}),`
`,e.jsx(t.p,{children:"These features require cloud or on-prem licenses."}),`
`,e.jsx(t.h3,{id:"deployment",children:"Deployment"}),`
`,e.jsx(t.p,{children:"Unstract requires Docker Compose with multiple containers:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"PostgreSQL with PGVector"}),`
`,e.jsx(t.li,{children:"Unstructured.io for parsing"}),`
`,e.jsx(t.li,{children:"Ollama for local LLMs"}),`
`,e.jsx(t.li,{children:"Unstract platform"}),`
`]}),`
`,e.jsx(t.p,{children:"Minimum 8GB RAM recommended."}),`
`,e.jsx(t.h2,{id:"struktur-overview",children:"Struktur Overview"}),`
`,e.jsx(t.p,{children:"Struktur is a lightweight extraction library and CLI. It provides multiple extraction strategies including an autonomous agent that explores documents without predefined prompts."}),`
`,e.jsx(t.h3,{id:"key-features-1",children:"Key Features"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Autonomous Agent"})," — LLM explores documents using tools (read, grep, find), decides what to extract dynamically."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Multiple Strategies"})," — Simple, parallel, sequential, agent, double-pass. Choose based on document type."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Schema-aware Auto-merge"})," — Automatically deduplicates and merges array results."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"CLI-first"})," — Extract from command line without writing code."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Lightweight"})," — Single npm package, no Docker required."]}),`
`,e.jsx(t.h3,{id:"deployment-1",children:"Deployment"}),`
`,e.jsx(t.p,{children:"Install via npm/bun:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/sdk"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# or"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/sdk"})]})]})})}),`
`,e.jsx(t.p,{children:"Or use CLI:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npx"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" struktur"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" invoice.pdf"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" --schema"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" schema.json"})]})})})}),`
`,e.jsx(t.p,{children:"No infrastructure required beyond an LLM API key."}),`
`,e.jsx(t.h2,{id:"approach-differences",children:"Approach Differences"}),`
`,e.jsx(t.h3,{id:"prompt-based-unstract",children:"Prompt-based (Unstract)"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Design prompts for each field in Prompt Studio"}),`
`,e.jsx(t.li,{children:"Test prompts against sample documents"}),`
`,e.jsx(t.li,{children:"Deploy prompts to production"}),`
`,e.jsx(t.li,{children:"Documents processed through fixed prompt pipeline"}),`
`]}),`
`,e.jsx(t.p,{children:"Works well when:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Document structure is known"}),`
`,e.jsx(t.li,{children:"You want visual iteration"}),`
`,e.jsx(t.li,{children:"Non-technical users design extractions"}),`
`]}),`
`,e.jsx(t.h3,{id:"agent-based-struktur",children:"Agent-based (Struktur)"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Define output schema"}),`
`,e.jsx(t.li,{children:"Agent explores document, decides what to read"}),`
`,e.jsx(t.li,{children:"Agent extracts iteratively"}),`
`,e.jsx(t.li,{children:"Output validated against schema"}),`
`]}),`
`,e.jsx(t.p,{children:"Works well when:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Document structure varies"}),`
`,e.jsx(t.li,{children:"You don't know what sections matter"}),`
`,e.jsx(t.li,{children:"You want adaptive extraction"}),`
`]}),`
`,e.jsx(t.h2,{id:"verification-differences",children:"Verification Differences"}),`
`,e.jsx(t.h3,{id:"schema-validation-struktur",children:"Schema Validation (Struktur)"}),`
`,e.jsx(t.p,{children:"Struktur validates output against JSON Schema. If validation fails, it sends errors back to the LLM for retry. Most extractions converge in 2-3 attempts."}),`
`,e.jsx(t.h3,{id:"llmchallenge-unstract",children:"LLMChallenge (Unstract)"}),`
`,e.jsx(t.p,{children:"Unstract's LLMChallenge uses two LLMs:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Extractor LLM produces output"}),`
`,e.jsx(t.li,{children:"Challenger LLM verifies correctness"}),`
`,e.jsx(t.li,{children:"If challenger disagrees, return NULL instead of wrong answer"}),`
`]}),`
`,e.jsx(t.p,{children:"This prevents hallucinations but doubles token costs. Not available in open source edition."}),`
`,e.jsx(t.h2,{id:"cost-optimization",children:"Cost Optimization"}),`
`,e.jsx(t.h3,{id:"struktur",children:"Struktur"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Choose cheaper models (GPT-4o-mini, local LLMs)"}),`
`,e.jsx(t.li,{children:"Use parallel strategy for speed"}),`
`,e.jsx(t.li,{children:"Use simple strategy for small documents"}),`
`,e.jsx(t.li,{children:"Agent only explores relevant sections"}),`
`]}),`
`,e.jsx(t.h3,{id:"unstract",children:"Unstract"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"SummarizedExtraction reduces tokens 6x"}),`
`,e.jsx(t.li,{children:"SinglePass reduces tokens 8x"}),`
`,e.jsx(t.li,{children:"Both require cloud/on-prem license"}),`
`]}),`
`,e.jsx(t.h2,{id:"when-to-choose-struktur",children:"When to Choose Struktur"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Want autonomous agent"})," — Documents explore themselves"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Prefer CLI-first workflow"})," — Extract without writing code"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Lightweight self-hosting"})," — No Docker stack required"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"TypeScript/JavaScript stack"})," — Native SDK"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Variable document structures"})," — Agent adapts"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Full open source features"})," — No feature-gated capabilities"]}),`
`]}),`
`,e.jsx(t.h2,{id:"when-to-choose-unstract",children:"When to Choose Unstract"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Need visual prompt engineering"})," — Prompt Studio for iteration"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Want LLMChallenge verification"})," — Dual-LLM validation"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Using n8n workflows"})," — Native integration"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Python-centric stack"})," — Python SDK"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Non-technical users"})," — Visual interface"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Enterprise features"})," — SSO, human review (cloud/on-prem)"]}),`
`]}),`
`,e.jsx(t.h2,{id:"integration-comparison",children:"Integration Comparison"}),`
`,e.jsx(t.h3,{id:"struktur-1",children:"Struktur"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract } "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '@struktur/sdk'"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'invoice.pdf'"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: invoiceSchema,"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'agent'"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"console."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result.data);"})]})]})})}),`
`,e.jsx(t.h3,{id:"unstract-1",children:"Unstract"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" unstract.sdk "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" UnstractSDK"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"client "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" UnstractSDK("}),e.jsx(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"api_key"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"..."'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"result "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" client.extract("})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"    document"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"invoice.pdf"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"    schema"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"invoice_schema,"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"    prompt_profile"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"invoice_extraction"'})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),`
`,e.jsx(t.h2,{id:"architecture-comparison",children:"Architecture Comparison"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Aspect"}),e.jsx(t.th,{children:"Struktur"}),e.jsx(t.th,{children:"Unstract"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Runtime"}),e.jsx(t.td,{children:"Node.js/Bun"}),e.jsx(t.td,{children:"Python"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Parsing"}),e.jsx(t.td,{children:"Built-in providers"}),e.jsx(t.td,{children:"Unstructured.io"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Vector DB"}),e.jsx(t.td,{children:"Not required"}),e.jsx(t.td,{children:"PGVector"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"LLM support"}),e.jsx(t.td,{children:"OpenAI, Anthropic, local"}),e.jsx(t.td,{children:"OpenAI, Anthropic, Ollama"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Infrastructure"}),e.jsx(t.td,{children:"Single process"}),e.jsx(t.td,{children:"Docker Compose"})]})]})]}),`
`,e.jsx(t.h2,{id:"migration-path",children:"Migration Path"}),`
`,e.jsx(t.p,{children:"Both use JSON Schema for output definitions. Schemas are portable between platforms."}),`
`,e.jsx(t.p,{children:"From Unstract to Struktur:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Export schema from Unstract"}),`
`,e.jsx(t.li,{children:"Use directly in Struktur (compatible format)"}),`
`,e.jsx(t.li,{children:"Replace prompt profiles with strategy selection"}),`
`,e.jsx(t.li,{children:"Deploy without Docker stack"}),`
`]}),`
`,e.jsx(t.p,{children:"From Struktur to Unstract:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Use same schema"}),`
`,e.jsx(t.li,{children:"Create prompt profile in Prompt Studio"}),`
`,e.jsx(t.li,{children:"Deploy via Docker Compose"}),`
`]}),`
`,e.jsx(t.h2,{id:"see-also",children:"See Also"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/compare/llamaindex",children:"Struktur vs LlamaIndex"})," — Cloud vs self-hosted"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/compare/instructor",children:"Struktur vs Instructor"})," — Full pipeline vs library"]}),`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"/docs/what-is-an-extraction-agent",children:"What is an Extraction Agent?"})}),`
`]})]})}function l(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}export{r as _markdown,l as default,a as frontmatter,o as structuredData,c as toc};
