import { test, expect } from "bun:test";
import { buildDeduplicationPrompt } from "./DeduplicationPrompt";

test("buildDeduplicationPrompt includes keys format instructions", () => {
  const { system, user } = buildDeduplicationPrompt("{}", { items: [] });
  expect(system).toContain("keys");
  expect(user).toContain("duplicate");
});
