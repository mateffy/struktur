import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { spawn, type Subprocess } from "bun";

async function startServer(port: string, apiKey = ""): Promise<Subprocess> {
  const server = spawn({
    cmd: ["bun", "src/index.ts"],
    cwd: import.meta.dir + "/..",
    env: { ...process.env, PORT: port, API_KEY: apiKey },
    stdout: "pipe",
    stderr: "pipe",
  });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return server;
}

async function safeJson(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return { message: await response.text() };
}

describe("HTTP API - OpenAPI Documentation", () => {
  let server: Subprocess | null = null;
  const PORT = "3041";
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = await startServer(PORT);
  });

  afterAll(() => {
    server?.kill();
  });

  test("GET /openapi.json returns valid OpenAPI spec", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty("openapi");
    expect(data).toHaveProperty("info");
    expect(data).toHaveProperty("paths");
    expect(data.openapi).toBe("3.0.0");
  });

  test("OpenAPI spec has correct API info", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    expect(data.info.title).toBe("Struktur HTTP API");
    expect(data.info.version).toBe("1.2.1");
    expect(data.info.description).toContain("Struktur");
  });

  test("OpenAPI spec has all endpoints documented", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    expect(data.paths).toHaveProperty("/");
    expect(data.paths).toHaveProperty("/parse");
    expect(data.paths).toHaveProperty("/extract");
    expect(data.paths).toHaveProperty("/openapi.json");
  });

  test("OpenAPI spec has correct tags", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    expect(data.tags).toBeDefined();
    const tagNames = data.tags.map((t: any) => t.name);
    expect(tagNames).toContain("Info");
    expect(tagNames).toContain("Parse");
    expect(tagNames).toContain("Extract");
  });

  test("OpenAPI spec documents GET / endpoint", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    const getEndpoint = data.paths["/"].get;
    expect(getEndpoint).toBeDefined();
    expect(getEndpoint.tags).toContain("Info");
    expect(getEndpoint.responses[200]).toBeDefined();
    expect(getEndpoint.responses[200].content["application/json"]).toBeDefined();
  });

  test("OpenAPI spec documents POST /parse endpoint", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    const parseEndpoint = data.paths["/parse"].post;
    expect(parseEndpoint).toBeDefined();
    expect(parseEndpoint.tags).toContain("Parse");
    expect(parseEndpoint.requestBody).toBeDefined();
    expect(parseEndpoint.responses[200]).toBeDefined();
    expect(parseEndpoint.responses[400]).toBeDefined();
    expect(parseEndpoint.responses[500]).toBeDefined();
  });

  test("OpenAPI spec documents POST /extract endpoint", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    const extractEndpoint = data.paths["/extract"].post;
    expect(extractEndpoint).toBeDefined();
    expect(extractEndpoint.tags).toContain("Extract");
    expect(extractEndpoint.requestBody).toBeDefined();
    expect(extractEndpoint.responses[200]).toBeDefined();
    expect(extractEndpoint.responses[400]).toBeDefined();
    expect(extractEndpoint.responses[500]).toBeDefined();
  });

  test("OpenAPI spec includes Artifact schema", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    expect(data.components).toBeDefined();
    expect(data.components.schemas).toBeDefined();
    expect(data.components.schemas.Artifact).toBeDefined();
    expect(data.components.schemas.ArtifactContent).toBeDefined();
    expect(data.components.schemas.Media).toBeDefined();
  });

  test("OpenAPI spec includes request/response schemas", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    expect(data.components.schemas.ParseRequest).toBeDefined();
    expect(data.components.schemas.ExtractRequest).toBeDefined();
    expect(data.components.schemas.ArtifactsResponse).toBeDefined();
    expect(data.components.schemas.ExtractResponse).toBeDefined();
    expect(data.components.schemas.ErrorResponse).toBeDefined();
  });

  test("Artifact schema has correct structure", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    const artifactSchema = data.components.schemas.Artifact;
    expect(artifactSchema.type).toBe("object");
    expect(artifactSchema.properties).toHaveProperty("id");
    expect(artifactSchema.properties).toHaveProperty("type");
    expect(artifactSchema.properties).toHaveProperty("contents");
    expect(artifactSchema.properties).toHaveProperty("metadata");
  });

  test("Media schema has correct structure", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    const mediaSchema = data.components.schemas.Media;
    expect(mediaSchema.type).toBe("object");
    expect(mediaSchema.properties).toHaveProperty("type");
    expect(mediaSchema.properties).toHaveProperty("url");
    expect(mediaSchema.properties).toHaveProperty("base64");
    expect(mediaSchema.properties).toHaveProperty("width");
    expect(mediaSchema.properties).toHaveProperty("height");
  });

  test("ExtractRequest schema includes all strategies", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    const requestSchema = data.components.schemas.ExtractRequest;
    const strategyEnum = requestSchema.properties.strategy.enum;
    expect(strategyEnum).toContain("simple");
    expect(strategyEnum).toContain("parallel");
    expect(strategyEnum).toContain("sequential");
    expect(strategyEnum).toContain("agent");
  });

  test("OpenAPI spec has servers defined", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    const data = await response.json();
    
    expect(data.servers).toBeDefined();
    expect(data.servers.length).toBeGreaterThan(0);
    expect(data.servers[0].url).toContain("localhost");
  });
});

