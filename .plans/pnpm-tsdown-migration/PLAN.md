# Pnpm + tsdown Migration Plan

> **Status:** DRAFT
> **Plan:** `./.plans/pnpm-tsdown-migration/PLAN.md`
> **Last updated:** 2026-07-08

---

## ⚠️ Instructions for the implementing agent

**READ THIS SECTION BEFORE TOUCHING ANY CODE.**

You are an executor. Your job is to implement this plan exactly as written.
This plan was written with full context from a prior research and design session.
You do not have that context. The plan is your complete specification.

**Rules you must follow without exception:**

1. **Do not deviate from this plan.** Do not simplify steps, skip phases, combine
   tasks, or substitute approaches — even if a different approach seems easier or
   more elegant. The decisions here were made deliberately. Respect them.

2. **Do not make decisions not explicitly covered by this plan.** If you reach a
   point where the plan is ambiguous or where you feel you need to make a choice
   the plan does not make for you, **stop and ask the user** before proceeding.

3. **Do not change the plan.** If you believe a plan decision is wrong or
   suboptimal, stop and tell the user why. Do not silently implement something
   different.

4. **Work phase by phase.** Complete one phase fully before starting the next.

5. **Update the Progress section** at the bottom of this file as you work.

6. **If your context window is running low**, finish the current task cleanly,
   update the Progress section, then tell the user you need a fresh session.

---

## Goal

Migrate the Struktur monorepo from Bun workspaces + tsup to pnpm workspaces + tsdown for all published packages (fields, sdk, telemetry, cli). Fix all 4 failing CLI tests along the way.

## Approach

Replace `bun.lock` / bun workspaces with `pnpm-workspace.yaml` / `pnpm-lock.yaml`. Replace tsup with tsdown (Rolldown-based, same DX, better defaults, handles JS bundling + dts generation in one step) for the four published packages. Rewrite Bun-dependent build/release scripts (`scripts/version.ts`, `scripts/publish.ts`) to use Node.js built-ins (`node:child_process`, `node:fs`). Drop the SDK's separate `tsc` + postbuild steps since tsdown handles dts natively. Keep `bun test` as the test runner but run it via pnpm scripts. Leave non-published packages (app, documentation, http, skill, web) untouched except for workspace dependency format changes.

**Alternatives considered & rejected:**
- **Keep tsup**: tsup works but tsdown is faster (Rust-based), handles dts better (no separate tsc step needed), and is a drop-in successor. The user explicitly requested it.
- **Use `@changesets/cli`**: Adds complexity the current manual scripts don't need. User's existing version/publish scripts are simple and work. Converted to Node.js instead.
- **Use Bun-only approach**: The user specifically wants pnpm, which is the industry-standard monorepo package manager with better workspace isolation and strictness.

## Tech stack & conventions

- **pnpm**: version 11.9.0 (installed), Node.js 24.8.0
- **tsdown**: `^0.22.0` — the elegant bundler for libraries, powered by Rolldown
- **Test runner**: `bun test` (kept — tests use Bun APIs like `Bun.spawnSync`, `Bun.file`)
- **Linting**: `oxlint` / `oxfmt` (unchanged)
- **Package inter-dependencies**: `workspace:*` protocol (same in pnpm as in bun workspaces)
- **Build scripts in package.json**: use `pnpm run build` (not `bun run build`) within the repo
- **Published packages**: `@struktur/fields`, `@struktur/sdk`, `@struktur/telemetry`, `@struktur/cli`
- **Private packages** (not published, build unchanged): `@struktur/app`, `@struktur/documentation`, `@struktur/http`, `@struktur/skill`, `@struktur/web`

---

## Context & orientation

### Current build setup per published package

