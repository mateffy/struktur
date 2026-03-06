import { test, expect } from "bun:test";
import type { Artifact } from "../types";
import { buildUserContent } from "./message";

const makeArtifact = (contents: Artifact["contents"]): Artifact => ({
  id: "a1",
  type: "text",
  raw: async () => Buffer.from(""),
  contents,
});

test("buildUserContent returns text when no images", () => {
  const artifacts = [makeArtifact([{ text: "hello" }])];
  const content = buildUserContent("prompt", artifacts);

  expect(content).toBe("prompt");
});

test("buildUserContent appends images in order", () => {
  const artifacts: Artifact[] = [
    makeArtifact([
      { media: [{ type: "image", base64: "base" }] },
      { media: [{ type: "image", url: "https://example.com/img.png" }] },
    ]),
    {
      id: "a2",
      type: "image",
      raw: async () => Buffer.from(""),
      contents: [{ media: [{ type: "image", contents: Buffer.from([1]) }] }],
    },
  ];

  const content = buildUserContent("prompt", artifacts);
  expect(Array.isArray(content)).toBe(true);

  if (Array.isArray(content)) {
    expect(content[0]).toEqual({ type: "text", text: "prompt" });
    expect(content[1]).toEqual({ type: "image", image: "base" });
    expect(content[2]).toEqual({ type: "image", image: "https://example.com/img.png" });
    expect(content[3]).toEqual({ type: "image", image: Buffer.from([1]) });
  }
});
