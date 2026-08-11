import { test, expect, describe } from "bun:test";
import { kreuzbergProcessor } from "./kreuzberg";

describe("kreuzbergProcessor", () => {
  test("has correct name and description", () => {
    expect(kreuzbergProcessor.name).toBe("kreuzberg");
    expect(kreuzbergProcessor.description).toContain("kreuzberg");
  });

  test("parses a PDF buffer via Kreuzberg", async () => {
    const pdfBuffer = Buffer.from(
      "%PDF-1.4\n" +
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
        "4 0 obj\n<< /Length 44 >>\nstream\n" +
        "BT /F1 12 Tf 72 720 Td (hello) Tj ET\n" +
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
    const artifacts = await kreuzbergProcessor.parse(pdfBuffer, {});
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.type).toBe("pdf");
  });
});