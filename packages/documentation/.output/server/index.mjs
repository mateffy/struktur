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
    "mtime": "2026-03-09T14:43:00.161Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/CNAME": {
    "type": "text/plain; charset=utf-8",
    "etag": '"b-vMwX+cTl5yDqPfvnjJ2Kk+BC1jQ"',
    "mtime": "2026-03-09T14:43:00.160Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"1717-3QbcGIPhEBJKyawqK9luwqYu7OI"',
    "mtime": "2026-03-09T14:43:00.162Z",
    "size": 5911,
    "path": "../public/sitemap.xml"
  },
  "/struktur-icon-empty.webp": {
    "type": "image/webp",
    "etag": '"143c8-eF6w2WrlPD1r3NQAPJ9VTFEYfqs"',
    "mtime": "2026-03-09T14:43:00.163Z",
    "size": 82888,
    "path": "../public/struktur-icon-empty.webp"
  },
  "/assets/_-BEZMwqRf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a10-ONkTEcPe7WuQjSGpo8wHceQgfns"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 10768,
    "path": "../public/assets/_-BEZMwqRf.js"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"54-27YkLnzMRlD02mdrFv6Zn4DzW6g"',
    "mtime": "2026-03-09T14:43:00.162Z",
    "size": 84,
    "path": "../public/robots.txt"
  },
  "/assets/algolia-CfKKhsrI-D1esstij.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-/2/9OmYZy7sUEOkLsQnxvhwqGXE"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-D1esstij.js"
  },
  "/assets/artifact-format-Bx6KwhuX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-Ak3WKiEfrIXhTCVoRTqO0juUs5k"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-Bx6KwhuX.js"
  },
  "/assets/chunking-B3l_bS4O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-+AdHeknHifbhQiOjuJk8/gPqHWA"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 15938,
    "path": "../public/assets/chunking-B3l_bS4O.js"
  },
  "/assets/config-D69H2dFT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f5ee-7338c/YCGRw5tQOVluprcupHDq0"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 62958,
    "path": "../public/assets/config-D69H2dFT.js"
  },
  "/assets/enrich-records-ONfX58PV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-efpaK7cvUe+qYuVe9jR5eSYIu1I"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-ONfX58PV.js"
  },
  "/assets/events-vW0W_2uG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"459b-S3qkITH0RN/OG+IdahBGrKvAX4M"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 17819,
    "path": "../public/assets/events-vW0W_2uG.js"
  },
  "/assets/document-parsing-DFaWaX2R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-9yw5E3j3NGyoi5o8+PMczp18/DI"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-DFaWaX2R.js"
  },
  "/assets/extract-BkYEncWz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4169-8bqbA4brwLOHo0+i3x3ZvnoehPE"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 16745,
    "path": "../public/assets/extract-BkYEncWz.js"
  },
  "/assets/extract-invoice-Df2DTxqF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c87-Eiz0hyAPSbe+DLN4oLgARl/D4Qw"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 35975,
    "path": "../public/assets/extract-invoice-Df2DTxqF.js"
  },
  "/assets/extract-CZqAdbVY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"adf8-RcAi8vclKWXoignhvL5kl17cJWc"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 44536,
    "path": "../public/assets/extract-CZqAdbVY.js"
  },
  "/assets/extract-realestate-D45P9Tfq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-ZjBToCwfez+/G3InLnw5nIIY/5g"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-D45P9Tfq.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-DQRFg1x2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"122c9-lY9pAD6WAVP9L694o61a/5iPAYo"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 74441,
    "path": "../public/assets/fields-DQRFg1x2.js"
  },
  "/assets/index-BB7MN2Hq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e98-sucEx+b2FPf+Bl0OF+GfZaK1huU"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 3736,
    "path": "../public/assets/index-BB7MN2Hq.js"
  },
  "/assets/index-C0cRk1-S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3595-YD06DjslrPLxNV1rDQLm9YWdUCQ"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 13717,
    "path": "../public/assets/index-C0cRk1-S.js"
  },
  "/assets/index-DdKFOBSt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"667b-ng+nK45UxUWu24KM00jcH+fPNgI"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 26235,
    "path": "../public/assets/index-DdKFOBSt.js"
  },
  "/assets/index-DmJG6iPb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c78-mt04tZh5kiFBCRhPUGY8SjJY7Us"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 3192,
    "path": "../public/assets/index-DmJG6iPb.js"
  },
  "/assets/index-BH8X5mFc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81b-VC7VUeUGy6RkrNgQlax6CPim/4I"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 2075,
    "path": "../public/assets/index-BH8X5mFc.js"
  },
  "/assets/installation-CLc5aZQ_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ed-rRWKMonMLm+4KN4yBFTIU+2Gu90"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 9453,
    "path": "../public/assets/installation-CLc5aZQ_.js"
  },
  "/assets/index-DtfmZ-jq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-Yibn1owUPsh8pplFa0MdNRkzrDc"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 1055,
    "path": "../public/assets/index-DtfmZ-jq.js"
  },
  "/assets/index-kYMBS-FU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92c2-LwwEiJlpbjZjCFvgsxv1ABd88MA"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 37570,
    "path": "../public/assets/index-kYMBS-FU.js"
  },
  "/assets/index-Du3FMqwI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01-mmeQ4ko78Daz9Y6cGc5NYjwf8KY"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 3329,
    "path": "../public/assets/index-Du3FMqwI.js"
  },
  "/assets/installation-Cljq3muz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"526b-9gIb3FWa+BEIpf7PtIO6Je80QvQ"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 21099,
    "path": "../public/assets/installation-Cljq3muz.js"
  },
  "/assets/installation-_ZqpgmQd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95af-lf4i+sJKM/GqQpMagTQ1z9xcJ+k"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 38319,
    "path": "../public/assets/installation-_ZqpgmQd.js"
  },
  "/assets/main-D8eF2mp1.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13d4b-LNnsaUO+YtbsQwGou4AesQEXx7c"',
    "mtime": "2026-03-09T14:43:00.599Z",
    "size": 81227,
    "path": "../public/assets/main-D8eF2mp1.css"
  },
  "/assets/orama-cloud-cgTJNLo0-CXVLY8Js.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-LmHy4TOTibnO/F/ieyDd+/mv0LA"',
    "mtime": "2026-03-09T14:43:00.599Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-CXVLY8Js.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-RIjqTgCR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-Fm1Me/fGds0sTCH8BuTguHDIDYU"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-RIjqTgCR.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/parse-COiC_Y4y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-Y/3SYQ0JKTQf1cFcBZ8lApQP15g"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 55169,
    "path": "../public/assets/parse-COiC_Y4y.js"
  },
  "/assets/parse-CWfAOl22.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6097-uehWGnu+CFHn/aikSGO02KVqt5w"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 24727,
    "path": "../public/assets/parse-CWfAOl22.js"
  },
  "/assets/models-and-providers-Du3JcREA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bb4b-SRPf3H0DYggNtU+5M8Y0QtJ8Gt0"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 47947,
    "path": "../public/assets/models-and-providers-Du3JcREA.js"
  },
  "/assets/pipeline-nOcQWAgG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36f2-Hi4ICTqx+V9S8LcWSySdBqyJsnQ"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 14066,
    "path": "../public/assets/pipeline-nOcQWAgG.js"
  },
  "/assets/pipelines-Bq7nPh42.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-PSUsSeQCict1TBieg52qkI7U/gg"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 37283,
    "path": "../public/assets/pipelines-Bq7nPh42.js"
  },
  "/assets/process-directory-Wv_rKiaC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-TjhBbGSQ4UQsmbX8jnM84vVec5I"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 50658,
    "path": "../public/assets/process-directory-Wv_rKiaC.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-BYONqDzJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ae-B/yKMRwjcahEJO0iZ1Op4r1nlq4"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 942,
    "path": "../public/assets/search-default-BYONqDzJ.js"
  },
  "/assets/quickstart-wxWrhUf2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6334-fYdc9Kc24yWWaLrm9zQYlnNe/64"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 25396,
    "path": "../public/assets/quickstart-wxWrhUf2.js"
  },
  "/assets/static-BUXJwBmr-D9tXYPp5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-4JfL5u87tweBuiWDlDbiotyxpa8"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-D9tXYPp5.js"
  },
  "/assets/usage-B-l2Ln-C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fdd-Uefq8lYJ42bnN27V9lq4elEhPFA"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 36829,
    "path": "../public/assets/usage-B-l2Ln-C.js"
  },
  "/assets/strategies-BxlZu9cC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14ed8-2oe+KdDay4iKRPxA//auqsYJ/Fg"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 85720,
    "path": "../public/assets/strategies-BxlZu9cC.js"
  },
  "/assets/utils-DHn2-khR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4207-17pwrce4mFz/ma9bw0oweSDBM9A"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 16903,
    "path": "../public/assets/utils-DHn2-khR.js"
  },
  "/assets/main-BjRrOER4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f2799-GGzvjeQ96EPUTGCqxYD6P2OA2E8"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 993177,
    "path": "../public/assets/main-BjRrOER4.js"
  },
  "/assets/validation-CRNERlk9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-fAChV8xhhoKRg5T8Wg8GI6Hw280"',
    "mtime": "2026-03-09T14:43:00.602Z",
    "size": 21573,
    "path": "../public/assets/validation-CRNERlk9.js"
  },
  "/assets/watch-folder-D_F1sDXZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-8YmP2J1BeSmeKlZxocPGZpqWLNY"',
    "mtime": "2026-03-09T14:43:00.601Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-D_F1sDXZ.js"
  },
  "/assets/verify-DZROy5L3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2721-6kNOSdvx59QPPyJlw6MOa2SU3DE"',
    "mtime": "2026-03-09T14:43:00.600Z",
    "size": 10017,
    "path": "../public/assets/verify-DZROy5L3.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-09T14:43:00.198Z",
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
const _vIIWfr = defineHandler((event) => {
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
const _lazy_TVmBjJ = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return ssrRenderer$1;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_TVmBjJ };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_vIIWfr)
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
