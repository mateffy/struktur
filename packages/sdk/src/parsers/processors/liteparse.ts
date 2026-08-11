import type { Artifact, ArtifactContent } from "../../types";
import type { PdfProcessor } from "./types";

export const liteparseProcessor: PdfProcessor = {
  name: "liteparse",
  description:
    "LiteParse — high-speed Rust layout parser (npm: @llamaindex/liteparse)",
  async parse(buffer: Buffer): Promise<Artifact[]> {
    let mod: { LiteParse: new (opts?: { outputFormat?: string; ocrEnabled?: boolean }) => { parse: (input: Buffer | string) => Promise<{ text?: string; pages?: { text: string }[] }> } };
    try {
      mod = await import("@llamaindex/liteparse") as typeof mod;
    } catch {
      throw new Error(
        "The 'liteparse' processor requires the '@llamaindex/liteparse' package.\n" +
          "Install it with: bun add @llamaindex/liteparse",
      );
    }

    const parser = new mod.LiteParse({ outputFormat: "markdown", ocrEnabled: false });
    const result = await parser.parse(buffer);

    // Map LiteParse output to ArtifactContent[]
    const contents: ArtifactContent[] = [];
    if (result.pages && result.pages.length > 0) {
      for (let i = 0; i < result.pages.length; i++) {
        const text = result.pages[i]?.text?.trim();
        if (text) {
          contents.push({ page: i + 1, text });
        }
      }
    } else if (result.text) {
      contents.push({ text: result.text.trim() });
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