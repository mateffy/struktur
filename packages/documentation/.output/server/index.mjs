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
    "mtime": "2026-03-06T04:42:10.068Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/algolia-CfKKhsrI-ieVBorPD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-WpnZ4akbyvJh4Gn6xGTbCR3kfiM"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-ieVBorPD.js"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-06T04:42:10.069Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/chunking-BvfzVrom.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-iCwyDFw99J/Bn7gKUBFUG1+6Gsw"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 15938,
    "path": "../public/assets/chunking-BvfzVrom.js"
  },
  "/assets/artifact-format-Br4FqIc9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-uCIaiUrEcPrYMtQ1Kr4DuMSI2Ak"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-Br4FqIc9.js"
  },
  "/assets/_-DBf4AILT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a06-SN2wBOfC1kw/g5LntGAVDE7oFB8"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 10758,
    "path": "../public/assets/_-DBf4AILT.js"
  },
  "/assets/config-CoSa9JTN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-L1adksj+Z3tP6f1vSToGsrC7xuc"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 66830,
    "path": "../public/assets/config-CoSa9JTN.js"
  },
  "/assets/enrich-records-DIKTl8y6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-9QM75jOt+h4ZTUXz2rgnFvG1Vxg"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-DIKTl8y6.js"
  },
  "/assets/document-parsing-C6PmiYDq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-xWcjbtiQcQtoawIogTxURZdqqbA"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-C6PmiYDq.js"
  },
  "/assets/events-DxkuqXMA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-4Xpzthe1Ztn+ohtD0B/FjqUCznE"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 17535,
    "path": "../public/assets/events-DxkuqXMA.js"
  },
  "/assets/extract-Ce9GyT3-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-urD3TBZe7XhajacRpGMAZELBDB4"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 18138,
    "path": "../public/assets/extract-Ce9GyT3-.js"
  },
  "/assets/extract-NgHA2YUs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-kzYBUumxnIyz6PIu2W68VhRCTgA"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 53321,
    "path": "../public/assets/extract-NgHA2YUs.js"
  },
  "/assets/extract-invoice-CZMq8dYY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-bn+sMnhcB+IzAZQLVIeD/rzERFw"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-CZMq8dYY.js"
  },
  "/assets/extract-realestate-Cdv82h6X.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-SCCHWYkFN1JnjS9JC3m5B4gl6EM"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-Cdv82h6X.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/index-BpNaCG60.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-6mfaAG+Q2570nNHlT+Z/5cb62XI"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 2918,
    "path": "../public/assets/index-BpNaCG60.js"
  },
  "/assets/index-9JWxfyUL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67ab-DqJnoxWgNxXNUHt6fJ3OHRWfW3E"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 26539,
    "path": "../public/assets/index-9JWxfyUL.js"
  },
  "/assets/index-CZe5xjSI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-z7PzBOqPHtTOvHDQNC4c7sfiDRI"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 2710,
    "path": "../public/assets/index-CZe5xjSI.js"
  },
  "/assets/fields-CbX6gXzm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-MhNjezN/EvqaYsnJc35CJMi4eu0"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 73544,
    "path": "../public/assets/fields-CbX6gXzm.js"
  },
  "/assets/index-CgF3tIj6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-vnRdH/TW5CpGeIE6/Y97TAWcAgQ"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 30163,
    "path": "../public/assets/index-CgF3tIj6.js"
  },
  "/assets/index-Dr3dNcbV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-0Zz0z8ce75MG9kHI7RNkAPFahKY"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 1953,
    "path": "../public/assets/index-Dr3dNcbV.js"
  },
  "/assets/index-PGH-SdVN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3354-3LbBDS8dzTlrwirx3wPNGnEVclU"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 13140,
    "path": "../public/assets/index-PGH-SdVN.js"
  },
  "/assets/index-ejYpqS1Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-t95XUDaliR9oWBtDQgCIvf1apQc"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 1055,
    "path": "../public/assets/index-ejYpqS1Q.js"
  },
  "/assets/index-h1SxAZur.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-fWwi6lL41uocGzJWcoPUBI6pU9M"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 3066,
    "path": "../public/assets/index-h1SxAZur.js"
  },
  "/assets/installation-5siFu4wf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-tb9dHvBHAYLED1P4xH1b0mgHnkE"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 38732,
    "path": "../public/assets/installation-5siFu4wf.js"
  },
  "/assets/installation-D1FDVWss.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-ns+x5vbyuDo2s6Hx3gpbJ1KMxGc"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 8335,
    "path": "../public/assets/installation-D1FDVWss.js"
  },
  "/assets/installation-eeFS4D_u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-GV+OngvR9sg7AMsTE6v7xXM8btM"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 20165,
    "path": "../public/assets/installation-eeFS4D_u.js"
  },
  "/assets/main-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 78946,
    "path": "../public/assets/main-DU2F3XIG.css"
  },
  "/assets/orama-cloud-cgTJNLo0-27WH3e9W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-Ub9t1lx4mgvu0jPSzztyRQX7T9s"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-27WH3e9W.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-CGYwZQIL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-x9aH8Vp6ni5V2oTb0EvwlEBg4n8"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-CGYwZQIL.js"
  },
  "/assets/parse-Bx7TWR3a.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-g4uPBbqtwe9VQuNGInnaQP38T5Y"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 26782,
    "path": "../public/assets/parse-Bx7TWR3a.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/parse-CuydLKMP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-ISf+bNh48OJEaRpmRjl93Ckvn2A"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 55169,
    "path": "../public/assets/parse-CuydLKMP.js"
  },
  "/assets/pipeline-CxQT--Qs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-xLmYc4CdZv7eDWx45/GqOiZPpbM"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 14063,
    "path": "../public/assets/pipeline-CxQT--Qs.js"
  },
  "/assets/pipelines-fHl_OLeD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-KvO94enrThOSsCflz22aRIHoTQs"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 37283,
    "path": "../public/assets/pipelines-fHl_OLeD.js"
  },
  "/assets/process-directory-Csh4f2Me.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-gpTmi4cY3oaUKkR0UKb9WvJjuFQ"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 50658,
    "path": "../public/assets/process-directory-Csh4f2Me.js"
  },
  "/assets/quickstart-Cdg9igEf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-n3oSvms2SkRHctBbtBLIKdurscE"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 24549,
    "path": "../public/assets/quickstart-Cdg9igEf.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-Dc8PJcJk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-Exy3tpI/8oAgjYJLlJIgwqkoumA"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 940,
    "path": "../public/assets/search-default-Dc8PJcJk.js"
  },
  "/assets/static-BUXJwBmr-so5e-m3e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-HF4HAxUjinECP4rVaWwI+4xQBf8"',
    "mtime": "2026-03-06T04:42:10.440Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-so5e-m3e.js"
  },
  "/assets/usage-DuA6HVj2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-hTBalhupYGAEcjimP8rkCa3tozY"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 37282,
    "path": "../public/assets/usage-DuA6HVj2.js"
  },
  "/assets/utils-DaVceXnb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-MqCdruHNhz1l9FgLrzn56k+19Bc"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 17059,
    "path": "../public/assets/utils-DaVceXnb.js"
  },
  "/assets/validation-DnShHamc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-lgFFOFTZCr7YGtcKiNlMLY9s0Lc"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 21573,
    "path": "../public/assets/validation-DnShHamc.js"
  },
  "/assets/verify-CfafHe5L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-5EabZ7LfqCMRvlVcQT2OWLViiOw"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 10601,
    "path": "../public/assets/verify-CfafHe5L.js"
  },
  "/assets/strategies-DEP_-0pb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-IUTiZgDvnR1Qy1nTbaPirox6dWU"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 176304,
    "path": "../public/assets/strategies-DEP_-0pb.js"
  },
  "/assets/watch-folder-BR53119r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-XkEdAxS7n0WeAbRjme9oomIcTe8"',
    "mtime": "2026-03-06T04:42:10.441Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-BR53119r.js"
  },
  "/assets/main-DzeYAW1S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ebaef-kXNhXFtAh1/NPfeZIe62cTNzpLo"',
    "mtime": "2026-03-06T04:42:10.442Z",
    "size": 965359,
    "path": "../public/assets/main-DzeYAW1S.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T04:42:10.096Z",
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
