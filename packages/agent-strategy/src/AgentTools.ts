import { Bash } from "just-bash";
import type { ToolDefinition } from "@mariozechner/pi-coding-agent";
import { Type, type Static } from "@sinclair/typebox";

// Parameter schemas
const BashParams = Type.Object({
  command: Type.String({
    description: "The bash command to execute",
  }),
  timeout: Type.Optional(
    Type.Number({
      description: "Timeout in milliseconds (default: 30000)",
    })
  ),
});

const ReadParams = Type.Object({
  file_path: Type.String({
    description: "The absolute path to the file to read",
  }),
  offset: Type.Optional(
    Type.Number({
      description: "Line number to start reading from (1-indexed, default: 1)",
    })
  ),
  limit: Type.Optional(
    Type.Number({
      description: "Maximum number of lines to read",
    })
  ),
});

const GrepParams = Type.Object({
  pattern: Type.String({
    description: "The search pattern",
  }),
  path: Type.String({
    description: "The file or directory to search in",
  }),
  options: Type.Optional(
    Type.String({
      description: "Additional grep options (e.g., '-r' for recursive, '-i' for case-insensitive)",
    })
  ),
});

const FindParams = Type.Object({
  path: Type.String({
    description: "The directory to search in",
  }),
  name: Type.Optional(
    Type.String({
      description: "Filename pattern to match (e.g., '*.json')",
    })
  ),
});

const LsParams = Type.Object({
  path: Type.String({
    description: "The directory to list",
  }),
  recursive: Type.Optional(
    Type.Boolean({
      description: "List recursively",
    })
  ),
});

const SetOutputDataParams = Type.Object({
  data: Type.Any({
    description: "The output data to set. Can be any shape - will be validated against the schema.",
  }),
});

const UpdateOutputDataParams = Type.Object({
  changes: Type.Record(Type.String(), Type.Any(), {
    description: "Changes to merge into the existing output data. Uses deep merge. Missing fields are preserved.",
  }),
});

const FinishParams = Type.Object({});

const FailParams = Type.Object({
  reason: Type.String({
    description: "Explanation of why extraction failed or what data could not be found.",
  }),
});

export type AgentOutputTools = {
  set_output_data: ToolDefinition<typeof SetOutputDataParams>;
  update_output_data: ToolDefinition<typeof UpdateOutputDataParams>;
  finish: ToolDefinition<typeof FinishParams>;
  fail: ToolDefinition<typeof FailParams>;
};

export type VirtualFilesystemTools = {
  bash: ToolDefinition<typeof BashParams>;
  read: ToolDefinition<typeof ReadParams>;
  grep: ToolDefinition<typeof GrepParams>;
  find: ToolDefinition<typeof FindParams>;
  ls: ToolDefinition<typeof LsParams>;
};

