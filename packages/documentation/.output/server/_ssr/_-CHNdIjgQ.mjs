import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { R as Route$2, F as clientLoader, G as baseOptions, p as useLinkItems, T as TreeContextProvider, q as LayoutContextProvider, r as SidebarProvider, s as LayoutBody, t as LayoutHeader, v as renderTitleNav, d as SearchToggle, w as SidebarTrigger, x as LayoutTabs, y as SidebarViewport, c as SidebarCollapseTrigger, z as LargeSearchToggle, A as SidebarTabsDropdown, B as LanguageToggle, C as LinkItem, D as ThemeToggle, E as LanguageToggleText, S as SidebarContent$1, e as SidebarDrawerOverlay, f as SidebarDrawerContent, u as useLinkItemActive, a as useTreeContext, b as useTreePath, i as isActive, g as SidebarFolder, h as useFolderDepth, j as SidebarFolderContent$1, k as SidebarFolderLink$1, l as useFolder, m as SidebarFolderTrigger$1, n as SidebarSeparator$1, o as SidebarItem$1 } from "./router-SyzhlHmE.mjs";
import { L as Link } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { m as buttonVariants, Z as visit, p as mergeRefs, a as usePathname, n as cva } from "./staticFunctionMiddleware-BBhhYtCu.mjs";
import { J as PanelLeft, n as Languages } from "../_libs/lucide-react.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "node:stream/web";
import "node:stream";
import "node:process";
import "node:path";
import "node:url";
import "../_libs/fumadocs-mdx.mjs";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./index.mjs";
import "node:async_hooks";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
import "../_libs/tiny-warning.mjs";
import "../_libs/isbot.mjs";
import "../_chunks/_libs/@orama/orama.mjs";
import "node:fs/promises";
function createLinkItemRenderer({ SidebarFolder: SidebarFolder2, SidebarFolderContent: SidebarFolderContent2, SidebarFolderLink: SidebarFolderLink2, SidebarFolderTrigger: SidebarFolderTrigger2, SidebarItem: SidebarItem2 }) {
  return function SidebarLinkItem2({ item, ...props }) {
    const active = useLinkItemActive(item);
    if (item.type === "custom") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      ...props,
      children: item.children
    });
    if (item.type === "menu") return /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolder2, {
      ...props,
      children: [item.url ? /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolderLink2, {
        href: item.url,
        active,
        external: item.external,
        children: [item.icon, item.text]
      }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolderTrigger2, { children: [item.icon, item.text] }), /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderContent2, { children: item.items.map((child, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLinkItem2, { item: child }, i)) })]
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarItem2, {
      href: item.url,
      icon: item.icon,
      external: item.external,
      active,
      ...props,
      children: item.text
    });
  };
}
const RendererContext = reactExports.createContext(null);
function createPageTreeRenderer({ SidebarFolder: SidebarFolder2, SidebarFolderContent: SidebarFolderContent2, SidebarFolderLink: SidebarFolderLink2, SidebarFolderTrigger: SidebarFolderTrigger2, SidebarSeparator: SidebarSeparator2, SidebarItem: SidebarItem2 }) {
  function renderList(nodes) {
    return nodes.map((node, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(PageTreeNode, { node }, i));
  }
  function PageTreeNode({ node }) {
    const { Separator, Item, Folder, pathname } = reactExports.use(RendererContext);
    if (node.type === "separator") {
      if (Separator) return /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { item: node });
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarSeparator2, { children: [node.icon, node.name] });
    }
    if (node.type === "folder") {
      const path = useTreePath();
      if (Folder) return /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, {
        item: node,
        children: renderList(node.children)
      });
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolder2, {
        collapsible: node.collapsible,
        active: path.includes(node),
        defaultOpen: node.defaultOpen,
        children: [node.index ? /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolderLink2, {
          href: node.index.url,
          active: isActive(node.index.url, pathname),
          external: node.index.external,
          children: [node.icon, node.name]
        }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolderTrigger2, { children: [node.icon, node.name] }), /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderContent2, { children: renderList(node.children) })]
      });
    }
    if (Item) return /* @__PURE__ */ jsxRuntimeExports.jsx(Item, { item: node });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarItem2, {
      href: node.url,
      external: node.external,
      active: isActive(node.url, pathname),
      icon: node.icon,
      children: node.name
    });
  }
  return function SidebarPageTree2(components) {
    const { Folder, Item, Separator } = components;
    const { root } = useTreeContext();
    const pathname = usePathname();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RendererContext, {
      value: reactExports.useMemo(() => ({
        Folder,
        Item,
        Separator,
        pathname
      }), [
        Folder,
        Item,
        Separator,
        pathname
      ]),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: renderList(root.children) }, root.$id)
    });
  };
}
const itemVariants = cva("relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0", { variants: {
  variant: {
    link: "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors",
    button: "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none"
  },
  highlight: { true: "data-[active=true]:before:content-[''] data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:w-px data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5" }
} });
function getItemOffset(depth) {
  return `calc(${2 + 3 * depth} * var(--spacing))`;
}
function SidebarContent({ ref: refProp, className, children, ...props }) {
  const ref = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContent$1, { children: ({ collapsed, hovered, ref: asideRef, ...rest }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    "data-sidebar-placeholder": "",
    className: "sticky top-(--fd-docs-row-1) z-20 [grid-area:sidebar] pointer-events-none *:pointer-events-auto h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] md:layout:[--fd-sidebar-width:268px] max-md:hidden",
    children: [collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "absolute start-0 inset-y-0 w-4",
      ...rest
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("aside", {
      id: "nd-sidebar",
      ref: mergeRefs(ref, refProp, asideRef),
      "data-collapsed": collapsed,
      "data-hovered": collapsed && hovered,
      className: twMerge("absolute flex flex-col w-full start-0 inset-y-0 items-end bg-fd-card text-sm border-e duration-250 *:w-(--fd-sidebar-width)", collapsed && ["inset-y-2 rounded-xl transition-transform border w-(--fd-sidebar-width)", hovered ? "shadow-lg translate-x-2 rtl:-translate-x-2" : "-translate-x-(--fd-sidebar-width) rtl:translate-x-full"], ref.current && ref.current.getAttribute("data-collapsed") === "true" !== collapsed && "transition-[width,inset-block,translate,background-color]", className),
      ...props,
      ...rest,
      children
    })]
  }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    "data-sidebar-panel": "",
    className: twMerge("fixed flex top-[calc(--spacing(4)+var(--fd-docs-row-3))] start-4 shadow-lg transition-opacity rounded-xl p-0.5 border bg-fd-muted text-fd-muted-foreground z-10", (!collapsed || hovered) && "pointer-events-none opacity-0"),
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(SidebarCollapseTrigger, {
      className: twMerge(buttonVariants({
        color: "ghost",
        size: "icon-sm",
        className: "rounded-lg"
      })),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeft, {})
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(SearchToggle, {
      className: "rounded-lg",
      hideIfDisabled: true
    })]
  })] }) });
}
function SidebarDrawer({ children, className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(SidebarDrawerOverlay, { className: "fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out" }), /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarDrawerContent, {
    className: twMerge("fixed text-[0.9375rem] flex flex-col shadow-lg border-s end-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out", className),
    ...props,
    children
  })] });
}
function SidebarSeparator({ className, style, children, ...props }) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarSeparator$1, {
    className: twMerge("[&_svg]:size-4 [&_svg]:shrink-0", className),
    style: {
      paddingInlineStart: getItemOffset(depth),
      ...style
    },
    ...props,
    children
  });
}
function SidebarItem({ className, style, children, ...props }) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarItem$1, {
    className: twMerge(itemVariants({
      variant: "link",
      highlight: depth >= 1
    }), className),
    style: {
      paddingInlineStart: getItemOffset(depth),
      ...style
    },
    ...props,
    children
  });
}
function SidebarFolderTrigger({ className, style, ...props }) {
  const { depth, collapsible } = useFolder();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderTrigger$1, {
    className: twMerge(itemVariants({ variant: collapsible ? "button" : null }), "w-full", className),
    style: {
      paddingInlineStart: getItemOffset(depth - 1),
      ...style
    },
    ...props,
    children: props.children
  });
}
function SidebarFolderLink({ className, style, ...props }) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderLink$1, {
    className: twMerge(itemVariants({
      variant: "link",
      highlight: depth > 1
    }), "w-full", className),
    style: {
      paddingInlineStart: getItemOffset(depth - 1),
      ...style
    },
    ...props,
    children: props.children
  });
}
function SidebarFolderContent({ className, children, ...props }) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderContent$1, {
    className: twMerge("relative", depth === 1 && "before:content-[''] before:absolute before:w-px before:inset-y-1 before:bg-fd-border before:start-2.5", className),
    ...props,
    children
  });
}
const SidebarPageTree = createPageTreeRenderer({
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarSeparator
});
const SidebarLinkItem = createLinkItemRenderer({
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem
});
const defaultTransform = (option, node) => {
  if (!node.icon) return option;
  return {
    ...option,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "size-full [&_svg]:size-full max-md:p-1.5 max-md:rounded-md max-md:border max-md:bg-fd-secondary",
      children: node.icon
    })
  };
};
function getSidebarTabs(tree, { transform = defaultTransform } = {}) {
  const results = [];
  function scanOptions(node, unlisted) {
    if ("root" in node && node.root) {
      const urls = getFolderUrls(node);
      if (urls.size > 0) {
        const option = {
          url: urls.values().next().value ?? "",
          title: node.name,
          icon: node.icon,
          unlisted,
          description: node.description,
          urls
        };
        const mapped = transform ? transform(option, node) : option;
        if (mapped) results.push(mapped);
      }
    }
    for (const child of node.children) if (child.type === "folder") scanOptions(child, unlisted);
  }
  scanOptions(tree);
  if (tree.fallback) scanOptions(tree.fallback, true);
  return results;
}
function getFolderUrls(folder, output = /* @__PURE__ */ new Set()) {
  if (folder.index) output.add(folder.index.url);
  for (const child of folder.children) {
    if (child.type === "page" && !child.external) output.add(child.url);
    if (child.type === "folder") getFolderUrls(child, output);
  }
  return output;
}
function DocsLayout({ nav: { transparentMode, ...nav } = {}, sidebar: { tabs: sidebarTabs, enabled: sidebarEnabled = true, defaultOpenLevel, prefetch, ...sidebarProps } = {}, searchToggle = {}, themeSwitch = {}, tabMode = "auto", i18n = false, children, tree, ...props }) {
  const tabs = reactExports.useMemo(() => {
    if (Array.isArray(sidebarTabs)) return sidebarTabs;
    if (typeof sidebarTabs === "object") return getSidebarTabs(tree, sidebarTabs);
    if (sidebarTabs !== false) return getSidebarTabs(tree);
    return [];
  }, [tree, sidebarTabs]);
  const { menuItems } = useLinkItems(props);
  function sidebar() {
    const { footer, banner, collapsible = true, component, components, ...rest } = sidebarProps;
    if (component) return component;
    const iconLinks = menuItems.filter((item) => item.type === "icon");
    const viewport = /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarViewport, { children: [menuItems.filter((v) => v.type !== "icon").map((item, i, list) => /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLinkItem, {
      item,
      className: twMerge(i === list.length - 1 && "mb-4")
    }, i)), /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarPageTree, { ...components })] });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarContent, {
      ...rest,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex flex-col gap-3 p-4 pb-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "flex",
              children: [
                renderTitleNav(nav, { className: "inline-flex text-[0.9375rem] items-center gap-2.5 font-medium me-auto" }),
                nav.children,
                collapsible && /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarCollapseTrigger, {
                  className: twMerge(buttonVariants({
                    color: "ghost",
                    size: "icon-sm",
                    className: "mb-auto text-fd-muted-foreground"
                  })),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeft, {})
                })
              ]
            }),
            searchToggle.enabled !== false && (searchToggle.components?.lg ?? /* @__PURE__ */ jsxRuntimeExports.jsx(LargeSearchToggle, { hideIfDisabled: true })),
            tabs.length > 0 && tabMode === "auto" && /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTabsDropdown, { options: tabs }),
            banner
          ]
        }),
        viewport,
        (i18n || iconLinks.length > 0 || themeSwitch?.enabled !== false || footer) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex flex-col border-t p-4 pt-2 empty:hidden",
          children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "flex text-fd-muted-foreground items-center empty:hidden",
            children: [
              i18n && /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageToggle, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "size-4.5" }) }),
              iconLinks.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(LinkItem, {
                item,
                className: twMerge(buttonVariants({
                  size: "icon-sm",
                  color: "ghost"
                })),
                "aria-label": item.label,
                children: item.icon
              }, i)),
              themeSwitch.enabled !== false && (themeSwitch.component ?? /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {
                className: "ms-auto p-0",
                mode: themeSwitch.mode
              }))
            ]
          }), footer]
        })
      ]
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarDrawer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex flex-col gap-3 p-4 pb-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "flex text-fd-muted-foreground items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className: "flex flex-1",
                children: iconLinks.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(LinkItem, {
                  item,
                  className: twMerge(buttonVariants({
                    size: "icon-sm",
                    color: "ghost",
                    className: "p-2"
                  })),
                  "aria-label": item.label,
                  children: item.icon
                }, i))
              }),
              i18n && /* @__PURE__ */ jsxRuntimeExports.jsxs(LanguageToggle, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "size-4.5" }), /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageToggleText, {})] }),
              themeSwitch.enabled !== false && (themeSwitch.component ?? /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {
                className: "p-0",
                mode: themeSwitch.mode
              })),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTrigger, {
                className: twMerge(buttonVariants({
                  color: "ghost",
                  size: "icon-sm",
                  className: "p-2"
                })),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeft, {})
              })
            ]
          }),
          tabs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTabsDropdown, { options: tabs }),
          banner
        ]
      }),
      viewport,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "flex flex-col border-t p-4 pt-2 empty:hidden",
        children: footer
      })
    ] })] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TreeContextProvider, {
    tree,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutContextProvider, {
      navTransparentMode: transparentMode,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarProvider, {
        defaultOpenLevel,
        prefetch,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LayoutBody, {
          ...props.containerProps,
          children: [
            nav.enabled !== false && (nav.component ?? /* @__PURE__ */ jsxRuntimeExports.jsxs(LayoutHeader, {
              id: "nd-subnav",
              className: "[grid-area:header] sticky top-(--fd-docs-row-1) z-30 flex items-center ps-4 pe-2.5 border-b transition-colors backdrop-blur-sm h-(--fd-header-height) md:hidden max-md:layout:[--fd-header-height:--spacing(14)] data-[transparent=false]:bg-fd-background/80",
              children: [
                renderTitleNav(nav, { className: "inline-flex items-center gap-2.5 font-semibold" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "flex-1",
                  children: nav.children
                }),
                searchToggle.enabled !== false && (searchToggle.components?.sm ?? /* @__PURE__ */ jsxRuntimeExports.jsx(SearchToggle, {
                  className: "p-2",
                  hideIfDisabled: true
                })),
                sidebarEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTrigger, {
                  className: twMerge(buttonVariants({
                    color: "ghost",
                    size: "icon-sm",
                    className: "p-2"
                  })),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeft, {})
                })
              ]
            })),
            sidebarEnabled && sidebar(),
            tabMode === "top" && tabs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutTabs, {
              options: tabs,
              className: "z-10 bg-fd-background border-b px-6 pt-3 xl:px-8 max-md:hidden"
            }),
            children
          ]
        })
      })
    })
  });
}
function deserializeHTML(html) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dangerouslySetInnerHTML: { __html: html } });
}
function deserializePageTree(serialized) {
  const root = serialized.data;
  visit(root, (item) => {
    if ("icon" in item && typeof item.icon === "string") item.icon = deserializeHTML(item.icon);
    if (typeof item.name === "string") item.name = deserializeHTML(item.name);
  });
  return root;
}
function useFumadocsLoader(serialized) {
  return reactExports.useMemo(() => {
    const out = {};
    for (const k in serialized) {
      const v = serialized[k];
      if (isSerializedPageTree(v)) out[k] = deserializePageTree(v);
      else out[k] = v;
    }
    return out;
  }, [serialized]);
}
function isSerializedPageTree(v) {
  return typeof v === "object" && v !== null && "$fumadocs_loader" in v && v.$fumadocs_loader === "page-tree";
}
function Page() {
  const {
    pageTree,
    slugs,
    path
  } = useFumadocsLoader(Route$2.useLoaderData());
  const markdownUrl = `/llms/docs/${slugs.length > 0 ? `${slugs.join("/")}.md` : "index.md"}`;
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
