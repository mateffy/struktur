import type {
  ExtractionOptions,
  ExtractionResult,
  ExtractionStrategy,
  StatusInfo,
} from "../../types";
import type { createDebugLogger } from "../../debug/logger";
import { resolveModel, type AiSdkModel } from "../../llm/resolveModel";
import { generateText, tool } from "ai";
import { Bash } from "just-bash";
import { createVirtualFilesystem } from "./ArtifactFilesystem";
import { emitStatus } from "../status";
import { z } from "zod";

export type AgentStrategyConfig = {
  model?: string | AiSdkModel;
  provider?: string;
  modelId?: string;
  maxSteps?: number;
  maxIterations?: number;
  /** Max milliseconds per generateText step before timing out. Default: 5 minutes. */
  stepTimeoutMs?: number;
  outputInstructions?: string;
  systemPrompt?: string;
  verbose?: boolean;
  debug?: ReturnType<typeof createDebugLogger>;
  vision?: boolean; // Enable image viewing for vision-capable models
  /**
   * Reasoning effort for models that support it (OpenRouter reasoning models).
   * "low" | "medium" | "high". Leave undefined to use the model's default.
   */
  reasoningEffort?: "low" | "medium" | "high";
  /**
   * Mask previously-viewed image payloads in the message history instead of
   * re-sending their base64 on every subsequent step (observation masking).
   * Keeps the context prefix small and stable, which is required for prompt
   * caching to hit, and avoids re-sending huge payloads. Images stay
   * re-fetchable via the virtual filesystem (view_image). Default: true.
   */
  purgeImages?: boolean;
};

/**
 * The agent writes output via the `set_output_data` tool, whose `data` arg is
 * `z.any()`. Models often pass a JSON *string* there instead of a parsed object.
 * Normalize: parse JSON strings, pass objects/arrays through, leave others as-is.
 */
/**
 * Replace large image payloads inside tool-result content parts with a short text
 * placeholder, keeping any sibling text (e.g. the image path). Operates in place
 * on the AI SDK message list.
 */
export const maskImagePayloads = (messages: any[]): void => {
  for (const message of messages) {
    if (!Array.isArray(message?.content)) continue;
    for (const part of message.content) {
      if (part?.type === "tool-result" && part?.output?.type === "content") {
        const value = part.output.value;
        if (!Array.isArray(value)) continue;
        for (let i = 0; i < value.length; i++) {
          const piece = value[i];
          // Covers `media` (SDK tool output), `image-data` (after download
          // conversion) and any part carrying a large inline base64 payload.
          const isImage =
            piece?.type === "media" ||
            piece?.type === "image-data" ||
            (typeof piece?.data === "string" && piece.data.length > 512);
          if (isImage) {
            // Keep a pointer to the image path if a sibling text part has it.
            const pathText = value.find((v) => v?.type === "text")?.text;
            value[i] = {
              type: "text",
              text: pathText ? `[Image viewed: ${pathText}]` : "[Image viewed]",
            };
          }
        }
      }
    }
  }
};

export const parseOutputData = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    // Two common LLM failures: unescaped quotes inside strings (e.g. German
    // „Dock 100" typography) and truncation (missing closing brackets). Heal
    // the former, then repair the latter, then give up.
    try {
      return JSON.parse(healQuotes(trimmed));
    } catch {
      return JSON.parse(balancedPrefix(trimmed));
    }
  }
};

/**
 * Escape straight quotes that appear *inside* a JSON string value. A quote is
 * structural (ends the string) only when followed by whitespace and then one
 * of `, } ] :`. Anything else — e.g. `Dock 100" liegt` — is literal text and
 * gets escaped.
 */
const healQuotes = (s: string): string => {
  let out = "";
  let inString = false;
  let escape = false;

  const isStructuralAfter = (idx: number): boolean => {
    let i = idx;
    while (i < s.length && (s[i] === " " || s[i] === "\t" || s[i] === "\n" || s[i] === "\r")) i++;
    const ch = s[i];
    return ch === undefined || ch === "," || ch === "}" || ch === "]" || ch === ":";
  };

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (inString) {
      if (escape) {
        out += ch;
        escape = false;
        continue;
      }
      if (ch === "\\") {
        out += ch;
        escape = true;
        continue;
      }
      if (ch === '"') {
        if (isStructuralAfter(i + 1)) {
          out += ch;
          inString = false;
        } else out += '\\"';
        continue;
      }
      out += ch;
      continue;
    }
    if (ch === '"') {
      out += ch;
      inString = true;
      continue;
    }
    out += ch;
  }
  return out;
};

