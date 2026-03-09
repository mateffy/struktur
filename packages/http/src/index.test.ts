import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { spawn, type Subprocess } from "bun";

describe("HTTP API", () => {
  let server: Subprocess | null = null;

  beforeAll(async () => {
    server = spawn({
      cmd: ["bun", "src/index.ts"],
      cwd: import.meta.dir + "/..",
      env: { ...process.env, PORT: "3032", API_KEY: "" },
      stdout: "pipe",
      stderr: "pipe",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(() => {
    server?.kill();
  });

  test("GET / returns API info", async () => {
    const response = await fetch("http://localhost:3032/");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("name", "struktur-http");
    expect(data).toHaveProperty("endpoints");
  });

  test("POST /parse with text file returns artifacts", async () => {
    const formData = new FormData();
    const file = new File(["Hello, world!"], "test.txt", { type: "text/plain" });
    formData.append("file", file);

    const response = await fetch("http://localhost:3032/parse", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("artifacts");
    expect(Array.isArray(data.artifacts)).toBe(true);
    expect(data.artifacts.length).toBeGreaterThan(0);
    expect(data.artifacts[0]).toHaveProperty("type", "text");
  });

  test("POST /extract with missing artifacts returns 400", async () => {
    const response = await fetch("http://localhost:3032/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-4" }),
    });

    expect(response.status).toBe(400);
  });

  test("POST /extract with missing schema returns 400", async () => {
    const response = await fetch("http://localhost:3032/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifacts: [{ id: "test", type: "text", contents: [{ text: "test" }] }],
        model: "openai/gpt-4",
      }),
    });

    expect(response.status).toBe(400);
  });
});
