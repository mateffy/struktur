import { wrapGold, type ExposeGold } from "./schema";

function stripImagesRecursive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripImagesRecursive);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "images" || k === "floorplans") continue;
      out[k] = stripImagesRecursive(v);
    }
    return out;
  }
  return value;
}

/**
 * Collapse building + unit features into a single per-building set. The model
 * and gold often place the same feature at building vs unit level (e.g.
 * "high-ceilings" on the building vs on a hall unit); both are correct and the
 * distinction is subjective. Merging removes level-assignment noise so the
 * benchmark measures *whether* the right features were found, not *where* they
 * were nested.
 */
function mergeFeaturesRecursive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(mergeFeaturesRecursive);
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    const isBuilding = Array.isArray(o.units);
    const merged = new Set<string>();
    for (const [k, v] of Object.entries(o)) {
      if (k === "units" && isBuilding) {
        out[k] = (v as unknown[]).map((u) => {
          const u2 = mergeFeaturesRecursive(u) as Record<string, unknown>;
          for (const f of (u2.features ?? []) as string[]) merged.add(f);
          u2.features = [];
          return u2;
        });
      } else {
        out[k] = mergeFeaturesRecursive(v);
      }
    }
    if (isBuilding) {
      for (const f of (o.features ?? []) as string[]) merged.add(f);
      out.features = [...merged];
    }
    return out;
  }
  return value;
}

/**
 * Remove `images` / `floorplans` fields from a gold (or prediction) so a
 * text-only run isn't penalised for a field it cannot legitimately populate.
 *
 * For gold: wraps in `real_estate_property` first (matching the schema), then
 * strips image fields. For predictions: strips image fields as-is.
 */
export const stripImages = (gold: ExposeGold | unknown, isGold?: boolean): unknown =>
  isGold ? stripImagesRecursive(wrapGold(gold as ExposeGold)) : stripImagesRecursive(gold);

/**
 * `stripImages` + feature level-merge, applied to both gold and prediction
 * before scoring. Call this instead of `stripImages` in scoring paths.
 */
export const normalizeForScoring = (gold: ExposeGold | unknown, isGold?: boolean): unknown =>
  mergeFeaturesRecursive(stripImages(gold, isGold));
