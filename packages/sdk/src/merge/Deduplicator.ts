export const fnv1a32 = (str: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `"${key}":${stableStringify(val)}`);

  return `{${entries.join(",")}}`;
};

export const findExactDuplicatesWithHashing = (items: unknown[]) => {
  const seen = new Map<number, number>();
  const duplicates: number[] = [];

  items.forEach((item, index) => {
    const hash = fnv1a32(stableStringify(item));
    if (seen.has(hash)) {
      duplicates.push(index);
      return;
    }
    seen.set(hash, index);
  });

  return duplicates;
};

export const deduplicateByIndices = <T>(items: T[], indices: number[]) => {
  const remove = new Set(indices);
  return items.filter((_, index) => !remove.has(index));
};
