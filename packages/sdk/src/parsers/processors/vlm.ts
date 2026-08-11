import { generateText } from "ai";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Artifact, ArtifactContent } from "../../types";
import type { PdfProcessor, PdfProcessorOptions } from "./types";

const execFileAsync = promisify(execFile);

const VLM_PROMPT = `You are a document parser. Convert this document page to clean markdown.
- Preserve the full text content in reading order.
- Preserve ALL tables as markdown tables (use | column | syntax).
- Use # heading syntax for headings.
- Omit page headers, footers, and page numbers.
- Omit running headers/footers that repeat across pages.
- Return ONLY the markdown content, no commentary or preamble.`;

/**
 * Render a single PDF page to a PNG buffer using Ghostscript.
 */
const renderPage = async (
  inputPath: string,
  pageNum: number,
  resolution: number,
  tmpDir: string,
): Promise<{ pageNum: number; base64: string }> => {
  const outputPath = join(tmpDir, `page-${pageNum}.png`);

  await execFileAsync("gs", [
    "-dNOPAUSE",
    "-dBATCH",
    "-dSAFER",
    "-sDEVICE=png16m",
    `-r${resolution}`,
    `-dFirstPage=${pageNum}`,
    `-dLastPage=${pageNum}`,
    `-sOutputFile=${outputPath}`,
    inputPath,
  ]);

  const buffer = await readFile(outputPath);
  return { pageNum, base64: buffer.toString("base64") };
};

/**
 * Count pages in a PDF using Ghostscript.
 */
const countPages = async (inputPath: string): Promise<number> => {
  // Use gs to extract page count from PDF metadata
  const result = await execFileAsync("gs", [
    "-dNOPAUSE",
    "-dBATCH",
    "-dSAFER",
    "-q",
    "-dNODISPLAY",
    "-c",
    `(${inputPath}) (r) file runpdfbegin pdfpagecount = quit`,
  ]);
  return parseInt(result.stdout.trim(), 10) || 1;
};

export const vlmProcessor: PdfProcessor = {
  name: "vlm",
  description:
    "Vision Language Model — renders PDF pages as images (via Ghostscript) and sends to LLM for markdown extraction",
  async parse(buffer: Buffer, options: PdfProcessorOptions): Promise<Artifact[]> {
    if (!options.model) {
      throw new Error(
        "The 'vlm' processor requires a model. " +
          "Pass it via options.model or use --model flag with --processor vlm.",
      );
    }

    // Check that ghostscript is available
    try {
      await execFileAsync("gs", ["--version"]);
    } catch {
      throw new Error(
        "The 'vlm' processor requires Ghostscript (gs) for PDF page rendering.\n" +
          "Install it with: brew install ghostscript  (macOS)\n" +
          "                apt install ghostscript  (Linux)",
      );
    }

    const model = options.model as Parameters<typeof generateText>[0]["model"];
    const concurrency = options.concurrency ?? 3;
    const resolution = 200; // DPI for rendering

    const tmpDir = await mkdtemp(join(tmpdir(), "struktur-vlm-"));
    try {
      // Write PDF to temp file
      const inputPath = join(tmpDir, "input.pdf");
      await writeFile(inputPath, buffer);

      // Count pages
      const numPages = await countPages(inputPath);
      const contents: ArtifactContent[] = [];

      // Render and process pages with limited concurrency
      for (let i = 1; i <= numPages; i += concurrency) {
        const batchEnd = Math.min(i + concurrency - 1, numPages);
        const batchPages: number[] = [];
        for (let p = i; p <= batchEnd; p++) batchPages.push(p);

        // Render batch of pages to images
        const pageRenders = await Promise.all(
          batchPages.map((pageNum) => renderPage(inputPath, pageNum, resolution, tmpDir)),
        );

        // Send each rendered page to the VLM
        const batchResults = await Promise.all(
          pageRenders.map(async ({ pageNum, base64 }) => {
            const result = await generateText({
              model,
              messages: [
                {
                  role: "user" as const,
                  content: [
                    {
                      type: "text" as const,
                      text: `${VLM_PROMPT}\n\nThis is page ${pageNum} of ${numPages}.`,
                    },
                    {
                      type: "image" as const,
                      image: base64,
                      mediaType: "image/png",
                    },
                  ],
                },
              ],
            });

            const text = result.text.trim();
            return { page: pageNum, text };
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
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  },
};