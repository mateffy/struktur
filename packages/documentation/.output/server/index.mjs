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
  "/assets/algolia-CfKKhsrI-CmUlog8u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-9fXzDWepBNX6bCCBgoF3aKjNvhc"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-CmUlog8u.js"
  },
  "/assets/artifact-format-CsLjcbxZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8d9f-jvlsJUx3LK6o3cRh1sgRDiuGCKs"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 36255,
    "path": "../public/assets/artifact-format-CsLjcbxZ.js"
  },
  "/CNAME": {
    "type": "text/plain; charset=utf-8",
    "etag": '"b-vMwX+cTl5yDqPfvnjJ2Kk+BC1jQ"',
    "mtime": "2026-03-06T04:12:15.143Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/chunking-CwV9Nt83.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-OM7dxmuBY00Vk+/XfXhYiGivz6Q"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 15938,
    "path": "../public/assets/chunking-CwV9Nt83.js"
  },
  "/assets/config-9f1GIxBK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-jOxHhiEzb91O+eEb35uBraowlCk"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 66830,
    "path": "../public/assets/config-9f1GIxBK.js"
  },
  "/assets/enrich-records-Bbjsejgp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-DCGKRbMd2y8/+54FLK0MMGhvZ2k"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-Bbjsejgp.js"
  },
  "/assets/events-Cwn6qLDy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-QxwTVfbP4AGz17fqJeT+h7N1lu0"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 17535,
    "path": "../public/assets/events-Cwn6qLDy.js"
  },
  "/assets/extract-Bg-bYVkz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-xRT4J7NoKj2WYr8mAX4m2sODbOQ"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 53321,
    "path": "../public/assets/extract-Bg-bYVkz.js"
  },
  "/assets/_-D0VZ8N0J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a06-ol/NEivNyWwfpJpfmvgeiCGf1nw"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 10758,
    "path": "../public/assets/_-D0VZ8N0J.js"
  },
  "/assets/document-parsing-BF77wL7x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-ejltM1CkLGch8q78ZiIEkvlHGq4"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-BF77wL7x.js"
  },
  "/assets/extract-invoice-BSwTK6Mt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-mAGlJPSqII6bWfYeP80WCapQgUQ"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-BSwTK6Mt.js"
  },
  "/assets/extract-realestate-tuV5mWiB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-Nc9AemoKYDZb37cCZ3Fa4CDkCkw"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-tuV5mWiB.js"
  },
  "/assets/index-1D1MXY2i.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-aT3qFbiLYLivqZ4Nhy/qmzmuzKA"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 2918,
    "path": "../public/assets/index-1D1MXY2i.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/index-DjjFwf3a.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-4Lxo3kh/06TcZlF7nDeHBqQ1ZLY"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 1055,
    "path": "../public/assets/index-DjjFwf3a.js"
  },
  "/assets/index-CM6iONyE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-BBGzndfaKOt+VeekPPyTQtMFDmI"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 3066,
    "path": "../public/assets/index-CM6iONyE.js"
  },
  "/assets/index-CmyuGXfq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"319d-0hMwNjz1c0ccrUfgAYaFnESmQvs"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 12701,
    "path": "../public/assets/index-CmyuGXfq.js"
  },
  "/assets/index-Wa0_dkEn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67bb-axRmRLQjX0VveYTdfocZWJ/ZXtI"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 26555,
    "path": "../public/assets/index-Wa0_dkEn.js"
  },
  "/assets/index-DYz5Wzrl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-nQI24i0UkbJ8mfVECPmYduqvj58"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 30163,
    "path": "../public/assets/index-DYz5Wzrl.js"
  },
  "/assets/index-5Jq7fF0r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-BOR2lHdE60Q1EzuiLc/WisPpKJU"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 2710,
    "path": "../public/assets/index-5Jq7fF0r.js"
  },
  "/assets/index-XOi0SHc0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-29l9fZVDp0QXVrHq9sMuS0mPoEY"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 1953,
    "path": "../public/assets/index-XOi0SHc0.js"
  },
  "/assets/fields-272FUDsI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-rlg04JMovjOTJYpQXbdkzZAkFcI"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 73544,
    "path": "../public/assets/fields-272FUDsI.js"
  },
  "/assets/installation-B5B70zRF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-G7LDrc804hqWU+a6o8WIWEF2BbE"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 38732,
    "path": "../public/assets/installation-B5B70zRF.js"
  },
  "/assets/extract-Cka0bOOa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-kuCH0nghBhJjMw2jajaFniLnNhk"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 18138,
    "path": "../public/assets/extract-Cka0bOOa.js"
  },
  "/assets/installation-BIrsrCU5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-LnhtARxRD3z0qlEMQrRX4yHx1IU"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 8335,
    "path": "../public/assets/installation-BIrsrCU5.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/installation-D-e9QGe2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-EmwU19aj4v+lw+VJVXznGUW4sZ4"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 20165,
    "path": "../public/assets/installation-D-e9QGe2.js"
  },
  "/assets/orama-cloud-cgTJNLo0-Dw4HYl8l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-T+hIlflPZg7hW9NAqa6S5PxG/Qw"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-Dw4HYl8l.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-BizTobJ2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-WdBi0bZcAA+Nd6dznZs1NQ0+3Vw"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-BizTobJ2.js"
  },
  "/assets/main-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T04:12:15.689Z",
    "size": 78946,
    "path": "../public/assets/main-DU2F3XIG.css"
  },
  "/assets/parse-B8igg50z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-2geDP8mJt66QcGd+PNgIsTKnySY"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 26782,
    "path": "../public/assets/parse-B8igg50z.js"
  },
  "/assets/pipeline-RvUbV3io.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-tGQYcMgYO+JOKde7N4QrcvcppxE"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 14063,
    "path": "../public/assets/pipeline-RvUbV3io.js"
  },
  "/assets/pipelines-BE_UMvKN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-NF4W4yB/Q7+6rHfblCoICHbQGpI"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 37283,
    "path": "../public/assets/pipelines-BE_UMvKN.js"
  },
  "/assets/quickstart-BsT6fUvr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5d1f-OltNCr+K1DYVAy8pRuKDJGL8eP4"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 23839,
    "path": "../public/assets/quickstart-BsT6fUvr.js"
  },
  "/assets/process-directory-C5xN69qM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-JjLve3faVbYuKdpGLJDYoMSJI4g"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 50658,
    "path": "../public/assets/process-directory-C5xN69qM.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-DSuDb0SA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-ss68/Hzz6Wk8iefre2iZZSW6o+Y"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 940,
    "path": "../public/assets/search-default-DSuDb0SA.js"
  },
  "/assets/parse-BYabh2xm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-sFUzMz1vOg1Rwyneifb5u0RMYIY"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 55169,
    "path": "../public/assets/parse-BYabh2xm.js"
  },
  "/assets/utils-vcoGqAZU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-LkZnZNpTD0BCfR99kZTOnhu7A4w"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 17059,
    "path": "../public/assets/utils-vcoGqAZU.js"
  },
  "/assets/usage-CFTvkAUx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-gKzdUCr+DNNkl3FaiDDzcifMUlM"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 37282,
    "path": "../public/assets/usage-CFTvkAUx.js"
  },
  "/assets/static-BUXJwBmr-CGSRjgJ7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-jUNLFQ6ZthXEHIlOoKVUKo1lWTU"',
    "mtime": "2026-03-06T04:12:15.690Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-CGSRjgJ7.js"
  },
  "/assets/verify-Cc5Jngu_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-A/n32y+OppDNNrtOpPykVMF/XZE"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 10601,
    "path": "../public/assets/verify-Cc5Jngu_.js"
  },
  "/assets/validation-DPfC28Lu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-h+YFXaTkJEUEAIX8ddUaTGOr2Xw"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 21573,
    "path": "../public/assets/validation-DPfC28Lu.js"
  },
  "/assets/strategies-CpoAyu2o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-odl78oxoqujrn+seKUmMK8dB2Wg"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 176304,
    "path": "../public/assets/strategies-CpoAyu2o.js"
  },
  "/assets/watch-folder-DNx69A2b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-/sycPG0m/JCZHuVARfe944rRnmc"',
    "mtime": "2026-03-06T04:12:15.691Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-DNx69A2b.js"
  },
  "/assets/main-Bqss_295.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb1b6-hZhNtlN0HN/YDriP/dFkjLcKEso"',
    "mtime": "2026-03-06T04:12:15.692Z",
    "size": 962998,
    "path": "../public/assets/main-Bqss_295.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T04:12:15.190Z",
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
const _aSmcHY = defineHandler((event) => {
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
const _lazy_jhqCQA = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return ssrRenderer$1;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_jhqCQA };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_aSmcHY)
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