| Package | Current build | tsup config file |
|---------|-------------|-----------------|
| `packages/fields` | `tsup && tsc --project tsconfig.build.json` | `packages/fields/tsup.config.ts` — entry: `src/index.ts`, dts: true, ESM |
| `packages/sdk` | `tsup && tsc --project tsconfig.build.json && node scripts/postbuild.mjs` | `packages/sdk/tsup.config.ts` — entries: index, strategies, parsers; dts: false (dts via tsc); ESM |
| `packages/telemetry` | `tsup` | `packages/telemetry/tsup.config.ts` — entries: index, types, factory, adapters/*; dts: false (no types generated); ESM; externalizes OTEL deps |
| `packages/cli` | `tsup` | `packages/cli/tsup.config.ts` — entry: `src/cli.ts`; dts: false; `define: { __CLI_VERSION__ }`; `banner: { js: "#!/usr/bin/env node" }`; external: SDK + telemetry |

### Key files

- Root: `package.json` (bun workspaces), `bun.lock`, `tsconfig.json` (project references)
- Scripts: `scripts/version.ts`, `scripts/publish.ts` (both use Bun APIs)
- SDK postbuild: `packages/sdk/scripts/postbuild.mjs` — creates `dist/strategies.d.ts` and `dist/parsers.d.ts` that re-export from `./strategies/index` and `./parsers/index` because tsc generates tree-structured declarations but tsdown bundles flat JS
- CLI: `packages/cli/src/cli.ts` line 1 — `declare const __CLI_VERSION__: string | undefined;` with fallback to `'0.0.0-dev'` (already fixed)

### Workspace dependencies (workspace:*)

- `packages/cli` → `@struktur/sdk`, `@struktur/telemetry`
- `packages/sdk` → `@struktur/fields`
- `packages/app` → `@struktur/sdk`
- `packages/http` → `@struktur/sdk`
- `packages/web` → `@struktur/sdk`

All `workspace:*` references are already pnpm-compatible (no change needed).

---

## Scope

**In scope (exact paths):**
- `package.json` (root) — workspace config
- `pnpm-workspace.yaml` (create)
- `.npmrc` (create)
- `packages/fields/package.json` — build scripts
- `packages/fields/tsdown.config.ts` (create, replaces `tsup.config.ts`)
- `packages/sdk/package.json` — build scripts
- `packages/sdk/tsdown.config.ts` (create, replaces `tsup.config.ts`)
- `packages/telemetry/package.json` — build scripts
- `packages/telemetry/tsdown.config.ts` (create, replaces `tsup.config.ts`)
- `packages/cli/package.json` — build scripts
- `packages/cli/tsdown.config.ts` (create, replaces `tsup.config.ts`)
- `scripts/version.ts` — migrate from Bun to Node.js
- `scripts/publish.ts` — migrate from Bun to Node.js

**Out of scope:**
- `packages/app/**` — uses electrobun, unrelated build system
- `packages/documentation/**` — uses Vite, unrelated
- `packages/http/**` — not published, no build step
- `packages/skill/**` — MD-only package, no build
- `packages/web/**` — uses Vite, unrelated
- Test changes beyond the CLI_VERSION fix (already done)
- CI/CD workflows (none exist yet)
- Adding new dependencies not listed here

**Forbidden actions:**
- Do NOT change `bun test` to another test runner — tests use Bun APIs
- Do NOT modify any `.ts` source files outside of config files and scripts
- Do NOT add dependencies without explicit listing in this plan
- Do NOT change existing package versions
- Do NOT run `git` commands (commit, tag, etc.)
- Do NOT delete `bun.lock` until pnpm install produces a working `pnpm-lock.yaml`

---

## Acceptance criteria

- `pnpm install` succeeds with no errors at the repo root
- `pnpm build` succeeds — builds fields, sdk, telemetry, cli in dependency order
- `pnpm test` runs all 463 tests and all pass (0 failures)
- `pnpm lint` (`oxlint`) passes
- `pnpm run --filter @struktur/cli build` produces `packages/cli/dist/cli.js` with:
  - `#!/usr/bin/env node` shebang on line 1
  - `__CLI_VERSION__` replaced with actual version string
- `pnpm run --filter @struktur/sdk build` produces:
  - `packages/sdk/dist/index.js`, `dist/index.d.ts`
  - `packages/sdk/dist/strategies.js`, `dist/strategies.d.ts`
  - `packages/sdk/dist/parsers.js`, `dist/parsers.d.ts`
  - No postbuild script needed
- `pnpm run --filter @struktur/fields build` produces `packages/fields/dist/index.js` + `dist/index.d.ts`
- `pnpm run --filter @struktur/telemetry build` produces all dist entries

---

## Phases & tasks

### Phase 1: Setup pnpm workspace

Replace bun workspace config with pnpm workspace config. Install dependencies with pnpm. This must come first because all subsequent phases depend on pnpm being the package manager.

#### Task 1.1: Create pnpm-workspace.yaml

**Why:** pnpm requires this file to define which directories are workspaces.

**Files:**
- Create: `pnpm-workspace.yaml`

**Steps:**

- [ ] **Step 1:** Create `pnpm-workspace.yaml` at repo root.

```yaml
packages:
  - "packages/*"
```

#### Task 1.2: Create .npmrc with pnpm settings

**Why:** Configure pnpm's behavior for the monorepo (hoisting, shamefully-hoist for compat, strict peer deps).

**Files:**
- Create: `.npmrc`

**Steps:**

- [ ] **Step 1:** Create `.npmrc`:

```ini
# pnpm settings
shamefully-hoist=true
strict-peer-dependencies=false
link-workspace-packages=deep
```

#### Task 1.3: Update root package.json for pnpm

**Why:** Remove bun-specific fields, add `packageManager` field, update scripts to use `pnpm` instead of `bun run --filter`.

**Files:**
- Modify: `package.json` (root)

**Steps:**

- [ ] **Step 1:** Remove `"workspaces": ["packages/*"]` from root `package.json`. pnpm reads workspaces from `pnpm-workspace.yaml`.

- [ ] **Step 2:** Add `"packageManager": "pnpm@11.9.0"` field.

- [ ] **Step 3:** Update `"build"` script to use pnpm filters:
```json
"build": "pnpm --filter @struktur/fields --filter @struktur/sdk --filter @struktur/telemetry --filter @struktur/cli build"
```
Note: `pnpm` filter syntax uses `--filter` (same as bun).

- [ ] **Step 4:** Update `"test"` script. Since tests use `bun test`, keep using bun for test execution but invoke via pnpm:
```json
"test": "bun test"
```

#### Task 1.4: Remove bun.lock and install with pnpm

**Why:** pnpm needs its own lockfile. Remove the old bun.lock so there's no confusion.

**Files:**
- Delete: `bun.lock`
- Create: `pnpm-lock.yaml` (generated by pnpm install)

**Steps:**

- [ ] **Step 1:** Delete `bun.lock`:
```bash
trash bun.lock
```

- [ ] **Step 2:** Run pnpm install:
```bash
pnpm install
```
Expected: installs all dependencies, generates `pnpm-lock.yaml`. May show peer dependency warnings (acceptable).

- [ ] **Step 3:** Verify install succeeded — check `ls node_modules/.pnpm` exists (pnpm's virtual store).

---

### Phase 2: Migrate published packages to tsdown

Replace tsup with tsdown in each of the four published packages. Install tsdown as a devDependency in each.

#### Task 2.1: Install tsdown in all buildable packages

**Why:** tsdown is needed before we can write configs for it.

**Steps:**

- [ ] **Step 1:** Install tsdown in each package:
```bash
pnpm --filter @struktur/fields add -D tsdown
pnpm --filter @struktur/sdk add -D tsdown
pnpm --filter @struktur/telemetry add -D tsdown
pnpm --filter @struktur/cli add -D tsdown
```

- [ ] **Step 2:** Remove tsup from each package:
```bash
pnpm --filter @struktur/fields remove tsup
pnpm --filter @struktur/sdk remove tsup
pnpm --filter @struktur/telemetry remove tsup
pnpm --filter @struktur/cli remove tsup
```

#### Task 2.2: Migrate @struktur/fields to tsdown

**Why:** Simplest package — single entry, was already doing `tsup && tsc`. With tsdown, both JS and dts in one step.

**Files:**
- Create: `packages/fields/tsdown.config.ts`
- Modify: `packages/fields/package.json` (build script)
- Delete: `packages/fields/tsup.config.ts`

**Steps:**

- [ ] **Step 1:** Create `packages/fields/tsdown.config.ts`:

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
});
```

- [ ] **Step 2:** Update `packages/fields/package.json` scripts:

```json
"build": "tsdown",
"prepublishOnly": "pnpm run build"
```

- [ ] **Step 3:** Delete `packages/fields/tsup.config.ts` and `packages/fields/tsconfig.build.json` (no longer needed — tsdown uses the main `tsconfig.json`).

- [ ] **Step 4:** Build and verify:
```bash
pnpm --filter @struktur/fields build
```
Expected: produces `packages/fields/dist/index.js` and `packages/fields/dist/index.d.ts`.

#### Task 2.3: Migrate @struktur/sdk to tsdown

**Why:** Most complex build — three entries, previously needed separate `tsc` + postbuild for dts. tsdown handles dts per-entry natively, eliminating the need for postbuild.

**Key decision:** tsdown's dts generation with multiple entries produces flat declaration files matching entry names (e.g., `dist/strategies.d.ts` directly, not `dist/strategies/index.d.ts`). This means the postbuild script that creates re-export shims is no longer needed.

**Caveat:** tsdown's dts uses TypeScript compiler under the hood (or oxc-transform with `isolatedDeclarations`). The current SDK `tsconfig.json` has `noEmit: true` — this is fine because tsdown uses its own compilation path for dts, reading the config but overriding `noEmit`.

**Files:**
- Create: `packages/sdk/tsdown.config.ts`
- Modify: `packages/sdk/package.json` (build script)
- Delete: `packages/sdk/tsup.config.ts`, `packages/sdk/scripts/postbuild.mjs` (no longer needed)

**Steps:**

- [ ] **Step 1:** Create `packages/sdk/tsdown.config.ts`:

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    strategies: "src/strategies/index.ts",
    parsers: "src/parsers/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["@struktur/fields"],
});
```

Note: `@struktur/fields` is a workspace dependency and will be auto-externalized by tsdown (it reads `dependencies` from package.json), but we list it explicitly for clarity.

- [ ] **Step 2:** Update `packages/sdk/package.json` scripts:

```json
"build": "tsdown",
"prepublishOnly": "pnpm run build"
```

- [ ] **Step 3:** Delete `packages/sdk/tsup.config.ts`, `packages/sdk/tsconfig.build.json` (dts is now handled by tsdown), and `packages/sdk/scripts/postbuild.mjs`.

- [ ] **Step 4:** Build and verify:
```bash
pnpm --filter @struktur/sdk build
```
Expected: produces `dist/index.js`, `dist/index.d.ts`, `dist/strategies.js`, `dist/strategies.d.ts`, `dist/parsers.js`, `dist/parsers.d.ts`.

- [ ] **Step 5:** Verify the dts files export correctly:

```bash
head -5 packages/sdk/dist/strategies.d.ts
```
Expected: contains `export * from "..."` or direct declarations (not a re-export from `./strategies/index`).

If tsdown's dts output is per-file (mirrors source structure) instead of per-entry, we may need a small `onSuccess` hook. Check the output and report to user if this happens. The fallback would be to add a minimal `onSuccess`:

```ts
onSuccess: async () => {
  const { writeFileSync } = await import("node:fs");
  writeFileSync("dist/strategies.d.ts", 'export * from "./strategies/index";\n');
  writeFileSync("dist/parsers.d.ts", 'export * from "./parsers/index";\n');
}
```

#### Task 2.4: Migrate @struktur/telemetry to tsdown

**Why:** Multiple entries, external OTEL deps. tsdown auto-externalizes `dependencies` + `optionalDependencies` but not devDependencies. The OTEL packages are `optionalDependencies` so they'll be externalized automatically.

**Files:**
- Create: `packages/telemetry/tsdown.config.ts`
- Modify: `packages/telemetry/package.json` (build script)
- Delete: `packages/telemetry/tsup.config.ts`

**Steps:**

- [ ] **Step 1:** Create `packages/telemetry/tsdown.config.ts`:

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    types: "src/types.ts",
    factory: "src/factory.ts",
    "adapters/phoenix": "src/adapters/phoenix/index.ts",
    "adapters/langfuse": "src/adapters/langfuse/index.ts",
  },
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
});
```

Note: `dts: false` because `@struktur/telemetry` does not currently generate types (no `types` field in package.json, tsup had `dts: false`). The OTEL optional deps are auto-externalized.

- [ ] **Step 2:** Update `packages/telemetry/package.json` scripts:

```json
"build": "tsdown",
"prepublishOnly": "pnpm run build"
```

- [ ] **Step 3:** Delete `packages/telemetry/tsup.config.ts`.

- [ ] **Step 4:** Build and verify:
```bash
pnpm --filter @struktur/telemetry build
```
Expected: produces all dist entries as listed in the config.

#### Task 2.5: Migrate @struktur/cli to tsdown

**Why:** CLI needs `define` for `__CLI_VERSION__` and `banner` for the shebang. tsdown supports both natively.

**Files:**
- Create: `packages/cli/tsdown.config.ts`
- Modify: `packages/cli/package.json` (build script)
- Delete: `packages/cli/tsup.config.ts`

**Steps:**

- [ ] **Step 1:** Create `packages/cli/tsdown.config.ts`:

```ts
import { defineConfig } from "tsdown";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8")) as { version: string };

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
  },
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  define: {
    __CLI_VERSION__: JSON.stringify(pkg.version),
  },
  external: ["@struktur/sdk", "@struktur/telemetry"],
});
```

Note: `external` explicitly lists workspace deps for clarity. tsdown would auto-externalize them anyway since they're in `dependencies`.

- [ ] **Step 2:** Update `packages/cli/package.json` scripts:

```json
"build": "tsdown",
"prepublishOnly": "pnpm run build"
```

- [ ] **Step 3:** Delete `packages/cli/tsup.config.ts`.

- [ ] **Step 4:** Build and verify:
```bash
pnpm --filter @struktur/cli build
```
Expected: produces `packages/cli/dist/cli.js`. Verify:
```bash
head -1 packages/cli/dist/cli.js
```
Should output: `#!/usr/bin/env node`
```bash
grep -o '"2\.[0-9]\+\.[0-9]\+"' packages/cli/dist/cli.js | head -1
```
Should output the version string.

---

### Phase 3: Rewrite build/release scripts for Node.js

The current `scripts/version.ts` and `scripts/publish.ts` use Bun APIs (`Bun.file`, `Bun.write`, `$` shell). Since we're moving to pnpm, these need to work with Node.js. Rewrite them using `node:child_process` and `node:fs` — zero extra dependencies.

#### Task 3.1: Rewrite scripts/version.ts

**Why:** Must work without Bun runtime. Uses `node:fs` for JSON reading/writing, `node:child_process` for `pnpm install --lockfile-only`.

**Files:**
- Modify: `scripts/version.ts`
- Modify: `package.json` (root) — version script commands

**Steps:**

- [ ] **Step 1:** Replace `scripts/version.ts` content:

```ts
#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const versionType = process.argv[2] || "";

if (!["patch", "minor", "major"].includes(versionType)) {
  console.error("Usage: node scripts/version.ts <patch|minor|major>");
  process.exit(1);
}

const packages = ["packages/fields", "packages/sdk", "packages/cli", "packages/telemetry"];

for (const pkgPath of packages) {
  console.log(`Updating ${pkgPath}...`);

  const pkgJsonPath = `${pkgPath}/package.json`;
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));

  const [major, minor, patch] = pkgJson.version.split(".").map(Number);
  let newVersion: string;
  if (versionType === "major") {
    newVersion = `${major + 1}.0.0`;
  } else if (versionType === "minor") {
    newVersion = `${major}.${minor + 1}.0`;
  } else {
    newVersion = `${major}.${minor}.${patch + 1}`;
  }

  pkgJson.version = newVersion;
  writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");

  console.log(`${pkgJson.name}: v${newVersion}`);
}

console.log("Updating pnpm-lock.yaml...");
execSync("pnpm install --lockfile-only", { stdio: "inherit" });

console.log("Done!");
```

- [ ] **Step 2:** Update root `package.json` scripts to use `node` instead of `bun`:

```json
"version:patch": "node scripts/version.ts patch",
"version:minor": "node scripts/version.ts minor",
"version:major": "node scripts/version.ts major"
```

#### Task 3.2: Rewrite scripts/publish.ts

**Why:** Same reason — remove Bun dependency for publish workflow.

**Files:**
- Modify: `scripts/publish.ts`
- Modify: `package.json` (root) — publish script command

**Steps:**

- [ ] **Step 1:** Replace `scripts/publish.ts` content:

```ts
#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const packages = [
  { name: "@struktur/telemetry", path: "packages/telemetry" },
  { name: "@struktur/sdk", path: "packages/sdk" },
  { name: "@struktur/cli", path: "packages/cli" },
];

// Read version from SDK package (source of truth)
const sdkJson = JSON.parse(readFileSync("packages/sdk/package.json", "utf-8"));
const version = sdkJson.version;
const tag = `v${version}`;

console.log(`Publishing version ${version}...\n`);

// Check if tag already exists
let tagExists = false;
try {
  execSync(`git rev-parse ${tag}`, { stdio: "pipe" });
  tagExists = true;
} catch {
  // Tag doesn't exist
}

if (tagExists) {
  console.error(`Error: Tag ${tag} already exists.`);
  console.error("Did you forget to run 'pnpm version:<patch|minor|major>' first?");
  process.exit(1);
}

execSync("pnpm install", { stdio: "inherit" });

// Check for uncommitted changes
try {
  const status = execSync("git status --porcelain", { encoding: "utf-8" });
  if (status.trim()) {
    console.error("Error: You have uncommitted changes. Please commit or stash them first.");
    process.exit(1);
  }
} catch {
  // Ignore if git status fails
}

// Check if gh CLI is available
let ghAvailable = false;
try {
  execSync("gh --version", { stdio: "pipe" });
  ghAvailable = true;
} catch {
  console.warn("Warning: GitHub CLI (gh) not found. Skipping GitHub release creation.");
}

// Create git tag
console.log(`Creating git tag ${tag}...`);
execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: "inherit" });

// Push tag to GitHub
console.log(`Pushing tag to GitHub...`);
execSync(`git push origin ${tag}`, { stdio: "inherit" });

// Publish packages to npm
console.log("\nPublishing packages to npm...\n");

for (const pkg of packages) {
  console.log(`Publishing ${pkg.name}...`);
  try {
    execSync("pnpm publish --access public --no-git-checks", {
      cwd: pkg.path,
      stdio: "inherit",
    });
    console.log(`✓ ${pkg.name} published\n`);
  } catch (error) {
    console.error(`✗ Failed to publish ${pkg.name}`);
    console.error(error);
    console.error("\nRolling back: deleting tag...");
    execSync(`git tag -d ${tag}`, { stdio: "inherit" });
    execSync(`git push origin --delete ${tag}`, { stdio: "inherit" });
    process.exit(1);
  }
}

// Create GitHub release
if (ghAvailable) {
  console.log("Creating GitHub release...");
  try {
    execSync(`gh release create ${tag} --title "${tag}" --generate-notes`, { stdio: "inherit" });
    console.log(
      `✓ GitHub release created: https://github.com/mateffy/struktur/releases/tag/${tag}`,
    );
  } catch (error) {
    console.error("✗ Failed to create GitHub release");
    console.error(error);
    console.error(
      "You can create it manually at: https://github.com/mateffy/struktur/releases/new",
    );
  }
}

console.log(`\n✓ Successfully published version ${version}!`);
console.log(`  - npm: @struktur/telemetry@${version}`);
console.log(`  - npm: @struktur/sdk@${version}`);
console.log(`  - npm: @struktur/cli@${version}`);
console.log(`  - GitHub: https://github.com/mateffy/struktur/releases/tag/${tag}`);
```

- [ ] **Step 2:** Update root `package.json` publish script:

```json
"publish": "node scripts/publish.ts"
```

---

### Phase 4: Update .gitignore and verify full build

#### Task 4.1: Update .gitignore

**Why:** Add pnpm-specific entries.

**Files:**
- Modify: `.gitignore`

**Steps:**

- [ ] **Step 1:** Add these lines to `.gitignore` (at the top of the "dependencies" section is fine):

```gitignore
# pnpm
.pnpm-store
```

`pnpm-lock.yaml` should **not** be in `.gitignore` — it must be committed (like `bun.lock` was).

#### Task 4.2: Full build verification

**Why:** Ensure all packages build correctly in dependency order and the output is correct.

**Steps:**

- [ ] **Step 1:** Clean all dist directories:
```bash
pnpm --filter @struktur/fields --filter @struktur/sdk --filter @struktur/telemetry --filter @struktur/cli exec rm -rf dist
```

- [ ] **Step 2:** Build all packages in order:
```bash
pnpm --filter @struktur/fields build
pnpm --filter @struktur/sdk build
pnpm --filter @struktur/telemetry build
pnpm --filter @struktur/cli build
```
Or use the root script (which respects pnpm's topological order):
```bash
pnpm build
```

- [ ] **Step 3:** Verify dist outputs exist:
```bash
ls packages/fields/dist/index.js packages/fields/dist/index.d.ts
ls packages/sdk/dist/index.js packages/sdk/dist/index.d.ts
ls packages/sdk/dist/strategies.js packages/sdk/dist/strategies.d.ts
ls packages/sdk/dist/parsers.js packages/sdk/dist/parsers.d.ts
ls packages/telemetry/dist/index.js
ls packages/cli/dist/cli.js
```
All should exist (0 exit codes).

- [ ] **Step 4:** Verify CLI shebang:
```bash
head -1 packages/cli/dist/cli.js
```
Expected: `#!/usr/bin/env node`

- [ ] **Step 5:** Run full test suite:
```bash
pnpm test
```
Expected: 463 pass, 0 fail.

---

## Validation

The complete set of commands that prove the plan delivered, with exact expected output.

```bash
# 1. Clean install
pnpm install
# Expected: installs with no errors

# 2. Full build
pnpm build
# Expected: all 4 packages build successfully, no errors

# 3. Full test suite
pnpm test
# Expected: 463 pass, 0 fail

# 4. Lint
pnpm lint
# Expected: 0 errors

# 5. Verify CLI output
head -1 packages/cli/dist/cli.js
# Expected: #!/usr/bin/env node

# 6. Verify SDK dts output
ls packages/sdk/dist/strategies.d.ts packages/sdk/dist/parsers.d.ts
# Expected: both files exist

# 7. Verify fields output
ls packages/fields/dist/index.d.ts
# Expected: file exists

# 8. Run CLI built artifact
node packages/cli/dist/cli.js --help 2>&1 || true
# Expected: shows help text, not "ReferenceError: __CLI_VERSION__ is not defined"
```

---

## Risks & rollback

- **Risk:** tsdown's dts generation for SDK multi-entry may produce different file structure than expected (e.g., `dist/strategies/index.d.ts` instead of `dist/strategies.d.ts`). Likelihood: medium. **Mitigation:** Task 2.3 Step 5 includes verification + an onSuccess fallback. If the structure doesn't match, the onSuccess hook in the config will create the needed shims.

- **Risk:** pnpm install may fail on some packages with peer dependency conflicts. Likelihood: low (node_modules are already clean). **Mitigation:** `.npmrc` has `strict-peer-dependencies=false`.

- **Risk:** The electronbun-based `@struktur/app` package may have compatibility issues with pnpm. Likelihood: low. **Mitigation:** Out of scope for this change — app is not published, can be debugged separately.

- **Risk:** `bun test` may behave differently when dependencies are managed by pnpm vs bun. Likelihood: very low. **Mitigation:** Bun reads `node_modules` the same regardless of package manager. If there's an issue, verify symlinks with `ls -la packages/*/node_modules`.

- **Rollback:** `git checkout .` restores all files. Delete `pnpm-lock.yaml` and `pnpm-workspace.yaml`, run `bun install` to restore bun.lock. Revert `.gitignore` changes.

---

## Open questions

None. All decisions resolved during research.

---

## Progress

**This section is maintained by the implementing agent. Update it continuously.**

### Phase completion

- [ ] Phase 1: Setup pnpm workspace
- [ ] Phase 2: Migrate published packages to tsdown
- [ ] Phase 3: Rewrite build/release scripts for Node.js
- [ ] Phase 4: Update .gitignore and verify full build
- [ ] Validation complete
- [ ] Plan marked DONE

### Session log

---
*(no entries yet)*