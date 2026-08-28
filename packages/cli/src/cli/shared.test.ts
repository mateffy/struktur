import { test, expect, describe } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rm, writeFile } from "node:fs/promises";
import { loadArtifactsFromOptions, formatParseOutput } from "./shared";
import type { SerializedArtifact } from "@struktur/sdk";

const makeTempPath = (name: string, ext = ".txt") =>
  join(tmpdir(), `struktur-shared-test-${name}-${crypto.randomUUID()}${ext}`);

// ─── helpers ────────────────────────────────────────────────────────────────

const makeTextFile = async (content: string, ext = ".txt") => {
  const path = makeTempPath("text", ext);
  await writeFile(path, content);
  return path;
};

const makeArtifactFile = async () => {
  const path = makeTempPath("artifact", ".json");
  await writeFile(
    path,
    JSON.stringify([{ id: "a1", type: "text", contents: [{ text: "hello" }] }]),
  );
  return path;
};

// A fake deps object that prevents real stdin reads
const noStdinDeps = {
  readStdinText: () => Promise.reject(new Error("stdin should not be read")),
  stdinIsTTY: true,
};

// ─── --mime override ─────────────────────────────────────────────────────────

test("--mime override is respected for file inputs", async () => {
  // Write a plain text file but tell the CLI it is text/csv; since there is
  // no csv parser configured, it should fall through to the text/* built-in
  // and produce a text artifact.
  const path = await makeTextFile("col1,col2\nval1,val2", ".csv");
  try {
    const artifacts = await loadArtifactsFromOptions(
      { input: path, mime: "text/csv" },
      noStdinDeps,
    );
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.type).toBe("text");
  } finally {
    await rm(path, { force: true });
  }
});

test("--mime override skips magic-byte and extension detection", async () => {
  // Write a file with a .pdf extension but no PDF magic bytes; force it to
  // be treated as text/plain via --mime.
  const path = makeTempPath("fake-pdf", ".pdf");
  await writeFile(path, "this is just text, not a PDF");
  try {
    const artifacts = await loadArtifactsFromOptions(
      { input: path, mime: "text/plain" },
      noStdinDeps,
    );
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.type).toBe("text");
  } finally {
    await rm(path, { force: true });
  }
});

// ─── --no-parse ─────────────────────────────────────────────────────────────

test("--no-parse causes a text file to be read as text artifact", async () => {
  const path = await makeTextFile("hello world");
  try {
    const artifacts = await loadArtifactsFromOptions(
      { input: path, "no-parse": true },
      noStdinDeps,
    );
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.type).toBe("text");
    const texts = artifacts[0]?.contents.map((c) => c.text).join(" ");
    expect(texts).toContain("hello world");
  } finally {
    await rm(path, { force: true });
  }
});

test("--no-parse with --mime still applies the mime type for built-in handling", async () => {
  const path = await makeTextFile("some markdown content", ".md");
  try {
    const artifacts = await loadArtifactsFromOptions(
      { input: path, "no-parse": true, mime: "text/markdown" },
      noStdinDeps,
    );
    // text/* falls through to text artifact even with --no-parse
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.type).toBe("text");
  } finally {
    await rm(path, { force: true });
  }
});

// ─── artifact JSON auto-detection ───────────────────────────────────────────

test("JSON file that is valid SerializedArtifact[] is hydrated directly", async () => {
  const path = await makeArtifactFile();
  try {
    const artifacts = await loadArtifactsFromOptions({ input: path }, noStdinDeps);
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.id).toBe("a1");
    expect(artifacts[0]?.type).toBe("text");
  } finally {
    await rm(path, { force: true });
  }
});

// ─── stdin MIME fallback ─────────────────────────────────────────────────────

test("stdin without --mime falls back to text/plain", async () => {
  const stdinText = "plain text from stdin";
  const artifacts = await loadArtifactsFromOptions(
    { stdin: true },
    {
      readStdinBinary: () => Promise.resolve(Buffer.from(stdinText)),
      stdinIsTTY: false,
    },
  );
  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.type).toBe("text");
  const texts = artifacts[0]?.contents.map((c) => c.text).join(" ");
  expect(texts).toContain(stdinText);
});

