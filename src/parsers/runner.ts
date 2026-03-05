import os from "node:os";
import path from "node:path";
import { rm, writeFile } from "node:fs/promises";
import type { Artifact } from "../types";
import type { ParserDef, ParserInput } from "./types";
import type { NpmParserModule } from "./npm";
import {
  hydrateSerializedArtifacts,
  validateSerializedArtifacts,
} from "../artifacts/input";

const parseCommandOutput = (stdout: string): Artifact[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Parser command produced invalid JSON: ${message}\nOutput: ${stdout.slice(0, 200)}`);
  }
  const serialized = validateSerializedArtifacts(parsed);
  return hydrateSerializedArtifacts(serialized);
};

const spawnAndCapture = async (command: string, stdinBuffer?: Buffer): Promise<string> => {
  if (!command.trim()) {
    throw new Error(`Empty command: ${command}`);
  }

  const proc = Bun.spawn(["sh", "-c", command], {
    stdout: "pipe",
    stderr: "pipe",
    stdin: stdinBuffer ? "pipe" : "ignore",
  });

  if (stdinBuffer && proc.stdin) {
    // Bun's FileSink uses write/end, not the WritableStream API
    const sink = proc.stdin as { write: (data: Uint8Array) => void; end: () => void };
    sink.write(stdinBuffer);
    sink.end();
  }

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(
      `Parser command exited with code ${exitCode}: ${command}\nStderr: ${stderr.slice(0, 500)}`
    );
  }

  return stdout;
};

const runNpmParser = async (
  pkg: string,
  input: ParserInput,
  mimeType: string,
): Promise<Artifact[]> => {
  const mod = (await import(pkg)) as NpmParserModule;

  const hasParseFile = typeof mod.parseFile === "function";
  const hasParseStream = typeof mod.parseStream === "function";

  if (!hasParseFile && !hasParseStream) {
    throw new Error(
      `npm parser package "${pkg}" exports neither parseFile nor parseStream`
    );
  }

  if (input.kind === "file") {
    // Prefer parseFile for zero-copy
    if (hasParseFile) {
      return mod.parseFile!(input.path, mimeType);
    }
    // Fallback: open file as stream
    const file = Bun.file(input.path);
    const stream = file.stream() as ReadableStream<Uint8Array>;
    return mod.parseStream!(stream, mimeType);
  }

  // input.kind === "buffer"
  if (hasParseStream) {
    // Prefer parseStream for buffers
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(input.buffer);
        controller.close();
      },
    });
    return mod.parseStream!(stream, mimeType);
  }

  // Fallback: write buffer to temp file, call parseFile, clean up
  const tmpFile = path.join(os.tmpdir(), `struktur-parse-${crypto.randomUUID()}`);
  try {
    await writeFile(tmpFile, input.buffer);
    return await mod.parseFile!(tmpFile, mimeType);
  } finally {
    await rm(tmpFile, { force: true });
  }
};

const runCommandFileParser = async (
  command: string,
  input: ParserInput,
): Promise<Artifact[]> => {
  let filePath: string;
  let tempFile: string | null = null;

  if (input.kind === "file") {
    filePath = input.path;
  } else {
    // Write buffer to temp file
    tempFile = path.join(os.tmpdir(), `struktur-parse-${crypto.randomUUID()}`);
    await writeFile(tempFile, input.buffer);
    filePath = tempFile;
  }

  try {
    const interpolated = command.replace(/FILE_PATH/g, filePath);
    const stdout = await spawnAndCapture(interpolated);
    return parseCommandOutput(stdout);
  } finally {
    if (tempFile) {
      await rm(tempFile, { force: true });
    }
  }
};

const runCommandStdinParser = async (
  command: string,
  input: ParserInput,
): Promise<Artifact[]> => {
  let buffer: Buffer;

  if (input.kind === "file") {
    const file = Bun.file(input.path);
    buffer = Buffer.from(await file.arrayBuffer());
  } else {
    buffer = input.buffer;
  }

  const stdout = await spawnAndCapture(command, buffer);
  return parseCommandOutput(stdout);
};

export const runParser = async (
  def: ParserDef,
  input: ParserInput,
  mimeType: string,
): Promise<Artifact[]> => {
  switch (def.type) {
    case "npm":
      return runNpmParser(def.package, input, mimeType);
    case "command-file":
      return runCommandFileParser(def.command, input);
    case "command-stdin":
      return runCommandStdinParser(def.command, input);
    default: {
      const _exhaustive: never = def;
      throw new Error(`Unknown parser type: ${(_exhaustive as { type: string }).type}`);
    }
  }
};
