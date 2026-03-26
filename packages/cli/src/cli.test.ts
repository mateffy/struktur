import { test, expect } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadSchema } from "./cli/shared";

const makeTempPath = (name: string) => {
  return join(tmpdir(), `struktur-${name}-${crypto.randomUUID()}.json`);
};

test("verify-artifact command validates artifact JSON", async () => {
  const inputPath = makeTempPath("artifact");
  await Bun.write(
    inputPath,
    JSON.stringify({ id: "a1", type: "text", contents: [{ text: "hello" }] }),
  );

  const result = Bun.spawnSync({
    cmd: [
      process.execPath,
      join(import.meta.dir, "cli.ts"),
      "utils",
      "verify-artifact",
      "--input",
      inputPath,
    ],
    stdout: "pipe",
    stderr: "pipe",
  });

  const output = new TextDecoder().decode(result.stdout);
  expect(result.exitCode).toBe(0);
  expect(output).toContain('"valid": true');
});

const readHeader = (headers: unknown, name: string): string | null => {
  if (!headers) {
    return null;
  }
  if (headers instanceof Headers) {
    return headers.get(name);
  }
  if (Array.isArray(headers)) {
    const match = headers.find((entry) => {
      if (!Array.isArray(entry) || entry.length < 2) {
        return false;
      }
      const [key] = entry;
      return String(key).toLowerCase() === name.toLowerCase();
    });
    return match ? String(match[1]) : null;
  }
  if (typeof headers === "object") {
    const record = headers as Record<string, string>;
    const direct = record[name];
    if (direct) {
      return direct;
    }
    const lower = Object.entries(record).find(([key]) => key.toLowerCase() === name.toLowerCase());
    return lower ? lower[1] : null;
  }
  return null;
};

test("loadSchema fetches URL schema with JSON accept", async () => {
  const originalFetch = globalThis.fetch;
  let capturedAccept: string | null = null;

  const mockedFetch = (async (input: unknown, init?: unknown) => {
    const headerSource = (init as { headers?: unknown } | undefined)?.headers;
    capturedAccept = readHeader(headerSource, "accept");
    expect(String(input)).toBe("https://example.com/schema.json");
    return new Response(JSON.stringify({ type: "object" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  mockedFetch.preconnect = originalFetch.preconnect;
  globalThis.fetch = mockedFetch;

  try {
    const result = await loadSchema({
      schema: "https://example.com/schema.json",
    });
    expect(result.kind).toBe("schema");
    expect(result.kind === "schema" && result.schema).toEqual({ type: "object" });
    expect(capturedAccept).not.toBeNull();
    expect((capturedAccept ?? "").includes("application/json")).toBe(true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("CLI shows help when no arguments provided", async () => {
  const result = Bun.spawnSync({
    cmd: [process.execPath, join(import.meta.dir, "cli.ts")],
    stdout: "pipe",
    stderr: "pipe",
  });

  const stderr = new TextDecoder().decode(result.stderr);
  expect(result.exitCode).toBe(1);
  expect(stderr).toContain("No command specified");
});

test("config providers list command works", async () => {
  const result = Bun.spawnSync({
    cmd: [process.execPath, join(import.meta.dir, "cli.ts"), "config", "providers", "list"],
    stdout: "pipe",
    stderr: "pipe",
  });

  // Should succeed even with no providers configured (returns all 5 with configured: false)
  expect(result.exitCode).toBe(0);
  const output = new TextDecoder().decode(result.stdout);
  expect(JSON.parse(output)).toHaveProperty("providers");
});

test("config models list command works", async () => {
  const result = Bun.spawnSync({
    cmd: [process.execPath, join(import.meta.dir, "cli.ts"), "config", "models", "list"],
    stdout: "pipe",
    stderr: "pipe",
  });

  // Should succeed and return providers list
  expect(result.exitCode).toBe(0);
  const output = new TextDecoder().decode(result.stdout);
  const parsed = JSON.parse(output);
  expect(parsed).toHaveProperty("providers");
  expect(Array.isArray(parsed.providers)).toBe(true);
});
