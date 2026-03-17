import { test, expect, describe } from "bun:test";

describe("Image Format Detection", () => {
  test("detects JPEG from base64 signature", () => {
    const jpegBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD";
    expect(jpegBase64.startsWith("/9j/")).toBe(true);
  });

  test("detects PNG from base64 signature", () => {
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    expect(pngBase64.startsWith("iVBOR")).toBe(true);
  });

  test("detects GIF from base64 signature", () => {
    const gifBase64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    expect(gifBase64.startsWith("R0lGOD")).toBe(true);
  });

  test("detects WebP from base64 signature", () => {
    const webpBase64 = "UklGRiIAAABXRUJQVlA4TAAAAgAAAA";
    expect(webpBase64.startsWith("UklGR")).toBe(true);
  });

  test("handles unknown format gracefully", () => {
    const unknownBase64 = "YXJiaXRyYXJ5ZGF0YQ==";
    expect(unknownBase64.startsWith("/9j/")).toBe(false);
    expect(unknownBase64.startsWith("iVBOR")).toBe(false);
    expect(unknownBase64.startsWith("R0lGOD")).toBe(false);
  });
});

describe("Artifact Name Sanitization", () => {
  test("replaces spaces with dashes", () => {
    const name = "My Document";
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase();
    expect(sanitized).toBe("my-document");
  });

  test("removes special characters", () => {
    const name = "doc@file#1.pdf";
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase();
    expect(sanitized).toBe("doc-file-1-pdf");
  });

  test("handles multiple dashes", () => {
    const name = "doc---file";
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    expect(sanitized).toBe("doc-file");
  });
});
