import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export const blog = defineDocs({
  dir: 'content/blog',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export const vs = defineDocs({
  dir: 'content/vs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig();
