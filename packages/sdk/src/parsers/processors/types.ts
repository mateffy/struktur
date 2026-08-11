import type { Artifact } from "../../types";

export type PdfProcessorOptions = {
  includeImages?: boolean;
  screenshots?: boolean;
  screenshotScale?: number;
  screenshotWidth?: number;
  /**
   * VLM processor only: the AI SDK model to use for page-to-markdown conversion.
   * Resolved by the caller (CLI or SDK user) before being passed in.
   */
  model?: unknown;
  /**
   * VLM processor only: maximum concurrent page conversions. Default 3.
   */
  concurrency?: number;
};

export type PdfProcessor = {
  name: string;
  description: string;
  parse(buffer: Buffer, options: PdfProcessorOptions): Promise<Artifact[]>;
};