test("stdin with --mime text/plain produces a text artifact", async () => {
  const stdinText = "explicit mime override";
  const artifacts = await loadArtifactsFromOptions(
    { stdin: true, mime: "text/plain" },
    {
      readStdinBinary: () => Promise.resolve(Buffer.from(stdinText)),
      stdinIsTTY: false,
    },
  );
  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.type).toBe("text");
});

// ─── stdin --no-parse ────────────────────────────────────────────────────────

test("stdin with --no-parse still produces a text artifact", async () => {
  const stdinText = "no parse stdin";
  const artifacts = await loadArtifactsFromOptions(
    { stdin: true, "no-parse": true },
    {
      readStdinBinary: () => Promise.resolve(Buffer.from(stdinText)),
      stdinIsTTY: false,
    },
  );
  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.type).toBe("text");
});

// ─── --no-images ─────────────────────────────────────────────────────────────

test("--no-images is accepted without error for text file inputs", async () => {
  // For non-PDF inputs, --no-images is a no-op but must not throw or change result.
  const path = await makeTextFile("hello world");
  try {
    const artifacts = await loadArtifactsFromOptions(
      { input: path, "no-images": true },
      noStdinDeps,
    );
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.type).toBe("text");
  } finally {
    await rm(path, { force: true });
  }
});

test("--no-images is accepted without error for stdin text inputs", async () => {
  const stdinText = "no images stdin";
  const artifacts = await loadArtifactsFromOptions(
    { stdin: true, "no-images": true },
    {
      readStdinBinary: () => Promise.resolve(Buffer.from(stdinText)),
      stdinIsTTY: false,
    },
  );
  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.type).toBe("text");
});

// ─── stdin artifact JSON auto-detection ───────────────────────────────────────

test("stdin with valid artifact JSON is parsed as artifact", async () => {
  const artifactJson = JSON.stringify([
    { id: "test-artifact", type: "text", contents: [{ text: "hello from artifact" }] },
  ]);
  const artifacts = await loadArtifactsFromOptions(
    { stdin: true },
    {
      readStdinBinary: () => Promise.resolve(Buffer.from(artifactJson)),
      stdinIsTTY: false,
    },
  );
  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.id).toBe("test-artifact");
  expect(artifacts[0]?.type).toBe("text");
});

test("stdin with invalid JSON falls back to text parsing", async () => {
  const stdinText = "this is not json, just plain text";
  const artifacts = await loadArtifactsFromOptions(
    { stdin: true },
    {
      readStdinBinary: () => Promise.resolve(Buffer.from(stdinText)),
      stdinIsTTY: false,
    },
  );
  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.type).toBe("text");
  const texts = artifacts[0]?.contents.map((c) => c.text).join(" ");
  expect(texts).toContain(stdinText);
});

// ---------------------------------------------------------------------------
// formatParseOutput
// ---------------------------------------------------------------------------

