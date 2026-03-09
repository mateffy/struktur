# Agent Strategy

An autonomous agent-based extraction strategy for Struktur that uses pi.dev agent with a virtual shell environment powered by just-bash.

## Overview

The `agent` strategy provides an in-process pi.dev agent that can:
- Explore artifacts stored in a virtual filesystem (just-bash)
- Use shell tools (grep, head, cat, ls, etc.) to analyze content
- Make autonomous decisions about what to extract
- Execute extraction with structured output

## Key Features

- **pi.dev Agent**: Uses the full pi.dev agent framework for autonomous exploration
- **Virtual Filesystem**: Artifacts are written to an in-memory just-bash filesystem - no real disk access
- **Custom Tools**: Replaces pi.dev's default filesystem tools with custom tools that use just-bash
- **Autonomous Exploration**: The agent decides what content to read and how to extract data
- **Safe & Sandboxed**: All execution happens in-memory with no real filesystem access

## Installation

```bash
bun install @struktur/agent-strategy
```

## Usage

### As a Package

```typescript
import { extract } from '@struktur/sdk';
import { agent } from '@struktur/agent-strategy';

const result = await extract({
  artifacts: myArtifacts,
  schema: mySchema,
  strategy: agent({
    provider: 'anthropic',
    modelId: 'claude-sonnet-4',
    maxSteps: 50,
  }),
});
```

## CLI Usage

The agent strategy works with the standard Struktur CLI. Use `--strategy agent` and provide the model in `provider/model` format:

```bash
# Basic usage with explicit model
struktur --input document.pdf \
  --schema schema.json \
  --strategy agent \
  --model anthropic/claude-sonnet-4

# With custom max steps (default: 50)
struktur --input document.pdf \
  --schema schema.json \
  --strategy agent \
  --model anthropic/claude-sonnet-4 \
  --max-steps 30

# Using with stdin
struktur --stdin \
  --schema schema.json \
  --strategy agent \
  --model openai/gpt-4o \
  --max-steps 40

# Using with text input
struktur --text "Some text to analyze" \
  --schema schema.json \
  --strategy agent \
  --model anthropic/claude-sonnet-4
```

### Model Compatibility

**Important**: The agent strategy requires models with **function calling / tool use** support. Not all models support this feature.

**✅ Recommended Models:**
- `anthropic/claude-sonnet-4` (Claude 3.5 Sonnet) - Best overall
- `openai/gpt-4o` - Excellent tool support
- `openai/gpt-4o-mini` - Good balance of capability and cost

**❌ Not Compatible:**
- Some models on OpenRouter (like `opencode/glm-5`) don't support tool calling
- Models without explicit function calling capabilities will fail with errors like:
  - `Tool execution failed: Unknown tool error`
  - `must have required property 'file_path'`
  - `Tool  not found`

See [MODEL_COMPATIBILITY.md](./MODEL_COMPATIBILITY.md) for detailed compatibility information.

### Model Format

The `--model` parameter for the agent strategy must be in the format `provider/model-id`:

- `anthropic/claude-sonnet-4` - Anthropic Claude Sonnet 4
- `anthropic/claude-opus-4-5` - Anthropic Claude Opus 4.5
- `openai/gpt-4o` - OpenAI GPT-4o
- `openai/gpt-4o-mini` - OpenAI GPT-4o Mini
- `openrouter/anthropic/claude-sonnet-4` - OpenRouter routing to Anthropic

The CLI will automatically resolve the model and pass the provider/model configuration to the pi.dev agent framework.

### Real-time Progress

When using the agent strategy via CLI, you'll see real-time progress in the spinner:

```bash
struktur --input document.pdf --schema schema.json --strategy agent --model anthropic/claude-sonnet-4
# Shows: "Agent: I'll start by examining the manifest..."
# Then:  "Agent: Now I'll look at the available images..."
# Finally: "Extracting data..." → JSON result
```

The spinner line updates continuously to show what the agent is currently doing, giving you visibility into the extraction process.

### Import from SDK

The agent strategy is also re-exported from `@struktur/sdk` for convenience:

