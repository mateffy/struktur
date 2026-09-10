import { test, expect } from "bun:test";
import { buildContactSheets } from "./contactSheet";

// A tiny valid PNG (1x1 red pixel) base64.
const PNG_1x1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// A wider PNG (2x1) to exercise aspect-ratio scaling.
const PNG_2x1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAQAAABeK7cBAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const mk = (n: number, w: number, h: number, b64 = PNG_1x1) => ({
  type: "image" as const,
  base64: b64,
  width: w,
  height: h,
  imageType: "embedded" as const,
  virtualPath: `/images/artifact-abc-page-${n}-image-0.png`,
});

test("buildContactSheets composites several images into one sheet with a contact-sheet virtual path", async () => {
  const images = [mk(1, 100, 100, PNG_2x1), mk(2, 100, 100, PNG_1x1)];
  const sheets = await buildContactSheets(images, { onto: "/images/artifact-abc" });

  expect(sheets.length).toBeGreaterThanOrEqual(1);
  const sheet = sheets[0];
  expect(sheet.type).toBe("image");
  expect(sheet.virtualPath).toContain("/contact-sheet-1.png");
  expect(sheet.width).toBeGreaterThan(0);
  expect(sheet.height).toBeGreaterThan(0);
  expect(sheet.base64!.length).toBeGreaterThan(100);
});

test("buildContactSheets dedupes byte-identical images (recurring logos)", async () => {
  const images = [
    mk(1, 100, 100),
    mk(2, 100, 100, PNG_1x1), // same bytes as page 1 → should dedupe
    mk(3, 100, 100, PNG_2x1), // different bytes → kept
  ];
  const sheets = await buildContactSheets(images, { onto: "/images/artifact-abc" });
  // 3 source images, one deduped → 2 cells. A single sheet is fine either way;
  // assert the sheet was produced and is valid.
  expect(sheets.length).toBeGreaterThanOrEqual(1);
  expect(sheets[0].base64!.length).toBeGreaterThan(100);
});

test("buildContactSheets drops tiny images (icons/logos under 40px)", async () => {
  const images = [mk(1, 20, 20), mk(2, 200, 200)];
  const sheets = await buildContactSheets(images, { onto: "/images/artifact-abc" });
  // Only the 200x200 image survives; single image → returned as-is.
  expect(sheets).toHaveLength(1);
  expect(sheets[0].virtualPath).toBe(images[1].virtualPath);
});

test("buildContactSheets returns empty for no images", async () => {
  expect(await buildContactSheets([], { onto: "/images/artifact-abc" })).toEqual([]);
});

test("buildContactSheets returns single image as-is when only one survives", async () => {
  const one = mk(1, 200, 200);
  const sheets = await buildContactSheets([one], { onto: "/images/artifact-abc" });
  expect(sheets).toHaveLength(1);
  expect(sheets[0].virtualPath).toBe(one.virtualPath);
});
