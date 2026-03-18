import { c as createServerRpc } from "./createServerRpc-29xaFZcb.mjs";
import { p as notFound } from "../_chunks/_libs/@tanstack/router-core.mjs";
import { c as compareSource } from "./compare-source-DNeY0V8m.mjs";
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
  id: "25a0ac6bb1a085a7932460f6190d5ea34d18506c9bd20fc50ccaad89dc52c20c",
  name: "loader",
  filename: "src/routes/compare/$.tsx"
}, (opts) => loader.__executeServer(opts));
const loader = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).middleware([staticFunctionMiddleware]).handler(loader_createServerFn_handler, async ({
  data: slugs
}) => {
  const page = compareSource.getPage(slugs);
  if (!page) throw notFound();
  return {
    slugs: page.slugs,
    path: page.path,
    pageTree: await compareSource.serializePageTree(compareSource.getPageTree())
  };
});
export {
  loader_createServerFn_handler
};
