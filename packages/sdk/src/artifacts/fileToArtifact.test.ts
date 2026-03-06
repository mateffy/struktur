import { test, expect } from "bun:test";
import { fileToArtifact } from "./fileToArtifact";
import type { ArtifactType } from "../types";

test("fileToArtifact uses custom providers", async () => {
  const providers = {
    "text/plain": async (buffer: Buffer): Promise<{ id: string; type: ArtifactType; raw: () => Promise<Buffer>; contents: { text: string }[] }> => ({
      id: "a1",
      type: "text",
      raw: async () => buffer,
      contents: [{ text: buffer.toString() }],
    }),
  };

  const artifact = await fileToArtifact(Buffer.from("hello"), {
    mimeType: "text/plain",
    providers,
  });

  expect(artifact.id).toBe("a1");
  expect(artifact.contents[0]?.text).toBe("hello");
});

test("fileToArtifact falls back to text for text/* mime types", async () => {
  const artifact = await fileToArtifact(Buffer.from("hello world"), {
    mimeType: "text/plain",
  });

  expect(artifact.type).toBe("text");
  expect(artifact.contents[0]?.text).toBe("hello world");
});

test("fileToArtifact throws for unknown mime types", async () => {
  await expect(
    fileToArtifact(Buffer.from("test"), { mimeType: "application/unknown" })
  ).rejects.toThrow("No artifact provider registered");
});
