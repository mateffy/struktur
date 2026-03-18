import { c as createServerRpc } from "./createServerRpc-29xaFZcb.mjs";
import { p as notFound } from "../_chunks/_libs/@tanstack/router-core.mjs";
import { v as vsSource } from "./vs-source-DQP0_fAu.mjs";
import { Q as staticFunctionMiddleware } from "./staticFunctionMiddleware-WHQ8LAqF.mjs";
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
  id: "fe62c5cda26688153c890d341085fc2bd2cccd2de0c9f9ee464656a54b6b4e8a",
  name: "loader",
  filename: "src/routes/vs/$.tsx"
}, (opts) => loader.__executeServer(opts));
const loader = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).middleware([staticFunctionMiddleware]).handler(loader_createServerFn_handler, async ({
  data: slugs
}) => {
  const page = vsSource.getPage(slugs);
  if (!page) throw notFound();
  return {
    slugs: page.slugs,
    path: page.path,
    pageTree: await vsSource.serializePageTree(vsSource.getPageTree())
  };
});
export {
  loader_createServerFn_handler
};
