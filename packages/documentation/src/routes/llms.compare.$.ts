import { createFileRoute, notFound } from "@tanstack/react-router";
import { compareSource } from "@/lib/compare-source";

export const Route = createFileRoute("/llms/compare/$")({
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
        const page = compareSource.getPage(slugs);
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
