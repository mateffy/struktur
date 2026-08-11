import { test, expect, describe, mock } from "bun:test";
import type { Artifact } from "../../types";
import type { ParsePdfOptions } from "../pdf";

// ---------------------------------------------------------------------------
// Mock ../pdf so we can verify delegation without parsing a real PDF.
// parsePdf itself is tested exhaustively in ../pdf.test.ts.
// ---------------------------------------------------------------------------

let lastOptions: ParsePdfOptions | undefined;

const fakeArtifact: Artifact = {
  id: "artifact-test",
  type: "pdf",
  raw: async () => Buffer.from("%PDF-1.4 fake"),
  contents: [{ text: "stub" }],
};

mock.module("../pdf", () => ({
  parsePdf: async (_buffer: Buffer, options?: ParsePdfOptions) => {
    lastOptions = options;
    return fakeArtifact;
  },
}));

// Import after mock is registered
const { pdfParseProcessor } = await import("./pdf-parse");

describe("pdfParseProcessor", () => {
  test("has correct name and description", () => {
    expect(pdfParseProcessor.name).toBe("pdf-parse");
    expect(pdfParseProcessor.description).toContain("pdf-parse");
  });

  test("parses a PDF buffer through the wrapped parsePdf", async () => {
    const pdfBuffer = Buffer.from("%PDF-1.4 fake pdf content");
    const artifacts = await pdfParseProcessor.parse(pdfBuffer, {});
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.type).toBe("pdf");
  });

  test("passes includeImages option through", async () => {
    lastOptions = undefined;
    const pdfBuffer = Buffer.from("%PDF-1.4 fake pdf");
    const artifacts = await pdfParseProcessor.parse(pdfBuffer, { includeImages: false });
    expect(artifacts).toHaveLength(1);
    expect(lastOptions?.includeImages).toBe(false);
  });

  test("passes screenshot options through", async () => {
    lastOptions = undefined;
    const pdfBuffer = Buffer.from("%PDF-1.4 fake pdf");
    await pdfParseProcessor.parse(pdfBuffer, {
      screenshots: true,
      screenshotScale: 2,
      screenshotWidth: 1024,
    });
    expect(lastOptions?.screenshots).toBe(true);
    expect(lastOptions?.screenshotScale).toBe(2);
    expect(lastOptions?.screenshotWidth).toBe(1024);
  });
});
