# Documentation Rework Plan

## Executive Summary

The current documentation is significantly outdated. The CLI has been restructured with new command hierarchies, and a major new feature (parsing) has been added that contradicts the previous "no parsing" stance. This plan outlines a complete documentation overhaul.

---

## Critical Issues with Current Documentation

### 1. CLI Command Structure is Wrong

**Current docs say:**
- `struktur auth set --provider openai --token-stdin`
- `struktur auth default openai`
- `struktur models`
- `struktur verify`

**Actual commands are:**
- `struktur config providers add openai --token-stdin`
- `struktur config models use openai`
- `struktur config models list`
- `struktur verify` (unchanged)

### 2. "Why No Parsing" is Now Wrong

The documentation explicitly states "Struktur does not parse PDFs, HTML, Word docs, or images." This is now **false**. Struktur includes:
- Built-in PDF parser (`parsePdf` in `src/parsers/pdf.ts`)
- Configurable parser system (npm packages, shell commands)
- `struktur parse` command to convert files to artifacts

### 3. Missing Documentation for New Features

- **`parse` command** - converts files to artifact JSON
- **Parser configuration** - `config parsers add/remove/list/get`
- **Image extraction** - `--images`, `--screenshots`, `--screenshot-scale`, `--screenshot-width`
- **MIME override** - `--mime`, `--parser`, `--no-parse`
- **Model aliases** - `config models alias set/get/remove`
- **Artifact viewer** - `utils artifact-viewer`
- **New providers** - opencode, openrouter
- **Image types** - `embedded` vs `screenshot` in artifact format

---

## Source Files to Reference

### CLI Implementation
- `src/cli.ts` (lines 1-2239) - Main CLI with all commands
- `src/cli/shared.ts` - Input loading, schema loading, model resolution
- `src/cli/AGENTS.md` - CLI module documentation

### Parsing System
- `src/parsers/index.ts` - Parser exports
- `src/parsers/types.ts` - ParserDef types (npm, command-file, command-stdin)
- `src/parsers/runner.ts` - Parser execution logic
- `src/parsers/npm.ts` - NPM parser contract
- `src/parsers/mime.ts` - MIME detection (magic bytes, extensions, npm detectFileType)
- `src/parsers/pdf.ts` - Built-in PDF parser with image/screenshot extraction
- `src/parsers/AGENTS.md` - Parsers module documentation

### Configuration
- `src/auth/config.ts` - Config store (defaultModel, aliases, parsers)
- `src/auth/tokens.ts` - Token storage

### Artifacts
- `src/types.ts` - Artifact, ArtifactContent, ArtifactImage types
- `src/artifacts/input.ts` - Input parsing, SerializedArtifact format
- `src/artifacts/AGENTS.md` - Artifacts module documentation

---

## Documentation Files to Update

### Files to Delete/Rewrite
1. `docs-src/content/docs/cli/auth.mdx` - Replace with `config.mdx`
2. `docs-src/content/docs/cli/models.mdx` - Move under config
3. `docs-src/content/docs/explanation/preprocessing/why-no-parsing.mdx` - DELETE or heavily rewrite
4. `docs-src/content/docs/cli/environment.mdx` - Update variable names

### Files to Update
1. `docs-src/content/docs/index.mdx` - Update "What Struktur is NOT" section
2. `docs-src/content/docs/quickstart.mdx` - Update CLI commands
3. `docs-src/content/docs/cli/index.mdx` - New command structure
4. `docs-src/content/docs/cli/extract.mdx` - Add new flags
5. `docs-src/content/docs/cli/verify.mdx` - Minor updates
6. `docs-src/content/docs/cli/installation.mdx` - Update commands
7. `docs-src/content/docs/cli/fields.mdx` - Keep mostly as-is
8. `docs-src/content/docs/explanation/preprocessing/index.mdx` - Restructure
9. `docs-src/content/docs/explanation/preprocessing/artifact-format.mdx` - Add imageType field
10. `docs-src/content/docs/explanation/preprocessing/built-in-inputs.mdx` - Major rewrite
11. `docs-src/content/docs/explanation/pipeline.mdx` - Update for parsing
12. `docs-src/content/docs/sdk/artifact-helpers.mdx` - Update for parsing
13. `docs-src/content/docs/examples/extract-invoice.mdx` - Update commands

