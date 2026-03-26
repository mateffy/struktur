import { createFileRoute, notFound } from "@tanstack/react-router";
import { blogSource } from "@/lib/blog-source";

export const Route = createFileRoute("/llms/blog/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        let slugs = (params._splat ?? "").split("/").filter(Boolean);
        const lastSlug = slugs[slugs.length - 1];
        if (lastSlug?.endsWith(".md")) {
          slugs[slugs.length - 1] = lastSlug.slice(0, -3);
        }
        if (slugs.length === 1 && slugs[0] === "index") {
          slugs = [];
        }
        const page = blogSource.getPage(slugs);
        if (!page) throw notFound();

        return new Response(await page.data.getText("processed"), {
          headers: {
            "Content-Type": "text/markdown",
          },
        });
      },
    },
  },
});
