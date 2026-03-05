import { test, expect } from "bun:test";
import { detectMimeType } from "./mime";

test("detectMimeType returns mimeOverride when provided", async () => {
  const result = await detectMimeType({ mimeOverride: "application/pdf" });
  expect(result).toBe("application/pdf");
});

test("detectMimeType detects PDF from magic bytes", async () => {
  const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
  const result = await detectMimeType({ buffer: pdfHeader });
  expect(result).toBe("application/pdf");
});

test("detectMimeType detects PNG from magic bytes", async () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const result = await detectMimeType({ buffer: pngHeader });
  expect(result).toBe("image/png");
});

test("detectMimeType detects JPEG from magic bytes", async () => {
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const result = await detectMimeType({ buffer: jpegHeader });
  expect(result).toBe("image/jpeg");
});

test("detectMimeType detects GIF from magic bytes", async () => {
  const gifHeader = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  const result = await detectMimeType({ buffer: gifHeader });
  expect(result).toBe("image/gif");
});

test("detectMimeType detects WebP from magic bytes", async () => {
  const webpHeader = Buffer.alloc(12);
  // RIFF at offset 0
  webpHeader[0] = 0x52; webpHeader[1] = 0x49; webpHeader[2] = 0x46; webpHeader[3] = 0x46;
  // WEBP at offset 8
  webpHeader[8] = 0x57; webpHeader[9] = 0x45; webpHeader[10] = 0x42; webpHeader[11] = 0x50;
  const result = await detectMimeType({ buffer: webpHeader });
  expect(result).toBe("image/webp");
});

test("detectMimeType falls back to extension lookup for .txt", async () => {
  const result = await detectMimeType({ filePath: "/some/file.txt" });
  expect(result).toBe("text/plain");
});

test("detectMimeType falls back to extension lookup for .md", async () => {
  const result = await detectMimeType({ filePath: "README.md" });
  expect(result).toBe("text/markdown");
});

test("detectMimeType falls back to extension lookup for .json", async () => {
  const result = await detectMimeType({ filePath: "data.json" });
  expect(result).toBe("application/json");
});

test("detectMimeType falls back to extension lookup for .docx", async () => {
  const result = await detectMimeType({ filePath: "doc.docx" });
  expect(result).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
});

test("detectMimeType returns null for unknown extension with no magic bytes", async () => {
  const result = await detectMimeType({ filePath: "file.xyz" });
  expect(result).toBeNull();
});

test("detectMimeType returns null with no inputs", async () => {
  const result = await detectMimeType({});
  expect(result).toBeNull();
});

test("detectMimeType mimeOverride takes precedence over magic bytes", async () => {
  const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46]);
  const result = await detectMimeType({
    buffer: pdfHeader,
    mimeOverride: "text/plain",
  });
  expect(result).toBe("text/plain");
});

test("detectMimeType extension takes precedence over null buffer detection", async () => {
  // Buffer with no magic bytes, but file has .pdf extension
  const randomBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03]);
  const result = await detectMimeType({
    buffer: randomBuffer,
    filePath: "document.pdf",
  });
  // magic bytes don't match, falls back to extension
  expect(result).toBe("application/pdf");
});
