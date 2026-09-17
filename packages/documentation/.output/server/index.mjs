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
    "mtime": "2026-09-17T16:15:43.066Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-09-17T16:15:43.067Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-09-17T16:15:43.067Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/assets/_-BAEnonTe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-mAn4V79+BF4Q7lzujEoJrBgmRBw"',
    "mtime": "2026-09-17T16:15:43.561Z",
    "size": 410,
    "path": "../public/assets/_-BAEnonTe.js"
  },
  "/assets/_-f4RVa4ko.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-ij6KP8QWbuVPXXYfwRty4dGudso"',
    "mtime": "2026-09-17T16:15:43.561Z",
    "size": 410,
    "path": "../public/assets/_-f4RVa4ko.js"
  },
  "/assets/_-CuOlDnVd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d-dOpDX/MUc1LK9Tlm4T90mnNXIK0"',
    "mtime": "2026-09-17T16:15:43.561Z",
    "size": 413,
    "path": "../public/assets/_-CuOlDnVd.js"
  },
  "/assets/algolia-CfKKhsrI-CCBReHXg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-kowvcWTUkZK7kQ/MqffcbOPlto0"',
    "mtime": "2026-09-17T16:15:43.561Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-CCBReHXg.js"
  },
  "/assets/agent-vs-simple-vs-parallel-B1Y-d9Pj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11919-iqKHTCJQ1NAAlq5q/1MuSPgZqfc"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 71961,
    "path": "../public/assets/agent-vs-simple-vs-parallel-B1Y-d9Pj.js"
  },
  "/assets/artifact-format-B68R07nT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10ca4-x7OB+2VE9grp+MM/wglGKHQRUWc"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 68772,
    "path": "../public/assets/artifact-format-B68R07nT.js"
  },
  "/assets/building-autonomous-extraction-agent-DjqXnB5S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d1d2-lxsjxJNqs+eBW0A1EpQSVXEvMZg"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 53714,
    "path": "../public/assets/building-autonomous-extraction-agent-DjqXnB5S.js"
  },
  "/assets/chunking-CJ4it6zi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-8S5GzY8xldwQFoLWwv6kzHn8yYo"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 15938,
    "path": "../public/assets/chunking-CJ4it6zi.js"
  },
  "/assets/docker-BOM5WwgE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9e6a-a6KpstrQv+Kbp9tFNod4qxBgkbQ"',
    "mtime": "2026-09-17T16:15:43.565Z",
    "size": 40554,
    "path": "../public/assets/docker-BOM5WwgE.js"
  },
  "/assets/chunking-validation-retries-CH6foIhq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11fee-7rYLYrAQKjPlAeQIfN0OZ+rfGBE"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 73710,
    "path": "../public/assets/chunking-validation-retries-CH6foIhq.js"
  },
  "/assets/enrich-records-BpxAI2f-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-AM8mz08K+IWyIZkDecG/xjI8Izc"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-BpxAI2f-.js"
  },
  "/assets/events-nzGeJY0r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a9a1-SHuUTjsSA6xmllycefvSxvi6g2c"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 43425,
    "path": "../public/assets/events-nzGeJY0r.js"
  },
  "/assets/document-parsing-DjiI6MqD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"20ad9-7BMxJ/LI6qY3eJ7EtRipGSS1UwQ"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 133849,
    "path": "../public/assets/document-parsing-DjiI6MqD.js"
  },
  "/assets/extract-Du_IJKVg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fe66-Vi4/WPWOPKoa/tmR4Vx8/JniX3c"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 65126,
    "path": "../public/assets/extract-Du_IJKVg.js"
  },
  "/assets/extract-invoice-D6nbZjL4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-MVvMoV28VZRxkr0ocv069tL6T7M"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-D6nbZjL4.js"
  },
  "/assets/extract-vkCfx5cT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-pdc5AgEgA04OZmX52ehwuO59+z4"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 16745,
    "path": "../public/assets/extract-vkCfx5cT.js"
  },
  "/assets/extract-realestate-CsY_kTw4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-JRlJzTu1qxy0LPd/UBtp74/USeU"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-CsY_kTw4.js"
  },
  "/assets/extracting-invoices-at-scale-B8VuZKZ7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17232-M0pxNK0AnZcr5LGtSzK0YOY3upI"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 94770,
    "path": "../public/assets/extracting-invoices-at-scale-B8VuZKZ7.js"
  },
  "/assets/config-CsVt3j7s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10030-CRs0Pe5rR9ka9WrnRWnqchpAaCg"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 65584,
    "path": "../public/assets/config-CsVt3j7s.js"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-09-17T16:15:43.067Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-09-17T16:15:43.068Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/assets/fields-CwnN6DoK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-IG7OOIrU7+8Xh3SVQ/nrSGD48rs"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 74441,
    "path": "../public/assets/fields-CwnN6DoK.js"
  },
  "/assets/index-BNpWJ9z_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-2G1TX/K25No6QzACGTeoh7AuQTw"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 37570,
    "path": "../public/assets/index-BNpWJ9z_.js"
  },
  "/assets/index-CiBYXS8F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-aBA93l8+kRtIGKCJHK8J3OBOjfQ"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 1055,
    "path": "../public/assets/index-CiBYXS8F.js"
  },
  "/assets/index-CRa2ZjHP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-a7hbNd6fmeHHYDI+Y+EvZ4Peaak"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 2075,
    "path": "../public/assets/index-CRa2ZjHP.js"
  },
  "/assets/index-CuqovQBi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-mccUu8jKvLnq+a9138JmElIGimE"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 3736,
    "path": "../public/assets/index-CuqovQBi.js"
  },
  "/assets/index-BuTmQhFv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28e1-tldGtDSq6ncp840KI8Rh6PLWUNM"',
    "mtime": "2026-09-17T16:15:43.561Z",
    "size": 10465,
    "path": "../public/assets/index-BuTmQhFv.js"
  },
  "/assets/index-DCeIsvYY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-2QYl1pYjOj2hgAhKTouYBhBxYX4"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 3192,
    "path": "../public/assets/index-DCeIsvYY.js"
  },
  "/assets/index-NwV0W5Uc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-W7N2UKMSOy9cbPtdtQH1mBEFpKU"',
    "mtime": "2026-09-17T16:15:43.565Z",
    "size": 13717,
    "path": "../public/assets/index-NwV0W5Uc.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/index-jEOxhmZO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-tSaFAfb71Uo+k8bhWs7eNbL+Eeg"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 3329,
    "path": "../public/assets/index-jEOxhmZO.js"
  },
  "/assets/index-zvdgdEst.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2af6-Uv4212zjzq/Z5P6lVPncX2bG6Ow"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 10998,
    "path": "../public/assets/index-zvdgdEst.js"
  },
  "/assets/installation-vwz2mlEw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"61f9-ZGbeyoHpuo5aI+egBeOFmEBSfZc"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 25081,
    "path": "../public/assets/installation-vwz2mlEw.js"
  },
  "/assets/installation-CGse3xQp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-b1TVS3YxUvBcY4q2km6cBPUMuW8"',
    "mtime": "2026-09-17T16:15:43.565Z",
    "size": 9453,
    "path": "../public/assets/installation-CGse3xQp.js"
  },
  "/assets/installation-DiTCH_2x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-EOxSzEAqKBuRe4F5v5J+dc7L9fM"',
    "mtime": "2026-09-17T16:15:43.565Z",
    "size": 38319,
    "path": "../public/assets/installation-DiTCH_2x.js"
  },
  "/assets/llamaindex-eRfpCZA4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"753a-buVuDH5i2rEkmr4wWtQ0iyDomyw"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 30010,
    "path": "../public/assets/llamaindex-eRfpCZA4.js"
  },
  "/assets/main-Dz2EFaUk.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"14c20-5S2y9n56cG0DRUIRUpDTV8pF+TI"',
    "mtime": "2026-09-17T16:15:43.559Z",
    "size": 85024,
    "path": "../public/assets/main-Dz2EFaUk.css"
  },
  "/assets/manual-llm-calls-DLoYm0fJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b47d-QIop3AnSgitDxSqHqYP3vylw7vk"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 111741,
    "path": "../public/assets/manual-llm-calls-DLoYm0fJ.js"
  },
  "/assets/index-BdLa_Jsq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5b99-e7+paJnsI2JclIxMroyrJ4/xLOs"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 23449,
    "path": "../public/assets/index-BdLa_Jsq.js"
  },
  "/assets/orama-cloud-cgTJNLo0-QfmYCICg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-XtLM7W/xPevIZePkGyEGioeSP54"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-QfmYCICg.js"
  },
  "/assets/models-and-providers-e-QZdXmS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dbc9-wIAqBK9QV7FHusPsgXAe8MF2A/Q"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 56265,
    "path": "../public/assets/models-and-providers-e-QZdXmS.js"
  },
  "/assets/instructor-m49hSoWO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e9d6-jzdZ85A1JieCS/UHsT600zTGoNQ"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 59862,
    "path": "../public/assets/instructor-m49hSoWO.js"
  },
  "/assets/mixedbread-TBJmV3co-Cb4NzAHE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-/7/EdRywZ0gOXQfFSVRVqLUX3Io"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Cb4NzAHE.js"
  },
  "/assets/index-DXizPe4H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"df9-N74XoT4IctTRqBZSi00HbsTJqzo"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 3577,
    "path": "../public/assets/index-DXizPe4H.js"
  },
  "/assets/main-BaLyP-TP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e3d05-55evR3VqvTlfCPGKfSjPt2GKsyM"',
    "mtime": "2026-09-17T16:15:43.565Z",
    "size": 933125,
    "path": "../public/assets/main-BaLyP-TP.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-CQ81kXPa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-YrIzIAN+y6BPsjw9xesaaXAoB0A"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-CQ81kXPa.js"
  },
  "/assets/pipeline-B3-F1Xt1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-ATOjYh6SX3SACEc0FZJV1Bkh9B4"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 14066,
    "path": "../public/assets/pipeline-B3-F1Xt1.js"
  },
  "/assets/php-XaoqhXnm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19124-qzoslPSxuJlK+eQocONSyXfpdzM"',
    "mtime": "2026-09-17T16:15:43.565Z",
    "size": 102692,
    "path": "../public/assets/php-XaoqhXnm.js"
  },
  "/assets/parse-DG1dq0Bt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"86c5-MQy/CeMsXynPXpYhMxQWmNzSLWs"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 34501,
    "path": "../public/assets/parse-DG1dq0Bt.js"
  },
  "/assets/process-directory-Cd5gHCAg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-7aRucea/fVmdd1XIi80DrwcS9bY"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 50658,
    "path": "../public/assets/process-directory-Cd5gHCAg.js"
  },
  "/assets/pipelines-D17zuN1m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-YEbCLsMls2aYKfcus+DlneDxHOU"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 37283,
    "path": "../public/assets/pipelines-D17zuN1m.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/quickstart-DAVqgKQc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-BSJyfjgBaWjnF0yfWi5CYRI4Ctw"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 25396,
    "path": "../public/assets/quickstart-DAVqgKQc.js"
  },
  "/assets/search-default-A2JB3vqV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3b1-6VKLockzdLSuxKWxrj/QgDs9Wek"',
    "mtime": "2026-09-17T16:15:43.561Z",
    "size": 945,
    "path": "../public/assets/search-default-A2JB3vqV.js"
  },
  "/assets/static-BUXJwBmr-Dh8oIc6B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-7Y5fJ4NboaLGdaW7WMA5HrPDV8M"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-Dh8oIc6B.js"
  },
  "/assets/strategies-hW6vr-qj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d8b-Cg7MXCyv3sUJvCDa1FFHrBwfrgw"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 105867,
    "path": "../public/assets/strategies-hW6vr-qj.js"
  },
  "/assets/usage-DSwsKddZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-MY1t8HrsEtuWOkgdxq1BMRLtldI"',
    "mtime": "2026-09-17T16:15:43.565Z",
    "size": 36829,
    "path": "../public/assets/usage-DSwsKddZ.js"
  },
  "/assets/utils-BbnrXuH_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-X4PMCyGTLXVrR+wqoqZPYWXDTiM"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 16903,
    "path": "../public/assets/utils-BbnrXuH_.js"
  },
  "/assets/unstract-CS-Ves64.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b065-acmTvk47TbaCbNCFhoHv05Webb8"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 45157,
    "path": "../public/assets/unstract-CS-Ves64.js"
  },
  "/assets/verify-CWBEWmYS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-oaNZgUsR0uINaxX80+POMVv75po"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 10017,
    "path": "../public/assets/verify-CWBEWmYS.js"
  },
  "/assets/what-is-an-extraction-agent-ABQx4duk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3cac-kUjxeUNTODdAkJYNTm6752As/YQ"',
    "mtime": "2026-09-17T16:15:43.565Z",
    "size": 15532,
    "path": "../public/assets/what-is-an-extraction-agent-ABQx4duk.js"
  },
  "/assets/what-is-structured-data-extraction-DHKLde03.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2927-BYF0IgV/3jhLncP29mspHk4lnMM"',
    "mtime": "2026-09-17T16:15:43.565Z",
    "size": 10535,
    "path": "../public/assets/what-is-structured-data-extraction-DHKLde03.js"
  },
  "/assets/parse-DgG-1vJL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb55-Kp3HPHtEjnMDAdBQJntk3H53/P4"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 60245,
    "path": "../public/assets/parse-DgG-1vJL.js"
  },
  "/assets/validation-B2LAf0Fp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-Yim/kwmXpclIUN6pyQ2AW9GEpac"',
    "mtime": "2026-09-17T16:15:43.564Z",
    "size": 21573,
    "path": "../public/assets/validation-B2LAf0Fp.js"
  },
  "/assets/why-pdf-to-markdown-fails-pobUmK_S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a658-tIHzD4DLGOvR3uPD6vlHK+fwsDI"',
    "mtime": "2026-09-17T16:15:43.562Z",
    "size": 42584,
    "path": "../public/assets/why-pdf-to-markdown-fails-pobUmK_S.js"
  },
  "/assets/watch-folder-B0GsWFYo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-cKZcwjeWeEj1KFBKCdscLd6JpiM"',
    "mtime": "2026-09-17T16:15:43.563Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-B0GsWFYo.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-09-17T16:15:43.075Z",
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
const _fVHDlI = defineHandler((event) => {
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
const _lazy_pNOGbo = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return ssrRenderer$1;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_pNOGbo };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_fVHDlI)
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
