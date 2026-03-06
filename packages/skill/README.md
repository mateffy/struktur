<picture height="0">
  <source media="(min-width: 769px)" srcset="https://raw.githubusercontent.com/mateffy/struktur/main/resources/pixel.png" width="0" height="0">
  <img src="https://raw.githubusercontent.com/mateffy/struktur/main/resources/struktur-icon-padded.webp" alt="Struktur Logo" width="150">
</picture>

<div>
    <h1>
        <picture>
            <source media="(max-width: 768px)" srcset="https://raw.githubusercontent.com/mateffy/struktur/main/resources/pixel.png" width="0" height="0">
            <img src="https://raw.githubusercontent.com/mateffy/struktur/main/resources/struktur-icon-padded.webp" alt="Struktur Logo" width="225" align="left">
        </picture>
        Struktur Agent Skill
    </h1>
    <p>
      All-in-one tool for structured data extraction using LLMs. Feed it documents, get back validated JSON. Handles parsing files, chunking, retries, merging, and deduplication — you just define the schema and choose a strategy. <br /><br />
        <a href="https://struktur.sh/docs/quickstart" target="_blank">Quickstart</a> |
        <a href="https://struktur.sh/docs" target="_blank">Documentation</a>
    </p>
</div>

<br />
<br />

## @struktur/skill

Agent skill for Struktur - structured data extraction using the Vercel AI SDK. This skill teaches AI coding assistants (like Claude Code, OpenCode, Codex, etc.) how to use Struktur effectively.

## What is This?

This package contains an [Agent Skills](https://github.com/anthropics/skills) compatible skill file that works across 16+ AI agent tools. When you ask your AI agent to work with Struktur, this skill automatically loads and provides:

- **API Usage**: How to use `extract()`, build artifacts, define schemas
- **Strategy Selection**: When to use `simple`, `parallel`, `sequential`, `doublePass`, etc.
- **Schema Definition**: JSON Schema patterns and shorthand field syntax
- **CLI Commands**: All struktur CLI commands and options
- **Best Practices**: Token budgets, validation retries, merge rules

## Installation

### From npm

```bash
npm install @struktur/skill
```

Then copy to your tool's skill directory:

```bash
# For Claude Code
cp -r node_modules/@struktur/skill/skills/struktur ~/.config/claude/skills/

# For OpenCode
cp -r node_modules/@struktur/skill/skills/struktur ~/.config/opencode/skills/

# For OpenAI Codex
cp -r node_modules/@struktur/skill/skills/struktur ~/.codex/skills/
```

### Using Skills CLI

```bash
npx skills add @struktur/skill
```

## Supported Tools

- ✅ Claude Code
- ✅ OpenCode
- ✅ OpenAI Codex
- ✅ Amp
- ✅ VS Code (GitHub Copilot)
- ✅ Cursor
- ✅ Gemini CLI
- ✅ JetBrains (Junie)
- ✅ And 10+ more tools

## Documentation

Full documentation at **[struktur.sh](https://struktur.sh)**

- [Agent Skill Guide](https://struktur.sh/docs/skill)
- [Installation](https://struktur.sh/docs/skill/installation)
- [Usage](https://struktur.sh/docs/skill/usage)

## Repository

This package is part of the [Struktur monorepo](https://github.com/mateffy/struktur).
