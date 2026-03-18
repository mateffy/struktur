import { c as createServerRpc } from "./createServerRpc-29xaFZcb.mjs";
import { p as notFound } from "../_chunks/_libs/@tanstack/router-core.mjs";
import { b as blogSource } from "./blog-source-Bg_-sP4R.mjs";
import { Q as staticFunctionMiddleware } from "./staticFunctionMiddleware-Cl6ijKlk.mjs";
import { c as createServerFn } from "./index.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "node:stream/web";
import "node:stream";
import "node:path";
import "../_chunks/_libs/react.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/fumadocs-mdx.mjs";
import "node:fs/promises";
import "node:async_hooks";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
import "../_chunks/_libs/@tanstack/react-router.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/isbot.mjs";
const loader_createServerFn_handler = createServerRpc({
  id: "300554c3ab8f003654334d9b2a88828fe0a1605f8a59e9d3da4c875392dd96a9",
  name: "loader",
  filename: "src/routes/blog/$.tsx"
}, (opts) => loader.__executeServer(opts));
const loader = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).middleware([staticFunctionMiddleware]).handler(loader_createServerFn_handler, async ({
  data: slugs
}) => {
  const page = blogSource.getPage(slugs);
  if (!page) throw notFound();
  return {
    slugs: page.slugs,
    path: page.path,
    pageTree: await blogSource.serializePageTree(blogSource.getPageTree())
  };
});
export {
  loader_createServerFn_handler
};
