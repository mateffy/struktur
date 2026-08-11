import { test, expect } from "bun:test";
import { rm } from "node:fs/promises";
import { join } from "node:path";

// Allow up to 60s for extraction tests that make real LLM calls
test.timeout = 60_000;

const distPath = join(import.meta.dir, "..", "dist", "cli.js");

// Skip format tests if dist/cli.js is not built
const hasDist = await Bun.file(distPath).exists();

const runCli = (args: string[]) => {
  return Bun.spawnSync({
    cmd: [process.execPath, distPath, ...args],
    stdout: "pipe",
    stderr: "pipe",
  });
};

test("--format json emits NDJSON events on stderr for extract with file input", async () => {
  if (!hasDist) {
    console.warn("Skipping: dist/cli.js not built. Run 'bun run build' in packages/cli first.");
    return;
  }

  const tmpPath = join(import.meta.dir, `test-format-${crypto.randomUUID()}.txt`);
  await Bun.write(tmpPath, "Invoice #12345\nTotal: $99.00");

  try {
    const result = runCli([
      "extract",
      "--input",
      tmpPath,
      "--format",
      "json",
      "--strategy",
      "simple",
      "--schema-json",
      '{"type":"object","properties":{"invoiceNumber":{"type":"string"},"total":{"type":"number"}}}',
      "--model",
      "openai/gpt-4.1-mini",
    ]);

    expect(result.exitCode).toBe(0);
    const stderr = new TextDecoder().decode(result.stderr);
    const stdout = new TextDecoder().decode(result.stdout);

    // stdout may contain duplicate JSON output (console.log + writeOutput both write to stdout)
    // Find the first valid JSON object in stdout
    const firstJsonMatch = stdout.match(/\{[\s\S]*?\}/);
    expect(firstJsonMatch).not.toBeNull();
    expect(() => JSON.parse(firstJsonMatch![0])).not.toThrow();

    // stderr should contain NDJSON lines with event field
    const lines = stderr
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    expect(lines.length).toBeGreaterThan(0);

    for (const line of lines) {
      // Some lines may be non-JSON (e.g. agent internal logs); skip those
      try {
        const parsed = JSON.parse(line);
        if (parsed && typeof parsed === "object" && "event" in parsed) {
          expect(typeof parsed.event).toBe("string");
          expect(typeof parsed.timestamp).toBe("number");
        }
      } catch {
        // Non-JSON lines are acceptable in stderr (agent logs, etc.)
      }
    }

    // At least one line should be a valid event
    const eventLines = lines
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter((p) => p && typeof p === "object" && "event" in p);

    expect(eventLines.length).toBeGreaterThan(0);
    expect(eventLines.some((e) => e.event === "step")).toBe(true);
  } finally {
    await rm(tmpPath, { force: true }); // Best effort cleanup
  }
});

test("--format text preserves human TUI (no NDJSON events)", async () => {
  if (!hasDist) {
    console.warn("Skipping: dist/cli.js not built. Run 'bun run build' in packages/cli first.");
    return;
  }

  const tmpPath = join(import.meta.dir, `test-format-text-${crypto.randomUUID()}.txt`);
  await Bun.write(tmpPath, "hello world");

  try {
    const result = runCli([
      "extract",
      "--input",
      tmpPath,
      "--format",
      "text",
      "--strategy",
      "simple",
      "--schema-json",
      '{"type":"object","properties":{"x":{"type":"string"}}}',
      "--model",
      "openai/gpt-4.1-mini",
    ]);

    expect(result.exitCode).toBe(0);
    const stderr = new TextDecoder().decode(result.stderr);

    // stderr should NOT contain NDJSON event lines
    const lines = stderr
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const eventLines = lines
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter((p) => p && typeof p === "object" && "event" in p);

    expect(eventLines.length).toBe(0);
  } finally {
    await rm(tmpPath, { force: true });
  }
});

test("--format debug emits verbose debug NDJSON", async () => {
  if (!hasDist) {
    console.warn("Skipping: dist/cli.js not built. Run 'bun run build' in packages/cli first.");
    return;
  }

  const tmpPath = join(import.meta.dir, `test-format-debug-${crypto.randomUUID()}.txt`);
  await Bun.write(tmpPath, "hello world");

  try {
    const result = runCli([
      "extract",
      "--input",
      tmpPath,
      "--format",
      "debug",
      "--strategy",
      "simple",
      "--schema-json",
      '{"type":"object","properties":{"x":{"type":"string"}}}',
      "--model",
      "openai/gpt-4.1-mini",
    ]);

    expect(result.exitCode).toBe(0);
    const stderr = new TextDecoder().decode(result.stderr);

    const lines = stderr
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // debug format should have NDJSON lines with type field (the debug logger format)
    const eventLines = lines
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter((p) => p && typeof p === "object" && "type" in p);

    expect(eventLines.length).toBeGreaterThan(0);
    expect(eventLines.some((e) => e.type === "cli_init")).toBe(true);
  } finally {
    await rm(tmpPath, { force: true });
  }
});
