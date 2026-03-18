import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { vs } from 'fumadocs-mdx:collections/server';

export const vsSource = loader({
  source: vs.toFumadocsSource(),
  baseUrl: '/vs',
  plugins: [lucideIconsPlugin()],
});

export async function getVsLLMText(page: InferPageType<typeof vsSource>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}
