import { test, expect } from "bun:test";
import { buildParallelMergerPrompt } from "./ParallelMergerPrompt";

test("buildParallelMergerPrompt formats json objects", () => {
  const { user } = buildParallelMergerPrompt("{}", [{ a: 1 }, { b: 2 }]);
  expect(user).toContain("<json-object>");
  expect(user).toContain("\"a\"");
});
