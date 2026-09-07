import { test, expect } from "bun:test";
import { reconstructEntities, sroieToCases, type SroieRow } from "./sroie";

// BIO tags: 0=O,1=B-COMPANY,2=I-COMPANY,3=B-DATE,5=B-ADDRESS,6=I-ADDRESS,7=B-TOTAL
test("reconstructEntities extracts all four fields from BIO tags", () => {
  const words = ["ACME", "Inc", "Date", ":", "25/12/2018", "123", "Main", "St", "Total", ":", "9.00"];
  const tags = [1, 2, 0, 0, 3, 5, 6, 6, 0, 0, 7];
  const gold = reconstructEntities(words, tags);
  expect(gold).toEqual({
    company: "ACME Inc",
    date: "25/12/2018",
    address: "123 Main St",
    total: "9.00",
  });
});

test("reconstructEntities returns null for absent fields", () => {
  const gold = reconstructEntities(["hello"], [0]);
  expect(gold).toEqual({ company: null, date: null, address: null, total: null });
});

test("sroieToCases builds text + image variants", () => {
  const row: SroieRow = {
    id: "X123",
    words: ["ACME", "9.00"],
    ner_tags: [1, 7],
    image_path: "X123.jpg",
  };
  const cases = sroieToCases([row]);
  expect(cases).toHaveLength(1);
  const c = cases[0]!;
  expect(c.id).toBe("sroie-X123");
  expect(c.gold).toEqual({ company: "ACME", date: null, address: null, total: "9.00" });
  expect(c.tracks).toContain("text");
  expect(c.tracks).toContain("text+embedded");

  const textArtifacts = c.artifactsByTrack!["text"]!;
  expect(textArtifacts[0]!.type).toBe("text");
  expect(textArtifacts[0]!.contents[0]!.text).toBe("ACME 9.00");

  const imageArtifacts = c.artifactsByTrack!["text+embedded"]!;
  expect(imageArtifacts[0]!.type).toBe("image");
  expect(imageArtifacts[0]!.contents[0]!.media![0]!.url).toContain("X123.jpg");
});

test("sroieToCases skips rows without an image path", () => {
  const cases = sroieToCases([{ id: "1", words: [], ner_tags: [] }]);
  expect(cases).toHaveLength(0);
});
