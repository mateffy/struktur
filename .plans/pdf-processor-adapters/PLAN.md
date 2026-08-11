# PDF Processor Adapter Architecture Implementation Plan

> **Status:** DRAFT
> **Plan:** `./.plans/pdf-processor-adapters/PLAN.md`
> **Last updated:** 2025-07-17

---

## ⚠️ Instructions for the implementing agent

**READ THIS SECTION BEFORE TOUCHING ANY CODE.**

You are an executor. Your job is to implement this plan exactly as written.
This plan was written with full context from a prior research and design session.
You do not have that context. The plan is your complete specification.

**Rules you must follow without exception:**

1. **Do not deviate from this plan.** Do not simplify steps, skip phases, combine
   tasks, or substitute approaches — even if a different approach seems easier or
   more elegant. The decisions here were made deliberately. Respect them.

2. **Do not make decisions not explicitly covered by this plan.** If you reach a
   point where the plan is ambiguous or where you feel you need to make a choice
   the plan does not make for you, **stop and ask the user** before proceeding.
   Do not guess. Do not pick the path of least resistance. Do not assume.

3. **Do not change the plan.** If you believe a plan decision is wrong or
   suboptimal, stop and tell the user why. Do not silently implement something
   different.

4. **Work phase by phase.** Complete one phase fully before starting the next.
   Do not jump ahead.

5. **Update the Progress section** at the bottom of this file as you work:
   - Mark phase checkboxes `[x]` when a phase is complete.
   - Mark task checkboxes `[x]` as each task is done.
   - After each phase, write a brief note under "Session log" with what was
     done and what comes next. This allows a new agent to resume from exactly
     where you left off if the session is interrupted.

6. **If your context window is running low**, finish the current task cleanly,
   update the Progress section with exactly where you stopped and what the next
   step is, then tell the user you need a fresh session to continue.

---

## Goal

Introduce a `PdfProcessor` adapter interface with a registry, enabling pluggable PDF processors (pdf-parse, VLM, Docling, LiteParse, Kreuzberg). Users select a processor via `struktur parse --processor <name>`. The default stays `pdf-parse` for backward compatibility.

## Approach

Create a **registry-based adapter pattern** in `packages/sdk/src/parsers/processors/`. Each processor is a lazy-loaded module that implements a common interface. The parse pipeline (`parseBufferInput` in `input.ts`) resolves the processor by name instead of hardcoding `parsePdf`. The CLI exposes `--processor <name>`.

**Key design decisions:**

- **Lazy loading:** Each adapter is behind a `try/catch` dynamic import. If the underlying npm package (e.g., `@llamaindex/liteparse`) isn't installed, the adapter registers as unavailable with a descriptive error. No hard dependency on optional packages.
- **Backward compatibility:** The default processor is `pdf-parse` — the exact current behavior. No flags or options change unless the user explicitly passes `--processor`.
- **VLM as a first-class processor:** The DIY VLM approach (page → image → LLM → markdown) is a processor, not a separate subsystem. It reuses Struktur's existing `generateText` / model resolution. The model is passed as an option (not resolved internally) so the processor stays pure and testable.
- **Extensible:** `registerPdfProcessor()` allows users to add custom processors at runtime.

