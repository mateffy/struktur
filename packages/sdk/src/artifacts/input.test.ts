import { test, expect, mock } from "bun:test";
import {
  clearArtifactInputParsers,
  parse,
  splitTextIntoContents,
  validateSerializedArtifacts,
} from "./input";

// ---------------------------------------------------------------------------
// Stub pdf-parse so the built-in PDF path in parseBufferInput can be tested
// without a real PDF file.
// ---------------------------------------------------------------------------
mock.module("pdf-parse", () => ({
  PDFParse: class {
    constructor(_opts: unknown) {}
    async getText() {
      return { pages: [{ num: 1, text: "pdf text" }], text: "pdf text", total: 1 };
    }
    async getImage(_params?: unknown) {
      return { pages: [], total: 0 };
    }
    async getInfo() {
      return { Title: "Stub PDF" };
    }
    async destroy() {}
  },
}));

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
  const artifacts = await parse({
    kind: "text",
    text: "hello\n\nworld",
    id: "t1",
  });

  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.id).toBe("t1");
  expect(artifacts[0]?.contents).toHaveLength(2);
});

test("parse uses providers when available", async () => {
  const providers = {
    "application/pdf": async () => ({
      id: "pdf-1",
      type: "pdf" as const,
      raw: async () => Buffer.from("pdf"),
      contents: [{ text: "from-provider" }],
    }),
  };

  const artifacts = await parse({
    kind: "buffer",
    buffer: Buffer.from("data"),
    mimeType: "application/pdf",
  }, { providers });

  expect(artifacts[0]?.type).toBe("pdf");
  expect(artifacts[0]?.contents[0]?.text).toBe("from-provider");
});

test("parse builds image artifacts", async () => {
  clearArtifactInputParsers();
  const buffer = Buffer.from([1, 2, 3]);
  const artifacts = await parse({
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

test("parse uses parserConfig over providers", async () => {
  const providers = {
    "application/pdf": async () => ({
      id: "from-provider",
      type: "pdf" as const,
      raw: async () => Buffer.from("pdf"),
      contents: [{ text: "from-provider" }],
    }),
  };

  const artifactJson = JSON.stringify([{
    id: "from-parser",
    type: "text",
    contents: [{ text: "from-parser" }],
  }]);
  const parserConfig = {
    "application/pdf": {
      type: "command-stdin" as const,
      command: `echo ${JSON.stringify(artifactJson)}`,
    },
  };

  const artifacts = await parse(
    {
      kind: "buffer",
      buffer: Buffer.from("data"),
      mimeType: "application/pdf",
    },
    { providers, parserConfig }
  );

  expect(artifacts[0]?.id).toBe("from-parser");
  expect(artifacts[0]?.contents[0]?.text).toBe("from-parser");
});

test("parse auto-detects JSON artifacts (buffer)", async () => {
  clearArtifactInputParsers();
  const serialized = [{ id: "j1", type: "text" as const, contents: [{ text: "json artifact" }] }];
  const buffer = Buffer.from(JSON.stringify(serialized));

  const artifacts = await parse({
    kind: "buffer",
    buffer,
    mimeType: "application/json",
  });

  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.id).toBe("j1");
  expect(artifacts[0]?.contents[0]?.text).toBe("json artifact");
});

test("parse throws for non-artifact JSON with no custom parser", async () => {
  clearArtifactInputParsers();
  const buffer = Buffer.from(JSON.stringify({ some: "object" }));

  await expect(
    parse({
      kind: "buffer",
      buffer,
      mimeType: "application/json",
    })
  ).rejects.toThrow("not in SerializedArtifact format");
});

// ─── built-in PDF path ───────────────────────────────────────────────────────

test("parse routes application/pdf to built-in parsePdf", async () => {
  clearArtifactInputParsers();
  const pdfBuffer = Buffer.from("%PDF-1.4 fake");

  const artifacts = await parse({
    kind: "buffer",
    buffer: pdfBuffer,
    mimeType: "application/pdf",
  });

  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.type).toBe("pdf");
  expect(artifacts[0]?.contents[0]?.text).toBe("pdf text");
});

test("parse passes includeImages: false to parsePdf", async () => {
  clearArtifactInputParsers();
  const pdfBuffer = Buffer.from("%PDF-1.4 fake");

  // With includeImages: false the result should still be a pdf artifact;
  // we can't easily observe the absence of images here (the stub returns none
  // anyway) but we verify the call succeeds and type is correct.
  const artifacts = await parse(
    {
      kind: "buffer",
      buffer: pdfBuffer,
      mimeType: "application/pdf",
    },
    { includeImages: false }
  );

  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.type).toBe("pdf");
});

test("validateSerializedArtifacts accepts imageType field in media", () => {
  const artifacts = validateSerializedArtifacts({
    id: "a1",
    type: "pdf",
    contents: [
      {
        page: 1,
        text: "page text",
        media: [
          { type: "image", base64: "abc123", imageType: "embedded" },
          { type: "image", base64: "def456", imageType: "screenshot" },
        ],
      },
    ],
  });

  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.contents[0]?.media).toHaveLength(2);
  expect(artifacts[0]?.contents[0]?.media![0]?.imageType).toBe("embedded");
  expect(artifacts[0]?.contents[0]?.media![1]?.imageType).toBe("screenshot");
});

test("validateSerializedArtifacts accepts media without imageType (optional field)", () => {
  const artifacts = validateSerializedArtifacts({
    id: "a1",
    type: "pdf",
    contents: [
      {
        page: 1,
        text: "page text",
        media: [{ type: "image", base64: "abc123" }],
      },
    ],
  });

  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.contents[0]?.media).toHaveLength(1);
  expect(artifacts[0]?.contents[0]?.media![0]?.imageType).toBeUndefined();
});
