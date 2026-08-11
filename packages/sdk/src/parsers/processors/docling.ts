import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Artifact, ArtifactContent } from "../../types";
import type { PdfProcessor } from "./types";

const execFileAsync = promisify(execFile);

/**
 * Splits docling markdown output by `<!-- PAGE BREAK -->` comments
 * and maps each page to an ArtifactContent.
 */
const parseDoclingOutput = (markdown: string): ArtifactContent[] => {
  const pages = markdown.split(/<!--\s*PAGE\s+BREAK\s*-->/i);
  return pages
    .map((page, i) => ({ page: i + 1, text: page.trim() }))
    .filter((c) => c.text.length > 0);
};

export const doclingProcessor: PdfProcessor = {
  name: "docling",
  description:
    "IBM Docling — layout analysis, tables as markdown (requires: pip install docling)",
  async parse(buffer: Buffer): Promise<Artifact[]> {
    const tmpDir = await mkdtemp(join(tmpdir(), "struktur-docling-"));
    try {
      const inputPath = join(tmpDir, "input.pdf");
      await writeFile(inputPath, buffer);

      let stdout: string;
      try {
        // docling myfile.pdf --to md --output -   (writes to stdout)
        const result = await execFileAsync("docling", [inputPath, "--to", "md", "--output", "-"], {
          maxBuffer: 50 * 1024 * 1024, // 50MB max
        });
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

      const text = stdout.trim();
      if (!text) {
        return [
          {
            id: `artifact-${crypto.randomUUID()}`,
            type: "pdf" as const,
            raw: async () => buffer,
            contents: [{ text: "" }],
          },
        ];
      }

      // Docling may output with page break markers — try to split by pages
      const contents = parseDoclingOutput(text);

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