import { test, expect } from "bun:test";
import { buildExtractorPrompt } from "./ExtractorPrompt";
import type { Artifact } from "../types";

const artifacts: Artifact[] = [
  {
    id: "a1",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [{ page: 1, text: "Hello", media: [{ type: "image", url: "https://x" }] }],
  },
];

test("buildExtractorPrompt includes schema and artifacts", () => {
  const { system, user } = buildExtractorPrompt(artifacts, '{"type":"object"}');
  expect(system).toContain("<json-schema>");
  expect(user).toContain("<artifacts>");
  expect(user).toContain("<image");
});
