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
  "/assets/_-DKdcWJDc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29fd-46yXM7h8CEMg9/fxxF3bEIDx7MQ"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 10749,
    "path": "../public/assets/_-DKdcWJDc.js"
  },
  "/CNAME": {
    "type": "text/plain; charset=utf-8",
    "etag": '"b-vMwX+cTl5yDqPfvnjJ2Kk+BC1jQ"',
    "mtime": "2026-03-06T03:52:59.807Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/artifact-format-DMoUfsqW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8d9f-qfr+W0Q2zjvqAVcFqTbLNxpZNIo"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 36255,
    "path": "../public/assets/artifact-format-DMoUfsqW.js"
  },
  "/assets/chunking-DARyusdj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-sXHiTT7kogbHESkWTdHZLc6yr7M"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 15938,
    "path": "../public/assets/chunking-DARyusdj.js"
  },
  "/assets/algolia-CfKKhsrI-BFAVkoD1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-K/jTZcVavnioALOKcnM8I22El7U"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-BFAVkoD1.js"
  },
  "/assets/enrich-records-C5vxHpZ6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d60-ABl4uJ+2r/DtUc9NS7npaOZh0fs"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 40288,
    "path": "../public/assets/enrich-records-C5vxHpZ6.js"
  },
  "/assets/config-Mr2o9Il7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-Bu0NGkPVpT/mMl8kMBp/S3lC+p8"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 66830,
    "path": "../public/assets/config-Mr2o9Il7.js"
  },
  "/assets/events-sGbS7dnP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-12mXBBVzYdpdLifXMsx7IL+YABk"',
    "mtime": "2026-03-06T03:53:00.188Z",
    "size": 17535,
    "path": "../public/assets/events-sGbS7dnP.js"
  },
  "/assets/extract-GPzD8a_t.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46e2-4U5stwo7FhP1qE9wTerP79lXOp8"',
    "mtime": "2026-03-06T03:53:00.188Z",
    "size": 18146,
    "path": "../public/assets/extract-GPzD8a_t.js"
  },
  "/assets/extract-realestate-D3yKLjnK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a074-w/9/q+/0PiQ7N+fHaEIUV7yX48o"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 41076,
    "path": "../public/assets/extract-realestate-D3yKLjnK.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/extract-RqB9qAov.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-6sNWsIKk7LRRJewrdtDjtsUqea8"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 53321,
    "path": "../public/assets/extract-RqB9qAov.js"
  },
  "/assets/index-6DUXtAzR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-VpPs8Rzu7evjD6ayRxJg7w6skVM"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 3066,
    "path": "../public/assets/index-6DUXtAzR.js"
  },
  "/assets/index-BTgDxdX8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-x92AKNzT7OASOBEqOq5IY3/xOJQ"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 2918,
    "path": "../public/assets/index-BTgDxdX8.js"
  },
  "/assets/fields-BCK3Btbs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f58-WkQLGmbBu/854xde8mbEUtD9dS4"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 73560,
    "path": "../public/assets/fields-BCK3Btbs.js"
  },
  "/assets/extract-invoice-BjwzH9Xj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b67a-nk6zFlj6ffixsWt3j+eAkBqzgUY"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 46714,
    "path": "../public/assets/extract-invoice-BjwzH9Xj.js"
  },
  "/assets/index-CU-zMau9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-Lt/6WA4CBkEjGJ7nabF18OplEe0"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 2710,
    "path": "../public/assets/index-CU-zMau9.js"
  },
  "/assets/index-BgO1KGl0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-onogWfw8Aigjxe082wuXGaBe6ow"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 1055,
    "path": "../public/assets/index-BgO1KGl0.js"
  },
  "/assets/index-DNzK1J5Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-MEDO5fFPj79VlRW3D8L6/HJoTBM"',
    "mtime": "2026-03-06T03:53:00.189Z",
    "size": 1953,
    "path": "../public/assets/index-DNzK1J5Q.js"
  },
  "/assets/index-DpfoHVnb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67bb-hltF+SGDjfSOraXcA3EoPLfQ8NE"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 26555,
    "path": "../public/assets/index-DpfoHVnb.js"
  },
  "/assets/index-EbneVyMj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3194-1bvyUZwFqY3z25sd6fa7Qbr1hPw"',
    "mtime": "2026-03-06T03:53:00.188Z",
    "size": 12692,
    "path": "../public/assets/index-EbneVyMj.js"
  },
  "/assets/index-pk0m98wj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75b6-h5XLBMAg0mqoRUY5lxQoab7RJDM"',
    "mtime": "2026-03-06T03:53:00.189Z",
    "size": 30134,
    "path": "../public/assets/index-pk0m98wj.js"
  },
  "/assets/document-parsing-COrqBrTO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e39e-Q0/I+bqmCEnZ37fjIFqykIIorlc"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 123806,
    "path": "../public/assets/document-parsing-COrqBrTO.js"
  },
  "/assets/installation-BA4yw8La.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e9a-EO0+kVmBZsmxnhojHtWuOk054/0"',
    "mtime": "2026-03-06T03:53:00.188Z",
    "size": 7834,
    "path": "../public/assets/installation-BA4yw8La.js"
  },
  "/assets/installation-CFJR49xj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4cb2-VUR4Sp3SuQJwGQ6v9O61BOxdE70"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 19634,
    "path": "../public/assets/installation-CFJR49xj.js"
  },
  "/assets/main-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 78946,
    "path": "../public/assets/main-DU2F3XIG.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/installation-Dst_oC4Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"950b-SwLLPrbZWGvgk56BbC+PUmWQLus"',
    "mtime": "2026-03-06T03:53:00.188Z",
    "size": 38155,
    "path": "../public/assets/installation-Dst_oC4Y.js"
  },
  "/assets/orama-cloud-cgTJNLo0-BkJKM0Yo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-GvZ67oQ0dgAKIoaGm5ByeNn/9TA"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-BkJKM0Yo.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-brXnbteA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-k+tCFKMvKVr1VR+9kgolI++2cds"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-brXnbteA.js"
  },
  "/assets/pipeline-CN5l9yk9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"370d-Zkrg+hkirKmTznvN/iaV+0tcMiA"',
    "mtime": "2026-03-06T03:53:00.188Z",
    "size": 14093,
    "path": "../public/assets/pipeline-CN5l9yk9.js"
  },
  "/assets/parse-BG5YcPg9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-7bm1NQLrPg4dffBqpWsd2pSOx0M"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 26782,
    "path": "../public/assets/parse-BG5YcPg9.js"
  },
  "/assets/parse-D2mGDDVs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7a0-l6H9f6/G6oKHSQP3nCk/2PWjudE"',
    "mtime": "2026-03-06T03:53:00.188Z",
    "size": 55200,
    "path": "../public/assets/parse-D2mGDDVs.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/process-directory-DMgVYJdy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5f2-4Gh7U78sbUrpz1SaQ+iMorLpOXs"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 50674,
    "path": "../public/assets/process-directory-DMgVYJdy.js"
  },
  "/assets/pipelines-CVkz73To.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-THhrH6g0Aq/qj81ehI8g/BMzKKE"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 37283,
    "path": "../public/assets/pipelines-CVkz73To.js"
  },
  "/assets/quickstart-CuU8U3ub.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5d2f-sox6KBV5nQ3tpvQRu0Pzg1W6KtY"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 23855,
    "path": "../public/assets/quickstart-CuU8U3ub.js"
  },
  "/assets/search-default-Dy3FgJVh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-9WXk3fk0+TeY2MWFmGnxMNaPYpk"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 940,
    "path": "../public/assets/search-default-Dy3FgJVh.js"
  },
  "/assets/utils-CcDAB7rX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-CXh/V9NPgxs19+W5697xmQk+21U"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 17059,
    "path": "../public/assets/utils-CcDAB7rX.js"
  },
  "/assets/static-BUXJwBmr-zNFq9mJD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-JNV7bhIg7IXv8HCQgrb6i5Cpc3Q"',
    "mtime": "2026-03-06T03:53:00.186Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-zNFq9mJD.js"
  },
  "/assets/usage-CEDxSRmE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-ymzzTMucM+9cOj+l4fihDgs5TK0"',
    "mtime": "2026-03-06T03:53:00.189Z",
    "size": 37282,
    "path": "../public/assets/usage-CEDxSRmE.js"
  },
  "/assets/validation-CoHRiTEX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"545a-A6+gYplwXPG2tGMPLyXFmvHvs5w"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 21594,
    "path": "../public/assets/validation-CoHRiTEX.js"
  },
  "/assets/verify-BBaNHs8u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-bemApC8DTrYDpRfGPF1E8tTO/i4"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 10601,
    "path": "../public/assets/verify-BBaNHs8u.js"
  },
  "/assets/watch-folder-BLdgffQh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10753-zOPs2wdBBxZ2ce1t0t766ff7Kmg"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 67411,
    "path": "../public/assets/watch-folder-BLdgffQh.js"
  },
  "/assets/strategies-CppALyY0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a3d3-robJ7QV4zlh/YJvFD1gVYCm2tmI"',
    "mtime": "2026-03-06T03:53:00.187Z",
    "size": 173011,
    "path": "../public/assets/strategies-CppALyY0.js"
  },
  "/assets/main-D81o49Q4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb1b6-XaK9OPupFblPwI8f8AwgwomTB30"',
    "mtime": "2026-03-06T03:53:00.189Z",
    "size": 962998,
    "path": "../public/assets/main-D81o49Q4.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T03:52:59.822Z",
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
