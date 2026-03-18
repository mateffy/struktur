import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { R as Route$6, c as clientLoader$2, b as baseOptions } from "./router-C-uetLed.mjs";
import { L as Link } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { u as useFumadocsLoader, D as DocsLayout } from "./index-Byf-Iy9F.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "node:stream/web";
import "node:stream";
import "./staticFunctionMiddleware-WHQ8LAqF.mjs";
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
import "./source-KegOWY1h.mjs";
import "./vs-source-DQP0_fAu.mjs";
import "./blog-source-GfUTTjRi.mjs";
import "../_chunks/_libs/@orama/orama.mjs";
function Page() {
  const {
    pageTree,
    slugs,
    path
  } = useFumadocsLoader(Route$6.useLoaderData());
  const markdownUrl = `/llms/vs/${slugs.length > 0 ? `${slugs.join("/")}.md` : "index.md"}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DocsLayout, { ...baseOptions(), tree: pageTree, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: markdownUrl, hidden: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { children: clientLoader$2.useContent(path, {
      markdownUrl,
      path
    }) })
  ] });
}
export {
  Page as component
};
