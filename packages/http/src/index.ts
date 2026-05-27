// Workaround for AI SDK timestamp parsing issue with certain providers
// Some providers (e.g., opencode) return invalid timestamps that cause
// RangeError: Invalid Date when AI SDK tries to call toISOString()
const originalToISOString = Date.prototype.toISOString;
Date.prototype.toISOString = function () {
  try {
    return originalToISOString.call(this);
  } catch {
    // Return current time as fallback for invalid dates
    return new Date().toISOString();
  }
};

import { serve } from "@hono/node-server";
import { app } from "./app";
import { config } from "./config";

serve({
  fetch: app.fetch,
  port: config.PORT,
});

console.log(`struktur-http listening on http://localhost:${config.PORT}`);
console.log(`OpenAPI documentation available at http://localhost:${config.PORT}/openapi.json`);
