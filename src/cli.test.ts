import { test, expect } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runExtractCommand } from "./cli";

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

test("extract-file writes JSON output with injected deps", async () => {
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
