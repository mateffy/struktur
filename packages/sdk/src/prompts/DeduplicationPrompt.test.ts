import { test, expect } from "bun:test";
import { buildDeduplicationPrompt } from "./DeduplicationPrompt";

test("buildDeduplicationPrompt includes keys format instructions", () => {
  const { system, user } = buildDeduplicationPrompt("{}", { items: [] });
  expect(system).toContain("keys");
  expect(user).toContain("duplicate");
});

test("buildDeduplicationPrompt embeds schema", () => {
  const schema = '{"type":"object","properties":{"items":{"type":"array"}}}';
  const { user } = buildDeduplicationPrompt(schema, { items: [] });
  expect(user).toContain(schema);
});

test("buildDeduplicationPrompt embeds data", () => {
  const data = { items: [{ id: 1 }, { id: 1 }] };
  const { user } = buildDeduplicationPrompt("{}", data);
  expect(user).toContain(JSON.stringify(data));
});

test("buildDeduplicationPrompt uses default example keys in example", () => {
  const { user } = buildDeduplicationPrompt("{}", { items: [] });
  expect(user).toContain("items.3");
  expect(user).toContain("items.5");
});

test("buildDeduplicationPrompt includes thinking section", () => {
  const { system } = buildDeduplicationPrompt("{}", { items: [] });
  expect(system).toContain("<thinking>");
});

test("buildDeduplicationPrompt includes rules section", () => {
  const { system } = buildDeduplicationPrompt("{}", { items: [] });
  expect(system).toContain("<rules>");
});

test("buildDeduplicationPrompt includes task", () => {
  const { user } = buildDeduplicationPrompt("{}", { items: [] });
  expect(user).toContain("<task>");
});
