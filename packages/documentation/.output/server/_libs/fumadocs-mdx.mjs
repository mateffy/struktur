import * as minpath from "node:path";
import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
function server(options = {}) {
  const { doc: { passthroughs: docPassthroughs = [] } = {} } = options;
  function fileInfo(file, base) {
    if (file.startsWith("./")) file = file.slice(2);
    return {
      path: file,
      fullPath: minpath.join(base, file)
    };
  }
  function mapDocData(entry) {
    const data = {
      body: entry.default,
      toc: entry.toc,
      structuredData: entry.structuredData,
      _exports: entry
    };
    for (const key of docPassthroughs) data[key] = entry[key];
    return data;
  }
  return {
    async doc(_name, base, glob) {
      return await Promise.all(Object.entries(glob).map(async ([k, v]) => {
        const data = typeof v === "function" ? await v() : v;
        return {
          ...mapDocData(data),
          ...data.frontmatter,
          ...createDocMethods(fileInfo(k, base), () => data)
        };
      }));
    },
    async docLazy(_name, base, head, body) {
      return await Promise.all(Object.entries(head).map(async ([k, v]) => {
        const data = typeof v === "function" ? await v() : v;
        const content = body[k];
        return {
          ...data,
          ...createDocMethods(fileInfo(k, base), content),
          async load() {
            return mapDocData(await content());
          }
        };
      }));
    },
    async meta(_name, base, glob) {
      return await Promise.all(Object.entries(glob).map(async ([k, v]) => {
        const data = typeof v === "function" ? await v() : v;
        return {
          info: fileInfo(k, base),
          ...data
        };
      }));
    },
    async docs(name, base, metaGlob, docGlob) {
      return {
        docs: await this.doc(name, base, docGlob),
        meta: await this.meta(name, base, metaGlob),
        toFumadocsSource() {
          return toFumadocsSource(this.docs, this.meta);
        }
      };
    },
    async docsLazy(name, base, metaGlob, docHeadGlob, docBodyGlob) {
      return {
        docs: await this.docLazy(name, base, docHeadGlob, docBodyGlob),
        meta: await this.meta(name, base, metaGlob),
        toFumadocsSource() {
          return toFumadocsSource(this.docs, this.meta);
        }
      };
    }
  };
}
function toFumadocsSource(pages, metas) {
  const files = [];
  for (const entry of pages) files.push({
    type: "page",
    path: entry.info.path,
    absolutePath: entry.info.fullPath,
    data: entry
  });
  for (const entry of metas) files.push({
    type: "meta",
    path: entry.info.path,
    absolutePath: entry.info.fullPath,
    data: entry
  });
  return { files };
}
function createDocMethods(info, load) {
  return {
    info,
    async getText(type) {
      if (type === "raw") return (await (await import("node:fs/promises")).readFile(info.fullPath)).toString();
      const data = await load();
      if (typeof data._markdown !== "string") throw new Error("getText('processed') requires `includeProcessedMarkdown` to be enabled in your collection config.");
      return data._markdown;
    },
    async getMDAST() {
      const data = await load();
      if (!data._mdast) throw new Error("getMDAST() requires `includeMDAST` to be enabled in your collection config.");
      return JSON.parse(data._mdast);
    }
  };
}
function browser() {
  return { doc(_name, glob) {
    return {
      raw: glob,
      createClientLoader({ id = _name, ...options }) {
        return createClientLoader(this.raw, {
          id,
          ...options
        });
      }
    };
  } };
}
const loaderStore = /* @__PURE__ */ new Map();
function createClientLoader(globEntries, options) {
  const { id = "", component: useRenderer } = options;
  const renderers = {};
  const loaders = /* @__PURE__ */ new Map();
  const store = loaderStore.get(id) ?? { preloaded: /* @__PURE__ */ new Map() };
  loaderStore.set(id, store);
  for (const k in globEntries) loaders.set(k.startsWith("./") ? k.slice(2) : k, globEntries[k]);
  function getLoader(path) {
    const loader = loaders.get(path);
    if (!loader) throw new Error(`[createClientLoader] ${path} does not exist in available entries`);
    return loader;
  }
  function getRenderer(path) {
    if (path in renderers) return renderers[path];
    let promise;
    function Renderer(props) {
      let doc = store.preloaded.get(path);
      doc ??= reactExports.use(promise ??= getLoader(path)());
      return useRenderer(doc, props);
    }
    return renderers[path] = Renderer;
  }
  return {
    async preload(path) {
      const loaded = await getLoader(path)();
      store.preloaded.set(path, loaded);
      return loaded;
    },
    getComponent(path) {
      return getRenderer(path);
    },
    useContent(path, props) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(getRenderer(path), { ...props });
    }
  };
}
export {
  browser as b,
  server as s
};
