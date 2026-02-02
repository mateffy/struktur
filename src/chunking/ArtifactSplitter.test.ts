import { test, expect } from "bun:test";
import type { Artifact } from "../types";
import { splitArtifact } from "./ArtifactSplitter";

const baseArtifact = (text: string): Artifact => ({
  id: "artifact-1",
  type: "text",
  raw: async () => Buffer.from(text),
  contents: [{ text }],
});

test("splitArtifact splits large text into chunks", () => {
  const artifact = baseArtifact("abcdefghijklmnopqrst");
  const chunks = splitArtifact(artifact, { maxTokens: 2 });

  expect(chunks.length).toBe(3);
  expect(chunks[0]?.contents[0]?.text).toBe("abcdefgh");
  expect(chunks[1]?.contents[0]?.text).toBe("ijklmnop");
  expect(chunks[2]?.contents[0]?.text).toBe("qrst");
});

test("splitArtifact keeps media on first text chunk", () => {
  const artifact: Artifact = {
    id: "artifact-2",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [
      {
        text: "abcdefghijklmnopqrst",
        media: [{ type: "image", url: "https://example.com/x.png" }],
      },
    ],
  };

  const chunks = splitArtifact(artifact, { maxTokens: 2 });
  expect(chunks[0]?.contents[0]?.media?.length).toBe(1);
  expect(chunks[1]?.contents[0]?.media).toBeUndefined();
});
