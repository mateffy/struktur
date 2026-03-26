import path from "node:path";
import type { NpmParserDef } from "./types";

// Magic byte signatures for common file types
const MAGIC_BYTES: Array<{ mimeType: string; bytes: number[]; offset?: number }> = [
  // PDF: %PDF
  { mimeType: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  // PNG: 89 50 4E 47
  { mimeType: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  // JPEG: FF D8 FF
  { mimeType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  // GIF: GIF8
  { mimeType: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  // ZIP / Office Open XML (DOCX/XLSX/PPTX all start with PK\x03\x04)
  {
    mimeType: "application/zip",
    bytes: [0x50, 0x4b, 0x03, 0x04],
  },
];

// WebP has RIFF at offset 0 and WEBP at offset 8
const isWebP = (header: Uint8Array): boolean => {
  if (header.length < 12) return false;
  const riff = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;
  const webp =
    header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
  return riff && webp;
};

const matchesMagicBytes = (header: Uint8Array, bytes: number[], offset = 0): boolean => {
  if (header.length < offset + bytes.length) return false;
  return bytes.every((b, i) => header[offset + i] === b);
};

const detectFromMagicBytes = (header: Uint8Array): string | null => {
  if (isWebP(header)) return "image/webp";

  for (const { mimeType, bytes, offset } of MAGIC_BYTES) {
    if (matchesMagicBytes(header, bytes, offset ?? 0)) {
      return mimeType;
    }
  }

  return null;
};

// Extension → MIME type lookup
const EXTENSION_MIME_MAP: Record<string, string> = {
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".csv": "text/csv",
  ".xml": "application/xml",
  ".yaml": "application/yaml",
  ".yml": "application/yaml",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".svg": "image/svg+xml",
  ".ts": "text/plain",
  ".tsx": "text/plain",
  ".js": "text/javascript",
  ".jsx": "text/javascript",
  ".css": "text/css",
  ".toml": "application/toml",
};

export type NpmParserEntry = {
  mimeType: string;
  def: NpmParserDef;
};

export async function detectMimeType(options: {
  buffer?: Buffer;
  filePath?: string;
  mimeOverride?: string;
  npmParsers?: NpmParserEntry[];
}): Promise<string | null> {
  const { buffer, filePath, mimeOverride, npmParsers } = options;

  // --mime override takes precedence
  if (mimeOverride) {
    return mimeOverride;
  }

  // Layer 1: magic bytes (authoritative)
  if (buffer && buffer.length > 0) {
    const header = buffer.subarray(0, 512);
    const magicMime = detectFromMagicBytes(header);
    if (magicMime) {
      return magicMime;
    }

    // Layer 3: npm parser detectFileType callbacks (after built-ins)
    if (npmParsers && npmParsers.length > 0) {
      for (const entry of npmParsers) {
        try {
          const mod = (await import(entry.def.package)) as {
            detectFileType?: (header: Uint8Array) => boolean;
          };
          if (typeof mod.detectFileType === "function" && mod.detectFileType(header)) {
            return entry.mimeType;
          }
        } catch {
          // If the package fails to load, skip it
        }
      }
    }
  }

  // Layer 2: extension database (for file inputs)
  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext && ext in EXTENSION_MIME_MAP) {
      return EXTENSION_MIME_MAP[ext] ?? null;
    }
  }

  return null;
}
