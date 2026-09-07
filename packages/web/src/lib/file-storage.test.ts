import { describe, expect, it } from "vitest";
import { clearStoredFiles, loadFilesFromStorage, saveFilesToStorage } from "./file-storage";

function makeFile(name: string, content: string, type = "text/plain", lastModified?: number): File {
  return new File([content], name, { type, lastModified });
}

describe("file-storage (IndexedDB persistence)", () => {
  it("starts empty", async () => {
    await expect(loadFilesFromStorage()).resolves.toEqual([]);
  });

  it("round-trips a single file across save/load", async () => {
    await saveFilesToStorage([makeFile("invoice.txt", "hello invoice")]);

    const files = await loadFilesFromStorage();
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe("invoice.txt");
    expect(files[0].type).toBe("text/plain");
    await expect(files[0].text()).resolves.toBe("hello invoice");
  });

  it("persists multiple files with distinct names, types, and contents", async () => {
    await saveFilesToStorage([
      makeFile("a.txt", "content-a", "text/plain"),
      makeFile("b.md", "# heading b", "text/markdown"),
      makeFile("c.json", '{"k":1}', "application/json"),
    ]);

    const files = await loadFilesFromStorage();
    expect(files).toHaveLength(3);

    const byName = Object.fromEntries(files.map((f) => [f.name, f]));
    await expect(byName["a.txt"].text()).resolves.toBe("content-a");
    await expect(byName["b.md"].text()).resolves.toBe("# heading b");
    await expect(byName["c.json"].text()).resolves.toBe('{"k":1}');
  });

  it("preserves file size and lastModified metadata", async () => {
    const original = makeFile("doc.bin", "0123456789", "application/octet-stream", 1700000000000);

    await saveFilesToStorage([original]);
    const files = await loadFilesFromStorage();

    expect(files[0].lastModified).toBe(1700000000000);
    expect(files[0].size).toBe(10);
    await expect(files[0].text()).resolves.toHaveLength(10);
  });

  it("saving files replaces the previous stored set", async () => {
    await saveFilesToStorage([makeFile("first.txt", "first")]);
    await saveFilesToStorage([makeFile("second.txt", "second")]);

    const files = await loadFilesFromStorage();
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe("second.txt");
    await expect(files[0].text()).resolves.toBe("second");
  });

  it("clearStoredFiles removes all persisted files", async () => {
    await saveFilesToStorage([makeFile("keep.txt", "x"), makeFile("keep2.txt", "y")]);
    await clearStoredFiles();
    await expect(loadFilesFromStorage()).resolves.toEqual([]);
  });

  it("saveFilesToStorage with an empty array clears persisted files", async () => {
    await saveFilesToStorage([makeFile("gone.txt", "x")]);
    await saveFilesToStorage([]);
    await expect(loadFilesFromStorage()).resolves.toEqual([]);
  });
});
