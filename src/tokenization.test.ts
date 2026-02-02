import { test, expect } from "bun:test";
import type { Artifact } from "./types";
import {
  countArtifactTokens,
  estimateTextTokens,
  estimateImageTokens,
} from "./tokenization";

test("estimateTextTokens uses default ratio", () => {
  expect(estimateTextTokens("abcd")).toBe(1);
  expect(estimateTextTokens("abcdefgh")).toBe(2);
});

test("estimateImageTokens uses default image tokens", () => {
  expect(estimateImageTokens({ type: "image" })).toBe(1000);
});

test("countArtifactTokens honors artifact.tokens override", () => {
  const artifact: Artifact = {
    id: "a1",
    type: "text",
    raw: async () => Buffer.from(""),
    contents: [{ text: "hello" }],
    tokens: 42,
  };

  expect(countArtifactTokens(artifact)).toBe(42);
});

test("countArtifactTokens sums text and media tokens", () => {
  const artifact: Artifact = {
    id: "a2",
    type: "text",
    raw: async () => Buffer.from(""),
    contents: [
      {
        text: "abcdefgh",
        media: [{ type: "image" }],
      },
    ],
  };

  const tokens = countArtifactTokens(artifact);
  expect(tokens).toBe(1002);
});
