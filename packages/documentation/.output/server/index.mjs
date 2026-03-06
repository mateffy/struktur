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
    "mtime": "2026-03-06T02:47:21.801Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/_-DIDaIxkc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29fd-fp6G0z1gCASflnVpFIrLmlFk0mw"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 10749,
    "path": "../public/assets/_-DIDaIxkc.js"
  },
  "/assets/algolia-CfKKhsrI-BYasQg6A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-uCMRnz63yipU/y6kYPs7Px5aFTQ"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-BYasQg6A.js"
  },
  "/assets/artifact-format-BwaIycz8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8ea6-NSEMPDC4YwSisyuMCV4Aum8Is+0"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 36518,
    "path": "../public/assets/artifact-format-BwaIycz8.js"
  },
  "/assets/app-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 78946,
    "path": "../public/assets/app-DU2F3XIG.css"
  },
  "/assets/artifact-helpers-EBVXpX4D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"653b-UMUw0kPe3KB1TZE7JQ4My/3WI+c"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 25915,
    "path": "../public/assets/artifact-helpers-EBVXpX4D.js"
  },
  "/assets/choosing-BMhyfQde.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5e96-+8NSdQ0og9/KdLS4HnFPClIzZMo"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 24214,
    "path": "../public/assets/choosing-BMhyfQde.js"
  },
  "/assets/chunking-Dds-yh1k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4087-V4exnfgJtobWnBOYhVHQq1nzfCs"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 16519,
    "path": "../public/assets/chunking-Dds-yh1k.js"
  },
  "/assets/config-DcDYcnS6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"105d3-qDcp3A/0+ekPHjPa3p+nghSfEAo"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 67027,
    "path": "../public/assets/config-DcDYcnS6.js"
  },
  "/assets/custom-strategy-B5-hhMcK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"79f6-mpT/Iv+YgbQVw6r/veSU/OjlV1Q"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 31222,
    "path": "../public/assets/custom-strategy-B5-hhMcK.js"
  },
  "/assets/double-pass-auto-merge-5X-da8sj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c43-GNjOh9IcqmHd2VCAmKkm/51uf4o"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 23619,
    "path": "../public/assets/double-pass-auto-merge-5X-da8sj.js"
  },
  "/assets/custom-provider-D4B7xN85.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"105b3-bbf/DuEqL2IP4Hdygx13f+KjBfk"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 66995,
    "path": "../public/assets/custom-provider-D4B7xN85.js"
  },
  "/assets/double-pass-uMudT9tm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"64c4-AO04l3bTP1eSOfMz+DKe6UCs6mc"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 25796,
    "path": "../public/assets/double-pass-uMudT9tm.js"
  },
  "/assets/environment-4rbIGtMI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b3d-QlssFqL9K6WntANAfED/c1PZV/U"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 11069,
    "path": "../public/assets/environment-4rbIGtMI.js"
  },
  "/assets/built-in-inputs-C4EtQDN3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"71e6-3bVYUElvkWkwpyOp9V5WsRavUi8"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 29158,
    "path": "../public/assets/built-in-inputs-C4EtQDN3.js"
  },
  "/assets/events-D5YOZXsi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-f6XlPjm0wsngkaCjb6Tqw4CZan4"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 17535,
    "path": "../public/assets/events-D5YOZXsi.js"
  },
  "/assets/enrich-records-CCh_V0Yt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d75-ruZSwDy5f51f6/796BDLGwPSlQk"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 40309,
    "path": "../public/assets/enrich-records-CCh_V0Yt.js"
  },
  "/assets/extract-NipuAKKk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46f1-3bpgJHYTtLjHdx8MCZJ6wuykyDQ"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 18161,
    "path": "../public/assets/extract-NipuAKKk.js"
  },
  "/assets/extract-invoice-CmwK52A4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b7f6-ChOj8JQv5hzLhZXyy0qKTqIQtw8"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 47094,
    "path": "../public/assets/extract-invoice-CmwK52A4.js"
  },
  "/assets/extract-DR0BhLP8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d089-qGCAEAPSJuzajzRgywHsoWIlpKE"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 53385,
    "path": "../public/assets/extract-DR0BhLP8.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-DTMAs5AS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b1f1-Cagb9EZp3iPZ8TNSHK50zQCzNfY"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 45553,
    "path": "../public/assets/fields-DTMAs5AS.js"
  },
  "/assets/extract-realestate-DF3Mmgi7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a1a2-RCukb63qc/zqnDcFhLoSP+cd790"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 41378,
    "path": "../public/assets/extract-realestate-DF3Mmgi7.js"
  },
  "/assets/fields-DWIznRiW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"121b6-beRaXUTBMciSfzX6lA8/AKwglhU"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 74166,
    "path": "../public/assets/fields-DWIznRiW.js"
  },
  "/assets/index-4aknfPcE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"94b-UBNTylfEq+HLogJD4DubP06qjdQ"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 2379,
    "path": "../public/assets/index-4aknfPcE.js"
  },
  "/assets/index-BDv5DYg_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36d3-rn4D4HpkUDJjZNHYhI5q4MgKAQc"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 14035,
    "path": "../public/assets/index-BDv5DYg_.js"
  },
  "/assets/index-BKWcA2Dh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-V6VqACAUnLCBnJeL2QQv7RZheqs"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 1055,
    "path": "../public/assets/index-BKWcA2Dh.js"
  },
  "/assets/index-BMtqIpUs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a37-UgfyPL7dg+5BSWl3RrhyWTta87A"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 2615,
    "path": "../public/assets/index-BMtqIpUs.js"
  },
  "/assets/index-C9z4SNUh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67b6-kLpqiiUGQyGqB9s2ooW4PA2fqQ8"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 26550,
    "path": "../public/assets/index-C9z4SNUh.js"
  },
  "/assets/index-CKL9Y7Is.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7d8-sZSCWUCFT4V9eZ2tmFXlEEwML48"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 2008,
    "path": "../public/assets/index-CKL9Y7Is.js"
  },
  "/assets/index-CGWE4jjU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-ELPKfLnIjjS0Ll2DaAQYZGxGTlA"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 2918,
    "path": "../public/assets/index-CGWE4jjU.js"
  },
  "/assets/index-DSSTJ4q3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-2OVFkqycDkK0p3qIX1OtHW8SzQ8"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 3066,
    "path": "../public/assets/index-DSSTJ4q3.js"
  },
  "/assets/index-DTUw5wyv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d88-aC9OylnG/TVrLhnN83HbyCobwaw"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 19848,
    "path": "../public/assets/index-DTUw5wyv.js"
  },
  "/assets/installation-CXOkYU44.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"950b-hvY+1hQhurC0M6jTZmuSR+OQ45Q"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 38155,
    "path": "../public/assets/installation-CXOkYU44.js"
  },
  "/assets/index-BghNGFCt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3194-At4cpCUmn9AxgK/pBlWH8ghQjmo"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 12692,
    "path": "../public/assets/index-BghNGFCt.js"
  },
  "/assets/installation-QUBlAhdz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ecb-bQuAQ8INd2NekDFzSZ8uoEWqHaQ"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 7883,
    "path": "../public/assets/installation-QUBlAhdz.js"
  },
  "/assets/installation-mWIXgWaA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"58a8-QqcG9L7gsMcVUmGdBYmnLDntqnk"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 22696,
    "path": "../public/assets/installation-mWIXgWaA.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-C31Oitdt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-KVWgk5dHGZ5yqseK/CJoZVs2YNo"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-C31Oitdt.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-ZlgEGDF-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-r3p05v9IW8GiMB1ET7UIwHg0Fzs"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-ZlgEGDF-.js"
  },
  "/assets/parallel-5xlI6LEY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c94-NXlcLcg1BzURUvC6KN7+QDPua9I"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 23700,
    "path": "../public/assets/parallel-5xlI6LEY.js"
  },
  "/assets/parallel-auto-merge-DrMLl7aC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5d3e-KzLljhv6H6lX8meC+36ufROLxsY"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 23870,
    "path": "../public/assets/parallel-auto-merge-DrMLl7aC.js"
  },
  "/assets/parsers-Cci9oU77.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dc64-39f3SlvUssPJE1LmlMG/dm6XQgY"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 56420,
    "path": "../public/assets/parsers-Cci9oU77.js"
  },
  "/assets/process-directory-DULYW5Ls.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c60b-noWdpE+ahURcJeVTuQshBkWI6SI"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 50699,
    "path": "../public/assets/process-directory-DULYW5Ls.js"
  },
  "/assets/parse-ysLDz8VZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6874-cbQ+rm2XYmxmvMRu8Z6PD5eGwD0"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 26740,
    "path": "../public/assets/parse-ysLDz8VZ.js"
  },
  "/assets/pipeline-CiKp5NLs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36eb-zd7matkg7fefWQFyalf5NdTOSDw"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 14059,
    "path": "../public/assets/pipeline-CiKp5NLs.js"
  },
  "/assets/pipelines-CJzSuh8z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-lFdhOohKMW0vYa4+MbeMYVdK3BU"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 37283,
    "path": "../public/assets/pipelines-CJzSuh8z.js"
  },
  "/assets/main-DmNcsfUg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb72d-/XmQQpsYBAqBDqooFGP9t/hDa7I"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 964397,
    "path": "../public/assets/main-DmNcsfUg.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-DR0fFFHJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-SUbEo9e8x2xEBGZGxgcJf3fKC88"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 940,
    "path": "../public/assets/search-default-DR0fFFHJ.js"
  },
  "/assets/quickstart-DePgo7BY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"77a6-fXg2G0+S2Npl+QjNefr8s6b6iu8"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 30630,
    "path": "../public/assets/quickstart-DePgo7BY.js"
  },
  "/assets/sequential-auto-merge-CqRFwWUP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"57b5-pmN9/sOGfHsiNTQQjU+JcDEee9U"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 22453,
    "path": "../public/assets/sequential-auto-merge-CqRFwWUP.js"
  },
  "/assets/simple-nGZhO6pD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4192-6eXWRaQcNO59+27PsnODpbBR0ak"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 16786,
    "path": "../public/assets/simple-nGZhO6pD.js"
  },
  "/assets/static-BUXJwBmr-D22cJMMf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-NsbzRAjRi9z6FIW3TN8mB4ze3So"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-D22cJMMf.js"
  },
  "/assets/utils-CWKAPKMB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42bf-j+ffOPytQS+VzQVjHB2c/6ju3qs"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 17087,
    "path": "../public/assets/utils-CWKAPKMB.js"
  },
  "/assets/validation-D-oq_85B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5476-33W9Mv8KU8e+Q9yCS47pNorQjAs"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 21622,
    "path": "../public/assets/validation-D-oq_85B.js"
  },
  "/assets/sequential-CjYaSl3K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5363-aw3qEOe59z4iojllamRrVnsysdc"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 21347,
    "path": "../public/assets/sequential-CjYaSl3K.js"
  },
  "/assets/watch-folder-LegSY8_0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10740-BC7EHrR1Us7p4Dfix1sPJuzKrAw"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 67392,
    "path": "../public/assets/watch-folder-LegSY8_0.js"
  },
  "/assets/usage-D6nVSDhR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-cxX45dsAFuPHJDkSlCgCsyssr0k"',
    "mtime": "2026-03-06T02:47:22.193Z",
    "size": 37282,
    "path": "../public/assets/usage-D6nVSDhR.js"
  },
  "/assets/verify-BsFxgfM4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2985-PAJrOkpaBjycDm8z8TeUYqbqB3U"',
    "mtime": "2026-03-06T02:47:22.192Z",
    "size": 10629,
    "path": "../public/assets/verify-BsFxgfM4.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T02:47:21.819Z",
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
