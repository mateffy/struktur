export type { PdfProcessor, PdfProcessorOptions } from "./types";
export { registerPdfProcessor, getPdfProcessor, listPdfProcessors } from "./registry";
export { pdfParseProcessor } from "./pdf-parse";

// Lazy imports for optional adapters — these will be created in later phases.
// We export the names for discoverability but import only when used.
export { vlmProcessor } from "./vlm";
export { doclingProcessor } from "./docling";
export { liteparseProcessor } from "./liteparse";
export { kreuzbergProcessor } from "./kreuzberg";

// Register built-in processors
import { registerPdfProcessor } from "./registry";
import { pdfParseProcessor } from "./pdf-parse";
import { vlmProcessor } from "./vlm";
import { doclingProcessor } from "./docling";
import { liteparseProcessor } from "./liteparse";
import { kreuzbergProcessor } from "./kreuzberg";

registerPdfProcessor(pdfParseProcessor);
registerPdfProcessor(vlmProcessor);
registerPdfProcessor(doclingProcessor);
registerPdfProcessor(liteparseProcessor);
registerPdfProcessor(kreuzbergProcessor);