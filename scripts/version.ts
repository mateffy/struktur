#!/usr/bin/env bun
import { $ } from "bun";

const versionType = process.argv[2] || "";

if (!["patch", "minor", "major"].includes(versionType)) {
  console.error("Usage: bun run version:<patch|minor|major>");
  process.exit(1);
}

const packages = ["packages/sdk", "packages/cli"];

for (const pkg of packages) {
  console.log(`Updating ${pkg}...`);
  await $`npm version ${versionType} --no-git-tag-version`.cwd(pkg);
}

console.log("Done!");
