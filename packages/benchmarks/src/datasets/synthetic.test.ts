import { test, expect } from "bun:test";
import { generateKeyValueCases, syntheticCases, textArtifact } from "./synthetic";

test("textArtifact produces a text artifact", async () => {
  const a = textArtifact("hello world");
  expect(a.type).toBe("text");
  expect(a.contents[0]!.text).toBe("hello world");
  expect((await a.raw()).toString()).toBe("hello world");
});

test("syntheticCases wraps records with a shared schema", () => {
  const cases = syntheticCases("demo", { type: "object" }, [
    { text: "a: 1", gold: { a: 1 } },
    { text: "b: 2", gold: { b: 2 } },
  ]);
  expect(cases).toHaveLength(2);
  expect(cases[0]!.id).toBe("demo-0");
  expect(cases[0]!.gold).toEqual({ a: 1 });
  expect(cases[0]!.tracks).toEqual(["text"]);
});

test("generateKeyValueCases is deterministic and well-formed", () => {
  const a = generateKeyValueCases("kv", [{ name: "name" }, { name: "price", type: "number" }], 5, 42);
  const b = generateKeyValueCases("kv", [{ name: "name" }, { name: "price", type: "number" }], 5, 42);

  expect(a).toHaveLength(5);
  // deterministic except for the `raw` closure (a fresh function each call)
  expect(JSON.parse(JSON.stringify(a))).toEqual(JSON.parse(JSON.stringify(b)));

  for (const c of a) {
    expect(c.gold).toHaveProperty("name");
    expect(typeof (c.gold as { price: unknown }).price).toBe("number");
    const text = c.artifacts[0]!.contents[0]!.text;
    expect(text).toContain("name:");
    expect(text).toContain("price:");
  }
});

test("generateKeyValueCases emits different data for different seeds", () => {
  const a = generateKeyValueCases("kv", [{ name: "name" }], 10, 1);
  const b = generateKeyValueCases("kv", [{ name: "name" }], 10, 2);
  expect(a).not.toEqual(b);
});
