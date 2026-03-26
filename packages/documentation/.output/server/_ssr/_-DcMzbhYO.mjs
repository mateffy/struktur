import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { a as Route$5, d as clientLoader$1, b as baseOptions } from "./router-BEYNYY0z.mjs";
import { L as Link } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { u as useFumadocsLoader, D as DocsLayout } from "./index-Dx1o-Sqr.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "node:stream/web";
import "node:stream";
import "./staticFunctionMiddleware-BO_LZi6-.mjs";
import "node:path";
import "../_libs/lucide-react.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/fumadocs-mdx.mjs";
import "node:fs/promises";
import "./index.mjs";
import "node:async_hooks";
import "../_libs/srvx.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/isbot.mjs";
import "node:process";
import "node:url";
import "./source-DCLGgwyz.mjs";
import "./compare-source-Dn9eBBxm.mjs";
import "./blog-source-DlB01hey.mjs";
import "../_chunks/_libs/@orama/orama.mjs";
function Page() {
  const {
    pageTree,
    slugs,
    path
  } = useFumadocsLoader(Route$5.useLoaderData());
  const markdownUrl = `/llms/compare/${slugs.length > 0 ? `${slugs.join("/")}.md` : "index.md"}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DocsLayout, { ...baseOptions(), tree: pageTree, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: markdownUrl, hidden: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { children: clientLoader$1.useContent(path, {
      markdownUrl,
      path
    }) })
  ] });
}
export {
  Page as component
};
