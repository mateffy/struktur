#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const versionType = process.argv[2] || "";

if (!["patch", "minor", "major"].includes(versionType)) {
  console.error("Usage: node scripts/version.ts <patch|minor|major>");
  process.exit(1);
}

const packages = ["packages/fields", "packages/sdk", "packages/processors", "packages/cli", "packages/telemetry"];

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

// Update pnpm-lock.yaml so workspace:* resolves to the new versions
console.log("Updating pnpm-lock.yaml...");
execSync("pnpm install --lockfile-only", { stdio: "inherit" });

console.log("Done!");