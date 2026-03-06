import { test, expect } from "bun:test";
import type { Artifact } from "../types";
import { batchArtifacts } from "./ArtifactBatcher";

const makeArtifact = (id: string, text: string): Artifact => ({
  id,
  type: "text",
  raw: async () => Buffer.from(text),
  contents: [{ text }],
});

test("batchArtifacts respects maxTokens", () => {
  const artifacts = [
    makeArtifact("a1", "abcdefgh"),
    makeArtifact("a2", "abcdefgh"),
  ];

  const batches = batchArtifacts(artifacts, { maxTokens: 2 });
  expect(batches.length).toBe(2);
  expect(batches[0]?.length).toBe(1);
  expect(batches[1]?.length).toBe(1);
});
