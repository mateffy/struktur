# Struktur Agent Skill

This directory contains the Agent Skill for Struktur - structured data extraction using the Vercel AI SDK.

## What is an Agent Skill?

An Agent Skill is a modular knowledge package that AI coding agents (like Claude Code, OpenCode, Codex, etc.) can discover and load automatically. Skills follow an open standard and work across 16+ AI agent tools.

## How It Works

When you ask your AI agent to work with Struktur, this skill automatically loads and provides:

- **API Usage**: How to use `extract()`, build artifacts, define schemas
- **Strategy Selection**: When to use `simple`, `parallel`, `sequential`, `doublePass`, etc.
- **Schema Definition**: JSON Schema patterns and shorthand field syntax
- **CLI Commands**: All struktur CLI commands and options
- **Best Practices**: Token budgets, validation retries, merge rules

## Installation

### For Claude Code

```bash
# Install globally
mkdir -p ~/.config/claude/skills
cp -r . ~/.config/claude/skills/struktur

# Or install in a project
mkdir -p .agents/skills
cp -r . .agents/skills/struktur
```

### For OpenCode

```bash
# Install globally
mkdir -p ~/.config/opencode/skills
cp -r . ~/.config/opencode/skills/struktur

# Or install in a project
mkdir -p .agents/skills
cp -r . .agents/skills/struktur
```

### For OpenAI Codex

```bash
# Install globally
mkdir -p ~/.codex/skills
cp -r . ~/.codex/skills/struktur

# Or install in a project
mkdir -p .codex/skills
cp -r . .codex/skills/struktur
```

### For Amp

```bash
# Install globally
mkdir -p ~/.config/amp/skills
cp -r . ~/.config/amp/skills/struktur

# Or install in a project
mkdir -p .agents/skills
cp -r . .agents/skills/struktur
```

### For VS Code (GitHub Copilot)

```bash
# Install in workspace
mkdir -p .vscode/skills
cp -r . .vscode/skills/struktur
```

### For Cursor

```bash
# Install in project
mkdir -p .cursor/skills
cp -r . .cursor/skills/struktur
```

### Using the Skills CLI (Universal)

If you have the [skills CLI](https://github.com/vercel/skills) installed:

```bash
# Install from npm
npx skills add @struktur/skill

# Or install from GitHub
npx skills add https://github.com/mateffy/struktur/tree/main/packages/skill/skills/struktur
```

## Usage

Once installed, just ask your AI agent:

```
"Use struktur to extract product data from this PDF"
"Set up struktur to parse invoices with parallel strategy"
"Help me configure the struktur CLI for my project"
```

The agent will automatically load this skill and follow Struktur's best practices.

## Supported Tools

This skill works with any tool that supports the [Agent Skills open standard](https://github.com/anthropics/skills):

- ✅ Claude Code
- ✅ OpenCode
- ✅ OpenAI Codex
- ✅ Amp
- ✅ VS Code (GitHub Copilot)
- ✅ Cursor
- ✅ Gemini CLI
- ✅ JetBrains (Junie)
- ✅ And 10+ more tools

## Skill Structure

```
struktur/
├── SKILL.md          # Main skill file (this directory)
├── README.md         # This file
├── scripts/          # (optional) executable helpers
├── references/       # (optional) additional docs
└── assets/           # (optional) templates and examples
```

## Progressive Disclosure

The skill uses progressive disclosure to minimize token usage:

1. **Metadata Phase** (~100 tokens): Agent loads only name + description
2. **Activation Phase**: When task matches description, agent asks permission to load
3. **Full Load** (up to 5,000 tokens): Complete SKILL.md loads into context
4. **On-Demand**: Supporting files (scripts, references) load as needed

## Resources

- [Struktur Repository](https://github.com/mateffy/struktur)
- [Struktur Documentation](https://github.com/mateffy/struktur#readme)
- [Agent Skills Specification](https://github.com/anthropics/skills)
- [Vercel AI SDK](https://sdk.vercel.ai)

## License

MIT
