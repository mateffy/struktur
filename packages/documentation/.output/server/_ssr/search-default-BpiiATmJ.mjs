import { H as useI18n, I as useDocsSearch, J as useOnChange, K as SearchDialog, M as SearchDialogOverlay, N as SearchDialogContent, O as SearchDialogHeader, P as SearchDialogIcon, Q as SearchDialogInput, U as SearchDialogClose, V as SearchDialogList, W as SearchDialogFooter, X as TagsList, Y as TagsListItem } from "./router-CouKPl1w.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_chunks/_libs/react.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "node:stream/web";
import "node:stream";
import "../_chunks/_libs/@tanstack/react-router.mjs";
import "../_libs/tiny-warning.mjs";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./staticFunctionMiddleware-BBhhYtCu.mjs";
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
import "../_chunks/_libs/@orama/orama.mjs";
function DefaultSearchDialog({ defaultTag, tags = [], api, delayMs, type = "fetch", allowClear = false, links = [], footer, ...props }) {
  const { locale } = useI18n();
  const [tag, setTag] = reactExports.useState(defaultTag);
  const { search, setSearch, query } = useDocsSearch(type === "fetch" ? {
    type: "fetch",
    api,
    locale,
    tag,
    delayMs
  } : {
    type: "static",
    from: api,
    locale,
    tag,
    delayMs
  });
  const defaultItems = reactExports.useMemo(() => {
    if (links.length === 0) return null;
    return links.map(([name, link]) => ({
      type: "page",
      id: name,
      content: name,
      url: link
    }));
  }, [links]);
  useOnChange(defaultTag, (v) => {
    setTag(v);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SearchDialog, {
    search,
    onSearchChange: setSearch,
    isLoading: query.isLoading,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SearchDialogOverlay, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SearchDialogContent, { children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(SearchDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SearchDialogIcon, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SearchDialogInput, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SearchDialogClose, {})
      ] }), /* @__PURE__ */ jsxRuntimeExports.jsx(SearchDialogList, { items: query.data !== "empty" ? query.data : defaultItems })] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SearchDialogFooter, { children: [tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TagsList, {
        tag,
        onTagChange: setTag,
        allowClear,
        children: tags.map((tag2) => /* @__PURE__ */ jsxRuntimeExports.jsx(TagsListItem, {
          value: tag2.value,
          children: tag2.name
        }, tag2.value))
      }), footer] })
    ]
  });
}
export {
  DefaultSearchDialog as default
};
