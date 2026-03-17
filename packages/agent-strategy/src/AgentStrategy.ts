import type {
  Artifact,
  ExtractionOptions,
  ExtractionResult,
  ExtractionStrategy,
  Usage,
} from "@struktur/sdk";
import type { createDebugLogger } from "@struktur/sdk";
import {
  createAgentSession,
  AuthStorage,
  ModelRegistry,
  SessionManager,
  SettingsManager,
  DefaultResourceLoader,
} from "@mariozechner/pi-coding-agent";
import { Bash } from "just-bash";
import { serializeArtifactsToFilesystem, createVirtualFilesystem } from "./ArtifactFilesystem";
import { createVirtualFilesystemTools } from "./AgentTools";

export type AgentStrategyConfig = {
  /** 
   * The model to use. Can be a pi Model or any model object with provider/id.
   * If not provided, uses the first available model from the registry.
   */
  model?: unknown;
  /** 
   * Provider name (e.g., 'anthropic', 'openai'). 
   * Used with modelId when model object not provided.
   */
  provider?: string;
  /** 
   * Model ID (e.g., 'claude-sonnet-4'). 
   * Used with provider when model object not provided.
   */
  modelId?: string;
  /** Maximum number of agent steps/turns allowed (default: 50) */
  maxSteps?: number;
  /** Additional extraction guidance to append to system prompt */
  outputInstructions?: string;
  /** Override the default system prompt entirely */
  systemPrompt?: string;
  /** 
   * API key for authentication. If not provided, uses environment variables
   * or auth storage (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
   */
  apiKey?: string;
  /** Custom agent directory for auth storage (default: ~/.pi/agent) */
  agentDir?: string;
  /** Enable verbose logging */
  verbose?: boolean;
  debug?: ReturnType<typeof createDebugLogger>;
};

