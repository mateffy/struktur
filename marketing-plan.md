# Struktur Marketing Plan

Working document for content marketing strategy. Updated as we progress.

---

## Status Summary

**Completed:**
- [x] Blog infrastructure at `/blog`
- [x] Comparison pages at `/vs`
- [x] 5 blog post placeholders
- [x] 4 comparison page placeholders
- [x] 2 GEO definition pages
- [x] Schema markup (SoftwareApplication + Organization)
- [x] Navigation links

**Next Steps:**
1. Write actual blog post content (replace placeholders)
2. Write actual comparison page content (replace placeholders)
3. Test AI visibility and document results
4. Launch on HN with technical blog post

---

## 1. Blog Implementation

### Approach

Add blog posts as regular documentation pages under `/blog/` path. No complex blog system needed - just MDX files in `content/docs/blog/` that render like any other doc page.

### File Structure

```
packages/documentation/content/
├── blog/
│   ├── index.mdx              # Blog listing page
│   ├── meta.json
│   ├── why-pdf-to-markdown-fails.mdx
│   ├── building-autonomous-extraction-agent.mdx
│   ├── chunking-validation-retries.mdx
│   ├── agent-vs-simple-vs-parallel.mdx
│   └── extracting-invoices-at-scale.mdx
├── vs/
│   ├── index.mdx              # Comparisons landing
│   ├── meta.json
│   ├── llamaindex.mdx
│   ├── unstract.mdx
│   ├── instructor.mdx
│   └── manual-llm-calls.mdx
├── docs/
│   └── ... (existing docs)
```

### Implementation Steps

1. **Create content directories**
   - `content/docs/blog/`
   - `content/docs/vs/`

2. **Create blog index page** (`content/docs/blog/index.mdx`)
   - List all blog posts with dates
   - Brief description for each
   - Link to RSS feed (optional, later)

3. **Create comparisons index page** (`content/docs/vs/index.mdx`)
   - Overview of when to choose Struktur vs alternatives
   - Links to individual comparison pages

4. **Add navigation links**
   - Add "Blog" link to homepage nav
   - Add "Comparisons" link to docs sidebar

5. **SEO metadata**
   - Each blog post needs proper frontmatter: title, description, date, author
   - Open Graph tags for social sharing

### Frontmatter Template for Blog Posts

```yaml
---
title: "Post Title"
description: "Brief description for SEO and social"
date: "2026-03-18"
author: "Lukas Mateffy"
---
```

---

## 2. Initial Blog Posts (5)

### Post 1: Why PDF-to-Markdown Fails for Structured Extraction

**File:** `content/docs/blog/why-pdf-to-markdown-fails.mdx`

**Target Keywords:** "pdf to markdown llm", "document extraction ocr", "structured data extraction pdf"

**Outline:**
- The promise: PDF → Markdown → LLM → JSON
- What gets lost: bounding boxes, reading order, table structure, confidence scores
- Real example: invoice with line items, table extraction failure
- Why LLMs need structure, not just text
- How Struktur's artifact format preserves what matters
- When Markdown IS enough (simple text documents)

**Angle:** Technical deep-dive, not marketing. Piggybacks on Unstract's similar article but from Struktur's perspective.

---

### Post 2: Building an Autonomous Extraction Agent

**File:** `content/docs/blog/building-autonomous-extraction-agent.mdx`

**Target Keywords:** "llm agent document extraction", "autonomous extraction", "llm tools filesystem"

**Outline:**
- The problem: fixed strategies require upfront configuration
- What an agent can do: read, grep, find, explore
- Virtual filesystem design: `/artifacts/`, `/manifest.json`
- Tool design: `set_output_data`, `update_output_data`, `finish`, `fail`
- How the agent decides what to do (prompting strategy)
- Example: agent exploring a 50-page contract
- Trade-offs: variable token cost, requires tool-calling model
- Code walkthrough: how the agent strategy is implemented

**Angle:** Technical implementation details. Shows the "how" not just the "what".

---

### Post 3: The Chunking, Validation, and Retry Problem

**File:** `content/docs/blog/chunking-validation-retries.mdx`

**Target Keywords:** "llm chunking strategy", "schema validation llm", "llm retry validation errors"

