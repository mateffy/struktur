import { serve } from "bun";
import { app } from "./src/server/hono";
import fs from "node:fs";
import path from "node:path";

const PORT = process.env.PORT || 3030;
const CLIENT_DIR = path.join(__dirname, "dist");

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/")) {
      return app.fetch(req);
    }

    if (req.method === "GET") {
      const clientPath = path.join(CLIENT_DIR, url.pathname);

      if (fs.existsSync(clientPath) && fs.statSync(clientPath).isFile()) {
        const file = Bun.file(clientPath);
        return new Response(file);
      }

      const indexPath = path.join(CLIENT_DIR, "index.html");
      if (fs.existsSync(indexPath)) {
        const template = fs.readFileSync(indexPath, "utf-8");

        const { render } = await import("./dist/server/entry-server.js");
        const rendered = await render(url.pathname);

        const html = template
          .replace("<!--app-html-->", rendered.html)
          .replace("<!--app-head-->", rendered.head || "");

        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${PORT}`);
