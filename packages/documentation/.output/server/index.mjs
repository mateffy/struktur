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
    "mtime": "2026-03-06T04:22:32.415Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/chunking-Bj_hiEwo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-wbvJJz1PSl2m+AvV5Znd9ey1jvw"',
    "mtime": "2026-03-06T04:22:33.024Z",
    "size": 15938,
    "path": "../public/assets/chunking-Bj_hiEwo.js"
  },
  "/assets/_-DFzc2Oa4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a06-mTlTvAsxSE38N/vlF8nHTVHtaug"',
    "mtime": "2026-03-06T04:22:33.011Z",
    "size": 10758,
    "path": "../public/assets/_-DFzc2Oa4.js"
  },
  "/assets/config-DDejdNmk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-s2uQJU3qxK9fELj1WMFv0Vfr8BU"',
    "mtime": "2026-03-06T04:22:33.019Z",
    "size": 66830,
    "path": "../public/assets/config-DDejdNmk.js"
  },
  "/assets/algolia-CfKKhsrI-Cy8sXW6H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-YSZtIFYEu/qNnkSFV4dz3Od7Z+o"',
    "mtime": "2026-03-06T04:22:33.011Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-Cy8sXW6H.js"
  },
  "/assets/artifact-format-BBD56XlN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8d9f-rTCxfLjdM6xRNKQe6SUancoQxFc"',
    "mtime": "2026-03-06T04:22:33.023Z",
    "size": 36255,
    "path": "../public/assets/artifact-format-BBD56XlN.js"
  },
  "/assets/document-parsing-DjAgcwZQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-Gxb0EnjwkRmwGx2G3PnlGcl6Nuw"',
    "mtime": "2026-03-06T04:22:33.027Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-DjAgcwZQ.js"
  },
  "/assets/enrich-records-C6z_NUN2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-UHHvCEC83mHiaxJr/zgzIQwwqOg"',
    "mtime": "2026-03-06T04:22:33.019Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-C6z_NUN2.js"
  },
  "/assets/events-Ba_A0ol3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-bY+Tg4kWqByZIrPno6WOQc8O55Q"',
    "mtime": "2026-03-06T04:22:33.028Z",
    "size": 17535,
    "path": "../public/assets/events-Ba_A0ol3.js"
  },
  "/assets/extract-BlJIGNbg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-v7qrLyvx4sbfd2dvlqpbf27Z6k4"',
    "mtime": "2026-03-06T04:22:33.019Z",
    "size": 53321,
    "path": "../public/assets/extract-BlJIGNbg.js"
  },
  "/assets/extract-realestate-CQnArMet.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-hFMUNwDNSyRQFTRf59N2lgJ9um0"',
    "mtime": "2026-03-06T04:22:33.019Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-CQnArMet.js"
  },
  "/assets/extract-DxYTs40l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-CMsAqgwGQjEpPTjqks3WDntgZSE"',
    "mtime": "2026-03-06T04:22:33.029Z",
    "size": 18138,
    "path": "../public/assets/extract-DxYTs40l.js"
  },
  "/assets/extract-invoice-DA6tQn_y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-sC5ieVdgB/DC9vTH/cGzGug2JX0"',
    "mtime": "2026-03-06T04:22:33.020Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-DA6tQn_y.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T04:22:33.011Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-D5NCyMHA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-fE6vfCG9u+fvJ2ktuJRw9J/J9As"',
    "mtime": "2026-03-06T04:22:33.019Z",
    "size": 73544,
    "path": "../public/assets/fields-D5NCyMHA.js"
  },
  "/assets/index-BVZ-hgmL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-9YouNBUCw6C3HjN9fbXLLkaOrAo"',
    "mtime": "2026-03-06T04:22:33.037Z",
    "size": 2918,
    "path": "../public/assets/index-BVZ-hgmL.js"
  },
  "/assets/index-2ZPX5SVj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-29xN2Va4a/yF/rwRFzGCD+x+y5A"',
    "mtime": "2026-03-06T04:22:33.027Z",
    "size": 2710,
    "path": "../public/assets/index-2ZPX5SVj.js"
  },
  "/assets/index-B-McY-Xw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-hILeQtiUORTLX4OjFWd+upLXXH0"',
    "mtime": "2026-03-06T04:22:33.033Z",
    "size": 1953,
    "path": "../public/assets/index-B-McY-Xw.js"
  },
  "/assets/index-Bf0cSuqj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3354-GyQ5nxEKLVN52JUkTGz8FTH8MXM"',
    "mtime": "2026-03-06T04:22:33.037Z",
    "size": 13140,
    "path": "../public/assets/index-Bf0cSuqj.js"
  },
  "/assets/index-C2Ba99PC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67bb-V6LlBPfd9H3NVUFEFzmgYEs855E"',
    "mtime": "2026-03-06T04:22:33.011Z",
    "size": 26555,
    "path": "../public/assets/index-C2Ba99PC.js"
  },
  "/assets/index-DwUwVFDc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-7kCEKqD3USQ2829QvD9zMl2RAUg"',
    "mtime": "2026-03-06T04:22:33.016Z",
    "size": 1055,
    "path": "../public/assets/index-DwUwVFDc.js"
  },
  "/assets/index-bk2NzkKC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-VkJw+WQA4if1FGyx8ag96S6KXJI"',
    "mtime": "2026-03-06T04:22:33.033Z",
    "size": 30163,
    "path": "../public/assets/index-bk2NzkKC.js"
  },
  "/assets/index-NIjquSBW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-laqE/vGuQBTeR5qu0alrg5efgRM"',
    "mtime": "2026-03-06T04:22:33.019Z",
    "size": 3066,
    "path": "../public/assets/index-NIjquSBW.js"
  },
  "/assets/installation-CoLei_62.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-8eGQmScGmCXf9iYvrtKWZN9MNhQ"',
    "mtime": "2026-03-06T04:22:33.036Z",
    "size": 8335,
    "path": "../public/assets/installation-CoLei_62.js"
  },
  "/assets/installation-DBmA1-pw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-HOmkVfM+cos4xvt56QfzxMI5ups"',
    "mtime": "2026-03-06T04:22:33.016Z",
    "size": 20165,
    "path": "../public/assets/installation-DBmA1-pw.js"
  },
  "/assets/main-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T04:22:33.014Z",
    "size": 78946,
    "path": "../public/assets/main-DU2F3XIG.css"
  },
  "/assets/installation-DYBWEU_e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-Hndg0CcNW6IlwSj6q3riNMUaf3M"',
    "mtime": "2026-03-06T04:22:33.036Z",
    "size": 38732,
    "path": "../public/assets/installation-DYBWEU_e.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T04:22:33.014Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-xnpKQxDS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-8378MXYmOAZpgKy5h4JUX6KwfbU"',
    "mtime": "2026-03-06T04:22:33.014Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-xnpKQxDS.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-Dea1aEbE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-ZPt/jNimaYM8ZqYyrCUgjRpPy64"',
    "mtime": "2026-03-06T04:22:33.011Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-Dea1aEbE.js"
  },
  "/assets/pipeline-Ph45UW9J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-9Ue0Bwq2Q3sumPtbDqs/u4bZmE0"',
    "mtime": "2026-03-06T04:22:33.024Z",
    "size": 14063,
    "path": "../public/assets/pipeline-Ph45UW9J.js"
  },
  "/assets/pipelines-DYwRlijR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-bndewY9/nRxKuJN6S47ICZUCPZQ"',
    "mtime": "2026-03-06T04:22:33.020Z",
    "size": 37283,
    "path": "../public/assets/pipelines-DYwRlijR.js"
  },
  "/assets/parse-BEWxk8jh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-SjBVzLxcB/5tRXt19D5Y2gIJ3iw"',
    "mtime": "2026-03-06T04:22:33.019Z",
    "size": 26782,
    "path": "../public/assets/parse-BEWxk8jh.js"
  },
  "/assets/quickstart-C0qLPgMJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-7h1BOineoI8Mhm7r/4frrVQ/dOg"',
    "mtime": "2026-03-06T04:22:33.032Z",
    "size": 24549,
    "path": "../public/assets/quickstart-C0qLPgMJ.js"
  },
  "/assets/process-directory-DjSI6LgB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-4YjZl1ePUkuXWRBSBXlgYqi8I94"',
    "mtime": "2026-03-06T04:22:33.023Z",
    "size": 50658,
    "path": "../public/assets/process-directory-DjSI6LgB.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T04:22:33.016Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/parse-DzSNYOyd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-PI+LAj/ostWuJuOOYrA8CW+MkOs"',
    "mtime": "2026-03-06T04:22:33.036Z",
    "size": 55169,
    "path": "../public/assets/parse-DzSNYOyd.js"
  },
  "/assets/search-default-CFbXy75n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-GPLmo3MU8u8ol7nCtquw7CAdcA8"',
    "mtime": "2026-03-06T04:22:33.011Z",
    "size": 940,
    "path": "../public/assets/search-default-CFbXy75n.js"
  },
  "/assets/utils-ClXB3831.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-zN3RdHB9dmW3OVbi4ZnJSEYUOVo"',
    "mtime": "2026-03-06T04:22:33.016Z",
    "size": 17059,
    "path": "../public/assets/utils-ClXB3831.js"
  },
  "/assets/strategies-BdfLbpiN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-rZdRwOy8KyMeuGGakRuHtL54cUw"',
    "mtime": "2026-03-06T04:22:33.033Z",
    "size": 176304,
    "path": "../public/assets/strategies-BdfLbpiN.js"
  },
  "/assets/validation-BFPrKbvW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-b9g2Le9tmwKXchzatZjUn/rNs/A"',
    "mtime": "2026-03-06T04:22:33.028Z",
    "size": 21573,
    "path": "../public/assets/validation-BFPrKbvW.js"
  },
  "/assets/static-BUXJwBmr-BPE7UeYE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-XppGmxDDYcB4b9XuP46c1sXxv50"',
    "mtime": "2026-03-06T04:22:33.015Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-BPE7UeYE.js"
  },
  "/assets/verify-DFztGtW8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-SNel6HthSeXHY8B8TiIDAGSDa9A"',
    "mtime": "2026-03-06T04:22:33.019Z",
    "size": 10601,
    "path": "../public/assets/verify-DFztGtW8.js"
  },
  "/assets/usage-C0H_lh_U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-YSXb1czK3bjsk+pmjS7JWd+nEHY"',
    "mtime": "2026-03-06T04:22:33.037Z",
    "size": 37282,
    "path": "../public/assets/usage-C0H_lh_U.js"
  },
  "/assets/watch-folder-DpLHWITW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-pAtStWNBxEg4FTfB2z1RIZS/oTc"',
    "mtime": "2026-03-06T04:22:33.023Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-DpLHWITW.js"
  },
  "/assets/main-BI0ZjDJr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb1b6-9OVovlJ/IkNTCsQmq6R8qzpJUss"',
    "mtime": "2026-03-06T04:22:33.040Z",
    "size": 962998,
    "path": "../public/assets/main-BI0ZjDJr.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T04:22:32.509Z",
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
