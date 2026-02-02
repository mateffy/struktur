import { test, expect } from "bun:test";
import type { Artifact } from "../types";
import { registerArtifactProvider, getArtifactProvider, clearArtifactProviders } from "./providers";

test("artifact providers can be registered and cleared", async () => {
  const provider = async (): Promise<Artifact> => ({
    id: "a1",
    type: "text",
    raw: async () => Buffer.from(""),
    contents: [{ text: "hello" }],
  });

  registerArtifactProvider("text/plain", provider);
  expect(getArtifactProvider("text/plain")).toBe(provider);

  clearArtifactProviders();
  expect(getArtifactProvider("text/plain")).toBeUndefined();
});
