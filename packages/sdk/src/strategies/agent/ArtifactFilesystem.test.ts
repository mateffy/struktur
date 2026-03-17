import { test, expect } from "bun:test";
import { serializeArtifactsToFilesystem } from "./ArtifactFilesystem";
import type { Artifact } from "../../types";

test("serializeArtifactsToFilesystem creates artifact.json and manifest.json", () => {
  const artifacts: Artifact[] = [
    {
      id: "test-1",
      type: "text",
      contents: [{ text: "Hello world" }],
      raw: async () => Buffer.from("Hello world"),
      tokens: 10,
      metadata: { source: "test" },
    },
  ];

  const result = serializeArtifactsToFilesystem(artifacts);

  expect(result["/artifact.json"]).toBeDefined();
  expect(result["/manifest.json"]).toBeDefined();
});

test("serializeArtifactsToFilesystem serializes artifacts correctly", () => {
  const artifacts: Artifact[] = [
    {
      id: "test-1",
      type: "text",
      contents: [{ text: "Hello world" }],
      raw: async () => Buffer.from("Hello world"),
      tokens: 10,
      metadata: { source: "test" },
    },
  ];

  const result = serializeArtifactsToFilesystem(artifacts);
  const parsed = JSON.parse(result["/artifact.json"]);

  expect(parsed).toHaveLength(1);
  expect(parsed[0].id).toBe("test-1");
  expect(parsed[0].type).toBe("text");
  expect(parsed[0].contents[0].text).toBe("Hello world");
  expect(parsed[0].tokens).toBe(10);
  expect(parsed[0].metadata).toEqual({ source: "test" });
});

test("serializeArtifactsToFilesystem creates correct manifest", () => {
  const artifacts: Artifact[] = [
    {
      id: "text-1",
      type: "text",
      contents: [{ text: "Hello" }],
      raw: async () => Buffer.from("Hello"),
    },
    {
      id: "pdf-1",
      type: "pdf",
      contents: [{ page: 1, text: "PDF content" }],
      raw: async () => Buffer.from("PDF"),
    },
    {
      id: "image-1",
      type: "image",
      contents: [{ media: [{ type: "image", base64: "base64data" }] }],
      raw: async () => Buffer.from("image"),
    },
  ];

  const result = serializeArtifactsToFilesystem(artifacts);
  const manifest = JSON.parse(result["/manifest.json"]);

  expect(manifest.count).toBe(3);
  expect(manifest.summary.textArtifacts).toBe(1);
  expect(manifest.summary.pdfArtifacts).toBe(1);
  expect(manifest.summary.imageArtifacts).toBe(1);
  expect(manifest.summary.fileArtifacts).toBe(0);
});

test("serializeArtifactsToFilesystem handles media with base64 by creating virtual files with descriptive names", () => {
  // Use a JPEG base64 signature for proper extension detection
  const jpegBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD";
  const artifacts: Artifact[] = [
    {
      id: "my-document",
      type: "image",
      contents: [
        {
          page: 5,
          media: [
            {
              type: "image",
              base64: jpegBase64,
              x: 10,
              y: 20,
              width: 100,
              height: 200,
              imageType: "embedded",
            },
          ],
        },
      ],
      raw: async () => Buffer.from("image"),
    },
  ];

  const result = serializeArtifactsToFilesystem(artifacts);
  const parsed = JSON.parse(result["/artifact.json"]);

  // Base64 should be replaced with virtualPath containing descriptive name
  expect(parsed[0].contents[0].media[0].virtualPath).toBeDefined();
  expect(parsed[0].contents[0].media[0].virtualPath).toContain("/images/");
  expect(parsed[0].contents[0].media[0].virtualPath).toContain("my-document"); // sanitized name
  expect(parsed[0].contents[0].media[0].virtualPath).toContain("page-5"); // page number
  expect(parsed[0].contents[0].media[0].virtualPath).toContain(".jpg"); // JPEG extension
  // originalBase64 should be present for debugging
  expect(parsed[0].contents[0].media[0].originalBase64).toContain("BASE64");
});

test("serializeArtifactsToFilesystem calculates total tokens", () => {
  const artifacts: Artifact[] = [
    {
      id: "test-1",
      type: "text",
      contents: [{ text: "Hello" }],
      raw: async () => Buffer.from("Hello"),
      tokens: 10,
    },
    {
      id: "test-2",
      type: "text",
      contents: [{ text: "World" }],
      raw: async () => Buffer.from("World"),
      tokens: 20,
    },
  ];

  const result = serializeArtifactsToFilesystem(artifacts);
  const manifest = JSON.parse(result["/manifest.json"]);

  expect(manifest.totalTokens).toBe(30);
});
