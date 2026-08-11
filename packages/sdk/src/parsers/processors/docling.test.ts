import { test, expect, describe } from "bun:test";
import { doclingProcessor } from "./docling";

describe("doclingProcessor", () => {
  test("has correct name and description", () => {
    expect(doclingProcessor.name).toBe("docling");
    expect(doclingProcessor.description).toContain("Docling");
  });

  test("throws a clear install error when docling CLI is not on PATH", async () => {
    const pdfBuffer = Buffer.from("%PDF-1.4 fake");
    // Force docling to be unfindable regardless of the host environment, so
    // this test is deterministic on machines that have docling installed.
    const originalPath = process.env.PATH;
    process.env.PATH = "";
    try {
      await expect(doclingProcessor.parse(pdfBuffer, {})).rejects.toThrow(
        /pip install docling/,
      );
    } finally {
      process.env.PATH = originalPath;
    }
  });
});