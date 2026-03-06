import type { Artifact } from "../types";

/**
 * Contract for npm parser packages.
 *
 * A parser package must export at least one of `parseStream` or `parseFile`.
 * `detectFileType` is optional.
 */

// Parser receives a ReadableStream — no disk I/O needed
export type ParseStreamFn = (
  stream: ReadableStream<Uint8Array>,
  mimeType: string,
) => Promise<Artifact[]>;

// Parser receives a file path — useful for libraries that only work with files
export type ParseFileFn = (filePath: string, mimeType: string) => Promise<Artifact[]>;

// Magic byte detection — optional; return true if this parser handles the given bytes
export type DetectFileTypeFn = (header: Uint8Array) => boolean;

export type NpmParserModule = {
  parseStream?: ParseStreamFn;
  parseFile?: ParseFileFn;
  detectFileType?: DetectFileTypeFn;
};