describe("formatParseOutput", () => {
  test('formatParseOutput("json") returns prettified JSON', () => {
    const artifacts: SerializedArtifact[] = [
      {
        id: "a1",
        type: "text",
        contents: [{ text: "hello world" }],
      },
    ];
    const result = formatParseOutput(artifacts, { format: "json" });
    const parsed = JSON.parse(result);
    expect(parsed).toEqual(artifacts);
    expect(result).toContain("\n");
  });

  test('formatParseOutput("text") returns text for single content entry', () => {
    const artifacts: SerializedArtifact[] = [
      {
        id: "a1",
        type: "text",
        contents: [{ text: "hello world" }],
      },
    ];
    const result = formatParseOutput(artifacts, { format: "text" });
    expect(result).toBe("hello world");
  });

  test('formatParseOutput("text") joins multiple content entries with ---', () => {
    const artifacts: SerializedArtifact[] = [
      {
        id: "a1",
        type: "pdf",
        contents: [
          { page: 1, text: "first page" },
          { page: 2, text: "second page" },
        ],
      },
    ];
    const result = formatParseOutput(artifacts, { format: "text" });
    expect(result).toBe("first page\n\n---\n\nsecond page");
  });

  test('formatParseOutput("text") skips content entries without text', () => {
    const artifacts: SerializedArtifact[] = [
      {
        id: "a1",
        type: "pdf",
        contents: [
          { text: "has text" },
          { media: [{ type: "image" as const, base64: "aaaa" }] },
          { text: "more text" },
        ],
      },
    ];
    const result = formatParseOutput(artifacts, { format: "text" });
    expect(result).toBe("has text\n\n---\n\nmore text");
  });

  test('formatParseOutput("text") handles multiple artifacts', () => {
    const artifacts: SerializedArtifact[] = [
      {
        id: "a1",
        type: "text",
        contents: [{ text: "first doc" }],
      },
      {
        id: "a2",
        type: "text",
        contents: [{ text: "second doc" }],
      },
    ];
    const result = formatParseOutput(artifacts, { format: "text" });
    expect(result).toBe("first doc\n\n---\n\nsecond doc");
  });

  test('formatParseOutput("text") with includeImages adds markdown image tags', () => {
    const artifacts: SerializedArtifact[] = [
      {
        id: "a1",
        type: "pdf",
        contents: [
          {
            page: 1,
            text: "some text",
            media: [
              { type: "image" as const, base64: "abc123" },
              { type: "image" as const, base64: "def456" },
            ],
          },
        ],
      },
    ];
    const result = formatParseOutput(artifacts, {
      format: "text",
      includeImages: true,
    });
    const expected =
      "some text\n\n" +
      "![](data:image/png;base64,abc123)\n\n" +
      "![](data:image/png;base64,def456)";
    expect(result).toBe(expected);
  });

  test('formatParseOutput("text") with includeImages: false ignores images', () => {
    const artifacts: SerializedArtifact[] = [
      {
        id: "a1",
        type: "pdf",
        contents: [
          {
            page: 1,
            text: "some text",
            media: [{ type: "image" as const, base64: "abc123" }],
          },
        ],
      },
    ];
    const result = formatParseOutput(artifacts, {
      format: "text",
      includeImages: false,
    });
    expect(result).toBe("some text");
  });

  test('formatParseOutput("text") skips image entries without base64', () => {
    const artifacts: SerializedArtifact[] = [
      {
        id: "a1",
        type: "pdf",
        contents: [
          {
            text: "some text",
            media: [
              { type: "image" as const, url: "https://example.com/img.png" },
              { type: "image" as const, base64: "abc123" },
            ],
          },
        ],
      },
    ];
    const result = formatParseOutput(artifacts, {
      format: "text",
      includeImages: true,
    });
    expect(result).toBe("some text\n\n![](data:image/png;base64,abc123)");
  });

  test('formatParseOutput("text") on empty artifacts returns empty string', () => {
    const result = formatParseOutput([], { format: "text" });
    expect(result).toBe("");
  });

  test('formatParseOutput("text") on artifacts with no text at all returns empty string', () => {
    const artifacts: SerializedArtifact[] = [
      {
        id: "a1",
        type: "image",
        contents: [{ media: [{ type: "image" as const, base64: "abc" }] }],
      },
    ];
    const result = formatParseOutput(artifacts, { format: "text" });
    expect(result).toBe("");
  });
});

// ---------------------------------------------------------------------------
// End-to-end: liteparse processor → formatParseOutput
// ---------------------------------------------------------------------------

describe("liteparse processor end-to-end", () => {
  const minimalPdf = Buffer.from(
    "%PDF-1.4\n" +
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
      "4 0 obj\n<< /Length 44 >>\nstream\n" +
      "BT /F1 12 Tf 72 720 Td (hello world) Tj ET\n" +
      "endstream\nendobj\n" +
      "xref\n0 5\n" +
      "0000000000 65535 f\n" +
      "0000000009 00000 n\n" +
      "0000000058 00000 n\n" +
      "0000000115 00000 n\n" +
      "0000000204 00000 n\n" +
      "trailer\n<< /Size 5 /Root 1 0 R >>\n" +
      "startxref\n297\n%%EOF",
    "utf-8",
  );

  test("liteparse processor + formatParseOutput produces non-empty text", async () => {
    const { liteparseProcessor } = await import("@struktur/sdk/parsers");
    const artifacts = await liteparseProcessor.parse(minimalPdf, {});

    // Serialize to SerializedArtifact[] like the CLI does
    const serialized = artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      contents: a.contents.map((c) => ({
        ...(c.page !== undefined ? { page: c.page } : {}),
        ...(c.text !== undefined ? { text: c.text } : {}),
        ...(c.media ? { media: c.media } : {}),
      })),
      ...(a.metadata ? { metadata: a.metadata } : {}),
    }));

    const output = formatParseOutput(serialized, { format: "text" });
    expect(output.length).toBeGreaterThan(0);
    expect(output).toContain("hello");
  });
});
