// source.config.ts
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true
    }
  }
});
var blog = defineDocs({
  dir: "content/blog",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true
    }
  }
});
var vs = defineDocs({
  dir: "content/vs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true
    }
  }
});
var source_config_default = defineConfig();
export {
  blog,
  source_config_default as default,
  docs,
  vs
};
