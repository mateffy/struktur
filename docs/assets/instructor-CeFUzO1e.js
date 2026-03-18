import{j as i}from"./main-DdjoLdxK.js";let r=`

Instructor is a Python library for structured LLM outputs. It provides type-safe extraction with automatic retries, but doesn't handle document parsing, chunking, or merging. Struktur is a full extraction pipeline with parsing, chunking, validation, merging, and multiple strategies.

Quick Comparison [#quick-comparison]

| Aspect           | Struktur                 | Instructor      |
| ---------------- | ------------------------ | --------------- |
| Language         | TypeScript/CLI           | Python          |
| Scope            | Full pipeline            | Extraction only |
| Document parsing | Built-in                 | You implement   |
| Chunking         | Built-in                 | You implement   |
| Validation       | Built-in                 | Built-in        |
| Merging          | Built-in                 | You implement   |
| Agent strategy   | Yes                      | No              |
| Retries          | Yes                      | Yes             |
| LLM providers    | OpenAI, Anthropic, local | 15+ providers   |

Instructor Overview [#instructor-overview]

Instructor is the most popular Python library for structured LLM outputs, with 3M+ monthly downloads and 11k GitHub stars. It wraps LLM clients to return validated Pydantic models instead of raw text.

What Instructor Does [#what-instructor-does]

\`\`\`python
import instructor
from openai import OpenAI
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int

client = instructor.from_openai(OpenAI())
user = client.chat.completions.create(
    model="gpt-4o",
    response_model=User,
    messages=[{"role": "user", "content": "Extract: John is 25 years old"}]
)
# user.name = "John", user.age = 25
\`\`\`

Instructor handles:

* **Type-safe extraction** — Pydantic models define structure
* **Validation** — Automatic validation with error feedback
* **Retries** — Re-prompt LLM with validation errors
* **Streaming** — Stream structured outputs

What Instructor Doesn't Do [#what-instructor-doesnt-do]

* **Document parsing** — No PDF/image handling
* **Chunking** — No token-aware splitting
* **Merging** — No result aggregation
* **File handling** — No file I/O
* **CLI** — No command-line interface

You build these yourself.

Struktur Overview [#struktur-overview]

Struktur is a complete extraction pipeline. It handles everything from file input to validated JSON output.

What Struktur Does [#what-struktur-does]

\`\`\`typescript
import { extract } from '@struktur/sdk';

const result = await extract({
  artifacts: [{ path: 'contract.pdf' }],
  schema: contractSchema,
  strategy: 'agent',
});
// result.data is validated JSON
\`\`\`

Struktur handles:

* **Document parsing** — PDFs, images, text files
* **Chunking** — Token-aware splitting
* **Extraction** — Multiple strategies
* **Validation** — JSON Schema validation with retries
* **Merging** — LLM merge or auto-merge
* **Deduplication** — Schema-aware dedup for arrays
* **CLI** — Command-line interface

Scope Comparison [#scope-comparison]

Instructor: Extraction Layer Only [#instructor-extraction-layer-only]

\`\`\`
Document → [You parse] → [You chunk] → [Instructor extracts] → [You merge] → Output
\`\`\`

You implement parsing, chunking, and merging. Instructor handles the extraction call.

Struktur: Full Pipeline [#struktur-full-pipeline]

\`\`\`
Document → [Struktur parses] → [Struktur chunks] → [Struktur extracts] → [Struktur merges] → Output
\`\`\`

Struktur handles everything from file to validated output.

When They're Complementary [#when-theyre-complementary]

You can use Instructor within Struktur's extraction pipeline. Struktur handles parsing, chunking, and merging while Instructor handles the actual LLM call.

This makes sense if:

* You're in a Python environment
* You want Pydantic models
* You need Instructor's retry logic
* You want Struktur's pipeline orchestration

When to Choose Instructor [#when-to-choose-instructor]

* **Already have parsing/chunking solved** — Just need extraction
* **Python stack** — Native Pydantic integration
* **Simple, single-shot extraction** — Document fits in context
* **Maximum flexibility** — Control every step
* **Familiar with Pydantic** — Leverage existing knowledge

Example use case: You have a text processing pipeline. Documents are already chunked. You just need to extract structured data from each chunk.

When to Choose Struktur [#when-to-choose-struktur]

* **Need full pipeline** — Don't want to build parsing/chunking/merging
* **Working with documents** — PDFs, images, scanned files
* **Want agent-based extraction** — Autonomous exploration
* **TypeScript/JavaScript stack** — Native SDK
* **Want CLI** — Extract without writing code

Example use case: Process 10,000 PDF invoices. Need parsing, chunking for long documents, extraction, and merging multi-page results.

Code Comparison [#code-comparison]

Instructor (Python) [#instructor-python]

\`\`\`python
from pydantic import BaseModel
from typing import List
import instructor
from openai import OpenAI

class LineItem(BaseModel):
    description: str
    amount: float

class Invoice(BaseModel):
    vendor: str
    total: float
    items: List[LineItem]

client = instructor.from_openai(OpenAI())

# You must:
# 1. Parse the PDF yourself
# 2. Chunk if too long
# 3. Call instructor for each chunk
# 4. Merge results yourself

text = parse_pdf("invoice.pdf")  # You implement this
invoice = client.chat.completions.create(
    model="gpt-4o",
    response_model=Invoice,
    messages=[{"role": "user", "content": text}]
)
\`\`\`

Struktur (TypeScript) [#struktur-typescript]

\`\`\`typescript
import { extract } from '@struktur/sdk';
import { Type } from '@sinclair/typebox';

const Invoice = Type.Object({
  vendor: Type.String(),
  total: Type.Number(),
  items: Type.Array(Type.Object({
    description: Type.String(),
    amount: Type.Number(),
  })),
});

// Struktur handles everything
const result = await extract({
  artifacts: [{ path: 'invoice.pdf' }],
  schema: Invoice,
  strategy: 'simple',
});

console.log(result.data);
\`\`\`

Feature Breakdown [#feature-breakdown]

Both Have [#both-have]

* Schema validation
* Automatic retries with error feedback
* Multiple LLM provider support
* Streaming support

Only Instructor Has [#only-instructor-has]

* Pydantic model integration
* 15+ LLM provider integrations
* Python ecosystem
* 3M+ monthly downloads (mature)

Only Struktur Has [#only-struktur-has]

* Document parsing (PDF, images)
* Token-aware chunking
* Result merging
* Deduplication
* Agent strategy
* CLI
* Multiple extraction strategies

Migration Path [#migration-path]

If you start with Instructor and need more:

1. Keep your Pydantic models
2. Convert to JSON Schema (Pydantic has built-in support)
3. Use schemas with Struktur
4. Get parsing, chunking, merging for free

\`\`\`python
# Pydantic to JSON Schema
schema = Invoice.model_json_schema()
# Use this schema with Struktur
\`\`\`

See Also [#see-also]

* [Struktur vs LlamaIndex](/compare/llamaindex) — Cloud vs self-hosted
* [Struktur vs Unstract](/compare/unstract) — Open source platforms
* [Struktur vs Manual LLM Calls](/compare/manual-llm-calls) — Building it yourself
`,a={title:"Struktur vs Instructor",description:"Full pipeline vs extraction-only library"},l={contents:[{heading:void 0,content:"Instructor is a Python library for structured LLM outputs. It provides type-safe extraction with automatic retries, but doesn't handle document parsing, chunking, or merging. Struktur is a full extraction pipeline with parsing, chunking, validation, merging, and multiple strategies."},{heading:"quick-comparison",content:"Aspect"},{heading:"quick-comparison",content:"Struktur"},{heading:"quick-comparison",content:"Instructor"},{heading:"quick-comparison",content:"Language"},{heading:"quick-comparison",content:"TypeScript/CLI"},{heading:"quick-comparison",content:"Python"},{heading:"quick-comparison",content:"Scope"},{heading:"quick-comparison",content:"Full pipeline"},{heading:"quick-comparison",content:"Extraction only"},{heading:"quick-comparison",content:"Document parsing"},{heading:"quick-comparison",content:"Built-in"},{heading:"quick-comparison",content:"You implement"},{heading:"quick-comparison",content:"Chunking"},{heading:"quick-comparison",content:"Built-in"},{heading:"quick-comparison",content:"You implement"},{heading:"quick-comparison",content:"Validation"},{heading:"quick-comparison",content:"Built-in"},{heading:"quick-comparison",content:"Built-in"},{heading:"quick-comparison",content:"Merging"},{heading:"quick-comparison",content:"Built-in"},{heading:"quick-comparison",content:"You implement"},{heading:"quick-comparison",content:"Agent strategy"},{heading:"quick-comparison",content:"Yes"},{heading:"quick-comparison",content:"No"},{heading:"quick-comparison",content:"Retries"},{heading:"quick-comparison",content:"Yes"},{heading:"quick-comparison",content:"Yes"},{heading:"quick-comparison",content:"LLM providers"},{heading:"quick-comparison",content:"OpenAI, Anthropic, local"},{heading:"quick-comparison",content:"15+ providers"},{heading:"instructor-overview",content:"Instructor is the most popular Python library for structured LLM outputs, with 3M+ monthly downloads and 11k GitHub stars. It wraps LLM clients to return validated Pydantic models instead of raw text."},{heading:"what-instructor-does",content:"Instructor handles:"},{heading:"what-instructor-does",content:"**Type-safe extraction** — Pydantic models define structure"},{heading:"what-instructor-does",content:"**Validation** — Automatic validation with error feedback"},{heading:"what-instructor-does",content:"**Retries** — Re-prompt LLM with validation errors"},{heading:"what-instructor-does",content:"**Streaming** — Stream structured outputs"},{heading:"what-instructor-doesnt-do",content:"**Document parsing** — No PDF/image handling"},{heading:"what-instructor-doesnt-do",content:"**Chunking** — No token-aware splitting"},{heading:"what-instructor-doesnt-do",content:"**Merging** — No result aggregation"},{heading:"what-instructor-doesnt-do",content:"**File handling** — No file I/O"},{heading:"what-instructor-doesnt-do",content:"**CLI** — No command-line interface"},{heading:"what-instructor-doesnt-do",content:"You build these yourself."},{heading:"struktur-overview",content:"Struktur is a complete extraction pipeline. It handles everything from file input to validated JSON output."},{heading:"what-struktur-does",content:"Struktur handles:"},{heading:"what-struktur-does",content:"**Document parsing** — PDFs, images, text files"},{heading:"what-struktur-does",content:"**Chunking** — Token-aware splitting"},{heading:"what-struktur-does",content:"**Extraction** — Multiple strategies"},{heading:"what-struktur-does",content:"**Validation** — JSON Schema validation with retries"},{heading:"what-struktur-does",content:"**Merging** — LLM merge or auto-merge"},{heading:"what-struktur-does",content:"**Deduplication** — Schema-aware dedup for arrays"},{heading:"what-struktur-does",content:"**CLI** — Command-line interface"},{heading:"instructor-extraction-layer-only",content:"You implement parsing, chunking, and merging. Instructor handles the extraction call."},{heading:"struktur-full-pipeline",content:"Struktur handles everything from file to validated output."},{heading:"when-theyre-complementary",content:"You can use Instructor within Struktur's extraction pipeline. Struktur handles parsing, chunking, and merging while Instructor handles the actual LLM call."},{heading:"when-theyre-complementary",content:"This makes sense if:"},{heading:"when-theyre-complementary",content:"You're in a Python environment"},{heading:"when-theyre-complementary",content:"You want Pydantic models"},{heading:"when-theyre-complementary",content:"You need Instructor's retry logic"},{heading:"when-theyre-complementary",content:"You want Struktur's pipeline orchestration"},{heading:"when-to-choose-instructor",content:"**Already have parsing/chunking solved** — Just need extraction"},{heading:"when-to-choose-instructor",content:"**Python stack** — Native Pydantic integration"},{heading:"when-to-choose-instructor",content:"**Simple, single-shot extraction** — Document fits in context"},{heading:"when-to-choose-instructor",content:"**Maximum flexibility** — Control every step"},{heading:"when-to-choose-instructor",content:"**Familiar with Pydantic** — Leverage existing knowledge"},{heading:"when-to-choose-instructor",content:"Example use case: You have a text processing pipeline. Documents are already chunked. You just need to extract structured data from each chunk."},{heading:"when-to-choose-struktur",content:"**Need full pipeline** — Don't want to build parsing/chunking/merging"},{heading:"when-to-choose-struktur",content:"**Working with documents** — PDFs, images, scanned files"},{heading:"when-to-choose-struktur",content:"**Want agent-based extraction** — Autonomous exploration"},{heading:"when-to-choose-struktur",content:"**TypeScript/JavaScript stack** — Native SDK"},{heading:"when-to-choose-struktur",content:"**Want CLI** — Extract without writing code"},{heading:"when-to-choose-struktur",content:"Example use case: Process 10,000 PDF invoices. Need parsing, chunking for long documents, extraction, and merging multi-page results."},{heading:"both-have",content:"Schema validation"},{heading:"both-have",content:"Automatic retries with error feedback"},{heading:"both-have",content:"Multiple LLM provider support"},{heading:"both-have",content:"Streaming support"},{heading:"only-instructor-has",content:"Pydantic model integration"},{heading:"only-instructor-has",content:"15+ LLM provider integrations"},{heading:"only-instructor-has",content:"Python ecosystem"},{heading:"only-instructor-has",content:"3M+ monthly downloads (mature)"},{heading:"only-struktur-has",content:"Document parsing (PDF, images)"},{heading:"only-struktur-has",content:"Token-aware chunking"},{heading:"only-struktur-has",content:"Result merging"},{heading:"only-struktur-has",content:"Deduplication"},{heading:"only-struktur-has",content:"Agent strategy"},{heading:"only-struktur-has",content:"CLI"},{heading:"only-struktur-has",content:"Multiple extraction strategies"},{heading:"migration-path",content:"If you start with Instructor and need more:"},{heading:"migration-path",content:"Keep your Pydantic models"},{heading:"migration-path",content:"Convert to JSON Schema (Pydantic has built-in support)"},{heading:"migration-path",content:"Use schemas with Struktur"},{heading:"migration-path",content:"Get parsing, chunking, merging for free"},{heading:"see-also",content:"Struktur vs LlamaIndex — Cloud vs self-hosted"},{heading:"see-also",content:"Struktur vs Unstract — Open source platforms"},{heading:"see-also",content:"Struktur vs Manual LLM Calls — Building it yourself"}],headings:[{id:"quick-comparison",content:"Quick Comparison"},{id:"instructor-overview",content:"Instructor Overview"},{id:"what-instructor-does",content:"What Instructor Does"},{id:"what-instructor-doesnt-do",content:"What Instructor Doesn't Do"},{id:"struktur-overview",content:"Struktur Overview"},{id:"what-struktur-does",content:"What Struktur Does"},{id:"scope-comparison",content:"Scope Comparison"},{id:"instructor-extraction-layer-only",content:"Instructor: Extraction Layer Only"},{id:"struktur-full-pipeline",content:"Struktur: Full Pipeline"},{id:"when-theyre-complementary",content:"When They're Complementary"},{id:"when-to-choose-instructor",content:"When to Choose Instructor"},{id:"when-to-choose-struktur",content:"When to Choose Struktur"},{id:"code-comparison",content:"Code Comparison"},{id:"instructor-python",content:"Instructor (Python)"},{id:"struktur-typescript",content:"Struktur (TypeScript)"},{id:"feature-breakdown",content:"Feature Breakdown"},{id:"both-have",content:"Both Have"},{id:"only-instructor-has",content:"Only Instructor Has"},{id:"only-struktur-has",content:"Only Struktur Has"},{id:"migration-path",content:"Migration Path"},{id:"see-also",content:"See Also"}]};const h=[{depth:2,url:"#quick-comparison",title:i.jsx(i.Fragment,{children:"Quick Comparison"})},{depth:2,url:"#instructor-overview",title:i.jsx(i.Fragment,{children:"Instructor Overview"})},{depth:3,url:"#what-instructor-does",title:i.jsx(i.Fragment,{children:"What Instructor Does"})},{depth:3,url:"#what-instructor-doesnt-do",title:i.jsx(i.Fragment,{children:"What Instructor Doesn't Do"})},{depth:2,url:"#struktur-overview",title:i.jsx(i.Fragment,{children:"Struktur Overview"})},{depth:3,url:"#what-struktur-does",title:i.jsx(i.Fragment,{children:"What Struktur Does"})},{depth:2,url:"#scope-comparison",title:i.jsx(i.Fragment,{children:"Scope Comparison"})},{depth:3,url:"#instructor-extraction-layer-only",title:i.jsx(i.Fragment,{children:"Instructor: Extraction Layer Only"})},{depth:3,url:"#struktur-full-pipeline",title:i.jsx(i.Fragment,{children:"Struktur: Full Pipeline"})},{depth:2,url:"#when-theyre-complementary",title:i.jsx(i.Fragment,{children:"When They're Complementary"})},{depth:2,url:"#when-to-choose-instructor",title:i.jsx(i.Fragment,{children:"When to Choose Instructor"})},{depth:2,url:"#when-to-choose-struktur",title:i.jsx(i.Fragment,{children:"When to Choose Struktur"})},{depth:2,url:"#code-comparison",title:i.jsx(i.Fragment,{children:"Code Comparison"})},{depth:3,url:"#instructor-python",title:i.jsx(i.Fragment,{children:"Instructor (Python)"})},{depth:3,url:"#struktur-typescript",title:i.jsx(i.Fragment,{children:"Struktur (TypeScript)"})},{depth:2,url:"#feature-breakdown",title:i.jsx(i.Fragment,{children:"Feature Breakdown"})},{depth:3,url:"#both-have",title:i.jsx(i.Fragment,{children:"Both Have"})},{depth:3,url:"#only-instructor-has",title:i.jsx(i.Fragment,{children:"Only Instructor Has"})},{depth:3,url:"#only-struktur-has",title:i.jsx(i.Fragment,{children:"Only Struktur Has"})},{depth:2,url:"#migration-path",title:i.jsx(i.Fragment,{children:"Migration Path"})},{depth:2,url:"#see-also",title:i.jsx(i.Fragment,{children:"See Also"})}];function e(s){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsx(n.p,{children:"Instructor is a Python library for structured LLM outputs. It provides type-safe extraction with automatic retries, but doesn't handle document parsing, chunking, or merging. Struktur is a full extraction pipeline with parsing, chunking, validation, merging, and multiple strategies."}),`
`,i.jsx(n.h2,{id:"quick-comparison",children:"Quick Comparison"}),`
`,i.jsxs(n.table,{children:[i.jsx(n.thead,{children:i.jsxs(n.tr,{children:[i.jsx(n.th,{children:"Aspect"}),i.jsx(n.th,{children:"Struktur"}),i.jsx(n.th,{children:"Instructor"})]})}),i.jsxs(n.tbody,{children:[i.jsxs(n.tr,{children:[i.jsx(n.td,{children:"Language"}),i.jsx(n.td,{children:"TypeScript/CLI"}),i.jsx(n.td,{children:"Python"})]}),i.jsxs(n.tr,{children:[i.jsx(n.td,{children:"Scope"}),i.jsx(n.td,{children:"Full pipeline"}),i.jsx(n.td,{children:"Extraction only"})]}),i.jsxs(n.tr,{children:[i.jsx(n.td,{children:"Document parsing"}),i.jsx(n.td,{children:"Built-in"}),i.jsx(n.td,{children:"You implement"})]}),i.jsxs(n.tr,{children:[i.jsx(n.td,{children:"Chunking"}),i.jsx(n.td,{children:"Built-in"}),i.jsx(n.td,{children:"You implement"})]}),i.jsxs(n.tr,{children:[i.jsx(n.td,{children:"Validation"}),i.jsx(n.td,{children:"Built-in"}),i.jsx(n.td,{children:"Built-in"})]}),i.jsxs(n.tr,{children:[i.jsx(n.td,{children:"Merging"}),i.jsx(n.td,{children:"Built-in"}),i.jsx(n.td,{children:"You implement"})]}),i.jsxs(n.tr,{children:[i.jsx(n.td,{children:"Agent strategy"}),i.jsx(n.td,{children:"Yes"}),i.jsx(n.td,{children:"No"})]}),i.jsxs(n.tr,{children:[i.jsx(n.td,{children:"Retries"}),i.jsx(n.td,{children:"Yes"}),i.jsx(n.td,{children:"Yes"})]}),i.jsxs(n.tr,{children:[i.jsx(n.td,{children:"LLM providers"}),i.jsx(n.td,{children:"OpenAI, Anthropic, local"}),i.jsx(n.td,{children:"15+ providers"})]})]})]}),`
`,i.jsx(n.h2,{id:"instructor-overview",children:"Instructor Overview"}),`
`,i.jsx(n.p,{children:"Instructor is the most popular Python library for structured LLM outputs, with 3M+ monthly downloads and 11k GitHub stars. It wraps LLM clients to return validated Pydantic models instead of raw text."}),`
`,i.jsx(n.h3,{id:"what-instructor-does",children:"What Instructor Does"}),`
`,i.jsx(i.Fragment,{children:i.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" fill="currentColor" /></svg>',children:i.jsxs(n.code,{children:[i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" instructor"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" openai "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OpenAI"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pydantic "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BaseModel"})]}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"class"}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" User"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BaseModel"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    name: "}),i.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"str"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    age: "}),i.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"int"})]}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"client "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" instructor.from_openai(OpenAI())"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"user "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" client.chat.completions.create("})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"    model"}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"    response_model"}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"User,"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"    messages"}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[{"}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"role"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"user"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"content"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Extract: John is 25 years old"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}]"})]}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# user.name = "John", user.age = 25'})})]})})}),`
`,i.jsx(n.p,{children:"Instructor handles:"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Type-safe extraction"})," — Pydantic models define structure"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Validation"})," — Automatic validation with error feedback"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Retries"})," — Re-prompt LLM with validation errors"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Streaming"})," — Stream structured outputs"]}),`
`]}),`
`,i.jsx(n.h3,{id:"what-instructor-doesnt-do",children:"What Instructor Doesn't Do"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Document parsing"})," — No PDF/image handling"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Chunking"})," — No token-aware splitting"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Merging"})," — No result aggregation"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"File handling"})," — No file I/O"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"CLI"})," — No command-line interface"]}),`
`]}),`
`,i.jsx(n.p,{children:"You build these yourself."}),`
`,i.jsx(n.h2,{id:"struktur-overview",children:"Struktur Overview"}),`
`,i.jsx(n.p,{children:"Struktur is a complete extraction pipeline. It handles everything from file input to validated JSON output."}),`
`,i.jsx(n.h3,{id:"what-struktur-does",children:"What Struktur Does"}),`
`,i.jsx(i.Fragment,{children:i.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(n.code,{children:[i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract } "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '@struktur/sdk'"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'contract.pdf'"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: contractSchema,"})}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'agent'"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// result.data is validated JSON"})})]})})}),`
`,i.jsx(n.p,{children:"Struktur handles:"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Document parsing"})," — PDFs, images, text files"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Chunking"})," — Token-aware splitting"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Extraction"})," — Multiple strategies"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Validation"})," — JSON Schema validation with retries"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Merging"})," — LLM merge or auto-merge"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Deduplication"})," — Schema-aware dedup for arrays"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"CLI"})," — Command-line interface"]}),`
`]}),`
`,i.jsx(n.h2,{id:"scope-comparison",children:"Scope Comparison"}),`
`,i.jsx(n.h3,{id:"instructor-extraction-layer-only",children:"Instructor: Extraction Layer Only"}),`
`,i.jsx(i.Fragment,{children:i.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(n.code,{children:i.jsx(n.span,{className:"line",children:i.jsx(n.span,{children:"Document → [You parse] → [You chunk] → [Instructor extracts] → [You merge] → Output"})})})})}),`
`,i.jsx(n.p,{children:"You implement parsing, chunking, and merging. Instructor handles the extraction call."}),`
`,i.jsx(n.h3,{id:"struktur-full-pipeline",children:"Struktur: Full Pipeline"}),`
`,i.jsx(i.Fragment,{children:i.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(n.code,{children:i.jsx(n.span,{className:"line",children:i.jsx(n.span,{children:"Document → [Struktur parses] → [Struktur chunks] → [Struktur extracts] → [Struktur merges] → Output"})})})})}),`
`,i.jsx(n.p,{children:"Struktur handles everything from file to validated output."}),`
`,i.jsx(n.h2,{id:"when-theyre-complementary",children:"When They're Complementary"}),`
`,i.jsx(n.p,{children:"You can use Instructor within Struktur's extraction pipeline. Struktur handles parsing, chunking, and merging while Instructor handles the actual LLM call."}),`
`,i.jsx(n.p,{children:"This makes sense if:"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsx(n.li,{children:"You're in a Python environment"}),`
`,i.jsx(n.li,{children:"You want Pydantic models"}),`
`,i.jsx(n.li,{children:"You need Instructor's retry logic"}),`
`,i.jsx(n.li,{children:"You want Struktur's pipeline orchestration"}),`
`]}),`
`,i.jsx(n.h2,{id:"when-to-choose-instructor",children:"When to Choose Instructor"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Already have parsing/chunking solved"})," — Just need extraction"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Python stack"})," — Native Pydantic integration"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Simple, single-shot extraction"})," — Document fits in context"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Maximum flexibility"})," — Control every step"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Familiar with Pydantic"})," — Leverage existing knowledge"]}),`
`]}),`
`,i.jsx(n.p,{children:"Example use case: You have a text processing pipeline. Documents are already chunked. You just need to extract structured data from each chunk."}),`
`,i.jsx(n.h2,{id:"when-to-choose-struktur",children:"When to Choose Struktur"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Need full pipeline"})," — Don't want to build parsing/chunking/merging"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Working with documents"})," — PDFs, images, scanned files"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Want agent-based extraction"})," — Autonomous exploration"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"TypeScript/JavaScript stack"})," — Native SDK"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.strong,{children:"Want CLI"})," — Extract without writing code"]}),`
`]}),`
`,i.jsx(n.p,{children:"Example use case: Process 10,000 PDF invoices. Need parsing, chunking for long documents, extraction, and merging multi-page results."}),`
`,i.jsx(n.h2,{id:"code-comparison",children:"Code Comparison"}),`
`,i.jsx(n.h3,{id:"instructor-python",children:"Instructor (Python)"}),`
`,i.jsx(i.Fragment,{children:i.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" fill="currentColor" /></svg>',children:i.jsxs(n.code,{children:[i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pydantic "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BaseModel"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" typing "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" List"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" instructor"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" openai "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OpenAI"})]}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"class"}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" LineItem"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BaseModel"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    description: "}),i.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"str"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    amount: "}),i.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"float"})]}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"class"}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Invoice"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BaseModel"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    vendor: "}),i.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"str"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    total: "}),i.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"float"})]}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    items: List[LineItem]"})}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"client "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" instructor.from_openai(OpenAI())"})]}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# You must:"})}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# 1. Parse the PDF yourself"})}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# 2. Chunk if too long"})}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# 3. Call instructor for each chunk"})}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# 4. Merge results yourself"})}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"text "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" parse_pdf("}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"invoice.pdf"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")  "}),i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# You implement this"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"invoice "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" client.chat.completions.create("})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"    model"}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"    response_model"}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Invoice,"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"    messages"}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[{"}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"role"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"user"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"content"'}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": text}]"})]}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),`
`,i.jsx(n.h3,{id:"struktur-typescript",children:"Struktur (TypeScript)"}),`
`,i.jsx(i.Fragment,{children:i.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(n.code,{children:[i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract } "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '@struktur/sdk'"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { Type } "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '@sinclair/typebox'"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" Invoice"}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Type."}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Object"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  vendor: Type."}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"String"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  total: Type."}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Number"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  items: Type."}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Array"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Type."}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Object"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    description: Type."}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"String"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    amount: Type."}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Number"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),"})]}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  })),"})}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Struktur handles everything"})}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'invoice.pdf'"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: Invoice,"})}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),i.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'simple'"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,i.jsx(n.span,{className:"line"}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"console."}),i.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result.data);"})]})]})})}),`
`,i.jsx(n.h2,{id:"feature-breakdown",children:"Feature Breakdown"}),`
`,i.jsx(n.h3,{id:"both-have",children:"Both Have"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsx(n.li,{children:"Schema validation"}),`
`,i.jsx(n.li,{children:"Automatic retries with error feedback"}),`
`,i.jsx(n.li,{children:"Multiple LLM provider support"}),`
`,i.jsx(n.li,{children:"Streaming support"}),`
`]}),`
`,i.jsx(n.h3,{id:"only-instructor-has",children:"Only Instructor Has"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsx(n.li,{children:"Pydantic model integration"}),`
`,i.jsx(n.li,{children:"15+ LLM provider integrations"}),`
`,i.jsx(n.li,{children:"Python ecosystem"}),`
`,i.jsx(n.li,{children:"3M+ monthly downloads (mature)"}),`
`]}),`
`,i.jsx(n.h3,{id:"only-struktur-has",children:"Only Struktur Has"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsx(n.li,{children:"Document parsing (PDF, images)"}),`
`,i.jsx(n.li,{children:"Token-aware chunking"}),`
`,i.jsx(n.li,{children:"Result merging"}),`
`,i.jsx(n.li,{children:"Deduplication"}),`
`,i.jsx(n.li,{children:"Agent strategy"}),`
`,i.jsx(n.li,{children:"CLI"}),`
`,i.jsx(n.li,{children:"Multiple extraction strategies"}),`
`]}),`
`,i.jsx(n.h2,{id:"migration-path",children:"Migration Path"}),`
`,i.jsx(n.p,{children:"If you start with Instructor and need more:"}),`
`,i.jsxs(n.ol,{children:[`
`,i.jsx(n.li,{children:"Keep your Pydantic models"}),`
`,i.jsx(n.li,{children:"Convert to JSON Schema (Pydantic has built-in support)"}),`
`,i.jsx(n.li,{children:"Use schemas with Struktur"}),`
`,i.jsx(n.li,{children:"Get parsing, chunking, merging for free"}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" fill="currentColor" /></svg>',children:i.jsxs(n.code,{children:[i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Pydantic to JSON Schema"})}),`
`,i.jsxs(n.span,{className:"line",children:[i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"schema "}),i.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Invoice.model_json_schema()"})]}),`
`,i.jsx(n.span,{className:"line",children:i.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Use this schema with Struktur"})})]})})}),`
`,i.jsx(n.h2,{id:"see-also",children:"See Also"}),`
`,i.jsxs(n.ul,{children:[`
`,i.jsxs(n.li,{children:[i.jsx(n.a,{href:"/compare/llamaindex",children:"Struktur vs LlamaIndex"})," — Cloud vs self-hosted"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.a,{href:"/compare/unstract",children:"Struktur vs Unstract"})," — Open source platforms"]}),`
`,i.jsxs(n.li,{children:[i.jsx(n.a,{href:"/compare/manual-llm-calls",children:"Struktur vs Manual LLM Calls"})," — Building it yourself"]}),`
`]})]})}function c(s={}){const{wrapper:n}=s.components||{};return n?i.jsx(n,{...s,children:i.jsx(e,{...s})}):e(s)}export{r as _markdown,c as default,a as frontmatter,l as structuredData,h as toc};
