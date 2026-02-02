import { test, expect } from "bun:test";
import {
  clearArtifactInputParsers,
  parseInputToArtifacts,
  splitTextIntoContents,
  validateSerializedArtifacts,
} from "./input";
import { clearArtifactProviders, registerArtifactProvider } from "./providers";

test("validateSerializedArtifacts accepts a single artifact", () => {
  const artifacts = validateSerializedArtifacts({
    id: "a1",
    type: "text",
    contents: [{ text: "hello" }],
  });

  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.id).toBe("a1");
});

test("validateSerializedArtifacts rejects invalid artifacts", () => {
  expect(() =>
    validateSerializedArtifacts({
      type: "text",
      contents: [],
    })
  ).toThrow("Schema validation failed");
});

test("splitTextIntoContents splits paragraphs", () => {
  const contents = splitTextIntoContents("one\n\nTwo\n\nthree");
  expect(contents).toHaveLength(3);
  expect(contents[1]?.text).toBe("Two");
});

test("parseInputToArtifacts builds text artifacts", async () => {
  clearArtifactInputParsers();
  const artifacts = await parseInputToArtifacts({
    kind: "text",
    text: "hello\n\nworld",
    id: "t1",
  });

  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.id).toBe("t1");
  expect(artifacts[0]?.contents).toHaveLength(2);
});

test("parseInputToArtifacts uses providers when available", async () => {
  clearArtifactProviders();
  registerArtifactProvider("application/pdf", async () => ({
    id: "pdf-1",
    type: "pdf",
    raw: async () => Buffer.from("pdf"),
    contents: [{ text: "from-provider" }],
  }));

  const artifacts = await parseInputToArtifacts({
    kind: "buffer",
    buffer: Buffer.from("data"),
    mimeType: "application/pdf",
  });

  expect(artifacts[0]?.type).toBe("pdf");
  expect(artifacts[0]?.contents[0]?.text).toBe("from-provider");
  clearArtifactProviders();
});

test("parseInputToArtifacts builds image artifacts", async () => {
  clearArtifactInputParsers();
  const buffer = Buffer.from([1, 2, 3]);
  const artifacts = await parseInputToArtifacts({
    kind: "buffer",
    buffer,
    mimeType: "image/png",
    id: "img-1",
  });

  const media = artifacts[0]?.contents[0]?.media?.[0];
  expect(artifacts[0]?.type).toBe("image");
  expect(media?.type).toBe("image");
  expect((media?.contents as Buffer).equals(buffer)).toBe(true);
});
