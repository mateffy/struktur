import { test, expect } from "bun:test";
import { materializeTrack, trackToPdfOptions } from "./tracks";
import type { Artifact } from "@struktur/sdk";

test("trackToPdfOptions maps tracks to parse flags", () => {
  expect(trackToPdfOptions("text")).toEqual({ includeImages: false, screenshots: false });
  expect(trackToPdfOptions("text+embedded")).toEqual({ includeImages: true, screenshots: false });
  expect(trackToPdfOptions("text+screenshots")).toEqual({
    includeImages: false,
    screenshots: true,
  });
  expect(trackToPdfOptions("text+embedded+screenshots")).toEqual({
    includeImages: true,
    screenshots: true,
  });
});

test("non-pdf artifacts pass through unchanged", async () => {
  const image: Artifact = {
    id: "img",
    type: "image",
    raw: async () => Buffer.from("x"),
    contents: [{ media: [{ type: "image", contents: Buffer.from("x") }] }],
  };
  const text: Artifact = {
    id: "txt",
    type: "text",
    raw: async () => Buffer.from("hello"),
    contents: [{ text: "hello" }],
  };

  for (const track of [
    "text",
    "text+embedded",
    "text+screenshots",
    "text+embedded+screenshots",
  ] as const) {
    const out = await materializeTrack([image, text], track);
    expect(out[0]).toBe(image);
    expect(out[1]).toBe(text);
  }
});
