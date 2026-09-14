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
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-09-14T13:52:57.485Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-09-14T13:52:57.486Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-09-14T13:52:57.487Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-09-14T13:52:57.486Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/assets/_-ChYAIHjz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-4ThfcnfR7Ch0CVVN0FSnNv3KzLc"',
    "mtime": "2026-09-14T13:52:57.934Z",
    "size": 410,
    "path": "../public/assets/_-ChYAIHjz.js"
  },
  "/assets/agent-vs-simple-vs-parallel-D05dlRXk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11919-lKdPWp5W/B0xGYtDici6D6iC1nI"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 71961,
    "path": "../public/assets/agent-vs-simple-vs-parallel-D05dlRXk.js"
  },
  "/assets/algolia-CfKKhsrI-Djea0tnp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-aAFo+u8EgwwnGxTb2Mdng6jbzFY"',
    "mtime": "2026-09-14T13:52:57.934Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-Djea0tnp.js"
  },
  "/assets/artifact-format-ktSFwSAw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-9EbCU7lPqPFjcm54Xe6zbfeyKGY"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-ktSFwSAw.js"
  },
  "/assets/building-autonomous-extraction-agent-1OTzwY73.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d1d2-88rTfQGyEm303yazgk3g+yNjj1Q"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 53714,
    "path": "../public/assets/building-autonomous-extraction-agent-1OTzwY73.js"
  },
  "/assets/_-BEadvcAt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-Y22VSlO4orCuBUJ78GISa8medaU"',
    "mtime": "2026-09-14T13:52:57.933Z",
    "size": 410,
    "path": "../public/assets/_-BEadvcAt.js"
  },
  "/assets/chunking-CDZ_BTmA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-lY4+YrCgO1/YEK9pRHH9O50EbnY"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 15938,
    "path": "../public/assets/chunking-CDZ_BTmA.js"
  },
  "/CNAME": {
    "type": "text/plain; charset=utf-8",
    "etag": '"b-vMwX+cTl5yDqPfvnjJ2Kk+BC1jQ"',
    "mtime": "2026-09-14T13:52:57.483Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/chunking-validation-retries-laepcbpG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11fee-uceYGKiQdOLuEgSM9N2qGl62qjI"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 73710,
    "path": "../public/assets/chunking-validation-retries-laepcbpG.js"
  },
  "/assets/docker-CdDyYRB7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9e6a-XB6poDOk4hBevGw0KISN5SPrdjM"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 40554,
    "path": "../public/assets/docker-CdDyYRB7.js"
  },
  "/assets/enrich-records-DIDFLJtV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-1U+NfxSCpaLm341Py3rZxzKTbfM"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-DIDFLJtV.js"
  },
  "/assets/config-DZEM7hKG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f5ee-kRTRrI+bGSbvoM/LAFb//X3MTxo"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 62958,
    "path": "../public/assets/config-DZEM7hKG.js"
  },
  "/assets/events-D6FtrWKi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6373-EKlA4vDZ1cIxA8I6utdfLfAmfqg"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 25459,
    "path": "../public/assets/events-D6FtrWKi.js"
  },
  "/assets/_-B95uT7Fe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d-KcuHe/G2VBWVMcVaSLq5WwUbgIk"',
    "mtime": "2026-09-14T13:52:57.934Z",
    "size": 413,
    "path": "../public/assets/_-B95uT7Fe.js"
  },
  "/assets/extract-BVQbsdDU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-N3C8fokUbaFnkT+iYJexsS+0P9U"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 16745,
    "path": "../public/assets/extract-BVQbsdDU.js"
  },
  "/assets/extract-CKpdYwGC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d8b9-xctUoI4Xj0Tzv1rJ+MrKbKguGGY"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 55481,
    "path": "../public/assets/extract-CKpdYwGC.js"
  },
  "/assets/document-parsing-DzQ0tWcA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-aiIpEYLnS0z6uBUS7ykqNwsqX+Q"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-DzQ0tWcA.js"
  },
  "/assets/extract-realestate-D0Bg6GEm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-161x8pjtuKKbmV4YwL+4Sxl4CgM"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-D0Bg6GEm.js"
  },
  "/assets/extract-invoice-CcZIPjfQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-ezIiXcADXReLR8NGhNMKkyoi8jg"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-CcZIPjfQ.js"
  },
  "/assets/extracting-invoices-at-scale-C1ntCmvu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17232-SviaVFP5F68BkEQk/CJDYMhM/8w"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 94770,
    "path": "../public/assets/extracting-invoices-at-scale-C1ntCmvu.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/index-BtFtTU7x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-iFv55w2R2k0W8Isz1AQuWpLCGTA"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 2075,
    "path": "../public/assets/index-BtFtTU7x.js"
  },
  "/assets/fields-CKa1xnS-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-d/HsmaGek/vwyXLJ6ylkExp2PWA"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 74441,
    "path": "../public/assets/fields-CKa1xnS-.js"
  },
  "/assets/index-C92tE4Tr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6909-DQ/TbuLnh/eqMDpzfIxzsrkrRwQ"',
    "mtime": "2026-09-14T13:52:57.934Z",
    "size": 26889,
    "path": "../public/assets/index-C92tE4Tr.js"
  },
  "/assets/index-CGK5Cqkc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-cSkLsMbjkfU+Xcwz4X9mcrDMr1o"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 3329,
    "path": "../public/assets/index-CGK5Cqkc.js"
  },
  "/assets/index-CGgXyXGp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"df9-pKwdCiw5DsE6FWrSVLqoGXN7SN4"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 3577,
    "path": "../public/assets/index-CGgXyXGp.js"
  },
  "/assets/index-CKhaFbOT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-94xYNIzF6sQHAzKF7WOirCLWyhE"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 37570,
    "path": "../public/assets/index-CKhaFbOT.js"
  },
  "/assets/index-CMlHt0JM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-IEiVvp+W4b2cpC+wSSISe8Pq+BA"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 1055,
    "path": "../public/assets/index-CMlHt0JM.js"
  },
  "/assets/index-COveLQbI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-4ts6kJY3bVyjoVjPO8r9aJZx2hA"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 13717,
    "path": "../public/assets/index-COveLQbI.js"
  },
  "/assets/index-CrYwSbev.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2af6-cFAcvZPSasMoyeaA6f1ArQzROpw"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 10998,
    "path": "../public/assets/index-CrYwSbev.js"
  },
  "/assets/index-DVYnKtdj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-bl3eJhNPfRastDzMjaKRZsubIFU"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 3192,
    "path": "../public/assets/index-DVYnKtdj.js"
  },
  "/assets/index-DarivE7r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28e1-jPULdEv+aa9bmkXZpqWCMxPvwYM"',
    "mtime": "2026-09-14T13:52:57.934Z",
    "size": 10465,
    "path": "../public/assets/index-DarivE7r.js"
  },
  "/assets/index-HyWhjEMa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-8VjS/JXa7BZm5Ky2IJKDKgA/McY"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 3736,
    "path": "../public/assets/index-HyWhjEMa.js"
  },
  "/assets/installation-1n0fWG18.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"61f9-GNfJDKM7GI/6ShdvJdYwBDt+MX0"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 25081,
    "path": "../public/assets/installation-1n0fWG18.js"
  },
  "/assets/installation-CBOVFQ-2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-8Ipm4BuslYNYTblcLkHj7tdTdgY"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 9453,
    "path": "../public/assets/installation-CBOVFQ-2.js"
  },
  "/assets/installation-bAF6bQAF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-oWZ1hHL2aYrrzNWyWTMqUfvNfFc"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 38319,
    "path": "../public/assets/installation-bAF6bQAF.js"
  },
  "/assets/instructor-D4s-_T65.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e9d6-D33Tps0PWVypWCVtWTzd/A/CESg"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 59862,
    "path": "../public/assets/instructor-D4s-_T65.js"
  },
  "/assets/llamaindex-C_iNfCzv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"753a-zX1HCWIaipMsN0k4bvd+MG58mV0"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 30010,
    "path": "../public/assets/llamaindex-C_iNfCzv.js"
  },
  "/assets/main-DWtQdyD5.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13ac3-DCoQwvnkROn7aXmn7mIgf7sR5Hw"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 80579,
    "path": "../public/assets/main-DWtQdyD5.css"
  },
  "/assets/mixedbread-TBJmV3co-Cb4NzAHE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-/7/EdRywZ0gOXQfFSVRVqLUX3Io"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Cb4NzAHE.js"
  },
  "/assets/models-and-providers-SgS53In8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bd14-HIaq19lI2q38tZAf5LG7QLYpM4Q"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 48404,
    "path": "../public/assets/models-and-providers-SgS53In8.js"
  },
  "/assets/orama-cloud-cgTJNLo0-DYXYsXml.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-lLHq8/Oray1/Dl/VUsTg39zmZzw"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-DYXYsXml.js"
  },
  "/assets/manual-llm-calls-DMnBIVn0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b47d-C3ymh2RA/YsrNzjTO0TGI18YCVk"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 111741,
    "path": "../public/assets/manual-llm-calls-DMnBIVn0.js"
  },
  "/assets/main-BVKz-YcK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e3d05-wHOfmF6qnOq32Mg/mMK29jo1jT8"',
    "mtime": "2026-09-14T13:52:57.939Z",
    "size": 933125,
    "path": "../public/assets/main-BVKz-YcK.js"
  },
  "/assets/parse-CpVjxs0Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6097-KT0VG4XrzLK5/v2cz3ndXMLJoS4"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 24727,
    "path": "../public/assets/parse-CpVjxs0Z.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-B8IEhQPR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-WpS1QB13VhVNYaPPH5kWlRxl6mY"',
    "mtime": "2026-09-14T13:52:57.934Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-B8IEhQPR.js"
  },
  "/assets/parse-DyFnTHFO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-q5NU+GpvT6eovafiZhnpS83xJ3E"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 55169,
    "path": "../public/assets/parse-DyFnTHFO.js"
  },
  "/assets/php-CCXIByne.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19124-1NKyqhLq90b0emQPE5JjE6hG9SQ"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 102692,
    "path": "../public/assets/php-CCXIByne.js"
  },
  "/assets/pipeline-CPKnLdwp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-/h/Q8YjXvXc7kiZvas89htFjnaw"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 14066,
    "path": "../public/assets/pipeline-CPKnLdwp.js"
  },
  "/assets/pipelines-CvY-4Uju.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-ier4qUkjl3ZY3kFSR0OEq71QnLI"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 37283,
    "path": "../public/assets/pipelines-CvY-4Uju.js"
  },
  "/assets/process-directory-BVUoDcmC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-ywxVdhFRSapDHJ9y0XAGinIPZ28"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 50658,
    "path": "../public/assets/process-directory-BVUoDcmC.js"
  },
  "/assets/quickstart-jFihp3we.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-rNmY6lfsajssZNNG8MYPgp8AC/I"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 25396,
    "path": "../public/assets/quickstart-jFihp3we.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/static-BUXJwBmr-DktDx9yo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-wUznYc9uPCCIVfQuRbbx+X5ZSzw"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-DktDx9yo.js"
  },
  "/assets/strategies-CILA7c1h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"188c9-YJbEY3Jj94/R+kXil5SyDKglwvI"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 100553,
    "path": "../public/assets/strategies-CILA7c1h.js"
  },
  "/assets/unstract-Dayr36Gs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b065-TjmG0eKjodRz49tWqjMLYjDjjIU"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 45157,
    "path": "../public/assets/unstract-Dayr36Gs.js"
  },
  "/assets/usage-BCOCGVVa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-ISzw4bNpzdDXnIcwgNbqh7G5JVI"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 36829,
    "path": "../public/assets/usage-BCOCGVVa.js"
  },
  "/assets/utils-Bgn5_C5I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-mfGZkyruOdw9bKir051kZPdpLF4"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 16903,
    "path": "../public/assets/utils-Bgn5_C5I.js"
  },
  "/assets/validation-jBU3ru9B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-fpn6SXdMNzJbrpq0e9szvnHugls"',
    "mtime": "2026-09-14T13:52:57.937Z",
    "size": 21573,
    "path": "../public/assets/validation-jBU3ru9B.js"
  },
  "/assets/verify-C6VscS_j.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-+NmuyGrvRwvJI0pLaNWQNlnraMQ"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 10017,
    "path": "../public/assets/verify-C6VscS_j.js"
  },
  "/assets/watch-folder-BvZGc8Tr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-DUKRagduGW8S6Z7Q88hQUQCDlDs"',
    "mtime": "2026-09-14T13:52:57.936Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-BvZGc8Tr.js"
  },
  "/assets/what-is-an-extraction-agent-Msrynkhs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3cac-ar9+rJADaIclnW1QvCA/dxCug9w"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 15532,
    "path": "../public/assets/what-is-an-extraction-agent-Msrynkhs.js"
  },
  "/assets/what-is-structured-data-extraction-CRCBQTQU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2927-tNo+ts7yrC+e75efgT+JwLRZgUQ"',
    "mtime": "2026-09-14T13:52:57.938Z",
    "size": 10535,
    "path": "../public/assets/what-is-structured-data-extraction-CRCBQTQU.js"
  },
  "/assets/search-default-C-kvGV-Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3b1-nBohsToDP2q06vaM9RkPutBcAWo"',
    "mtime": "2026-09-14T13:52:57.934Z",
    "size": 945,
    "path": "../public/assets/search-default-C-kvGV-Y.js"
  },
  "/assets/why-pdf-to-markdown-fails-BKREOYpu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a658-7L6FCBcHSTOKtn1JB2HGcjOmU4s"',
    "mtime": "2026-09-14T13:52:57.935Z",
    "size": 42584,
    "path": "../public/assets/why-pdf-to-markdown-fails-BKREOYpu.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-09-14T13:52:57.532Z",
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