export const createVirtualFilesystemTools = (
  bash: Bash,
  getImageByPath?: (path: string) => string | undefined
): VirtualFilesystemTools => {
  // Bash tool - executes commands in the virtual filesystem
  const bashTool: ToolDefinition<typeof BashParams> = {
    name: "bash",
    label: "Bash",
    description:
      "Execute bash commands in the virtual filesystem. Use this to explore artifacts with commands like cat, grep, head, tail, jq, etc.",
    parameters: BashParams,
    execute: async (toolCallId, params, signal, onUpdate, ctx) => {
      try {
        const result = await bash.exec(params.command);
        
        // Log non-zero exit codes for debugging
        if (result.exitCode !== 0) {
          console.error(`[AgentTools] Bash command failed with exit code ${result.exitCode}: ${params.command}`);
          if (result.stderr) {
            console.error(`[AgentTools] stderr: ${result.stderr}`);
          }
        }
        
        return {
          content: [
            {
              type: "text",
              text:
                result.exitCode === 0
                  ? result.stdout || "(no output)"
                  : `Exit code ${result.exitCode}: ${result.stderr || result.stdout || "(no output)"}`,
            },
          ],
          details: {
            exitCode: result.exitCode,
            ...(result.stderr && { stderr: result.stderr }),
          },
        };
      } catch (error) {
        const errorMsg = (error as Error).message;
        console.error(`[AgentTools] Bash command error: ${errorMsg}`);
        console.error(`[AgentTools] Command: ${params.command}`);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMsg}`,
            },
          ],
          details: {
            error: errorMsg,
          },
          isError: true,
        };
      }
    },
  };

  // Read tool - reads a file from the virtual filesystem
  const readTool: ToolDefinition<typeof ReadParams> = {
    name: "read",
    label: "Read File",
    description: "Read the contents of a file from the virtual filesystem. Supports pagination with offset and limit parameters. Can read virtual image files (binary/base64 content).",
    parameters: ReadParams,
    execute: async (toolCallId, params, signal, onUpdate, ctx) => {
      try {
        // Check if this is a virtual image file
        if (getImageByPath && params.file_path.startsWith("/artifacts/images/")) {
          const imageData = getImageByPath(params.file_path);
          if (imageData) {
            // Return the image as base64 content
            // Truncate if it's very large (first 1000 chars)
            const displayData = imageData.length > 1000 
              ? imageData.slice(0, 1000) + "... [truncated]" 
              : imageData;
            return {
              content: [
                {
                  type: "text",
                  text: `[IMAGE FILE: ${params.file_path}]\nBase64 content (${imageData.length} chars):\n${displayData}`,
                },
              ],
              details: {
                path: params.file_path,
                size: imageData.length,
                truncated: imageData.length > 1000,
              },
            };
          }
        }

        // Build command with offset and limit support for regular files
        let command: string;
        const offset = params.offset || 1;
        const limit = params.limit;
        
        // Calculate end line if limit is provided
        const endLine = limit ? offset + limit - 1 : undefined;
        
        if (limit && endLine) {
          // Read specific range: use simple sed line range
          command = `sed -n '${offset},${endLine}p' "${params.file_path}"`;
        } else if (offset > 1) {
          // Just offset, no limit - read from offset to end
          command = `sed -n '${offset},$p' "${params.file_path}"`;
        } else {
          // No offset or limit - read entire file
          command = `cat "${params.file_path}"`;
        }

        const result = await bash.exec(command);

        if (result.exitCode !== 0) {
          console.error(`[AgentTools] Read file failed: ${params.file_path}`);
          console.error(`[AgentTools] Command: ${command}`);
          if (result.stderr) {
            console.error(`[AgentTools] stderr: ${result.stderr}`);
          }
          return {
            content: [
              {
                type: "text",
                text: `Error reading file: ${result.stderr || "File not found"}`,
              },
            ],
            details: {
              error: result.stderr || "File not found",
            },
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: result.stdout,
            },
          ],
          details: {
            lines: result.stdout.split("\n").length,
            characters: result.stdout.length,
          },
        };
      } catch (error) {
        const errorMsg = (error as Error).message;
        console.error(`[AgentTools] Read error: ${errorMsg}`);
        console.error(`[AgentTools] File path: ${params.file_path}`);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMsg}`,
            },
          ],
          details: {
            error: errorMsg,
          },
          isError: true,
        };
      }
    },
  };

  // Grep tool - search for patterns
  const grepTool: ToolDefinition<typeof GrepParams> = {
    name: "grep",
    label: "Grep",
    description: "Search for patterns in files using grep",
    parameters: GrepParams,
    execute: async (toolCallId, params, signal, onUpdate, ctx) => {
      try {
        const options = params.options || "";
        const command = `grep ${options} "${params.pattern}" "${params.path}" 2>/dev/null || echo "(no matches found)"`;

        const result = await bash.exec(command);

        return {
          content: [
            {
              type: "text",
              text: result.stdout || "(no matches found)",
            },
          ],
          details: {
            matches: result.stdout
              .split("\n")
              .filter((line) => line.trim()).length,
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `(no matches found)`,
            },
          ],
          details: {},
        };
      }
    },
  };

  // Find tool - find files by name or pattern
  const findTool: ToolDefinition<typeof FindParams> = {
    name: "find",
    label: "Find",
    description: "Find files by name or pattern",
    parameters: FindParams,
    execute: async (toolCallId, params, signal, onUpdate, ctx) => {
      try {
        let command = `find "${params.path}" -type f`;
        if (params.name) {
          command = `find "${params.path}" -type f -name "${params.name}"`;
        }

        const result = await bash.exec(command);

        return {
          content: [
            {
              type: "text",
              text: result.stdout || "(no files found)",
            },
          ],
          details: {
            files: result.stdout
              .split("\n")
              .filter((line) => line.trim()).length,
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${(error as Error).message}`,
            },
          ],
          details: {
            error: (error as Error).message,
          },
          isError: true,
        };
      }
    },
  };

  // Ls tool - list files and directories
  const lsTool: ToolDefinition<typeof LsParams> = {
    name: "ls",
    label: "List Directory",
    description: "List files and directories",
    parameters: LsParams,
    execute: async (toolCallId, params, signal, onUpdate, ctx) => {
      try {
        let command = `ls -la "${params.path}"`;
        if (params.recursive) {
          command = `ls -laR "${params.path}"`;
        }

        const result = await bash.exec(command);

        if (result.exitCode !== 0) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${result.stderr || "Directory not found"}`,
              },
            ],
            details: {
              error: result.stderr || "Directory not found",
            },
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: result.stdout,
            },
          ],
          details: {
            entries: result.stdout
              .split("\n")
              .filter((line) => line.trim() && !line.startsWith("total "))
              .length,
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${(error as Error).message}`,
            },
          ],
          details: {
            error: (error as Error).message,
          },
          isError: true,
        };
      }
    },
  };

  // Output tools - these are implemented in AgentStrategy but defined here for type safety
  // The actual implementation handles schema validation and data storage

  return {
    bash: bashTool,
    read: readTool,
    grep: grepTool,
    find: findTool,
    ls: lsTool,
    // Output tools will be added by AgentStrategy with actual implementation
  };
};

// Type for the complete tool set including output tools
export type CompleteVirtualFilesystemTools = VirtualFilesystemTools & AgentOutputTools;
