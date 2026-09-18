#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

const versionType = process.argv[2] || "";

if (!["patch", "minor", "major"].includes(versionType)) {
  console.error("Usage: node scripts/version.ts <patch|minor|major>");
  process.exit(1);
}

// Every package shares one version. Derive it once from the SDK (the same source
// of truth scripts/publish.ts uses) so a release can never drift into per-package
// versions, then write it to every package that declares one.
const sdkJson = JSON.parse(readFileSync("packages/sdk/package.json", "utf-8"));
const [major, minor, patch] = sdkJson.version.split(".").map(Number);

let newVersion: string;
if (versionType === "major") {
  newVersion = `${major + 1}.0.0`;
} else if (versionType === "minor") {
  newVersion = `${major}.${minor + 1}.0`;
} else {
  newVersion = `${major}.${minor}.${patch + 1}`;
}

const packageDirs = readdirSync("packages", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `packages/${entry.name}`);

for (const pkgPath of packageDirs) {
  const pkgJsonPath = `${pkgPath}/package.json`;
  let pkgJson: { name?: string; version?: string };

  try {
    pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
  } catch {
    continue;
  }

  if (pkgJson.version === undefined) {
    continue;
  }

  pkgJson.version = newVersion;
  writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");

  console.log(`${pkgJson.name}: v${newVersion}`);
}

// Update pnpm-lock.yaml so workspace:* resolves to the new versions
console.log("Updating pnpm-lock.yaml...");
execSync("pnpm install --lockfile-only", { stdio: "inherit" });

console.log("Done!");
