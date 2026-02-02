import { test, expect } from "bun:test";
import { buildDeduplicationPrompt } from "./DeduplicationPrompt";

test("buildDeduplicationPrompt includes tool example", () => {
  const { user } = buildDeduplicationPrompt("{}", { items: [] });
  expect(user).toContain("removeDuplicates");
});
