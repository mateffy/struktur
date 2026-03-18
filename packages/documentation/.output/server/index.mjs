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
    "mtime": "2026-03-18T13:42:58.774Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-03-18T13:42:58.776Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-18T13:42:58.776Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-03-18T13:42:58.777Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-03-18T13:42:58.776Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/assets/_-BkLlU_Jm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"198-acTO6pwNq868GvQwtRu09HE1Bo4"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 408,
    "path": "../public/assets/_-BkLlU_Jm.js"
  },
  "/assets/_-ao4GE27D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-9RbqjyTHC1YwP27uAJWdG68Y9HU"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 410,
    "path": "../public/assets/_-ao4GE27D.js"
  },
  "/assets/_-CgCEbS7y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-xsojrQBFsgEMov3dEv/ukhFZbWA"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 410,
    "path": "../public/assets/_-CgCEbS7y.js"
  },
  "/assets/agent-vs-simple-vs-parallel-DhzlXQFh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11919-/ZY7otZq9GYQzN8Nffa1AMRiPls"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 71961,
    "path": "../public/assets/agent-vs-simple-vs-parallel-DhzlXQFh.js"
  },
  "/assets/algolia-CfKKhsrI-Sc9wf-Yz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-9aGzV0iWTOJObM954ohQ+RUj1zc"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-Sc9wf-Yz.js"
  },
  "/assets/chunking-Ce0-fQIU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-6SIk54+0gJocjrD5fH1QgDYLn7w"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 15938,
    "path": "../public/assets/chunking-Ce0-fQIU.js"
  },
  "/assets/chunking-validation-retries-OD-iTLyK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11fe4-7gMBvZxRBdd8QI4VSMlvg/uHAIo"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 73700,
    "path": "../public/assets/chunking-validation-retries-OD-iTLyK.js"
  },
  "/assets/config-cjR82Le7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f5ee-C6gxQkpCg/RNHtH4ebX5unmEnN8"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 62958,
    "path": "../public/assets/config-cjR82Le7.js"
  },
  "/assets/building-autonomous-extraction-agent-BseB8sDA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d1d2-KmSriosPPIrDvmcs75gIWiu9Ne8"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 53714,
    "path": "../public/assets/building-autonomous-extraction-agent-BseB8sDA.js"
  },
  "/assets/artifact-format-BILVJysS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-CcHjd64I3Hd0oBrskz4XNmaGJbw"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-BILVJysS.js"
  },
  "/assets/enrich-records-tSXARzBD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-JtESjwwj2un3uPH+b/R3x78LZnQ"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-tSXARzBD.js"
  },
  "/assets/document-parsing-CNdED7eL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-I1ru0CjG86qfRw+4l+mlq9X4se4"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-CNdED7eL.js"
  },
  "/assets/extract-Bzzv-GuT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"adf8-OYMFiprYwgu/cVA/ix2r2nPZQyc"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 44536,
    "path": "../public/assets/extract-Bzzv-GuT.js"
  },
  "/assets/extract-CI5JUQbr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-NNtrI+XZTxVApE6mfFZlHOIEFqU"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 16745,
    "path": "../public/assets/extract-CI5JUQbr.js"
  },
  "/assets/events-B7VP1Waq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"459b-m+NQYW4/qBSva8faUdrOHZyh3IA"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 17819,
    "path": "../public/assets/events-B7VP1Waq.js"
  },
  "/assets/extract-invoice-JX_Nx3jj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-9tp8DmabxbWFoPEgrkaGf0D+G7Q"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-JX_Nx3jj.js"
  },
  "/assets/extract-realestate-3xlJb7Y0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-UI7paKiierlQAh6u70/sUlrdNj8"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-3xlJb7Y0.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/extracting-invoices-at-scale-DbXPFlE7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17228-DzLd88vzQRUJsEQJSyw9p2KlYv0"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 94760,
    "path": "../public/assets/extracting-invoices-at-scale-DbXPFlE7.js"
  },
  "/assets/fields-DGsiqw6m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-iItx6nzuU9AGwwekdV7fAWzqIHA"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 74441,
    "path": "../public/assets/fields-DGsiqw6m.js"
  },
  "/assets/index-BmZ2C87N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-EbmK1VPEPXQShX8jDGB0JXLoOjU"',
    "mtime": "2026-03-18T13:42:59.297Z",
    "size": 3736,
    "path": "../public/assets/index-BmZ2C87N.js"
  },
  "/assets/index-BMDJDTP_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-CoWg0cTi0bu4mz4qBUoHcASWy4k"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 2075,
    "path": "../public/assets/index-BMDJDTP_.js"
  },
  "/assets/index-BvY_DBBm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-0AMe3WU/bdAzUUd+KCD3EJnjqk8"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 13717,
    "path": "../public/assets/index-BvY_DBBm.js"
  },
  "/assets/index-C5Nkj1wN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-wWQxO430z2+15GwnYmUeklO9tUk"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 3192,
    "path": "../public/assets/index-C5Nkj1wN.js"
  },
  "/assets/index-CTealGz-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-dyhZ6Pk+JJIBXljWe/4sTRkW87A"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 3329,
    "path": "../public/assets/index-CTealGz-.js"
  },
  "/assets/index-C16M0Pxw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-ppzFZ50IkCH2lcSWkNWRiJaFf50"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 37570,
    "path": "../public/assets/index-C16M0Pxw.js"
  },
  "/assets/index-Dd5Crpxl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6807-LMXTyeMz8Vy357iiq/fOsp5TYbo"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 26631,
    "path": "../public/assets/index-Dd5Crpxl.js"
  },
  "/assets/index-DhGm6LKW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"df9-M3fp66ATcXMJ/SllsPYhMr7zcsk"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 3577,
    "path": "../public/assets/index-DhGm6LKW.js"
  },
  "/assets/index-MHkXnrwN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2aba-y7xhuDZ0l8lXUKUCFxu3PYEQ65o"',
    "mtime": "2026-03-18T13:42:59.297Z",
    "size": 10938,
    "path": "../public/assets/index-MHkXnrwN.js"
  },
  "/assets/index-o4hs4ah-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28e1-Dn6FfprXoiTVloVJS94pmDl7ijs"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 10465,
    "path": "../public/assets/index-o4hs4ah-.js"
  },
  "/assets/installation-E_zVXNCV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-K/FllhBrw+aD9JKO06HCleg/ejc"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 9453,
    "path": "../public/assets/installation-E_zVXNCV.js"
  },
  "/assets/installation-DOu8J9dr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-bgHsV2XyYlPAgIWyNqWWQEzUuc4"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 38319,
    "path": "../public/assets/installation-DOu8J9dr.js"
  },
  "/assets/llamaindex-CJiYsJ8m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7526-775nAXdw3MRZUY796vnjWl+Y2JQ"',
    "mtime": "2026-03-18T13:42:59.297Z",
    "size": 29990,
    "path": "../public/assets/llamaindex-CJiYsJ8m.js"
  },
  "/assets/index-y6lhDUoN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-ILtjjGKCwKegSL0kKfcCmQOm+PI"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 1055,
    "path": "../public/assets/index-y6lhDUoN.js"
  },
  "/assets/installation-P_Z-Ix-P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"526b-54uadH7P/GF2qZMCZHNlLK6Gfik"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 21099,
    "path": "../public/assets/installation-P_Z-Ix-P.js"
  },
  "/assets/instructor-h0vWuJtg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e9b8-Vt+0Ty8NGU72tDwoyycvfNEbqTs"',
    "mtime": "2026-03-18T13:42:59.297Z",
    "size": 59832,
    "path": "../public/assets/instructor-h0vWuJtg.js"
  },
  "/assets/main-D8eF2mp1.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13d4b-LNnsaUO+YtbsQwGou4AesQEXx7c"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 81227,
    "path": "../public/assets/main-D8eF2mp1.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/manual-llm-calls-DNpSkjTK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b469-Vld+5FVcuwWdABkAVG4XE6KLd/s"',
    "mtime": "2026-03-18T13:42:59.297Z",
    "size": 111721,
    "path": "../public/assets/manual-llm-calls-DNpSkjTK.js"
  },
  "/assets/orama-cloud-cgTJNLo0-BPUfOir3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-BN15AKQJH5XHMw1YO+/R7nuO7SE"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-BPUfOir3.js"
  },
  "/assets/models-and-providers-Cyzv2aDb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bb4b-XhWWDjLAOsypDpTSoKahcvmE+qg"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 47947,
    "path": "../public/assets/models-and-providers-Cyzv2aDb.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-D0PMxU99.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-6itPfU/8VyvPu6mofGPBxfbtS8c"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-D0PMxU99.js"
  },
  "/assets/main-BiZqUaIh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f3d0d-yICYzv++7thWApwBUsLF/dqI+Gs"',
    "mtime": "2026-03-18T13:42:59.297Z",
    "size": 998669,
    "path": "../public/assets/main-BiZqUaIh.js"
  },
  "/assets/parse-4raQy31W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6097-rcJabNMyfhSIoaTr+br//xrBrpw"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 24727,
    "path": "../public/assets/parse-4raQy31W.js"
  },
  "/assets/parse-RcC4UNBL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-WQOur80nKkW1MAr9xYkGfDCUZ5M"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 55169,
    "path": "../public/assets/parse-RcC4UNBL.js"
  },
  "/assets/pipeline-CeM6CVXf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-TXY2yMyFI09l8DW6AV5Xglapm0c"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 14066,
    "path": "../public/assets/pipeline-CeM6CVXf.js"
  },
  "/assets/quickstart-Dx3vgqOd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-JoWFBxmDCAohZS44m8lWdvH97to"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 25396,
    "path": "../public/assets/quickstart-Dx3vgqOd.js"
  },
  "/assets/process-directory-216vBuEb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-XHQ5MKsXD79/uEGf+gGvhzu5mEA"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 50658,
    "path": "../public/assets/process-directory-216vBuEb.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/pipelines-Cw4l7BYP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-h1/bqNk+Nc3yRsx0cEFXxNs9Fc4"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 37283,
    "path": "../public/assets/pipelines-Cw4l7BYP.js"
  },
  "/assets/search-default-Bnqv-AYv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3b1-zK7uArhbnXw9LSHFpQrZidWTCXI"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 945,
    "path": "../public/assets/search-default-Bnqv-AYv.js"
  },
  "/assets/strategies-DnORX7bw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14ed8-lLJJhKERLOzInhL0D9Fqo8FgQl8"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 85720,
    "path": "../public/assets/strategies-DnORX7bw.js"
  },
  "/assets/unstract-CRLLQuKx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b051-YSq4IbEuCAMZ6ChYwghI26scAAA"',
    "mtime": "2026-03-18T13:42:59.297Z",
    "size": 45137,
    "path": "../public/assets/unstract-CRLLQuKx.js"
  },
  "/assets/usage-DWqDvMAS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-dlZa3Z86RtV+OFhTU9xbB65b36s"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 36829,
    "path": "../public/assets/usage-DWqDvMAS.js"
  },
  "/assets/validation-DyVnLSO9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-oo+cszmFjL8oCmJAH02qBBrSYvA"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 21573,
    "path": "../public/assets/validation-DyVnLSO9.js"
  },
  "/assets/verify-CMIoYbL5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-VC4XtosN/UdMA5gTrRB8y+QuH50"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 10017,
    "path": "../public/assets/verify-CMIoYbL5.js"
  },
  "/assets/watch-folder-BWUZfqjb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-Jn8MnWSYcYcY+Stu/mSgo4oi7Ag"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-BWUZfqjb.js"
  },
  "/assets/what-is-an-extraction-agent-DKdLuRlj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3cac-/6vOvtudN7Iu9H1T3MsD9zUFiT8"',
    "mtime": "2026-03-18T13:42:59.297Z",
    "size": 15532,
    "path": "../public/assets/what-is-an-extraction-agent-DKdLuRlj.js"
  },
  "/assets/what-is-structured-data-extraction-DBwPCq5Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"291d-aGG5wRK5NCPXsnk2PQiNsgFBg+8"',
    "mtime": "2026-03-18T13:42:59.296Z",
    "size": 10525,
    "path": "../public/assets/what-is-structured-data-extraction-DBwPCq5Y.js"
  },
  "/assets/why-pdf-to-markdown-fails-BvnRwDPT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a64e-foySoZiBpEcc1s4gqVKygT0H82E"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 42574,
    "path": "../public/assets/why-pdf-to-markdown-fails-BvnRwDPT.js"
  },
  "/assets/static-BUXJwBmr-ja4-eR20.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-De79H8nD32KIaajBtoiLD2BLgfI"',
    "mtime": "2026-03-18T13:42:59.294Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-ja4-eR20.js"
  },
  "/assets/utils-rxhMSDYq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-DabJPiLN20xBIVuYK7NNL0h43Wc"',
    "mtime": "2026-03-18T13:42:59.295Z",
    "size": 16903,
    "path": "../public/assets/utils-rxhMSDYq.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-18T13:42:58.797Z",
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
