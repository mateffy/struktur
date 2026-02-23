import { test, expect } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runAuthCommand, runExtractCommand } from "./cli";
import { loadSchema } from "./cli/shared";
import type { Artifact } from "./types";

const makeTempPath = (name: string) => {
  return join(tmpdir(), `struktur-${name}-${crypto.randomUUID()}.json`);
};

test("verify command validates artifact JSON", async () => {
  const inputPath = makeTempPath("artifact");
  await Bun.write(
    inputPath,
    JSON.stringify({ id: "a1", type: "text", contents: [{ text: "hello" }] })
  );

  const result = Bun.spawnSync({
    cmd: [process.execPath, "src/cli.ts", "verify", "--input", inputPath],
    stdout: "pipe",
    stderr: "pipe",
  });

  const output = new TextDecoder().decode(result.stdout);
  expect(result.exitCode).toBe(0);
  expect(output).toContain("\"valid\": true");
});

test("extract writes JSON output with injected deps", async () => {
  const outputPath = makeTempPath("output");
  const options = {
    text: "hello world",
    "schema-json": JSON.stringify({ type: "object", properties: { ok: { type: "boolean" } } }),
    model: "openai/gpt-5",
    output: outputPath,
  } as Record<string, string | boolean>;

  await runExtractCommand(options, {
    resolveModel: async () => ({}),
    createStrategy: () => ({
      name: "stub",
      run: async () => ({
        data: { ok: true },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      }),
    }),
    extract: (async () => ({
      data: { ok: true },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    })) as typeof import("./extract").extract,
  });

  const output = await Bun.file(outputPath).text();
  expect(JSON.parse(output)).toEqual({ ok: true });
});

test("extract auto-detects piped stdin", async () => {
  const options = {
    "schema-json": JSON.stringify({ type: "object", properties: { ok: { type: "boolean" } } }),
    model: "openai/gpt-5",
  } as Record<string, string | boolean>;

  let receivedArtifacts: Artifact[] | undefined;

  await runExtractCommand(options, {
    resolveModel: async () => ({}),
    createStrategy: () => ({
      name: "stub",
      run: async () => ({
        data: { ok: true },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      }),
    }),
    extract: (async ({ artifacts }) => {
      receivedArtifacts = artifacts as Artifact[];
      return {
        data: { ok: true },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      };
    }) as typeof import("./extract").extract,
    readStdinText: async () => "hello from stdin",
    stdinIsTTY: false,
  });

  expect(receivedArtifacts?.[0]?.type).toBe("text");
  expect(receivedArtifacts?.[0]?.contents?.[0]?.text).toBe("hello from stdin");
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
    const lower = Object.entries(record).find(
      ([key]) => key.toLowerCase() === name.toLowerCase(),
    );
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
    const schema = await loadSchema({
      schema: "https://example.com/schema.json",
    });
    expect(schema).toEqual({ type: "object" });
    expect(capturedAccept).not.toBeNull();
    expect((capturedAccept ?? "").includes("application/json")).toBe(true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("extract uses configured default model", async () => {
  const outputPath = makeTempPath("output-default");
  const options = {
    text: "hello world",
    "schema-json": JSON.stringify({ type: "object", properties: { ok: { type: "boolean" } } }),
    output: outputPath,
  } as Record<string, string | boolean>;

  let resolvedModel: string | undefined;

  await runExtractCommand(options, {
    resolveDefaultModel: async () => "openai/gpt-4o-mini",
    resolveModel: async (model) => {
      resolvedModel = model;
      return {};
    },
    createStrategy: () => ({
      name: "stub",
      run: async () => ({
        data: { ok: true },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      }),
    }),
    extract: (async () => ({
      data: { ok: true },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    })) as typeof import("./extract").extract,
  });

  expect(resolvedModel).toBe("openai/gpt-4o-mini");
  const output = await Bun.file(outputPath).text();
  expect(JSON.parse(output)).toEqual({ ok: true });
});

test("auth default <provider> chooses cheapest model", async () => {
  let storedDefault: string | undefined;

  await runAuthCommand(
    ["default", "openai"],
    {},
    {
      listStoredProviders: async () => [{ provider: "openai", storage: "file" }],
      resolveCheapestModel: async () => "gpt-4o-mini",
      setDefaultModel: async (model) => {
        storedDefault = model;
        return model;
      },
    }
  );

  expect(storedDefault).toBe("openai/gpt-4o-mini");
});

test("extract shows detailed schema validation errors", async () => {
  const { SchemaValidationError } = await import("./validation/validator");
  const outputPath = makeTempPath("output-err");
  const options = {
    text: "hello world",
    "schema-json": JSON.stringify({
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    }),
    model: "openai/gpt-5",
    output: outputPath,
  } as Record<string, string | boolean>;

  const validationErrors = [
    { keyword: "required", message: "must have required property 'name'", instancePath: "", schemaPath: "#/required", params: { missingProperty: "name" } },
  ];
  const schemaError = new SchemaValidationError("Schema validation failed", validationErrors as never);

  await expect(runExtractCommand(options, {
    resolveModel: async () => ({}),
    createStrategy: () => ({
      name: "stub",
      run: async () => ({
        data: null,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        error: schemaError,
      }),
    }),
    extract: (async () => ({
      data: null as unknown,
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      error: schemaError,
    })) as typeof import("./extract").extract,
  })).rejects.toThrow(/must have required property 'name'/);
});
