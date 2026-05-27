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
var compare = defineDocs({
  dir: "content/compare",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true
    }
  }
});
var source_config_default = defineConfig();
export {
  blog,
  compare,
  source_config_default as default,
  docs
};
