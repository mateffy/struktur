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

// Publish packages to npm with pnpm
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
  }
}

console.log(`\n✓ Successfully published version ${version}!`);
console.log(`  - npm: @struktur/telemetry@${version}`);
console.log(`  - npm: @struktur/fields@${version}`);
console.log(`  - npm: @struktur/sdk@${version}`);
console.log(`  - npm: @struktur/processors@${version}`);
console.log(`  - npm: @struktur/cli@${version}`);
console.log(`  - GitHub: https://github.com/mateffy/struktur/releases/tag/${tag}`);