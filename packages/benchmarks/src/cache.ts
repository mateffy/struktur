import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/** Total, key-order-insensitive serialization for cache keys. */
const stableStringify = (v: unknown): string => {
  if (v === null) return "null";
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  if (typeof v === "object") {
    const rec = v as Record<string, unknown>;
    const keys = Object.keys(rec).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(rec[k])}`).join(",")}}`;
  }
  return JSON.stringify(v) ?? String(v);
};

/** Stable short hash of a cache key. */
export const hashKey = (input: unknown): string =>
  createHash("sha256").update(stableStringify(input)).digest("hex").slice(0, 16);

export async function cacheGet<T>(dir: string, key: string): Promise<T | undefined> {
  try {
    const raw = await readFile(path.join(dir, `${key}.json`), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export async function cacheSet(dir: string, key: string, value: unknown): Promise<void> {
  const file = path.join(dir, `${key}.json`);
  await mkdir(dir, { recursive: true });
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, file);
}