```typescript
import { extract, agent } from '@struktur/sdk';

const result = await extract({
  artifacts: myArtifacts,
  schema: mySchema,
  strategy: agent({
    provider: 'anthropic',
    modelId: 'claude-sonnet-4',
  }),
});
```

## How It Works

1. **Virtual Filesystem Setup**: All artifacts are serialized to JSON and written to `/artifacts/artifact.json` in a just-bash virtual filesystem
2. **Virtual Image Files**: Embedded base64 images are extracted to separate files in `/artifacts/images/` for easier access. The JSON references these files by virtual path instead of containing the base64 data directly.
3. **Exploration Tools**: The agent uses read, bash, grep, find, ls to explore the virtual filesystem
4. **Output Tools**: The agent uses set_output_data, update_output_data, finish, and fail tools to manage extraction output
5. **Efficient Exploration**: The agent is encouraged to start with small previews (20-50 lines) and use pagination to navigate large files intelligently
6. **Incremental Updates**: The agent updates output data continuously as it explores, not just at the end
7. **Validation**: The finish tool validates data against the schema before completing

### Output Management Tools

The agent uses specialized tools to manage extraction output:

**set_output_data** - Set initial extraction data
```typescript
// Call this as soon as you find the first piece of data
set_output_data({
  "data": {
    "company_name": "Acme Corp",
    "address": null  // Can set fields to null if not found yet
  }
})
```

**update_output_data** - Add or modify fields incrementally
```typescript
// Call this frequently as you discover more information
update_output_data({
  "changes": {
    "address": "123 Main St",
    "city": "Berlin"
  }
})
// This merges with existing data - company_name is preserved
```

**finish** - Complete extraction (requires valid schema compliance)
```typescript
// Call this when done - it validates against the schema
finish()
// Returns error if data doesn't validate - fix it or call fail()
```

**fail** - Mark extraction as impossible
```typescript
// Use this if the schema cannot be satisfied
fail({
  "reason": "Document is not an invoice, it's a marketing brochure. No invoice fields found."
})
```

### Key Features

- **Continuous updates**: Agent updates output as it explores, not just at the end
- **Schema validation**: Data is validated as it's built, with errors reported in real-time
- **Progress visibility**: Each update shows in the CLI spinner
- **Graceful failure**: Agent can explicitly fail if extraction is impossible
- **Deep merge**: update_output_data does deep merging - nested objects are preserved

### Virtual Image File System

When artifacts contain embedded images (base64-encoded), the agent strategy automatically:
- Extracts base64 images to virtual files in `/artifacts/images/`
- Names them with descriptive format: `/artifacts/images/{artifact-name}-page-{n}-image-{i}.{ext}`
- Detects image format from base64 (JPEG, PNG, GIF, WebP, BMP, SVG) and uses appropriate extension
- Replaces the base64 data in artifact.json with a `virtualPath` reference
- Serves the image data directly when the agent reads these virtual files

**Naming Convention:**
- With page number: `/artifacts/images/my-document-page-5-image-0.jpg`
- Without page: `/artifacts/images/my-document-image-0.png`
- Artifact names are sanitized (spaces → dashes, lowercase)

**Supported Formats (auto-detected from base64):**
- JPEG: `.jpg` (starts with `/9j/`)
- PNG: `.png` (starts with `iVBOR`)
- GIF: `.gif` (starts with `R0lGOD`)
- WebP: `.webp` (starts with `UklGR`)
- BMP: `.bmp` (starts with `Qk`)
- SVG: `.svg` (starts with `PHN2Zy`)
- Unknown: `.bin`

This allows the agent to:
- Access images like real files on disk with meaningful names
- Know the format of each image from the extension
- Read only the images it needs
- Process large artifacts without loading all images into context at once
- Use standard file tools (read, cat, head) on image data

### Efficient File Reading

The agent uses a pagination-aware strategy:
- **Start small**: Reads just the first 20-50 lines to understand structure
- **Navigate selectively**: Uses `offset` and `limit` parameters to jump to relevant sections
- **Search first**: Uses grep to find specific data before reading full content
- **Iterate**: Makes multiple small reads rather than one giant read

