import { test, expect } from "bun:test";
import { extractReasoningText } from "./AgentStrategy";

test("extractReasoningText handles a plain string", () => {
  expect(extractReasoningText("thinking")).toBe("thinking");
});

test("extractReasoningText handles an array of reasoning parts", () => {
  // The AI SDK returns reasoning as an array of {type, text, providerMetadata}.
  const reasoning = [
    { type: "reasoning", text: "We need answer arithmetic. ", providerMetadata: {} },
    { type: "reasoning", text: "17*23 = 391." },
  ];
  expect(extractReasoningText(reasoning)).toBe("We need answer arithmetic. 17*23 = 391.");
});

test("extractReasoningText handles an array of plain strings", () => {
  expect(extractReasoningText(["a", "b"])).toBe("ab");
});

test("extractReasoningText returns null for empty arrays and unsupported inputs", () => {
  expect(extractReasoningText([])).toBeNull();
  expect(extractReasoningText([{ type: "reasoning", text: "   " }])).toBeNull();
  expect(extractReasoningText(undefined)).toBeNull();
  expect(extractReasoningText(null)).toBeNull();
  expect(extractReasoningText(42)).toBeNull();
});
