import { test, expect } from "bun:test";
import type { Artifact } from "./types";
import {
  countArtifactTokens,
  estimateTextTokens,
  estimateImageTokens,
  countContentTokens,
} from "./tokenization";

test("estimateTextTokens uses default ratio", () => {
  expect(estimateTextTokens("abcd")).toBe(1);
  expect(estimateTextTokens("abcdefgh")).toBe(2);
});

test("estimateTextTokens uses custom ratio", () => {
  expect(estimateTextTokens("abcd", { textTokenRatio: 2 })).toBe(2);
  expect(estimateTextTokens("abcdefgh", { textTokenRatio: 2 })).toBe(4);
});

test("estimateImageTokens uses default image tokens", () => {
  expect(estimateImageTokens({ type: "image" })).toBe(1000);
});

test("estimateImageTokens uses custom image tokens", () => {
  expect(estimateImageTokens({ type: "image" }, { defaultImageTokens: 500 })).toBe(500);
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

test("countContentTokens counts text tokens", () => {
  const tokens = countContentTokens({ text: "abcdefgh" });
  expect(tokens).toBe(2);
});

test("countContentTokens counts image tokens", () => {
  const tokens = countContentTokens({ media: [{ type: "image" }] });
  expect(tokens).toBe(1000);
});

test("countContentTokens counts image text tokens", () => {
  const tokens = countContentTokens({
    media: [{ type: "image", text: "abcd" }],
  });
  expect(tokens).toBe(1001);
});

test("countContentTokens sums multiple images", () => {
  const tokens = countContentTokens({
    media: [{ type: "image" }, { type: "image" }],
  });
  expect(tokens).toBe(2000);
});

test("countContentTokens handles empty content", () => {
  const tokens = countContentTokens({});
  expect(tokens).toBe(0);
});

test("countArtifactTokens sums multiple contents", () => {
  const artifact: Artifact = {
    id: "a1",
    type: "text",
    raw: async () => Buffer.from(""),
    contents: [{ text: "abcd" }, { text: "efgh" }, { media: [{ type: "image" }] }],
  };

  const tokens = countArtifactTokens(artifact);
  expect(tokens).toBe(1002);
});

test("countArtifactTokens with custom options", () => {
  const artifact: Artifact = {
    id: "a1",
    type: "text",
    raw: async () => Buffer.from(""),
    contents: [{ text: "abcdefgh" }, { media: [{ type: "image" }] }],
  };

  const tokens = countArtifactTokens(artifact, {
    textTokenRatio: 2,
    defaultImageTokens: 500,
  });

  expect(tokens).toBe(504);
});
