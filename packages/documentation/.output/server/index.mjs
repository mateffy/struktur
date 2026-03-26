globalThis.__nitro_main__ = import.meta.url;
import { b as FastResponse, s as serve } from "./_libs/srvx.mjs";
import { d as defineHandler, H as HTTPError, t as toEventHandler, a as defineLazyEventHandler, b as H3Core, c as toRequest } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
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
  return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
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
    "mtime": "2026-03-25T23:20:32.576Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-03-25T23:20:32.573Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-03-25T23:20:32.575Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-03-25T23:20:32.575Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/assets/index-DrJYJb8h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-xfwqh3JZkPPewHmylSttbtYLL5c"',
    "mtime": "2026-03-25T23:20:33.147Z",
    "size": 2075,
    "path": "../public/assets/index-DrJYJb8h.js"
  },
  "/assets/extracting-invoices-at-scale-BVwbN-TL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17289-t0TlySTRXdbafFq8QIVMOmuf4Lk"',
    "mtime": "2026-03-25T23:20:33.141Z",
    "size": 94857,
    "path": "../public/assets/extracting-invoices-at-scale-BVwbN-TL.js"
  },
  "/assets/process-directory-xDIng9uf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-u4J9zt2CEFF+Az4M+CfX6AHKPKc"',
    "mtime": "2026-03-25T23:20:33.152Z",
    "size": 50658,
    "path": "../public/assets/process-directory-xDIng9uf.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-BpoUj3mS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-S6N1CL45xtEionadSDZ+mI2Ccwg"',
    "mtime": "2026-03-25T23:20:33.148Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-BpoUj3mS.js"
  },
  "/assets/index-5bNmyYOf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"692d-hv1QxK1qdqGfXoNRXXwres9j6H4"',
    "mtime": "2026-03-25T23:20:33.140Z",
    "size": 26925,
    "path": "../public/assets/index-5bNmyYOf.js"
  },
  "/assets/config-DSKK90ab.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f5ee-cGDgjYkqAaLijk29m+Mq2IB30Q4"',
    "mtime": "2026-03-25T23:20:33.143Z",
    "size": 62958,
    "path": "../public/assets/config-DSKK90ab.js"
  },
  "/assets/main-CiUJ7M4r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f3d3b-jcViPhWAo2HJYFwoVDyjAGCm17c"',
    "mtime": "2026-03-25T23:20:33.139Z",
    "size": 998715,
    "path": "../public/assets/main-CiUJ7M4r.js"
  },
  "/assets/index-BcRJD8rr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2af6-+zkjS3i0+A4qlfvKNe3YaowEE80"',
    "mtime": "2026-03-25T23:20:33.142Z",
    "size": 10998,
    "path": "../public/assets/index-BcRJD8rr.js"
  },
  "/assets/quickstart-qru6VzUM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-geCSwla42JOymWZosDWoVSlBpLg"',
    "mtime": "2026-03-25T23:20:33.148Z",
    "size": 25396,
    "path": "../public/assets/quickstart-qru6VzUM.js"
  },
  "/assets/extract-BaWhLF4Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-wn6LL7iUrPqA6zl+9HlmgT8oO3I"',
    "mtime": "2026-03-25T23:20:33.145Z",
    "size": 16745,
    "path": "../public/assets/extract-BaWhLF4Z.js"
  },
  "/assets/usage-DrH3gDvg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-PlXVKLRaGJX3Vb1O5bCLrlhEI3Q"',
    "mtime": "2026-03-25T23:20:33.140Z",
    "size": 36829,
    "path": "../public/assets/usage-DrH3gDvg.js"
  },
  "/assets/parse-Ca6BL-jS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6097-l3/F0PBqC6bXX5i6Bb4AsIU44JM"',
    "mtime": "2026-03-25T23:20:33.143Z",
    "size": 24727,
    "path": "../public/assets/parse-Ca6BL-jS.js"
  },
  "/CNAME": {
    "type": "text/plain; charset=utf-8",
    "etag": '"b-vMwX+cTl5yDqPfvnjJ2Kk+BC1jQ"',
    "mtime": "2026-03-25T23:20:32.574Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/index-DVv4V5zh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-XmEKbNqGCyYOo56mThGR4zuhK+8"',
    "mtime": "2026-03-25T23:20:33.145Z",
    "size": 3329,
    "path": "../public/assets/index-DVv4V5zh.js"
  },
  "/assets/index-DvIbAEx3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-M68hpCEZzMthpD88P6LtnSCIs40"',
    "mtime": "2026-03-25T23:20:33.147Z",
    "size": 3736,
    "path": "../public/assets/index-DvIbAEx3.js"
  },
  "/assets/orama-cloud-cgTJNLo0-CzW189Cr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-lWW5xUOhdM/H3YtszZl9I4m016A"',
    "mtime": "2026-03-25T23:20:33.146Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-CzW189Cr.js"
  },
  "/assets/static-BUXJwBmr-DUf1b0Bl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-Z9gCiNLYxC80wWAQCJ0aq5lp8Jw"',
    "mtime": "2026-03-25T23:20:33.151Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-DUf1b0Bl.js"
  },
  "/assets/_-CiFjXsgx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d-2Y2c+8Xgnl7dP2FjBg3CnVgSagU"',
    "mtime": "2026-03-25T23:20:33.140Z",
    "size": 413,
    "path": "../public/assets/_-CiFjXsgx.js"
  },
  "/assets/_-B59Pi-0x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-Zsv5loOhew1xN/E8m92s1d4ltP8"',
    "mtime": "2026-03-25T23:20:33.140Z",
    "size": 410,
    "path": "../public/assets/_-B59Pi-0x.js"
  },
  "/assets/document-parsing-BKFeop1g.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e401-k+G2dw50EA871KvwasdWJ0nQwyM"',
    "mtime": "2026-03-25T23:20:33.144Z",
    "size": 123905,
    "path": "../public/assets/document-parsing-BKFeop1g.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-07T16:34:29.093Z",
    "size": 5891373,
    "path": "../public/struktur-icon.png"
  },
  "/assets/index-OJtSaIV1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28e1-4IVgK/2ki0W/lDh09hfkovMOKrg"',
    "mtime": "2026-03-25T23:20:33.142Z",
    "size": 10465,
    "path": "../public/assets/index-OJtSaIV1.js"
  },
  "/assets/installation-B3-_F--D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-G3Qw3+g6mQ6DteTvPzoc9o/BV14"',
    "mtime": "2026-03-25T23:20:33.138Z",
    "size": 38319,
    "path": "../public/assets/installation-B3-_F--D.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-25T23:20:33.155Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/extract-realestate-Dctjap9o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-IwW4YUzl8uK1EQmdT0wtggmtCng"',
    "mtime": "2026-03-25T23:20:33.141Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-Dctjap9o.js"
  },
  "/assets/index-oZrK8_Eh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"df9-c45XlYJ2Qj/xj5u2pH258FID1oY"',
    "mtime": "2026-03-25T23:20:33.141Z",
    "size": 3577,
    "path": "../public/assets/index-oZrK8_Eh.js"
  },
  "/assets/validation-B6OFpgO0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"53ee-bDTRT7rrlJr6oqFM2OAuW5mkA5k"',
    "mtime": "2026-03-25T23:20:33.151Z",
    "size": 21486,
    "path": "../public/assets/validation-B6OFpgO0.js"
  },
  "/assets/search-default-DI7038Ti.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3b1-KpGbCk/NTHo7AQaIXXOUw6fDtmQ"',
    "mtime": "2026-03-25T23:20:33.145Z",
    "size": 945,
    "path": "../public/assets/search-default-DI7038Ti.js"
  },
  "/assets/fields-CUn7fN5J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-7anKmhAYkDOntYzn4k2jyCnhX7g"',
    "mtime": "2026-03-25T23:20:33.146Z",
    "size": 74441,
    "path": "../public/assets/fields-CUn7fN5J.js"
  },
  "/assets/installation-DWe6Op44.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-KkVb1vLqLMCzxx+6WTfasSYC1cs"',
    "mtime": "2026-03-25T23:20:33.145Z",
    "size": 9453,
    "path": "../public/assets/installation-DWe6Op44.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-25T23:20:33.147Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/verify-kYXjq4v9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-ASi6OwJB6wkvD5bvaDzn8PdYyb8"',
    "mtime": "2026-03-25T23:20:33.146Z",
    "size": 10017,
    "path": "../public/assets/verify-kYXjq4v9.js"
  },
  "/assets/watch-folder-BkmnGfiB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1089f-TqTEHsDRbT83KWPTRvZIGlsTnmw"',
    "mtime": "2026-03-25T23:20:33.166Z",
    "size": 67743,
    "path": "../public/assets/watch-folder-BkmnGfiB.js"
  },
  "/assets/agent-vs-simple-vs-parallel-Dejebe7_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11bd1-rESgVdLzyBeY5khaO8H5FxofrVA"',
    "mtime": "2026-03-25T23:20:33.151Z",
    "size": 72657,
    "path": "../public/assets/agent-vs-simple-vs-parallel-Dejebe7_.js"
  },
  "/assets/models-and-providers-CE2ultmc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bd14-mEo93mBNFdDboGITiBKjwwqIC0E"',
    "mtime": "2026-03-25T23:20:33.148Z",
    "size": 48404,
    "path": "../public/assets/models-and-providers-CE2ultmc.js"
  },
  "/assets/chunking-Eo7Fv0V0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-C8qvHb9oSFrAI3jcQJk0aWv6vME"',
    "mtime": "2026-03-25T23:20:33.142Z",
    "size": 15938,
    "path": "../public/assets/chunking-Eo7Fv0V0.js"
  },
  "/assets/extract-invoice-mNoF_yPX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-xXcaOdjVV1AFmHphn3dvrjz34tU"',
    "mtime": "2026-03-25T23:20:33.156Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-mNoF_yPX.js"
  },
  "/assets/installation-BS76toWz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"526b-mG475pjMeb9rv3evjimSEAKJtMA"',
    "mtime": "2026-03-25T23:20:33.143Z",
    "size": 21099,
    "path": "../public/assets/installation-BS76toWz.js"
  },
  "/assets/parse-CSnaJcYe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d77e-rjkae5HiZ6MYCtlpHm1HNaE+sYY"',
    "mtime": "2026-03-25T23:20:33.141Z",
    "size": 55166,
    "path": "../public/assets/parse-CSnaJcYe.js"
  },
  "/assets/llamaindex-CW53JC69.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"753a-rogSLuADfeZzUUdMQ8NirUq8t+E"',
    "mtime": "2026-03-25T23:20:33.142Z",
    "size": 30010,
    "path": "../public/assets/llamaindex-CW53JC69.js"
  },
  "/assets/pipelines-BjcwXkMw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91fa-BMoaXpAChUbCQfbqKMQjn8qmPJE"',
    "mtime": "2026-03-25T23:20:33.145Z",
    "size": 37370,
    "path": "../public/assets/pipelines-BjcwXkMw.js"
  },
  "/assets/what-is-structured-data-extraction-DHbu7I-S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2927-Kh5UEXzthNTHc5pM0ehX8ALm55g"',
    "mtime": "2026-03-25T23:20:33.138Z",
    "size": 10535,
    "path": "../public/assets/what-is-structured-data-extraction-DHbu7I-S.js"
  },
  "/assets/chunking-validation-retries-Dw1gw4OM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"120f3-qEo3rDBMvQr62RblYyRtazTQpls"',
    "mtime": "2026-03-25T23:20:33.142Z",
    "size": 73971,
    "path": "../public/assets/chunking-validation-retries-Dw1gw4OM.js"
  },
  "/assets/pipeline-CPflUCd0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-vWtDwSZp243N2LRmDV2f8SJTQ8I"',
    "mtime": "2026-03-25T23:20:33.145Z",
    "size": 14066,
    "path": "../public/assets/pipeline-CPflUCd0.js"
  },
  "/assets/enrich-records-DpPQDvJM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d9f-350hN2BF8eA4tOpFcUFEsbqjs2E"',
    "mtime": "2026-03-25T23:20:33.147Z",
    "size": 40351,
    "path": "../public/assets/enrich-records-DpPQDvJM.js"
  },
  "/assets/unstract-CuxFtrHB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b065-DyMVAYuE13p84WJ8GIEp+FQD+DA"',
    "mtime": "2026-03-25T23:20:33.143Z",
    "size": 45157,
    "path": "../public/assets/unstract-CuxFtrHB.js"
  },
  "/assets/index-uLn45roN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-JOCH/YmaXxpPqwsrtjUiEVmuL9g"',
    "mtime": "2026-03-25T23:20:33.144Z",
    "size": 37570,
    "path": "../public/assets/index-uLn45roN.js"
  },
  "/assets/what-is-an-extraction-agent-C8P39fFu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3cac-7mgGwxGPf8FHGYfw7jTjJ9IotfU"',
    "mtime": "2026-03-25T23:20:33.140Z",
    "size": 15532,
    "path": "../public/assets/what-is-an-extraction-agent-C8P39fFu.js"
  },
  "/assets/_-CimmmocX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-/zNpIxzTyjmklHuTcXs0ZIaF8n4"',
    "mtime": "2026-03-25T23:20:33.140Z",
    "size": 410,
    "path": "../public/assets/_-CimmmocX.js"
  },
  "/assets/algolia-CfKKhsrI-BKMWsa09.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-ZoWQPCPiqjBkqNmNhYpDCU+t648"',
    "mtime": "2026-03-25T23:20:33.146Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-BKMWsa09.js"
  },
  "/assets/events-2phu2Frz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"459b-gimlzPyVV1WUX8tEFwp9LbYzN4c"',
    "mtime": "2026-03-25T23:20:33.148Z",
    "size": 17819,
    "path": "../public/assets/events-2phu2Frz.js"
  },
  "/assets/extract-Dzu9h2bf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b339-WXsT9w7kt5dD+MsdHyyIpFDlEP0"',
    "mtime": "2026-03-25T23:20:33.144Z",
    "size": 45881,
    "path": "../public/assets/extract-Dzu9h2bf.js"
  },
  "/assets/utils-DJgnmOd3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-YRzHzph2qbOIjD5UdAG2Tvef1zA"',
    "mtime": "2026-03-25T23:20:33.145Z",
    "size": 16903,
    "path": "../public/assets/utils-DJgnmOd3.js"
  },
  "/assets/index-BBk4v8Wp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-X1BVwmu6kw6dlCOLIQ1uvLvjKaY"',
    "mtime": "2026-03-25T23:20:33.138Z",
    "size": 13717,
    "path": "../public/assets/index-BBk4v8Wp.js"
  },
  "/assets/main-1ROFqLhp.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13d62-PZLY1ZPDP0pDyCLXvMUZjjIzVgw"',
    "mtime": "2026-03-25T23:20:33.137Z",
    "size": 81250,
    "path": "../public/assets/main-1ROFqLhp.css"
  },
  "/assets/instructor-5R_l607P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e9d6-98mOIeTedOelDC5FjYaamMh8yM8"',
    "mtime": "2026-03-25T23:20:33.141Z",
    "size": 59862,
    "path": "../public/assets/instructor-5R_l607P.js"
  },
  "/assets/building-autonomous-extraction-agent-CJW4JP5p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d1d2-w0p8+MoKm/R64pe03mnimMuxNI8"',
    "mtime": "2026-03-25T23:20:33.141Z",
    "size": 53714,
    "path": "../public/assets/building-autonomous-extraction-agent-CJW4JP5p.js"
  },
  "/assets/index-C8jSZogr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-nKFz2+2pTtNqp5hhZXIwPXLqFQ0"',
    "mtime": "2026-03-25T23:20:33.150Z",
    "size": 1055,
    "path": "../public/assets/index-C8jSZogr.js"
  },
  "/assets/manual-llm-calls-IqxodN_l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b47d-wSFsykM2foZvEFT017S6lUfvPUY"',
    "mtime": "2026-03-25T23:20:33.142Z",
    "size": 111741,
    "path": "../public/assets/manual-llm-calls-IqxodN_l.js"
  },
  "/assets/artifact-format-DuLDzzHa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-2h8r09+9LEOmiNXN0La9dwOdP2g"',
    "mtime": "2026-03-25T23:20:33.154Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-DuLDzzHa.js"
  },
  "/assets/strategies-ZUATbft1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"169a2-emGSobodUCV5EBu2PGLTpRnF3Eg"',
    "mtime": "2026-03-25T23:20:33.148Z",
    "size": 92578,
    "path": "../public/assets/strategies-ZUATbft1.js"
  },
  "/assets/index-50Xh01Y6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-6pkJ4S1gPUrxnXKHhiWIaIkys6Y"',
    "mtime": "2026-03-25T23:20:33.140Z",
    "size": 3192,
    "path": "../public/assets/index-50Xh01Y6.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-25T23:20:33.146Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/why-pdf-to-markdown-fails-BZg6TCwt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a658-BcnGvbpRK19n4j9bSNGiAvoHaGc"',
    "mtime": "2026-03-25T23:20:33.143Z",
    "size": 42584,
    "path": "../public/assets/why-pdf-to-markdown-fails-BZg6TCwt.js"
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
const _3Wyrq0 = defineHandler((event) => {
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
const _lazy_Nid11Z = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return ssrRenderer$1;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_Nid11Z };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_3Wyrq0)
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
let _fetch = nitroApp.fetch;
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: _fetch,
  bun: { websocket: void 0 }
});
trapUnhandledErrors();
const bun = {};
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
  bun as default
};
