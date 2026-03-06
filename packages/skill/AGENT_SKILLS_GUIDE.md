# Agent Skills Guide for Multiple Providers

This document summarizes how agent skills work across different AI coding tools.

## Overview

Agent Skills are modular knowledge packages that AI coding agents can discover and load automatically. They follow an open standard that works across multiple tools.

## Common Format

All tools support the same basic structure:

```
skill-name/
├── SKILL.md          # Required: instructions + YAML frontmatter
├── scripts/          # Optional: executable helpers
├── references/       # Optional: additional documentation
└── assets/           # Optional: templates and examples
```

### SKILL.md Format

```markdown
---
name: skill-name
description: When to use this skill (CRITICAL - determines auto-activation)
metadata:
  author: name
  version: "1.0"
---

# Skill Title

Instructions for the agent...
```

## Progressive Disclosure

All tools use progressive disclosure to minimize token usage:

1. **Metadata Phase** (~100 tokens): Agent loads only name + description
2. **Activation Phase**: When task matches description, agent asks permission to load
3. **Full Load** (up to 5,000 tokens): Complete SKILL.md loads into context
4. **On-Demand**: Supporting files (scripts, references) load as needed

## Provider-Specific Details

### Claude Code

**Skill Locations:**
- Global: `~/.config/claude/skills/`
- Project: `.agents/skills/`

**Features:**
- Auto-discovery on startup
- Progressive disclosure
- Supports scripts, references, assets
- Can invoke skills with `/skill-name`

**Documentation:** [Claude Code Skills Guide](https://docs.anthropic.com/claude-code/skills)

### OpenCode

**Skill Locations:**
- Global: `~/.config/opencode/skills/`
- Project: `.agents/skills/`

**Features:**
- Implements Agent Skills open standard
- Same format as Claude Code
- Progressive disclosure
- Works with multiple models

**Documentation:** [OpenCode Skills](https://github.com/opencode/skills)

### OpenAI Codex

**Skill Locations:**
- Global: `~/.codex/skills/`
- Project: `.codex/skills/`

**Additional Features:**
- Also supports `AGENTS.md` for project-level instructions
- Merges AGENTS.md files from root to current directory
- Skills complement AGENTS.md

**Documentation:** [Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md/)

### Amp

**Skill Locations:**
- Global: `~/.config/amp/skills/`
- Project: `.agents/skills/`

**Migration:**
- Migrated from "custom commands" to skills
- Old: `.agents/commands/` → New: `.agents/skills/`
- Can invoke skills directly

**Documentation:** [Amp Skills](https://ampcode.com/news/slashing-custom-commands)

### VS Code (GitHub Copilot)

**Skill Locations:**
- Workspace: `.vscode/skills/`

**Features:**
- Agent Skills integration
- Works with GitHub Copilot Chat
- Progressive disclosure

**Documentation:** [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/skills)

### Cursor

**Skill Locations:**
- Project: `.cursor/skills/`

**Features:**
- Supports Agent Skills standard
- Works alongside `.cursorrules`
- Progressive disclosure

**Documentation:** [Cursor Skills](https://cursor.sh/docs/skills)

### Gemini CLI

**Skill Locations:**
- Global: `~/.config/gemini/skills/`
- Project: `.agents/skills/`

**Features:**
- Supports Agent Skills standard
- Progressive disclosure

### JetBrains (Junie)

**Skill Locations:**
- Project: `.agents/skills/`

**Features:**
- Supports Agent Skills standard
- IDE integration

## Installation Methods

### Method 1: Copy to Skill Directory

```bash
# Example for Claude Code
mkdir -p ~/.config/claude/skills
cp -r ./my-skill ~/.config/claude/skills/
```

### Method 2: Skills CLI (Universal)

```bash
# Install from npm
npx skills add @namespace/skill-name

# Install from GitHub
npx skills add https://github.com/user/repo/tree/main/skills/skill-name

# Auto-discovery from docs URL
npx skills add https://docs.example.com
```

### Method 3: Package Manager

```bash
# Install as npm package
npm install @namespace/skill

# Copy to skill directory
cp -r node_modules/@namespace/skill/skills/* ~/.config/claude/skills/
```

## Best Practices

### 1. Description is Everything

The `description` field determines when the skill activates. It should:
- Be specific enough to avoid false positives
- Be broad enough to catch relevant requests
- Use keywords the user might say

**Good:**
```yaml
description: Extract structured JSON from documents using Vercel AI SDK. Use when working with @namespace/struktur — importing extract(), choosing strategies, building artifacts, or defining schemas.
```

**Bad:**
```yaml
description: Helps with data extraction
```

### 2. Keep Instructions Under 5,000 Tokens

- Focus on the "how" not the "what"
- Use references/ for detailed docs
- Link to external documentation

### 3. Use Scripts for Automation

```markdown
# SKILL.md
---
name: deploy
description: Deploy the application to production
---

Run `{baseDir}/scripts/deploy.sh` to deploy.
```

### 4. Structure for Progressive Disclosure

```markdown
# SKILL.md (loaded on activation)
Quick reference and decision trees

# references/advanced.md (loaded on demand)
Detailed examples and edge cases

# scripts/helper.ts (loaded when needed)
Executable automation
```

### 5. Test Across Tools

Skills should work across all compatible tools. Test with:
- Claude Code
- OpenCode
- Codex
- Your team's preferred tools

## Security Considerations

### Supply Chain Risk

Skills can contain executable scripts. Only install skills from trusted sources.

**Best Practices:**
- Review SKILL.md before installing
- Audit scripts/ directory
- Use official skill repositories
- Pin to specific versions

### Malicious Skills

As of 2026, security researchers have found malicious skills in the wild. Protect yourself:
- Use the skills CLI which validates skills
- Review before installing
- Report suspicious skills

## Publishing Skills

### To npm

```json
{
  "name": "@namespace/skill-name",
  "files": ["skills/**/*"]
}
```

### To GitHub

```
skills/
├── my-skill/
│   ├── SKILL.md
│   └── ...
```

Users can install with:
```bash
npx skills add https://github.com/user/repo/tree/main/skills/my-skill
```

### To Documentation Site

Place at `.well-known/skills/default/skill.md`:
```
https://docs.example.com/.well-known/skills/default/skill.md
```

Users can install with:
```bash
npx skills add https://docs.example.com
```

## Resources

- [Agent Skills Specification](https://github.com/anthropics/skills)
- [Skills CLI](https://github.com/vercel/skills)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [OpenAI Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md/)
- [Community Skills Repository](https://github.com/anthropics/skills)
