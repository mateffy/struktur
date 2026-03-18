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
    "mtime": "2026-03-18T11:19:33.987Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-03-18T11:19:33.989Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-18T11:19:33.989Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-03-18T11:19:33.990Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-03-18T11:19:33.990Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/assets/chunking-B9SBpuQY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-hP/+orNGR5EUQbuyQeiWt4ACIwI"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 15938,
    "path": "../public/assets/chunking-B9SBpuQY.js"
  },
  "/assets/config-CAm-Pb5Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f5ee-J3o3ZRICJqPQZ9dCYYW7Udp+M7U"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 62958,
    "path": "../public/assets/config-CAm-Pb5Y.js"
  },
  "/assets/artifact-format-D6eVgsiM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-s/AEOnF1nJYzMh/Z0FCH6IG2wts"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-D6eVgsiM.js"
  },
  "/assets/_-djF7ORvr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a10-4//gMs8hCXWB189I6igUPy8rUIo"',
    "mtime": "2026-03-18T11:19:34.411Z",
    "size": 10768,
    "path": "../public/assets/_-djF7ORvr.js"
  },
  "/assets/algolia-CfKKhsrI-Br2akIVy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-eub/fAXHRyJi58WsTTBK50DK7EM"',
    "mtime": "2026-03-18T11:19:34.411Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-Br2akIVy.js"
  },
  "/assets/document-parsing-c89lFgWV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-aVanhE53lxN9UiKnMDLb7w52GSU"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-c89lFgWV.js"
  },
  "/assets/events-B39hDegK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"459b-V/+KfGCF/4UjvPJd7/46aaaOfwA"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 17819,
    "path": "../public/assets/events-B39hDegK.js"
  },
  "/assets/enrich-records--mHjCxwW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-hnvXfgTF3yWMOUXxZfQZZjYv9ow"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 40264,
    "path": "../public/assets/enrich-records--mHjCxwW.js"
  },
  "/assets/extract-invoice-B1I2Pnqi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-8sPHNtEXo6J9tW/HK6Ak2QdV0yI"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-B1I2Pnqi.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/extract-realestate-DhXM4dr1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-88NwB8cUms0IEcG7wMKIUC7Byjg"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-DhXM4dr1.js"
  },
  "/assets/index-B4Ncvuvx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-IQCPn7HNFs9CVGZEkOSyQ3xRCEc"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 2075,
    "path": "../public/assets/index-B4Ncvuvx.js"
  },
  "/assets/extract-B7VVsICJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"adf8-ybD0heJkbQ5JHbEstZTwfyhfdAM"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 44536,
    "path": "../public/assets/extract-B7VVsICJ.js"
  },
  "/assets/index-BgXHLFBi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-302zn0wHI3GvNQpLWiBsVlRDsAY"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 3329,
    "path": "../public/assets/index-BgXHLFBi.js"
  },
  "/assets/extract-CF6NY_S8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-7WSqZzb92SvwRfqyMTsIol6zHH4"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 16745,
    "path": "../public/assets/extract-CF6NY_S8.js"
  },
  "/assets/fields-RJ47AmTf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-8oHAJb98suxCKBpmbqDTjWmn9xk"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 74441,
    "path": "../public/assets/fields-RJ47AmTf.js"
  },
  "/assets/index-C2JSjYlh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-Sar6aouy2F2V5NmBuwzVcjl4Cfs"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 13717,
    "path": "../public/assets/index-C2JSjYlh.js"
  },
  "/assets/index-C5r-yutK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-ea/2Cly0JiUnZeidjm1UhhEM2BA"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 1055,
    "path": "../public/assets/index-C5r-yutK.js"
  },
  "/assets/index-DJ-EnoHu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-VmQiVwpaehDsm6mvHURAqtaATt4"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 37570,
    "path": "../public/assets/index-DJ-EnoHu.js"
  },
  "/assets/index-DtYWBtiw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-dVKcAJhLhMNktrqAasmrpSWQ02U"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 3736,
    "path": "../public/assets/index-DtYWBtiw.js"
  },
  "/assets/index-DveyCxrK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"679c-uXgMJolWSy9HERbcOisiryA9Hfw"',
    "mtime": "2026-03-18T11:19:34.411Z",
    "size": 26524,
    "path": "../public/assets/index-DveyCxrK.js"
  },
  "/assets/index-nyKfl-CL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-hpqHHIth8QbNE/MH4MmPi3+qbXE"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 3192,
    "path": "../public/assets/index-nyKfl-CL.js"
  },
  "/assets/installation-CWry5WS2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"526b-mbUevWOFa10yAhjjuf5KmAwXvdQ"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 21099,
    "path": "../public/assets/installation-CWry5WS2.js"
  },
  "/assets/installation-BuVax2SI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-uGBx01hn77IurVCbQH3ZUfTaE4Y"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 9453,
    "path": "../public/assets/installation-BuVax2SI.js"
  },
  "/assets/installation-DMux7ANM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-/0Z0W+zDUoDvLAKlzuk7DWtrrOI"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 38319,
    "path": "../public/assets/installation-DMux7ANM.js"
  },
  "/assets/main-D8eF2mp1.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13d4b-LNnsaUO+YtbsQwGou4AesQEXx7c"',
    "mtime": "2026-03-18T11:19:34.411Z",
    "size": 81227,
    "path": "../public/assets/main-D8eF2mp1.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-BrvOGLhs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-2y+KYgL8zH5faUmrP1/qIwlrDRY"',
    "mtime": "2026-03-18T11:19:34.411Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-BrvOGLhs.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-yHf887hr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-Yf3yJZG5gKOuBZpwZRG8dUloV4I"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-yHf887hr.js"
  },
  "/assets/parse-Dgw24AhB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6097-xAAb02+1XX6Bsw6ZklATjS1vVDE"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 24727,
    "path": "../public/assets/parse-Dgw24AhB.js"
  },
  "/assets/pipeline-WRr-aqb0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-1poh00xQyron8EBjl62Uq3MN3TU"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 14066,
    "path": "../public/assets/pipeline-WRr-aqb0.js"
  },
  "/assets/models-and-providers-7Plr5E8e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bb4b-K73sWc9P+CrY8GU6Gj9zCV9tdY4"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 47947,
    "path": "../public/assets/models-and-providers-7Plr5E8e.js"
  },
  "/assets/pipelines-CjrGAzGc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-NnksxA6EjqUZaftpx4XxlL+K92c"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 37283,
    "path": "../public/assets/pipelines-CjrGAzGc.js"
  },
  "/assets/process-directory-DDhTzwTK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-X8Tob86XmxeV+uQ7TATzRlVTJhQ"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 50658,
    "path": "../public/assets/process-directory-DDhTzwTK.js"
  },
  "/assets/parse-pLKiDEdH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-gOchOydSlue4jhbjXRh5LT2Ekxg"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 55169,
    "path": "../public/assets/parse-pLKiDEdH.js"
  },
  "/assets/quickstart-oLDwnkX4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-AU5ConR8MG97liAzenRdJ62xqN8"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 25396,
    "path": "../public/assets/quickstart-oLDwnkX4.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-D_3Hv_Rn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ae-3ygW1PWUvO6ita27ot9DNSOxTx4"',
    "mtime": "2026-03-18T11:19:34.411Z",
    "size": 942,
    "path": "../public/assets/search-default-D_3Hv_Rn.js"
  },
  "/assets/static-BUXJwBmr-C0CiY4ax.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-QB5u2FD9+boWlkllcnE1Jj8jokY"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-C0CiY4ax.js"
  },
  "/assets/strategies-Bk_cKpwJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14ed8-U28gLDZKb4lq1Ec3qYKDf2VE6mo"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 85720,
    "path": "../public/assets/strategies-Bk_cKpwJ.js"
  },
  "/assets/usage-4IOOzi8y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-lmIprGQeVTYDSCmLCugNGDzqVHA"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 36829,
    "path": "../public/assets/usage-4IOOzi8y.js"
  },
  "/assets/utils-sMG2Q0UX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-IANtvD8ssdfrCy8a4ULTY1ih+UE"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 16903,
    "path": "../public/assets/utils-sMG2Q0UX.js"
  },
  "/assets/main-Ca2d6S-S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f2799-jX3ixyo3Ywj/kdgmKWeWFlnpej4"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 993177,
    "path": "../public/assets/main-Ca2d6S-S.js"
  },
  "/assets/validation-BOyrw8wb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-PmOmBW1xa1wPPpXSuf7uff3toMA"',
    "mtime": "2026-03-18T11:19:34.413Z",
    "size": 21573,
    "path": "../public/assets/validation-BOyrw8wb.js"
  },
  "/assets/verify-IrdAFEST.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-maCaTz58T/NoD78QcSw2hTuKRC0"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 10017,
    "path": "../public/assets/verify-IrdAFEST.js"
  },
  "/assets/watch-folder-CwBkaHXe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-mbK9DeNwDh/S6u5oSy66lGj7OfE"',
    "mtime": "2026-03-18T11:19:34.412Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-CwBkaHXe.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-18T11:19:34.019Z",
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
