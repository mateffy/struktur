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
    "mtime": "2026-03-06T11:16:56.768Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-06T11:16:56.772Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/algolia-CfKKhsrI-Akk5T-El.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-dGWNNq8tpa4fUIFH/FS2CJzMrrE"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-Akk5T-El.js"
  },
  "/assets/artifact-format-DRybJ4GO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-17YN9XUsZ7YR3RuFvVZv2eWviJw"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-DRybJ4GO.js"
  },
  "/assets/chunking-CgkWidGf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-cg9efyKGgJ8KcD5m03HTAog/s9I"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 15938,
    "path": "../public/assets/chunking-CgkWidGf.js"
  },
  "/assets/enrich-records-D3oRL9P0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-FPK35wK5aoX4wDHaTYi92sgOe/E"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-D3oRL9P0.js"
  },
  "/assets/config-B2FaF9f7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-yAVsLUc/U2dytNdHhJxpGCDLGDs"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 66830,
    "path": "../public/assets/config-B2FaF9f7.js"
  },
  "/assets/events-D4u1OqAb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-GU6wuvkItiHTBmcWNtIFxrpSnVM"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 17535,
    "path": "../public/assets/events-D4u1OqAb.js"
  },
  "/assets/extract-dhnU0Opz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-+FEdl4eF75oA542lYQNOdxWVBfA"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 18138,
    "path": "../public/assets/extract-dhnU0Opz.js"
  },
  "/assets/extract-invoice-AsgURhtt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-WFoJq9FTulFhYt7JIP8UbjpCQMg"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-AsgURhtt.js"
  },
  "/assets/extract-realestate-O7uaevq4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-AN1Phb7qyKTo4QChQallcKKDRYE"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-O7uaevq4.js"
  },
  "/assets/fields-bQA03qiq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-UnvPkfM+m+1QqU97W+GBGbKa02M"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 73544,
    "path": "../public/assets/fields-bQA03qiq.js"
  },
  "/assets/extract-DvufvrNz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-QFeAx5ylP50rcYroJ0eFx73TqfQ"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 53321,
    "path": "../public/assets/extract-DvufvrNz.js"
  },
  "/assets/index-9nMlL7PR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-95XnQbn+zX//CKK+4p+RwaUckGY"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 2710,
    "path": "../public/assets/index-9nMlL7PR.js"
  },
  "/assets/index-BgO8aRRl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-/oZMQkUhRkS1RdbQRLWDmHysVss"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 1055,
    "path": "../public/assets/index-BgO8aRRl.js"
  },
  "/assets/document-parsing-Bc-601MA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-1zyr/r/vXvsleotfa2k23VlRbck"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-Bc-601MA.js"
  },
  "/assets/index-D0eSv5Cv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6896-EinQb25i6UE/NmzJLPQ9qiizB7E"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 26774,
    "path": "../public/assets/index-D0eSv5Cv.js"
  },
  "/assets/index-DcbfIF5d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-nNZvNOVVCMFSr3cDH6usiDmHKm4"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 2918,
    "path": "../public/assets/index-DcbfIF5d.js"
  },
  "/assets/index-CGDcCCKJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-Ts9+EVBs25S0vGdbYM7PzEo4wjY"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 3066,
    "path": "../public/assets/index-CGDcCCKJ.js"
  },
  "/assets/index-CRF8YNdT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-yuKUAILm2n61AygzZ4jCx9DJhKs"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 30163,
    "path": "../public/assets/index-CRF8YNdT.js"
  },
  "/assets/index-DgRKppf9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3354-zry/rG1McTy/EO8vtZy0i6+igKQ"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 13140,
    "path": "../public/assets/index-DgRKppf9.js"
  },
  "/assets/_-DHoPN9PP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a06-EnPUTSG+iPW6AgKhxsWMWvXgHzQ"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 10758,
    "path": "../public/assets/_-DHoPN9PP.js"
  },
  "/assets/index-FSyOkRpP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-7PliOcr57wS/LhYLk5FR2780KSU"',
    "mtime": "2026-03-06T11:16:57.295Z",
    "size": 1953,
    "path": "../public/assets/index-FSyOkRpP.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/installation-Cq7ZALxy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-HBc8SzDUD7QMYgEXJu8wJw9MnZ8"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 38732,
    "path": "../public/assets/installation-Cq7ZALxy.js"
  },
  "/assets/installation-MsiUIZFa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-wp1GT0FGaivZyZQDVTQbX/iBn7M"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 8335,
    "path": "../public/assets/installation-MsiUIZFa.js"
  },
  "/assets/installation-D8VpZsZ5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-rw67d1D2PTbLBTOIbfee1HMHu6U"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 20165,
    "path": "../public/assets/installation-D8VpZsZ5.js"
  },
  "/assets/main-CL5WYQnP.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"134c3-WZcBbqNBOyDSfOmMjfBy6eX/uno"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 79043,
    "path": "../public/assets/main-CL5WYQnP.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-CxiHQP0M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-Yci9dYBllsGYDN7XgiQlonZIMuU"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-CxiHQP0M.js"
  },
  "/assets/parse-BwoWQST9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-5S78T0LbXSd71SVJPvZheJovaNA"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 55169,
    "path": "../public/assets/parse-BwoWQST9.js"
  },
  "/assets/pipeline-Cf1DNMFN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-Zm/8DLDbehEqhCszSp2n1D4GCN8"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 14063,
    "path": "../public/assets/pipeline-Cf1DNMFN.js"
  },
  "/assets/pipelines-C270biEZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-aE0gSNOcrFkPx9eWWZS/ERctQBI"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 37283,
    "path": "../public/assets/pipelines-C270biEZ.js"
  },
  "/assets/quickstart-5rpApUwY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-eDTdhcmmxLlgjKpIkmNtMH8a7is"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 24549,
    "path": "../public/assets/quickstart-5rpApUwY.js"
  },
  "/assets/parse-CiAyQQvX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-JYquOtaiwxZmTOqQENhPUrLsxxk"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 26782,
    "path": "../public/assets/parse-CiAyQQvX.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/process-directory-do8Xlqnn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-7f+OfXZ2NouHwTTPoeWgpx8wyNk"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 50658,
    "path": "../public/assets/process-directory-do8Xlqnn.js"
  },
  "/assets/search-default-CoW5Hdtz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-jFMPQVI7my4LGIzk5ql4Dvc+ldY"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 940,
    "path": "../public/assets/search-default-CoW5Hdtz.js"
  },
  "/assets/orama-cloud-cgTJNLo0-Bcqulj0k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-e4PbuyByuY1uEIUixJ09u3GevxY"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-Bcqulj0k.js"
  },
  "/assets/static-BUXJwBmr-BfYAE4TY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-M9og1+aNSFUANYHG+nNWUhpIDPM"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-BfYAE4TY.js"
  },
  "/assets/validation-BcaEE_s1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-n2uL05uRsxmYn2TSxPvnBAmPT3c"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 21573,
    "path": "../public/assets/validation-BcaEE_s1.js"
  },
  "/assets/strategies-dA2msyrf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-Tg0iZe9zReNFovF5J/kcdZ6kwBA"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 176304,
    "path": "../public/assets/strategies-dA2msyrf.js"
  },
  "/assets/usage-DfZPgYT5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-UgVrX8CEt5jZkV3IqNodZVwEXxI"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 37282,
    "path": "../public/assets/usage-DfZPgYT5.js"
  },
  "/assets/verify-x2qB7MCU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-6PV5L0C8IHZ5yGLpJFRFzmvaL2Y"',
    "mtime": "2026-03-06T11:16:57.293Z",
    "size": 10601,
    "path": "../public/assets/verify-x2qB7MCU.js"
  },
  "/assets/watch-folder-Bdj2_0fU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-0E12LSNLYrNfSwvcNWyxj4gG3VI"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-Bdj2_0fU.js"
  },
  "/assets/utils-PpA-e92z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-GfJl9C8bCPfGkRPav27fQsMDoG8"',
    "mtime": "2026-03-06T11:16:57.294Z",
    "size": 17059,
    "path": "../public/assets/utils-PpA-e92z.js"
  },
  "/assets/main-BBkh42Md.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ebaef-6dmt2AVJ/PZRIHSg6jVn76YBfDE"',
    "mtime": "2026-03-06T11:16:57.295Z",
    "size": 965359,
    "path": "../public/assets/main-BBkh42Md.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T11:16:56.800Z",
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
const _8C1ftW = defineHandler((event) => {
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
const _lazy_3PHP1n = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return ssrRenderer$1;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_3PHP1n };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_8C1ftW)
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