describe("HTTP API - Core Functionality", () => {
  let server: Subprocess | null = null;
  const PORT = "3042";
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = await startServer(PORT);
  });

  afterAll(() => {
    server?.kill();
  });

  test("GET / returns API info with correct structure", async () => {
    const response = await fetch(`${baseUrl}/`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("name", "struktur-http");
    expect(data).toHaveProperty("version");
    expect(data).toHaveProperty("endpoints");
    expect(data.endpoints).toHaveProperty("POST /parse");
    expect(data.endpoints).toHaveProperty("POST /extract");
  });

  test("CORS headers are present", async () => {
    const response = await fetch(`${baseUrl}/`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://example.com",
        "Access-Control-Request-Method": "POST",
      },
    });

    expect(response.headers.get("access-control-allow-origin")).toBeTruthy();
  });
});

describe("HTTP API - Authentication", () => {
  let server: Subprocess | null = null;
  const PORT = "3043";
  const API_KEY = "test-secret-key-123";
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = await startServer(PORT, API_KEY);
  });

  afterAll(() => {
    server?.kill();
  });

  test("Request without auth header returns 401", async () => {
    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(401);
    const data = await safeJson(response);
    expect(data.message).toContain("Missing Authorization");
  });

  test("Request with invalid auth format returns 401", async () => {
    const response = await fetch(`${baseUrl}/`, {
      headers: { Authorization: "Basic dGVzdA==" },
    });
    expect(response.status).toBe(401);
    const data = await safeJson(response);
    expect(data.message).toContain("Invalid Authorization");
  });

  test("Request with wrong API key returns 401", async () => {
    const response = await fetch(`${baseUrl}/`, {
      headers: { Authorization: "Bearer wrong-key" },
    });
    expect(response.status).toBe(401);
    const data = await safeJson(response);
    expect(data.message).toContain("Invalid API key");
  });

  test("Request with valid API key succeeds", async () => {
    const response = await fetch(`${baseUrl}/`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    expect(response.status).toBe(200);
  });

  test("OpenAPI endpoint is accessible without auth", async () => {
    const response = await fetch(`${baseUrl}/openapi.json`);
    expect(response.status).toBe(200);
  });
});

