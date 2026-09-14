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
    "mtime": "2026-09-14T11:58:44.710Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-09-14T11:58:44.712Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-09-14T11:58:44.712Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-09-14T11:58:44.712Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/_-C5j_lKgH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-3adncdNpukMDIrvPHbefiJ6vLLk"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 410,
    "path": "../public/assets/_-C5j_lKgH.js"
  },
  "/assets/_-CFrCt1zG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-8x36M14qI1MgYQ9uQ7WdFrM93cs"',
    "mtime": "2026-09-14T11:58:45.606Z",
    "size": 410,
    "path": "../public/assets/_-CFrCt1zG.js"
  },
  "/assets/_-DFjdNpx9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d-+2TOPYQI+wXO9rAAy6+rJ2pC8Q4"',
    "mtime": "2026-09-14T11:58:45.606Z",
    "size": 413,
    "path": "../public/assets/_-DFjdNpx9.js"
  },
  "/assets/agent-vs-simple-vs-parallel-Dqvqp8BI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11919-4ViN5euF8iByV7ZdYVhbrv7YvFo"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 71961,
    "path": "../public/assets/agent-vs-simple-vs-parallel-Dqvqp8BI.js"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-09-14T11:58:44.714Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/assets/algolia-CfKKhsrI-CiJjO3wP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-5xpB11wXgSsPJUtNxhd1M8eGRos"',
    "mtime": "2026-09-14T11:58:45.607Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-CiJjO3wP.js"
  },
  "/assets/chunking-CRv7adOs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-UfRHUjhfBO6s94o0q8Y5wwxEsL4"',
    "mtime": "2026-09-14T11:58:45.610Z",
    "size": 15938,
    "path": "../public/assets/chunking-CRv7adOs.js"
  },
  "/assets/building-autonomous-extraction-agent-BRdlb__D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d1d2-SgITBhO04K1g6BcFsBqoLRJM8uU"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 53714,
    "path": "../public/assets/building-autonomous-extraction-agent-BRdlb__D.js"
  },
  "/assets/artifact-format-C2ifLNjf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-l6F7GNzcepnEY0MqcE+DNp/IHC0"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-C2ifLNjf.js"
  },
  "/assets/chunking-validation-retries-D9QYbeed.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11fee-MgviCLiiMOS5L5ZmKuS8UFI9CUA"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 73710,
    "path": "../public/assets/chunking-validation-retries-D9QYbeed.js"
  },
  "/assets/docker-D6YfC1sE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9b71-Hcbe5sFjTD8E5i1Ggc9zWc6ipp8"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 39793,
    "path": "../public/assets/docker-D6YfC1sE.js"
  },
  "/assets/config-BiBVt5es.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f5ee-Uaw9DZFqAkW46xToNORbd09yAT4"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 62958,
    "path": "../public/assets/config-BiBVt5es.js"
  },
  "/assets/events-BAgf7Oh4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6373-aUyGBZPv9BpAFuoQ49NXd/+HV3c"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 25459,
    "path": "../public/assets/events-BAgf7Oh4.js"
  },
  "/assets/extract-8OZE8cwF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d8b9-qlj2pTs/EnjdHdzYviUMV04GauQ"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 55481,
    "path": "../public/assets/extract-8OZE8cwF.js"
  },
  "/assets/extract-invoice-DNFu-ai6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-zi42TmhMrq0kTKsNrXLB8o3OVrI"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-DNFu-ai6.js"
  },
  "/assets/document-parsing-KCfeJo3y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-j0Z+7Uux4clN0hdDKWaIFNlR6pA"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-KCfeJo3y.js"
  },
  "/assets/extract-realestate-BFvOPqZh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-Mb6bv6zB6mZzYhr74tHEiU1DYuw"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-BFvOPqZh.js"
  },
  "/assets/enrich-records-CpNhP02v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-xRzmePcbmVGV693O3qxJoE5hv1g"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-CpNhP02v.js"
  },
  "/assets/extract-BAgLvT0L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-Lx15fWPtWEh5OXQVowE0y9hkWIA"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 16745,
    "path": "../public/assets/extract-BAgLvT0L.js"
  },
  "/assets/extracting-invoices-at-scale-DQKEeqjI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17232-F0I7K1rf5cVs1lYNBsrl6N7v8P4"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 94770,
    "path": "../public/assets/extracting-invoices-at-scale-DQKEeqjI.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-09-14T11:58:45.607Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/index-C27fBik-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-M53k7qXV3Lx2i/MZGKyixSKFEas"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 3736,
    "path": "../public/assets/index-C27fBik-.js"
  },
  "/assets/index-BnDk2SsO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-7MyJKPOVVpCwRecTHEbV4YCdrec"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 3192,
    "path": "../public/assets/index-BnDk2SsO.js"
  },
  "/assets/index-C2gQClGQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-QHHpBCdYH+6hCZ4qPaIWMhGwwE8"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 13717,
    "path": "../public/assets/index-C2gQClGQ.js"
  },
  "/assets/index-CLPcS2dl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-dZbvTDdbm8mArwuLKnPybvc92jk"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 1055,
    "path": "../public/assets/index-CLPcS2dl.js"
  },
  "/assets/index-CKLwcrDn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2af6-l79h/sC+Rm3E6j3eqZKpTA9heRg"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 10998,
    "path": "../public/assets/index-CKLwcrDn.js"
  },
  "/assets/index-ChcjAivH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-nx97IPJVwtHlgiRUtiiMPfWg/jk"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 2075,
    "path": "../public/assets/index-ChcjAivH.js"
  },
  "/assets/index-D6lL81hT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"df9-pasYirz4c4oYbBxPEjxv1C5NsoY"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 3577,
    "path": "../public/assets/index-D6lL81hT.js"
  },
  "/assets/index-DCZvsDYp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-QE0jB6jWHQvvHPk+QwoSzMwCRZ8"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 3329,
    "path": "../public/assets/index-DCZvsDYp.js"
  },
  "/assets/index-DnvSSoDv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28e1-OQIkr15gH5cBPpEuDDZMSOI25/s"',
    "mtime": "2026-09-14T11:58:45.606Z",
    "size": 10465,
    "path": "../public/assets/index-DnvSSoDv.js"
  },
  "/assets/index-MXhybm3x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-E5S6N2RwK0MMpNYVedrvP6aePD0"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 37570,
    "path": "../public/assets/index-MXhybm3x.js"
  },
  "/assets/installation-CutFfDv-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-8l86DE+dOmCQ3n4sDKgbrldkAKA"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 9453,
    "path": "../public/assets/installation-CutFfDv-.js"
  },
  "/assets/installation-CbofOxzA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"61f9-wm8Kdrk2JwnIl6tWwBjYK5mRnrE"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 25081,
    "path": "../public/assets/installation-CbofOxzA.js"
  },
  "/assets/instructor--BmeCi08.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e9d6-q5LW2RB8fSF+/M/AHD7BcZJVSlU"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 59862,
    "path": "../public/assets/instructor--BmeCi08.js"
  },
  "/assets/installation-DRBz5O2p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-CcXByOyQvzmND/ZH9QxiwnrOPv0"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 38319,
    "path": "../public/assets/installation-DRBz5O2p.js"
  },
  "/assets/llamaindex-D94xLC2V.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"753a-NDrQFMYDdhMHKXf/TmWZmQp/iUQ"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 30010,
    "path": "../public/assets/llamaindex-D94xLC2V.js"
  },
  "/assets/fields-DcRdEsMf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-Zxlbh/c+WZdngqSu+ho/WalR9N0"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 74441,
    "path": "../public/assets/fields-DcRdEsMf.js"
  },
  "/assets/index-BSnwDL6b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6909-4EoGjmtRAHZz/Q8OyE1Kx+TyyKQ"',
    "mtime": "2026-09-14T11:58:45.605Z",
    "size": 26889,
    "path": "../public/assets/index-BSnwDL6b.js"
  },
  "/assets/main-DWtQdyD5.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13ac3-DCoQwvnkROn7aXmn7mIgf7sR5Hw"',
    "mtime": "2026-09-14T11:58:45.605Z",
    "size": 80579,
    "path": "../public/assets/main-DWtQdyD5.css"
  },
  "/assets/models-and-providers-CHHoXM18.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bd14-61fDt38GB8u/xuf+oVJROwe655E"',
    "mtime": "2026-09-14T11:58:45.610Z",
    "size": 48404,
    "path": "../public/assets/models-and-providers-CHHoXM18.js"
  },
  "/assets/manual-llm-calls-Cb5N-nqE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b47d-sagH6erAMfZluT3kP8n7DjcnglM"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 111741,
    "path": "../public/assets/manual-llm-calls-Cb5N-nqE.js"
  },
  "/assets/mixedbread-TBJmV3co-Cb4NzAHE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-/7/EdRywZ0gOXQfFSVRVqLUX3Io"',
    "mtime": "2026-09-14T11:58:45.607Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Cb4NzAHE.js"
  },
  "/assets/orama-cloud-cgTJNLo0-B1XB6rmO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-YyO71kiD+zdM3Tzd/bMblLFLe7w"',
    "mtime": "2026-09-14T11:58:45.606Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-B1XB6rmO.js"
  },
  "/assets/main-DRw0BXZL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e3d05-yhCtgG/xkUbAgHcwTsqJbMt1/Fk"',
    "mtime": "2026-09-14T11:58:45.610Z",
    "size": 933125,
    "path": "../public/assets/main-DRw0BXZL.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-DN9hySN3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-vSpTuGAYjieVT6YeduKsOjR9d/I"',
    "mtime": "2026-09-14T11:58:45.607Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-DN9hySN3.js"
  },
  "/assets/parse-9Lz6jyf3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-5UyvWD5+7Tg8e32M+PUEY51uvhc"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 55169,
    "path": "../public/assets/parse-9Lz6jyf3.js"
  },
  "/assets/php-BUJ7nvEG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19127-3B3qsyizq1uOUjarlQJT8z8LZm0"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 102695,
    "path": "../public/assets/php-BUJ7nvEG.js"
  },
  "/assets/pipeline-BO4xvouM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-NIPAdFYiDTQuV93UK38XHbOao18"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 14066,
    "path": "../public/assets/pipeline-BO4xvouM.js"
  },
  "/assets/pipelines-R3Lve77k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-wKWQr8/xNy4Xc1Czd2n8udwPzAE"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 37283,
    "path": "../public/assets/pipelines-R3Lve77k.js"
  },
  "/assets/parse-C-M1pIO2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6097-GqOEVenxNz+4nVzyyuEcD1E3LEc"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 24727,
    "path": "../public/assets/parse-C-M1pIO2.js"
  },
  "/assets/quickstart-BDJQR5oP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-sWs7XuLk1IaPQEzIXTAiOW6scuA"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 25396,
    "path": "../public/assets/quickstart-BDJQR5oP.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/process-directory-Bt_hD_gn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-4y1TIMPIC39isRYTl09VjXswubg"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 50658,
    "path": "../public/assets/process-directory-Bt_hD_gn.js"
  },
  "/assets/static-BUXJwBmr-Bi9YvUQL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-Yay4fnGPVapgJKkTXQR1Q6SUrk8"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-Bi9YvUQL.js"
  },
  "/assets/strategies-3vhhKVZi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"188c9-082oj5FlvOHCt/1kBONfBMjdNkg"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 100553,
    "path": "../public/assets/strategies-3vhhKVZi.js"
  },
  "/assets/search-default-EXTOYVn6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3b1-7HVqO8HsTHWFOxpFAJxDPRurEes"',
    "mtime": "2026-09-14T11:58:45.606Z",
    "size": 945,
    "path": "../public/assets/search-default-EXTOYVn6.js"
  },
  "/assets/unstract-DafWpITa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b065-NMnS45FhLlvr0KZ4WCUJ21dnqvw"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 45157,
    "path": "../public/assets/unstract-DafWpITa.js"
  },
  "/assets/validation-DkcK1vbp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-EE04xzhc9gKDE8/q/sqVbuRvLvc"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 21573,
    "path": "../public/assets/validation-DkcK1vbp.js"
  },
  "/assets/verify-DQZVLy1v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-aqITp5BNMH6IIGtPQUuDfNUL0GE"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 10017,
    "path": "../public/assets/verify-DQZVLy1v.js"
  },
  "/assets/what-is-an-extraction-agent-Br0Gi94w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3cac-QyPQ4MkQNR3FG8yPvDU2Afq/ziw"',
    "mtime": "2026-09-14T11:58:45.610Z",
    "size": 15532,
    "path": "../public/assets/what-is-an-extraction-agent-Br0Gi94w.js"
  },
  "/assets/watch-folder-C7E1R7Pi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-w5cETwuBGqb76EQwtVEXnxFfgiI"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-C7E1R7Pi.js"
  },
  "/assets/what-is-structured-data-extraction-BlqEtaWM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2927-Th4YxSlkE3bHFZqtULmL3L3mbF0"',
    "mtime": "2026-09-14T11:58:45.610Z",
    "size": 10535,
    "path": "../public/assets/what-is-structured-data-extraction-BlqEtaWM.js"
  },
  "/assets/why-pdf-to-markdown-fails-BbqW5E8X.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a658-+JtqrseBGsZ32yIKMKR43qkRhoE"',
    "mtime": "2026-09-14T11:58:45.608Z",
    "size": 42584,
    "path": "../public/assets/why-pdf-to-markdown-fails-BbqW5E8X.js"
  },
  "/assets/usage-CHtS0sVC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-MFGzmxEyyBjIgUWAZzUmHQMUME8"',
    "mtime": "2026-09-14T11:58:45.610Z",
    "size": 36829,
    "path": "../public/assets/usage-CHtS0sVC.js"
  },
  "/assets/utils-9BEALKWn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-1Rdwa7OhHjpTGUSEs7vx0BzpHz8"',
    "mtime": "2026-09-14T11:58:45.609Z",
    "size": 16903,
    "path": "../public/assets/utils-9BEALKWn.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-09-14T11:58:44.760Z",
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
