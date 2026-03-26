import type {
  Artifact,
  ExtractionOptions,
  ExtractionResult,
  ExtractionStrategy,
  Usage,
} from "../../types";
import type { createDebugLogger } from "../../debug/logger";
import { resolveModel, type AiSdkModel } from "../../llm/resolveModel";
import { generateText } from "ai";
import { Bash } from "just-bash";
import { createVirtualFilesystem } from "./ArtifactFilesystem";
import { z } from "zod";

export type AgentStrategyConfig = {
  model?: string | AiSdkModel;
  provider?: string;
  modelId?: string;
  maxSteps?: number;
  maxIterations?: number;
  outputInstructions?: string;
  systemPrompt?: string;
  verbose?: boolean;
  debug?: ReturnType<typeof createDebugLogger>;
  vision?: boolean; // Enable image viewing for vision-capable models
};

const defaultSystemPrompt = (schema: string, outputInstructions?: string, carriedData?: any, fileTree?: string, manifestContent?: string) => {
  const carriedContext = carriedData
    ? `\n## Previously Extracted Data (carry forward)\nThe following data was already extracted in previous iterations. Preserve and extend it:\n${JSON.stringify(carriedData, null, 2)}\n\nIMPORTANT: Start by setting this data with set_output_data, then continue extracting remaining fields.`
    : "";

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

## CRITICAL: Incremental Updates
1. If data was already extracted in previous iterations, use set_output_data to preserve it
2. Call update_output_data to add new fields as you discover them
3. Call finish() when done

${carriedContext}
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

    const agentSpan = telemetry?.startSpan({
      name: "strategy.agent",
      kind: "AGENT",
      attributes: {
        "strategy.name": this.name,
        "agent.max_steps": maxSteps,
        "agent.max_iterations": maxIterations,
        "agent.model": this.config.model
          ? typeof this.config.model === "string" ? this.config.model : "custom"
          : `${this.config.provider}/${this.config.modelId}`,
        "agent.artifacts.count": options.artifacts.length,
      },
    });

    await options.events?.onStep?.({ step: 1, total: this.getEstimatedSteps(), label: "agent_explore" });

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
      const rootLines = rootResult.stdout.split('\n').filter((l: string) => 
        l && !l.startsWith('total') && !l.endsWith('.') && !l.endsWith('..')
      );
      
      let tree = "/\n";
      
      for (const line of rootLines) {
        const parts = line.split(/\s+/);
        const name = parts[parts.length - 1];
        if (!name) continue;
        
        const isDir = line.startsWith('d');
        
        if (name === "images" && isDir) {
          // Handle images directory specially - show max 10 images
          const imgResult = await bash.exec("ls /images/");
          const images = imgResult.stdout.split('\n').filter((i: string) => i.trim());
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
      model: this.config.model ? (typeof this.config.model === "string" ? this.config.model : "custom") : "default",
      schemaName: "extract",
      systemLength: 0,
      userLength: 0,
      artifactCount: options.artifacts.length,
    });

    const startTime = Date.now();
    let aiModel: AiSdkModel;

    if (this.config.model) {
      aiModel = typeof this.config.model === "string" ? await resolveModel(this.config.model) : this.config.model;
    } else if (this.config.provider && this.config.modelId) {
      aiModel = await resolveModel(`${this.config.provider}/${this.config.modelId}`);
    } else {
      throw new Error("Model not configured.");
    }

    await options.events?.onStep?.({ step: 2, total: this.getEstimatedSteps(), label: "agent_init" });

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

    // Auto-detect vision support from model APIs if vision not explicitly set
    let visionEnabled = this.config.vision ?? false;
    if (this.config.vision === undefined && this.config.provider && this.config.modelId) {
      try {
        if (this.config.provider === "openrouter") {
          // Use OpenRouter API for OpenRouter models
          const response = await fetch(`https://openrouter.ai/api/v1/models/${this.config.modelId}`);
          if (response.ok) {
            const modelData: any = await response.json();
            const inputModalities = modelData?.data?.architecture?.input_modalities || [];
            visionEnabled = inputModalities.includes("image");
          }
        } else {
          // Use models.dev for other providers
          const response = await fetch('https://models.dev/api.json');
          if (response.ok) {
            const allModels: any = await response.json();
            const providerData = allModels[this.config.provider];
            if (providerData?.models) {
              const modelData = providerData.models[this.config.modelId];
              if (modelData?.modalities?.input) {
                visionEnabled = modelData.modalities.input.includes('image');
              }
            }
          }
        }
      } catch (e) {
        // Fall back to false if API fails
      }
    }
    
    // Emit vision status for CLI to display
    await options.events?.onVisionStatus?.({ 
      enabled: visionEnabled, 
      provider: this.config.provider || 'unknown', 
      modelId: this.config.modelId || 'unknown' 
    });
    
    const tools = (iteration: number): any => ({
      bash: {
        name: "bash", description: "Execute bash commands",
        parameters: z.object({ command: z.string() }),
        execute: async (params: any) => {
          const result = await bash.exec(params.command);
          return { content: [{ type: "text", text: result.exitCode === 0 ? result.stdout : `Error: ${result.stderr}` }] };
        },
      },
      read: {
        name: "read", description: "Read file contents. Default: 200 lines. Max: 1000 lines per read.",
        parameters: z.object({ 
          file_path: z.string().describe("The absolute path to the file to read"), 
          offset: z.number().min(1).default(1).optional().describe("Line number to start from (1-indexed)"), 
          limit: z.number().min(1).max(1000).default(200).optional().describe("Number of lines to read (max 1000, default 200)")
        }),
        execute: async (params: any) => {
          // Handle both file_path and path (some models send path instead)
          const filePath = params.file_path || params.path;
          if (!filePath) {
            return { content: [{ type: "text", text: "Error: No file path provided (expected 'file_path')" }] };
          }
          
          // Use zod defaults/validation from schema
          const limit = Math.min(params.limit || 200, 1000);
          const startLine = params.offset || 1;
          const endLine = startLine + limit - 1;
          
          const cmd = `sed -n '${startLine},${endLine}p' "${filePath}"`;
          const result = await bash.exec(cmd);
          return { content: [{ type: "text", text: result.stdout || result.stderr }] };
        },
      },
      grep: {
        name: "grep", description: "Search for patterns",
        parameters: z.object({ pattern: z.string(), path: z.string(), options: z.string().optional() }),
        execute: async (params: any) => {
          const result = await bash.exec(`grep ${params.options || ""} "${params.pattern}" "${params.path}"`);
          return { content: [{ type: "text", text: result.stdout || "(no matches)" }] };
        },
      },
      find: {
        name: "find", description: "Find files",
        parameters: z.object({ path: z.string(), name: z.string().optional() }),
        execute: async (params: any) => {
          const cmd = params.name ? `find "${params.path}" -type f -name "${params.name}"` : `find "${params.path}" -type f`;
          const result = await bash.exec(cmd);
          return { content: [{ type: "text", text: result.stdout || "(no files)" }] };
        },
      },
      ls: {
        name: "ls", description: "List directory",
        parameters: z.object({ path: z.string(), recursive: z.boolean().optional() }),
        execute: async (params: any) => {
          const cmd = params.recursive ? `ls -laR "${params.path}"` : `ls -la "${params.path}"`;
          const result = await bash.exec(cmd);
          return { content: [{ type: "text", text: result.stdout || result.stderr }] };
        },
      },
      tree: {
        name: "tree", description: "Display directory tree structure",
        parameters: z.object({ path: z.string(), depth: z.number().optional() }),
        execute: async (params: any) => {
          const targetPath = params.path || "/";
          const maxDepth = params.depth || 3;
          
          // Build tree structure using bash commands
          const buildTree = async (dir: string, depth: number, prefix: string): Promise<string> => {
            if (depth > maxDepth) return "";
            
            // Get directory contents
            const lsResult = await bash.exec(`ls -la "${dir}"`);
            const lines = lsResult.stdout.split('\n').filter((l: string) => l && !l.startsWith('total') && !l.endsWith('.') && !l.endsWith('..'));
            
            let output = "";
            for (let i = 0; i < lines.length; i++) {
              const line: string | undefined = lines[i];
              if (!line) continue;
              
              const isLast = i === lines.length - 1;
              const parts = line.split(/\s+/);
              const name: string | undefined = parts[parts.length - 1];
              if (!name) continue;
              
              const isDir = line.startsWith('d');
              
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
      },
      view_image: {
        name: "view_image", description: visionEnabled ? "View an image" : "View image metadata (no vision support)",
        parameters: z.object({ image_path: z.string() }),
        execute: async (params: any) => {
          const imageData = filesystem.getImageByPath?.(params.image_path);
          if (!imageData) return { content: [{ type: "text", text: "Image not found" }] };
          
          if (visionEnabled) {
            // Return actual image data for vision-capable models
            const fmt = params.image_path.endsWith(".png") ? "image/png" : "image/jpeg";
            return { content: [{ type: "text", text: `[Image: ${params.image_path}]` }, { type: "image", data: imageData, mimeType: fmt }] };
          } else {
            // Return placeholder for non-vision models to avoid context bloat
            return { content: [{ type: "text", text: `[Image: ${params.image_path}]` }] };
          }
        },
      },
      set_output_data: {
        name: "set_output_data", description: "Set output data",
        parameters: z.object({ data: z.any() }),
        execute: async (params: any) => {
          currentOutput = params.data;
          return { content: [{ type: "text", text: "Output set" }] };
        },
      },
      update_output_data: {
        name: "update_output_data", description: "Update output data",
        parameters: z.object({ changes: z.record(z.string(), z.any()) }),
        execute: async (params: any) => {
          if (currentOutput === null) return { content: [{ type: "text", text: "Error: Use set_output_data first" }] };
          currentOutput = deepMerge(currentOutput, params.changes);
          return { content: [{ type: "text", text: "Output updated" }] };
        },
      },
      finish: {
        name: "finish", description: "Complete extraction",
        parameters: z.object({}),
        execute: async () => {
          if (currentOutput === null) return { content: [{ type: "text", text: "Error: No data" }] };
          isComplete = true;
          return { content: [{ type: "text", text: "Complete" }] };
        },
      },
      fail: {
        name: "fail", description: "Mark as failed",
        parameters: z.object({ reason: z.string() }),
        execute: async (params: any) => {
          extractionFailed = true;
          failureReason = params.reason;
          return { content: [{ type: "text", text: `Failed: ${params.reason}` }] };
        },
      },
    });

    for (let iter = 0; iter < maxIterations && !isComplete && !extractionFailed; iter++) {
      iterationCount = iter + 1;

      await options.events?.onStep?.({
        step: 1 + iter * maxSteps,
        total: this.getEstimatedSteps(),
        label: `iteration_${iterationCount}`,
      });

      const systemPrompt = this.config.systemPrompt ?? defaultSystemPrompt(schema, this.config.outputInstructions, currentOutput, fileTree, manifestContent);

      debug?.promptSystem({ callId, system: systemPrompt });

      const userMessage = currentOutput
        ? `Continue extraction. Previously extracted data is provided in system prompt. Use set_output_data to preserve it, then add remaining fields. Use finish() when complete.`
        : "Begin exploring the artifacts. Read manifest, then extract data. Use set_output_data and finish() tools.";

      const messages: any[] = [{ role: "user", content: userMessage }];
      let stepCount = 0;
      const iterMaxSteps = maxSteps;

      while (stepCount < iterMaxSteps && !isComplete && !extractionFailed) {
        const result: any = await generateText({
          model: aiModel as any,
          system: systemPrompt,
          messages,
          tools: tools(iterationCount) as any,
          experimental_onToolCallStart: async (params: any) => {
            const toolCall = params.toolCall;
            await options.events?.onAgentToolStart?.({
              toolName: toolCall?.toolName as string,
              toolCallId: toolCall?.toolCallId as string,
              args: toolCall?.input as Record<string, unknown>,
            });
          },
          experimental_onToolCallFinish: async (params: any) => {
            const toolCall = params.toolCall;
            const toolName = toolCall?.toolName;
            const toolCallId = toolCall?.toolCallId;
            const output = params.output;
            const error = params.error;
            
            // Extract text from tool result
            let resultText: string;
            if (error) {
              resultText = `Error: ${error.message}`;
            } else if (typeof output === 'string') {
              resultText = output;
            } else if (output?.content?.[0]?.text) {
              resultText = output.content[0].text;
            } else if (output?.content?.[0]?.type === 'text') {
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
            if (toolName === "fail" || (toolName === "finish" && resultText === "Error: No data")) { 
              extractionFailed = true; 
              failureReason = toolName === "fail" 
                ? (typeof output === 'object' && output?.reason ? output.reason : 'Unknown error')
                : 'finish called without setting output data first';
            }
          },
        });

        stepCount++;

        // Emit thinking/reasoning if available (skip empty arrays/strings)
        const reasoningText = result.reasoning || result.text;
        if (reasoningText && reasoningText.length > 0 && typeof reasoningText === 'string') {
          await options.events?.onAgentReasoning?.({ thought: reasoningText });
        }

        // Add all response messages (assistant + tool results) to conversation history
        if (result.response?.messages) {
          messages.push(...result.response.messages);
        }

        if (!result.toolCalls?.length && result.text) break;
      }

      await options.events?.onStep?.({
        step: (iterationCount) * maxSteps,
        total: this.getEstimatedSteps(),
        label: `iteration_${iterationCount}_complete`,
      });
    }

    const durationMs = Date.now() - startTime;

    if (extractionFailed) throw new Error(`Extraction failed: ${failureReason}`);

    let extractedData: T;
    if (currentOutput !== null) {
      // If we have output but finish wasn't called, accept it anyway
      // This handles cases where the agent produces output but doesn't explicitly finish
      extractedData = currentOutput as T;
    } else {
      throw new Error("Agent did not produce any output data.");
    }

    debug?.llmCallComplete({ callId, success: true, inputTokens: 0, outputTokens: 0, totalTokens: 0, durationMs });
    await options.events?.onStep?.({ step: this.getEstimatedSteps(), total: this.getEstimatedSteps(), label: "extract" });

    if (agentSpan && telemetry) telemetry.endSpan(agentSpan, { status: "ok", output: extractedData });

    return { data: extractedData, usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } };
  }
}

export const agent = <T>(config: AgentStrategyConfig) => new AgentStrategy<T>(config);