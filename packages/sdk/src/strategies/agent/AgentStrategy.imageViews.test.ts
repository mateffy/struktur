import { test, expect, describe } from "bun:test";
import { MockLanguageModelV3 } from "ai/test";
import { extract } from "../../extract";
import { agent, isImageOverviewPath } from "./AgentStrategy";
import type { Artifact } from "../../types";

// A tiny valid PNG (1x1 pixel).
const PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const usage = () => ({
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 10, text: 10, reasoning: 0 },
});

const call = (id: string, toolName: string, input: unknown) => ({
  type: "tool-call" as const,
  toolCallId: id,
  toolName,
  input: JSON.stringify(input),
});

const step = (content: unknown[]) => ({
  content,
  finishReason: { unified: "tool-calls", raw: "tool-calls" },
  usage: usage(),
  warnings: [],
});

const imagePath = (n: number) => `/images/artifact-1-page-${n}-image-0.png`;
const overviewPath = "/images/artifact-1/image-overview-1.png";

const artifact: Artifact = {
  id: "artifact-1",
  type: "pdf",
  raw: async () => Buffer.from("doc", "utf8"),
  contents: [
    ...[1, 2, 3].map((n) => ({
      page: n,
      text: `Seite ${n}`,
      media: [{ type: "image" as const, base64: PNG, virtualPath: imagePath(n) }],
    })),
    {
      text: "Image overview 1",
      media: [{ type: "image" as const, base64: PNG, imageType: "overview" as const, virtualPath: overviewPath }],
    },
  ],
};

const schema = { type: "object", properties: { name: { type: "string" } } };

/**
 * Runs the agent with a model that views the overview, then every single image,
 * then finishes. Returns the result and the prompts the model received.
 */
const runViewingEverything = async (maxImageViews?: number) => {
  const model = new MockLanguageModelV3({
    doGenerate: (() => {
      const responses = [
        step([call("o", "view_image", { image_path: overviewPath })]),
        ...[1, 2, 3].map((n) => step([call(`v${n}`, "view_image", { image_path: imagePath(n) })])),
        step([call("s", "set_output_data", { data: { name: "X" } })]),
        step([call("f", "finish", {})]),
      ];
      let i = 0;
      return () => responses[Math.min(i++, responses.length - 1)] as never;
    })(),
  });

  const result = await extract({
    artifacts: [artifact],
    schema: schema as never,
    strategy: agent({ model: model as never, maxSteps: 20, vision: true, maxImageViews }),
  });

  const prompts = (model as unknown as { doGenerateCalls: { prompt: unknown }[] }).doGenerateCalls;
  const lastPrompt = JSON.stringify(prompts[prompts.length - 1]!.prompt);

  return { result, lastPrompt, systemPrompt: JSON.stringify(prompts[0]!.prompt) };
};

describe("agent maxImageViews", () => {
  test("refuses single images beyond the limit and keeps running", async () => {
    const { result, lastPrompt } = await runViewingEverything(2);

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({ name: "X" });
    expect(lastPrompt.split("Not opened: you already opened 2 individual images").length - 1).toBe(1);
    expect(lastPrompt).toContain(`[Image: ${imagePath(3)}] Not opened`);
    expect(lastPrompt).not.toContain(`[Image: ${imagePath(2)}] Not opened`);
  });

  test("does not count the image overview against the limit", async () => {
    const { lastPrompt } = await runViewingEverything(3);

    expect(lastPrompt).not.toContain("Not opened");
  });

  test("opens every image when no limit is set", async () => {
    const { lastPrompt, systemPrompt } = await runViewingEverything(undefined);

    expect(lastPrompt).not.toContain("Not opened");
    expect(systemPrompt).not.toContain("individual images in this run");
  });

  test("tells the agent about the limit in the system prompt", async () => {
    const { systemPrompt } = await runViewingEverything(2);

    expect(systemPrompt).toContain("You may open at most 2 individual images in this run");
  });
});

test("isImageOverviewPath only matches generated overview sheets", () => {
  expect(isImageOverviewPath(overviewPath)).toBe(true);
  expect(isImageOverviewPath(imagePath(1))).toBe(false);
  expect(isImageOverviewPath("/images/my-image-overview-photo.png")).toBe(false);
});
