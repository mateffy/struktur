import { test, expect } from "bun:test";
import { buildPrefill } from "./prefill";
import type { VirtualFilesystemResult } from "./ArtifactFilesystem";

const makeFilesystem = (
  files: Record<string, string>,
  artifactJson = "line 1\nline 2\nline 3",
): VirtualFilesystemResult => {
  const virtualFiles = new Map(Object.entries(files));
  return {
    "/artifact.json": artifactJson,
    "/manifest.json": "{}",
    virtualFiles,
    getImageByPath: (path: string) => virtualFiles.get(path),
  };
};

test("buildPrefill emits a read tool-call pair for small documents", () => {
  const result = buildPrefill(makeFilesystem({}), { textTokens: 10_000 });

  expect(result.messages).toHaveLength(2);
  expect(result.messages[0].content[0]).toMatchObject({
    type: "tool-call",
    toolName: "read",
    input: { file_path: "/artifact.json", offset: 1, limit: 1000 },
  });
  expect(result.messages[1].content[0].output.value[0].text).toContain("line 1");
  expect(result.truncated).toBe(false);
});

test("buildPrefill splits documents over 1000 lines into multiple read calls", () => {
  const lines = Array.from({ length: 2500 }, (_, i) => `line ${i}`).join("\n");
  const result = buildPrefill(makeFilesystem({}, lines), { textTokens: 1_000_000 });

  expect(result.messages).toHaveLength(6); // 3 read calls = 3 assistant + 3 tool
  expect(result.messages[4].content[0].input).toMatchObject({ offset: 2001, limit: 1000 });
  expect(result.truncated).toBe(false);
});

test("buildPrefill puts image overviews before individual images", () => {
  const result = buildPrefill(
    makeFilesystem({
      "/images/doc-page-1-image-0.png": "iVBORw0KGgoAAA",
      "/images/doc-page-2-image-0.png": "iVBORw0KGgoAAA",
      "/images/doc-image-overview-1.png": "iVBORw0KGgoAAA",
    }),
    { textTokens: 10_000, maxImages: 3 },
  );

  expect(result.imagePaths).toEqual([
    "/images/doc-image-overview-1.png",
    "/images/doc-page-1-image-0.png",
    "/images/doc-page-2-image-0.png",
  ]);
});

test("buildPrefill delivers image media in the same shape as the view_image tool", () => {
  const result = buildPrefill(makeFilesystem({ "/images/doc-image-overview-1.png": "aGVsbG8=" }), {
    textTokens: 10_000,
  });

  const imageMessage = result.messages.at(-1);
  expect(imageMessage.content[0]).toMatchObject({
    type: "tool-result",
    toolName: "view_image",
    output: {
      type: "content",
      value: [
        { type: "text", text: "[Image: /images/doc-image-overview-1.png]" },
        { type: "media", data: "aGVsbG8=", mediaType: "image/png" },
      ],
    },
  });
});

test("buildPrefill honours the image cap", () => {
  const result = buildPrefill(
    makeFilesystem({
      "/images/a.png": "aGVsbG8=",
      "/images/b.png": "aGVsbG8=",
      "/images/c.png": "aGVsbG8=",
    }),
    { textTokens: 10_000, maxImages: 2 },
  );

  expect(result.imagePaths).toHaveLength(2);
  expect(result.truncated).toBe(true);
});

test("buildPrefill caps images by count, not by the text budget", () => {
  const files: Record<string, string> = {};
  for (let i = 0; i < 10; i++) files[`/images/img-${i}.png`] = "aGVsbG8=";

  const result = buildPrefill(makeFilesystem(files), { textTokens: 1, maxImages: 4 });

  expect(result.imagePaths).toHaveLength(4);
  // No text budget left, but the images still load.
  expect(result.textTokens).toBe(0);
  expect(result.messages).toHaveLength(8);
});

test("buildPrefill skips images that would blow the provider's request body limit", () => {
  const result = buildPrefill(
    makeFilesystem({
      "/images/big.png": "A".repeat(20_000_000),
      "/images/small.png": "aGVsbG8=",
    }),
    { textTokens: 1_000_000 },
  );

  expect(result.imagePaths).toEqual(["/images/small.png"]);
});

test("buildPrefill is deterministic so provider prompt caching can hit", () => {
  const filesystem = makeFilesystem({
    "/images/doc-image-overview-1.png": "aGVsbG8=",
  });

  const first = buildPrefill(filesystem, { textTokens: 10_000 });
  const second = buildPrefill(filesystem, { textTokens: 10_000 });

  expect(JSON.stringify(first.messages)).toBe(JSON.stringify(second.messages));
});

test("buildPrefill loads images independently of the text budget", () => {
  const result = buildPrefill(makeFilesystem({ "/images/a.png": "aGVsbG8=" }), { textTokens: 0 });

  expect(result.textTokens).toBe(0);
  expect(result.imagePaths).toEqual(["/images/a.png"]);
});

test("buildPrefill loads nothing when both budgets are zero", () => {
  const result = buildPrefill(makeFilesystem({ "/images/a.png": "aGVsbG8=" }), {
    textTokens: 0,
    maxImages: 0,
  });

  expect(result.messages).toHaveLength(0);
  expect(result.imagePaths).toHaveLength(0);
  expect(result.tokens).toBe(0);
});