**Rejected alternatives:**
- Changing `ParsePdfOptions` to have a `processor` field: rejected because it's just a pass-through — the registry pattern is cleaner and discoverable.
- Making processors classes with DI: rejected because the project uses plain functions everywhere; a factory function + interface is consistent.
- Auto-selecting the "best" processor per page: rejected as out of scope (that's the hybrid router pattern, planned for later).

## Tech stack & conventions

- **Bun** for testing, **TypeScript** throughout.
- All parser interfaces return `Artifact[]` (the internal type, not serialized).
- Tests use `bun:test` (`test`, `expect`, `describe`).
- Optional npm packages are loaded via `await import()` in a `try/catch` and throw a descriptive error if missing.
- CLI uses citty (`defineCommand`). New flags follow the existing pattern.
- Tests are colocated next to implementation: `foo.ts` → `foo.test.ts`.

---

## Context & orientation

**Key files (current):**
- `packages/sdk/src/parsers/pdf.ts` — current `parsePdf()` function (the default processor)
- `packages/sdk/src/parsers/types.ts` — `ParserDef`, `ParsersConfig`, `ParserInput` types
- `packages/sdk/src/parsers/index.ts` — parser module public exports
- `packages/sdk/src/artifacts/input.ts` — `parseBufferInput()` step 3 hardcodes `parsePdf` (~line 200)
- `packages/sdk/src/parsers/runner.ts` — `runParser()` for custom external parsers
- `packages/cli/src/cli.ts` — `parseCommand` (~line 2243), calls `parsePdf` directly for PDFs
- `packages/cli/src/cli/shared.ts` — `loadArtifactsFromOptions()` calls `parse()` which eventually hits the hardcoded `parsePdf`

**Key types:**
- `ParsePdfOptions` (`pdf.ts`): `{ includeImages?, screenshots?, screenshotScale?, screenshotWidth? }`
- `Artifact` (`types.ts`): `{ id, type, raw?, contents, metadata? }`
- `ArtifactContent`: `{ page?, text?, media? }`
- `ArtifactImage`: `{ type: "image", url?, base64?, contents?, text?, width?, height?, imageType? }`

**Current parse flow for PDF:**
```
parse() → parseBufferInput() → step 3:
  if (mimeType === "application/pdf") → parsePdf(buffer, pdfOptions) → Artifact[]
```

**New parse flow for PDF:**
```
parse() → parseBufferInput() → step 3:
  if (mimeType === "application/pdf") → resolvePdfProcessor(name) → processor.parse(buffer, options) → Artifact[]
```

---

## Scope

**In scope (exact paths):**
- `packages/sdk/src/parsers/processors/types.ts` — new: `PdfProcessor`, `PdfProcessorOptions`
- `packages/sdk/src/parsers/processors/registry.ts` — new: processor registry
- `packages/sdk/src/parsers/processors/pdf-parse.ts` — new: adapter wrapping current `parsePdf`
- `packages/sdk/src/parsers/processors/vlm.ts` — new: DIY VLM processor
- `packages/sdk/src/parsers/processors/docling.ts` — new: Docling subprocess adapter
- `packages/sdk/src/parsers/processors/liteparse.ts` — new: LiteParse adapter
- `packages/sdk/src/parsers/processors/kreuzberg.ts` — new: Kreuzberg adapter
- `packages/sdk/src/parsers/processors/registry.test.ts` — new: registry tests
- `packages/sdk/src/parsers/processors/pdf-parse.test.ts` — new: pdf-parse adapter tests
- `packages/sdk/src/parsers/processors/vlm.test.ts` — new: VLM processor tests
- `packages/sdk/src/parsers/processors/index.ts` — new: barrel exports
- `packages/sdk/src/parsers/types.ts` — add `PdfProcessor` re-exports
- `packages/sdk/src/parsers/index.ts` — add processor exports
- `packages/sdk/src/artifacts/input.ts` — step 3 uses processor registry
- `packages/sdk/src/artifacts/input.test.ts` — add tests for processor selection
- `packages/sdk/src/index.ts` — re-export new types
- `packages/cli/src/cli.ts` — `parseCommand`: add `--processor` flag, pass through to parsing
- `packages/cli/src/cli/shared.ts` — `loadArtifactsFromOptions`: accept `processor` option
- `packages/cli/src/cli/shared.test.ts` — add `--processor` tests

**Out of scope:**
- `packages/http/**` — HTTP API unchanged (could add later as `?processor=` query param)
- `packages/documentation/**` — docs site update is separate
- Auto page classification / hybrid routing (separate plan)
- `extractCommand` — unchanged, `--processor` is parse-only

**Forbidden actions (do not do these under any circumstances):**
- Do NOT change the `parsePdf()` function signature or behavior in `pdf.ts`.
- Do NOT change the existing `ParserDef` / `ParsersConfig` / `runParser()` system.
- Do NOT add hard npm dependencies on `@llamaindex/liteparse`, `@kreuzberg/node`, or `zerox`.
- Do NOT modify `extractCommand` or `configCommand`.
- Do NOT add dependencies to `packages/sdk/package.json` without asking the user.

---

## Acceptance criteria

1. `struktur parse --input file.pdf --processor pdf-parse` → same output as today (backward compatible).
2. `struktur parse --input file.pdf --processor vlm --model openai/gpt-4o` → markdown extraction via VLM.
3. `struktur parse --input file.pdf --processor docling` → markdown via Docling CLI (requires `pip install docling`).
4. `struktur parse --input file.pdf --processor liteparse` → markdown via `@llamaindex/liteparse` (requires npm install).
5. `struktur parse --input file.pdf --processor kreuzberg` → markdown via `@kreuzberg/node` (requires npm install).
6. `struktur parse --input file.pdf` (no `--processor`) → same as `--processor pdf-parse`.
7. `struktur parse --input file.pdf --processor nonexistent` → error listing available processors.
8. `struktur parse --input file.pdf --processor liteparse` without `@llamaindex/liteparse` installed → error explaining which package to install.
9. SDK users can register custom processors: `registerPdfProcessor({ name: "custom", ... })`.
10. `bun test` passes all new + existing tests.
11. `bun run --filter @struktur/sdk build` succeeds.

---

## Architecture

### Data flow

```
CLI (--processor vlm --model openai/gpt-4o)
  │
  ▼
parseCommand.run()
  │  resolves model if VLM processor
  ▼
parse({ kind: "file"|"buffer", ... }, { processor: "vlm", processorModel, ... })
  │
  ▼
parseBufferInput(buffer, mimeType, ..., processorName)
  │  looks up "vlm" in registry
  ▼
PdfProcessor.parse(buffer, options)
  │
  ▼
Artifact[]
```

### Interface contract

```typescript
// packages/sdk/src/parsers/processors/types.ts

export type PdfProcessorOptions = {
  includeImages?: boolean;
  screenshots?: boolean;
  screenshotScale?: number;
  screenshotWidth?: number;
  /**
   * VLM processor only: the AI SDK model to use for page-to-markdown conversion.
   * Resolved by the caller (CLI or SDK user) before being passed in.
   */
  model?: unknown;
  /**
   * VLM processor only: maximum concurrent page conversions. Default 3.
   */
  concurrency?: number;
};

export type PdfProcessor = {
  name: string;
  description: string;
  parse(buffer: Buffer, options: PdfProcessorOptions): Promise<Artifact[]>;
};
```

### Registry

```typescript
// packages/sdk/src/parsers/processors/registry.ts

const registry = new Map<string, PdfProcessor>();

export const registerPdfProcessor = (processor: PdfProcessor): void => {
  registry.set(processor.name, processor);
};

export const getPdfProcessor = (name: string): PdfProcessor | undefined => {
  return registry.get(name);
};

export const listPdfProcessors = (): PdfProcessor[] => {
  return Array.from(registry.values());
};
```

### Adapter pattern for optional npm packages

Each adapter (liteparse, kreuzberg, docling) wraps its `parse()` in a `try/catch` dynamic import. If the underlying package isn't installed, `parse()` throws a descriptive error with the exact install command.

```typescript
// Example: liteparse.ts
export const liteparseProcessor: PdfProcessor = {
  name: "liteparse",
  description: "High-speed Rust-based layout parser (npm: @llamaindex/liteparse)",
  async parse(buffer, options) {
    let LiteParse: typeof import("@llamaindex/liteparse").LiteParse;
    try {
      const mod = await import("@llamaindex/liteparse");
      LiteParse = mod.LiteParse;
    } catch {
      throw new Error(
        "The 'liteparse' processor requires the '@llamaindex/liteparse' package.\n" +
        "Install it with: bun add @llamaindex/liteparse",
      );
    }
    // ... use LiteParse to parse buffer into Artifact[]
  },
};
```

### VLM processor

The VLM processor:
1. Converts PDF pages to PNG images using `pdfjs-dist` (already a transitive dep via pdf-parse)
2. Sends each page image to the user-provided model via `generateText` (from the `ai` package, already a dep)
3. Parses the returned markdown into `ArtifactContent[]`

It does NOT call `resolveModel()` internally — the caller (CLI or SDK user) passes the model in `options.model`. This keeps the processor pure and testable.

---

## Phases & tasks

### Phase 1: Core infrastructure — types, registry, pdf-parse adapter

Establish the foundation: the interface, the registry, and wrap the existing pdf-parse as the default processor. This phase produces working software with no user-visible changes.

#### Task 1.1: Write registry and pdf-parse adapter tests first

**Why:** Tests define the interface contract before implementation.

**Files:**
- Create: `packages/sdk/src/parsers/processors/registry.test.ts`
- Create: `packages/sdk/src/parsers/processors/pdf-parse.test.ts`

**Steps:**

- [ ] **Step 1:** Write `packages/sdk/src/parsers/processors/registry.test.ts`:
      ```typescript
      import { test, expect, describe } from "bun:test";
      import { registerPdfProcessor, getPdfProcessor, listPdfProcessors } from "./registry";
      import type { PdfProcessor } from "./types";
      import type { Artifact } from "../../types";

      describe("PdfProcessor registry", () => {
        test("registerPdfProcessor adds a processor", () => {
          const mock: PdfProcessor = {
            name: "test-mock",
            description: "test",
            parse: async () => [],
          };
          registerPdfProcessor(mock);
          expect(getPdfProcessor("test-mock")).toBe(mock);
        });

        test("getPdfProcessor returns undefined for unknown name", () => {
          expect(getPdfProcessor("nonexistent")).toBeUndefined();
        });

        test("listPdfProcessors returns all registered processors", () => {
          const processors = listPdfProcessors();
          expect(processors.length).toBeGreaterThanOrEqual(1);
          expect(processors.some((p) => p.name === "pdf-parse")).toBe(true);
        });

        test("registerPdfProcessor overwrites processor with same name", () => {
          const mock1: PdfProcessor = { name: "test-overwrite", description: "v1", parse: async () => [] };
          const mock2: PdfProcessor = { name: "test-overwrite", description: "v2", parse: async () => [] };
          registerPdfProcessor(mock1);
          registerPdfProcessor(mock2);
          expect(getPdfProcessor("test-overwrite")).toBe(mock2);
        });
      });
      ```

- [ ] **Step 2:** Write `packages/sdk/src/parsers/processors/pdf-parse.test.ts`:
      ```typescript
      import { test, expect, describe } from "bun:test";
      import { pdfParseProcessor } from "./pdf-parse";

      describe("pdfParseProcessor", () => {
        test("has correct name and description", () => {
          expect(pdfParseProcessor.name).toBe("pdf-parse");
          expect(pdfParseProcessor.description).toContain("pdf-parse");
        });

        test("parses a text buffer into artifact with text content", async () => {
          // Use a minimal valid PDF buffer
          const pdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 72 720 Td (hello world) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000204 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n297\n%%EOF");
          const artifacts = await pdfParseProcessor.parse(pdfBuffer, {});
          expect(artifacts).toHaveLength(1);
          expect(artifacts[0]?.type).toBe("pdf");
          expect(artifacts[0]?.contents.length).toBeGreaterThan(0);
        });
      });
      ```

- [ ] **Step 3:** Run the tests — they should fail because the modules don't exist.
      ```bash
      bun test packages/sdk/src/parsers/processors/registry.test.ts packages/sdk/src/parsers/processors/pdf-parse.test.ts
      ```
      Expected: fails — module not found.

#### Task 1.2: Implement types, registry, and pdf-parse adapter

**Why:** Foundation for all subsequent processors.

**Files:**
- Create: `packages/sdk/src/parsers/processors/types.ts`
- Create: `packages/sdk/src/parsers/processors/registry.ts`
- Create: `packages/sdk/src/parsers/processors/pdf-parse.ts`
- Create: `packages/sdk/src/parsers/processors/index.ts`

**Steps:**

- [ ] **Step 1:** Create `packages/sdk/src/parsers/processors/types.ts`:
      ```typescript
      import type { Artifact } from "../../types";

      export type PdfProcessorOptions = {
        includeImages?: boolean;
        screenshots?: boolean;
        screenshotScale?: number;
        screenshotWidth?: number;
        /**
         * VLM processor only: the AI SDK model to use for page-to-markdown conversion.
         * Resolved by the caller (CLI or SDK user) before being passed in.
         */
        model?: unknown;
        /**
         * VLM processor only: maximum concurrent page conversions. Default 3.
         */
        concurrency?: number;
      };

      export type PdfProcessor = {
        name: string;
        description: string;
        parse(buffer: Buffer, options: PdfProcessorOptions): Promise<Artifact[]>;
      };
      ```

- [ ] **Step 2:** Create `packages/sdk/src/parsers/processors/registry.ts`:
      ```typescript
      import type { PdfProcessor } from "./types";

      const registry = new Map<string, PdfProcessor>();

      export const registerPdfProcessor = (processor: PdfProcessor): void => {
        registry.set(processor.name, processor);
      };

      export const getPdfProcessor = (name: string): PdfProcessor | undefined => {
        return registry.get(name);
      };

      export const listPdfProcessors = (): PdfProcessor[] => {
        return Array.from(registry.values());
      };
      ```

- [ ] **Step 3:** Create `packages/sdk/src/parsers/processors/pdf-parse.ts`:
      ```typescript
      import type { Artifact } from "../../types";
      import { parsePdf, type ParsePdfOptions } from "../pdf";
      import type { PdfProcessor } from "./types";

      export const pdfParseProcessor: PdfProcessor = {
        name: "pdf-parse",
        description: "Default PDF parser using pdf-parse (fast, no layout awareness)",
        async parse(buffer, options) {
          const pdfOptions: ParsePdfOptions = {
            includeImages: options.includeImages,
            screenshots: options.screenshots,
            screenshotScale: options.screenshotScale,
            screenshotWidth: options.screenshotWidth,
          };
          return [await parsePdf(buffer, pdfOptions)];
        },
      };
      ```

- [ ] **Step 4:** Create `packages/sdk/src/parsers/processors/index.ts`:
      ```typescript
      export type { PdfProcessor, PdfProcessorOptions } from "./types";
      export { registerPdfProcessor, getPdfProcessor, listPdfProcessors } from "./registry";
      export { pdfParseProcessor } from "./pdf-parse";

      // Register built-in processors
      import { registerPdfProcessor } from "./registry";
      import { pdfParseProcessor } from "./pdf-parse";

      registerPdfProcessor(pdfParseProcessor);
      ```

- [ ] **Step 5:** Run the tests — they should pass.
      ```bash
      bun test packages/sdk/src/parsers/processors/
      ```
      Expected: all tests pass.

#### Task 1.3: Wire processor registry into parse pipeline

**Why:** The hardcoded `parsePdf` call in `input.ts` needs to use the registry.

**Files:**
- Modify: `packages/sdk/src/parsers/types.ts` — add re-exports
- Modify: `packages/sdk/src/parsers/index.ts` — add processor exports
- Modify: `packages/sdk/src/artifacts/input.ts` — step 3 uses registry
- Modify: `packages/sdk/src/index.ts` — re-export new types

**Steps:**

- [ ] **Step 1:** Add processor re-exports to `packages/sdk/src/parsers/types.ts`:
      ```typescript
      export type { PdfProcessor, PdfProcessorOptions } from "./processors/types";
      ```

- [ ] **Step 2:** Add processor exports to `packages/sdk/src/parsers/index.ts`:
      ```typescript
      export type { PdfProcessor, PdfProcessorOptions } from "./processors/types";
      export { registerPdfProcessor, getPdfProcessor, listPdfProcessors } from "./processors/registry";
      export { pdfParseProcessor } from "./processors/pdf-parse";
      ```

- [ ] **Step 3:** Update `packages/sdk/src/artifacts/input.ts` step 3. Find:
      ```typescript
      // 3. Built-in PDF → pdf artifact
      if (mimeType === "application/pdf") {
        const { parsePdf } = await import("../parsers/pdf");
        const pdfOptions: ParsePdfOptions = {
          includeImages,
          screenshots,
          screenshotScale,
          screenshotWidth,
        };
        return [await parsePdf(buffer, pdfOptions)];
      }
      ```
      Replace with:
      ```typescript
      // 3. Built-in PDF → pdf artifact
      if (mimeType === "application/pdf") {
        const { getPdfProcessor, pdfParseProcessor } = await import("../parsers/processors");
        const processorName = options?.processor ?? "pdf-parse";
        const processor = getPdfProcessor(processorName) ?? pdfParseProcessor;
        return processor.parse(buffer, {
          includeImages,
          screenshots,
          screenshotScale,
          screenshotWidth,
          model: options?.processorModel,
        });
      }
      ```

- [ ] **Step 4:** Add `processor` and `processorModel` to the `parse()` options in `input.ts`. Find:
      ```typescript
      export const parse = async (
        input: ArtifactInput,
        options?: {
          parsers?: ArtifactInputParser[];
          providers?: ArtifactProviders;
          parserConfig?: ParsersConfig;
          includeImages?: boolean;
          screenshots?: boolean;
          screenshotScale?: number;
          screenshotWidth?: number;
        },
      ): Promise<Artifact[]> => {
      ```
      Add two new optional fields to the options type:
      ```typescript
        options?: {
          parsers?: ArtifactInputParser[];
          providers?: ArtifactProviders;
          parserConfig?: ParsersConfig;
          includeImages?: boolean;
          screenshots?: boolean;
          screenshotScale?: number;
          screenshotWidth?: number;
          processor?: string;
          processorModel?: unknown;
        },
      ```
      Then pass them through in the return statement. Find:
      ```typescript
        return parser.parse(input, {
          providers: options?.providers,
          parsers: options?.parserConfig,
          includeImages: options?.includeImages,
          screenshots: options?.screenshots,
          screenshotScale: options?.screenshotScale,
          screenshotWidth: options?.screenshotWidth,
        });
      ```
      Add:
      ```typescript
          processor: options?.processor,
          processorModel: options?.processorModel,
      ```

- [ ] **Step 5:** Also add `processor` and `processorModel` to the `parseBufferInput` function signature (which is where step 3 lives). The function needs to accept these. Find the function signature and add them:
      ```typescript
      const parseBufferInput = async (
        buffer: Buffer,
        mimeType: string,
        id?: string,
        providers?: ArtifactProviders,
        parsers?: ParsersConfig,
        includeImages?: boolean,
        screenshots?: boolean,
        screenshotScale?: number,
        screenshotWidth?: number,
        processor?: string,
        processorModel?: unknown,
      ): Promise<Artifact[]> => {
      ```
      (The exact mechanism for threading through the options depends on how `bufferParser` calls `parseBufferInput` — read that code carefully before editing.)

- [ ] **Step 6:** Add exports to `packages/sdk/src/index.ts`. Find the validation exports section and add after it:
      ```typescript
      // PDF Processors
      export type { PdfProcessor, PdfProcessorOptions } from "./parsers/processors/types";
      export { registerPdfProcessor, getPdfProcessor, listPdfProcessors } from "./parsers/processors/registry";
      ```

- [ ] **Step 7:** Run the full test suite:
      ```bash
      bun test
      ```
      Expected: all tests pass, no regressions.

---

### Phase 2: VLM processor

#### Task 2.1: Write VLM processor tests first

**Why:** Tests define the behavior — markdown to ArtifactContent[] conversion, concurrency, error handling.

**Files:**
- Create: `packages/sdk/src/parsers/processors/vlm.test.ts`

**Steps:**

- [ ] **Step 1:** Write `packages/sdk/src/parsers/processors/vlm.test.ts`:
      ```typescript
      import { test, expect, describe } from "bun:test";
      import { vlmProcessor } from "./vlm";

      describe("vlmProcessor", () => {
        test("has correct name and description", () => {
          expect(vlmProcessor.name).toBe("vlm");
          expect(vlmProcessor.description).toContain("vision");
        });

        test("throws when model is not provided", async () => {
          const pdfBuffer = Buffer.from("%PDF-1.4\n...");
          await expect(
            vlmProcessor.parse(pdfBuffer, {}),
          ).rejects.toThrow("model");
        });
      });
      ```

- [ ] **Step 2:** Run the test — should fail (module doesn't exist).
      ```bash
      bun test packages/sdk/src/parsers/processors/vlm.test.ts
      ```
      Expected: FAIL — module not found.

#### Task 2.2: Implement VLM processor

**Why:** Highest-quality extraction path, leverages Struktur's existing LLM infrastructure.

**Files:**
- Create: `packages/sdk/src/parsers/processors/vlm.ts`
- Modify: `packages/sdk/src/parsers/processors/index.ts` — register vlm processor

**Steps:**

- [ ] **Step 1:** Create `packages/sdk/src/parsers/processors/vlm.ts`:
      ```typescript
      import { generateText, Output, type ModelMessage } from "ai";
      import type { Artifact, ArtifactContent } from "../../types";
      import type { PdfProcessor, PdfProcessorOptions } from "./types";

      const VLM_PROMPT = `You are a document parser. Convert this page to clean markdown.
      - Preserve all tables as markdown tables (use | syntax).
      - Preserve all text in reading order.
      - Include headings with # markdown syntax.
      - Omit page headers, footers, and page numbers.
      - Return ONLY the markdown content, no commentary.`;

      export const vlmProcessor: PdfProcessor = {
        name: "vlm",
        description: "Vision Language Model — sends page images to LLM for markdown extraction",
        async parse(buffer, options: PdfProcessorOptions) {
          if (!options.model) {
            throw new Error(
              "The 'vlm' processor requires a model. Pass it via options.model or use --model flag.",
            );
          }

          const concurrency = options.concurrency ?? 3;
          const { pdfjs } = await import("pdfjs-dist/legacy/build/pdf.mjs" as string);

          const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
          const numPages = doc.numPages;
          const contents: ArtifactContent[] = [];

          // Process pages with limited concurrency
          for (let i = 0; i < numPages; i += concurrency) {
            const batch = Array.from(
              { length: Math.min(concurrency, numPages - i) },
              (_, j) => i + j + 1,
            );

            const batchResults = await Promise.all(
              batch.map(async (pageNum) => {
                const page = await doc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 2.0 });

                const { createCanvas } = await import("@napi-rs/canvas");
                const canvas = createCanvas(viewport.width, viewport.height);
                const ctx = canvas.getContext("2d");

                await page.render({
                  canvasContext: ctx as unknown as CanvasRenderingContext2D,
                  viewport,
                }).promise;

                const imageBuffer = canvas.toBuffer("image/png");
                const base64 = imageBuffer.toString("base64");

                const result = await generateText({
                  model: options.model as Parameters<typeof generateText>[0]["model"],
                  messages: [
                    {
                      role: "user",
                      content: [
                        { type: "text", text: VLM_PROMPT },
                        { type: "media", data: base64, mediaType: "image/png" },
                      ] as UserContent[],
                    },
                  ],
                });

                const text = result.text.trim();
                return { page: pageNum, text } as ArtifactContent;
              }),
            );

            contents.push(...batchResults);
          }

          return [
            {
              id: `artifact-${crypto.randomUUID()}`,
              type: "pdf" as const,
              raw: async () => buffer,
              contents,
            },
          ];
        },
      };
      ```

- [ ] **Step 2:** Add `@napi-rs/canvas` as an optional peer dependency (for canvas rendering). Check if it's already available, or use `pdfjs-dist`'s built-in canvas if available. The exact rendering mechanism depends on what's available — read the pdfjs-dist docs and choose the simplest approach. **Do NOT add a hard dependency** — make the canvas import optional with a descriptive error.

- [ ] **Step 3:** Update `packages/sdk/src/parsers/processors/index.ts` to import and register the VLM processor:
      ```typescript
      import { vlmProcessor } from "./vlm";
      registerPdfProcessor(vlmProcessor);
      ```

- [ ] **Step 4:** Run tests:
      ```bash
      bun test packages/sdk/src/parsers/processors/
      ```
      Expected: all pass.

---

### Phase 3: Docling, LiteParse, and Kreuzberg adapters

#### Task 3.1: Write adapter tests first

**Why:** Define the expected interface for each adapter before implementing.

**Files:**
- Create: `packages/sdk/src/parsers/processors/docling.test.ts`
- Create: `packages/sdk/src/parsers/processors/liteparse.test.ts`
- Create: `packages/sdk/src/parsers/processors/kreuzberg.test.ts`

**Steps:**

- [ ] **Step 1:** Write tests for all three adapters. Each test file follows the same pattern — verify the processor has correct metadata, and verify it throws a descriptive error when the underlying package is missing.

      `docling.test.ts`:
      ```typescript
      import { test, expect, describe } from "bun:test";
      import { doclingProcessor } from "./docling";

      describe("doclingProcessor", () => {
        test("has correct name and description", () => {
          expect(doclingProcessor.name).toBe("docling");
          expect(doclingProcessor.description).toContain("Docling");
        });

        test("throws when docling CLI is not available", async () => {
          const pdfBuffer = Buffer.from("%PDF-1.4\n...");
          await expect(
            doclingProcessor.parse(pdfBuffer, {}),
          ).rejects.toThrow("docling");
        });
      });
      ```

      `liteparse.test.ts`:
      ```typescript
      import { test, expect, describe } from "bun:test";
      import { liteparseProcessor } from "./liteparse";

      describe("liteparseProcessor", () => {
        test("has correct name and description", () => {
          expect(liteparseProcessor.name).toBe("liteparse");
          expect(liteparseProcessor.description).toContain("liteparse");
        });
      });
      ```

      `kreuzberg.test.ts`:
      ```typescript
      import { test, expect, describe } from "bun:test";
      import { kreuzbergProcessor } from "./kreuzberg";

      describe("kreuzbergProcessor", () => {
        test("has correct name and description", () => {
          expect(kreuzbergProcessor.name).toBe("kreuzberg");
          expect(kreuzbergProcessor.description).toContain("kreuzberg");
        });
      });
      ```

- [ ] **Step 2:** Run tests — should fail.
      ```bash
      bun test packages/sdk/src/parsers/processors/docling.test.ts packages/sdk/src/parsers/processors/liteparse.test.ts packages/sdk/src/parsers/processors/kreuzberg.test.ts
      ```
      Expected: FAIL — modules not found.

#### Task 3.2: Implement all three adapters

**Why:** Complete the set of built-in processor options.

**Files:**
- Create: `packages/sdk/src/parsers/processors/docling.ts`
- Create: `packages/sdk/src/parsers/processors/liteparse.ts`
- Create: `packages/sdk/src/parsers/processors/kreuzberg.ts`
- Modify: `packages/sdk/src/parsers/processors/index.ts` — register all three

**Steps:**

- [ ] **Step 1:** Implement `docling.ts`. This adapter shells out to the `docling` CLI:
      ```typescript
      import type { Artifact, ArtifactContent } from "../../types";
      import type { PdfProcessor } from "./types";
      import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
      import { join } from "node:path";
      import { tmpdir } from "node:os";
      import { execFile } from "node:child_process";
      import { promisify } from "node:util";

      const execFileAsync = promisify(execFile);

      export const doclingProcessor: PdfProcessor = {
        name: "docling",
        description: "IBM Docling — layout analysis, tables as markdown (requires: pip install docling)",
        async parse(buffer, options) {
          const tmpDir = await mkdtemp(join(tmpdir(), "struktur-docling-"));
          try {
            const inputPath = join(tmpDir, "input.pdf");
            await writeFile(inputPath, buffer);

            let stdout: string;
            try {
              const result = await execFileAsync("docling", [inputPath, "--to", "md"]);
              stdout = result.stdout;
            } catch (err) {
              if ((err as NodeJS.ErrnoException).code === "ENOENT") {
                throw new Error(
                  "The 'docling' processor requires the Docling CLI.\n" +
                  "Install it with: pip install docling",
                );
              }
              throw err;
            }

            // Parse the markdown output back into ArtifactContent[]
            const text = stdout.trim();
            if (!text) {
              return [{ id: `artifact-${crypto.randomUUID()}`, type: "pdf" as const, raw: async () => buffer, contents: [{ text: "" }] }];
            }

            const contents: ArtifactContent[] = [{ text }];
            return [
              {
                id: `artifact-${crypto.randomUUID()}`,
                type: "pdf" as const,
                raw: async () => buffer,
                contents,
              },
            ];
          } finally {
            await rm(tmpDir, { recursive: true, force: true });
          }
        },
      };
      ```

- [ ] **Step 2:** Implement `liteparse.ts`:
      ```typescript
      import type { Artifact, ArtifactContent } from "../../types";
      import type { PdfProcessor } from "./types";

      export const liteparseProcessor: PdfProcessor = {
        name: "liteparse",
        description: "LiteParse — high-speed Rust layout parser (npm: @llamaindex/liteparse)",
        async parse(buffer, options) {
          let LiteParse: typeof import("@llamaindex/liteparse").LiteParse;
          try {
            const mod = await import("@llamaindex/liteparse");
            LiteParse = mod.LiteParse;
          } catch {
            throw new Error(
              "The 'liteparse' processor requires the '@llamaindex/liteparse' package.\n" +
              "Install it with: bun add @llamaindex/liteparse",
            );
          }

          const parser = new LiteParse({ outputFormat: "markdown" });
          const result = await parser.parse(buffer);

          // Parse LiteParse output into ArtifactContent[]
          // The exact shape depends on the LiteParse API — read the npm docs
          // and map result.text (markdown) to a single ArtifactContent
          const contents: ArtifactContent[] = [];
          if (result.text) {
            contents.push({ text: result.text });
          }

          return [
            {
              id: `artifact-${crypto.randomUUID()}`,
              type: "pdf" as const,
              raw: async () => buffer,
              contents,
            },
          ];
        },
      };
      ```

- [ ] **Step 3:** Implement `kreuzberg.ts`:
      ```typescript
      import type { Artifact, ArtifactContent } from "../../types";
      import type { PdfProcessor } from "./types";

      export const kreuzbergProcessor: PdfProcessor = {
        name: "kreuzberg",
        description: "Kreuzberg — Rust core with Node.js/WASM bindings (npm: @kreuzberg/node)",
        async parse(buffer, options) {
          let extractFile: typeof import("@kreuzberg/node").extractFile;
          try {
            const mod = await import("@kreuzberg/node");
            extractFile = mod.extractFile;
          } catch {
            throw new Error(
              "The 'kreuzberg' processor requires the '@kreuzberg/node' package.\n" +
              "Install it with: bun add @kreuzberg/node",
            );
          }

          // Write buffer to temp file (kreuzberg takes file path, not buffer)
          const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
          const { join } = await import("node:path");
          const { tmpdir } = await import("node:os");
          const tmpDir = await mkdtemp(join(tmpdir(), "struktur-kreuzberg-"));
          try {
            const inputPath = join(tmpDir, "input.pdf");
            await writeFile(inputPath, buffer);
            const result = await extractFile(inputPath);

            const contents: ArtifactContent[] = [];
            if (result.content) {
              contents.push({ text: result.content });
            }
            // Kreuzberg returns tables separately — merge them as markdown
            if (result.tables) {
              for (const table of result.tables) {
                if (table.markdown) {
                  contents.push({ text: table.markdown });
                }
              }
            }

            return [
              {
                id: `artifact-${crypto.randomUUID()}`,
                type: "pdf" as const,
                raw: async () => buffer,
                contents,
              },
            ];
          } finally {
            await rm(tmpDir, { recursive: true, force: true });
          }
        },
      };
      ```

- [ ] **Step 4:** Update `packages/sdk/src/parsers/processors/index.ts`:
      ```typescript
      export type { PdfProcessor, PdfProcessorOptions } from "./types";
      export { registerPdfProcessor, getPdfProcessor, listPdfProcessors } from "./registry";
      export { pdfParseProcessor } from "./pdf-parse";
      export { vlmProcessor } from "./vlm";
      export { doclingProcessor } from "./docling";
      export { liteparseProcessor } from "./liteparse";
      export { kreuzbergProcessor } from "./kreuzberg";

      // Register built-in processors
      import { registerPdfProcessor } from "./registry";
      import { pdfParseProcessor } from "./pdf-parse";
      import { vlmProcessor } from "./vlm";
      import { doclingProcessor } from "./docling";
      import { liteparseProcessor } from "./liteparse";
      import { kreuzbergProcessor } from "./kreuzberg";

      registerPdfProcessor(pdfParseProcessor);
      registerPdfProcessor(vlmProcessor);
      registerPdfProcessor(doclingProcessor);
      registerPdfProcessor(liteparseProcessor);
      registerPdfProcessor(kreuzbergProcessor);
      ```

- [ ] **Step 5:** Run tests:
      ```bash
      bun test packages/sdk/src/parsers/processors/
      ```
      Expected: all pass.

---

### Phase 4: CLI `--processor` flag

#### Task 4.1: Add `--processor` flag to parse command

**Why:** User-facing control over which processor is used.

**Files:**
- Modify: `packages/cli/src/cli.ts` — `parseCommand` args and run function
- Modify: `packages/cli/src/cli/shared.ts` — `loadArtifactsFromOptions` to pass processor

**Steps:**

- [ ] **Step 1:** Add the `processor` arg to `parseCommand` (find the args object in `parseCommand`):
      ```typescript
      processor: {
        type: "string",
        description: "PDF processor to use: pdf-parse (default), vlm, docling, liteparse, kreuzberg",
        valueHint: "pdf-parse|vlm|docling|liteparse|kreuzberg",
      },
      ```

- [ ] **Step 2:** In `parseCommand.run()`, when handling PDF input, resolve the model if the VLM processor is selected. Find where `parsePdf` is called directly for PDFs:
      ```typescript
      } else if (mimeType === "application/pdf") {
        const { parsePdf } = await import("@struktur/sdk");
        // ...
      ```
      Replace this block to use the processor registry:
      ```typescript
      } else if (mimeType === "application/pdf") {
        const { getPdfProcessor, pdfParseProcessor } = await import("@struktur/sdk");
        const processorName = args.processor as string | undefined;
        const processor = processorName ? getPdfProcessor(processorName) : pdfParseProcessor;
        if (!processor) {
          throw new UserError(
            `Unknown processor: "${processorName}". Available: ${listPdfProcessors().map((p) => p.name).join(", ")}`,
          );
        }

        // For VLM processor, resolve the model
        let model: unknown;
        if (processorName === "vlm") {
          const { resolveModel } = await import("@struktur/sdk");
          const modelSpec = await resolveDefaultModelSpec();
          model = await resolveModel(modelSpec);
        }

        artifacts = await processor.parse(buffer, {
          includeImages: args.images === true,
          screenshots: args.screenshots === true,
          screenshotScale,
          screenshotWidth,
          model,
        });
      }
      ```

- [ ] **Step 3:** Update `loadArtifactsFromOptions` in `shared.ts` to accept and pass through `processor`:
      Find the function signature and the stdin/file parse calls. Add `processor?: string` to the options type, and pass it to `parse()` calls.
      ```typescript
      // In loadArtifactsFromOptions options type:
      processor?: string;

      // Pass to parse() calls:
      parse(
        { kind: "buffer", buffer, mimeType },
        {
          parserConfig: effectiveParsers,
          includeImages: images,
          screenshots,
          processor,
        },
      );
      ```

- [ ] **Step 4:** Also import `listPdfProcessors` and `resolveModel` at the top of `cli.ts` (add to the `@struktur/sdk` import block).

- [ ] **Step 5:** Run the full test suite:
      ```bash
      bun test
      ```
      Expected: all pass.

- [ ] **Step 6:** Build the CLI:
      ```bash
      cd packages/cli && bun run build
      ```
      Expected: builds without errors.

- [ ] **Step 7:** Manual smoke tests:
      ```bash
      # Default (pdf-parse)
      struktur parse --input file.pdf --format json

      # Explicit pdf-parse
      struktur parse --input file.pdf --processor pdf-parse --format json

      # Unknown processor
      struktur parse --input file.pdf --processor nonexistent
      # Expected: error listing available processors

      # VLM without model (should throw)
      struktur parse --input file.pdf --processor vlm
      # Expected: error about model required
      ```

---

### Phase 5: Test processor selection in parse pipeline

#### Task 5.1: Add input.test.ts tests for processor resolution

**Why:** Test that the parse pipeline correctly routes to the right processor.

**Files:**
- Modify: `packages/sdk/src/artifacts/input.test.ts`

**Steps:**

- [ ] **Step 1:** Add tests for processor selection:
      ```typescript
      import { registerPdfProcessor, getPdfProcessor } from "../parsers/processors";
      import type { PdfProcessor } from "../parsers/processors/types";

      test("parse uses custom processor when specified", async () => {
        const mockProcessor: PdfProcessor = {
          name: "test-custom",
          description: "test",
          parse: async (buffer) => [
            {
              id: "test-custom",
              type: "pdf" as const,
              raw: async () => buffer,
              contents: [{ text: "custom processor output" }],
            },
          ],
        };
        registerPdfProcessor(mockProcessor);

        const pdfBuffer = Buffer.from("%PDF-1.4\n...");
        const artifacts = await parse(
          { kind: "buffer", buffer: pdfBuffer, mimeType: "application/pdf" },
          { processor: "test-custom" },
        );
        expect(artifacts).toHaveLength(1);
        expect(artifacts[0]?.contents[0]?.text).toBe("custom processor output");
      });

      test("parse falls back to pdf-parse for unknown processor", async () => {
        const pdfBuffer = Buffer.from("%PDF-1.4\n...");
        const artifacts = await parse(
          { kind: "buffer", buffer: pdfBuffer, mimeType: "application/pdf" },
          { processor: "nonexistent" },
        );
        expect(artifacts).toHaveLength(1);
        expect(artifacts[0]?.type).toBe("pdf");
      });

      test("parse passes model to VLM processor", async () => {
        const mockProcessor: PdfProcessor = {
          name: "test-vlm",
          description: "test",
          parse: async (buffer, options) => {
            expect(options.model).toBe("test-model");
            return [{ id: "t", type: "pdf" as const, raw: async () => buffer, contents: [{ text: "vlm" }] }];
          },
        };
        registerPdfProcessor(mockProcessor);

        await parse(
          { kind: "buffer", buffer: Buffer.from("%PDF"), mimeType: "application/pdf" },
          { processor: "test-vlm", processorModel: "test-model" },
        );
      });
      ```

- [ ] **Step 2:** Run tests:
      ```bash
      bun test packages/sdk/src/artifacts/input.test.ts
      ```
      Expected: all pass.

---

## Validation

```bash
# Run all tests
bun test
# Expected: all green, no regressions

# Build
bun run --filter @struktur/sdk build && bun run --filter @struktur/cli build
# Expected: builds without errors

# CLI smoke tests
struktur parse --input file.pdf --format json
# Expected: same output as before (pdf-parse default)

struktur parse --input file.pdf --processor pdf-parse --format json
# Expected: same output as default

struktur parse --input file.pdf --processor nonexistent
# Expected: error listing available processors

struktur parse --input file.pdf --processor vlm
# Expected: error about model required (unless --model is also provided)
```

---

## Risks & rollback

- **Risk:** VLM processor requires `@napi-rs/canvas` or similar for PDF rendering, which may not be available. **Mitigation:** Wrap in try/catch with a descriptive error. Users who need VLM install the canvas package. Alternatively, use pdfjs-dist's built-in SVG rendering and convert to PNG via `sharp` (which is already a common dep).
- **Risk:** Docling adapter requires Python + docling CLI, which may not be installed. **Mitigation:** Descriptive error message when `docling` binary is not found (`ENOENT`).
- **Risk:** Optional npm packages (liteparse, kreuzberg) may have breaking API changes. **Mitigation:** Adapters are thin wrappers — easy to update. Registry allows users to override with their own adapter if ours breaks.
- **Rollback:** Revert to hardcoded `parsePdf` in `input.ts` and remove the processor registry files. The registry is additive — removing it doesn't affect other code.

---

## Open questions

- [ ] VLM page rendering: use `@napi-rs/canvas` (native, faster) or `pdfjs-dist` + `sharp` (pure JS, more portable)? — needs decision from user. Recommend `@napi-rs/canvas` with `sharp` fallback.
- [ ] Should the HTTP API (`POST /parse`) also accept a `processor` field? — out of scope for this plan, but a natural follow-up.
- [ ] Should `listPdfProcessors()` be exposed as a CLI command (`struktur parse --list-processors`)? — nice UX, low cost. Include if time permits.

---

## Progress

**This section is maintained by the implementing agent. Update it continuously.**

### Phase completion

- [ ] Phase 1: Core infrastructure — types, registry, pdf-parse adapter
- [ ] Phase 2: VLM processor
- [ ] Phase 3: Docling, LiteParse, and Kreuzberg adapters
- [ ] Phase 4: CLI `--processor` flag
- [ ] Phase 5: Test processor selection in parse pipeline
- [ ] Validation complete
- [ ] Plan marked DONE

### Session log

*The implementing agent appends an entry here after each phase or working
session. Include: what was completed, what was skipped and why, what comes next,
and any decisions made (with rationale). This log is the handoff document — a
new agent reading only this file must be able to continue without asking.*

---
*(no entries yet)*