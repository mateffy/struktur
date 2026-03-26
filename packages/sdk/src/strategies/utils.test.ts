import { test, expect } from "bun:test";
import type { Artifact } from "../types";
import type { JSONSchemaType } from "ajv";
import { batchArtifacts } from "../chunking/ArtifactBatcher";
import { serializeSchema, mergeUsage, getBatches, extractWithPrompt } from "./utils";

type Output = { title: string };

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: { title: { type: "string" } },
  required: ["title"],
  additionalProperties: false,
};

const makeArtifact = (id: string, text: string): Artifact => ({
  id,
  type: "text",
  raw: async () => Buffer.from(text),
  contents: [{ text }],
});

test("serializeSchema returns JSON", () => {
  expect(serializeSchema({ ok: true })).toBe('{"ok":true}');
});

test("mergeUsage sums token usage", () => {
  const usage = mergeUsage([
    { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
    { inputTokens: 4, outputTokens: 5, totalTokens: 9 },
  ]);

  expect(usage).toEqual({ inputTokens: 5, outputTokens: 7, totalTokens: 12 });
});

test("getBatches delegates to batchArtifacts", () => {
  const artifacts = [makeArtifact("a1", "hello"), makeArtifact("a2", "world")];
  const options = { maxTokens: 1 };

  expect(getBatches(artifacts, options)).toEqual(batchArtifacts(artifacts, options));
});

test("extractWithPrompt builds user content and returns result", async () => {
  const artifacts: Artifact[] = [
    {
      id: "a1",
      type: "image",
      raw: async () => Buffer.from(""),
      contents: [
        {
          text: "hello",
          media: [{ type: "image", base64: "abc" }],
        },
      ],
    },
  ];

  let receivedUser: unknown;
  const result = await extractWithPrompt<Output>({
    model: {},
    schema,
    system: "sys",
    user: "prompt",
    artifacts,
    execute: async (request) => {
      receivedUser = request.user;
      return {
        data: { title: "ok" },
        usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
      };
    },
  });

  expect(Array.isArray(receivedUser)).toBe(true);
  expect(result.data.title).toBe("ok");
});
