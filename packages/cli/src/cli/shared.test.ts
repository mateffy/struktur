import { test, expect } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rm, writeFile } from "node:fs/promises";
import { loadArtifactsFromOptions } from "./shared";

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
    JSON.stringify([{ id: "a1", type: "text", contents: [{ text: "hello" }] }])
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
      noStdinDeps
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
      noStdinDeps
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
      noStdinDeps
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
      noStdinDeps
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
    const artifacts = await loadArtifactsFromOptions(
      { input: path },
      noStdinDeps
    );
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
      readStdinText: () => Promise.resolve(stdinText),
      stdinIsTTY: false,
    }
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
      readStdinText: () => Promise.resolve(stdinText),
      stdinIsTTY: false,
    }
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
      readStdinText: () => Promise.resolve(stdinText),
      stdinIsTTY: false,
    }
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
      noStdinDeps
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
      readStdinText: () => Promise.resolve(stdinText),
      stdinIsTTY: false,
    }
  );
  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.type).toBe("text");
});

// ─── stdin artifact JSON auto-detection ───────────────────────────────────────

test("stdin with valid artifact JSON is parsed as artifact", async () => {
  const artifactJson = JSON.stringify([
    { id: "test-artifact", type: "text", contents: [{ text: "hello from artifact" }] }
  ]);
  const artifacts = await loadArtifactsFromOptions(
    { stdin: true },
    {
      readStdinText: () => Promise.resolve(artifactJson),
      stdinIsTTY: false,
    }
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
      readStdinText: () => Promise.resolve(stdinText),
      stdinIsTTY: false,
    }
  );
  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.type).toBe("text");
  const texts = artifacts[0]?.contents.map((c) => c.text).join(" ");
  expect(texts).toContain(stdinText);
});