**Outline:**
- The boilerplate everyone writes: chunking, validation, retries, merging
- Token budgets: why 10k tokens isn't arbitrary
- Validation in the loop: sending errors back to the LLM
- Why most extractions converge in 2 attempts
- Merging strategies: LLM merge vs schema-aware auto-merge
- Deduplication: when you need it, when you don't
- How Struktur handles this so you don't have to

**Angle:** Addresses the pain point directly. "You're writing this boilerplate. Here's why it's hard. Here's how we solved it."

---

### Post 4: Agent vs Simple vs Parallel: Choosing a Strategy

**File:** `content/docs/blog/agent-vs-simple-vs-parallel.mdx`

**Target Keywords:** "llm extraction strategy", "document extraction parallel", "sequential vs parallel extraction"

**Outline:**
- The decision tree: start with agent, fall back when needed
- Simple: when your document fits in context
- Parallel: when speed matters more than cross-chunk context
- Sequential: when order matters (building up line items)
- Auto-merge variants: deduplication for arrays
- Double-pass: when quality is worth the cost
- Real examples: invoice (simple), catalog (parallel), contract (agent)
- Token cost comparison table

**Angle:** Practical guide. Helps developers choose the right approach.

---

### Post 5: Extracting Invoices at Scale: A Real-World Example

**File:** `content/docs/blog/extracting-invoices-at-scale.mdx`

**Target Keywords:** "invoice extraction llm", "extract invoice data python", "automated invoice processing"

**Outline:**
- The problem: 10,000 invoices, 50 vendors, inconsistent formats
- Schema design: vendor, line items, totals, dates
- Handling edge cases: missing fields, multi-page, handwritten notes
- Strategy choice: why parallelAutoMerge for this case
- Error handling: what to do with failed extractions
- Cost analysis: tokens per invoice, total cost
- Code example: full pipeline from PDF to database
- Lessons learned: what surprised us

**Angle:** End-to-end walkthrough. Shows the tool in action on a real problem.

---

## 3. Comparison Pages (4)

### Page 1: Struktur vs LlamaIndex (LlamaParse/LlamaExtract)

**File:** `content/docs/vs/llamaindex.mdx`

**Research Summary:**
- LlamaParse: PDF parsing service, credits-based pricing ($1.25/1000 credits)
- LlamaExtract: Structured extraction on top of LlamaParse
- Pricing: 5-60 credits per page depending on mode (Fast to Premium)
- Features: citations, confidence scores, field-level metadata
- Limitations: cloud-only, per-page pricing, locked into their infrastructure

**Comparison Points:**

| Aspect | Struktur | LlamaIndex |
|--------|----------|------------|
| Pricing | Your LLM API costs only | $0.005-$0.075 per page |
| Deployment | Local or your cloud | Their cloud only |
| Data privacy | Full control | Documents uploaded to their servers |
| Parsing | Built-in, extensible | LlamaParse (excellent quality) |
| Extraction | Agent + multiple strategies | LlamaExtract (single approach) |
| Citations | Not yet | Yes, with bounding boxes |
| Confidence scores | Not yet | Yes, per-field |

**When to choose Struktur:**
- Cost-sensitive at scale
- Data cannot leave your infrastructure
- Want control over LLM provider
- Need multiple extraction strategies

**When to choose LlamaIndex:**
- Need citations/confidence scores
- Want managed infrastructure
- Quality matters more than cost
- Single extraction approach is fine

---

### Page 2: Struktur vs Unstract

**File:** `content/docs/vs/unstract.mdx`

**Research Summary:**
- Open source (Apache 2.0) + cloud offering
- LLMChallenge: two LLMs for verification (right answer or NULL)
- SummarizedExtraction, SinglePass: cost optimization features
- Prompt Studio: visual prompt engineering
- n8n integration for workflows
- Open source edition lacks: SSO, human review, LLMChallenge, cost optimizations

**Comparison Points:**

| Aspect | Struktur | Unstract |
|--------|----------|----------|
| License | MIT | Apache 2.0 |
| Approach | Agent-first | Prompt-based |
| Verification | Schema validation | LLMChallenge (dual LLM) |
| Cost optimization | Multiple strategies | Summarized/SinglePass |
| Visual tools | None | Prompt Studio |
| Workflow integration | CLI/SDK | n8n, API |
| Self-hosted | Yes, lightweight | Yes, requires Docker stack |

