import { test, expect } from "bun:test";
import { parseOutputData } from "./AgentStrategy";

test("parseOutputData parses a JSON-string object", () => {
  const parsed = parseOutputData('{"name": "test"}');
  expect(parsed).toEqual({ name: "test" });
});

test("parseOutputData parses a JSON-string array", () => {
  expect(parseOutputData("[1, 2, 3]")).toEqual([1, 2, 3]);
});

test("parseOutputData passes through already-parsed objects", () => {
  const obj = { a: 1 };
  expect(parseOutputData(obj)).toBe(obj);
});

test("parseOutputData leaves non-JSON strings untouched", () => {
  expect(parseOutputData("plain text")).toBe("plain text");
  expect(parseOutputData("")).toBe("");
});

test("parseOutputData heals unescaped quotes inside strings", () => {
  // German typography: „Dock 100" uses a straight quote that would terminate
  // the JSON string early if left unescaped.
  const broken = '{"name": "Die Immobilie „Dock 100" liegt in Berlin"}';
  expect(parseOutputData(broken)).toEqual({ name: 'Die Immobilie „Dock 100" liegt in Berlin' });
});

test("parseOutputData repairs truncated JSON by balancing brackets", () => {
  const truncated = '{"a": 1, "items": [{"x": 2}, {"x": 3';
  expect(parseOutputData(truncated)).toEqual({ a: 1, items: [{ x: 2 }, { x: 3 }] });
});