### New Files to Create
1. `docs-src/content/docs/cli/parse.mdx` - New parse command
2. `docs-src/content/docs/cli/config.mdx` - Config command (providers, models, parsers)
3. `docs-src/content/docs/cli/utils.mdx` - Utils commands (artifact-viewer)
4. `docs-src/content/docs/explanation/parsers.mdx` - Parser system overview

### Meta Files to Update
1. `docs-src/content/docs/cli/meta.json` - New page list
2. `docs-src/content/docs/explanation/preprocessing/meta.json` - Remove why-no-parsing

---

## New Documentation Structure

### CLI Section (`docs-src/content/docs/cli/meta.json`)

```json
{
  "title": "CLI",
  "pages": [
    "installation",
    "extract",
    "parse",
    "config",
    "utils",
    "fields",
    "verify"
  ]
}
```

### Explanation Section (`docs-src/content/docs/explanation/meta.json`)

```json
{
  "title": "Concepts",
  "pages": [
    "pipeline",
    "parsers",
    "artifact-format",
    "chunking",
    "strategies",
    "validation"
  ]
}
```

---

## Detailed Page Outlines

### 1. `docs-src/content/docs/index.mdx` (Update)

**Changes:**
- Remove "It does not parse PDFs, HTML, Word docs, or images" from "What Struktur is NOT"
- Add: "It is not a general document conversion tool" (it parses for extraction, not for format conversion)
- Update the 10-second demo to show `struktur parse` or direct extraction from PDF
- Update quick navigation table

### 2. `docs-src/content/docs/quickstart.mdx` (Update)

**Changes:**
- Update `struktur auth set` to `struktur config providers add`
- Update `struktur auth default` to `struktur config models use`
- Add example with PDF file: `struktur --input invoice.pdf --fields ...`
- Remove the markitdown pipeline example (or move to advanced)

### 3. `docs-src/content/docs/cli/extract.mdx` (Major Update)

**Add new flags:**

```
## Parsing options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--no-parse` | boolean | false | Skip custom parsers; use only built-in text/image/artifact-JSON detection |
| `--mime <type>` | string | - | Override MIME type detection |
| `--parser <pkg>` | string | - | Use this npm package as parser, overriding configured parser |

## Image options (PDFs)

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--images` | boolean | false | Extract embedded images from PDFs |
| `--screenshots` | boolean | false | Render page screenshots as images |
| `--screenshot-scale <num>` | number | 1.5 | Scale factor for screenshots |
| `--screenshot-width <px>` | number | - | Target width for screenshots (overrides scale) |
```

**Update examples:**
- Add PDF extraction example
- Add `--images` example
- Update model examples to use new providers

### 4. `docs-src/content/docs/cli/parse.mdx` (NEW)

```markdown
---
title: parse
description: Convert files to Artifact JSON for inspection or preprocessing.
---

## Synopsis

struktur parse --input <file> [options]
struktur parse --stdin [options]

## Description

Converts a file or stdin to Artifact JSON. This is useful for:
- Inspecting how Struktur will chunk your document
- Pre-processing files for later extraction
- Debugging parser output

## Options

| Flag | Short | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--input <path>` | `-i` | string | - | File to parse |
| `--stdin` | `-s` | boolean | false | Read from stdin |
| `--output <path\|->` | `-o` | string | - | Output destination (default: stdout) |
| `--mime <type>` | | string | - | Override MIME type detection |
| `--parser <pkg>` | | string | - | Override configured parser |
| `--images` | | boolean | false | Extract embedded images (PDFs) |
| `--screenshots` | | boolean | false | Render page screenshots |
| `--screenshot-scale <num>` | | number | 1.5 | Screenshot scale factor |
| `--screenshot-width <px>` | | number | - | Screenshot target width |

## Built-in Parsers

