import { test, expect } from "bun:test";
import { fileToArtifact } from "./fileToArtifact";
import { registerArtifactProvider, clearArtifactProviders } from "./providers";

test("fileToArtifact uses registered provider", async () => {
  clearArtifactProviders();
  registerArtifactProvider("text/plain", async (buffer) => ({
    id: "a1",
    type: "text",
    raw: async () => buffer,
    contents: [{ text: buffer.toString() }],
  }));

  const artifact = await fileToArtifact(Buffer.from("hello"), {
    mimeType: "text/plain",
  });

  expect(artifact.id).toBe("a1");
  expect(artifact.contents[0]?.text).toBe("hello");
});
