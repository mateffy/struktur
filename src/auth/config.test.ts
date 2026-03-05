import { test, expect } from "bun:test";
import path from "node:path";
import os from "node:os";
import { rm } from "node:fs/promises";
import {
  listParsers,
  getParser,
  setParser,
  deleteParser,
} from "./config";

const makeTempDir = () => {
  const suffix = Math.random().toString(16).slice(2);
  return path.join(os.tmpdir(), `struktur-test-${suffix}`);
};

test("listParsers returns empty object when no parsers configured", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;

  try {
    const parsers = await listParsers();
    expect(parsers).toEqual({});
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("setParser stores an npm parser", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;

  try {
    await setParser("application/pdf", { type: "npm", package: "my-pdf-parser" });
    const parser = await getParser("application/pdf");
    expect(parser).toEqual({ type: "npm", package: "my-pdf-parser" });
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("setParser stores a command-file parser", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;

  try {
    await setParser("application/pdf", {
      type: "command-file",
      command: "my-cmd FILE_PATH output",
    });
    const parser = await getParser("application/pdf");
    expect(parser).toEqual({ type: "command-file", command: "my-cmd FILE_PATH output" });
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("setParser rejects command-file without FILE_PATH placeholder", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;

  try {
    await expect(
      setParser("application/pdf", { type: "command-file", command: "my-cmd --input" })
    ).rejects.toThrow("FILE_PATH");
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("setParser stores a command-stdin parser", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;

  try {
    await setParser("text/csv", { type: "command-stdin", command: "csv-to-json" });
    const parser = await getParser("text/csv");
    expect(parser).toEqual({ type: "command-stdin", command: "csv-to-json" });
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("listParsers returns all stored parsers", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;

  try {
    await setParser("application/pdf", { type: "npm", package: "pdf-parser" });
    await setParser("text/csv", { type: "command-stdin", command: "csv-parse" });
    const parsers = await listParsers();
    expect(parsers["application/pdf"]).toEqual({ type: "npm", package: "pdf-parser" });
    expect(parsers["text/csv"]).toEqual({ type: "command-stdin", command: "csv-parse" });
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("deleteParser removes stored parser and returns true", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;

  try {
    await setParser("application/pdf", { type: "npm", package: "pdf-parser" });
    const deleted = await deleteParser("application/pdf");
    expect(deleted).toBe(true);
    const parser = await getParser("application/pdf");
    expect(parser).toBeUndefined();
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("deleteParser returns false when parser does not exist", async () => {
  const tempDir = makeTempDir();
  process.env.STRUKTUR_CONFIG_DIR = tempDir;

  try {
    const deleted = await deleteParser("application/pdf");
    expect(deleted).toBe(false);
  } finally {
    delete process.env.STRUKTUR_CONFIG_DIR;
    await rm(tempDir, { recursive: true, force: true });
  }
});
