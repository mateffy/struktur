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
    "mtime": "2026-03-06T04:18:58.245Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/_-DVZE204A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a06-EuMtz/MpzQSp48rFWvgiUHVJf4Q"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 10758,
    "path": "../public/assets/_-DVZE204A.js"
  },
  "/assets/algolia-CfKKhsrI-w4ScRNuI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-prNTLp9QiulV1H7hUWBRvQ5QQT0"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-w4ScRNuI.js"
  },
  "/assets/chunking-Zf0ekccT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-JPuzdMe3KG4ScpDYYWrH8fWmfz0"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 15938,
    "path": "../public/assets/chunking-Zf0ekccT.js"
  },
  "/assets/config-Do1JY5AQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-snYAobinDAc/S67RrKPpXv1FJ3c"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 66830,
    "path": "../public/assets/config-Do1JY5AQ.js"
  },
  "/assets/enrich-records-uzcjggTt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-9MEtTwPHwl+0jJ50PSNdBLVXPmo"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-uzcjggTt.js"
  },
  "/assets/events-DRdO3vyj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-8tJya5HxnoiDjRGmTKT9zeU/0Q4"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 17535,
    "path": "../public/assets/events-DRdO3vyj.js"
  },
  "/assets/extract-Bb-bZu_4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-2PH1t2edXYGHepRuWfNMetUcDXo"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 18138,
    "path": "../public/assets/extract-Bb-bZu_4.js"
  },
  "/assets/extract-Ijes2m1z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-Ih+Yzzk28Lxblypij8hMGsMXuC0"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 53321,
    "path": "../public/assets/extract-Ijes2m1z.js"
  },
  "/assets/extract-invoice-BXciMN-Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-+iLYL9T2M9qQG351YD2fePVbTo0"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-BXciMN-Z.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-Zo6BAwJr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-htV/7EA9ANKg4UcREPcoTu9KdJQ"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 73544,
    "path": "../public/assets/fields-Zo6BAwJr.js"
  },
  "/assets/index-B9ws_Vnx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-hlTdYxp8bnaeDP2T69qOhENnFD0"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 3066,
    "path": "../public/assets/index-B9ws_Vnx.js"
  },
  "/assets/index-BBMqvvhm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67bb-bZRirui4oN00Qejb47gW7MBcUGo"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 26555,
    "path": "../public/assets/index-BBMqvvhm.js"
  },
  "/assets/index-BDqQxwqP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-6QZ0ncvNdAbw/Tmx3FdLmqTtjRU"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 1953,
    "path": "../public/assets/index-BDqQxwqP.js"
  },
  "/assets/extract-realestate-DQAqJL_I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-ngpoKhanm+/w0YmUgTJXMg/nbnw"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-DQAqJL_I.js"
  },
  "/assets/index-BGSF0Owt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3336-E+9XYd8BoQ6F6s+ik51GI1YGynE"',
    "mtime": "2026-03-06T04:18:58.848Z",
    "size": 13110,
    "path": "../public/assets/index-BGSF0Owt.js"
  },
  "/assets/index-BTsql1vb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-JMg0LymUdPLXRM0VtnPe9sjp9q8"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 2710,
    "path": "../public/assets/index-BTsql1vb.js"
  },
  "/assets/artifact-format-B2X6KCnO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8d9f-DtcnkdBas4kTZPPwFk8KYok6THw"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 36255,
    "path": "../public/assets/artifact-format-B2X6KCnO.js"
  },
  "/assets/index-CxNiHyd5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-+kra4NnbrZkLz18CEu57AU3OCrM"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 1055,
    "path": "../public/assets/index-CxNiHyd5.js"
  },
  "/assets/index-DKqX1uGR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-dpopc+D3ZJi4FQ6KKAr+Uy57rb0"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 30163,
    "path": "../public/assets/index-DKqX1uGR.js"
  },
  "/assets/installation-BH64qZQr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-IyK/yPB/tF507vQhUclKB80DuHA"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 20165,
    "path": "../public/assets/installation-BH64qZQr.js"
  },
  "/assets/document-parsing-DsXIYvLY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-nbS6RnMh/3wHBZeeGYvIw1VqB5M"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-DsXIYvLY.js"
  },
  "/assets/index-CcsEOodW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-aImGSOabam5o0VyjMe+uHz/R8Mc"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 2918,
    "path": "../public/assets/index-CcsEOodW.js"
  },
  "/assets/installation-Bwfg1-2M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-z+WS4lr4Yt/+4cAScoAkyiBzs/M"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 8335,
    "path": "../public/assets/installation-Bwfg1-2M.js"
  },
  "/assets/installation-DFCQb_oQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-znfCbS9EZCqmeqLfvkMeGIlgKek"',
    "mtime": "2026-03-06T04:18:58.848Z",
    "size": 38732,
    "path": "../public/assets/installation-DFCQb_oQ.js"
  },
  "/assets/main-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 78946,
    "path": "../public/assets/main-DU2F3XIG.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-BqmKuEei.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-GT4xDm7+hj6OzYlWdnjtm8Qs2w4"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-BqmKuEei.js"
  },
  "/assets/orama-cloud-cgTJNLo0-DG_SQR0_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-hJnud7bHOQf7vhtksyYsrPkRp1c"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-DG_SQR0_.js"
  },
  "/assets/parse-CTR9GIOq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-GkMvl3Xaze79jckVyyPwbEly6hk"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 55169,
    "path": "../public/assets/parse-CTR9GIOq.js"
  },
  "/assets/pipeline-wpZKfD8n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-RpbtWZzxX8brBtT8X6/zG1xpPIQ"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 14063,
    "path": "../public/assets/pipeline-wpZKfD8n.js"
  },
  "/assets/parse-MT6zO5V9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-A8fHg5qVpHNtvf0Tfs5dL3ZMJ3s"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 26782,
    "path": "../public/assets/parse-MT6zO5V9.js"
  },
  "/assets/pipelines-B6jX-r1G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-bsF0HX0OpSjdNATa/rAhMBCFsRY"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 37283,
    "path": "../public/assets/pipelines-B6jX-r1G.js"
  },
  "/assets/process-directory-1-dNMdXI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-O8uleBiu7xiEO8yLdh/+HFGov7Q"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 50658,
    "path": "../public/assets/process-directory-1-dNMdXI.js"
  },
  "/assets/quickstart-BDa1NjPw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-nQGTwlZvyJHSChs2+jx0wgsYnIE"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 24549,
    "path": "../public/assets/quickstart-BDa1NjPw.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-CXM2LtAR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-Mi8GrN5MdMJ+p8OgtCBWd7oKhhI"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 940,
    "path": "../public/assets/search-default-CXM2LtAR.js"
  },
  "/assets/static-BUXJwBmr-IXdV-XB_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-dmsmYMcBDvfB1d4oiIeVjGGQjNQ"',
    "mtime": "2026-03-06T04:18:58.846Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-IXdV-XB_.js"
  },
  "/assets/strategies-D78_18un.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-XHEYIwheN8jCeFrdfCNjBKgf4ZQ"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 176304,
    "path": "../public/assets/strategies-D78_18un.js"
  },
  "/assets/usage-BYwBAo2O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-67QTEFa2VNuO/0/n3axzKVOFakk"',
    "mtime": "2026-03-06T04:18:58.848Z",
    "size": 37282,
    "path": "../public/assets/usage-BYwBAo2O.js"
  },
  "/assets/utils-BJEdp9Jr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-IR8uMIXJljILLQ+mQIBfuK4iIfU"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 17059,
    "path": "../public/assets/utils-BJEdp9Jr.js"
  },
  "/assets/validation-Cv0ggDOX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-gZJNMeExS463YydEDp4HVFk9oeI"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 21573,
    "path": "../public/assets/validation-Cv0ggDOX.js"
  },
  "/assets/verify-eSC39OXZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-Ud9+kwqN4NbsfM+ej5ROrqeJu0s"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 10601,
    "path": "../public/assets/verify-eSC39OXZ.js"
  },
  "/assets/watch-folder-6Gb2gLcs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-StolJJ6/e1U1pm0E9YPzyXFN/ZM"',
    "mtime": "2026-03-06T04:18:58.847Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-6Gb2gLcs.js"
  },
  "/assets/main-I39y1YBh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb1b6-oQlYHtCFj46/1abprBC0csvFXF0"',
    "mtime": "2026-03-06T04:18:58.848Z",
    "size": 962998,
    "path": "../public/assets/main-I39y1YBh.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T04:18:58.284Z",
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
