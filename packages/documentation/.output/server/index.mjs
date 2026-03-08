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
    "mtime": "2026-03-08T11:24:34.135Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/_-C7IlL1Ve.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a10-lLUJdSzYpKuiwR+y75R5RGnG0Gs"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 10768,
    "path": "../public/assets/_-C7IlL1Ve.js"
  },
  "/assets/artifact-format-CsaiRN1G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-0Uz/VzBBcMWSrDg3Ck9pZycRkIw"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-CsaiRN1G.js"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-03-08T11:24:34.138Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/assets/chunking-Bfw-KueF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-z4qFjWkpZWKZBG3L7X51/J214vc"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 15938,
    "path": "../public/assets/chunking-Bfw-KueF.js"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-08T11:24:34.137Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/enrich-records-BXaY2gNp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-WklQA9cYcD0AkAQotirCeo1BPZI"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-BXaY2gNp.js"
  },
  "/assets/config-CKpg36Em.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-HU4uHxmCWPeC5+UuvCEDqFxBHLM"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 66830,
    "path": "../public/assets/config-CKpg36Em.js"
  },
  "/assets/events-DW5nb7gQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-Kudyn+mPgFD3JCn1p/5GiaVf3JU"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 17535,
    "path": "../public/assets/events-DW5nb7gQ.js"
  },
  "/assets/extract-CdnIHAG5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-yLk6XNIFBz9wq4Ar33iBfMKC850"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 18138,
    "path": "../public/assets/extract-CdnIHAG5.js"
  },
  "/assets/extract-2iZgGqfT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-tgWAtiA5vz/DMdjrzcuaZTWYZwI"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 53321,
    "path": "../public/assets/extract-2iZgGqfT.js"
  },
  "/assets/algolia-CfKKhsrI-COxcdDDo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-DQZL+kAe9miqXIO+XklRSfF4nDs"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-COxcdDDo.js"
  },
  "/assets/extract-invoice-rTILkA7f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-7ySb6Z8exIevA8CR5uVw93prXZ8"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-rTILkA7f.js"
  },
  "/assets/index-BZ41godN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-keWVz2F6VUryssDeHgnG4zXRdmw"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 1953,
    "path": "../public/assets/index-BZ41godN.js"
  },
  "/assets/extract-realestate-8vgRHze0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-wFY2gUNpEvzbo5ZTIEB4EzB9p84"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-8vgRHze0.js"
  },
  "/assets/index-C6wHIDr9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-ZKaPHouLgChHJT5BUjP2WlHdmpY"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 2710,
    "path": "../public/assets/index-C6wHIDr9.js"
  },
  "/assets/index-CT5X5yLO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-Ak99YpEgsAoQraMBHv7bqghUnb0"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 30163,
    "path": "../public/assets/index-CT5X5yLO.js"
  },
  "/assets/document-parsing-CrL7hAIm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-weYtGW2KoXyMjpOvz8+K4SrCWXM"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-CrL7hAIm.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-Dhsmivbm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-qwoxbJ9B+gY4t6NI5eF8rlPT5Kg"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 73544,
    "path": "../public/assets/fields-Dhsmivbm.js"
  },
  "/assets/index-Cgnx8ylJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-I0uX1eDS95dySqQYcmram4vbZzk"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 1055,
    "path": "../public/assets/index-Cgnx8ylJ.js"
  },
  "/assets/index-DHdfa5yD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-G3dZv5UOzUMAnItjhJvVQQPWISA"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 3066,
    "path": "../public/assets/index-DHdfa5yD.js"
  },
  "/assets/index-bUJCq_Zx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-kjPTP/jVlzrG6Ha4w0Ygy4wUKQQ"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 2918,
    "path": "../public/assets/index-bUJCq_Zx.js"
  },
  "/assets/index-D5_UYFiS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3354-0NdppTx92gZSQSk3De6VgkhuyJc"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 13140,
    "path": "../public/assets/index-D5_UYFiS.js"
  },
  "/assets/index-gQ5iEwK_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"66f6-voZ2t8UZ0v9zINPfj3usebnuCQ8"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 26358,
    "path": "../public/assets/index-gQ5iEwK_.js"
  },
  "/assets/installation-DZWEVqr-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-K6Qr2A4LjzhSqwz9aj2MNK0WLME"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 8335,
    "path": "../public/assets/installation-DZWEVqr-.js"
  },
  "/assets/installation-DsQ8Wkor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-jri/UNA/x1XppjObskX3jooFETM"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 38732,
    "path": "../public/assets/installation-DsQ8Wkor.js"
  },
  "/assets/installation-DfTTWtfD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-obUQITk6qFmu+MzVQr7WIOxnCEM"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 20165,
    "path": "../public/assets/installation-DfTTWtfD.js"
  },
  "/assets/main-Uah9q_r_.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"135a3-YorDuNn5CGgl4eHdHdxz/izqWPI"',
    "mtime": "2026-03-08T11:24:34.592Z",
    "size": 79267,
    "path": "../public/assets/main-Uah9q_r_.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-BQ4Cs4NE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-TCIxZU4AwNeSeS+wET5jG8A2FTQ"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-BQ4Cs4NE.js"
  },
  "/assets/parse-CVg3k_vv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-uPUgUKMCgzZU/spN74msyKED5zU"',
    "mtime": "2026-03-08T11:24:34.596Z",
    "size": 55169,
    "path": "../public/assets/parse-CVg3k_vv.js"
  },
  "/assets/parse-WR3tz2iT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-K+vI1tUf1n8fLXDL6BLqS59ltiU"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 26782,
    "path": "../public/assets/parse-WR3tz2iT.js"
  },
  "/assets/pipelines-BBOGiZcT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-5VW1l0LcvxknlUXfkqtt4cgcSE0"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 37283,
    "path": "../public/assets/pipelines-BBOGiZcT.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-WKXbKV6q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-8/PC0fDjTgGP7f2UqLN2xoUzLSM"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-WKXbKV6q.js"
  },
  "/assets/quickstart-DH36aE8B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-MUiYHmEFXbAew6EPy4dwkvXzJwU"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 24549,
    "path": "../public/assets/quickstart-DH36aE8B.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/pipeline-D48UrGLP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-A0HtLmIyvqro/NUdhAWbs5G/ZnE"',
    "mtime": "2026-03-08T11:24:34.596Z",
    "size": 14063,
    "path": "../public/assets/pipeline-D48UrGLP.js"
  },
  "/assets/search-default-wg1ZJ7bS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ae-zDAy0hY6/eGfJWXrcYxNKy9hRCg"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 942,
    "path": "../public/assets/search-default-wg1ZJ7bS.js"
  },
  "/assets/process-directory-KjNJOeH4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-R6qPO08TwgJcei0Sy1GfffAEo1c"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 50658,
    "path": "../public/assets/process-directory-KjNJOeH4.js"
  },
  "/assets/static-BUXJwBmr-Bpk-CKb9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-lzfDcoOcHmrPKTK+v0Gm+rTNTDs"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-Bpk-CKb9.js"
  },
  "/assets/utils-B6eqRbhS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-mdMJJybmsaVC77DvL9oYEIwX1E8"',
    "mtime": "2026-03-08T11:24:34.594Z",
    "size": 17059,
    "path": "../public/assets/utils-B6eqRbhS.js"
  },
  "/assets/strategies-CjieFsFO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-HZweqQUR5sMSwQKf25syRicCe58"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 176304,
    "path": "../public/assets/strategies-CjieFsFO.js"
  },
  "/assets/usage-r4m_RCE-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-JB+2b4zYrfdIcs8HUvL2AqNufIQ"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 37282,
    "path": "../public/assets/usage-r4m_RCE-.js"
  },
  "/assets/verify-B-CecM8z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-OG6Qrl4p9AIZ8iRW5wTYuxA9l6A"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 10601,
    "path": "../public/assets/verify-B-CecM8z.js"
  },
  "/assets/watch-folder-JcPnb9NI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-cKX6IzTOA5E5Z5SNBOyd5hoogow"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-JcPnb9NI.js"
  },
  "/assets/validation-Aaa5D_5f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-37MLhA8lwvxz4iP3btKQ50McWzc"',
    "mtime": "2026-03-08T11:24:34.595Z",
    "size": 21573,
    "path": "../public/assets/validation-Aaa5D_5f.js"
  },
  "/assets/main-wWrzaZ14.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ef36e-W+ZGEbTM5IfVOSLPAloYKRLRwOw"',
    "mtime": "2026-03-08T11:24:34.596Z",
    "size": 979822,
    "path": "../public/assets/main-wWrzaZ14.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-08T11:24:34.181Z",
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
const _LBbEXi = defineHandler((event) => {
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
const _lazy_3hwHvc = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return ssrRenderer$1;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_3hwHvc };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_LBbEXi)
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
