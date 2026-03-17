#!/usr/bin/env bun
import { $ } from "bun";

const versionType = process.argv[2] || "";

if (!["patch", "minor", "major"].includes(versionType)) {
  console.error("Usage: bun run version:<patch|minor|major>");
  process.exit(1);
}

const packages = [
  "packages/sdk",
  "packages/cli",
  "packages/telemetry",
  "packages/agent-strategy",
];

for (const pkg of packages) {
  console.log(`Updating ${pkg}...`);

  // Read package.json
  const pkgPath = `${pkg}/package.json`;
  const pkgJson = await Bun.file(pkgPath).json();

  // Parse current version
  const currentVersion = pkgJson.version;
  const [major, minor, patch] = currentVersion.split(".").map(Number);

  // Calculate new version
  let newVersion: string;
  if (versionType === "major") {
    newVersion = `${major + 1}.0.0`;
  } else if (versionType === "minor") {
    newVersion = `${major}.${minor + 1}.0`;
  } else {
    newVersion = `${major}.${minor}.${patch + 1}`;
  }

  // Update version
  pkgJson.version = newVersion;

  // Write back
  await Bun.write(pkgPath, JSON.stringify(pkgJson, null, 2) + "\n");

  console.log(`${pkgJson.name}: v${newVersion}`);
}

console.log("Done!");
