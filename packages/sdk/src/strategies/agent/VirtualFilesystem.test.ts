import { test, expect, describe } from "bun:test";
import { createVirtualFilesystem } from "./ArtifactFilesystem";
import type { Artifact } from "../../types";

describe("createVirtualFilesystem", () => {
  test("creates virtual filesystem with artifact files", () => {
    const artifacts: Artifact[] = [
      {
        id: "test-1",
        type: "text",
        contents: [{ text: "Hello world" }],
        raw: async () => Buffer.from("Hello world"),
        tokens: 10,
      },
    ];

    const result = createVirtualFilesystem(artifacts);

    expect(result["/artifact.json"]).toBeDefined();
    expect(result["/manifest.json"]).toBeDefined();
    expect(result.virtualFiles).toBeDefined();
    expect(typeof result.getImageByPath).toBe("function");
  });

  test("extracts base64 images to virtual files with descriptive names", () => {
    // Use a JPEG base64 signature
    const jpegBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD"; // JPEG signature
    const artifacts: Artifact[] = [
      {
        id: "my-document",
        type: "pdf",
        contents: [
          {
            page: 1,
            text: "Document content",
            media: [
              {
                type: "image",
                base64: jpegBase64,
                x: 10,
                y: 20,
                width: 100,
                height: 200,
                imageType: "embedded",
              },
            ],
          },
        ],
        raw: async () => Buffer.from("pdf"),
      },
    ];

    const result = createVirtualFilesystem(artifacts);

    // Check virtual file was created with descriptive name
    expect(result.virtualFiles.size).toBe(1);
    const virtualPath = "/images/my-document-page-1-image-0.jpg";
    expect(result.virtualFiles.has(virtualPath)).toBe(true);
    expect(result.virtualFiles.get(virtualPath)).toBe(jpegBase64);

    // Check artifact.json references virtual path
    const artifactJson = JSON.parse(result["/artifact.json"]);
    expect(artifactJson[0].contents[0].media[0].virtualPath).toBe(virtualPath);
    expect(artifactJson[0].contents[0].media[0].base64).toBeUndefined();
  });

  test("getImageByPath retrieves image data", () => {
    // Use PNG base64 signature
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const artifacts: Artifact[] = [
      {
        id: "doc-1",
        type: "pdf",
        contents: [
          {
            media: [
              {
                type: "image",
                base64: pngBase64,
              },
            ],
          },
        ],
        raw: async () => Buffer.from("pdf"),
      },
    ];

    const result = createVirtualFilesystem(artifacts);
    const virtualPath = "/images/doc-1-image-0.png";

    expect(result.getImageByPath(virtualPath)).toBe(pngBase64);
    expect(result.getImageByPath("/nonexistent/path")).toBeUndefined();
  });

  test("manifest includes virtual files information with descriptive names", () => {
    // Use base64 signatures for different formats
    const jpegBase64 = "/9j/somejpegdata";
    const pngBase64 = "iVBORw0KGgoAAAANSU";

    const artifacts: Artifact[] = [
      {
        id: "my-document",
        type: "pdf",
        contents: [
          {
            media: [
              { type: "image", base64: jpegBase64 },
              { type: "image", base64: pngBase64 },
            ],
          },
        ],
        raw: async () => Buffer.from("pdf"),
      },
    ];

    const result = createVirtualFilesystem(artifacts);
    const manifest = JSON.parse(result["/manifest.json"]);

    expect(manifest.virtualFiles.count).toBe(2);
    expect(manifest.virtualFiles.paths.length).toBe(2);
    expect(manifest.virtualFiles.paths[0]).toContain("/images/");
    expect(manifest.virtualFiles.paths[0]).toContain(".jpg"); // JPEG detection
    expect(manifest.virtualFiles.paths[1]).toContain(".png"); // PNG detection
  });

  test("handles artifacts without base64 images", () => {
    const artifacts: Artifact[] = [
      {
        id: "text-1",
        type: "text",
        contents: [{ text: "Just text" }],
        raw: async () => Buffer.from("text"),
      },
    ];

    const result = createVirtualFilesystem(artifacts);

    expect(result.virtualFiles.size).toBe(0);
    const manifest = JSON.parse(result["/manifest.json"]);
    expect(manifest.virtualFiles.count).toBe(0);
  });

  test("handles mixed artifacts with and without images", () => {
    const artifacts: Artifact[] = [
      {
        id: "text-1",
        type: "text",
        contents: [{ text: "Just text" }],
        raw: async () => Buffer.from("text"),
      },
      {
        id: "image-1",
        type: "image",
        contents: [
          {
            media: [
              {
                type: "image",
                base64: "imagedata",
              },
            ],
          },
        ],
        raw: async () => Buffer.from("image"),
      },
    ];

    const result = createVirtualFilesystem(artifacts);

    expect(result.virtualFiles.size).toBe(1);
    const manifest = JSON.parse(result["/manifest.json"]);
    expect(manifest.virtualFiles.count).toBe(1);
  });
});
