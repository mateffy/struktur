import { test, expect, describe } from "bun:test";
import { registerPdfProcessor, getPdfProcessor, listPdfProcessors } from "./registry";
import type { PdfProcessor } from "./types";

// Side-effect import: registers the built-in processors so this test does not
// depend on other test files having imported them first.
import "./index";

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
    const mock1: PdfProcessor = {
      name: "test-overwrite",
      description: "v1",
      parse: async () => [],
    };
    const mock2: PdfProcessor = {
      name: "test-overwrite",
      description: "v2",
      parse: async () => [],
    };
    registerPdfProcessor(mock1);
    registerPdfProcessor(mock2);
    expect(getPdfProcessor("test-overwrite")).toBe(mock2);
  });
});