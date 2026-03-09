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
    "mtime": "2026-03-09T14:18:30.645Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-03-09T14:18:30.649Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/assets/_-gi13yE7g.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a10-qu2biM2oIXb4HJD+gyXJLjgFzWU"',
    "mtime": "2026-03-09T14:18:31.140Z",
    "size": 10768,
    "path": "../public/assets/_-gi13yE7g.js"
  },
  "/assets/algolia-CfKKhsrI-D_gWjsml.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-yyOdNmCgIx03qqECovIjXiySWiU"',
    "mtime": "2026-03-09T14:18:31.140Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-D_gWjsml.js"
  },
  "/assets/chunking-wSm1D9-F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-BU8+7FICLP/ZI95IVn0dtJrNB3s"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 15938,
    "path": "../public/assets/chunking-wSm1D9-F.js"
  },
  "/assets/artifact-format-CdM75lv4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-qu/EULSW/XTybzjIaU56NfKxeIk"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-CdM75lv4.js"
  },
  "/assets/config-BDMtdlok.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f5ee-DO685iVSB2jILHk+v3XoXVJDx5M"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 62958,
    "path": "../public/assets/config-BDMtdlok.js"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-09T14:18:30.648Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/enrich-records-BsutmbdX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-qteDUztlzf1IIesSwkUx5Wz0s9Q"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-BsutmbdX.js"
  },
  "/assets/events-CHIhQW-l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"459b-vojnNpQpWb3BKoy32yV5g7beEt4"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 17819,
    "path": "../public/assets/events-CHIhQW-l.js"
  },
  "/assets/extract-CVwb3vvR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-ofTjvpvETfk3ztaeTdcFkoHQDLY"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 16745,
    "path": "../public/assets/extract-CVwb3vvR.js"
  },
  "/assets/extract-Cv5T9aYu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"adf8-RTaokwAcWEpCeoIz1MLPV3OXzTE"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 44536,
    "path": "../public/assets/extract-Cv5T9aYu.js"
  },
  "/assets/extract-invoice-Cd9RMxPT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-vCazdeOKYi1pn1WU07f8+gdavUQ"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-Cd9RMxPT.js"
  },
  "/assets/document-parsing-B13Vsvrg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-nIr1IlnRUKWFlOJerjc8Ywub1ro"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-B13Vsvrg.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-09T14:18:31.140Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/extract-realestate-Cj0TOCf8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-gUlUvdIzmi0iTllxc1wbC/7okOc"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-Cj0TOCf8.js"
  },
  "/assets/index-BSecE23L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-zw/LGH4+nKpEFJ6ZpaKrRF7oKKA"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 3192,
    "path": "../public/assets/index-BSecE23L.js"
  },
  "/assets/index-BbtvnRQJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-fT0lEF+WSWV+AS0RIDU8XIUKcRg"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 13717,
    "path": "../public/assets/index-BbtvnRQJ.js"
  },
  "/assets/index-Bmq3oUSB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-bn1YqC5hlpyUVPHTx8iC+TFXIUs"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 1055,
    "path": "../public/assets/index-Bmq3oUSB.js"
  },
  "/assets/fields-0kBlRarz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-F4XUilMnAwbJoLUjSICQpi/Xfv4"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 74441,
    "path": "../public/assets/fields-0kBlRarz.js"
  },
  "/assets/index-C2LG_ghK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-I9JCnqk0lMOSANyJhSzlwZehAIc"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 37570,
    "path": "../public/assets/index-C2LG_ghK.js"
  },
  "/assets/index-DwOtras_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-XsdleBO8E8X1TNToLOJtyML0UfY"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 3329,
    "path": "../public/assets/index-DwOtras_.js"
  },
  "/assets/index-t2qjuwFB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-kNob3OCxclZ00faWjN8wHiFh1f0"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 2075,
    "path": "../public/assets/index-t2qjuwFB.js"
  },
  "/assets/index-CBJnJf_X.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cc2-XJt3bjnUgC79IibCfHcXkunoUDI"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 3266,
    "path": "../public/assets/index-CBJnJf_X.js"
  },
  "/assets/index-uKj7iLvS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"667b-orgavcnvloWAvJG5/HntFYOCw6Q"',
    "mtime": "2026-03-09T14:18:31.140Z",
    "size": 26235,
    "path": "../public/assets/index-uKj7iLvS.js"
  },
  "/assets/installation-4wicuzlt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"526b-qCLIPycNkeddEKJ9snQa6YJuA24"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 21099,
    "path": "../public/assets/installation-4wicuzlt.js"
  },
  "/assets/installation-BdYCpIx2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-sREZqNfjE8wa+uU2ZIJSW9NuID4"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 38319,
    "path": "../public/assets/installation-BdYCpIx2.js"
  },
  "/assets/installation-CAH8MfnE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-0bqWQB2nDbQH7n6ZpxhAd+/c7rg"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 9453,
    "path": "../public/assets/installation-CAH8MfnE.js"
  },
  "/assets/main-D8eF2mp1.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13d4b-LNnsaUO+YtbsQwGou4AesQEXx7c"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 81227,
    "path": "../public/assets/main-D8eF2mp1.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-B4-POII2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-dD4r84Gx+yCQphaCmRc62Yk27yE"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-B4-POII2.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-Bux1Mjsq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-IyHQePeixa1BJ/gRLAdsFQKaGWg"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-Bux1Mjsq.js"
  },
  "/assets/parse-OgFiYZRt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-/Z5ezTl8fCZz+pFtT785XtxCjIA"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 55169,
    "path": "../public/assets/parse-OgFiYZRt.js"
  },
  "/assets/parse-aIw7Tx4J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6097-km782/Tg/32BZD3QVc5JN+lKs+c"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 24727,
    "path": "../public/assets/parse-aIw7Tx4J.js"
  },
  "/assets/pipeline-B8dHPpSe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-ZTu35NVbmqUdOAP/BCu6PlVqLss"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 14066,
    "path": "../public/assets/pipeline-B8dHPpSe.js"
  },
  "/assets/process-directory-Cx2pwPHk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-+yycBBqUCajHm7WkWrIQrKHqtR8"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 50658,
    "path": "../public/assets/process-directory-Cx2pwPHk.js"
  },
  "/assets/pipelines-DMgXim5b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-4RdDYY4sQYRYOz+0fwmLJWSrpus"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 37283,
    "path": "../public/assets/pipelines-DMgXim5b.js"
  },
  "/assets/quickstart-DXqhgP6c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-9ZndNMuzmMKrg9v5tqhEbCfTiyU"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 25396,
    "path": "../public/assets/quickstart-DXqhgP6c.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-Bx7Irvlc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ae-Lr8xQcT4mgwO5VgtRzj99pIlXE8"',
    "mtime": "2026-03-09T14:18:31.140Z",
    "size": 942,
    "path": "../public/assets/search-default-Bx7Irvlc.js"
  },
  "/assets/static-BUXJwBmr-B6OMONVA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-fxmC5Bt/QpJZL4+HJ4hTvCIvszI"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-B6OMONVA.js"
  },
  "/assets/usage-DzkHMf-8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-8jWJ3YfpD73bhvdDXJhGBqkzx8M"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 36829,
    "path": "../public/assets/usage-DzkHMf-8.js"
  },
  "/assets/utils-Bh9nzf6y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-uMcpOWj7ElZZI/0f+Y89T+Aak2g"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 16903,
    "path": "../public/assets/utils-Bh9nzf6y.js"
  },
  "/assets/strategies-DZ0h-DkW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14ed8-1BM0dDl8BY99qwDJ+zZd77JArbM"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 85720,
    "path": "../public/assets/strategies-DZ0h-DkW.js"
  },
  "/assets/validation-C6BG3GUm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-dk69ooU/KgqVx9WpZ4JZltc80lA"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 21573,
    "path": "../public/assets/validation-C6BG3GUm.js"
  },
  "/assets/verify-CvwWts9x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-/t+P721+pzxm8M2vq5OJ6ZkN/XU"',
    "mtime": "2026-03-09T14:18:31.141Z",
    "size": 10017,
    "path": "../public/assets/verify-CvwWts9x.js"
  },
  "/assets/watch-folder-XnnS3LRx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-SULnokjX3zYLY87I3Nn9DlmTy/k"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-XnnS3LRx.js"
  },
  "/assets/main-e151ojzu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f2442-K1bACksruxWotVeRLDCj/loYfHI"',
    "mtime": "2026-03-09T14:18:31.142Z",
    "size": 992322,
    "path": "../public/assets/main-e151ojzu.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-09T14:18:30.684Z",
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
const _vIIWfr = defineHandler((event) => {
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
const _lazy_TVmBjJ = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return ssrRenderer$1;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_TVmBjJ };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_vIIWfr)
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
