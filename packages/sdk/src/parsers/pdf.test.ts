import { test, expect, mock } from "bun:test";

// ---------------------------------------------------------------------------
// Stub for pdf-parse: we control what getText() and getImage() return so we
// can test parsePdf without a real PDF file.
// ---------------------------------------------------------------------------

type TextPage = { num: number; text: string };
type EmbeddedImageStub = { dataUrl: string; width: number; height: number };
type PageImagesStub = { pageNumber: number; images: EmbeddedImageStub[] };
type ScreenshotPageStub = { pageNumber: number; dataUrl: string; width: number; height: number };

// Configurable stubs — tests update these before importing parsePdf.
let stubTextPages: TextPage[] = [];
let stubTextFull = "";
let stubImagePages: PageImagesStub[] = [];
let stubScreenshotPages: ScreenshotPageStub[] = [];
let stubGetImageThrows = false;
let stubGetScreenshotThrows = false;

mock.module("pdf-parse", () => ({
  PDFParse: class {
    constructor(_opts: unknown) {}
    async getText() {
      return {
        pages: stubTextPages,
        text: stubTextFull,
        total: stubTextPages.length || 1,
      };
    }
    async getImage(_params?: unknown) {
      if (stubGetImageThrows) throw new Error("image extraction failed");
      return {
        pages: stubImagePages,
        total: stubImagePages.length,
      };
    }
    async getScreenshot(_params?: unknown) {
      if (stubGetScreenshotThrows) throw new Error("screenshot rendering failed");
      return {
        pages: stubScreenshotPages,
        total: stubScreenshotPages.length,
      };
    }
    async getInfo() {
      return { Title: "Test PDF" };
    }
    async destroy() {}
  },
}));

// Import after mock is registered
const { parsePdf } = await import("./pdf");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBuffer() {
  return Buffer.from("%PDF-1.4 fake");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test("parsePdf extracts per-page text when pages are present", async () => {
  stubTextPages = [
    { num: 1, text: "Hello page one" },
    { num: 2, text: "Hello page two" },
  ];
  stubTextFull = "Hello page one\nHello page two";
  stubImagePages = [];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  expect(artifact.type).toBe("pdf");
  expect(artifact.contents).toHaveLength(2);
  expect(artifact.contents[0]).toEqual({ page: 1, text: "Hello page one" });
  expect(artifact.contents[1]).toEqual({ page: 2, text: "Hello page two" });
});

test("parsePdf falls back to full text when no pages are returned", async () => {
  stubTextPages = [];
  stubTextFull = "entire document text";
  stubImagePages = [];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  expect(artifact.contents).toHaveLength(1);
  expect(artifact.contents[0]?.text).toBe("entire document text");
  expect(artifact.contents[0]?.page).toBeUndefined();
});

test("parsePdf attaches images to the matching page content entry", async () => {
  stubTextPages = [
    { num: 1, text: "Page with image" },
    { num: 2, text: "Page without image" },
  ];
  stubTextFull = "";
  stubImagePages = [
    {
      pageNumber: 1,
      images: [{ dataUrl: "data:image/png;base64,abc123", width: 100, height: 50 }],
    },
  ];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  expect(artifact.contents).toHaveLength(2);

  const page1 = artifact.contents[0]!;
  expect(page1.page).toBe(1);
  expect(page1.text).toBe("Page with image");
  expect(page1.media).toHaveLength(1);
  expect(page1.media![0]).toMatchObject({
    type: "image",
    base64: "abc123",
    width: 100,
    height: 50,
  });

  const page2 = artifact.contents[1]!;
  expect(page2.page).toBe(2);
  expect(page2.media).toBeUndefined();
});

test("parsePdf strips data URL prefix to produce raw base64", async () => {
  stubTextPages = [{ num: 1, text: "text" }];
  stubTextFull = "";
  stubImagePages = [
    {
      pageNumber: 1,
      images: [{ dataUrl: "data:image/jpeg;base64,/9j/4AAQ==", width: 200, height: 200 }],
    },
  ];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());
  const img = artifact.contents[0]?.media?.[0];
  expect(img?.base64).toBe("/9j/4AAQ==");
});

test("parsePdf creates a content entry for pages that have only images (no text)", async () => {
  stubTextPages = [{ num: 1, text: "text only page" }];
  stubTextFull = "";
  stubImagePages = [
    {
      pageNumber: 2,
      images: [{ dataUrl: "data:image/png;base64,img2", width: 80, height: 80 }],
    },
  ];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  // Should have page 1 (text) and page 2 (image-only)
  expect(artifact.contents).toHaveLength(2);

  const imagePage = artifact.contents.find((c) => c.page === 2);
  expect(imagePage).toBeDefined();
  expect(imagePage?.text).toBeUndefined();
  expect(imagePage?.media).toHaveLength(1);
  expect(imagePage?.media![0]?.base64).toBe("img2");
});

test("parsePdf continues without images when getImage() throws", async () => {
  stubTextPages = [{ num: 1, text: "resilient page" }];
  stubTextFull = "";
  stubImagePages = [];
  stubScreenshotPages = [];
  stubGetImageThrows = true;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  expect(artifact.contents).toHaveLength(1);
  expect(artifact.contents[0]?.text).toBe("resilient page");
  expect(artifact.contents[0]?.media).toBeUndefined();
});

test("parsePdf produces at least one content entry for empty documents", async () => {
  stubTextPages = [];
  stubTextFull = "";
  stubImagePages = [];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  expect(artifact.contents).toHaveLength(1);
  expect(artifact.contents[0]?.text).toBe("");
});

