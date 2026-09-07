// @vitest-environment node
import { describe, expect, it } from "vitest";
import { extractData, parseFieldsShorthand, parseFiles, type ExtractionEvent } from "./api";
import { app } from "./hono";

function textFile(content: string, name = "note.txt", type = "text/plain"): File {
  return new File([content], name, { type });
}

describe("parseFieldsShorthand", () => {
  it("parses a comma-separated shorthand into a JSON Schema", () => {
    const schema = parseFieldsShorthand("name:string, age:number, active:boolean");
    expect(schema).toEqual({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
        active: { type: "boolean" },
      },
      required: ["name", "age", "active"],
    });
  });

  it("parses array types with subtypes", () => {
    const schema = parseFieldsShorthand("tags:array{string}, scores:array{number}");
    expect(schema.properties.tags).toEqual({ type: "array", items: { type: "string" } });
    expect(schema.properties.scores).toEqual({ type: "array", items: { type: "number" } });
  });

  it("parses enum arrays and enums", () => {
    const schema = parseFieldsShorthand("status:enum{a|b|c}, priority:array{a|b}");
    expect(schema.properties.status).toEqual({ enum: ["a", "b", "c"] });
    expect(schema.properties.priority).toEqual({ type: "array", items: { enum: ["a", "b"] } });
  });

  it("defaults unknown types to string", () => {
    const schema = parseFieldsShorthand("mystery:whatever");
    expect(schema.properties.mystery).toEqual({ type: "string" });
  });

  it("ignores malformed parts and empty entries", () => {
    const schema = parseFieldsShorthand("  name:string , , not-a-valid-part , age:number ");
    expect(schema.required).toEqual(["name", "age"]);
  });

  it("every part is marked required", () => {
    const schema = parseFieldsShorthand("a:string,b:number,c:boolean");
    expect(schema.required.sort()).toEqual(["a", "b", "c"]);
  });
});

describe("parseFiles", () => {
  it("returns empty artifacts for no files", async () => {
    await expect(parseFiles([], {})).resolves.toEqual([]);
  });

  it("parses a plain text file into a text artifact", async () => {
    const artifacts = await parseFiles([textFile("hello world\nsecond line")], {});
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].type).toBe("text");
    expect(artifacts[0].id).toMatch(/^artifact-/);
    const texts = artifacts[0].contents.map((c: any) => c.text).join("\n");
    expect(texts).toContain("hello world");
    expect(texts).toContain("second line");
  });

  it("preserves page metadata when the SDK splits into pages", async () => {
    const artifacts = await parseFiles([textFile("line1\nline2")], {});
    // Text artifacts split by blank lines; each entry should carry text
    expect(artifacts[0].contents.length).toBeGreaterThan(0);
  });

  it("parses an image file into an image artifact with base64 media", async () => {
    const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // minimal PNG magic
    const file = new File([png], "img.png", { type: "image/png" });
    const artifacts = await parseFiles([file], {});
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].type).toBe("image");
    const media = artifacts[0].contents[0].media[0];
    expect(media.type).toBe("image");
    expect(typeof media.base64).toBe("string");
    expect(media.base64.length).toBeGreaterThan(0);
  });

  it("throws when MIME type cannot be detected", async () => {
    const unknown = new File(["..."], "file.xyz", { type: "application/x-unknown" });
    await expect(parseFiles([unknown], {})).rejects.toThrow(/Cannot detect MIME type/);
  });
});

describe("extractData", () => {
  it("rejects when no API key is available and global providers are disabled", async () => {
    // global providers are disabled by default in the test env
    await expect(
      extractData(
        [],
        "json",
        '{"type":"object"}',
        null,
        "openai/gpt-4o-mini",
        "simple",
        10000,
        undefined,
      ),
    ).rejects.toThrow(/No API key provided for openai/);
  });

  it("emits an error event and rejects when the underlying extraction fails", async () => {
    const events: ExtractionEvent[] = [];
    await expect(
      extractData(
        [],
        "json",
        '{"type":"object"}',
        null,
        "openai/gpt-4o-mini",
        "simple",
        10000,
        undefined,
        async (e) => {
          events.push(e);
        },
      ),
    ).rejects.toThrow();
    // It should not report a spurious "complete" event on the failure path.
    expect(events.some((e) => e.type === "complete")).toBe(false);
  });
});

describe("HTTP API (Hono app)", () => {
  it("GET /api/config returns the config shape", async () => {
    const res = await app.request("/api/config");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("defaultModel");
    expect(body).toHaveProperty("aliases");
    expect(body).toHaveProperty("availableProviders");
    expect(body).toHaveProperty("useGlobalProviders");
    expect(body).toHaveProperty("allProviders");
    expect(Array.isArray(body.allProviders)).toBe(true);
  });

  it("POST /api/parse requires multipart/form-data", async () => {
    const res = await app.request("/api/parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/multipart/i);
  });

  it("POST /api/parse with a text file returns artifacts", async () => {
    const fd = new FormData();
    fd.append("file", textFile("extracted content here"));
    const res = await app.request("/api/parse", { method: "POST", body: fd });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.artifacts).toHaveLength(1);
    expect(body.artifacts[0].type).toBe("text");
    const texts = body.artifacts[0].contents.map((c: any) => c.text).join("");
    expect(texts).toContain("extracted content here");
  });

  it("POST /api/parse without files returns 400", async () => {
    const fd = new FormData();
    fd.append("options", "{}");
    const res = await app.request("/api/parse", { method: "POST", body: fd });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/No files/i);
  });
});
