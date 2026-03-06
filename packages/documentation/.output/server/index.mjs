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
    "mtime": "2026-03-06T04:33:41.559Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/_-CiFvwY9B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a06-n4HHnC6Kf0xNIKbVzResUCTorrc"',
    "mtime": "2026-03-06T04:33:42.158Z",
    "size": 10758,
    "path": "../public/assets/_-CiFvwY9B.js"
  },
  "/assets/artifact-format-DdWp8poF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-3QplAOScl2zLvMEvoBNfL+FCOi0"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-DdWp8poF.js"
  },
  "/assets/chunking-DJYg2Qvp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-LJtI35hiQWeK3X2NhtMIBR4T120"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 15938,
    "path": "../public/assets/chunking-DJYg2Qvp.js"
  },
  "/assets/algolia-CfKKhsrI-BRON2Jx4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-5Dv0ibXY1VjT/AvTswnPRwpckuQ"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-BRON2Jx4.js"
  },
  "/assets/config-DGWRkKBw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-256jRLMcnNH6HhfVScWpSazdyyI"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 66830,
    "path": "../public/assets/config-DGWRkKBw.js"
  },
  "/assets/enrich-records-SDTy96Dz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-aI+hH4ak0i6JRYAHWiJ1ynzONKc"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-SDTy96Dz.js"
  },
  "/assets/document-parsing-DOqBE-Lc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-x0H/9Kay33LkQUKlecXqP9BmtUQ"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-DOqBE-Lc.js"
  },
  "/assets/events-CdNxZZMe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-ojcrFtrPy74BKRnZn10lefT63/g"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 17535,
    "path": "../public/assets/events-CdNxZZMe.js"
  },
  "/assets/extract-jQjF3nr-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-V5v2JhiG9h/m5bCz5OkNia3t4dU"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 18138,
    "path": "../public/assets/extract-jQjF3nr-.js"
  },
  "/assets/extract-invoice-Dpn8A2uq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-rid8XN5SmC6Wqb1Vmt3e5y0MOcw"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-Dpn8A2uq.js"
  },
  "/assets/extract-DDioSF_1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-Zw3J8+Bv5X/9pqnfqIZxjG3oufc"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 53321,
    "path": "../public/assets/extract-DDioSF_1.js"
  },
  "/assets/fields-BRbMFT3m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-mUOgw7buFpsuCuhWrxM1J420sHw"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 73544,
    "path": "../public/assets/fields-BRbMFT3m.js"
  },
  "/assets/index-BCaGS6zq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-d5NXE06lCNFTEy/h/ntyZGIKT28"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 2710,
    "path": "../public/assets/index-BCaGS6zq.js"
  },
  "/assets/extract-realestate-7ooQPetB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-9Sqyv4oL5yvupClsYJseLmcuEiU"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-7ooQPetB.js"
  },
  "/assets/index-BxVVqjXs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-eBmrwfvD2T9mZzXt8AsJg73jcwA"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 1953,
    "path": "../public/assets/index-BxVVqjXs.js"
  },
  "/assets/index-8EWaewxk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-wd4tcwdOf63zjhODcOg5yxXo/yU"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 3066,
    "path": "../public/assets/index-8EWaewxk.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/index-DCUi1wFy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3354-JmSslOVmPq92LmG8mpk6bwM3i6o"',
    "mtime": "2026-03-06T04:33:42.162Z",
    "size": 13140,
    "path": "../public/assets/index-DCUi1wFy.js"
  },
  "/assets/index-CC2pwSXe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-yiDWu0UfFBdt3Mnj07cGPzDP/r4"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 1055,
    "path": "../public/assets/index-CC2pwSXe.js"
  },
  "/assets/index-hZuI7or_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-UET2eB7xfT49dnrl7p4BRMQ9udE"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 2918,
    "path": "../public/assets/index-hZuI7or_.js"
  },
  "/assets/index-DHQ_ADmf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-WMNpg+9BnPRoEVoz76Z9QFluNP4"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 30163,
    "path": "../public/assets/index-DHQ_ADmf.js"
  },
  "/assets/index-nF7Zdrz5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67bb-XlVquP0Q+OtVLcXA9flagRp5zYI"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 26555,
    "path": "../public/assets/index-nF7Zdrz5.js"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-06T04:33:41.564Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/installation-DVzB30gM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-xauScvHOW8qtM+GFnezJ00dpkgg"',
    "mtime": "2026-03-06T04:33:42.162Z",
    "size": 38732,
    "path": "../public/assets/installation-DVzB30gM.js"
  },
  "/assets/installation-DxjsLQFF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-DmPtPXrxgTfLrYlf84dwCsG6tFE"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 20165,
    "path": "../public/assets/installation-DxjsLQFF.js"
  },
  "/assets/installation-W3CUyqyU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-2mXGze3mQrs87HW+v885N8nLmsQ"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 8335,
    "path": "../public/assets/installation-W3CUyqyU.js"
  },
  "/assets/main-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 78946,
    "path": "../public/assets/main-DU2F3XIG.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-4QtyvX_E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-XTpla35WB1o3spuLdsQF6P3TWOM"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-4QtyvX_E.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-Bn-9LeFB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-UFVoFtK8iZw5oWfhaSrmhg+fFqI"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-Bn-9LeFB.js"
  },
  "/assets/parse-BQ5oxGOI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-4geSvaomRDS7/yTh2uh++fXjwxw"',
    "mtime": "2026-03-06T04:33:42.162Z",
    "size": 55169,
    "path": "../public/assets/parse-BQ5oxGOI.js"
  },
  "/assets/parse-CvuBOgDo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-8aeaTK0NY2hXcscx89ZMU/0qMyc"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 26782,
    "path": "../public/assets/parse-CvuBOgDo.js"
  },
  "/assets/pipelines-66jCOaSo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-tTvj6A/2oWRBklj3hp1gfAXkLLw"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 37283,
    "path": "../public/assets/pipelines-66jCOaSo.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-fUhP3J6w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-pmYXQ3zGJYrKGT1yz5qCNbxcTHk"',
    "mtime": "2026-03-06T04:33:42.158Z",
    "size": 940,
    "path": "../public/assets/search-default-fUhP3J6w.js"
  },
  "/assets/static-BUXJwBmr-BLO6Pl0C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-Lhq21MvVf4PFSvfbK0ZtEx20c7Y"',
    "mtime": "2026-03-06T04:33:42.159Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-BLO6Pl0C.js"
  },
  "/assets/quickstart-CSyVLeBY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-eGDd+v9KfNjwwWj4R2GjIhzpRhY"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 24549,
    "path": "../public/assets/quickstart-CSyVLeBY.js"
  },
  "/assets/strategies-BeGE7Kdj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-iEfIp6ATkAIBnXvKgI70hj7QYb4"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 176304,
    "path": "../public/assets/strategies-BeGE7Kdj.js"
  },
  "/assets/utils-Dq0eu5MG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-B8Btgn1mxO6Sfd0r3fafcEcjnGs"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 17059,
    "path": "../public/assets/utils-Dq0eu5MG.js"
  },
  "/assets/pipeline-d1XvzZAe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-KBnpg/E7/SN6dhxT84Ngdk99Soc"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 14063,
    "path": "../public/assets/pipeline-d1XvzZAe.js"
  },
  "/assets/verify-D6G9Bolc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-Xk+xMZRW5LZtw+fnW8ykN4PSvxg"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 10601,
    "path": "../public/assets/verify-D6G9Bolc.js"
  },
  "/assets/watch-folder-SjnYnryJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-fFCT764kTbdEvGFdBU9CV5tp9R0"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-SjnYnryJ.js"
  },
  "/assets/validation-CqSGMgdT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-Cdz4NlUOYqXBo9fCUSuXRxiAuSw"',
    "mtime": "2026-03-06T04:33:42.161Z",
    "size": 21573,
    "path": "../public/assets/validation-CqSGMgdT.js"
  },
  "/assets/usage-D6Y95ld_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-BDeHpFX5SBXF+3U0cm3E62o/Jko"',
    "mtime": "2026-03-06T04:33:42.162Z",
    "size": 37282,
    "path": "../public/assets/usage-D6Y95ld_.js"
  },
  "/assets/process-directory-fnJlN71a.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-r2duc33W6jZr3hVZwjkl27pZRKs"',
    "mtime": "2026-03-06T04:33:42.160Z",
    "size": 50658,
    "path": "../public/assets/process-directory-fnJlN71a.js"
  },
  "/assets/main-C4MLHEo8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ebaef-NBJfFFkbFDf8UsSoD3iW59rkJCQ"',
    "mtime": "2026-03-06T04:33:42.163Z",
    "size": 965359,
    "path": "../public/assets/main-C4MLHEo8.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T04:33:41.627Z",
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