test("parsePdf includes numpages in metadata", async () => {
  stubTextPages = [{ num: 1, text: "one" }];
  stubTextFull = "";
  stubImagePages = [];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  expect(artifact.metadata?.numpages).toBe(1);
  expect((artifact.metadata?.info as Record<string, unknown>)?.Title).toBe("Test PDF");
});

test("parsePdf raw() returns the original buffer", async () => {
  stubTextPages = [{ num: 1, text: "raw test" }];
  stubTextFull = "";
  stubImagePages = [];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const buf = makeBuffer();
  const artifact = await parsePdf(buf);
  const raw = await artifact.raw();
  expect(raw).toBe(buf);
});

test("parsePdf with includeImages: false skips image extraction", async () => {
  stubTextPages = [{ num: 1, text: "text only" }];
  stubTextFull = "";
  stubImagePages = [
    {
      pageNumber: 1,
      images: [{ dataUrl: "data:image/png;base64,abc123", width: 100, height: 50 }],
    },
  ];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  // Even though stubImagePages has data, passing includeImages: false should
  // cause getImage() to not be called, so no media on the content entry.
  const artifact = await parsePdf(makeBuffer(), { includeImages: false });

  expect(artifact.contents).toHaveLength(1);
  expect(artifact.contents[0]?.text).toBe("text only");
  expect(artifact.contents[0]?.media).toBeUndefined();
});

test("parsePdf with includeImages: true behaves the same as the default", async () => {
  stubTextPages = [{ num: 1, text: "with images" }];
  stubTextFull = "";
  stubImagePages = [
    {
      pageNumber: 1,
      images: [{ dataUrl: "data:image/png;base64,xyz456", width: 80, height: 80 }],
    },
  ];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer(), { includeImages: true });

  expect(artifact.contents[0]?.media).toHaveLength(1);
  expect(artifact.contents[0]?.media![0]?.base64).toBe("xyz456");
});

test("parsePdf with no options still includes images by default", async () => {
  stubTextPages = [{ num: 1, text: "default" }];
  stubTextFull = "";
  stubImagePages = [
    {
      pageNumber: 1,
      images: [{ dataUrl: "data:image/png;base64,def789", width: 60, height: 60 }],
    },
  ];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  expect(artifact.contents[0]?.media).toHaveLength(1);
  expect(artifact.contents[0]?.media![0]?.base64).toBe("def789");
});

test("parsePdf marks embedded images with imageType: 'embedded'", async () => {
  stubTextPages = [{ num: 1, text: "page with embedded image" }];
  stubTextFull = "";
  stubImagePages = [
    {
      pageNumber: 1,
      images: [{ dataUrl: "data:image/png;base64,embedded123", width: 100, height: 100 }],
    },
  ];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  expect(artifact.contents[0]?.media).toHaveLength(1);
  expect(artifact.contents[0]?.media![0]?.imageType).toBe("embedded");
});

test("parsePdf marks screenshots with imageType: 'screenshot'", async () => {
  stubTextPages = [{ num: 1, text: "page with screenshot" }];
  stubTextFull = "";
  stubImagePages = [];
  stubScreenshotPages = [
    { pageNumber: 1, dataUrl: "data:image/png;base64,screenshot456", width: 800, height: 600 },
  ];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer(), { screenshots: true });

  expect(artifact.contents[0]?.media).toHaveLength(1);
  expect(artifact.contents[0]?.media![0]?.imageType).toBe("screenshot");
});

test("parsePdf correctly differentiates embedded images and screenshots on the same page", async () => {
  stubTextPages = [{ num: 1, text: "page with both" }];
  stubTextFull = "";
  stubImagePages = [
    {
      pageNumber: 1,
      images: [{ dataUrl: "data:image/png;base64,embedded789", width: 100, height: 100 }],
    },
  ];
  stubScreenshotPages = [
    { pageNumber: 1, dataUrl: "data:image/png;base64,screenshot012", width: 800, height: 600 },
  ];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer(), { screenshots: true });

  expect(artifact.contents[0]?.media).toHaveLength(2);

  const embeddedImage = artifact.contents[0]?.media?.find((img) => img.imageType === "embedded");
  const screenshotImage = artifact.contents[0]?.media?.find(
    (img) => img.imageType === "screenshot",
  );

  expect(embeddedImage).toBeDefined();
  expect(embeddedImage?.base64).toBe("embedded789");
  expect(screenshotImage).toBeDefined();
  expect(screenshotImage?.base64).toBe("screenshot012");
});

test("parsePdf without screenshots option does not include screenshot images", async () => {
  stubTextPages = [{ num: 1, text: "page" }];
  stubTextFull = "";
  stubImagePages = [
    {
      pageNumber: 1,
      images: [{ dataUrl: "data:image/png;base64,embedded345", width: 100, height: 100 }],
    },
  ];
  stubScreenshotPages = [
    { pageNumber: 1, dataUrl: "data:image/png;base64,screenshot678", width: 800, height: 600 },
  ];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = false;

  const artifact = await parsePdf(makeBuffer());

  expect(artifact.contents[0]?.media).toHaveLength(1);
  expect(artifact.contents[0]?.media![0]?.imageType).toBe("embedded");
});

test("parsePdf continues without screenshots when getScreenshot() throws", async () => {
  stubTextPages = [{ num: 1, text: "resilient page" }];
  stubTextFull = "";
  stubImagePages = [];
  stubScreenshotPages = [];
  stubGetImageThrows = false;
  stubGetScreenshotThrows = true;

  const artifact = await parsePdf(makeBuffer(), { screenshots: true });

  expect(artifact.contents).toHaveLength(1);
  expect(artifact.contents[0]?.text).toBe("resilient page");
  expect(artifact.contents[0]?.media).toBeUndefined();
});
