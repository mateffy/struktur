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
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-03-06T20:23:47.477Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-06T20:23:47.476Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/_-Bxsw3SLD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a10-+5s6aturEZFctBL07KXKFb2oTaQ"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 10768,
    "path": "../public/assets/_-Bxsw3SLD.js"
  },
  "/assets/algolia-CfKKhsrI-DLUlsouk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-pzZA9Bp24wCETNHlJlalPrPFv+0"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-DLUlsouk.js"
  },
  "/assets/artifact-format-B56VEzEJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-uNrBfKSr1WZ0P5W2hBwqrK6XDzk"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-B56VEzEJ.js"
  },
  "/assets/chunking-JmaNzoaC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-G46nCLF8V3PNa5UOfgeWOl/LdDs"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 15938,
    "path": "../public/assets/chunking-JmaNzoaC.js"
  },
  "/assets/config-DHd_q6Xi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-aw2LLX27+99VOcBiQR9PfE46HtM"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 66830,
    "path": "../public/assets/config-DHd_q6Xi.js"
  },
  "/assets/events-CbXiPCqz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-/eNHqwnXDxh/DqlToFcMFnjNBug"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 17535,
    "path": "../public/assets/events-CbXiPCqz.js"
  },
  "/assets/enrich-records-BqG5IrMM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-55nmAUGnGJ/9PQPmm98dn+sYbYw"',
    "mtime": "2026-03-06T20:23:47.964Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-BqG5IrMM.js"
  },
  "/assets/extract-DboCZlxF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-hUA4Jbcagu/WWls05cSkel4cyIg"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 53321,
    "path": "../public/assets/extract-DboCZlxF.js"
  },
  "/assets/extract-M6ElRZ9n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-162+emuWVL3zfQ95R5fOBJZhDWU"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 18138,
    "path": "../public/assets/extract-M6ElRZ9n.js"
  },
  "/assets/extract-invoice-DxCUgTgg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-cd27IIAPpYtK6fHtlPJmt1GrGR0"',
    "mtime": "2026-03-06T20:23:47.964Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-DxCUgTgg.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-BkEziq9V.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-1xAbrHoO8I8G8w49QsQxzKVhXEQ"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 73544,
    "path": "../public/assets/fields-BkEziq9V.js"
  },
  "/assets/extract-realestate-CrIrHauW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-vkTdnQX3xYS25VFAThB5kRCdHL0"',
    "mtime": "2026-03-06T20:23:47.964Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-CrIrHauW.js"
  },
  "/assets/index-BT0iqnzw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-oGiBPsGw8oYApjS6UAQ9ZrnHBzE"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 30163,
    "path": "../public/assets/index-BT0iqnzw.js"
  },
  "/assets/index-BamJIec9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-d7IVXgcedDknlrtM3C0hfPb/HG0"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 1953,
    "path": "../public/assets/index-BamJIec9.js"
  },
  "/assets/index-C2RVtz87.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-5I84qjem/74By7gQ6FTebjJ2Rt8"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 1055,
    "path": "../public/assets/index-C2RVtz87.js"
  },
  "/assets/index-BTVR5Zm0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6839-tgeG05OjccQn/M9qX2PHWYnS6gs"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 26681,
    "path": "../public/assets/index-BTVR5Zm0.js"
  },
  "/assets/index-CJL05Ti8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-7UhZwRvduSMlDSFFvB4l8oVuoEI"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 3066,
    "path": "../public/assets/index-CJL05Ti8.js"
  },
  "/assets/index-DS-j_9pi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3354-PzjSeyLvbBzylpZYqrO7U1YFGqM"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 13140,
    "path": "../public/assets/index-DS-j_9pi.js"
  },
  "/assets/index-CRTayg3-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-B4qlLMN3WBUl2j5fZKCiXas4gww"',
    "mtime": "2026-03-06T20:23:47.964Z",
    "size": 2918,
    "path": "../public/assets/index-CRTayg3-.js"
  },
  "/assets/document-parsing-DjFlcZkq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-Nd71Rlkh0aBQe1Q8v9vN7cPUeyQ"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-DjFlcZkq.js"
  },
  "/CNAME": {
    "type": "text/plain; charset=utf-8",
    "etag": '"b-vMwX+cTl5yDqPfvnjJ2Kk+BC1jQ"',
    "mtime": "2026-03-06T20:23:47.474Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/index-Da_eB0mx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-h1unCKSiDAQMkjICbmYC6QjMoDo"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 2710,
    "path": "../public/assets/index-Da_eB0mx.js"
  },
  "/assets/installation-BHm_RwIU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-jXkAJ2oLmzlzYdnGbF5NiLnitWE"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 8335,
    "path": "../public/assets/installation-BHm_RwIU.js"
  },
  "/assets/installation-BVmiz2Se.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-ZLZtZ5LJA0MnryqBCaTaKy6a5Go"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 20165,
    "path": "../public/assets/installation-BVmiz2Se.js"
  },
  "/assets/installation-C2PJGWs8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-XccrvEuP+8Zu8rqqFV2ORZHrZfk"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 38732,
    "path": "../public/assets/installation-C2PJGWs8.js"
  },
  "/assets/main-_fUl0z7M.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13498-8oJnZD2eofTB1u3G089wDXzJYl4"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 79e3,
    "path": "../public/assets/main-_fUl0z7M.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-dr3y8WbW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-sMjZskgru+oK35UcGTrOsAv7s78"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-dr3y8WbW.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-BCQji8D-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-WnVWo5lJD82DVbDx7b7R60oB7Mg"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-BCQji8D-.js"
  },
  "/assets/parse-DiPRm2Za.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-xfuKmEl1UCy7CSqZQgOiZI4SroE"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 55169,
    "path": "../public/assets/parse-DiPRm2Za.js"
  },
  "/assets/pipeline-CJe_GfMi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-vLr3AHQYhSXphwHKzpbRcqIPO9k"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 14063,
    "path": "../public/assets/pipeline-CJe_GfMi.js"
  },
  "/assets/parse-gyX_z399.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-xUsWTwANs9nCOEJyfTEbDBHoRo4"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 26782,
    "path": "../public/assets/parse-gyX_z399.js"
  },
  "/assets/pipelines-Cq-ai1-7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-AOJYmaQtziZ49uMnWXPAfJXJrUI"',
    "mtime": "2026-03-06T20:23:47.964Z",
    "size": 37283,
    "path": "../public/assets/pipelines-Cq-ai1-7.js"
  },
  "/assets/quickstart-B_lF6NPS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-i1kIzLXRgf7mUDh5lilTF2gKW7A"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 24549,
    "path": "../public/assets/quickstart-B_lF6NPS.js"
  },
  "/assets/search-default-DQd1NiQI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ad-RdDxxyu+z/N8qOhvBuR1Kt8CSrA"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 941,
    "path": "../public/assets/search-default-DQd1NiQI.js"
  },
  "/assets/static-BUXJwBmr-D3hq6Qog.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-vi0czDdX6qj6br3c2Fh/hNw6kOI"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-D3hq6Qog.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T20:23:47.963Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/process-directory-DXP0WZ5P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-HmOYc5V1m8JCPLLE7gokUB6hcSI"',
    "mtime": "2026-03-06T20:23:47.964Z",
    "size": 50658,
    "path": "../public/assets/process-directory-DXP0WZ5P.js"
  },
  "/assets/usage-CrqXb-AK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-OWcaSykwz4m6/3JqhwY2GlaIhPM"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 37282,
    "path": "../public/assets/usage-CrqXb-AK.js"
  },
  "/assets/utils-CbPsLqEP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-dU6utsyqw8C/2dQqi8VeImtBuEs"',
    "mtime": "2026-03-06T20:23:47.964Z",
    "size": 17059,
    "path": "../public/assets/utils-CbPsLqEP.js"
  },
  "/assets/validation-CFTstjkE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-49l4IM3LlqBOKalVPidP3W4+5eg"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 21573,
    "path": "../public/assets/validation-CFTstjkE.js"
  },
  "/assets/verify-DABCKSnN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-XCWx4hUGlkeeoPkVPXd7xf8S9Rc"',
    "mtime": "2026-03-06T20:23:47.964Z",
    "size": 10601,
    "path": "../public/assets/verify-DABCKSnN.js"
  },
  "/assets/watch-folder-XKhjiZIY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-9yAVpFDZjoCL/zJG+gcLoxiXKUM"',
    "mtime": "2026-03-06T20:23:47.964Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-XKhjiZIY.js"
  },
  "/assets/strategies-DBg2KlYs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-seovGnitEdTzG8yB5eECpwEVjp0"',
    "mtime": "2026-03-06T20:23:47.965Z",
    "size": 176304,
    "path": "../public/assets/strategies-DBg2KlYs.js"
  },
  "/assets/main-BBiFs8Yq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ec39e-i3QHWJ+PKPXQtHHOQ69kyZHyuu8"',
    "mtime": "2026-03-06T20:23:47.966Z",
    "size": 967582,
    "path": "../public/assets/main-BBiFs8Yq.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T20:23:47.483Z",
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
const _LBbEXi = defineHandler((event) => {
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
const _lazy_3hwHvc = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return ssrRenderer$1;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_3hwHvc };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_LBbEXi)
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
