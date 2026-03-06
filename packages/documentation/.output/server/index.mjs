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
    "mtime": "2026-03-06T04:04:24.637Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/_-Cp-QW9VM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29f9-iWIh874UJxwaem8XvSck9L8gBBk"',
    "mtime": "2026-03-06T04:04:25.124Z",
    "size": 10745,
    "path": "../public/assets/_-Cp-QW9VM.js"
  },
  "/assets/algolia-CfKKhsrI-xH4dbFaX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-8gt3x879VhqphI77ub30RlgektQ"',
    "mtime": "2026-03-06T04:04:25.124Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-xH4dbFaX.js"
  },
  "/assets/artifact-format-C8kXOrOi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8d9f-suXeGFYV4GP7NxvUGatXRdNUUJY"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 36255,
    "path": "../public/assets/artifact-format-C8kXOrOi.js"
  },
  "/assets/chunking-qY6NrUPM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-uP54Cg/6T783tP3KmnS+SWVcz4M"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 15938,
    "path": "../public/assets/chunking-qY6NrUPM.js"
  },
  "/assets/config-DrDSqMW5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-3dUwrbqTTog9rrvTsCadY3V+Los"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 66830,
    "path": "../public/assets/config-DrDSqMW5.js"
  },
  "/assets/events-DuXOUfE_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-HzxyQnVNM5tDdAfi2CKsIS8AQ9Q"',
    "mtime": "2026-03-06T04:04:25.127Z",
    "size": 17535,
    "path": "../public/assets/events-DuXOUfE_.js"
  },
  "/assets/extract-DqIbc0f7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-DD8yM10wp0NyRTIftcKZIbdkrMg"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 53321,
    "path": "../public/assets/extract-DqIbc0f7.js"
  },
  "/assets/extract-Du0aJ7PH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-WgeRbPD6zHLq8EdmoTDqu1Z7gpU"',
    "mtime": "2026-03-06T04:04:25.128Z",
    "size": 18138,
    "path": "../public/assets/extract-Du0aJ7PH.js"
  },
  "/assets/enrich-records-Da3JTzKJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-Z8B5Q9/7GP77qoXKyWTyHtRHtFg"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-Da3JTzKJ.js"
  },
  "/assets/extract-invoice-795esLnB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-NPJXNtpHu3bkC4bj3pE6gHKLtOU"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-795esLnB.js"
  },
  "/assets/extract-realestate-BbodnMce.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-OulFmd1xMLzodbWZT6bkbOS3dP0"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-BbodnMce.js"
  },
  "/assets/index-61MSKVPb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-IZ9FvUmJ3NrvedcJh1Gginb8Olc"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 2918,
    "path": "../public/assets/index-61MSKVPb.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/index-BRxQ9RXf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"319d-g4HPMmtcu6R6T+tiAhmqBQRV4TU"',
    "mtime": "2026-03-06T04:04:25.128Z",
    "size": 12701,
    "path": "../public/assets/index-BRxQ9RXf.js"
  },
  "/assets/index-CAGDQd6l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-O3mM0AfUVkUTWYYqvxfjEKYU1es"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 30163,
    "path": "../public/assets/index-CAGDQd6l.js"
  },
  "/assets/fields-BGekW5Ro.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-tZH8jh8m0uSBg5wjNp/UmqVwNB8"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 73544,
    "path": "../public/assets/fields-BGekW5Ro.js"
  },
  "/assets/document-parsing-5QYOg9R2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-7R7CL3zPFEfhw7nPSQCpLsTjWLk"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-5QYOg9R2.js"
  },
  "/assets/index-CNqLhvqL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67bb-3ffTJv5zBcdCK/+TM3B0a10poA8"',
    "mtime": "2026-03-06T04:04:25.124Z",
    "size": 26555,
    "path": "../public/assets/index-CNqLhvqL.js"
  },
  "/assets/index-DYskVVRN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-MNWw/ke4Qe94ImX/yFRjJ0PgasU"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 1055,
    "path": "../public/assets/index-DYskVVRN.js"
  },
  "/assets/index-yaDiSgbL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-VUWnfIzhA1Mf4qyHjHiQAeA60ww"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 2710,
    "path": "../public/assets/index-yaDiSgbL.js"
  },
  "/assets/installation-1UMOmdSi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-M6310HoCCE5Is1p8uOe25fv84lo"',
    "mtime": "2026-03-06T04:04:25.128Z",
    "size": 8335,
    "path": "../public/assets/installation-1UMOmdSi.js"
  },
  "/assets/index-LgKYXoOf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-XGddnBsWZp3T7CGOH7LFYu9iSj0"',
    "mtime": "2026-03-06T04:04:25.128Z",
    "size": 1953,
    "path": "../public/assets/index-LgKYXoOf.js"
  },
  "/assets/index-CZXIEa4w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-jR2rUgz23r5thUX7YKONJ+HQhZw"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 3066,
    "path": "../public/assets/index-CZXIEa4w.js"
  },
  "/assets/installation-7KRtvznP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-M+n05azy5a6G5co/FrQM/JmvKFg"',
    "mtime": "2026-03-06T04:04:25.128Z",
    "size": 38732,
    "path": "../public/assets/installation-7KRtvznP.js"
  },
  "/assets/installation-jew9rXGO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-sfZCK1gWH+wKlbzHRi4UMhOuj3g"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 20165,
    "path": "../public/assets/installation-jew9rXGO.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T04:04:25.124Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-C4jOa5Vf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-1v81/IHhVrVRmK6oqJxl0IiEydc"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-C4jOa5Vf.js"
  },
  "/assets/main-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T04:04:25.124Z",
    "size": 78946,
    "path": "../public/assets/main-DU2F3XIG.css"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-B5BdO3tB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-Cb/aNunwZt29lDlKo3ULwV/vJPc"',
    "mtime": "2026-03-06T04:04:25.124Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-B5BdO3tB.js"
  },
  "/assets/parse-CNv6tGMp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-JGULZp2T5QmPacdmzGV9/Hz8H10"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 26782,
    "path": "../public/assets/parse-CNv6tGMp.js"
  },
  "/assets/pipeline-D68J7d1h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-Q2aekxX7MbqmlTwz5aufz0Fv0XQ"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 14063,
    "path": "../public/assets/pipeline-D68J7d1h.js"
  },
  "/assets/parse-DnAKa4Xm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-5jx+BWqzHt0Y9/WLsscuZFatxXA"',
    "mtime": "2026-03-06T04:04:25.128Z",
    "size": 55169,
    "path": "../public/assets/parse-DnAKa4Xm.js"
  },
  "/assets/pipelines-B_LKQ1xj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-9IewNba6LLTg5Ocxu+AnBBLUBAU"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 37283,
    "path": "../public/assets/pipelines-B_LKQ1xj.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/quickstart-zucv4hhF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5d1f-iN18dozzvew+c1voK7kTpteBCYM"',
    "mtime": "2026-03-06T04:04:25.128Z",
    "size": 23839,
    "path": "../public/assets/quickstart-zucv4hhF.js"
  },
  "/assets/search-default-E0jAN8cw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-oKubCHN3eHa07doBZElA/Osyyck"',
    "mtime": "2026-03-06T04:04:25.124Z",
    "size": 940,
    "path": "../public/assets/search-default-E0jAN8cw.js"
  },
  "/assets/process-directory-DECmGtMy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-u1F3tW5WVyiGtpbF0UQaZv11pgA"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 50658,
    "path": "../public/assets/process-directory-DECmGtMy.js"
  },
  "/assets/static-BUXJwBmr-V1xh7P5v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-KTJlSTzvoz5wTyPffmCIgZ9gqlQ"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-V1xh7P5v.js"
  },
  "/assets/strategies-CamMitox.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-LW3Ywm9KhLtPTWP9blM1/4sxJ6I"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 176304,
    "path": "../public/assets/strategies-CamMitox.js"
  },
  "/assets/usage-BiWHNK1I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-m6waeh+vSEaJi4ufSNfSJPR9CDc"',
    "mtime": "2026-03-06T04:04:25.128Z",
    "size": 37282,
    "path": "../public/assets/usage-BiWHNK1I.js"
  },
  "/assets/utils-CBu-hatm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-ZHsAQOUr13hFuc9AQuUSzvUcPiE"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 17059,
    "path": "../public/assets/utils-CBu-hatm.js"
  },
  "/assets/verify-DjHNDFvq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-BaZFeyb5sa7/Zu2+MjrTTog2nwg"',
    "mtime": "2026-03-06T04:04:25.125Z",
    "size": 10601,
    "path": "../public/assets/verify-DjHNDFvq.js"
  },
  "/assets/validation-BirAJLu0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-5QM0jqWs+8isHvUAFF5F4taIa94"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 21573,
    "path": "../public/assets/validation-BirAJLu0.js"
  },
  "/assets/watch-folder-Cvte0wc_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-KP+GX6Ty4WbFh38GuI1tYBah0Ek"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-Cvte0wc_.js"
  },
  "/assets/main-DSPhsHwQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb1b6-AaOR8a/OOnIbA4zOmMuJTSdpi/E"',
    "mtime": "2026-03-06T04:04:25.126Z",
    "size": 962998,
    "path": "../public/assets/main-DSPhsHwQ.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T04:04:24.657Z",
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
