import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { e as Route$4, f as clientLoader, b as baseOptions } from "./router-B8jVzjaF.mjs";
import { L as Link } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { u as useFumadocsLoader, D as DocsLayout } from "./index-BQ-LB-qJ.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "node:stream/web";
import "node:stream";
import "./staticFunctionMiddleware-Cl6ijKlk.mjs";
import "node:path";
import "../_libs/lucide-react.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/fumadocs-mdx.mjs";
import "node:fs/promises";
import "./index.mjs";
import "node:async_hooks";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
import "../_libs/tiny-warning.mjs";
import "../_libs/isbot.mjs";
import "node:process";
import "node:url";
import "./source-CLitwyFB.mjs";
import "./compare-source-DNeY0V8m.mjs";
import "./blog-source-Bg_-sP4R.mjs";
import "../_chunks/_libs/@orama/orama.mjs";
function Page() {
  const {
    pageTree,
    slugs,
    path
  } = useFumadocsLoader(Route$4.useLoaderData());
  const markdownUrl = `/llms/blog/${slugs.length > 0 ? `${slugs.join("/")}.md` : "index.md"}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DocsLayout, { ...baseOptions(), tree: pageTree, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: markdownUrl, hidden: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { children: clientLoader.useContent(path, {
      markdownUrl,
      path
    }) })
  ] });
}
export {
  Page as component
};
