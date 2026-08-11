import type { ParsePdfOptions } from "../pdf";
import { parsePdf } from "../pdf";
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