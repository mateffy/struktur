import { test, expect } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runAuthCommand, runExtractCommand } from "./cli";
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
