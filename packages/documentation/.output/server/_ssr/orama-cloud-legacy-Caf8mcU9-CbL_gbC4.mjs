import { a1 as createContentHighlighter, a2 as removeUndefined } from "./router-C-uetLed.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "node:stream/web";
import "node:stream";
import "../_chunks/_libs/@tanstack/react-router.mjs";
import "../_chunks/_libs/react.mjs";
import "../_libs/tiny-warning.mjs";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./staticFunctionMiddleware-WHQ8LAqF.mjs";
import "node:path";
import "../_libs/lucide-react.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/fumadocs-mdx.mjs";
import "node:fs/promises";
import "./index.mjs";
import "node:async_hooks";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
import "node:process";
import "node:url";
import "./source-KegOWY1h.mjs";
import "./vs-source-DQP0_fAu.mjs";
import "./blog-source-GfUTTjRi.mjs";
import "../_chunks/_libs/@orama/orama.mjs";
async function searchDocs(query, options) {
  const highlighter = createContentHighlighter(query);
  const list = [];
  const { index = "default", client, params: extraParams = {}, tag } = options;
  if (index === "crawler") {
    const result2 = await client.search({
      ...extraParams,
      term: query,
      where: {
        category: tag ? { eq: tag.slice(0, 1).toUpperCase() + tag.slice(1) } : void 0,
        ...extraParams.where
      },
      limit: 10
    });
    if (!result2) return list;
    for (const hit of result2.hits) {
      const doc = hit.document;
      list.push({
        id: hit.id,
        type: "page",
        content: highlighter.highlightMarkdown(doc.title),
        url: doc.path
      }, {
        id: "page" + hit.id,
        type: "text",
        content: highlighter.highlightMarkdown(doc.content),
        url: doc.path
      });
    }
    return list;
  }
  const params = {
    ...extraParams,
    term: query,
    where: removeUndefined({
      tag,
      ...extraParams.where
    }),
    groupBy: {
      properties: ["page_id"],
      maxResult: 7,
      ...extraParams.groupBy
    }
  };
  const result = await client.search(params);
  if (!result || !result.groups) return list;
  for (const item of result.groups) {
    let addedHead = false;
    for (const hit of item.result) {
      const doc = hit.document;
      if (!addedHead) {
        list.push({
          id: doc.page_id,
          type: "page",
          content: highlighter.highlightMarkdown(doc.title),
          breadcrumbs: doc.breadcrumbs,
          url: doc.url
        });
        addedHead = true;
      }
      list.push({
        id: doc.id,
        content: highlighter.highlightMarkdown(doc.content),
        type: doc.content === doc.section ? "heading" : "text",
        url: doc.section_id ? `${doc.url}#${doc.section_id}` : doc.url
      });
    }
  }
  return list;
}
export {
  searchDocs
};
