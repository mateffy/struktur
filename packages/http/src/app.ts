import { Hono } from "hono";
import { cors } from "hono/cors";
import { openAPIRouteHandler } from "hono-openapi";
import { authMiddleware } from "./middleware/auth";
import infoApp from "./routes/info";
import parseApp from "./routes/parse";
import extractApp from "./routes/extract";
import extractStreamApp from "./routes/extract-stream";
import clientApp from "./routes/client";
import debugApp from "./routes/debug";
import packageJson from "../package.json" with { type: "json" };

const app = new Hono();

app.use("*", cors());
app.use("*", authMiddleware);

// Mount sub-routes
app.route("/", infoApp);
app.route("/", parseApp);
app.route("/", extractApp);
app.route("/", extractStreamApp);
app.route("/client", clientApp);
app.route("/debug", debugApp);

// OpenAPI documentation
app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Struktur HTTP API",
        version: packageJson.version,
        description:
          "HTTP API for running Struktur headlessly. Parse files into artifacts and extract structured data using LLMs.",
      },
      servers: [
        {
          url: "http://localhost:3031",
          description: "Local development server",
        },
      ],
      tags: [
        { name: "Info", description: "API information" },
        { name: "Parse", description: "File parsing operations" },
        { name: "Extract", description: "Data extraction operations" },
      ],
    },
  }),
);

export { app };
