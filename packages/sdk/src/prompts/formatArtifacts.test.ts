import { test, expect } from "bun:test";
import type { Artifact } from "../types";
import { formatArtifactsXml } from "./formatArtifacts";

test("formatArtifactsXml escapes text and builds image refs", () => {
  const artifacts: Artifact[] = [
    {
      id: "a&<>\"'",
      type: "text",
      raw: async () => Buffer.from(""),
      contents: [
        {
          page: 2,
          text: "Hello & <world> \"quote\" 'apostrophe'",
        },
        {
          page: 1,
          media: [
            { type: "image", url: "https://example.com/image.png" },
            { type: "image", base64: "abc" },
            { type: "image", contents: Buffer.from([1, 2, 3]) },
          ],
        },
      ],
    },
  ];

  const result = formatArtifactsXml(artifacts);
  const expected = [
    "<artifact id=\"a&amp;&lt;&gt;&quot;&apos;\" type=\"text\">",
    "  <text page=\"2\">Hello &amp; &lt;world&gt; &quot;quote&quot; &apos;apostrophe&apos;</text>",
    "  <image ref=\"https://example.com/image.png\" page=\"1\" />",
    "  <image ref=\"artifact:a&amp;&lt;&gt;&quot;&apos;/images/image2.png\" page=\"1\" />",
    "  <image ref=\"artifact:a&amp;&lt;&gt;&quot;&apos;/images/image3.bin\" page=\"1\" />",
    "</artifact>",
  ].join("\n");

  expect(result).toBe(expected);
});
