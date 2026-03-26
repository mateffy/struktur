import { test, expect } from "bun:test";
import { urlToArtifact } from "./urlToArtifact";

test("urlToArtifact fetches and builds artifact", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        id: "a1",
        type: "pdf",
        contents: [{ text: "hello" }],
      }),
      { status: 200 },
    )) as unknown as typeof fetch;

  const artifact = await urlToArtifact("https://example.com/artifact");
  const raw = await artifact.raw();

  expect(artifact.id).toBe("a1");
  expect(raw.toString()).toContain("hello");

  globalThis.fetch = originalFetch;
});
