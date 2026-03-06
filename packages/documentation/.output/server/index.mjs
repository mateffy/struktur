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
    "mtime": "2026-03-06T19:19:53.052Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/algolia-CfKKhsrI-B0-TcDv0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-kFSmLpBOzzC4FjBAU3WtjraJAOM"',
    "mtime": "2026-03-06T19:19:53.641Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-B0-TcDv0.js"
  },
  "/assets/_-DmZEOA0N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a06-m7bQzn4t4Ul4FyjFvCQ+Ym+B4UY"',
    "mtime": "2026-03-06T19:19:53.641Z",
    "size": 10758,
    "path": "../public/assets/_-DmZEOA0N.js"
  },
  "/assets/artifact-format-DxpF8Lgo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-mdAAEQ/SmOrG/fsJgnukPXkkiBY"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-DxpF8Lgo.js"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-06T19:19:53.059Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/config-XoZ-lHS6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-vk0C/0ndD4kLTqWgRl/wuUMBSR8"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 66830,
    "path": "../public/assets/config-XoZ-lHS6.js"
  },
  "/assets/document-parsing-BEnMDeQt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-hdx97Z+Ra0Nwy5UmDgvL7fOrT7o"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-BEnMDeQt.js"
  },
  "/assets/chunking-ClPDkepO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-riJCjNk2LuzR8SJY96e1sFeS1kA"',
    "mtime": "2026-03-06T19:19:53.647Z",
    "size": 15938,
    "path": "../public/assets/chunking-ClPDkepO.js"
  },
  "/assets/enrich-records-CLWiF6_2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-iXWK9gPsUc3K1NwPnzwYpY16G4o"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-CLWiF6_2.js"
  },
  "/assets/events-DycsPMJM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-yxhGZM1eJ5ij5JWa+y8dl2lO0Cc"',
    "mtime": "2026-03-06T19:19:53.647Z",
    "size": 17535,
    "path": "../public/assets/events-DycsPMJM.js"
  },
  "/assets/extract-DJc7IZ8I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-w/yV02SCkU2EFP/Z16IlQ3iyos0"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 53321,
    "path": "../public/assets/extract-DJc7IZ8I.js"
  },
  "/assets/extract-DpFAyip-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-/Fb5CJBntDG8YJCjBYE0wAoaPC4"',
    "mtime": "2026-03-06T19:19:53.646Z",
    "size": 18138,
    "path": "../public/assets/extract-DpFAyip-.js"
  },
  "/assets/extract-invoice-KySwWapi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-Ld7Mu/6lSjPAHxdaSwAoyK02mYI"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-KySwWapi.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/extract-realestate-CQnsIqb4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-00cgceSBa//S0pUdX8yOEKqhW7E"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-CQnsIqb4.js"
  },
  "/assets/index-0TunRJGw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-PPKvoavlq9VKwQ2KdpdLDdzyamE"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 3066,
    "path": "../public/assets/index-0TunRJGw.js"
  },
  "/assets/index-BQ4u9BZm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-k1M1FHWce5gpc/rcBsh8KQGEb5w"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 2710,
    "path": "../public/assets/index-BQ4u9BZm.js"
  },
  "/assets/fields-oWjm5jhH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-3Iw/V3wxbY+Ml1htbfCEhaqqFZQ"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 73544,
    "path": "../public/assets/fields-oWjm5jhH.js"
  },
  "/assets/index-COsePmD1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3354-nekSKDc3KpkqvB+bV14W7hs61OM"',
    "mtime": "2026-03-06T19:19:53.646Z",
    "size": 13140,
    "path": "../public/assets/index-COsePmD1.js"
  },
  "/assets/index-B5OCwlmE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-L5TiONWIk3sESapxT1FEGVe7xes"',
    "mtime": "2026-03-06T19:19:53.641Z",
    "size": 1055,
    "path": "../public/assets/index-B5OCwlmE.js"
  },
  "/assets/index-CfslDBga.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-5PtKzBsG1V0AvD5umDr9O+Mte3Q"',
    "mtime": "2026-03-06T19:19:53.646Z",
    "size": 30163,
    "path": "../public/assets/index-CfslDBga.js"
  },
  "/assets/index-DzUOu1IR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6896-dP2L4qtq1DpPcUSMw9+uArkc3g4"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 26774,
    "path": "../public/assets/index-DzUOu1IR.js"
  },
  "/assets/index-vdP9GJsN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-oZvKVqDH2kL+UYp9Ig/BY0N9cRA"',
    "mtime": "2026-03-06T19:19:53.646Z",
    "size": 1953,
    "path": "../public/assets/index-vdP9GJsN.js"
  },
  "/assets/index-DLAxQQQh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-980kokRNJoJDpQMHeLWUTuOJf+g"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 2918,
    "path": "../public/assets/index-DLAxQQQh.js"
  },
  "/assets/installation-DWw-yRR6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-gSdmzfgLJ3pxVzYX7abhVf4bWEY"',
    "mtime": "2026-03-06T19:19:53.646Z",
    "size": 8335,
    "path": "../public/assets/installation-DWw-yRR6.js"
  },
  "/assets/installation-GINIAYCp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-Bpsrorw6HAaL9KfnnbTJ3ioL3aI"',
    "mtime": "2026-03-06T19:19:53.647Z",
    "size": 38732,
    "path": "../public/assets/installation-GINIAYCp.js"
  },
  "/assets/installation-B4FvtA_J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-U4FgomDskOsUw1jqLYj945SZRPM"',
    "mtime": "2026-03-06T19:19:53.646Z",
    "size": 20165,
    "path": "../public/assets/installation-B4FvtA_J.js"
  },
  "/assets/main-CL5WYQnP.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"134c3-WZcBbqNBOyDSfOmMjfBy6eX/uno"',
    "mtime": "2026-03-06T19:19:53.641Z",
    "size": 79043,
    "path": "../public/assets/main-CL5WYQnP.css"
  },
  "/assets/orama-cloud-cgTJNLo0-D0-Uw0Tx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-6F8SnAa5rAWAL7ZF16ubp3qLrfE"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-D0-Uw0Tx.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T19:19:53.641Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/parse-CuRpkt7g.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-7ER5s2iCrqBhzbpCcM2BIGUxjb8"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 26782,
    "path": "../public/assets/parse-CuRpkt7g.js"
  },
  "/assets/pipeline-BLAiYAbM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-U2ICKbssGghJ6lyUKNxoHeJrrIA"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 14063,
    "path": "../public/assets/pipeline-BLAiYAbM.js"
  },
  "/assets/parse-D8xq75I6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-xXHxczNtSGVgBg0lAr6BHHNdlVE"',
    "mtime": "2026-03-06T19:19:53.646Z",
    "size": 55169,
    "path": "../public/assets/parse-D8xq75I6.js"
  },
  "/assets/pipelines-D2Qtv3T5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-uC5PHd6OOgTfHU9mRXeKGWrJmXU"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 37283,
    "path": "../public/assets/pipelines-D2Qtv3T5.js"
  },
  "/assets/quickstart-0JZNMRzl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-EFJehZWOg2Sr+f4Xh0PdCdHsPvw"',
    "mtime": "2026-03-06T19:19:53.646Z",
    "size": 24549,
    "path": "../public/assets/quickstart-0JZNMRzl.js"
  },
  "/assets/process-directory-C4WniR6u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-eoASyVVwrUrWCNMMmO+9kYD1bV8"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 50658,
    "path": "../public/assets/process-directory-C4WniR6u.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T19:19:53.641Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/static-BUXJwBmr-D_mpca1Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-kyubedW+ddo7BWL44qMOe2MJjXc"',
    "mtime": "2026-03-06T19:19:53.645Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-D_mpca1Q.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-CEkG1at4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-CWYSCzK9JjPe4qiGvNVAyB6y8GA"',
    "mtime": "2026-03-06T19:19:53.641Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-CEkG1at4.js"
  },
  "/assets/search-default-C-A3cZrI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-FHuc6NWfjdhn+fQab42k23m4O5k"',
    "mtime": "2026-03-06T19:19:53.645Z",
    "size": 940,
    "path": "../public/assets/search-default-C-A3cZrI.js"
  },
  "/assets/strategies-B3N_QKVJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-8va1VmnMk4KOmDJWARO2D7/76+Y"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 176304,
    "path": "../public/assets/strategies-B3N_QKVJ.js"
  },
  "/assets/usage-BjeGeOZm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-DkXfdbxx2XvGVZ0fjTGCQ/n4a1g"',
    "mtime": "2026-03-06T19:19:53.647Z",
    "size": 37282,
    "path": "../public/assets/usage-BjeGeOZm.js"
  },
  "/assets/utils-DjJULrrq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-jgnv+QqGIHRpmZuFxt3YxuSUwX4"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 17059,
    "path": "../public/assets/utils-DjJULrrq.js"
  },
  "/assets/validation-qOFIHgLk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-uNP2Sp931IVmLCGCbY3QkJfvgGM"',
    "mtime": "2026-03-06T19:19:53.645Z",
    "size": 21573,
    "path": "../public/assets/validation-qOFIHgLk.js"
  },
  "/assets/verify-DZTQOnPd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-JWtY0gHtvBf2VYyVCm+EG2tvmhU"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 10601,
    "path": "../public/assets/verify-DZTQOnPd.js"
  },
  "/assets/watch-folder-BmZeThFV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-GDiiTykw4lH+8ZquV2C5GfKl8SU"',
    "mtime": "2026-03-06T19:19:53.642Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-BmZeThFV.js"
  },
  "/assets/main-B1WqklZV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ebc28-aCSaNMUcEWyJ/dX17vlJyvjJ6F0"',
    "mtime": "2026-03-06T19:19:53.648Z",
    "size": 965672,
    "path": "../public/assets/main-B1WqklZV.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T19:19:53.168Z",
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
