import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Artifact, ArtifactContent } from "../../types";
import type { PdfProcessor } from "./types";

export const kreuzbergProcessor: PdfProcessor = {
  name: "kreuzberg",
  description:
    "Kreuzberg — Rust core with Node.js/WASM bindings (npm: @kreuzberg/node or @kreuzberg/wasm)",
  async parse(buffer: Buffer): Promise<Artifact[]> {
    // Try @kreuzberg/node first (NAPI-RS, faster), fall back to @kreuzberg/wasm
    let extractFile: (path: string) => Promise<{ content?: string; tables?: { markdown?: string }[] }>;

    try {
      const mod = await import("@kreuzberg/node") as { extractFile: typeof extractFile };
      extractFile = mod.extractFile;
    } catch {
      throw new Error(
        "The 'kreuzberg' processor requires the '@kreuzberg/node' package.\n" +
          "Install it with: bun add @kreuzberg/node",
      );
    }

    // Kreuzberg takes a file path — write buffer to temp file
    const tmpDir = await mkdtemp(join(tmpdir(), "struktur-kreuzberg-"));
    try {
      const inputPath = join(tmpDir, "input.pdf");
      await writeFile(inputPath, buffer);

      const result = await extractFile(inputPath);

      const contents: ArtifactContent[] = [];
      if (result.content) {
        contents.push({ text: result.content.trim() });
      }
      if (result.tables) {
        for (const table of result.tables) {
          if (table.markdown) {
            contents.push({ text: table.markdown.trim() });
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