

Install the Struktur agent skill for your preferred AI coding tool.

* [npm: @struktur/skill](https://www.npmjs.com/package/@struktur/skill)
* [GitHub: packages/skill](https://github.com/mateffy/struktur/tree/main/packages/skill)

Installation Methods [#installation-methods]

Method 1: From npm Package [#method-1-from-npm-package]

```bash
# Install the package
npm install @struktur/skill
# or
bun add @struktur/skill

# Copy to your tool's skill directory
cp -r node_modules/@struktur/skill/skills/struktur ~/.config/claude/skills/
```

Method 2: Using Skills CLI [#method-2-using-skills-cli]

If you have the [skills CLI](https://github.com/vercel/skills) installed:

```bash
# Install from npm
npx skills add @struktur/skill

# Or install from GitHub
npx skills add https://github.com/mateffy/struktur/tree/main/packages/skill/skills/struktur
```

Method 3: Direct Copy from GitHub [#method-3-direct-copy-from-github]

```bash
# Clone and copy
git clone https://github.com/mateffy/struktur.git
cp -r struktur/packages/skill/skills/struktur ~/.config/claude/skills/
```

Tool-Specific Installation [#tool-specific-installation]

Claude Code [#claude-code]

**Global installation** (available in all projects):

```bash
mkdir -p ~/.config/claude/skills
cp -r node_modules/@struktur/skill/skills/struktur ~/.config/claude/skills/
```

**Project installation** (only in this project):

```bash
mkdir -p .agents/skills
cp -r node_modules/@struktur/skill/skills/struktur .agents/skills/
```

OpenCode [#opencode]

**Global installation**:

```bash
mkdir -p ~/.config/opencode/skills
cp -r node_modules/@struktur/skill/skills/struktur ~/.config/opencode/skills/
```

**Project installation**:

```bash
mkdir -p .agents/skills
cp -r node_modules/@struktur/skill/skills/struktur .agents/skills/
```

OpenAI Codex [#openai-codex]

**Global installation**:

```bash
mkdir -p ~/.codex/skills
cp -r node_modules/@struktur/skill/skills/struktur ~/.codex/skills/
```

**Project installation**:

```bash
mkdir -p .codex/skills
cp -r node_modules/@struktur/skill/skills/struktur .codex/skills/
```

Amp [#amp]

**Global installation**:

```bash
mkdir -p ~/.config/amp/skills
cp -r node_modules/@struktur/skill/skills/struktur ~/.config/amp/skills/
```

**Project installation**:

```bash
mkdir -p .agents/skills
cp -r node_modules/@struktur/skill/skills/struktur .agents/skills/
```

VS Code (GitHub Copilot) [#vs-code-github-copilot]

**Workspace installation**:

```bash
mkdir -p .vscode/skills
cp -r node_modules/@struktur/skill/skills/struktur .vscode/skills/struktur
```

Cursor [#cursor]

**Project installation**:

```bash
mkdir -p .cursor/skills
cp -r node_modules/@struktur/skill/skills/struktur .cursor/skills/struktur
```

Gemini CLI [#gemini-cli]

**Global installation**:

```bash
mkdir -p ~/.config/gemini/skills
cp -r node_modules/@struktur/skill/skills/struktur ~/.config/gemini/skills/
```

**Project installation**:

```bash
mkdir -p .agents/skills
cp -r node_modules/@struktur/skill/skills/struktur .agents/skills/
```

Verification [#verification]

After installation, restart your AI agent and ask:

```
"Do you have access to the struktur skill?"
```

The agent should confirm it can see the skill and describe what it knows about Struktur.

Updating [#updating]

To update to the latest version:

```bash
# Update the npm package
npm update @struktur/skill

# Re-copy to skill directory
cp -r node_modules/@struktur/skill/skills/struktur ~/.config/claude/skills/
```

Uninstalling [#uninstalling]

Remove the skill directory:

```bash
# For Claude Code
rm -rf ~/.config/claude/skills/struktur

# For OpenCode
rm -rf ~/.config/opencode/skills/struktur

# For project-level installations
rm -rf .agents/skills/struktur
```
