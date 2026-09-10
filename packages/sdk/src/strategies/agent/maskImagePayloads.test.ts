import { test, expect } from "bun:test";
import { maskImagePayloads } from "./AgentStrategy";

test("maskImagePayloads replaces media parts in tool-result with a text placeholder", () => {
  const messages = [
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "call_1",
          toolName: "view_image",
          output: {
            type: "content",
            value: [
              { type: "text", text: "[Image: /images/artifact-page-1-image-2.png]" },
              {
                type: "media",
                data: "aGVsbG8gd29ybGQ", // base64
                mediaType: "image/png",
              },
            ],
          },
        },
      ],
    },
  ];

  maskImagePayloads(messages as any);

  const value = (messages[0].content[0].output as any).value;
  expect(value).toHaveLength(2);
  expect(value[1].type).toBe("text");
  expect(value[1].text).toContain("/images/artifact-page-1-image-2.png");
  expect(value[1].text).toContain("Image viewed");
  // the base64 payload is gone
  expect(JSON.stringify(value)).not.toContain("aGVsbG8gd29ybGQ");
});

test("maskImagePayloads leaves non-media tool-results untouched", () => {
  const messages = [
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "call_2",
          toolName: "read",
          output: { type: "text", value: "file contents here" },
        },
      ],
    },
  ];

  maskImagePayloads(messages as any);
  expect(messages[0].content[0].output.type).toBe("text");
  expect(messages[0].content[0].output.value).toBe("file contents here");
});

test("maskImagePayloads handles tool-result without content type", () => {
  const messages = [
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "call_3",
          toolName: "view_image",
          output: { type: "json", value: { imageData: "aGVsbG8" } },
        },
      ],
    },
  ];

  maskImagePayloads(messages as any);
  expect(messages[0].content[0].output.type).toBe("json");
});

test("maskImagePayloads is a no-op on messages without content arrays", () => {
  const messages = [{ role: "assistant", content: "plain text" }];
  maskImagePayloads(messages as any);
  expect(messages[0].content).toBe("plain text");
});
