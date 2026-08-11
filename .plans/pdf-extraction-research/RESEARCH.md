# PDF Content Reconstruction: Top 10 Approaches (mid-2026)

> Research document for Struktur — improving PDF text extraction for LLM consumption.
> Goal: identify embeddable solutions for table structure retention, header/footer removal, and layout-aware extraction.

---

## Summary

The PDF-to-text landscape has bifurcated into three camps in 2025–2026:

1. **Layout-analysis pipelines** (rules + ML models for element detection, reading order, table structure) — highest quality, Python-dominated, GPU-optional
2. **Vision Language Models** (VLM: feed page image → model outputs markdown) — state of the art for complex layouts, requires API or GPU, higher cost
3. **Rust/Native engines** (high-speed extraction with Node.js bindings) — good compromise for embedding in a TS library

No tool is best at everything. Benchmarks consistently show MinerU wins on tables/formulas, Marker wins on scanned documents, and Docling wins on balanced general-purpose extraction.

---

## Approach 1: Docling (IBM Research)

- **Type:** Layout analysis + optional VLM (SmolDocling / Granite-Docling)
- **Language:** Python (CLI embeddable, subprocess-callable from Node.js)
- **License:** MIT
- **GitHub:** [docling-project/docling](https://github.com/docling-project/docling) — 25K+ stars
- **Output:** Markdown, JSON, HTML, DocTags (unified document markup)
- **Table support:** Excellent — table structure recognized and rendered as markdown tables
- **Header/footer:** Detected and separated via layout model (Granite-Docling or TableFormer)

**How it works:** Multi-stage pipeline: (1) layout detection model identifies paragraphs, headings, tables, figures, headers/footers, lists; (2) table structure recognition; (3) reading-order reconstruction; (4) markdown export. v2 adds SmolDocling, a 256M-param VLM that processes the whole page end-to-end, and Granite-Docling for enterprise-grade accuracy.

**Embedding in Struktur:** Callable as a subprocess (`docling file.pdf --to md`). MIT license is permissive. The CLI is a thin wrapper — needs Python + `pip install docling`. For a TS library, this means a peer dependency on Python, or a Docker sidecar. Quality is excellent — likely the best balanced choice for general PDFs.

**Popularity:** Rapidly growing, backed by IBM, active development, strong community.

---

## Approach 2: Zerox (Omni AI) — Vision-Powered OCR SDK

- **Type:** VLM-based — sends page images to GPT-4o/Claude/Gemini
- **Language:** Node.js + Python SDKs
- **License:** MIT
- **GitHub:** [getomni-ai/zerox](https://github.com/getomni-ai/zerox) — 12K+ stars
- **NPM:** `zerox`
- **Output:** Markdown (per page), structured JSON extraction via schema
- **Table support:** Excellent for complex tables when using `maintainFormat: true`
- **Header/footer:** VLM naturally handles — the model sees the full page and can distinguish content from boilerplate

**How it works:** Converts each PDF page to an image, sends it to a VLM (GPT-4o, Claude, Gemini, or local via Ollama), receives the page back as markdown. Supports structured extraction with JSON schemas (Node.js SDK only). Concurrency controls, selective page processing, and provider flexibility.

**Embedding in Struktur:** Native Node.js SDK — the most embeddable VLM approach. Requires `zerox` npm package + GraphicsMagick + Ghostscript for PDF→image conversion. Needs an API key for the VLM provider. Per-page cost is the main tradeoff (roughly $0.01–0.05/page with GPT-4o, cheaper with Gemini). The quality is **exceptional** — the LLM naturally understands two-column layouts, headers, footnotes, tables, and cross-references. For the ASD-STE100 dictionary, this would correctly output each word entry as a structured block.

**Popularity:** Very high, active development, recommended for complex scholarly/legal documents.

---

## Approach 3: Marker (Datalab / VikParuchuri)

- **Type:** Layout analysis + OCR pipeline
- **Language:** Python (CLI + library)
- **License:** GPL-3.0
- **GitHub:** [datalab-to/marker](https://github.com/datalab-to/marker) — 33K–38K stars
- **Output:** Markdown, JSON, HTML
- **Table support:** Good — recognizes table structure and renders as markdown
- **Header/footer:** Detected and stripped via layout model

**How it works:** Uses the Surya OCR engine for layout analysis + text recognition. Multi-stage: detects blocks (text, table, figure, header, formula), recognizes text per block, reconstructs reading order, handles footnotes/formulas. v2 added improved table handling and formula recognition.

**Embedding in Struktur:** Shell-out to Python CLI (`marker file.pdf --output_dir .`). GPL-3.0 license is a major concern for embedding in an MIT/Apache library. Quality is excellent, especially for scanned PDFs and documents with formulas. The license alone makes this a non-starter for Struktur unless isolated as an optional external service.

**Popularity:** Most-starred PDF parsing tool on GitHub. Proven at scale.

---

## Approach 4: MinerU (OpenDataLab)

- **Type:** Layout analysis + ML pipeline
- **Language:** Python (CLI + library)
- **License:** MinerU Open Source License (Apache 2.0-based, with commercial usage thresholds)
- **GitHub:** [opendatalab/MinerU](https://github.com/opendatalab/MinerU) — 75K+ stars
- **Output:** Markdown, JSON
- **Table support:** Best-in-class for tables and formulas — consistently ranked #1 in benchmarks
- **Header/footer:** Detected and separated

**How it works:** Sophisticated pipeline: layout detection, formula detection, table recognition, reading order sorting, and content fusion. Specialized for scientific/technical documents. Pre-trained models available.

**Embedding in Struktur:** Shell-out to Python CLI. Largest GitHub presence but the custom license may be problematic. Best quality for structured/technical PDFs. Requires GPU for reasonable performance. Overkill for text-dominant PDFs, but unmatched for table-heavy content.

**Popularity:** #1 by stars, massive community, used in enterprise deployments.

---

## Approach 5: LiteParse (LlamaIndex)

- **Type:** Rust core + layout analysis, local-first (no cloud dependency)
- **Language:** Rust core, Python + Node.js bindings
- **License:** MIT
- **GitHub:** [run-llama/liteparse](https://github.com/run-llama/liteparse) — 11K+ stars
- **NPM:** `@llamaindex/liteparse`
- **Output:** Markdown, JSON, text
- **Table support:** Good — detects tables, renders as markdown tables
- **Header/footer:** Detected via layout analysis

**How it works:** Fast Rust core, no GPU required, local-only. Built for RAG pipelines. Detects headings, tables, lists, images, and reconstructs spatial layout. Has built-in Tesseract OCR for scanned documents. TypeScript support via `@llamaindex/liteparse`.

```typescript
import { LiteParse } from "@llamaindex/liteparse";
const parser = new LiteParse({ outputFormat: "markdown" });
const result = await parser.parse("document.pdf");
```

**Embedding in Struktur:** **Direct npm dependency** — this is the most seamlessly embeddable option for a TypeScript library. MIT license. No Python, no GPU, no API key needed. The tradeoff is quality — not as good as VLM approaches for complex layouts, but significantly better than raw pdf-parse. Works on CPU, fast.

**Popularity:** Growing rapidly, backed by LlamaIndex ecosystem, npm package actively maintained.

---

## Approach 6: Kreuzberg

- **Type:** Polyglot Rust core with NAPI-RS Node.js bindings
- **Language:** Rust core, Node.js/Python/WASM bindings
- **License:** MIT
- **GitHub:** [kreuzberg-dev/kreuzberg](https://github.com/kreuzberg-dev/kreuzberg)
- **NPM:** `@kreuzberg/node`, `@kreuzberg/wasm`
- **Output:** Text, Markdown (tables as markdown)
- **Table support:** Good — extracts tables as Markdown, nested table support
- **Header/footer:** Basic detection

**How it works:** High-performance Rust core extracts text, metadata, and tables from 90+ file formats. NAPI-RS bindings for native Node.js performance. Tables returned as markdown 2D arrays. WASM build available for Bun/Deno/browser.

```typescript
import { extractFile } from "@kreuzberg/node";
const result = await extractFile("document.pdf");
result.tables.forEach((table) => console.log(table.markdown));
```

**Embedding in Struktur:** **Direct npm dependency** via `@kreuzberg/node` (NAPI-RS) or `@kreuzberg/wasm` (pure WASM, works in Bun without native modules). MIT license. No external dependencies. The WASM option is especially attractive for cross-platform compatibility.

**Popularity:** Newer project, growing. Less battle-tested than Docling/Marker but the architecture is ideal for embedding.

---

## Approach 7: Unstructured.io

- **Type:** Layout analysis pipeline, modular backend
- **Language:** Python (CLI + library)
- **License:** Apache 2.0
- **GitHub:** [Unstructured-IO/unstructured](https://github.com/Unstructured-IO/unstructured) — 12K+ stars
- **Output:** Elements (typed chunks: NarrativeText, Title, Table, ListItem, etc.), JSON
- **Table support:** Good with `infer_table_structure=True` in `hi_res` strategy
- **Header/footer:** Separate element type, can be filtered

**How it works:** Multiple strategies: `fast` (direct text extraction), `hi_res` (layout detection with ML models + Tesseract/OCR), `ocr_only`. Outputs typed elements with metadata (page number, coordinates, type). Can chain strategies. Heavy dependencies (poppler, tesseract, multiple Python packages).

**Embedding in Struktur:** Shell-out to Python. Apache 2.0 license is fine. The element-based output is uniquely useful — you can filter out headers/footers by type. Heavy dependency footprint makes it unwieldy as a subprocess dependency. Better suited as a standalone service.

**Popularity:** Enterprise-backed, widely used in RAG pipelines. Mature and stable.

---

## Approach 8: pdfplumber — Granular layout control

- **Type:** Rule-based layout analysis (Python)
- **Language:** Python
- **License:** MIT
- **GitHub:** [jsvine/pdfplumber](https://github.com/jsvine/pdfplumber) — 7K+ stars
- **Output:** Text, tables (2D arrays), visual debug output
- **Table support:** Excellent for bordered and borderless tables, fine-grained tuning
- **Header/footer:** Manual — you filter by Y-coordinate ranges

**How it works:** Wraps pdfminer.six, adds visual debugging and table extraction. Extracts text with exact coordinates, allows cropping to page regions, and provides granular `x_tolerance`, `vertical_strategy` controls. Tables extracted as `page.extract_tables()` → 2D arrays.

**Embedding in Struktur:** Shell-out to Python. Lightweight (just pdfplumber + pdfminer.six). For Struktur, you'd call a small Python script that uses pdfplumber to extract tables with coordinates, then merge them into markdown. This is a "build your own" approach — more work but total control.

**Popularity:** The standard for table extraction in Python. Stable, well-maintained, excellent docs.

---

## Approach 9: VLM endpoint (DIY Zerox pattern)

- **Type:** Page-as-image → VLM → structured markdown
- **Language:** TypeScript (custom implementation)
- **License:** N/A (your code)
- **Output:** Whatever the VLM returns (typically markdown or JSON)
- **Table support:** Depends on the VLM (GPT-4o, Claude, Gemini are all excellent)
- **Header/footer:** VLM naturally distinguishes

**How it works:** Convert each PDF page to an image (using `sharp` + `pdf2pic` or `ghostscript`), send to a VLM API with a prompt like "Convert this page to markdown, preserving tables and structure," receive structured output. This is what Zerox does under the hood, but you control the entire pipeline.

**Embedding in Struktur:** This is potentially the most interesting approach for Struktur. Since Struktur already integrates with the Vercel AI SDK and various model providers, the PDF page → image → VLM → markdown pipeline could be built directly into the SDK. You'd add a `pdfStrategy: "vlm"` option to `parsePdf()` that uses the user's already-configured model. The main cost is API calls per page.

```typescript
// Hypothetical Struktur API
const artifacts = await parse({
  kind: "file",
  path: "document.pdf",
  pdfStrategy: "vlm", // new: renders pages as images, sends to configured model
});
```

**Popularity:** The pattern is proven (Zerox, OmniParser, LLMWhisperer). Doing it in-house gives you full control over the prompt, model selection, and cost optimization. This is the most "Struktur-native" approach since the library already manages LLM calls.

---

## Approach 10: Hybrid Router (pdfmux pattern)

- **Type:** Routing layer — dynamically selects the best backend per page
- **Language:** Python (concept portable to TypeScript)
- **License:** Apache 2.0
- **GitHub:** [pdfmux](https://pdfmux.com) (commercial, concept is open)
- **Output:** Markdown
- **Table support:** Routes table-heavy pages to MinerU/Docling, text pages to fast extractors
- **Header/footer:** Depends on backend

**How it works:** Analyzes each page: is it text-heavy, table-heavy, image/scanned? Routes to the best backend. Text pages go to fast extractors (PyMuPDF). Table pages go to MinerU or Docling. Scanned pages go to Marker or VLM. This gets the best of all worlds — speed for simple pages, accuracy for complex ones.

**Embedding in Struktur:** The concept is directly applicable. Struktur could offer a `pdfStrategy: "auto"` that uses a fast local parser for text-dominant pages and falls back to a VLM for table-heavy or multi-column pages. Page classification could be done heuristically (high proportion of numbers = table, two-column text = complex layout) or with a tiny classifier.

**Popularity:** The concept is gaining traction in 2026. OpenDataLoader implements a simpler version of this with their hybrid mode.

---

## Comparison Matrix

| # | Approach | Node.js Embedding | Quality | License | External Dependencies | Cost | Best For |
|---|----------|-------------------|---------|---------|----------------------|------|----------|
| 1 | **Docling** | Subprocess (Python) | ★★★★★ | MIT | Python + pip install | Free (local) | Balanced, high-quality |
| 2 | **Zerox** | **Native npm** | ★★★★★ | MIT | GraphicsMagick, Ghostscript | API per page | Complex layouts, tables |
| 3 | **Marker** | Subprocess (Python) | ★★★★★ | GPL-3.0 ❌ | Python + GPU (optional) | Free (local) | Scanned PDFs, formulas |
| 4 | **MinerU** | Subprocess (Python) | ★★★★★ | Custom ❌ | Python + GPU | Free (local) | Tables & formulas |
| 5 | **LiteParse** | **Native npm** | ★★★★☆ | MIT | None (Rust binary via npm) | Free (local) | General-purpose TS |
| 6 | **Kreuzberg** | **Native npm / WASM** | ★★★★☆ | MIT | None (WASM) | Free (local) | Cross-platform TS |
| 7 | **Unstructured** | Subprocess (Python) | ★★★★☆ | Apache 2.0 | Python + heavy deps | Free (local) | Element-based filtering |
| 8 | **pdfplumber** | Subprocess (Python) | ★★★☆☆ | MIT | Python + pdfminer | Free (local) | Table extraction, DIY |
| 9 | **DIY VLM** | **Native TypeScript** | ★★★★★ | N/A | sharp + VLM API key | API per page | Maximum Struktur integration |
| 10 | **Hybrid Router** | TypeScript concept | ★★★★★ | N/A | Combination of above | Mixed | Optimal cost/quality |

## Recommendations for Struktur

**Short-term win (implement immediately):** Add `@llamaindex/liteparse` or `@kreuzberg/wasm` as an optional parser backend. Both are MIT-licensed, native npm packages, no external dependencies, and would immediately improve table structure extraction and layout awareness over the current pdf-parse-based approach. LiteParse has better layout analysis; Kreuzberg is lighter-weight and supports WASM.

**Medium-term (highest quality):** Implement the DIY VLM approach (#9). Struktur already manages LLM calls and model resolution — adding a `pdfStrategy: "vlm"` that renders pages as images and sends them to a VLM for markdown extraction is a natural extension. The user's existing model config would power it. This would give Zerox-level quality without an additional dependency.

**Medium-term (optimization):** Build a lightweight hybrid router (#10) that classifies pages as text-dominant vs. table/complex, using the fast parser for text pages and VLM only when needed. This optimizes cost while preserving quality where it matters.

**Not recommended for embedding:** Marker (GPL-3.0), MinerU (custom license), Unstructured (too heavy as a dependency). These are great as standalone services but not as library dependencies.

---

## Sources

- [Docling Technical Report](https://arxiv.org/html/2408.09869v3)
- [SmolDocling Paper](https://arxiv.org/html/2503.11576)
- [OmniDocBench (CVPR 2025)](https://openaccess.thecvf.com/content/CVPR2025/papers/Ouyang_OmniDocBench_Benchmarking_Diverse_PDF_Document_Parsing_with_Comprehensive_Annotations_CVPR_2025_paper.pdf)
- [Marker v2 vs MinerU vs Docling vs LiteParse Benchmark](https://www.marktechpost.com/2026/07/24/datalab-marker-v2-vs-mineru-docling-and-liteparse-benchmark-breakdown/)
- [pdfmux Benchmark Router](https://pdfmux.com/blog/benchmarking-pdf-extractors/)
- [PDF to Markdown Benchmark: 10 Tools Tested](https://mdisbetter.com/blog/pdf-to-markdown-benchmark-10-tools-compared)
- [5 Open-Source PDF to Markdown Tools for RAG (2026)](https://dev.to/jeromebuilds/i-benchmarked-5-open-source-pdf-to-markdown-tools-for-rag-on-real-documents-2026-4heh)
- [doccrush/document-parser-benchmark](https://github.com/doccrush/document-parser-benchmark)
- [Tabula vs Camelot vs pdfplumber in 2026](https://dev.to/martin_pdfexcel/tabula-vs-camelot-vs-pdfplumber-in-2026-which-python-library-actually-wins-22kn)
- [CommonMark Data URI image support](https://talk.commonmark.org/t/data-uri-base64-images/2680)