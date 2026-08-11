import type { PdfProcessor } from "./types";

const registry = new Map<string, PdfProcessor>();

export const registerPdfProcessor = (processor: PdfProcessor): void => {
  registry.set(processor.name, processor);
};

export const getPdfProcessor = (name: string): PdfProcessor | undefined => {
  return registry.get(name);
};

export const listPdfProcessors = (): PdfProcessor[] => {
  return Array.from(registry.values());
};