**When to choose Struktur:**
- Want autonomous agent exploration
- Prefer CLI-first workflow
- Lightweight self-hosting
- TypeScript/JavaScript stack

**When to choose Unstract:**
- Need visual prompt engineering
- Want LLMChallenge verification
- Using n8n for workflows
- Python-centric stack

---

### Page 3: Struktur vs Instructor

**File:** `content/docs/vs/instructor.mdx`

**Research Summary:**
- Python library for structured LLM outputs
- 3M+ monthly downloads, 11k GitHub stars
- Pydantic models for type-safe extraction
- Automatic retries on validation failure
- Works with 15+ LLM providers
- Single-shot extraction, no chunking/merging

**Comparison Points:**

| Aspect | Struktur | Instructor |
|--------|----------|------------|
| Language | TypeScript/CLI | Python |
| Scope | Full pipeline | Extraction only |
| Chunking | Built-in | You implement |
| Validation | Built-in | Built-in |
| Merging | Built-in | You implement |
| File parsing | Built-in | You implement |
| Agent strategy | Yes | No |
| Retries | Yes | Yes |

**When to choose Struktur:**
- Need full pipeline (parse → chunk → extract → merge)
- Working with documents (PDFs, images)
- Want agent-based extraction
- TypeScript/JavaScript stack

**When to choose Instructor:**
- Already have parsing/chunking solved
- Python stack
- Need simple, single-shot extraction
- Want maximum flexibility

**Note:** These are complementary tools. You could use Instructor within Struktur's extraction pipeline.

---

### Page 4: Struktur vs Manual LLM Calls

**File:** `content/docs/vs/manual-llm-calls.mdx`

**Target Audience:** Developers considering building their own extraction pipeline

**Comparison Points:**

| Aspect | Struktur | Manual Implementation |
|--------|----------|------------------------|
| Chunking | Token-aware, automatic | You build it |
| Validation | Schema validation + retry | You build it |
| Merging | LLM merge or auto-merge | You build it |
| Deduplication | Schema-aware | You build it |
| File parsing | Built-in + extensible | You build it |
| Error handling | Comprehensive | You build it |
| Token tracking | Built-in | You build it |
| Time to ship | Minutes | Days/weeks |

**The boilerplate you'd write:**
```typescript
// What you'd need to build manually:
// 1. Token counting and chunking
// 2. Prompt construction per chunk
// 3. LLM API calls with error handling
// 4. Schema validation (ajv/zod)
// 5. Retry logic with error feedback
// 6. Result merging strategy
// 7. Deduplication for arrays
// 8. Token usage tracking
// 9. File parsing (PDF, images)
// 10. CLI argument parsing
```

**When to build manually:**
- Learning exercise
- Very specific requirements
- Minimal scope (single document type)

**When to use Struktur:**
- Production workloads
- Multiple document types
- Need to ship fast
- Want maintained, tested code

---

## 4. Distribution Plan

### After Publishing

1. **Cross-post to Dev.to**
   - Dev.to can auto-import from RSS, or manual cross-post
   - Use canonical URL to struktur.sh

2. **Share on Reddit**
   - r/SideProject (show what you built)
   - r/selfhosted (open source, self-hostable)
   - r/opensource (MIT licensed)
   - NOT r/programming (too promotional)

3. **Hacker News**
   - Pick ONE post to launch with
   - "Show HN: Struktur – Open source structured data extraction with autonomous agents"
   - Or launch with a technical blog post

4. **Twitter/X**
   - Thread summarizing each post
   - Tag relevant people (Vercel AI SDK team, etc.)

5. **Answer Stack Overflow questions**
   - Search for "extract data from pdf llm", "structured extraction json schema"
   - Answer with Struktur as a solution

---

## 5. Progress Tracking

### Blog Posts
- [x] `why-pdf-to-markdown-fails.mdx`
- [x] `building-autonomous-extraction-agent.mdx`
- [x] `chunking-validation-retries.mdx`
- [x] `agent-vs-simple-vs-parallel.mdx`
- [x] `extracting-invoices-at-scale.mdx`

