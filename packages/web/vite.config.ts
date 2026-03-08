import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const ssrPlugin = (): Plugin => {
	return {
		name: "configure-server",
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				try {
					const url = req.url || "/";

					if (url.startsWith("/api/")) {
						const { app } = await server.ssrLoadModule("/src/server/hono.ts");

						let body: BodyInit | undefined;
						if (req.method !== "GET" && req.method !== "HEAD") {
							const chunks: Uint8Array[] = [];
							for await (const chunk of req) {
								chunks.push(chunk);
							}
							body = Buffer.concat(chunks);
						}

						const request = new Request(`http://localhost${url}`, {
							method: req.method,
							headers: req.headers as HeadersInit,
							body,
						});
						const response = await app.fetch(request);

						res.statusCode = response.status;
						response.headers.forEach((value: string, key: string) => {
							res.setHeader(key, value);
						});

						const responseBody = await response.text();
						res.end(responseBody);
						return;
					}

					next();
				} catch (error) {
					console.error("API Error:", error);
					res.statusCode = 500;
					res.end("Internal Server Error");
				}
			});
		},
		transformIndexHtml: async (html: string, ctx: any) => {
			if (!ctx.server) {
				return html;
			}

			const url = ctx.path === "/index.html" ? "/" : ctx.path;
			console.log("transformIndexHtml called for:", url);

			try {
				const { render } = await ctx.server.ssrLoadModule(
					"/src/entry-server.tsx",
				);
				const rendered = await render(url);

				return html
					.replace("<!--app-html-->", rendered.html)
					.replace("<!--app-head-->", rendered.head || "");
			} catch (error) {
				console.error("SSR Error:", error);
				return html;
			}
		},
	};
};

const config = defineConfig({
	plugins: [
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		TanStackRouterVite(),
		viteReact(),
		ssrPlugin(),
	],
});

export default config;