describe("HTTP API - Parse Endpoint", () => {
  let server: Subprocess | null = null;
  const PORT = "3044";
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = await startServer(PORT);
  });

  afterAll(() => {
    server?.kill();
  });

  test("POST /parse with text file returns valid artifacts", async () => {
    const formData = new FormData();
    const content = "Hello, this is a test file content!";
    const file = new File([content], "test.txt", { type: "text/plain" });
    formData.append("file", file);

    const response = await fetch(`${baseUrl}/parse`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("artifacts");
    expect(Array.isArray(data.artifacts)).toBe(true);
    expect(data.artifacts.length).toBeGreaterThan(0);
    
    const artifact = data.artifacts[0];
    expect(artifact).toHaveProperty("id");
    expect(artifact).toHaveProperty("type");
    expect(artifact).toHaveProperty("contents");
    expect(Array.isArray(artifact.contents)).toBe(true);
    expect(artifact.contents[0]).toHaveProperty("text");
  });

  test("POST /parse with images option", async () => {
    const formData = new FormData();
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    formData.append("file", file);
    formData.append("images", "true");

    const response = await fetch(`${baseUrl}/parse`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("artifacts");
  });

  test("POST /parse with screenshots and scale options", async () => {
    const formData = new FormData();
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    formData.append("file", file);
    formData.append("screenshots", "true");
    formData.append("screenshotScale", "2.0");
    formData.append("screenshotWidth", "1920");

    const response = await fetch(`${baseUrl}/parse`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("artifacts");
  });

  test("POST /parse with HTML file", async () => {
    const formData = new FormData();
    const html = "<!DOCTYPE html><html><body><h1>Test</h1></body></html>";
    const file = new File([html], "test.html", { type: "text/html" });
    formData.append("file", file);

    const response = await fetch(`${baseUrl}/parse`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("artifacts");
    expect(data.artifacts.length).toBeGreaterThan(0);
  });

  test("POST /parse without file returns error", async () => {
    const formData = new FormData();
    formData.append("wrongField", "value");

    const response = await fetch(`${baseUrl}/parse`, {
      method: "POST",
      body: formData,
    });
    
    expect(response.status).toBe(400);
  });

  test("POST /parse with non-multipart content returns error", async () => {
    const response = await fetch(`${baseUrl}/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: "test" }),
    });
    
    expect(response.status).toBe(400);
  });
});

describe("HTTP API - Extract Endpoint (JSON)", () => {
  let server: Subprocess | null = null;
  const PORT = "3045";
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = await startServer(PORT);
  });

  afterAll(() => {
    server?.kill();
  });

  test("POST /extract with missing model returns 400", async () => {
    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifacts: [{ id: "test", type: "text", contents: [{ text: "test" }] }],
        schema: { type: "object" },
      }),
    });

    expect(response.status).toBe(400);
  });

  test("POST /extract with missing schema/fields returns 400", async () => {
    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifacts: [{ id: "test", type: "text", contents: [{ text: "test" }] }],
        model: "openai/gpt-4",
      }),
    });

    expect(response.status).toBe(400);
  });

  test("POST /extract with invalid model format returns error", async () => {
    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifacts: [{ id: "test", type: "text", contents: [{ text: "test" }] }],
        schema: { type: "object" },
        model: "invalid-model-format",
      }),
    });

    expect(response.status).toBe(500);
  });

  test("POST /extract with invalid provider returns error", async () => {
    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifacts: [{ id: "test", type: "text", contents: [{ text: "test" }] }],
        schema: { type: "object" },
        model: "unknown-provider/model",
      }),
    });

    expect(response.status).toBe(500);
  });

  test("POST /extract with unsupported strategy returns error", async () => {
    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifacts: [{ id: "test", type: "text", contents: [{ text: "test" }] }],
        schema: { type: "object" },
        model: "openai/gpt-4",
        strategy: "invalid-strategy",
      }),
    });

    expect(response.status).toBe(500);
  });

  test("POST /extract accepts valid strategy names", async () => {
    const strategies = [
      "simple",
      "parallel",
      "sequential",
      "parallelAutoMerge",
      "sequentialAutoMerge",
      "doublePass",
      "doublePassAutoMerge",
    ];

    for (const strategy of strategies) {
      const response = await fetch(`${baseUrl}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifacts: [{ id: "test", type: "text", contents: [{ text: "test" }] }],
          schema: { type: "object", properties: { name: { type: "string" } } },
          model: "openai/gpt-4",
          strategy,
        }),
      });

      // All should accept the request, but fail due to missing API key
      expect([200, 500]).toContain(response.status);
    }
  });

  test("POST /extract with invalid artifacts JSON returns 400", async () => {
    const formData = new FormData();
    formData.append("artifacts", "invalid json");
    formData.append("model", "openai/gpt-4");
    formData.append("schema", JSON.stringify({ type: "object" }));

    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(400);
  });

  test("POST /extract with invalid schema JSON returns 400", async () => {
    const formData = new FormData();
    formData.append("artifacts", JSON.stringify([{ id: "test", type: "text", contents: [{ text: "test" }] }]));
    formData.append("model", "openai/gpt-4");
    formData.append("schema", "invalid json");

    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(400);
  });

  test("POST /extract with fields shorthand instead of schema", async () => {
    const formData = new FormData();
    formData.append("artifacts", JSON.stringify([{ id: "test", type: "text", contents: [{ text: "test" }] }]));
    formData.append("model", "openai/gpt-4");
    formData.append("fields", "name,email,phone");

    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      body: formData,
    });

    // Should either succeed or fail due to missing API key
    expect([200, 500]).toContain(response.status);
  });

  test("POST /extract with chunkSize parameter", async () => {
    const formData = new FormData();
    formData.append("artifacts", JSON.stringify([{ id: "test", type: "text", contents: [{ text: "test" }] }]));
    formData.append("model", "openai/gpt-4");
    formData.append("schema", JSON.stringify({ type: "object" }));
    formData.append("chunkSize", "5000");
    formData.append("strategy", "parallel");

    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      body: formData,
    });

    expect([200, 500]).toContain(response.status);
  });

  test("POST /extract with strict validation parameter", async () => {
    const formData = new FormData();
    formData.append("artifacts", JSON.stringify([{ id: "test", type: "text", contents: [{ text: "test" }] }]));
    formData.append("model", "openai/gpt-4");
    formData.append("schema", JSON.stringify({ type: "object" }));
    formData.append("strict", "true");

    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      body: formData,
    });

    expect([200, 500]).toContain(response.status);
  });
});

