import os from "node:os";
import path from "node:path";
import { rm, writeFile, readFile } from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { Artifact } from "../types";
import type { ParserDef, ParserInput } from "./types";
import type { NpmParserModule } from "./npm";
import { hydrateSerializedArtifacts, validateSerializedArtifacts } from "../artifacts/input";

const execAsync = promisify(exec);

const parseCommandOutput = (stdout: string): Artifact[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Parser command produced invalid JSON: ${message}\nOutput: ${stdout.slice(0, 200)}`,
    );
  }
  const serialized = validateSerializedArtifacts(parsed);
  return hydrateSerializedArtifacts(serialized);
};

const spawnAndCapture = async (command: string, stdinBuffer?: Buffer): Promise<string> => {
  if (!command.trim()) {
    throw new Error(`Empty command: ${command}`);
  }

  try {
    const options = stdinBuffer
      ? { input: stdinBuffer.toString(), maxBuffer: 50 * 1024 * 1024 }
      : { maxBuffer: 50 * 1024 * 1024 };
    const { stdout } = await execAsync(command, options);
    return stdout;
  } catch (error) {
    if (error instanceof Error && "stderr" in error) {
      const stderr = (error as { stderr: string }).stderr;
      throw new Error(`Parser command failed: ${command}\nStderr: ${stderr?.slice(0, 500) ?? ""}`);
    }
    throw error;
  }
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
    throw new Error(`npm parser package "${pkg}" exports neither parseFile nor parseStream`);
  }

  if (input.kind === "file") {
    // Prefer parseFile for zero-copy
    if (hasParseFile) {
      return mod.parseFile!(input.path, mimeType);
    }
    // Fallback: open file as stream
    const { createReadStream } = await import("node:fs");
    const { Readable } = await import("node:stream");
    const nodeStream = createReadStream(input.path);
    const stream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
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

const runCommandFileParser = async (command: string, input: ParserInput): Promise<Artifact[]> => {
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

const runCommandStdinParser = async (command: string, input: ParserInput): Promise<Artifact[]> => {
  let buffer: Buffer;

  if (input.kind === "file") {
    buffer = await readFile(input.path);
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
    case "inline": {
      let buffer: Buffer;
      if (input.kind === "file") {
        buffer = await readFile(input.path);
      } else {
        buffer = input.buffer;
      }
      return [await def.handler(buffer)];
    }
    default: {
      const _exhaustive: never = def;
      throw new Error(`Unknown parser type: ${(_exhaustive as { type: string }).type}`);
    }
  }
};
