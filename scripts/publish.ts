#!/usr/bin/env bun
import { $ } from "bun";

const packages = [
  { name: "@struktur/sdk", path: "packages/sdk" },
  { name: "@struktur/cli", path: "packages/cli" },
];

console.log("Publishing packages...\n");

for (const pkg of packages) {
  console.log(`Publishing ${pkg.name}...`);
  try {
    await $`bun publish --access public`.cwd(pkg.path);
    console.log(`✓ ${pkg.name} published\n`);
  } catch (error) {
    console.error(`✗ Failed to publish ${pkg.name}`);
    console.error(error);
    process.exit(1);
  }
}

console.log("All packages published successfully!");
