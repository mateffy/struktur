# Agent Strategy

Purpose: Autonomous agent-based extraction using pi.dev agent with just-bash virtual filesystem.

## Key Files

- `AgentStrategy.ts` - Main strategy implementing the `ExtractionStrategy` interface using pi.dev SDK
- `AgentTools.ts` - Custom tool definitions that operate on just-bash virtual filesystem
- `ArtifactFilesystem.ts` - Virtual filesystem setup for artifacts
- `index.ts` - Package exports

## Design

The `agent` strategy implements a pi.dev-based agent in-process:

1. **Virtual Filesystem**: Artifacts are serialized to JSON and written to `/artifacts/artifact.json` in a just-bash virtual filesystem (in-memory, no real disk access)
2. **Virtual Image Files**: Embedded base64 images are extracted to separate files in `/artifacts/images/`:
   - Named with descriptive format: `/artifacts/images/{artifact-name}-page-{n}-image-{i}.{ext}`
   - Format is auto-detected from base64 signature (JPEG, PNG, GIF, WebP, BMP, SVG)
   - Artifact names are sanitized (lowercase, special chars → dashes)
   - Original JSON references them via `virtualPath` instead of base64
   - Read tool serves image data directly when virtual files are accessed
3. **Output Management Tools**: Specialized tools for building extraction output incrementally:
   - `set_output_data` - Set initial output data (any shape, validated against schema)
   - `update_output_data` - Deep merge changes into existing output data
   - `finish` - Complete extraction (only works if data validates against schema)
   - `fail` - Mark extraction as impossible with reason
4. **Exploration Tools**: File system tools using just-bash virtual filesystem:
   - `read` - Read files with pagination (offset/limit), handles virtual image files specially
   - `bash` - Execute bash commands
   - `grep` - Search patterns
   - `find` - Find files by name/pattern
   - `ls` - List directories
5. **Efficient Exploration**: The agent is prompted to start with small previews (20-50 lines) and navigate using pagination rather than reading entire files at once
6. **Incremental Output Building**: The agent is encouraged to update output data continuously as it explores, not wait until the end
7. **pi.dev Agent**: Uses pi.dev's `createAgentSession()` with custom tools for autonomous exploration
8. **Authentication**: Uses pi.dev's AuthStorage and ModelRegistry for API key management

### Pagination Support

The `read` tool supports pagination:
- `offset` - Line number to start from (1-indexed)
- `limit` - Maximum lines to read

This allows the agent to efficiently explore large files without reading them entirely.

### Virtual Image File System

**ArtifactFilesystem.ts** transforms artifacts:
- Extracts base64 images from `media.base64` fields
- Creates virtual files in `/artifacts/images/`
- Replaces base64 with `virtualPath` references in JSON
- Provides `getImageByPath()` helper to retrieve image data
- Auto-detects image format (JPEG, PNG, GIF, WebP, BMP, SVG) from base64 signatures

**AgentTools.ts** serves virtual images:
- `read` tool checks if path starts with `/artifacts/images/`
- If so, returns image data via `getImageByPath()` instead of bash
- Presents image data in a readable format for the agent

### Output Management

**AgentStrategy.ts** implements output tools:

- `set_output_data(data)`: Sets initial output data. Validates against schema and reports validation status. Emits progress event so CLI shows the update.

- `update_output_data(changes)`: Deep merges changes into current output. Preserves existing fields. Validates merged result and reports issues. Emits progress event.

- `finish()`: Completes extraction. Only succeeds if data validates against schema. If validation fails, returns error with details and suggests using fail() if needed.

- `fail(reason)`: Marks extraction as failed. Stores failure reason. Prevents finish() from succeeding later.

**State Management:**
- `currentOutput`: Stores the accumulated extraction data
- `isFinished`: Boolean flag set when finish() succeeds
- `extractionFailed`: Boolean flag set when fail() is called
- `failureReason`: Stores the reason from fail() call

**Data Flow:**
1. Agent explores artifacts using file tools
2. When data is found, calls set_output_data or update_output_data
3. Each call validates data and reports issues to agent
4. CLI shows updates in real-time via onStep events
5. When done, agent calls finish() (or fail() if impossible)
6. Strategy returns collected data or throws error

### Error Handling

The agent strategy has comprehensive error handling to ensure errors are never silently swallowed:

**Event Handler Error Handling (AgentStrategy.ts)**:
- Wraps entire event handler in try-catch to catch handler errors
- All unhandled event types are logged to stderr (not swallowed)
- Tool execution errors are logged with context (tool name, error message)
- Event handler errors are re-thrown to prevent silent failures
- Console logging to stderr for all error conditions

**Tool-Level Error Handling (AgentTools.ts)**:
- Each tool (read, bash, grep, find, ls) has try-catch blocks
- Errors are logged to stderr with context (command, file path, error message)
- Returns `isError: true` with error details for the agent to handle
- Non-zero exit codes from bash are logged before returning

**Session-Level Error Handling (AgentStrategy.ts)**:
- Main try-catch in `run()` method catches all session errors
- All errors logged to debug logger with full context
- Original error is re-thrown after logging (never swallowed)
- Session cleanup in `finally` block ensures resources are freed

**JSON Parsing Error Handling**:
- Explicit try-catch around JSON parsing of agent output
- Clear error message includes the actual output (first 200 chars)
- Specific error thrown if agent produces no response

All errors go to stderr for visibility, making debugging straightforward even without the debug flag enabled.

## Usage

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

## Configuration

- `provider` - Provider name (e.g., 'anthropic', 'openai')
- `modelId` - Model ID (e.g., 'claude-sonnet-4')
- `model` - Pre-configured pi.dev model object (alternative to provider/modelId)
- `maxSteps` - Maximum number of agent turns (default: 50)
- `outputInstructions` - Additional extraction guidance
- `systemPrompt` - Override default system prompt
- `apiKey` - API key for authentication (or use env vars)
- `agentDir` - Custom pi agent directory
- `verbose` - Enable verbose logging
- `debug` - SDK debug logger

## Authentication

Uses pi.dev's authentication:
1. `apiKey` parameter (if provided)
2. Environment variables (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
3. pi.dev auth storage (`~/.pi/agent/auth.json`)

## Security

- All filesystem operations use just-bash (in-memory only)
- No real disk access
- No network access (just-bash doesn't enable network by default)
- pi.dev agent runs with custom tools only (no default filesystem access)

## Dependencies

- `@struktur/sdk` - Core SDK types and interfaces
- `@mariozechner/pi-coding-agent` - pi.dev agent framework
- `just-bash` - Virtual bash environment
- `@sinclair/typebox` - Schema validation for tool parameters

## Testing

Run tests with `bun test` from the monorepo root or package directory.
