// Post-build shim generator
// tsup bundles src/strategies/index.ts -> dist/strategies.js (flat)
// tsc generates declarations as dist/strategies/index.d.ts (tree)
// We need dist/strategies.d.ts to match the flat JS entrypoint.
import { writeFileSync } from "node:fs";

writeFileSync("dist/strategies.d.ts", 'export * from "./strategies/index";\n');

writeFileSync("dist/parsers.d.ts", 'export * from "./parsers/index";\n');
