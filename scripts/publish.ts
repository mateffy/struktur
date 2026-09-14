#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const packages = [
  { name: "@struktur/telemetry", path: "packages/telemetry" },
  { name: "@struktur/fields", path: "packages/fields" },
  { name: "@struktur/sdk", path: "packages/sdk" },
  { name: "@struktur/processors", path: "packages/processors" },
  { name: "@struktur/cli", path: "packages/cli" },
];

// Read version from SDK package (source of truth)
const sdkJson = JSON.parse(readFileSync("packages/sdk/package.json", "utf-8"));
const version = sdkJson.version;
const tag = `v${version}`;

console.log(`Publishing version ${version}...\n`);

/** True when this exact version already exists on the registry. */
const isPublished = (name: string, pkgVersion: string): boolean => {
  try {
    const out = execSync(`npm view ${name}@${pkgVersion} version`, {
      encoding: "utf-8",
      stdio: "pipe",
    });
    return out.trim() !== "";
  } catch {
    // Not found — or the registry is unreachable, in which case let the publish
    // attempt fail loudly rather than silently skipping a new package.
    return false;
  }
};

// Refuse to publish a version that was already released from different code.
// Re-running the release for a tag that points at HEAD is fine — the tag may have
// been created by hand or a previous run may have died after tagging.
let tagExists = false;
try {
  execSync(`git rev-parse ${tag}`, { stdio: "pipe" });
  tagExists = true;
} catch {
  // Tag doesn't exist
}

if (tagExists) {
  const tagCommit = execSync(`git rev-parse ${tag}^{commit}`, { encoding: "utf-8" }).trim();
  const headCommit = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();

  if (tagCommit !== headCommit) {
    console.error(`Error: Tag ${tag} already exists and points at ${tagCommit.slice(0, 7)},`);
    console.error(`       but HEAD is ${headCommit.slice(0, 7)}.`);
    console.error("Refusing to publish a version that was already released from different code.");
    console.error("Did you forget to run 'pnpm version:<patch|minor|major>' first?");
    process.exit(1);
  }

  console.log(`Tag ${tag} already exists at HEAD; reusing it.\n`);
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
if (!tagExists) {
  console.log(`Creating git tag ${tag}...`);
  execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: "inherit" });
}

// Push tag to GitHub (idempotent when it is already up to date)
console.log(`Pushing tag to GitHub...`);
execSync(`git push origin ${tag}`, { stdio: "inherit" });

// Publish packages to npm with pnpm. Packages whose version is already on the
// registry are skipped: a release only bumps the packages that actually changed,
// so blindly publishing all five fails on the first unchanged one.
console.log("\nPublishing packages to npm...\n");

const released: Array<{ name: string; version: string }> = [];

for (const pkg of packages) {
  const pkgVersion = JSON.parse(readFileSync(`${pkg.path}/package.json`, "utf-8")).version;

  if (isPublished(pkg.name, pkgVersion)) {
    console.log(`Skipping ${pkg.name}@${pkgVersion} (already published)\n`);
    continue;
  }

  console.log(`Publishing ${pkg.name}@${pkgVersion}...`);
  try {
    execSync("pnpm publish --access public --no-git-checks", {
      cwd: pkg.path,
      stdio: "inherit",
    });
    released.push({ name: pkg.name, version: pkgVersion });
    console.log(`✓ ${pkg.name}@${pkgVersion} published\n`);
  } catch (error) {
    console.error(`✗ Failed to publish ${pkg.name}@${pkgVersion}`);
    console.error(error);
    if (released.length > 0) {
      console.error("\nAlready published in this run:");
      for (const done of released) console.error(`  - ${done.name}@${done.version}`);
    }
    if (tagExists) {
      // The tag predates this run, so leave it alone.
      console.error("\nLeaving the existing tag in place.");
    } else {
      console.error("\nRolling back: deleting tag...");
      execSync(`git tag -d ${tag}`, { stdio: "inherit" });
      execSync(`git push origin --delete ${tag}`, { stdio: "inherit" });
    }
    process.exit(1);
  }
}

// Create GitHub release
if (ghAvailable) {
  let releaseExists = false;
  try {
    execSync(`gh release view ${tag}`, { stdio: "pipe" });
    releaseExists = true;
  } catch {
    // Release doesn't exist yet
  }

  if (releaseExists) {
    console.log(`GitHub release ${tag} already exists; reusing it.`);
  } else {
    console.log("Creating GitHub release...");
    try {
      execSync(`gh release create ${tag} --title "${tag}" --generate-notes`, { stdio: "inherit" });
      console.log(
        `✓ GitHub release created: https://github.com/mateffy/struktur/releases/tag/${tag}`,
      );
    } catch (error) {
      console.error("✗ Failed to create GitHub release");
      console.error(error);
    }
  }

  // Build and upload standalone binary
  console.log("\nBuilding standalone binary...");
  try {
    execSync("bun run build:binary", { cwd: "packages/cli", stdio: "inherit" });
    const arch = process.arch === "arm64" ? "arm64" : "x64";
    const platform = process.platform === "darwin" ? "macos" : "linux";
    const binaryName = `struktur-${platform}-${arch}`;
    execSync(`cp packages/cli/dist/struktur ${binaryName}`);
    execSync(`gh release upload ${tag} ${binaryName} --clobber`, { stdio: "inherit" });
    execSync(`rm ${binaryName}`);
    console.log(`✓ Binary uploaded: ${binaryName}\n`);
  } catch (error) {
    console.error("✗ Failed to build or upload binary");
    console.error(error);
  }
}

console.log(`\n✓ Released version ${version}!`);
for (const pkg of released) {
  console.log(`  - npm: ${pkg.name}@${pkg.version}`);
}
if (released.length === 0) {
  console.log("  - npm: nothing to publish (all versions already on the registry)");
}
console.log(`  - GitHub: https://github.com/mateffy/struktur/releases/tag/${tag}`);
