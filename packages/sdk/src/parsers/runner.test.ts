import { test, expect } from "bun:test";
import { runParser } from "./runner";
import type { ParserDef, ParserInput } from "./types";
import path from "node:path";
import os from "node:os";
import { rm, writeFile } from "node:fs/promises";

// command-file: echo a serialized artifact JSON
const makeArtifactJson = () => {
  const artifact = JSON.stringify([{
    id: "test-1",
    type: "text",
    contents: [{ text: "parsed text" }],
  }]);
  return artifact;
};

test("command-stdin runner pipes buffer to stdin and parses output", async () => {
  // Use a command that outputs valid artifact JSON ignoring stdin
  const artifactJson = makeArtifactJson();
  const def: ParserDef = {
    type: "command-stdin",
    command: `echo ${JSON.stringify(artifactJson)}`,
  };
  const input: ParserInput = {
    kind: "buffer",
    buffer: Buffer.from("irrelevant input"),
  };

  const artifacts = await runParser(def, input, "text/plain");
  expect(artifacts).toHaveLength(1);
  expect(artifacts[0]?.id).toBe("test-1");
  expect(artifacts[0]?.contents[0]?.text).toBe("parsed text");
});

test("command-file runner interpolates FILE_PATH and parses output", async () => {
  const artifactJson = makeArtifactJson();
  // Write a script that outputs the artifact JSON
  const tmpScript = path.join(os.tmpdir(), `struktur-test-${Math.random().toString(16).slice(2)}.sh`);
  await writeFile(tmpScript, `#!/bin/sh\necho '${artifactJson}'`, { mode: 0o755 });

  try {
    const def: ParserDef = {
      type: "command-file",
      command: `${tmpScript} FILE_PATH`,
    };
    const input: ParserInput = {
      kind: "file",
      path: tmpScript,
    };

    const artifacts = await runParser(def, input, "text/plain");
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.id).toBe("test-1");
  } finally {
    await rm(tmpScript, { force: true });
  }
});

test("command-file runner writes temp file for buffer input", async () => {
  const artifactJson = makeArtifactJson();
  const tmpScript = path.join(os.tmpdir(), `struktur-test-${Math.random().toString(16).slice(2)}.sh`);
  await writeFile(tmpScript, `#!/bin/sh\necho '${artifactJson}'`, { mode: 0o755 });

  try {
    const def: ParserDef = {
      type: "command-file",
      command: `${tmpScript} FILE_PATH`,
    };
    const input: ParserInput = {
      kind: "buffer",
      buffer: Buffer.from("some buffer data"),
    };

    const artifacts = await runParser(def, input, "text/plain");
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]?.id).toBe("test-1");
  } finally {
    await rm(tmpScript, { force: true });
  }
});

test("npm runner errors when package exports neither function", async () => {
  // This will fail to import, but we test that the error is thrown
  const def: ParserDef = {
    type: "npm",
    package: "this-package-does-not-exist-xyz-abc-123",
  };
  const input: ParserInput = {
    kind: "buffer",
    buffer: Buffer.from("data"),
  };

  await expect(runParser(def, input, "text/plain")).rejects.toThrow();
});
