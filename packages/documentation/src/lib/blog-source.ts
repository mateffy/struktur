import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { blog } from "fumadocs-mdx:collections/server";

export const blogSource = loader({
  source: blog.toFumadocsSource(),
  baseUrl: "/blog",
  plugins: [lucideIconsPlugin()],
});

export async function getBlogLLMText(page: InferPageType<typeof blogSource>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}

${processed}`;
}
