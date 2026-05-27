import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { config } from "../config";

/**
 * Bearer token auth middleware.
 * Skips auth when API_KEY is not configured.
 * Always allows /openapi.json without auth.
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const path = c.req.path;

  // Always allow OpenAPI documentation, API client UI, and debug UI
  if (path === "/openapi.json" || path === "/client" || path === "/debug") {
    return next();
  }

  const apiKey = config.API_KEY;
  if (!apiKey) {
    return next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    throw new HTTPException(401, { message: "Missing Authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new HTTPException(401, {
      message: "Invalid Authorization header format. Use: Bearer <token>",
    });
  }

  if (token !== apiKey) {
    throw new HTTPException(401, { message: "Invalid API key" });
  }

  return next();
});