### Comparison Pages
- [x] `llamaindex.mdx`
- [x] `unstract.mdx`
- [x] `instructor.mdx`
- [x] `manual-llm-calls.mdx`

### Infrastructure
- [x] Create `content/docs/blog/` directory
- [x] Create `content/docs/vs/` directory
- [x] Blog index page
- [x] Comparisons index page
- [x] Add nav links to homepage
- [x] Add to docs sidebar

### GEO Optimization
- [x] Add `SoftwareApplication` schema to homepage (already existed)
- [x] Add `Organization` schema
- [x] Create "What is structured data extraction?" definition page
- [x] Create "What is an extraction agent?" definition page
- [ ] Test AI visibility (ChatGPT, Perplexity, Claude, Gemini)
- [ ] Document current AI mention status
- [ ] Get mentioned on Reddit (r/LocalLLaMA, r/MachineLearning)
- [ ] Get GitHub stars (social proof for training data)
- [ ] Launch on HN (enters training data)

---

## 6. LLM/GEO Optimization (Generative Engine Optimization)

### What is GEO?

GEO (Generative Engine Optimization) is the practice of optimizing content to appear in AI-generated answers from ChatGPT, Perplexity, Claude, and Gemini. Unlike traditional SEO where you rank in a list of results, GEO means being the cited source inside AI responses.

**Key insight:** When someone asks ChatGPT "What's the best tool for extracting data from PDFs?", there's no page two. Either Struktur gets mentioned, or it doesn't.

### How LLMs Choose What to Recommend

LLMs don't have secret algorithms or paid placement. They work through:

1. **Training data patterns** - If Struktur appeared frequently in high-quality sources during model training, the model learned associations between "struktur" and "document extraction", "structured data", etc.

2. **Semantic matching** - When someone asks a question, the model connects query intent to learned patterns. Clear positioning = stronger associations.

3. **Authority signals** - Mentions in TechCrunch, GitHub stars, Reddit discussions, G2 reviews all signal relevance.

4. **RAG (Retrieval-Augmented Generation)** - Systems like Perplexity and ChatGPT with browsing search the web in real-time. Your SEO ranking now directly impacts AI recommendations.

### GEO Strategy for Struktur

#### 1. Technical AI Readiness

**Goal:** Make struktur.sh easily parseable by AI crawlers.

- [ ] Ensure server-side rendering or static HTML (not client-only React)
- [ ] Add comprehensive schema markup:
  - `SoftwareApplication` schema for the product
  - `Organization` schema for the company
  - `FAQPage` schema for FAQ sections
  - `HowTo` schema for tutorials
- [ ] Use semantic HTML headings (H1-H4 properly nested)
- [ ] Create `/llms.txt` file (already exists!)
- [ ] Ensure fast page load times

#### 2. Answer-First Content Design

**Goal:** Write content that AI can quote directly.

Every page should follow this pattern:
1. State the question explicitly (as a heading)
2. Provide a direct answer in 2-3 sentences
3. Support with evidence, examples, context

**Example transformation:**

❌ Bad: "Struktur is a revolutionary solution for document processing needs..."

✅ Good: "Struktur extracts structured data from PDFs, images, and text files using an autonomous LLM agent. It handles chunking, validation, retries, and merging automatically."

**The two-sentence test:** Can an AI lift one paragraph from this page and use it as a standalone answer? If no, revise.

#### 3. Own Key Definitions

**Goal:** When someone asks "What is [concept]?", Struktur's definition gets cited.

Create definition-style content for:
- "What is structured data extraction?"
- "What is an extraction agent?"
- "What is document chunking for LLMs?"
- "What is schema validation for LLM outputs?"

Each definition should be:
- 2-3 sentences
- Technically accurate
- Quotable without modification

#### 4. Comparison Content is Critical

**Goal:** When someone asks "What's the best alternative to [competitor]?", Struktur appears.

LLMs love comparison content. It teaches them category relationships:
- "Struktur vs LlamaExtract"
- "Struktur vs Unstract"
- "Struktur vs Instructor"
- "Open source alternatives to LlamaParse"

This is why the `/vs/` pages are so important for GEO.

#### 5. Mentions > Backlinks

