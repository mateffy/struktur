import { test, expect } from "bun:test";
import { defaultArtifactProviders, type ArtifactProviders } from "./providers";

test("defaultArtifactProviders is an object", () => {
  expect(defaultArtifactProviders).toBeDefined();
  expect(typeof defaultArtifactProviders).toBe("object");
});

test("ArtifactProviders type accepts MIME type keys", () => {
  const providers: ArtifactProviders = {
    "application/pdf": async (buffer) => ({
      id: "pdf-1",
      type: "pdf",
      raw: async () => buffer,
      contents: [{ page: 1, text: "test" }],
    }),
  };
  expect(providers["application/pdf"]).toBeDefined();
});
