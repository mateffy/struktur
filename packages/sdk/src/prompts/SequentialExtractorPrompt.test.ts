import { test, expect } from "bun:test";
import { buildSequentialPrompt } from "./SequentialExtractorPrompt";
import type { Artifact } from "../types";

const artifacts: Artifact[] = [
  {
    id: "a1",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [{ page: 1, text: "Hello" }],
  },
];

test("buildSequentialPrompt embeds previous data", () => {
  const { system, user } = buildSequentialPrompt(
    artifacts,
    '{"type":"object"}',
    '{"existing":true}',
  );

  expect(system).toContain("JSON schema");
  expect(user).toContain("<previous-data>");
  expect(user).toContain("existing");
});
