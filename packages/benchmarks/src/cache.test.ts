import { test, expect } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cacheGet, cacheSet, hashKey } from "./cache";

test("hashKey is stable and deterministic", () => {
  expect(hashKey({ a: 1, b: "x" })).toBe(hashKey({ a: 1, b: "x" }));
  expect(hashKey({ a: 1, b: "x" })).toBe(hashKey({ b: "x", a: 1 })); // JSON key order
  expect(hashKey({ a: 1 })).not.toBe(hashKey({ a: 2 }));
});

test("cache round-trips values to disk", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-cache-"));
  await cacheSet(dir, "key1", { hello: "world", n: 42 });
  const value = await cacheGet<{ hello: string; n: number }>(dir, "key1");
  expect(value).toEqual({ hello: "world", n: 42 });
});

test("cacheGet returns undefined on miss", async () => {
  const dir = await mkdtemp(join(tmpdir(), "benchmarks-cache-"));
  expect(await cacheGet(dir, "missing")).toBeUndefined();
});
