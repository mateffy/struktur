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
    "mtime": "2026-09-24T16:11:45.581Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-09-24T16:11:45.582Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-09-24T16:11:45.582Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-09-24T16:11:45.583Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-09-24T16:11:45.585Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/assets/_-BkBEWdxX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-v2nH4LASRW+PfjtO8pyQK43xOKo"',
    "mtime": "2026-09-24T16:11:46.258Z",
    "size": 410,
    "path": "../public/assets/_-BkBEWdxX.js"
  },
  "/assets/_-Cm7JpD26.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-RPxJA/2sDB8gCoClLQh6d91FZu0"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 410,
    "path": "../public/assets/_-Cm7JpD26.js"
  },
  "/assets/_-DeR8p5Jm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d-GkWyzKKZ0tyn1DJ4GoyvaehmqEE"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 413,
    "path": "../public/assets/_-DeR8p5Jm.js"
  },
  "/assets/agent-vs-simple-vs-parallel-DqOvHzfy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11919-m8cplXQXrT/oDvW0wvTRJanSpbE"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 71961,
    "path": "../public/assets/agent-vs-simple-vs-parallel-DqOvHzfy.js"
  },
  "/assets/artifact-format-BfJc8RoR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10ca4-5FZI+gaHV89XaoC1K26cfaWP7E4"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 68772,
    "path": "../public/assets/artifact-format-BfJc8RoR.js"
  },
  "/assets/building-autonomous-extraction-agent-g-rAlROp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d1d2-/hBUQL3coy8jIp9fQPcYeyBIfnU"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 53714,
    "path": "../public/assets/building-autonomous-extraction-agent-g-rAlROp.js"
  },
  "/assets/chunking-CP92c9Xj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-4DiY9IXVjOLUWjneB2vnegSW5/Y"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 15938,
    "path": "../public/assets/chunking-CP92c9Xj.js"
  },
  "/assets/chunking-validation-retries-Bs_EIqhY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11fee-ov9YJudEGTCOFtzRmVQ6r9jwvQk"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 73710,
    "path": "../public/assets/chunking-validation-retries-Bs_EIqhY.js"
  },
  "/assets/config-BgH1sRfk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10030-QCcsl2F8LOaOSB07+yYuNx5srFY"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 65584,
    "path": "../public/assets/config-BgH1sRfk.js"
  },
  "/assets/docker-XOsyCo5w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9e6a-OnZM/m9iascxplxF+FIy31QLkU0"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 40554,
    "path": "../public/assets/docker-XOsyCo5w.js"
  },
  "/assets/enrich-records-CilYbQwF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-G26/IOlEUTB2r6Ri7vewbSUiSMg"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-CilYbQwF.js"
  },
  "/assets/extract-eJrUrufr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-urHq2tOlNhQANKPPg05QUcXwxiI"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 16745,
    "path": "../public/assets/extract-eJrUrufr.js"
  },
  "/assets/extract-D7ntA53O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fe66-rp54vdTSWOhQDmJyWKN1yfy0JUc"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 65126,
    "path": "../public/assets/extract-D7ntA53O.js"
  },
  "/assets/extract-invoice-CM7aXBZJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-NL9RdnQGn0Po3nFfUD8aA05OxoA"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-CM7aXBZJ.js"
  },
  "/assets/extract-realestate-CvWghUjL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-de4+bf/oZepIRow+OfmfzMvt9Sc"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-CvWghUjL.js"
  },
  "/assets/extracting-invoices-at-scale-uxen-VL-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17232-FYiJ3pUv89q6HU9gKwZafLx2XoM"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 94770,
    "path": "../public/assets/extracting-invoices-at-scale-uxen-VL-.js"
  },
  "/assets/events-CTMgmzcK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a9a1-KmroBtQffynL/CPmXxt2iGi1vY4"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 43425,
    "path": "../public/assets/events-CTMgmzcK.js"
  },
  "/assets/algolia-CfKKhsrI-CUfBjb0R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-4YvKxlPiOzu7/PCnHszwPXzmHEY"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-CUfBjb0R.js"
  },
  "/assets/document-parsing-aMI_KnBA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"20ad9-4UFUn+UVty8iN3w+xyRIajM8ks4"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 133849,
    "path": "../public/assets/document-parsing-aMI_KnBA.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-CXgHu65j.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-6WVqmrqk5isJ3s0J3ZnTPnigbAw"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 74441,
    "path": "../public/assets/fields-CXgHu65j.js"
  },
  "/assets/index-2ptk4yQu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"df9-0RTAMTTBbnjzLP8fqR52n7/6Tsw"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 3577,
    "path": "../public/assets/index-2ptk4yQu.js"
  },
  "/assets/index-BD3LnWYA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28e1-sdxG2c8uQ8vj1wZT2KbG/YgTzGc"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 10465,
    "path": "../public/assets/index-BD3LnWYA.js"
  },
  "/assets/index-BH7bYlbQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5b96-SWlzOwjMFNy7mySYTTvX3UMKveQ"',
    "mtime": "2026-09-24T16:11:46.244Z",
    "size": 23446,
    "path": "../public/assets/index-BH7bYlbQ.js"
  },
  "/assets/index-Bd06SdEV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2af6-Q4/BO7+/RrzcvAJaAREW69ItyZg"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 10998,
    "path": "../public/assets/index-Bd06SdEV.js"
  },
  "/assets/index-BeWiBDzM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-h33mf6lXEcUDKCQ3XNrWKFEiQmU"',
    "mtime": "2026-09-24T16:11:46.258Z",
    "size": 37570,
    "path": "../public/assets/index-BeWiBDzM.js"
  },
  "/assets/index-CBVgRBak.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-AJ4K1zSKqQc3kqN23/9uWTv4Uw0"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 2075,
    "path": "../public/assets/index-CBVgRBak.js"
  },
  "/assets/index-CUJ699xe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-J9gWuqJd5f2i3nIxVMN563UWb00"',
    "mtime": "2026-09-24T16:11:46.258Z",
    "size": 3192,
    "path": "../public/assets/index-CUJ699xe.js"
  },
  "/assets/index-Cq2UdCv1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-rJJr4Os4rvZRuv3Qy1JDFbgGamg"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 3329,
    "path": "../public/assets/index-Cq2UdCv1.js"
  },
  "/assets/index-DL7pxWiU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-ciQrfdwMVkEaVAHBAS+UQONH8LI"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 1055,
    "path": "../public/assets/index-DL7pxWiU.js"
  },
  "/assets/index-DfIkt_U9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-wQwuuLv9aEKCXDOKtwiOBwLjPfo"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 3736,
    "path": "../public/assets/index-DfIkt_U9.js"
  },
  "/assets/installation-Cqyk31oR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-132g4hsdduf6COSUIIhdC00L8hM"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 9453,
    "path": "../public/assets/installation-Cqyk31oR.js"
  },
  "/assets/index-vN4cSQs2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-DPPJAGa4kJ4UsyJFN2YrO4rqg0E"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 13717,
    "path": "../public/assets/index-vN4cSQs2.js"
  },
  "/assets/installation-D94er9G_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"61f9-5cL6AfOPJpE97VAQ9rBU6gJsHb8"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 25081,
    "path": "../public/assets/installation-D94er9G_.js"
  },
  "/assets/installation-nVY8vffO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-7/xZTAjFxFbGTshhIt2cU+J7x5E"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 38319,
    "path": "../public/assets/installation-nVY8vffO.js"
  },
  "/assets/instructor-Ba4F8KOW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e9d6-/kREEBs12DLI1rQuywgzucPx9lM"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 59862,
    "path": "../public/assets/instructor-Ba4F8KOW.js"
  },
  "/assets/main-Dz2EFaUk.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"14c20-5S2y9n56cG0DRUIRUpDTV8pF+TI"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 85024,
    "path": "../public/assets/main-Dz2EFaUk.css"
  },
  "/assets/llamaindex-fVV-9Qkr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"753a-bpZs+CRmGz4Jqk048kdPiWHtsHk"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 30010,
    "path": "../public/assets/llamaindex-fVV-9Qkr.js"
  },
  "/assets/manual-llm-calls-DYuwphhW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b47d-ZrxDDkna138if6qMK2U+gYG8Sd8"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 111741,
    "path": "../public/assets/manual-llm-calls-DYuwphhW.js"
  },
  "/assets/models-and-providers-opoNkpX4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dbc9-KEKvjgbNAGVklE3uscrX1Sji/28"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 56265,
    "path": "../public/assets/models-and-providers-opoNkpX4.js"
  },
  "/assets/orama-cloud-cgTJNLo0-DYilhtgj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-0UapAQV46sgNY03NzmUYpTIAhI8"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-DYilhtgj.js"
  },
  "/assets/mixedbread-TBJmV3co-Cb4NzAHE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-/7/EdRywZ0gOXQfFSVRVqLUX3Io"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Cb4NzAHE.js"
  },
  "/assets/main-CJmI79fM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e3d05-1PKsmtP6odE0DipJ4o5sl3jcmqI"',
    "mtime": "2026-09-24T16:11:46.258Z",
    "size": 933125,
    "path": "../public/assets/main-CJmI79fM.js"
  },
  "/assets/parse-D9T2nx53.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"86c5-k6wX0JZB/dbNrxfWYzExaRMv0/U"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 34501,
    "path": "../public/assets/parse-D9T2nx53.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-BX3d38Pj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-UBYjrtBXM8SY6o37yuRAcCKBxHs"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-BX3d38Pj.js"
  },
  "/assets/pipeline-F0_whrh3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-UyUZ8Vur0FNNElG4NOe1J7NInKA"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 14066,
    "path": "../public/assets/pipeline-F0_whrh3.js"
  },
  "/assets/parse-BwzvTl66.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb55-JH5sj4B+Oz8vb3D9sF6W9n25Skc"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 60245,
    "path": "../public/assets/parse-BwzvTl66.js"
  },
  "/assets/pipelines-DcSJ7UDw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-WW4CSq/UY25SPHOj66XuXUyhpu4"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 37283,
    "path": "../public/assets/pipelines-DcSJ7UDw.js"
  },
  "/assets/php-CJgZjRmG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19653-KC5t2KwepFZM9+IeWAJf73I//tw"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 104019,
    "path": "../public/assets/php-CJgZjRmG.js"
  },
  "/assets/quickstart-FXmjkYn0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-CoH2oaoF4ZQMeasIx52abNGVas8"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 25396,
    "path": "../public/assets/quickstart-FXmjkYn0.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/process-directory-DlhBsV7o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-CvyiO/B16e8CFFKSfmy15MRk8g0"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 50658,
    "path": "../public/assets/process-directory-DlhBsV7o.js"
  },
  "/assets/search-default-B_RB6LHq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3b1-OY22eMZpmJqjMrRGqhwLRA53wlk"',
    "mtime": "2026-09-24T16:11:46.254Z",
    "size": 945,
    "path": "../public/assets/search-default-B_RB6LHq.js"
  },
  "/assets/static-BUXJwBmr-CTABiU38.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-sn3Xi2WbqKWVGkf6ts1gsw2icso"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-CTABiU38.js"
  },
  "/assets/usage-BC1xMQ9r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-AoV4UmNYbWkabL9BP48Xz9xGrQo"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 36829,
    "path": "../public/assets/usage-BC1xMQ9r.js"
  },
  "/assets/strategies-DAAB5Dqb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a14e-xlLcJntbtEYl985rlqmgtBGiusk"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 106830,
    "path": "../public/assets/strategies-DAAB5Dqb.js"
  },
  "/assets/unstract-CiIEE9AA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b065-HDw4P5WLdusi6eqwB7mZOfpX7yA"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 45157,
    "path": "../public/assets/unstract-CiIEE9AA.js"
  },
  "/assets/utils-Bx1o2X-s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-nVHDhhQujrMB+9ob3b4adDgom24"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 16903,
    "path": "../public/assets/utils-Bx1o2X-s.js"
  },
  "/assets/validation-R4CUi8_h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6a9f-l/8bCScaYiEwkF7NFHAC5Y81z0g"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 27295,
    "path": "../public/assets/validation-R4CUi8_h.js"
  },
  "/assets/verify-Cbib_J4S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-42xVwgTwh+cYusAicqRtoK67IoA"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 10017,
    "path": "../public/assets/verify-Cbib_J4S.js"
  },
  "/assets/watch-folder-B8UHzrKj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-sV2t+yDKFumhWB5SF/rqED70Tno"',
    "mtime": "2026-09-24T16:11:46.256Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-B8UHzrKj.js"
  },
  "/assets/what-is-an-extraction-agent-CpoW71He.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3cac-Ppn4cWXv0+fMBZTqRVzohJkrZ/Q"',
    "mtime": "2026-09-24T16:11:46.257Z",
    "size": 15532,
    "path": "../public/assets/what-is-an-extraction-agent-CpoW71He.js"
  },
  "/assets/what-is-structured-data-extraction-C-_USkvz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2927-Q/LYmEWEyrnlNF3PYynustyz23E"',
    "mtime": "2026-09-24T16:11:46.258Z",
    "size": 10535,
    "path": "../public/assets/what-is-structured-data-extraction-C-_USkvz.js"
  },
  "/assets/why-pdf-to-markdown-fails-fu5K8BIS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a658-wVoCqBBH6Op6t33v3qhAYpzn174"',
    "mtime": "2026-09-24T16:11:46.255Z",
    "size": 42584,
    "path": "../public/assets/why-pdf-to-markdown-fails-fu5K8BIS.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-09-24T16:11:45.602Z",
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
