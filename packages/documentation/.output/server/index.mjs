globalThis.__nitro_main__ = import.meta.url;
import { a as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { d as defineHandler, H as HTTPError, t as toEventHandler, a as defineLazyEventHandler, b as H3Core, c as toRequest } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled;
  const status = error.status || 500;
  const url = event.url || new URL(event.req.url);
  if (status === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.req.method}] ${url}
`, error);
  }
  const headers2 = {
    "content-type": "application/json",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  if (status === 404 || !event.res.headers.has("cache-control")) {
    headers2["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    status,
    statusText: error.statusText,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status,
    statusText: error.statusText,
    headers: headers2,
    body
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const assets = {
  "/CNAME": {
    "type": "text/plain; charset=utf-8",
    "etag": '"b-vMwX+cTl5yDqPfvnjJ2Kk+BC1jQ"',
    "mtime": "2026-03-18T11:27:07.384Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-03-18T11:27:07.386Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-18T11:27:07.386Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-03-18T11:27:07.386Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/assets/_-C6sgtD2g.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a10-koBon3rBbermKzzjIlK2NdywLfE"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 10768,
    "path": "../public/assets/_-C6sgtD2g.js"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-03-18T11:27:07.387Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/assets/algolia-CfKKhsrI-D9kZ0LDc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-4L0Wj4UZhViM0dXefiaYh6QLvz4"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-D9kZ0LDc.js"
  },
  "/assets/chunking-kBXj9ayn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-xX6RZA4ImsFvZ91gOM0yroxOYmU"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 15938,
    "path": "../public/assets/chunking-kBXj9ayn.js"
  },
  "/assets/artifact-format-Bt41C1wl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-Yb8p2nftfLUPARiXS7Z9/xWHCUA"',
    "mtime": "2026-03-18T11:27:07.785Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-Bt41C1wl.js"
  },
  "/assets/config-DKmJR3Nv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f5ee-5Voo+t5yTXeAEe/JcKTgmbO/boA"',
    "mtime": "2026-03-18T11:27:07.776Z",
    "size": 62958,
    "path": "../public/assets/config-DKmJR3Nv.js"
  },
  "/assets/enrich-records-L2FBSO9X.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-Y3nXqfwTPQVY+jcfFyMFyXF8Lkc"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-L2FBSO9X.js"
  },
  "/assets/document-parsing-D9dCeRBY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-5u9zNaOpe3MTvZpGCbaLomn7a8I"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-D9dCeRBY.js"
  },
  "/assets/events-C0OmdwQI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"459b-3C4ojfh2z5clF278yiieIyV20CQ"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 17819,
    "path": "../public/assets/events-C0OmdwQI.js"
  },
  "/assets/extract-BD8EOO6E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-++8JmVLry46fYzhd5+x7CGnhtwI"',
    "mtime": "2026-03-18T11:27:07.785Z",
    "size": 16745,
    "path": "../public/assets/extract-BD8EOO6E.js"
  },
  "/assets/extract-realestate-D2KVRo1F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-klV/t/DqmGR6hQzm6SMHYXcRN34"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-D2KVRo1F.js"
  },
  "/assets/extract-invoice-DQ_hGBei.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-miuiHL2BEbz8yGf/H4qto1FA67A"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-DQ_hGBei.js"
  },
  "/assets/extract-vDRsIb6H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"adf8-bv1pUrxw9e+ud8+NFmqcxpML4Rk"',
    "mtime": "2026-03-18T11:27:07.776Z",
    "size": 44536,
    "path": "../public/assets/extract-vDRsIb6H.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-D4JEsAU4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-kMvcHUOUbiRC1CpfijG156za/iQ"',
    "mtime": "2026-03-18T11:27:07.776Z",
    "size": 74441,
    "path": "../public/assets/fields-D4JEsAU4.js"
  },
  "/assets/index-CDbwl_2z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"678d-sVzV1Uio3+mFcn+dQ8cAMte7CXI"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 26509,
    "path": "../public/assets/index-CDbwl_2z.js"
  },
  "/assets/index-CK3lBFt_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-yYLqZS0OXlqwHKrXtMwYsECsvjU"',
    "mtime": "2026-03-18T11:27:07.776Z",
    "size": 3192,
    "path": "../public/assets/index-CK3lBFt_.js"
  },
  "/assets/index-CPy4QL61.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-IdA6AuQRmnWPkW16lW1KsJ6msZ0"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 3329,
    "path": "../public/assets/index-CPy4QL61.js"
  },
  "/assets/index-CaAM92hI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-rMMtONq+f2JWMU/p0fe4VAnK1Z8"',
    "mtime": "2026-03-18T11:27:07.785Z",
    "size": 13717,
    "path": "../public/assets/index-CaAM92hI.js"
  },
  "/assets/index-CkKKVVIy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-084mED5VJncN+KPSF9dOSqEO8Wg"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 2075,
    "path": "../public/assets/index-CkKKVVIy.js"
  },
  "/assets/index-D4pJuJU8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-EEZwO+WS5MtcqTgXy88/NbzhULA"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 37570,
    "path": "../public/assets/index-D4pJuJU8.js"
  },
  "/assets/index-DuvZ7ijH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-1vb0DsQNiBUlflVzwoeLs4aQT/Y"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 3736,
    "path": "../public/assets/index-DuvZ7ijH.js"
  },
  "/assets/index-Jgdk7sRB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-0yFpXzoHMBwN6p6UpovLQy0d3jM"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 1055,
    "path": "../public/assets/index-Jgdk7sRB.js"
  },
  "/assets/installation-DnXqojpC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-lCWmZKTVrqCmP0XStRYsu9XrYL8"',
    "mtime": "2026-03-18T11:27:07.785Z",
    "size": 38319,
    "path": "../public/assets/installation-DnXqojpC.js"
  },
  "/assets/installation-mUK65e_N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"526b-bUCuNRJk928M9ta5vluAE8yObKQ"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 21099,
    "path": "../public/assets/installation-mUK65e_N.js"
  },
  "/assets/installation-tVv9dduu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-J6bz+KjtMLbDgrTOFZlOdFmt5Ds"',
    "mtime": "2026-03-18T11:27:07.785Z",
    "size": 9453,
    "path": "../public/assets/installation-tVv9dduu.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/main-D8eF2mp1.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13d4b-LNnsaUO+YtbsQwGou4AesQEXx7c"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 81227,
    "path": "../public/assets/main-D8eF2mp1.css"
  },
  "/assets/orama-cloud-cgTJNLo0-CwmlMhL3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-Fgc57TjoU/+WZtFBSh16tzyhMKg"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-CwmlMhL3.js"
  },
  "/assets/models-and-providers-Dgnq9wRJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bb4b-hfx/uI3KS48Yvi1NtPlCudhL0BQ"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 47947,
    "path": "../public/assets/models-and-providers-Dgnq9wRJ.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-6V8TEkY_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-Tso9NdKrlqVNb2I/mIZIHfwrmcw"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-6V8TEkY_.js"
  },
  "/assets/parse-DU9bv113.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6097-3d1SV8aQcWV8SdJVQ8hLIQv2IKM"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 24727,
    "path": "../public/assets/parse-DU9bv113.js"
  },
  "/assets/parse-CvC_pKS7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-G25FSpmYsadCg9njxHokSZqrMLY"',
    "mtime": "2026-03-18T11:27:07.785Z",
    "size": 55169,
    "path": "../public/assets/parse-CvC_pKS7.js"
  },
  "/assets/pipeline-f2a4pozB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-+XMuSdxz6Mqrz2WLgIBujESYKFk"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 14066,
    "path": "../public/assets/pipeline-f2a4pozB.js"
  },
  "/assets/pipelines-BtBy_Qi1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-k5TzhfhYhPZGJ403uDbcwIzxCYM"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 37283,
    "path": "../public/assets/pipelines-BtBy_Qi1.js"
  },
  "/assets/quickstart-ar8SViq9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-jNEGgMnwy4HIOsk3Xydr1eKalfI"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 25396,
    "path": "../public/assets/quickstart-ar8SViq9.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/process-directory-bJuob5MS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-IkpcMbft8Mebqsc9Kh85/E/gN+g"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 50658,
    "path": "../public/assets/process-directory-bJuob5MS.js"
  },
  "/assets/search-default-BZ8e6ho_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ae-iIiI9BaWyBnEfMM9E5ivvSpOjJ8"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 942,
    "path": "../public/assets/search-default-BZ8e6ho_.js"
  },
  "/assets/static-BUXJwBmr-CAHwkXYu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-AG+UqRzjx8zOoMfgd74CPiLppR4"',
    "mtime": "2026-03-18T11:27:07.775Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-CAHwkXYu.js"
  },
  "/assets/usage-Cw7B1Zhl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-xcwmo/JxvaonGToXhpe+4bdi3dk"',
    "mtime": "2026-03-18T11:27:07.785Z",
    "size": 36829,
    "path": "../public/assets/usage-Cw7B1Zhl.js"
  },
  "/assets/utils-DR1JCXpN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-3fpPjeom7yI+nLZ8WlUKEOPfsmo"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 16903,
    "path": "../public/assets/utils-DR1JCXpN.js"
  },
  "/assets/strategies-D0PmV-Tv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14ed8-ph55InntlnILCatccZ5kvWF4Srk"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 85720,
    "path": "../public/assets/strategies-D0PmV-Tv.js"
  },
  "/assets/main-Bec1B5yw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f2799-E8nP0+ZfFaKZf2ial2gpSiGTEQk"',
    "mtime": "2026-03-18T11:27:07.785Z",
    "size": 993177,
    "path": "../public/assets/main-Bec1B5yw.js"
  },
  "/assets/verify-Phzfg3ji.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-jdU2DSz5OfEgl+kSCNWoJrQJ+mc"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 10017,
    "path": "../public/assets/verify-Phzfg3ji.js"
  },
  "/assets/validation-CkbVfJqY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-U97aBdPjYE5K2xo58KDnYnfgvrs"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 21573,
    "path": "../public/assets/validation-CkbVfJqY.js"
  },
  "/assets/watch-folder-DRnC1JC0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-MB0BxUl0ycKhUDS6KQnUvt/kGtA"',
    "mtime": "2026-03-18T11:27:07.784Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-DRnC1JC0.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-18T11:27:07.405Z",
    "size": 5891373,
    "path": "../public/struktur-icon.png"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br"
};
const _3Wyrq0 = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/");
    s.length - 1;
    if (s[1] === "assets") {
      r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
    }
    return r;
  };
})();
const _lazy_Nid11Z = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return ssrRenderer$1;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_Nid11Z };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_3Wyrq0)
].filter(Boolean);
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function createNitroApp() {
  const hooks = void 0;
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({
          error,
          context: errorCtx
        });
      }
    }
  };
  const h3App = createH3App({ onError(error, event) {
    return errorHandler(error, event);
  } });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  const app = {
    fetch: appHandler,
    h3: h3App,
    hooks,
    captureError
  };
  return app;
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  {
    h3App["~getMiddleware"] = (event, route) => {
      const pathname = event.url.pathname;
      const method = event.req.method;
      const middleware = [];
      {
        const routeRules = getRouteRules(method, pathname);
        event.context.routeRules = routeRules?.routeRules;
        if (routeRules?.routeRuleMiddleware.length) {
          middleware.push(...routeRules.routeRuleMiddleware);
        }
      }
      middleware.push(...h3App["~middleware"]);
      if (route?.data?.middleware?.length) {
        middleware.push(...route.data.middleware);
      }
      return middleware;
    };
  }
  return h3App;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  for (const rule of Object.values(routeRules)) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const port = Number.parseInt(process.env.NITRO_PORT || process.env.PORT || "") || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch
});
trapUnhandledErrors();
const nodeServer = {};
function fetchViteEnv(viteEnvName, input, init) {
  const envs = globalThis.__nitro_vite_envs__ || {};
  const viteEnv = envs[viteEnvName];
  if (!viteEnv) {
    throw HTTPError.status(404);
  }
  return Promise.resolve(viteEnv.fetch(toRequest(input, init)));
}
function ssrRenderer({ req }) {
  return fetchViteEnv("ssr", req);
}
const ssrRenderer$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: ssrRenderer
});
export {
  nodeServer as default
};