**Goal:** Get mentioned in places AI models learn from.

Traditional SEO: backlinks = authority
GEO: mentions in trusted sources = authority

Target sources for mentions:
- [ ] GitHub (stars, activity, discussions) - HIGH PRIORITY
- [ ] Reddit (r/LocalLLaMA, r/MachineLearning, r/programming)
- [ ] Hacker News (successful launch = training data presence)
- [ ] Dev.to articles
- [ ] Product Hunt (even if low traction, it's indexed)
- [ ] G2/Capterra reviews
- [ ] TechCrunch/industry publications
- [ ] Stack Overflow answers
- [ ] YouTube tutorials mentioning Struktur
- [ ] Podcast mentions

#### 6. Prompt-Oriented Keyword Research

**Goal:** Optimize for how people ask AI, not just how they search Google.

Traditional keyword: "pdf extraction tool"
Prompt-oriented: "What's the best open source tool for extracting structured data from PDF invoices?"

Research prompts by:
- Checking Reddit/Quora for how people phrase questions
- Testing ChatGPT/Perplexity with category questions
- Looking at "People Also Ask" boxes

**Target prompts for Struktur:**
- "What's the best open source document extraction tool?"
- "How do I extract structured data from PDFs using LLMs?"
- "What's an alternative to LlamaParse that's self-hosted?"
- "How do I build a document extraction pipeline with LLMs?"
- "What's the best tool for invoice extraction with AI?"

#### 7. Create Citation-Ready Content

**Goal:** Every paragraph should be quotable.

Characteristics of citation-ready content:
- Specific, not vague ("extracts data from PDFs" not "revolutionary solution")
- Factual, not marketing language
- Self-contained (doesn't require context from earlier in the page)
- Includes concrete details (numbers, examples, comparisons)

#### 8. Smart Internal Linking

**Goal:** Help AI understand relationships between concepts.

Link patterns that work:
- Comparison links: "See how Struktur compares to LlamaExtract"
- Use-case links: "Struktur for invoice extraction"
- Alternative links: "Open source alternatives to managed extraction APIs"

Anchor text should describe the relationship, not just "click here".

#### 9. Monitor and Iterate

**Goal:** Track what's working and adjust.

Test regularly:
- [ ] Ask ChatGPT: "What's the best tool for extracting data from PDFs?"
- [ ] Ask Perplexity: "Open source document extraction tools"
- [ ] Ask Claude: "How do I extract structured JSON from documents?"
- [ ] Ask Gemini: "Best LLM document extraction libraries"

Track:
- Does Struktur appear?
- Where in the response? (first mentioned = best)
- How is it described? (accurate positioning?)
- What competitors appear?

### GEO Content Priorities

Based on GEO research, prioritize this content:

1. **Comparison pages** (`/vs/`) - Highest GEO value
   - LLMs learn category relationships from comparisons
   - "Struktur vs X" pages teach AI that Struktur belongs in that category

2. **Definition pages** - High GEO value
   - "What is structured data extraction?"
   - "What is an extraction agent?"
   - Own the definitions, own the AI answers

3. **Problem-solution content** - High GEO value
   - "How to extract data from invoices"
   - "How to process PDFs with LLMs"
   - Direct problem → solution mapping

4. **Technical deep-dives** - Medium GEO value
   - Shows expertise and authority
   - Gets cited for specific technical questions

5. **General blog posts** - Lower GEO value
   - Still useful for traditional SEO
   - Less likely to be quoted directly

### GEO-Specific Content to Add

Consider adding these pages specifically for GEO:

| Page | Target Prompt |
|------|---------------|
| `/docs/what-is-structured-data-extraction` | "What is structured data extraction?" |
| `/docs/what-is-an-extraction-agent` | "What is an LLM extraction agent?" |
| `/docs/open-source-document-extraction-tools` | "Open source document extraction tools" |
| `/docs/pdf-to-json-extraction` | "How to extract JSON from PDFs" |
| `/docs/invoice-extraction-ai` | "AI invoice extraction tools" |

---

## 7. Notes

- Keep posts technical, not marketing-y
- Use real code examples
- Be honest about limitations
- Link to documentation for details
- Each post should stand alone as a useful resource
- Write for AI to quote: specific, factual, self-contained
