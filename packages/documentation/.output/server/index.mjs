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
    "mtime": "2026-09-14T22:13:00.336Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-09-14T22:13:00.339Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/assets/_-C3e_hZCK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-HDtb1PD4h28n4rIRkOpydPdYZ6o"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 410,
    "path": "../public/assets/_-C3e_hZCK.js"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-09-14T22:13:00.338Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/_-Cmxb-3hd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-ygEpS1EiHoxPRZK9GthpIODq9KU"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 410,
    "path": "../public/assets/_-Cmxb-3hd.js"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-09-14T22:13:00.339Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/assets/_-DwilBekg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d-vu+M5+VmmYdNV3Ozwfq142h1vvY"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 413,
    "path": "../public/assets/_-DwilBekg.js"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-09-14T22:13:00.340Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/assets/algolia-CfKKhsrI-D26syjKR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-XJery/Vm8KBfdthTdZIXyRaAIVU"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-D26syjKR.js"
  },
  "/assets/artifact-format-D2_cRTnV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10ca4-h6g6Y9kQUpb66NgD4cHld+QAmVA"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 68772,
    "path": "../public/assets/artifact-format-D2_cRTnV.js"
  },
  "/assets/chunking-B689P6Sx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-lolp4EXjy8bcmK9SNav2YZwmY1Y"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 15938,
    "path": "../public/assets/chunking-B689P6Sx.js"
  },
  "/assets/agent-vs-simple-vs-parallel-zOnMbGJp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11919-HVaI1f6JUibtAZS5zu7jAI+x4Mw"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 71961,
    "path": "../public/assets/agent-vs-simple-vs-parallel-zOnMbGJp.js"
  },
  "/assets/chunking-validation-retries-Du5hPhkq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11fee-fmIRZtX8OXsJuBzCR2ZWn4CBuVE"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 73710,
    "path": "../public/assets/chunking-validation-retries-Du5hPhkq.js"
  },
  "/assets/building-autonomous-extraction-agent-B2XVuomg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d1d2-y0z1EDHz4DPaP1/hJ2+T6EN0jWI"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 53714,
    "path": "../public/assets/building-autonomous-extraction-agent-B2XVuomg.js"
  },
  "/assets/docker-DRzt1bZL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9e6a-ZLAmOjOfX9HcGOhtGQVBv9EPjvU"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 40554,
    "path": "../public/assets/docker-DRzt1bZL.js"
  },
  "/assets/config-C_7QVlsp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10030-OoylKIN7LiN6EPUscWMnLpty6B4"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 65584,
    "path": "../public/assets/config-C_7QVlsp.js"
  },
  "/assets/document-parsing-AYoEkO6q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"20ad9-Rb60OmZ2HXs95qtVu/uZ/UWxAZ0"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 133849,
    "path": "../public/assets/document-parsing-AYoEkO6q.js"
  },
  "/assets/enrich-records-Bb9ru43Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-I9iHxCQ8ZG7EMaMTyyU6UOl8ixk"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-Bb9ru43Y.js"
  },
  "/assets/events-CucHkJ8O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a9a1-CJ3M9MYGfhWXnSSyv23VRJC8w1U"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 43425,
    "path": "../public/assets/events-CucHkJ8O.js"
  },
  "/assets/extract-DW5Qtm1u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-EHJy+iJjZyZsJrcHEtIKFk7PlSw"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 16745,
    "path": "../public/assets/extract-DW5Qtm1u.js"
  },
  "/assets/extract-invoice-CbgSDPpY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-9fAMR9UTYdHwnU7ixAfMh1oYGJg"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-CbgSDPpY.js"
  },
  "/assets/extract-BcJfebC2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fe66-HjhnkdoVSG2g9tuNHRUAedCUxm4"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 65126,
    "path": "../public/assets/extract-BcJfebC2.js"
  },
  "/assets/extract-realestate-Cwvpl47g.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-99MiTPupXb1eZZtgLrARUcMcyao"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-Cwvpl47g.js"
  },
  "/assets/extracting-invoices-at-scale-BNzByRUA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17232-bVqs0KrEzlSGr1iaG5QJWJ6L7qQ"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 94770,
    "path": "../public/assets/extracting-invoices-at-scale-BNzByRUA.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-CVvIJiNe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-ZEzhqsEwi73Bje3XyIyFPuCRcSk"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 74441,
    "path": "../public/assets/fields-CVvIJiNe.js"
  },
  "/assets/index-BUgpsdI4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"df9-7BNMylqG40y4eoDosL0aLSFsqxw"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 3577,
    "path": "../public/assets/index-BUgpsdI4.js"
  },
  "/assets/index-BZ1Ll5cw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-BPR9NeFE/P8n8aINhRkXtCWzta0"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 3736,
    "path": "../public/assets/index-BZ1Ll5cw.js"
  },
  "/assets/index-Bazb71L8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-JhQXTCFOZFakCHEOrzGCHMH61Ag"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 3329,
    "path": "../public/assets/index-Bazb71L8.js"
  },
  "/assets/index-C1UBNmg1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6909-HAUXenyG2Wps3BPwreOFE53FugA"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 26889,
    "path": "../public/assets/index-C1UBNmg1.js"
  },
  "/assets/index-C2w9vBzf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-pFVurOEsmF1U+5I/t8JuP+aIQ40"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 37570,
    "path": "../public/assets/index-C2w9vBzf.js"
  },
  "/assets/index-CFzyMFx3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-erNj6Ljy5m3twg4Qpd/Uqr4SgBI"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 3192,
    "path": "../public/assets/index-CFzyMFx3.js"
  },
  "/assets/index-CptZ9x87.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-NyN47WIOBqYCCLZvRLyUbvwNJbc"',
    "mtime": "2026-09-14T22:13:00.757Z",
    "size": 13717,
    "path": "../public/assets/index-CptZ9x87.js"
  },
  "/assets/index-FgGceZHP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28e1-wJ2IeDSt+upcRIbkbVYzhNjA5uM"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 10465,
    "path": "../public/assets/index-FgGceZHP.js"
  },
  "/assets/index-HpARbHId.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2af6-b6l6DfZOOle2UJM4CCCXOSJilXw"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 10998,
    "path": "../public/assets/index-HpARbHId.js"
  },
  "/assets/index-KjEkLZWZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-B6V0OiwS4ZdBHpPk6iEjNReNnHM"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 1055,
    "path": "../public/assets/index-KjEkLZWZ.js"
  },
  "/assets/index-TfU87z-1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-ZEcA276ZMht96ymYjMry7SZayVc"',
    "mtime": "2026-09-14T22:13:00.757Z",
    "size": 2075,
    "path": "../public/assets/index-TfU87z-1.js"
  },
  "/assets/installation-B6wEF_Qs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"61f9-Z9ua5cKk7BJNXxf5KHUnZ4rtdMc"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 25081,
    "path": "../public/assets/installation-B6wEF_Qs.js"
  },
  "/assets/installation-YY3CJ3q4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-6zu5oCjhz6oSCOvmBwfcaiZ+y1Q"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 9453,
    "path": "../public/assets/installation-YY3CJ3q4.js"
  },
  "/assets/installation-Dp_e3MEY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-KPE31VzN1NkcglPJz4IXn0E+Zcs"',
    "mtime": "2026-09-14T22:13:00.757Z",
    "size": 38319,
    "path": "../public/assets/installation-Dp_e3MEY.js"
  },
  "/assets/llamaindex-DOub2A4n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"753a-exFtdcuomCoEbjb4nsCLd2OgR2c"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 30010,
    "path": "../public/assets/llamaindex-DOub2A4n.js"
  },
  "/assets/instructor-BzXa3_0L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e9d6-oazA2a4gBYCzytFM6rf2jS1zckc"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 59862,
    "path": "../public/assets/instructor-BzXa3_0L.js"
  },
  "/assets/main-DWtQdyD5.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13ac3-DCoQwvnkROn7aXmn7mIgf7sR5Hw"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 80579,
    "path": "../public/assets/main-DWtQdyD5.css"
  },
  "/assets/manual-llm-calls-BXgL9mfg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b47d-YoeT/hmrxh9yHkEmZIdEgRdUJss"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 111741,
    "path": "../public/assets/manual-llm-calls-BXgL9mfg.js"
  },
  "/assets/mixedbread-TBJmV3co-Cb4NzAHE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-/7/EdRywZ0gOXQfFSVRVqLUX3Io"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Cb4NzAHE.js"
  },
  "/assets/orama-cloud-cgTJNLo0-BY97ZLVW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-Tpd6/+0e/0PwKAt1orZpNLjsXhg"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-BY97ZLVW.js"
  },
  "/assets/models-and-providers-CGzCQPr3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dbc9-GzqqTNoaDBjb8MSZK6SItH24ZKc"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 56265,
    "path": "../public/assets/models-and-providers-CGzCQPr3.js"
  },
  "/assets/main-n99zPsOp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e3d05-VSLk5FCNjwatRfI/QpSxY3CqEKk"',
    "mtime": "2026-09-14T22:13:00.757Z",
    "size": 933125,
    "path": "../public/assets/main-n99zPsOp.js"
  },
  "/assets/pipelines-C6P9-huX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-Ig7n4tFwdNsvb/OGZHwqCehXO+4"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 37283,
    "path": "../public/assets/pipelines-C6P9-huX.js"
  },
  "/assets/parse-BJN8u8cN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb55-uD9iLPQiS2aY5+gnB0Bb1X2SpqI"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 60245,
    "path": "../public/assets/parse-BJN8u8cN.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-C8A22fiF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-lU+PW0OQAlAD1sougW//IS2u/DU"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-C8A22fiF.js"
  },
  "/assets/parse-CtWk2Xri.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"86c5-VfGsmUt0CG9D7jrBoWjWPchMG/8"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 34501,
    "path": "../public/assets/parse-CtWk2Xri.js"
  },
  "/assets/quickstart-C01GRaOH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-Grr1XW+8qnIlgnW48x/JdScKBVA"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 25396,
    "path": "../public/assets/quickstart-C01GRaOH.js"
  },
  "/assets/process-directory-TT_XaYrb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-ohHFrTfOEXrd5cRuySHxFxowjsw"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 50658,
    "path": "../public/assets/process-directory-TT_XaYrb.js"
  },
  "/assets/pipeline-B9oGx0tx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-24IIby5dj+KNsyxrk2/wgkJf91o"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 14066,
    "path": "../public/assets/pipeline-B9oGx0tx.js"
  },
  "/assets/php-x9jVHgue.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19124-2aMYws9cw56dFsu3ED+z2QJbpTU"',
    "mtime": "2026-09-14T22:13:00.757Z",
    "size": 102692,
    "path": "../public/assets/php-x9jVHgue.js"
  },
  "/assets/search-default-CvPhjjuu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3b1-lT51KdrtFBrvisDjslS52VTNmIE"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 945,
    "path": "../public/assets/search-default-CvPhjjuu.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/strategies-T31x-u8L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d8b-ucCsC3FuQwkcjJeySR08KR9e8tg"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 105867,
    "path": "../public/assets/strategies-T31x-u8L.js"
  },
  "/assets/utils-DardzaqM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-qC2JdcR5l1TcfikgmxlVtFdSfqE"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 16903,
    "path": "../public/assets/utils-DardzaqM.js"
  },
  "/assets/static-BUXJwBmr-B0xdpIvG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-sncLbCwJQuCQ5JnZmQg6M13wyFs"',
    "mtime": "2026-09-14T22:13:00.755Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-B0xdpIvG.js"
  },
  "/assets/usage-iM0zOYQ9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-aF79NL8P+2QmdpGXZoxgbaGDR9E"',
    "mtime": "2026-09-14T22:13:00.757Z",
    "size": 36829,
    "path": "../public/assets/usage-iM0zOYQ9.js"
  },
  "/assets/verify-Bjl1y31A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-Amn4Dhx65rKN0ZWjWzDosQcAfLg"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 10017,
    "path": "../public/assets/verify-Bjl1y31A.js"
  },
  "/assets/watch-folder-bUNR4Nu5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-gV8P96wd3TkEZDN9hXvJbdHMSBI"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-bUNR4Nu5.js"
  },
  "/assets/what-is-an-extraction-agent-Bq-idTKJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3cac-Yg1rp9k4E8dfjxEuqhss9uVWhvQ"',
    "mtime": "2026-09-14T22:13:00.757Z",
    "size": 15532,
    "path": "../public/assets/what-is-an-extraction-agent-Bq-idTKJ.js"
  },
  "/assets/unstract-pgkVR6JU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b065-x9lFCSMxft7oA20xuU2iWSmKizo"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 45157,
    "path": "../public/assets/unstract-pgkVR6JU.js"
  },
  "/assets/what-is-structured-data-extraction-AW7XqNdd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2927-BG+pGZnYsVbom9kzpW4lsBzwBPM"',
    "mtime": "2026-09-14T22:13:00.757Z",
    "size": 10535,
    "path": "../public/assets/what-is-structured-data-extraction-AW7XqNdd.js"
  },
  "/assets/why-pdf-to-markdown-fails-CQnf3qGq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a658-RTH5132SoTadoDC0Jfm0UdzfzYE"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 42584,
    "path": "../public/assets/why-pdf-to-markdown-fails-CQnf3qGq.js"
  },
  "/assets/validation-DN9TdhUZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-7UF16VJ18gFg9xmqeKFDP9yCXvI"',
    "mtime": "2026-09-14T22:13:00.756Z",
    "size": 21573,
    "path": "../public/assets/validation-DN9TdhUZ.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-09-14T22:13:00.354Z",
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