const defaultSystemPrompt = (schema: string, outputInstructions?: string) => {
  return `You are an autonomous data extraction agent. Your task is to explore the provided artifacts and extract structured data according to the given JSON schema.

## Your Environment

You have access to a virtual filesystem containing the artifacts to extract from:
- "/artifact.json" - All artifacts in a structured JSON format (with embedded images replaced by virtual file paths)
- "/manifest.json" - Summary and metadata about the artifacts
- "/images/" - Virtual directory containing extracted image files (when artifacts have embedded images)

## Virtual Image Files

When artifacts contain embedded images (base64-encoded), they are extracted to separate files in "/images/" for easier access:
- Image files are named: "/images/{artifact-name}-page-{n}-image-{i}.{ext}"
  - {artifact-name}: Sanitized artifact ID (lowercase, special chars become dashes)
  - page-{n}: Page number from the artifact (if available)
  - image-{i}: Image index within that page
  - {ext}: File extension determined from base64 (jpg, png, gif, webp, bmp, svg, or bin)
- Examples: "/images/invoice-page-3-image-0.jpg" or "/images/report-image-1.png"
- Use the "/images/" directory to access image data
- The manifest shows which virtual files are available
- Image format is shown in the file extension for easy identification

## IMPORTANT: Do NOT Install Tools

This is a **sandboxed environment** - you CANNOT install packages or tools:
- ❌ DO NOT run: apt-get, pip install, npm install, brew install, etc.
- ❌ DO NOT try to install tesseract, ocrmypdf, poppler, or any OCR tools
- ❌ DO NOT check if tools exist with "which" or "command -v"
- ✅ ONLY use the provided tools listed below
- ✅ If a tool is missing, work with what you have or report it via fail()

## Available Tools

### Exploration Tools
- **read** - Read file contents with pagination support (e.g., read {"file_path": "/manifest.json", "limit": 50})
- **view_image** - View an image to see its contents visually (e.g., view_image {"image_path": "/images/doc-page-1-image-0.png"})
- **bash** - Run shell commands (e.g., bash {"command": "head -20 /artifact.json"})
- **grep** - Search for patterns in files
- **find** - Find files by name or pattern
- **ls** - List files and directories

### Output Management Tools (IMPORTANT - Use These!)
- **set_output_data** - Set the initial extraction output. Call this as soon as you find the first piece of data.
  - Example: set_output_data({"data": {"company_name": "Acme Corp"}})
  - The data can be any shape - you'll update it incrementally
  
- **update_output_data** - Add or modify fields in the existing output data
  - Example: update_output_data({"changes": {"address": "123 Main St"}})
  - This merges new data with existing data (deep merge)
  - Call this frequently as you discover more information
  
- **finish** - Call this when extraction is complete and data validates against the schema
  - Only works if the data is valid according to the schema
  - This ends the extraction successfully
  
- **fail** - Call this if the schema cannot be satisfied with available data
  - Provide a reason explaining what data was missing or why extraction failed

## CRITICAL: Incremental Data Updates

**You MUST update the output data continuously as you explore!**

1. **Start immediately**: As soon as you find the first field, call set_output_data
2. **Update frequently**: Every time you find new information, call update_output_data
3. **Build incrementally**: Don't wait until the end - keep adding data as you go
4. **Use all tools**: Combine exploration tools with output tools

### Example Workflow

1. Read manifest: read {"file_path": "/manifest.json", "limit": 20}
2. Find first data point: grep "company_name" /artifact.json
3. **Set initial data**: set_output_data({"data": {"company_name": "Acme Inc"}})
4. Continue exploring: read {"file_path": "/artifact.json", "offset": 50, "limit": 30}
5. **Update with more data**: update_output_data({"changes": {"address": "123 Main St", "city": "Berlin"}})
6. Check images: view_image {"image_path": "/images/doc-page-1-image-0.png"}
7. **Update again**: update_output_data({"changes": {"has_logo": true}})
8. Verify complete: Check all schema fields are present
9. **Finish**: finish()

## Efficient Exploration Strategy

**Don't read entire files at once.** Files may be large. Instead:

1. **Start small**: Read just the first 20-50 lines to understand the structure
2. **Navigate selectively**: Use offset and limit to jump to relevant sections
3. **Search first**: Use grep to find specific data before reading full content
4. **Iterate**: Make multiple small reads rather than one giant read
5. **Update as you go**: Call update_output_data immediately when you find data

### Pagination Examples

Read first 30 lines:
read {"file_path": "/artifact.json", "limit": 30}

Read lines 31-60 (page 2):
read {"file_path": "/artifact.json", "offset": 31, "limit": 30}

Read from line 100 to end:
read {"file_path": "/artifact.json", "offset": 100}

## Output Rules

- **Update continuously**: Call update_output_data every time you find new information
- **Start early**: Don't wait until the end - set initial data as soon as possible
- **Use null for missing values**: If a field can't be found, set it to null
- **Never guess**: Only extract information explicitly present in the artifacts
- **Validate as you go**: The tools will tell you if your data has validation issues
- **Finish properly**: You MUST call finish() to complete extraction successfully
- **Fail if needed**: Use fail() if the schema truly cannot be satisfied

${outputInstructions ? `\n## Additional Instructions\n\n${outputInstructions}\n` : ""}

## JSON Schema

${schema}

## CRITICAL: Tool Calling Format

When calling tools, you MUST provide the correct parameters:

**CORRECT - read with file_path:**
read {"file_path": "/manifest.json"}

**CORRECT - read with pagination:**
read {"file_path": "/artifact.json", "offset": 1, "limit": 50}

**CORRECT - view image:**
view_image {"image_path": "/images/doc-page-1-image-0.png"}

**CORRECT - set output data:**
set_output_data {"data": {"company_name": "Acme Corp"}}

**CORRECT - update output:**
update_output_data {"changes": {"address": "123 Main St"}}

**CORRECT - finish:**
finish {}

**CORRECT - fail:**
fail {"reason": "Document is not an invoice"}

## Common Mistakes to AVOID

❌ WRONG: read {} (missing file_path)
❌ WRONG: read {file_path: "/path"} (missing quotes around property names)
❌ WRONG: read /path (not using JSON format)
❌ WRONG: set_output_data {company: "Name"} (missing quotes and data wrapper)
❌ WRONG: Trying to install tools with apt-get, pip, npm, etc. (not allowed in sandbox)

## Remember

1. **ALWAYS** use set_output_data or update_output_data when you find information
2. **ALWAYS** call finish() when done (or fail() if impossible)
3. **ALWAYS** provide required parameters when calling tools (file_path for read, data for set_output_data, etc.)
4. **NEVER** try to install packages or external tools - work with what you have
5. The output tools will validate your data and report issues
6. You can update data multiple times - keep refining as you explore
7. The CLI shows your progress in real-time as you update the output`;
};

export class AgentStrategy<T> implements ExtractionStrategy<T> {
  public name = "agent";
  private config: AgentStrategyConfig;

  constructor(config: AgentStrategyConfig) {
    this.config = config;
  }

  getEstimatedSteps(): number {
    return this.config.maxSteps ?? 50;
  }

  async run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>> {
    const debug = options.debug ?? this.config.debug;
    const { telemetry } = options;
    const maxSteps = this.config.maxSteps ?? 50;
    
    // Create strategy-level AGENT span
    const agentSpan = telemetry?.startSpan({
      name: "strategy.agent",
      kind: "AGENT",
      attributes: {
        "strategy.name": this.name,
        "agent.max_steps": maxSteps,
        "agent.model": this.config.model 
          ? "custom" 
          : `${this.config.provider}/${this.config.modelId}`,
        "agent.artifacts.count": options.artifacts.length,
      },
    });
    
    // Track active spans for messages (LLM calls) and tool calls
    const activeMessageSpans = new Map<string, any>();
    const activeToolSpans = new Map<string, any>();

    // Emit start event
    await options.events?.onStep?.({
      step: 1,
      total: this.getEstimatedSteps(),
      label: "agent_explore",
    });
    debug?.step({
      step: 1,
      total: this.getEstimatedSteps(),
      label: "agent_explore",
      strategy: this.name,
    });

    // Serialize artifacts to virtual filesystem with virtual image files
    const filesystem = createVirtualFilesystem(options.artifacts);

    // Create just-bash instance with the virtual filesystem including image files
    const files: Record<string, string> = {
      "/artifact.json": filesystem["/artifact.json"],
      "/manifest.json": filesystem["/manifest.json"],
    };
    
    // Add virtual image files to the filesystem
    for (const [path, content] of filesystem.virtualFiles) {
      files[path] = content;
    }

    const bash = new Bash({
      files,
      cwd: "/",
    });

    // Create custom tools that use the virtual filesystem
    const virtualTools = createVirtualFilesystemTools(bash, filesystem.getImageByPath);

    // Build the schema and system prompt
    const schema = JSON.stringify(options.schema, null, 2);
    const systemPrompt =
      this.config.systemPrompt ??
      defaultSystemPrompt(schema, this.config.outputInstructions);

    // Log LLM call start
    const callId = `agent_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    debug?.llmCallStart({
      callId,
      model: this.config.model ? JSON.stringify(this.config.model) : "default",
      schemaName: "extract",
      systemLength: systemPrompt.length,
      userLength: 0,
      artifactCount: options.artifacts.length,
    });
    debug?.promptSystem({ callId, system: systemPrompt });

    const startTime = Date.now();

    // Set up auth storage
    const agentDir = this.config.agentDir;
    const authStorage = agentDir 
      ? AuthStorage.create(`${agentDir}/auth.json`)
      : AuthStorage.create();

    // Set runtime API key if provided
    if (this.config.apiKey && this.config.provider) {
      authStorage.setRuntimeApiKey(this.config.provider, this.config.apiKey);
    }

    // Create model registry
    const modelRegistry = new ModelRegistry(authStorage);

    // Get the model
    let model = this.config.model;
    if (!model && this.config.provider && this.config.modelId) {
      // Try to find the model in registry
      if (this.config.verbose) {
        console.error(`[AgentStrategy] Looking up model: ${this.config.provider}/${this.config.modelId}`);
      }
      model = modelRegistry.find(this.config.provider, this.config.modelId);
      if (this.config.verbose) {
        console.error(`[AgentStrategy] Model resolved: ${model ? 'success' : 'failed'}`);
        if (model) {
          console.error(`[AgentStrategy] Model info:`, JSON.stringify(model).slice(0, 200));
        }
      }
    } else if (model && this.config.verbose) {
      console.error(`[AgentStrategy] Using pre-configured model`);
    }

    // Create resource loader with custom system prompt
    const loader = new DefaultResourceLoader({
      cwd: "/artifacts",
      agentDir: agentDir || undefined,
      systemPromptOverride: () => systemPrompt,
    });
    
    await loader.reload();

    // Create in-memory settings
    const settingsManager = SettingsManager.inMemory({
      compaction: { enabled: false }, // Disable compaction for extraction tasks
    });

    // Output data management state
    let currentOutput: any = null;
    let isFinished = false;
    let finishError: string | null = null;
    let extractionFailed = false;
    let failureReason: string | null = null;
    
    // Helper to validate data against schema
    const validateData = (data: any): { valid: boolean; errors: string[] } => {
      try {
        JSON.stringify(data);
        return { valid: true, errors: [] };
      } catch (e) {
        return { valid: false, errors: [(e as Error).message] };
      }
    };
    
    // Helper to deep merge objects
    const deepMerge = (target: any, source: any): any => {
      const output = Object.assign({}, target);
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
          if (isObject(source[key])) {
            if (!(key in target)) {
              Object.assign(output, { [key]: source[key] });
            } else {
              output[key] = deepMerge(target[key], source[key]);
            }
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    };
    
    const isObject = (item: any): boolean => {
      return item && typeof item === "object" && !Array.isArray(item);
    };

    // Emit session initialization event
    await options.events?.onStep?.({
      step: 2,
      total: this.getEstimatedSteps(),
      label: "agent_init",
    });
    debug?.step({
      step: 2,
      total: this.getEstimatedSteps(),
      label: "agent_init",
      strategy: this.name,
    });

    // Create output management tools
    const { Type } = await import("@sinclair/typebox");
    
    const setOutputDataTool = {
      name: "set_output_data",
      label: "Set Output Data",
      description: "Set the initial output data. You can use any structure - it will be validated against the schema.",
      parameters: Type.Object({
        data: Type.Any({ description: "The output data to set" }),
      }),
      execute: async (toolCallId: string, params: { data: any }) => {
        currentOutput = params.data;
        const validation = validateData(params.data);
        const status = validation.valid ? "✓ Valid structure" : `✗ Validation issues: ${validation.errors.join(", ")}`;
        
        // Emit progress so CLI shows the update
        await options.events?.onStep?.({
          step: stepCount + 1,
          total: this.getEstimatedSteps(),
          label: `Output: ${JSON.stringify(params.data).slice(0, 50)}...`,
        });
        
        return {
          content: [{ type: "text", text: `Output data set. ${status}` }],
          details: { validation },
        };
      },
    };
    
    const updateOutputDataTool = {
      name: "update_output_data",
      label: "Update Output Data",
      description: "Update the output data by merging changes. Existing fields are preserved, new fields are added.",
      parameters: Type.Object({
        changes: Type.Record(Type.String(), Type.Any(), { 
          description: "Changes to merge into existing data" 
        }),
      }),
      execute: async (toolCallId: string, params: { changes: any }) => {
        if (currentOutput === null) {
          return {
            content: [{ type: "text", text: "Error: No output data set yet. Use set_output_data first." }],
            isError: true,
          };
        }
        
        currentOutput = deepMerge(currentOutput, params.changes);
        const validation = validateData(currentOutput);
        const status = validation.valid ? "✓ Valid structure" : `✗ Validation issues: ${validation.errors.join(", ")}`;
        
        // Emit progress so CLI shows the update
        await options.events?.onStep?.({
          step: stepCount + 1,
          total: this.getEstimatedSteps(),
          label: `Updated: ${JSON.stringify(params.changes).slice(0, 50)}...`,
        });
        
        return {
          content: [{ type: "text", text: `Output data updated. ${status}` }],
          details: { validation, currentOutput },
        };
      },
    };
    
    const finishTool = {
      name: "finish",
      label: "Finish Extraction",
      description: "Complete the extraction. Can only be called when data validates against the schema.",
      parameters: Type.Object({}),
      execute: async (toolCallId: string) => {
        if (extractionFailed) {
          return {
            content: [{ type: "text", text: "Cannot finish - extraction was marked as failed." }],
            isError: true,
          };
        }
        
        if (currentOutput === null) {
          return {
            content: [{ type: "text", text: "Error: No output data set. Extract data first." }],
            isError: true,
          };
        }
        
        const validation = validateData(currentOutput);
        if (!validation.valid) {
          finishError = `Schema validation failed: ${validation.errors.join(", ")}`;
          return {
            content: [{ 
              type: "text", 
              text: `Cannot finish: ${finishError}\n\nFix the data and try again, or use fail() if extraction is impossible.` 
            }],
            isError: true,
          };
        }
        
        isFinished = true;
        return {
          content: [{ type: "text", text: "✓ Extraction complete! Data validated successfully." }],
        };
      },
    };
    
    const failTool = {
      name: "fail",
      label: "Fail Extraction",
      description: "Mark extraction as failed when the schema cannot be satisfied with the available data.",
      parameters: Type.Object({
        reason: Type.String({ description: "Why extraction failed or what data was missing" }),
      }),
      execute: async (toolCallId: string, params: { reason: string }) => {
        extractionFailed = true;
        failureReason = params.reason;
        return {
          content: [{ type: "text", text: `Extraction marked as failed: ${params.reason}` }],
        };
      },
    };

    // Create session with all tools
    const allTools = [
      virtualTools.read as any,
      virtualTools.bash as any,
      virtualTools.grep as any,
      virtualTools.find as any,
      virtualTools.ls as any,
      setOutputDataTool as any,
      updateOutputDataTool as any,
      finishTool as any,
      failTool as any,
    ];
    
    if (this.config.verbose) {
      console.error(`[AgentStrategy] Creating session with ${allTools.length} tools`);
      console.error(`[AgentStrategy] Tool names: ${allTools.map((t: any) => t.name).join(', ')}`);
      
      // Log detailed tool info for debugging
      allTools.forEach((tool: any) => {
        console.error(`[AgentStrategy] Tool "${tool.name}" details:`);
        console.error(`  - label: ${tool.label}`);
        console.error(`  - description: ${tool.description?.slice(0, 100)}...`);
        console.error(`  - has parameters: ${!!tool.parameters}`);
        if (tool.parameters) {
          console.error(`  - parameters type: ${tool.parameters.type}`);
          console.error(`  - required fields: ${JSON.stringify(tool.parameters.required)}`);
        }
      });
    }
    
    const { session } = await createAgentSession({
      model: model as any,
      authStorage,
      modelRegistry,
      resourceLoader: loader,
      sessionManager: SessionManager.inMemory(),
      settingsManager,
      tools: [], // No default tools
      customTools: allTools,
    });
    
    if (this.config.verbose) {
      console.error(`[AgentStrategy] Session created successfully`);
    }

    // Emit session ready event
    await options.events?.onStep?.({
      step: 3,
      total: this.getEstimatedSteps(),
      label: "agent_session_ready",
    });
    debug?.step({
      step: 3,
      total: this.getEstimatedSteps(),
      label: "agent_session_ready",
      strategy: this.name,
    });

    // Track usage and steps
    let usage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    let stepCount = 0;
    let finalResponse = "";
    const maxToolCalls = maxSteps;
    
    // Buffer for streaming text - accumulate until we see a newline
    let textBuffer = "";

    try {
      // Subscribe to events
      const unsubscribe = session.subscribe((event) => {
        console.error(`[AgentStrategy] Received event:`, event.type);
        try {
          switch (event.type) {
          case "message_update": {
            if (event.assistantMessageEvent.type === "text_delta") {
              const delta = event.assistantMessageEvent.delta;
              finalResponse += delta;
              
              // Emit agent message event for UI streaming
              options.events?.onAgentMessage?.({
                content: delta,
                role: "assistant",
              });
              
              // Buffer the text and only emit when we have complete lines
              textBuffer += delta;
              
              // Check for complete lines in the buffer
              let newlineIndex;
              while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
                const line = textBuffer.slice(0, newlineIndex).trim();
                textBuffer = textBuffer.slice(newlineIndex + 1);
                
                if (line.length > 0) {
                  options.events?.onStep?.({
                    step: stepCount,
                    total: this.getEstimatedSteps(),
                    label: `→ ${line.slice(0, 120)}`,
                  });
                }
              }
              
              // If buffer gets too long without a newline, emit it anyway
              if (textBuffer.length > 100) {
                const line = textBuffer.trim();
                if (line.length > 0) {
                  options.events?.onStep?.({
                    step: stepCount,
                    total: this.getEstimatedSteps(),
                    label: `→ ${line.slice(0, 120)}`,
                  });
                }
                textBuffer = "";
              }
            }
            break;
          }
            
            case "tool_execution_start": {
              stepCount++;
              // Start TOOL span for this tool execution
              if (telemetry && agentSpan) {
                const toolSpan = telemetry.startSpan({
                  name: `agent.tool.${event.toolName}`,
                  kind: "TOOL",
                  parentSpan: agentSpan,
                  attributes: {
                    "tool.name": event.toolName,
                    "tool.call_id": event.toolCallId,
                    "tool.args": JSON.stringify(event.args || {}),
                  },
                });
                activeToolSpans.set(event.toolCallId, toolSpan);
              }
              
              // Format a nice label based on the tool and its arguments
              let label: string;
              let detail: string;
              const args = event.args;
              const toolName = event.toolName;
              
              // Log tool execution for debugging
              if (this.config.verbose) {
                console.error(`[AgentStrategy] Tool start: ${toolName} (call ID: ${event.toolCallId})`);
                if (args) {
                  console.error(`[AgentStrategy] Args:`, JSON.stringify(args).slice(0, 200));
                }
              }
              
              // Emit detailed agent tool start event for UI
              const toolStartEvent = {
                toolName,
                toolCallId: event.toolCallId,
                args: args || {},
              };
              console.error(`[AgentStrategy] Emitting onAgentToolStart:`, toolStartEvent);
              options.events?.onAgentToolStart?.(toolStartEvent);
              
              // Format labels for exploration tools
              if (toolName === "read" && args?.file_path) {
                const fileName = args.file_path.split("/").pop() || args.file_path;
                const pagination: string[] = [];
                if (args.offset && args.offset > 1) {
                  pagination.push(`offset ${args.offset}`);
                }
                if (args.limit) {
                  pagination.push(`limit ${args.limit}`);
                }
                const paginationStr = pagination.length > 0 ? ` (${pagination.join(", ")})` : "";
                label = `Read ${fileName}${paginationStr}`;
                detail = "";
              } else if (toolName === "bash" && args?.command) {
                // Truncate long commands
                const cmd = args.command.length > 40 
                  ? args.command.slice(0, 37) + "..." 
                  : args.command;
                label = `Bash: ${cmd}`;
                detail = "";
              } else if (toolName === "grep" && args?.pattern) {
                label = `Grep "${args.pattern}"`;
                detail = args.path ? `in ${args.path.split("/").pop()}` : "";
              } else if (toolName === "find" && args?.path) {
                label = `Find`;
                detail = args.name ? `"${args.name}" in ${args.path}` : `in ${args.path}`;
              } else if (toolName === "ls" && args?.path) {
                label = `List ${args.path}`;
                detail = args.recursive ? "recursive" : "";
              } else if (toolName === "set_output_data") {
                label = "Set Output";
                detail = args?.data ? JSON.stringify(args.data).slice(0, 80) : "";
              } else if (toolName === "update_output_data") {
                label = "Update Output";
                detail = args?.changes ? JSON.stringify(args.changes).slice(0, 80) : "";
              } else if (toolName === "finish") {
                label = "Finish";
                detail = "";
              } else if (toolName === "fail") {
                label = "Fail";
                detail = args?.reason || "";
              } else {
                // Unknown tool - use raw JSON
                label = toolName;
                detail = args ? JSON.stringify(args).slice(0, 100) : "";
              }
              
              // Emit progress event with nice label and detail
              options.events?.onStep?.({
                step: stepCount + 1,
                total: this.getEstimatedSteps(),
                label,
                detail,
              });
              debug?.step({
                step: stepCount + 1,
                total: this.getEstimatedSteps(),
                label,
                strategy: this.name,
              });
              break;
            }

            case "tool_execution_end": {
              const toolEndEvent = event as any;
              
              // End TOOL span for this tool execution
              const toolSpan = activeToolSpans.get(toolEndEvent.toolCallId);
              if (toolSpan && telemetry) {
                const hasError = toolEndEvent.isError || toolEndEvent.error;
                telemetry.endSpan(toolSpan, {
                  status: hasError ? "error" : "ok",
                  error: hasError 
                    ? new Error(toolEndEvent.error || "Tool execution failed") 
                    : undefined,
                  output: toolEndEvent.result,
                });
                activeToolSpans.delete(toolEndEvent.toolCallId);
              }
              
              // Emit detailed agent tool end event for UI
              options.events?.onAgentToolEnd?.({
                toolCallId: toolEndEvent.toolCallId,
                result: toolEndEvent.result,
                error: toolEndEvent.error || toolEndEvent.isError ? toolEndEvent.error || "Tool execution failed" : undefined,
              });
              
              // Check if tool execution resulted in an error
              if (toolEndEvent.isError || toolEndEvent.error) {
                const errorMsg = toolEndEvent.error || "Unknown tool error";
                const toolName = toolEndEvent.toolName || "unknown";
                const toolCallId = toolEndEvent.toolCallId || "unknown";
                if (this.config.verbose) {
                  console.error(`[AgentStrategy] Tool execution failed: ${errorMsg}`);
                  console.error(`[AgentStrategy] Tool: ${toolName}, Call ID: ${toolCallId}`);
                  if (toolEndEvent.result) {
                    console.error(`[AgentStrategy] Result:`, JSON.stringify(toolEndEvent.result));
                  }
                }
                // Don't throw here, let the agent handle it
              }
              break;
            }

            case "agent_end": {
              // Flush any remaining text in the buffer
              if (textBuffer.trim().length > 0) {
                options.events?.onStep?.({
                  step: stepCount,
                  total: this.getEstimatedSteps(),
                  label: `→ ${textBuffer.trim().slice(0, 120)}`,
                });
                textBuffer = "";
              }
              
              // Update usage from agent state if available
              if (event.messages && event.messages.length > 0) {
                // Calculate approximate usage from messages
                const inputTokens = event.messages.reduce((sum, msg) => {
                  if (msg.role === "user") {
                    return sum + Math.ceil(JSON.stringify(msg.content).length / 4);
                  }
                  return sum;
                }, 0);
                const outputTokens = event.messages.reduce((sum, msg) => {
                  if (msg.role === "assistant") {
                    return sum + Math.ceil(JSON.stringify(msg.content).length / 4);
                  }
                  return sum;
                }, 0);
                usage = {
                  inputTokens,
                  outputTokens,
                  totalTokens: inputTokens + outputTokens,
                };
              }
              // Emit agent completion event
              options.events?.onStep?.({
                step: stepCount + 1,
                total: this.getEstimatedSteps(),
                label: "agent_complete",
              });
              debug?.step({
                step: stepCount + 1,
                total: this.getEstimatedSteps(),
                label: "agent_complete",
                strategy: this.name,
              });
              break;
            }

            case "message_start": {
              // Start LLM span for this message generation
              // Generate a unique key for this message since message objects don't have IDs
              const messageKey = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
              if (telemetry && agentSpan) {
                const llmSpan = telemetry.startSpan({
                  name: "agent.llm.generate",
                  kind: "LLM",
                  parentSpan: agentSpan,
                  attributes: {
                    "llm.message_type": event.message?.role || "unknown",
                    "llm.type": "agent_message",
                  },
                });
                activeMessageSpans.set(messageKey, llmSpan);
                // Store the key on the event for retrieval in message_end
                (event as any)._telemetryKey = messageKey;
              }
              break;
            }

            case "message_end": {
              // End LLM span for this message generation
              const messageKey = (event as any)._telemetryKey;
              if (messageKey) {
                const llmSpan = activeMessageSpans.get(messageKey);
                if (llmSpan && telemetry) {
                  telemetry.endSpan(llmSpan, {
                    status: "ok",
                    output: finalResponse.slice(-200), // Last 200 chars as output preview
                  });
                  activeMessageSpans.delete(messageKey);
                }
              }
              break;
            }

            case "agent_start": {
              // Agent has started processing
              if (this.config.verbose) {
                console.error("[AgentStrategy] Agent started processing");
              }
              break;
            }

            case "turn_start":
            case "turn_end": {
              // Turn lifecycle events - track but don't need special handling
              break;
            }

            case "auto_compaction_start":
            case "auto_compaction_end":
            case "auto_retry_start":
            case "auto_retry_end": {
              // Compaction and retry events - only log in debug mode
              break;
            }

            default: {
              // Only log truly unknown/unexpected events
              // Common lifecycle events should be handled above
              const unhandledEvent = event as any;
              if (unhandledEvent.type && !unhandledEvent.type.includes("_")) {
                if (this.config.verbose) {
                  console.error(`[AgentStrategy] Unexpected event type: ${unhandledEvent.type}`);
                }
              }
              break;
            }
          }
        } catch (eventHandlerError) {
          // Catch any errors in the event handler itself to prevent them from being swallowed
          if (this.config.verbose) {
            console.error(`[AgentStrategy] Error in event handler: ${(eventHandlerError as Error).message}`);
            console.error("AgentStrategy event handler error:", eventHandlerError);
          }
          // Re-throw to ensure the error is not swallowed
          throw eventHandlerError;
        }
      });

      // Send the prompt
      await session.prompt(
        "Begin exploring the artifacts and extract the required data according to the schema. Start by reading the manifest file.",
        {
          // Ensure the agent keeps running until it calls finish() or fail()
        }
      );

      // Retry logic: if no output after first run, prompt again to force output
      if (currentOutput === null && !extractionFailed && !isFinished) {
        if (this.config.verbose) {
          console.error("[AgentStrategy] No output after first run. Sending retry prompt...");
        }
        
        await options.events?.onStep?.({
          step: stepCount + 1,
          total: this.getEstimatedSteps(),
          label: "Retry: forcing output extraction",
        });
        
        // Re-subscribe for the retry
        const retryUnsubscribe = session.subscribe((event) => {
          try {
            switch (event.type) {
              case "message_update": {
                if (event.assistantMessageEvent.type === "text_delta") {
                  const delta = event.assistantMessageEvent.delta;
                  finalResponse += delta;
                  
                  // Emit agent message event for UI streaming
                  options.events?.onAgentMessage?.({
                    content: delta,
                    role: "assistant",
                  });
                  
                  // Buffer the text and only emit when we have complete lines
                  textBuffer += delta;
                  
                  // Check for complete lines in the buffer
                  let newlineIndex;
                  while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
                    const line = textBuffer.slice(0, newlineIndex).trim();
                    textBuffer = textBuffer.slice(newlineIndex + 1);
                    
                    if (line.length > 0) {
                      options.events?.onStep?.({
                        step: stepCount,
                        total: this.getEstimatedSteps(),
                        label: `→ ${line.slice(0, 120)}`,
                      });
                    }
                  }
                  
                  // If buffer gets too long without a newline, emit it anyway
                  if (textBuffer.length > 100) {
                    const line = textBuffer.trim();
                    if (line.length > 0) {
                      options.events?.onStep?.({
                        step: stepCount,
                        total: this.getEstimatedSteps(),
                        label: `→ ${line.slice(0, 120)}`,
                      });
                    }
                    textBuffer = "";
                  }
                }
                break;
              }
              
              case "tool_execution_start": {
                stepCount++;
                const toolName = event.toolName;
                const args = event.args;
                
                // Format label for retry run
                let label = toolName;
                if (toolName === "set_output_data") {
                  label = "Set Output (retry)";
                } else if (toolName === "update_output_data") {
                  label = "Update Output (retry)";
                } else if (toolName === "finish") {
                  label = "Finish (retry)";
                } else if (toolName === "fail") {
                  label = "Fail (retry)";
                }
                
                options.events?.onStep?.({
                  step: stepCount + 1,
                  total: this.getEstimatedSteps(),
                  label,
                });
                break;
              }
            }
          } catch (eventHandlerError) {
            if (this.config.verbose) {
              console.error(`[AgentStrategy] Error in retry event handler: ${(eventHandlerError as Error).message}`);
            }
          }
        });
        
        // Send a forceful retry prompt
        await session.prompt(
          `You have explored the artifacts but haven't called any output tools yet. You MUST now extract data and call either:\n` +
          `1. set_output_data with the extracted data, then finish()\n` +
          `2. fail() if the document doesn't contain the required information\n\n` +
          `The schema requires: ${JSON.stringify(options.schema).slice(0, 200)}...\n\n` +
          `Extract what you can from the artifacts and set the output data NOW.`,
          {}
        );
        
        retryUnsubscribe();
      }

      // Clean up subscription
      unsubscribe();

      const durationMs = Date.now() - startTime;

      // Determine the extraction result based on agent output tools
      let extractedData: T;
      
      if (extractionFailed) {
        throw new Error(`Extraction failed: ${failureReason}`);
      }
      
      if (!isFinished) {
        // Agent didn't call finish() - check if we have partial data
        if (currentOutput !== null) {
          if (this.config.verbose) {
            console.error("[AgentStrategy] Warning: Agent did not call finish(). Using collected data.");
          }
          const validation = validateData(currentOutput);
          if (!validation.valid && this.config.verbose) {
            console.error(`[AgentStrategy] Data validation issues: ${validation.errors.join(", ")}`);
          }
          extractedData = currentOutput as T;
        } else {
          // Check if this might be a model compatibility issue
          const toolCallsMade = stepCount > 0;
          const toolsFailed = toolCallsMade && currentOutput === null;
          
          if (toolsFailed) {
            const errorMsg = `Agent did not produce any output data. The model may not support tool calling properly.

Troubleshooting:
1. Check if your model supports function calling/tool use
2. Try a different model like anthropic/claude-sonnet-4 or openai/gpt-4o
3. See MODEL_COMPATIBILITY.md for supported models

If you continue to see "Tool execution failed" errors with empty tool names,
the model is not compatible with the agent strategy. Use --strategy simple instead.`;
            throw new Error(errorMsg);
          } else {
            const errorMsg = `Agent did not produce any output data. No data was extracted.

This can happen when:
- The model doesn't support tool calling properly
- The agent got confused and didn't use the output tools
- The document doesn't contain extractable data

Suggestions:
1. Try a different model with better tool support (anthropic/claude-sonnet-4)
2. Use --strategy simple for models without tool calling
3. Check if the document actually contains the data specified in your schema

Retry was attempted but the agent still didn't produce output.`;
            throw new Error(errorMsg);
          }
        }
      } else {
        // Agent called finish() successfully
        if (currentOutput === null) {
          throw new Error("Agent called finish() but no output data was set.");
        }
        extractedData = currentOutput as T;
      }

      debug?.rawResponse({ callId, response: extractedData });
      debug?.llmCallComplete({
        callId,
        success: true,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        durationMs,
      });

      await options.events?.onStep?.({
        step: this.getEstimatedSteps(),
        total: this.getEstimatedSteps(),
        label: "extract",
      });

      debug?.step({
        step: this.getEstimatedSteps(),
        total: this.getEstimatedSteps(),
        label: "extract",
        strategy: this.name,
      });

      // Clean up any remaining telemetry spans
      if (telemetry) {
        // End any active message spans
        for (const [key, span] of activeMessageSpans.entries()) {
          telemetry.endSpan(span, { status: "ok" });
        }
        activeMessageSpans.clear();
        
        // End any active tool spans
        for (const [key, span] of activeToolSpans.entries()) {
          telemetry.endSpan(span, { status: "ok" });
        }
        activeToolSpans.clear();
        
        // End the main agent span
        if (agentSpan) {
          telemetry.endSpan(agentSpan, {
            status: "ok",
            output: extractedData,
          });
        }
      }

      return { data: extractedData, usage };
    } catch (error) {
      const durationMs = Date.now() - startTime;

      debug?.llmCallComplete({
        callId,
        success: false,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        durationMs,
        error: (error as Error).message,
      });
      
      // Clean up telemetry spans on error
      if (telemetry) {
        // End any active message spans with error
        for (const [key, span] of activeMessageSpans.entries()) {
          telemetry.endSpan(span, { 
            status: "error", 
            error: error instanceof Error ? error : new Error(String(error))
          });
        }
        activeMessageSpans.clear();
        
        // End any active tool spans with error
        for (const [key, span] of activeToolSpans.entries()) {
          telemetry.endSpan(span, { 
            status: "error",
            error: error instanceof Error ? error : new Error(String(error))
          });
        }
        activeToolSpans.clear();
        
        // End the main agent span with error
        if (agentSpan) {
          telemetry.endSpan(agentSpan, {
            status: "error",
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }

      throw error;
    } finally {
      // Clean up session
      session.dispose();
    }
  }
}

export const agent = <T>(config: AgentStrategyConfig) => {
  return new AgentStrategy<T>(config);
};
