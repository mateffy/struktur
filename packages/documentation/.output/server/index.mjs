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
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-06T04:53:25.593Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/CNAME": {
    "type": "text/plain; charset=utf-8",
    "etag": '"b-vMwX+cTl5yDqPfvnjJ2Kk+BC1jQ"',
    "mtime": "2026-03-06T04:53:25.593Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/chunking-DRe-zPdH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-hd+5MpumVmJlfU9OUha8pfSAr7Q"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 15938,
    "path": "../public/assets/chunking-DRe-zPdH.js"
  },
  "/assets/algolia-CfKKhsrI-MIXxuYTb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-6h4YOqWs54s9q+EweLpsQI88ApY"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-MIXxuYTb.js"
  },
  "/assets/config-Cs2OCxHR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-19f1DvE1qCkYKgrXOwVy1t4Xc7Q"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 66830,
    "path": "../public/assets/config-Cs2OCxHR.js"
  },
  "/assets/artifact-format-B91gfJw4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-VDVxlYcTeTrPHr7IQoTJAfPlO10"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-B91gfJw4.js"
  },
  "/assets/enrich-records-BKMqmBLv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-G6aD5LCqEd4nGgb02+uWbtaQJKo"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-BKMqmBLv.js"
  },
  "/assets/_-esK10WIi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a06-X5ve59HdeEBDhKgSvsP+a2Ybqjc"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 10758,
    "path": "../public/assets/_-esK10WIi.js"
  },
  "/assets/document-parsing-QSgIie31.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-KCO0JzjsoVorcxM5i4N8jjnNRM4"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-QSgIie31.js"
  },
  "/assets/events-BdK_oNvI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-I9qTjq+1pBkydgjDp8NIei/nSu0"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 17535,
    "path": "../public/assets/events-BdK_oNvI.js"
  },
  "/assets/extract-D_8WXNUv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-N/6A4e4phMT3yKJtlY1ZQMBYlrQ"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 53321,
    "path": "../public/assets/extract-D_8WXNUv.js"
  },
  "/assets/extract-realestate-BWniiA61.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-e3wmjEZyWU8tU3+/MVvsYDCHAbc"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-BWniiA61.js"
  },
  "/assets/extract-sd3ifQUE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-FAf9CdWei3R7KNuc2io8aH1V8bg"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 18138,
    "path": "../public/assets/extract-sd3ifQUE.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/extract-invoice-Yp5TGcbj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-pzcJe5DUTBe+4kux8uN6a5lriic"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-Yp5TGcbj.js"
  },
  "/assets/fields-BxmdWCsE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-mbmb6zYaqw7vp5nC4zcFocNZGJI"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 73544,
    "path": "../public/assets/fields-BxmdWCsE.js"
  },
  "/assets/index-B-DE0dag.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-rf2yeF5FQZuN7BkhmffmZSpbpAg"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 1953,
    "path": "../public/assets/index-B-DE0dag.js"
  },
  "/assets/index-CbX5yxPd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3354-7FJ8LWsIn5mIc7Ac8vBv4RV9wx8"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 13140,
    "path": "../public/assets/index-CbX5yxPd.js"
  },
  "/assets/index-B1_hh8wn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-79TNz2eapA9uF4y5UDu8Hyhz8as"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 30163,
    "path": "../public/assets/index-B1_hh8wn.js"
  },
  "/assets/index-DR71aAcR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-gHl0tm/PDM0iRbRhDIwgdwCDBDs"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 1055,
    "path": "../public/assets/index-DR71aAcR.js"
  },
  "/assets/index-BZaLqx9r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-RvVhGsTyo/WOSsLKEDtUqreTgQ0"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 3066,
    "path": "../public/assets/index-BZaLqx9r.js"
  },
  "/assets/index-DVyLQIk5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"686f-V64ipXc9HBs+73+rHfZ8qBuG2cs"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 26735,
    "path": "../public/assets/index-DVyLQIk5.js"
  },
  "/assets/index-kdtwJE5t.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-RxjEYgptsndiQv21y3Xoau0jRzU"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 2918,
    "path": "../public/assets/index-kdtwJE5t.js"
  },
  "/assets/index-_llkbAEY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-FPWyG1nR085Dy6EAWVM6n/22Opg"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 2710,
    "path": "../public/assets/index-_llkbAEY.js"
  },
  "/assets/installation-BMZcPBgi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-U8xD95Xd1DyxuyrEYtdNcLjCAuk"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 38732,
    "path": "../public/assets/installation-BMZcPBgi.js"
  },
  "/assets/installation-DROJ_VCv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-TwJ7EfnKjQm84v9VaWzcY421Oak"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 8335,
    "path": "../public/assets/installation-DROJ_VCv.js"
  },
  "/assets/installation-PWXC3OJF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-SASRgI/6m1I0cZ2+b0yQNuOyhm8"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 20165,
    "path": "../public/assets/installation-PWXC3OJF.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-BlUYOtV9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-SKYcG8YEXxy9mdUXMlnLGvP3P0A"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-BlUYOtV9.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-CjTdzMkA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-16GhSf161yaMzX9eiquLauDsOtE"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-CjTdzMkA.js"
  },
  "/assets/main-CL5WYQnP.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"134c3-WZcBbqNBOyDSfOmMjfBy6eX/uno"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 79043,
    "path": "../public/assets/main-CL5WYQnP.css"
  },
  "/assets/pipeline-CQQjLb-I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-m6/Np9sx35JT/vPJ+PzWqxIypVM"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 14063,
    "path": "../public/assets/pipeline-CQQjLb-I.js"
  },
  "/assets/pipelines-B3-oCUw1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-YMba5WNND/38frG6NhdDIMEQfmo"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 37283,
    "path": "../public/assets/pipelines-B3-oCUw1.js"
  },
  "/assets/process-directory-Br2gc-iW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-K9YclmtY6CvvKM2QpNk9FwUrLZY"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 50658,
    "path": "../public/assets/process-directory-Br2gc-iW.js"
  },
  "/assets/parse-X7qvwQVL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-UZuEHcLFn9ivhV+OSjAvNDUi92k"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 26782,
    "path": "../public/assets/parse-X7qvwQVL.js"
  },
  "/assets/quickstart-BM6_SuMk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-NR3edcSNzorgoYq0QOl1PdmVWus"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 24549,
    "path": "../public/assets/quickstart-BM6_SuMk.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-MQneyYvo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-P5yD8MuHukC81QVvmw1GiiL0qug"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 940,
    "path": "../public/assets/search-default-MQneyYvo.js"
  },
  "/assets/static-BUXJwBmr-ClAYyJM8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-x5oEE7/Tod//veoNZGDGeWOa6yI"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-ClAYyJM8.js"
  },
  "/assets/parse-BbzjbaW2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-i+UdWB9xPxwAtsUCQNXcFAry5Dk"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 55169,
    "path": "../public/assets/parse-BbzjbaW2.js"
  },
  "/assets/usage-DJt-auNt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-bnBoCgHakI73Fv7hFeX5zwTe35I"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 37282,
    "path": "../public/assets/usage-DJt-auNt.js"
  },
  "/assets/utils-BpWTR5kj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-TXNMUf3VqlBTLlsKDtX9Jmz0c0c"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 17059,
    "path": "../public/assets/utils-BpWTR5kj.js"
  },
  "/assets/validation-DZPwtOa3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-6q1qxtBKxgnUtAOyO9KBWOTNkCw"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 21573,
    "path": "../public/assets/validation-DZPwtOa3.js"
  },
  "/assets/verify-BlUKy3hG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-y5SLb3rCKIsGjXyRNHBhkp7XCZY"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 10601,
    "path": "../public/assets/verify-BlUKy3hG.js"
  },
  "/assets/strategies-SnqXFwjn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-yI+OaL+uHG/elSGi6EaXM++71q0"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 176304,
    "path": "../public/assets/strategies-SnqXFwjn.js"
  },
  "/assets/watch-folder-CX77HzxD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-pOP88Hh1xt65Or9JnkrPjT0Kw4k"',
    "mtime": "2026-03-06T04:53:25.967Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-CX77HzxD.js"
  },
  "/assets/main-BU_tQzVR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ebaef-84MNmvAwtTvworB2xKFpT8yOSDE"',
    "mtime": "2026-03-06T04:53:25.968Z",
    "size": 965359,
    "path": "../public/assets/main-BU_tQzVR.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T04:53:25.610Z",
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