| MIME Type | Parser | Output |
|-----------|--------|--------|
| `application/pdf` | pdf-parse | Per-page text + embedded images + optional screenshots |
| `text/*` | Built-in | Text split on double newlines |
| `image/*` | Built-in | Single image artifact |
| `application/json` | Built-in | Validates as SerializedArtifact[] |

## Examples

Parse a PDF with images:
```bash
struktur parse --input document.pdf --images --output artifact.json
```

Parse with screenshots:
```bash
struktur parse --input slides.pdf --screenshots --screenshot-scale 2
```

Use a custom parser:
```bash
struktur parse --input data.xlsx --parser @myorg/xlsx-parser
```

## See also

- [Parsers](/docs/explanation/parsers) - Parser system overview
- [Artifact Format](/docs/explanation/artifact-format) - Output format
- [config parsers](/docs/cli/config#parsers) - Configure custom parsers
```

### 5. `docs-src/content/docs/cli/config.mdx` (NEW - replaces auth.mdx and models.mdx)

```markdown
---
title: config
description: Manage Struktur configuration (providers, models, parsers).
---

## Overview

The `config` command manages all persistent configuration:

- **providers** - API tokens for LLM providers
- **models** - Default model and model aliases
- **parsers** - Custom parsers for file types

## config providers

### config providers list

List all supported providers and their configuration status:

```bash
struktur config providers list
```

Output:
```json
{
  "providers": [
    { "provider": "openai", "configured": true, "storage": "keychain" },
    { "provider": "anthropic", "configured": true, "storage": "file" },
    { "provider": "google", "configured": false, "storage": null },
    { "provider": "opencode", "configured": false, "storage": null },
    { "provider": "openrouter", "configured": false, "storage": null }
  ]
}
```

### config providers add

Store an API token for a provider:

```bash
struktur config providers add <provider> --token <token>
struktur config providers add <provider> --token-stdin
```

| Flag | Description |
|------|-------------|
| `--token <token>` | API token (avoid - visible in shell history) |
| `--token-stdin` | Read token from stdin |
| `--storage <auto\|keychain\|file>` | Storage backend (default: auto) |
| `--default` | Also set cheapest model as default |

Examples:
```bash
echo "sk-..." | struktur config providers add openai --token-stdin --default
struktur config providers add anthropic --token "sk-ant-..."
```

### config providers remove

Remove a stored token:

```bash
struktur config providers remove <provider>
```

## config models

### config models list

List available models for all or one provider:

```bash
struktur config models list
struktur config models list --provider openai
```

### config models use

Set the default model:

```bash
struktur config models use <provider/model>
struktur config models use <alias>
```

Examples:
```bash
struktur config models use openai/gpt-4.1-mini
struktur config models use fast  # if "fast" is an alias
```

### config models alias

Manage model aliases (shortcuts for frequently used models):

```bash
# List all aliases
struktur config models alias list

# Create an alias
struktur config models alias set fast openai/gpt-4.1-mini

# Get the model behind an alias
struktur config models alias get fast

# Remove an alias
struktur config models alias remove fast
```

Aliases can be used anywhere a model is expected:
```bash
struktur --input doc.pdf --model fast --fields ...
```

## config parsers

Manage custom parsers for MIME types.

### config parsers list

List all configured parsers:

```bash
struktur config parsers list
```

### config parsers get

Get the parser for a MIME type:

```bash
struktur config parsers get --mime application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

### config parsers add

Configure a parser for a MIME type:

```bash
# npm package parser
struktur config parsers add --mime <type> --npm <package>

# Shell command with file path
struktur config parsers add --mime <type> --file-command "<command>"

# Shell command reading stdin
struktur config parsers add --mime <type> --stdin-command "<command>"
```

**Parser types:**

| Type | Flag | Description |
|------|------|-------------|
| npm | `--npm <pkg>` | npm package exporting `parseStream` or `parseFile` |
| command-file | `--file-command` | Command with `FILE_PATH` placeholder |
| command-stdin | `--stdin-command` | Command reading stdin, outputting artifact JSON |

Examples:
```bash
# npm parser
struktur config parsers add --mime application/docx --npm @myorg/docx-parser

# Shell command (markitdown)
struktur config parsers add --mime application/vnd.openxmlformats-officedocument.wordprocessingml.document \
  --file-command "markitdown FILE_PATH"

# Stdin command
struktur config parsers add --mime text/html \
  --stdin-command "pandoc -f html -t json | my-converter"
```

### config parsers remove

Remove a configured parser:

```bash
struktur config parsers remove --mime <type>
```

## See also

- [Installation](/docs/cli/installation) - Initial setup
- [Parsers](/docs/explanation/parsers) - Parser system overview
- [Environment Variables](/docs/cli/environment) - Env var configuration
```

### 6. `docs-src/content/docs/cli/utils.mdx` (NEW)

```markdown
---
title: utils
description: Utility commands for working with artifacts.
---

## utils artifact-viewer

Generate an interactive HTML viewer for artifact JSON:

```bash
struktur utils artifact-viewer --input artifacts.json --output viewer.html
cat artifacts.json | struktur utils artifact-viewer --stdin > viewer.html
```

| Flag | Short | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--input <path>` | `-i` | string | - | Artifact JSON file |
| `--stdin` | `-s` | boolean | false | Read from stdin |
| `--output <path\|->` | `-o` | string | - | Output HTML file (default: stdout) |

The viewer includes:
- Default view showing artifacts with expandable text and clickable images
- Batching mode to visualize how documents are chunked
- Image filtering by type (embedded vs screenshot)
- Token estimation display

## See also

- [Artifact Format](/docs/explanation/artifact-format) - Understanding artifacts
- [parse](/docs/cli/parse) - Generate artifact JSON from files
```

### 7. `docs-src/content/docs/explanation/parsers.mdx` (NEW)

```markdown
---
title: Parsers
description: How Struktur parses files into artifacts.
---

## Overview

Struktur includes a flexible parsing system that converts files into the Artifact format. Parsers are resolved by MIME type and can be:

1. **Built-in** - PDF, text, images, artifact JSON
2. **npm packages** - Custom parser packages
3. **Shell commands** - External tools via file or stdin

## MIME Detection

MIME type is detected in three layers:

1. **Magic bytes** (authoritative) - PDF, PNG, JPEG, GIF, WebP, ZIP
2. **npm `detectFileType`** - Custom detection from npm parsers
3. **Extension database** - Fallback for file inputs

Override detection with `--mime` flag.

## Built-in Parsers

### PDF (`application/pdf`)

Uses `pdf-parse` to extract:
- Per-page text content
- Embedded images (with `--images`)
- Page screenshots (with `--screenshots`)

```bash
struktur parse --input doc.pdf --images --screenshots
```

### Text (`text/*`)

Splits text on double newlines into content slices.

### Images (`image/*`)

Creates a single-image artifact.

### JSON (`application/json`)

Validates as `SerializedArtifact[]` and hydrates.

## Custom Parsers

### npm Package Parser

Create a package that exports:

```typescript
import type { Artifact } from "@mateffy/struktur";

// At least one required
export function parseStream(stream: ReadableStream<Uint8Array>, mimeType: string): Promise<Artifact[]>;
export function parseFile(filePath: string, mimeType: string): Promise<Artifact[]>;

// Optional - for magic byte detection
export function detectFileType(header: Uint8Array): boolean;
```

Configure:
```bash
struktur config parsers add --mime application/docx --npm @myorg/docx-parser
```

### Shell Command Parsers

**File-based:**
```bash
struktur config parsers add --mime text/html \
  --file-command "markitdown FILE_PATH"
```

The command must output valid `SerializedArtifact[]` JSON.

**Stdin-based:**
```bash
struktur config parsers add --mime text/html \
  --stdin-command "pandoc -f html -t plain"
```

## Resolution Order

When parsing a file:

1. `--parser` flag (highest priority)
2. Configured parser for MIME type
3. Built-in parser for MIME type
4. Error if no parser found

## See also

- [parse command](/docs/cli/parse) - CLI for parsing files
- [config parsers](/docs/cli/config#parsers) - Configure custom parsers
- [Artifact Format](/docs/explanation/artifact-format) - Output format
```

### 8. `docs-src/content/docs/explanation/preprocessing/artifact-format.mdx` (Update)

**Add `imageType` field:**

```markdown
### Images

Each item in `media` has:

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | Must be `"image"` |
| `url` | No | URL to image (mutually exclusive with `base64`) |
| `base64` | No | Base64-encoded image data |
| `text` | No | Alt text or OCR output |
| `x`, `y`, `width`, `height` | No | Optional spatial metadata |
| `imageType` | No | `"embedded"` or `"screenshot"` - distinguishes extracted images from rendered page screenshots |

Either `url` or `base64` must be present.
```

### 9. `docs-src/content/docs/cli/installation.mdx` (Update)

**Update commands:**

```markdown
## Configure a provider (required)

### Option A: Environment variable

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_GENERATIVE_AI_API_KEY=AI...
export OPENCODE_API_KEY=...
export OPENROUTER_API_KEY=...
```

### Option B: Stored token

```bash
echo "$OPENAI_API_KEY" | struktur config providers add openai --token-stdin --default
```

## Set a default model

```bash
struktur config models use openai/gpt-4.1-mini
# or create an alias first:
struktur config models alias set fast openai/gpt-4.1-mini
struktur config models use fast
```
```

### 10. `docs-src/content/docs/cli/environment.mdx` (Update)

**Update variable names:**

```markdown
## Provider Tokens

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API token |
| `ANTHROPIC_API_KEY` | Anthropic API token |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Generative AI API token |
| `OPENCODE_API_KEY` | OpenCode Zen API token |
| `OPENROUTER_API_KEY` | OpenRouter API token |

## Configuration

| Variable | Description |
|----------|-------------|
| `STRUKTUR_CONFIG_DIR` | Override config directory (default: `~/.config/struktur`) |
| `STRUKTUR_DISABLE_KEYCHAIN` | Set to any value to disable macOS Keychain |
```

### 11. DELETE `docs-src/content/docs/explanation/preprocessing/why-no-parsing.mdx`

This file is now incorrect. Either delete it or replace with a redirect to the new parsers documentation.

### 12. `docs-src/content/docs/explanation/preprocessing/index.mdx` (Update)

**Simplify to redirect to parsers:**

```markdown
---
title: Document Processing
---

How Struktur handles input documents and converts them to artifacts.

## Topics

- [Parsers](/docs/explanation/parsers) - The parsing system
- [Artifact Format](/docs/explanation/artifact-format) - The JSON structure
```

---

## Implementation Order

1. **Delete** `why-no-parsing.mdx`
2. **Create** new files: `parse.mdx`, `config.mdx`, `utils.mdx`, `parsers.mdx`
3. **Update** meta.json files
4. **Update** existing files in order:
   - `index.mdx`
   - `quickstart.mdx`
   - `installation.mdx`
   - `extract.mdx`
   - `artifact-format.mdx`
   - `environment.mdx`
   - `preprocessing/index.mdx`
   - `pipeline.mdx`
   - `sdk/artifact-helpers.mdx`
   - `examples/extract-invoice.mdx`
5. **Delete** `auth.mdx` and `models.mdx` (replaced by `config.mdx`)

---

## Key Points to Emphasize

1. **Struktur now parses files** - This is a major shift from the previous documentation
2. **PDF is first-class** - Built-in parser with image extraction and screenshots
3. **Extensible via parsers** - npm packages or shell commands
4. **New CLI structure** - Everything under `config` subcommand
5. **Model aliases** - Shortcuts for frequently used models
6. **Image types** - Distinguish embedded images from screenshots
7. **New providers** - opencode and openrouter support

---

## Testing the Documentation

After updates, verify:

1. All CLI commands in docs match actual CLI output (`struktur --help`, `struktur config --help`, etc.)
2. All code examples are runnable
3. Links between pages are correct
4. The artifact format matches `src/types.ts` and `src/artifacts/input.ts`
5. Parser documentation matches `src/parsers/` implementation
