import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { compare } from "fumadocs-mdx:collections/server";

export const compareSource = loader({
  source: compare.toFumadocsSource(),
  baseUrl: "/compare",
  plugins: [lucideIconsPlugin()],
});

export async function getCompareLLMText(page: InferPageType<typeof compareSource>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}

${processed}`;
}