describe("HTTP API - Extract with File Upload", () => {
  let server: Subprocess | null = null;
  const PORT = "3046";
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = await startServer(PORT);
  });

  afterAll(() => {
    server?.kill();
  });

  test("POST /extract with file instead of artifacts", async () => {
    const formData = new FormData();
    const file = new File(["John Doe works at Acme Corp"], "resume.txt", { type: "text/plain" });
    formData.append("file", file);
    formData.append("model", "openai/gpt-4");
    formData.append("schema", JSON.stringify({
      type: "object",
      properties: {
        name: { type: "string" },
        company: { type: "string" }
      }
    }));
    formData.append("images", "false");
    formData.append("screenshots", "false");

    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      body: formData,
    });

    if (response.status === 200) {
      const data = await response.json();
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("usage");
    } else {
      expect(response.status).toBe(500);
    }
  });

  test("POST /extract with file and images option", async () => {
    const formData = new FormData();
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    formData.append("file", file);
    formData.append("model", "openai/gpt-4");
    formData.append("fields", "content");
    formData.append("images", "true");

    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      body: formData,
    });

    expect([200, 500]).toContain(response.status);
  });
});

describe("HTTP API - Error Handling", () => {
  let server: Subprocess | null = null;
  const PORT = "3047";
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = await startServer(PORT);
  });

  afterAll(() => {
    server?.kill();
  });

  test("404 for unknown endpoint", async () => {
    const response = await fetch(`${baseUrl}/unknown-endpoint`);
    expect(response.status).toBe(404);
  });

  test("POST to GET endpoint returns 404", async () => {
    const response = await fetch(`${baseUrl}/`, { method: "POST" });
    expect(response.status).toBe(404);
  });

  test("Malformed JSON in extract request returns error", async () => {
    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json",
    });

    expect([400, 500]).toContain(response.status);
  });
});

describe("HTTP API - Artifact Serialization", () => {
  let server: Subprocess | null = null;
  const PORT = "3048";
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = await startServer(PORT);
  });

  afterAll(() => {
    server?.kill();
  });

  test("Parsed artifacts have correct structure", async () => {
    const formData = new FormData();
    const html = "<!DOCTYPE html><html><body><h1>Test</h1></body></html>";
    const file = new File([html], "test.html", { type: "text/html" });
    formData.append("file", file);

    const response = await fetch(`${baseUrl}/parse`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("artifacts");
    expect(Array.isArray(data.artifacts)).toBe(true);
    
    for (const artifact of data.artifacts) {
      expect(artifact).toHaveProperty("id");
      expect(artifact).toHaveProperty("type");
      expect(artifact).toHaveProperty("contents");
      expect(Array.isArray(artifact.contents)).toBe(true);
      
      for (const content of artifact.contents) {
        if (content.text !== undefined) {
          expect(typeof content.text).toBe("string");
        }
        if (content.page !== undefined) {
          expect(typeof content.page).toBe("number");
        }
        if (content.media) {
          expect(Array.isArray(content.media)).toBe(true);
          for (const media of content.media) {
            expect(media).toHaveProperty("type");
          }
        }
      }
    }
  });

  test("Artifacts with metadata are preserved", async () => {
    const formData = new FormData();
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    formData.append("file", file);

    const response = await fetch(`${baseUrl}/parse`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    
    for (const artifact of data.artifacts) {
      if (artifact.metadata) {
        expect(typeof artifact.metadata).toBe("object");
      }
    }
  });

  test("Large text files are parsed correctly", async () => {
    const formData = new FormData();
    const largeContent = "Line 1\n".repeat(1000);
    const file = new File([largeContent], "large.txt", { type: "text/plain" });
    formData.append("file", file);

    const response = await fetch(`${baseUrl}/parse`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("artifacts");
    expect(data.artifacts.length).toBeGreaterThan(0);
    
    let totalText = "";
    for (const artifact of data.artifacts) {
      for (const content of artifact.contents) {
        if (content.text) {
          totalText += content.text;
        }
      }
    }
    expect(totalText.length).toBeGreaterThan(0);
  });
});

describe("HTTP API - Request Validation", () => {
  let server: Subprocess | null = null;
  const PORT = "3049";
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = await startServer(PORT);
  });

  afterAll(() => {
    server?.kill();
  });

  test("POST /extract with empty artifacts array", async () => {
    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifacts: [],
        schema: { type: "object" },
        model: "openai/gpt-4",
      }),
    });

    expect([200, 400, 500]).toContain(response.status);
  });

  test("POST /extract with malformed artifacts structure", async () => {
    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifacts: "not an array",
        schema: { type: "object" },
        model: "openai/gpt-4",
      }),
    });

    expect([400, 500]).toContain(response.status);
  });

  test("POST /extract with valid artifacts structure", async () => {
    const response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifacts: [
          { id: "art1", type: "text", contents: [{ text: "content 1" }] },
          { id: "art2", type: "html", contents: [{ text: "content 2", page: 1 }] },
        ],
        schema: { type: "object", properties: { items: { type: "array" } } },
        model: "openai/gpt-4",
        strategy: "simple",
      }),
    });

    expect([200, 500]).toContain(response.status);
  });
});