This is especially useful for large artifact files where reading the entire file at once would be inefficient.

## Configuration

```typescript
agent({
  // Model configuration (one of these approaches)
  model?: Model;              // Pre-configured pi.dev model object
  provider?: string;          // Provider name (e.g., 'anthropic', 'openai')
  modelId?: string;         // Model ID (e.g., 'claude-sonnet-4')
  
  // Extraction settings
  maxSteps?: number;        // Max agent turns (default: 50)
  outputInstructions?: string;  // Additional extraction guidance
  systemPrompt?: string;    // Override default system prompt
  
  // Authentication
  apiKey?: string;          // API key (or use env vars)
  agentDir?: string;        // Custom pi agent directory
  
  // Debugging
  verbose?: boolean;        // Enable verbose logging
  debug?: DebugLogger;      // SDK debug logger
})
```

## Authentication

The strategy uses pi.dev's authentication system:

```typescript
// Option 1: Pass API key directly
agent({
  provider: 'anthropic',
  modelId: 'claude-sonnet-4',
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Option 2: Use environment variables (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
agent({
  provider: 'anthropic',
  modelId: 'claude-sonnet-4',
})
```

## Security

- All filesystem operations are in-memory only (just-bash virtual filesystem)
- No real disk access - artifacts are stored in memory
- No network access by default (just-bash doesn't enable network unless configured)
- Custom tools replace pi.dev's default filesystem tools

## Debugging & Error Handling

The agent strategy provides comprehensive error visibility:

### Error Output

All errors are logged to **stderr** for visibility:
- Tool execution failures (command, file path, error message)
- Bash command errors (exit codes, stderr output)
- File read errors (path, offset/limit parameters)
- Agent event handler errors
- JSON parsing errors (with output preview)

**Note**: Common lifecycle events (`message_start`, `message_end`, etc.) are handled silently to reduce noise. Only actual errors and unexpected events are logged.

### Debugging Tips

1. **Enable verbose logging**: Use `--debug` flag when running via CLI
2. **Check stderr**: All errors go to stderr, separate from stdout results
3. **Tool failures**: Look for `[AgentTools]` prefix in error messages
4. **Session errors**: Look for `[AgentStrategy]` prefix in error messages
5. **Image access**: Check that virtual paths in artifact.json match available files

### Common Issues

**"File not found" errors**: 
- Verify the virtual path exists in `/artifacts/images/`
- Check manifest for available virtual files

**"Failed to parse agent output" errors**:
- Agent may have produced non-JSON output
- Check stderr for earlier errors that caused the failure

**Tool execution failures**:
- Commands may reference non-existent paths
- Pagination parameters may be out of bounds

## Architecture

- `AgentStrategy.ts` - Main strategy implementation using pi.dev SDK
- `AgentTools.ts` - Custom tool definitions that use just-bash virtual filesystem
- `ArtifactFilesystem.ts` - Virtual filesystem setup with image extraction
- `index.ts` - Package exports

## Dependencies

- `@struktur/sdk` - Core SDK types and interfaces
- `@mariozechner/pi-coding-agent` - pi.dev agent framework
- `just-bash` - Virtual bash environment for in-memory filesystem
- `@sinclair/typebox` - Schema validation for tool parameters

## Testing

Run tests with `bun test` from the monorepo root or package directory.

## Example

```typescript
import { extract } from '@struktur/sdk';
import { agent } from '@struktur/agent-strategy';

const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    author: { type: "string" },
    date: { type: "string" }
  },
  required: ["title"]
};

const result = await extract({
  artifacts: [
    {
      id: "document",
      type: "text",
      contents: [{ text: "The Great Article by John Doe, published 2024-01-15" }],
      raw: async () => Buffer.from("..."),
    }
  ],
  schema,
  strategy: agent({
    provider: "anthropic",
    modelId: "claude-sonnet-4",
    maxSteps: 30,
    outputInstructions: "Extract article metadata",
  }),
});

console.log(result.data);
// { title: "The Great Article", author: "John Doe", date: "2024-01-15" }
```
