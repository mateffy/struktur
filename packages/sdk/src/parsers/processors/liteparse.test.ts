import { test, expect, describe } from "bun:test";
import { liteparseProcessor } from "./liteparse";

const minimalPdf = Buffer.from(
  "%PDF-1.4\n" +
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
    "4 0 obj\n<< /Length 44 >>\nstream\n" +
    "BT /F1 12 Tf 72 720 Td (hello world) Tj ET\n" +
    "endstream\nendobj\n" +
    "xref\n0 5\n" +
    "0000000000 65535 f\n" +
    "0000000009 00000 n\n" +
    "0000000058 00000 n\n" +
    "0000000115 00000 n\n" +
    "0000000204 00000 n\n" +
    "trailer\n<< /Size 5 /Root 1 0 R >>\n" +
    "startxref\n297\n%%EOF",
  "utf-8",
);

describe("liteparseProcessor", () => {
  test("has correct name and description", () => {
    expect(liteparseProcessor.name).toBe("liteparse");
    expect(liteparseProcessor.description).toContain("liteparse");
  });

  test("parses a PDF buffer via LiteParse", async () => {
    const artifacts = await liteparseProcessor.parse(minimalPdf, {});
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.type).toBe("pdf");
  });

  test("returns content entries with non-empty text", async () => {
    const artifacts = await liteparseProcessor.parse(minimalPdf, {});
    expect(artifacts).toHaveLength(1);
    const contents = artifacts[0]?.contents ?? [];
    expect(contents.length).toBeGreaterThan(0);
    const withText = contents.filter((c) => c.text && c.text.trim().length > 0);
    expect(withText.length).toBeGreaterThan(0);
    expect(withText[0]?.text).toContain("hello");
  });

  test("does not return an empty artifact when the PDF has text", async () => {
    const artifacts = await liteparseProcessor.parse(minimalPdf, {});
    const artifact = artifacts[0];
    expect(artifact).toBeDefined();
    expect(artifact?.contents.length).toBeGreaterThan(0);
    const totalText = artifact?.contents.map((c) => c.text ?? "").join("").trim();
    expect(totalText?.length).toBeGreaterThan(0);
  });
});