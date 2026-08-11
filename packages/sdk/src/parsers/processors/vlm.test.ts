import { test, expect, describe } from "bun:test";
import { vlmProcessor } from "./vlm";

describe("vlmProcessor", () => {
  test("has correct name and description", () => {
    expect(vlmProcessor.name).toBe("vlm");
    expect(vlmProcessor.description).toContain("Vision");
  });

  test("throws when model is not provided", async () => {
    const pdfBuffer = Buffer.from("%PDF-1.4 fake");
    await expect(vlmProcessor.parse(pdfBuffer, {})).rejects.toThrow("model");
  });
});