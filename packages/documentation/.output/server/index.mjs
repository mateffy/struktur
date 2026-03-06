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
    "mtime": "2026-03-06T03:36:55.100Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/algolia-CfKKhsrI-CtS_yx35.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-k4xmxqgNnOZccftvazCqWWW/BK4"',
    "mtime": "2026-03-06T03:36:55.516Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-CtS_yx35.js"
  },
  "/assets/artifact-format-BV5VOIqo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8ea6-Lthn7S7pt2c7WDa5QcgdTy1PE80"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 36518,
    "path": "../public/assets/artifact-format-BV5VOIqo.js"
  },
  "/assets/artifact-helpers-B3aEvUNj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"653b-2yAWOdaCTyNTAnIFsfhAYYkahhA"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 25915,
    "path": "../public/assets/artifact-helpers-B3aEvUNj.js"
  },
  "/assets/built-in-inputs-BHkN9Qu7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7392-F7+I3KejeVS+39K4/GFeWi/ltY4"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 29586,
    "path": "../public/assets/built-in-inputs-BHkN9Qu7.js"
  },
  "/assets/choosing-Be3HnWU-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5e96-GuFBSHVQrKMaTzNDX5Vd00VAxdQ"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 24214,
    "path": "../public/assets/choosing-Be3HnWU-.js"
  },
  "/assets/chunking-BLuERhi8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4087-SeNos0NmQJcI3b1k6hMxTg2pUJ4"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 16519,
    "path": "../public/assets/chunking-BLuERhi8.js"
  },
  "/assets/config-CFJfgFi0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"105d3-9mdtVYk1Osef0yqvTcK/xCkatPw"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 67027,
    "path": "../public/assets/config-CFJfgFi0.js"
  },
  "/assets/custom-provider-Ch1ao4HH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"105b3-RoAkFrYMHbyjFWP5yLSooVNHtV0"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 66995,
    "path": "../public/assets/custom-provider-Ch1ao4HH.js"
  },
  "/assets/custom-strategy-MEXXcxbN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"79f6-ELnW4/UaS+8cy/2Lw+Hq5nTaMi0"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 31222,
    "path": "../public/assets/custom-strategy-MEXXcxbN.js"
  },
  "/assets/double-pass-DRBbyVZK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"64c4-g9PpccujgVxZR6/TgzcNg6Ypffk"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 25796,
    "path": "../public/assets/double-pass-DRBbyVZK.js"
  },
  "/assets/double-pass-auto-merge-CV9OGXgf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c43-l037AmpMgZVYNzmwBxRyxTd9y7k"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 23619,
    "path": "../public/assets/double-pass-auto-merge-CV9OGXgf.js"
  },
  "/assets/environment-DJVouLin.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b3d-20cEgyDvHNHGdbWHbEyzAlHL8Jc"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 11069,
    "path": "../public/assets/environment-DJVouLin.js"
  },
  "/assets/enrich-records-DpU42Ywx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d75-r30wdym1bnJk6VcKpWzHMUOfMJI"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 40309,
    "path": "../public/assets/enrich-records-DpU42Ywx.js"
  },
  "/assets/_-B0TOsT8E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29fd-WS6/vQu9V2aNw6BQev7o1nkhkSQ"',
    "mtime": "2026-03-06T03:36:55.516Z",
    "size": 10749,
    "path": "../public/assets/_-B0TOsT8E.js"
  },
  "/assets/events-n9aYTlGt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-AZELlhnGzb6Qoh/pL5zrJCnKVYI"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 17535,
    "path": "../public/assets/events-n9aYTlGt.js"
  },
  "/assets/extract-DEv1bHq-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46f1-CevnFBmEDPAmR05ugFAttjhvcrY"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 18161,
    "path": "../public/assets/extract-DEv1bHq-.js"
  },
  "/assets/extract-realestate-D22kqZPd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a1a2-G+70/hqcLGbyu0teRfl1tEB4/+I"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 41378,
    "path": "../public/assets/extract-realestate-D22kqZPd.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T03:36:55.516Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/extract-invoice-DRi8-7Ky.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b7f6-OLchB3UV3GK/KeZ+RcXQuoGulRo"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 47094,
    "path": "../public/assets/extract-invoice-DRi8-7Ky.js"
  },
  "/assets/index-6m-ZnOr3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-TbVx1F06RArt25PPFBxT2lTQ6Os"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 2918,
    "path": "../public/assets/index-6m-ZnOr3.js"
  },
  "/assets/extract-DrKLIi_r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01c-Zi/yKmHqHQhcN+KkD2ijktHV8dY"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 53276,
    "path": "../public/assets/extract-DrKLIi_r.js"
  },
  "/assets/fields-DUorT_Lp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b468-c8OTXB8tfL6DiX6RLB46hT4/Oo4"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 46184,
    "path": "../public/assets/fields-DUorT_Lp.js"
  },
  "/assets/fields-BP521sLi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1268f-p+xZpBK3reTqDBIYjyGEfZBo5nw"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 75407,
    "path": "../public/assets/fields-BP521sLi.js"
  },
  "/assets/index-BvUNEu5o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a37-Jxcq9OpipqO0EV2z8ZFc9Za45HQ"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 2615,
    "path": "../public/assets/index-BvUNEu5o.js"
  },
  "/assets/index-BAqboSIt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d88-5slFqiN86L9na9WneSd+/QQT32k"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 19848,
    "path": "../public/assets/index-BAqboSIt.js"
  },
  "/assets/index-CnPNn-ux.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"94b-Xdytrq0X7pg1sErw2zOMEi5gQh8"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 2379,
    "path": "../public/assets/index-CnPNn-ux.js"
  },
  "/assets/index-DBCQfZCd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-/zOqLP874xTCbMlh6guB2+yw8P8"',
    "mtime": "2026-03-06T03:36:55.516Z",
    "size": 1055,
    "path": "../public/assets/index-DBCQfZCd.js"
  },
  "/assets/index-CX4fm9ia.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67bb-qSqTAs2pbuyJmmfzsB4L9IzhAm8"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 26555,
    "path": "../public/assets/index-CX4fm9ia.js"
  },
  "/assets/index-DXG0Y6fd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36d3-ldfnROvExNw4vnmwqWm71EumtCk"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 14035,
    "path": "../public/assets/index-DXG0Y6fd.js"
  },
  "/assets/index-DXen45UA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-svB58h88r6Za9p8xNZus7jOJ4HI"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 3066,
    "path": "../public/assets/index-DXen45UA.js"
  },
  "/assets/index-DYgNTOdQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7d8-1+Fn70tdgQtJ2o2SoGjkHv5Hhfk"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 2008,
    "path": "../public/assets/index-DYgNTOdQ.js"
  },
  "/assets/index-qqZtG6qA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3194-pHURPc89IQj6m74Mhll3oVg8pRY"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 12692,
    "path": "../public/assets/index-qqZtG6qA.js"
  },
  "/assets/installation-DedYdqzM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ecb-dUH+PeaRQL+X6/yUNbM6MIrHtHQ"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 7883,
    "path": "../public/assets/installation-DedYdqzM.js"
  },
  "/assets/installation-Dzi11JxW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"950b-cYywIWbCeQ/pxtoPi9OCADCg2o0"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 38155,
    "path": "../public/assets/installation-Dzi11JxW.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T03:36:55.516Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/main-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T03:36:55.514Z",
    "size": 78946,
    "path": "../public/assets/main-DU2F3XIG.css"
  },
  "/assets/orama-cloud-cgTJNLo0-DUmk6eOK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-28P7peg2O3oOc9hq9TfVEgBS6D8"',
    "mtime": "2026-03-06T03:36:55.516Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-DUmk6eOK.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-igSl7S5l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-GgX97QgQsA3XSt+nRzZfQPD/pjA"',
    "mtime": "2026-03-06T03:36:55.516Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-igSl7S5l.js"
  },
  "/assets/installation-CqIG833P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"58a8-2zl4R0ExFj+aDqpcQHvaxaAx4LY"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 22696,
    "path": "../public/assets/installation-CqIG833P.js"
  },
  "/assets/parallel-3a5TS0Hd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c94-eyNGuinfve6RDp4uBt/UK2dWNWQ"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 23700,
    "path": "../public/assets/parallel-3a5TS0Hd.js"
  },
  "/assets/parallel-auto-merge-CHCBOW54.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5d3e-92sUQY0ttg3L3k5RTzd2+oYO9SU"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 23870,
    "path": "../public/assets/parallel-auto-merge-CHCBOW54.js"
  },
  "/assets/parse-D9sqIymk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"688d-CZFW7c2QxMXuAZ5ZUjR3sRnTxow"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 26765,
    "path": "../public/assets/parse-D9sqIymk.js"
  },
  "/assets/pipeline-DRFqfizQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36eb-xRb2t6EoUijUVE+L2ekNHQzvkw8"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 14059,
    "path": "../public/assets/pipeline-DRFqfizQ.js"
  },
  "/assets/parsers-GSjz2Cjx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dc64-fMk6CwIrg8efd/UrHWm7Rs86kTc"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 56420,
    "path": "../public/assets/parsers-GSjz2Cjx.js"
  },
  "/assets/process-directory-D-tuhdLX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c60b-obDhB9Z/YF7KnhhORqdE4aEFQrQ"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 50699,
    "path": "../public/assets/process-directory-D-tuhdLX.js"
  },
  "/assets/pipelines-D9P6px7j.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-M0ZjtM7o0OpQx/oP4memB95uwLE"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 37283,
    "path": "../public/assets/pipelines-D9P6px7j.js"
  },
  "/assets/main-PqBd4K9d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb6f4-a0K6atbQcl23AUg6csMqw/RddQk"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 964340,
    "path": "../public/assets/main-PqBd4K9d.js"
  },
  "/assets/quickstart-_rdHLiIw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"77a6-S1Ke5s+rFbuf8fVgBrkZOvBUfdQ"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 30630,
    "path": "../public/assets/quickstart-_rdHLiIw.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-vKeMtL4V.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-GLuQgaZzpcrqD0tNhcdwmVQtA5c"',
    "mtime": "2026-03-06T03:36:55.516Z",
    "size": 940,
    "path": "../public/assets/search-default-vKeMtL4V.js"
  },
  "/assets/sequential-BhW90D6M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5363-QSQyCTOB7S2T6xK7qp1A3t4i3no"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 21347,
    "path": "../public/assets/sequential-BhW90D6M.js"
  },
  "/assets/sequential-auto-merge-BOvJnogE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"57b5-/zjCC2sBAkw+OtNnY+o6ZnxlAz0"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 22453,
    "path": "../public/assets/sequential-auto-merge-BOvJnogE.js"
  },
  "/assets/simple-Cof_b3K0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4192-LC826ah4kdrVpBCKDb0pUc9BOFY"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 16786,
    "path": "../public/assets/simple-Cof_b3K0.js"
  },
  "/assets/static-BUXJwBmr-CZAi9BCo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-Yx1juKFV6Vz7crpiGvT/xFwD8+g"',
    "mtime": "2026-03-06T03:36:55.516Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-CZAi9BCo.js"
  },
  "/assets/usage-2G0iLFph.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-WjKFhjb6OINVEsqy9oNygEdCctI"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 37282,
    "path": "../public/assets/usage-2G0iLFph.js"
  },
  "/assets/utils-CSS3YQCK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42bf-dwqTp+6m6m+gscSkD2a2imD6NNg"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 17087,
    "path": "../public/assets/utils-CSS3YQCK.js"
  },
  "/assets/validation-CbUjTWJe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5476-1iY7wpK49NbdNHefxnIForyWHQk"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 21622,
    "path": "../public/assets/validation-CbUjTWJe.js"
  },
  "/assets/verify-BXN4Gl3e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2985-S/UKZ0obCEwJXb8WBjOV+BsXwTo"',
    "mtime": "2026-03-06T03:36:55.517Z",
    "size": 10629,
    "path": "../public/assets/verify-BXN4Gl3e.js"
  },
  "/assets/watch-folder-C_A6CLWz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10740-IJUSHtEhSxxQYBiEN7i3WhYmSp0"',
    "mtime": "2026-03-06T03:36:55.518Z",
    "size": 67392,
    "path": "../public/assets/watch-folder-C_A6CLWz.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T03:36:55.120Z",
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