/**
 * Truncate a JSON string to its longest balanced prefix (closing unterminated
 * strings/arrays/objects at the cut point). Falls back to the raw string when
 * the input is beyond repair.
 */
const balancedPrefix = (s: string): string => {
  const stack: string[] = [];
  let inString = false;
  let escape = false;
  let cut = s.length;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{" || ch === "[") stack.push(ch);
    else if (ch === "}" || ch === "]") {
      const top = stack[stack.length - 1];
      if ((ch === "}" && top === "{") || (ch === "]" && top === "[")) stack.pop();
      else {
        cut = i;
        break;
      }
    }
  }

  if (stack.length === 0) return s;
  // Close any open strings, then close the containers in reverse order.
  let out = s.slice(0, cut);
  if (inString) out += '"';
  for (let i = stack.length - 1; i >= 0; i--) out += stack[i] === "{" ? "}" : "]";
  return out;
};

const statusFromToolName = (toolName: string): StatusInfo => {
  switch (toolName) {
    case "read":
      return { phase: "analyzing", message: { key: "reading" } };
    case "view_image":
      return { phase: "analyzing", message: { key: "viewing_image" } };
    case "grep":
    case "find":
      return { phase: "analyzing", message: { key: "searching" } };
    case "ls":
    case "tree":
    case "bash":
      return { phase: "analyzing", message: { key: "exploring" } };
    case "set_output_data":
    case "update_output_data":
      return { phase: "extracting", message: { key: "extracting_data" } };
    case "finish":
      return { phase: "extracting", message: { key: "finalizing" } };
    case "fail":
      return { phase: "failed" };
    default:
      return { phase: "extracting" };
  }
};

const defaultSystemPrompt = (
  schema: string,
  outputInstructions?: string,
  fileTree?: string,
  manifestContent?: string,
) => {
  const fileTreeSection = fileTree
    ? `\n## File System Structure\n\n\`\`\`\n${fileTree}\n\`\`\`\n`
    : "";

  const manifestSection = manifestContent
    ? `\n## Manifest (Summary of Artifacts)\n\n\`\`\`json\n${manifestContent}\n\`\`\`\n`
    : "";

  return `You are an autonomous data extraction agent. Your task is to explore the provided artifacts and extract structured data according to the given JSON schema.

## Your Environment
You have access to a virtual filesystem:
- "/artifact.json" - All artifacts in structured JSON format (full data)
- "/manifest.json" - Summary and metadata (already provided below)
- "/images/" - Virtual directory with extracted images

${fileTreeSection}${manifestSection}
## Available Tools
- read(file_path, offset=1, limit=200) - Read file lines. limit: max 1000
- view_image(image_path) - View an image
- bash(command) - Run shell command
- grep(pattern, path, options?) - Search file for pattern
- find(path, name?) - Find files by name
- ls(path, recursive?) - List directory contents
- tree(path, depth=3) - Show directory tree

### Output Management Tools
- set_output_data(data) - Save extraction results
- update_output_data(changes) - Add/modify fields (deep merge)
- finish() - Complete extraction when done
- fail(reason) - Mark extraction failed

### Reading Strategy
ALWAYS use pagination (offset + limit) when reading large files. Start with offset=1, limit=200 and increment offset for subsequent reads. Never omit limit - it defaults to 200 lines. Adjust chunk size based on data type: ~100 lines for dense/structured data, ~300 for narrative text.

## Efficient Exploration
- All document content is already in /artifact.json (full text of every page) and /manifest.json (summary, shown above).
- The file tree above already describes the complete filesystem — do NOT use ls, find, tree, grep, or bash to explore it.
- Read /artifact.json directly and extract. Paginate (offset/limit) only if a read is truncated.
- Use view_image only when the schema requires visual content (e.g. floorplans or photos).

## CRITICAL: Incremental Updates
1. If data was already extracted in previous iterations, use set_output_data to preserve it
2. Call update_output_data to add new fields as you discover them
3. Call finish() when done

${outputInstructions ? `\n## Additional Instructions\n\n${outputInstructions}\n` : ""}

## JSON Schema
${schema}

Remember:
1. ALWAYS use set_output_data/update_output_data when you find information
2. ALWAYS call finish() when done (or fail() if impossible)`;
};

export class AgentStrategy<T> implements ExtractionStrategy<T> {
  public name = "agent";
  private config: AgentStrategyConfig;

  constructor(config: AgentStrategyConfig) {
    this.config = config;
  }

  getEstimatedSteps(): number {
    return (this.config.maxIterations ?? 1) * (this.config.maxSteps ?? 50);
  }

  async run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>> {
    const debug = options.debug ?? this.config.debug;
    const { telemetry } = options;
    const maxSteps = this.config.maxSteps ?? 50;
    const maxIterations = this.config.maxIterations ?? 1;
    const stepTimeoutMs = this.config.stepTimeoutMs ?? 5 * 60 * 1000; // 5 minutes per step

    const agentSpan = telemetry?.startSpan({
      name: "strategy.agent",
      kind: "AGENT",
      attributes: {
        "strategy.name": this.name,
        "agent.max_steps": maxSteps,
        "agent.max_iterations": maxIterations,
        "agent.model": this.config.model
          ? typeof this.config.model === "string"
            ? this.config.model
            : "custom"
          : `${this.config.provider}/${this.config.modelId}`,
        "agent.artifacts.count": options.artifacts.length,
      },
    });

    await options.events?.onStep?.({
      step: 1,
      total: this.getEstimatedSteps(),
      label: "agent_explore",
    });
    emitStatus(options.events, { phase: "analyzing", message: { key: "exploring" } });

    const filesystem = createVirtualFilesystem(options.artifacts);
    const files: Record<string, string> = {
      "/artifact.json": filesystem["/artifact.json"],
      "/manifest.json": filesystem["/manifest.json"],
    };
    for (const [path, content] of filesystem.virtualFiles) {
      files[path] = content;
    }

    const bash = new Bash({ files, cwd: "/" });
    const schema = JSON.stringify(options.schema, null, 2);

    // Build file tree for system prompt (show max 10 images)
    const buildFileTree = async (): Promise<string> => {
      // Get root directory contents
      const rootResult = await bash.exec("ls -la /");
      const rootLines = rootResult.stdout
        .split("\n")
        .filter(
          (l: string) => l && !l.startsWith("total") && !l.endsWith(".") && !l.endsWith(".."),
        );

      let tree = "/\n";

      for (const line of rootLines) {
        const parts = line.split(/\s+/);
        const name = parts[parts.length - 1];
        if (!name) continue;

        const isDir = line.startsWith("d");

        if (name === "images" && isDir) {
          // Handle images directory specially - show max 10 images
          const imgResult = await bash.exec("ls /images/");
          const images = imgResult.stdout.split("\n").filter((i: string) => i.trim());
          const totalImages = images.length;
          const shownImages = images.slice(0, 10);

          tree += `├── images/ (${totalImages > 10 ? `showing 10 of ${totalImages}` : totalImages} files)\n`;
          for (let i = 0; i < shownImages.length; i++) {
            const img = shownImages[i];
            const isLast = i === shownImages.length - 1 && totalImages <= 10;
            tree += `│   ${isLast ? "└──" : "├──"} ${img}\n`;
          }
          if (totalImages > 10) {
            tree += `│   └── ... (${totalImages - 10} more images)\n`;
          }
        } else {
          tree += `├── ${name}${isDir ? "/" : ""}\n`;
        }
      }

      return tree;
    };

    const fileTree = await buildFileTree();
    const manifestContent = filesystem["/manifest.json"];

    const callId = `agent_${Date.now()}`;
    debug?.llmCallStart({
      callId,
      model: this.config.model
        ? typeof this.config.model === "string"
          ? this.config.model
          : "custom"
        : "default",
      schemaName: "extract",
      systemLength: 0,
      userLength: 0,
      artifactCount: options.artifacts.length,
    });

    const startTime = Date.now();
    let aiModel: AiSdkModel;

    if (this.config.model) {
      aiModel =
        typeof this.config.model === "string"
          ? await resolveModel(this.config.model)
          : this.config.model;
    } else if (this.config.provider && this.config.modelId) {
      aiModel = await resolveModel(`${this.config.provider}/${this.config.modelId}`);
    } else {
      throw new Error("Model not configured.");
    }

    await options.events?.onStep?.({
      step: 2,
      total: this.getEstimatedSteps(),
      label: "agent_init",
    });
    emitStatus(options.events, { phase: "analyzing", message: { key: "initializing" } });

    const deepMerge = (target: any, source: any): any => {
      const output = Object.assign({}, target);
      if (target && typeof target === "object" && source && typeof source === "object") {
        Object.keys(source).forEach((key) => {
          if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
            if (!(key in target)) Object.assign(output, { [key]: source[key] });
            else output[key] = deepMerge(target[key], source[key]);
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    };

    let currentOutput: any = null;
    let extractionFailed = false;
    let failureReason: string | null = null;
    let iterationCount = 0;
    let isComplete = false;
    const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

    // Auto-detect vision support from model APIs if vision not explicitly set
    let visionEnabled = this.config.vision ?? false;
    if (this.config.vision === undefined && this.config.provider && this.config.modelId) {
      try {
        if (this.config.provider === "openrouter") {
          // Use OpenRouter API for OpenRouter models
          const response = await fetch(
            `https://openrouter.ai/api/v1/models/${this.config.modelId}`,
          );
          if (response.ok) {
            const modelData: any = await response.json();
            const inputModalities = modelData?.data?.architecture?.input_modalities || [];
            visionEnabled = inputModalities.includes("image");
          }
        } else {
          // Use models.dev for other providers
          const response = await fetch("https://models.dev/api.json");
          if (response.ok) {
            const allModels: any = await response.json();
            const providerData = allModels[this.config.provider];
            if (providerData?.models) {
              const modelData = providerData.models[this.config.modelId];
              if (modelData?.modalities?.input) {
                visionEnabled = modelData.modalities.input.includes("image");
              }
            }
          }
        }
      } catch {
        // Fall back to false if API fails
      }
    }

    // Emit vision status for CLI to display
    await options.events?.onVisionStatus?.({
      enabled: visionEnabled,
      provider: this.config.provider || "unknown",
      modelId: this.config.modelId || "unknown",
    });

    const tools = (_iteration: number): any => ({
      bash: tool({
        description: "Execute bash commands",
        inputSchema: z.object({ command: z.string() }),
        execute: async (params: { command: string }) => {
          const result = await bash.exec(params.command);
          return {
            content: [
              {
                type: "text",
                text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}`,
              },
            ],
          };
        },
      }),
      read: tool({
        description: "Read file contents. Default: 200 lines. Max: 1000 lines per read.",
        inputSchema: z.object({
          file_path: z.string().describe("The absolute path to the file to read"),
          offset: z
            .number()
            .min(1)
            .default(1)
            .optional()
            .describe("Line number to start from (1-indexed)"),
          limit: z
            .number()
            .min(1)
            .max(1000)
            .default(200)
            .optional()
            .describe("Number of lines to read (max 1000, default 200)"),
        }),
        execute: async (params: { file_path: string; offset?: number; limit?: number }) => {
          const filePath = params.file_path;
          if (!filePath) {
            return {
              content: [
                { type: "text", text: "Error: No file path provided (expected 'file_path')" },
              ],
            };
          }

          const limit = Math.min(params.limit ?? 200, 1000);
          const startLine = params.offset ?? 1;
          const endLine = startLine + limit - 1;

          const cmd = `sed -n '${startLine},${endLine}p' "${filePath}"`;
          const result = await bash.exec(cmd);
          return { content: [{ type: "text", text: result.stdout || result.stderr }] };
        },
      }),
      grep: tool({
        description: "Search for patterns",
        inputSchema: z.object({
          pattern: z.string(),
          path: z.string(),
          options: z.string().optional(),
        }),
        execute: async (params: { pattern: string; path: string; options?: string }) => {
          const result = await bash.exec(
            `grep ${params.options || ""} "${params.pattern}" "${params.path}"`,
          );
          return { content: [{ type: "text", text: result.stdout || "(no matches)" }] };
        },
      }),
      find: tool({
        description: "Find files",
        inputSchema: z.object({ path: z.string(), name: z.string().optional() }),
        execute: async (params: { path: string; name?: string }) => {
          const cmd = params.name
            ? `find "${params.path}" -type f -name "${params.name}"`
            : `find "${params.path}" -type f`;
          const result = await bash.exec(cmd);
          return { content: [{ type: "text", text: result.stdout || "(no files)" }] };
        },
      }),
      ls: tool({
        description: "List directory",
        inputSchema: z.object({ path: z.string(), recursive: z.boolean().optional() }),
        execute: async (params: { path: string; recursive?: boolean }) => {
          const cmd = params.recursive ? `ls -laR "${params.path}"` : `ls -la "${params.path}"`;
          const result = await bash.exec(cmd);
          return { content: [{ type: "text", text: result.stdout || result.stderr }] };
        },
      }),
      tree: tool({
        description: "Display directory tree structure",
        inputSchema: z.object({ path: z.string(), depth: z.number().optional() }),
        execute: async (params: { path: string; depth?: number }) => {
          const targetPath = params.path || "/";
          const maxDepth = params.depth || 3;

          // Build tree structure using bash commands
          const buildTree = async (dir: string, depth: number, prefix: string): Promise<string> => {
            if (depth > maxDepth) return "";

            // Get directory contents
            const lsResult = await bash.exec(`ls -la "${dir}"`);
            const lines = lsResult.stdout
              .split("\n")
              .filter(
                (l: string) => l && !l.startsWith("total") && !l.endsWith(".") && !l.endsWith(".."),
              );

            let output = "";
            for (let i = 0; i < lines.length; i++) {
              const line: string | undefined = lines[i];
              if (!line) continue;

              const isLast = i === lines.length - 1;
              const parts = line.split(/\s+/);
              const name: string | undefined = parts[parts.length - 1];
              if (!name) continue;

              const isDir = line.startsWith("d");

              const connector = isLast ? "└── " : "├── ";
              output += `${prefix}${connector}${name}${isDir ? "/" : ""}\n`;

              if (isDir && depth < maxDepth) {
                const subDir = dir === "/" ? `/${name}` : `${dir}/${name}`;
                const subPrefix = prefix + (isLast ? "    " : "│   ");
                output += await buildTree(subDir, depth + 1, subPrefix);
              }
            }
            return output;
          };

          const treeOutput = await buildTree(targetPath, 1, "");
          return { content: [{ type: "text", text: treeOutput || `${targetPath}\n(empty)` }] };
        },
      }),
      view_image: tool({
        description: visionEnabled ? "View an image" : "View image metadata (no vision support)",
        inputSchema: z.object({ image_path: z.string() }),
        execute: async (params: { image_path: string }) => {
          const imageData = filesystem.getImageByPath?.(params.image_path);
          if (!imageData) return { notFound: true, path: params.image_path };

          const fmt = params.image_path.endsWith(".png") ? "image/png" : "image/jpeg";
          debug?.agentToolCallFinish({
            callId,
            toolName: "view_image",
            resultSnippet: `path: ${params.image_path}, base64: ${imageData.length} chars, mimeType: ${fmt}, vision: ${visionEnabled}`,
          });
          return { imageData, mimeType: fmt, path: params.image_path };
        },
        toModelOutput: async ({ output }) => {
          if ((output as any)?.notFound) {
            return {
              type: "content" as const,
              value: [{ type: "text" as const, text: `Image not found: ${(output as any).path}` }],
            };
          }

          const { imageData, mimeType, path } = output as {
            imageData: string;
            mimeType: string;
            path: string;
          };

          if (visionEnabled) {
            return {
              type: "content" as const,
              value: [
                { type: "text" as const, text: `[Image: ${path}]` },
                {
                  type: "media" as const,
                  data: imageData,
                  mediaType: mimeType as "image/png" | "image/jpeg",
                },
              ],
            };
          } else {
            return {
              type: "content" as const,
              value: [{ type: "text" as const, text: `[Image: ${path}]` }],
            };
          }
        },
      }),
      set_output_data: tool({
        description: "Set output data",
        inputSchema: z.object({ data: z.any() }) as any,
        execute: async (params: any) => {
          currentOutput = params.data;
          return { content: [{ type: "text", text: "Output set" }] };
        },
      }),
      update_output_data: tool({
        description: "Update output data",
        inputSchema: z.object({ changes: z.record(z.string(), z.any()) }) as any,
        execute: async (params: any) => {
          if (currentOutput === null)
            return { content: [{ type: "text", text: "Error: Use set_output_data first" }] };
          currentOutput = deepMerge(currentOutput, params.changes);
          return { content: [{ type: "text", text: "Output updated" }] };
        },
      }),
      finish: tool({
        description: "Complete extraction",
        inputSchema: z.object({}),
        execute: async () => {
          if (currentOutput === null)
            return { content: [{ type: "text", text: "Error: No data" }] };
          isComplete = true;
          return { content: [{ type: "text", text: "Complete" }] };
        },
      }),
      fail: tool({
        description: "Mark as failed",
        inputSchema: z.object({ reason: z.string() }),
        execute: async (params: { reason: string }) => {
          extractionFailed = true;
          failureReason = params.reason;
          return { content: [{ type: "text", text: `Failed: ${params.reason}` }] };
        },
      }),
    });

    for (let iter = 0; iter < maxIterations && !isComplete && !extractionFailed; iter++) {
      iterationCount = iter + 1;

      await options.events?.onStep?.({
        step: 1 + iter * maxSteps,
        total: this.getEstimatedSteps(),
        label: `iteration_${iterationCount}`,
      });
      emitStatus(options.events, {
        phase: "extracting",
        message: { key: "iteration", params: { current: iterationCount } },
      });

      const systemPrompt =
        this.config.systemPrompt ??
        defaultSystemPrompt(
          schema,
          this.config.outputInstructions,
          fileTree,
          manifestContent,
        );

      debug?.promptSystem({ callId, system: systemPrompt });

      // Keep the system prompt stable so prompt caching can hit. Volatile data
      // (the growing extraction) goes in the user message tail, not the prefix.
      const userMessage = currentOutput
        ? `Continue extraction using the data below. Preserve it with set_output_data, add remaining fields, then call finish().\n\n## Previously Extracted Data\n${JSON.stringify(currentOutput, null, 2)}`
        : "Begin exploring the artifacts. Read manifest, then extract data. Use set_output_data and finish() tools.";

      const messages: any[] = [{ role: "user", content: userMessage }];
      let stepCount = 0;
      const iterMaxSteps = maxSteps;

      while (stepCount < iterMaxSteps && !isComplete && !extractionFailed) {
        const stepNumber = stepCount + 1;
        debug?.agentStepStart({
          callId,
          step: stepNumber,
          maxSteps: iterMaxSteps,
          messagesInHistory: messages.length,
        });

        const stepStart = Date.now();
        const abortController = new AbortController();
        const timeoutId = setTimeout(
          () =>
            abortController.abort(
              new Error(`Step ${stepNumber} timed out after ${stepTimeoutMs}ms`),
            ),
          stepTimeoutMs,
        );

        let result: any;
        try {
          result = await generateText({
            model: aiModel as any,
            system: systemPrompt,
            messages,
            tools: tools(iterationCount) as any,
            abortSignal: abortController.signal,
            ...(this.config.provider === "openrouter" && this.config.reasoningEffort
              ? {
                  providerOptions: {
                    openrouter: {
                      reasoning: { effort: this.config.reasoningEffort },
                    },
                  },
                }
              : {}),
            experimental_onToolCallStart: async (params: any) => {
              const toolCall = params.toolCall;
              const toolName = toolCall?.toolName as string;
              const args = toolCall?.input as Record<string, unknown>;
              debug?.agentToolCallStart({
                callId,
                toolName,
                args,
              });
              await options.events?.onAgentToolStart?.({
                toolName,
                toolCallId: toolCall?.toolCallId as string,
                args,
              });
              emitStatus(options.events, statusFromToolName(toolName));
            },
            experimental_onToolCallFinish: async (params: any) => {
              const toolCall = params.toolCall;
              const toolName = toolCall?.toolName;
              const toolCallId = toolCall?.toolCallId;
              const output = params.output;
              const error = params.error;
              const duration = params.durationMs;

              debug?.agentToolCallFinish({
                callId,
                toolName: toolName ?? "unknown",
                durationMs: duration,
                error: error?.message,
                resultSnippet:
                  toolName === "view_image" && (output as any)?.imageData
                    ? `image data: ${(output as any).imageData.length} chars`
                    : undefined,
              });

              // Extract text from tool result
              let resultText: string;
              if (error) {
                resultText = `Error: ${error.message}`;
              } else if (typeof output === "string") {
                resultText = output;
              } else if (output?.content?.[0]?.text) {
                resultText = output.content[0].text;
              } else if (output?.content?.[0]?.type === "text") {
                resultText = output.content[0].text;
              } else {
                resultText = JSON.stringify(output).slice(0, 200);
              }

              await options.events?.onAgentToolEnd?.({
                toolCallId: toolCallId as string,
                result: { text: resultText } as any,
              });

              // Check for finish/fail tools - only succeed if no error and output indicates success
              if (toolName === "finish" && !error && resultText === "Complete") {
                isComplete = true;
              }
              if (
                toolName === "fail" ||
                (toolName === "finish" && resultText === "Error: No data")
              ) {
                extractionFailed = true;
                failureReason =
                  toolName === "fail"
                    ? typeof output === "object" && output?.reason
                      ? output.reason
                      : "Unknown error"
                    : "finish called without setting output data first";
              }
            },
          });
        } finally {
          clearTimeout(timeoutId);
        }

        const stepDuration = Date.now() - stepStart;
        debug?.agentStepComplete({
          callId,
          step: stepNumber,
          durationMs: stepDuration,
          toolCalls: result.toolCalls?.length || 0,
          textSnippet: (result.text || "").slice(0, 100),
        });

        // Accumulate real token usage from this generateText step.
        if (result.usage) {
          totalUsage.inputTokens += result.usage.inputTokens ?? 0;
          totalUsage.outputTokens += result.usage.outputTokens ?? 0;
          totalUsage.totalTokens += result.usage.totalTokens ?? 0;
        }

        stepCount++;

        // Emit thinking/reasoning if available (skip empty arrays/strings)
        const reasoningText = result.reasoning || result.text;
        if (reasoningText && reasoningText.length > 0 && typeof reasoningText === "string") {
          await options.events?.onAgentReasoning?.({ thought: reasoningText });
        }

        // Add all response messages (assistant + tool results) to conversation history
        if (result.response?.messages) {
          messages.push(...result.response.messages);
        }

        // Observation masking: once an image has been viewed, its base64 payload is
        // re-fetchable from the virtual filesystem. Keep a short placeholder in history
        // so we don't re-send megabytes on every subsequent step, and so the context
        // prefix stays stable enough for prompt caching to hit.
        if (this.config.purgeImages !== false) {
          maskImagePayloads(messages);
        }

        if (!result.toolCalls?.length && result.text) break;
      }

      await options.events?.onStep?.({
        step: iterationCount * maxSteps,
        total: this.getEstimatedSteps(),
        label: `iteration_${iterationCount}_complete`,
      });
      emitStatus(options.events, { phase: "extracting", message: { key: "extracting_data" } });
    }

    const durationMs = Date.now() - startTime;

    if (extractionFailed) throw new Error(`Extraction failed: ${failureReason}`);

    let extractedData: T;
    if (currentOutput !== null) {
      // If we have output but finish wasn't called, accept it anyway
      // This handles cases where the agent produces output but doesn't explicitly finish
      extractedData = parseOutputData(currentOutput) as T;
    } else {
      throw new Error("Agent did not produce any output data.");
    }

    debug?.llmCallComplete({
      callId,
      success: true,
      inputTokens: totalUsage.inputTokens,
      outputTokens: totalUsage.outputTokens,
      totalTokens: totalUsage.totalTokens,
      durationMs,
    });
    await options.events?.onStep?.({
      step: this.getEstimatedSteps(),
      total: this.getEstimatedSteps(),
      label: "extract",
    });
    emitStatus(options.events, { phase: "extracting", message: { key: "finalizing" } });

    if (agentSpan && telemetry)
      telemetry.endSpan(agentSpan, { status: "ok", output: extractedData });

    return {
      data: extractedData,
      usage: totalUsage,
      images: Object.fromEntries(filesystem.virtualFiles),
    };
  }
}

export const agent = <T>(config: AgentStrategyConfig) => new AgentStrategy<T>(config);
