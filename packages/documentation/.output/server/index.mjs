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
    "mtime": "2026-03-06T09:55:21.466Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/og.webp": {
    "type": "image/webp",
    "etag": '"12188-ykRjcBdmG+pYeqTXC7Po00GnnmM"',
    "mtime": "2026-03-06T09:55:21.466Z",
    "size": 74120,
    "path": "../public/og.webp"
  },
  "/assets/algolia-CfKKhsrI-9hl3ISJk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-/KfbS6CQaU4zH59i+NYyY4DVjbM"',
    "mtime": "2026-03-06T09:55:21.822Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-9hl3ISJk.js"
  },
  "/assets/_-BlymWUaG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a06-XuglAAZCGZw7+/Q15lcjn8IiQfI"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 10758,
    "path": "../public/assets/_-BlymWUaG.js"
  },
  "/assets/artifact-format-BxSuzumA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10331-7u9xzD4aVLlC1gXc4ujp26vC03g"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 66353,
    "path": "../public/assets/artifact-format-BxSuzumA.js"
  },
  "/assets/chunking-mDnLNYde.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e42-fe4QhIIGUi//mU3BzMRj6AFkwnA"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 15938,
    "path": "../public/assets/chunking-mDnLNYde.js"
  },
  "/assets/config-BEv-hfM2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1050e-CkiMYLPJKALwNwTj6vuEspVbYn8"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 66830,
    "path": "../public/assets/config-BEv-hfM2.js"
  },
  "/assets/extract-BneKNBwR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46da-486ZdYPnrvx4zG6WcADA2ao0qBA"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 18138,
    "path": "../public/assets/extract-BneKNBwR.js"
  },
  "/assets/events-DNgIjwCU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-rB0le0S2ify2FdGne/n2gLfQjU4"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 17535,
    "path": "../public/assets/events-DNgIjwCU.js"
  },
  "/assets/enrich-records-Cy2F4EPu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d48-VhzUHgTWo97oRrc6J7AERr8+r9c"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 40264,
    "path": "../public/assets/enrich-records-Cy2F4EPu.js"
  },
  "/assets/document-parsing-Do9eT2wM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e356-oGTnGYY1qnCLXPOoz2IvKtfACos"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 123734,
    "path": "../public/assets/document-parsing-Do9eT2wM.js"
  },
  "/assets/extract-iFLV9Ll8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d049-AmCXc8sJhAzmHuHTDAnknIc1CzA"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 53321,
    "path": "../public/assets/extract-iFLV9Ll8.js"
  },
  "/assets/extract-invoice-DcclO8G3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66a-bfJvw94KNO2S5fCi/jGXdvNUSS0"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 46698,
    "path": "../public/assets/extract-invoice-DcclO8G3.js"
  },
  "/assets/extract-realestate-Ms6Kq23P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a064-beayHcSMIzVTPzrQFSTMs2dh9II"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 41060,
    "path": "../public/assets/extract-realestate-Ms6Kq23P.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T09:55:21.822Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/index-Bqm08rrk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-z3IeJZXvqRN6/2F/N+5Jpzn5mZ4"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 3066,
    "path": "../public/assets/index-Bqm08rrk.js"
  },
  "/assets/fields-Cs0sUNrB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f48-TWJ6F2HGiDIU2CylIR2bOnrVp/U"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 73544,
    "path": "../public/assets/fields-Cs0sUNrB.js"
  },
  "/assets/index-CBBLGnGj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-0/tj4EvELnnlCfUSsIVTBVjRrm4"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 1055,
    "path": "../public/assets/index-CBBLGnGj.js"
  },
  "/assets/index-CRntmAYs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6887-4p5dspV0bLU3pQHiW+tYiObuCEQ"',
    "mtime": "2026-03-06T09:55:21.821Z",
    "size": 26759,
    "path": "../public/assets/index-CRntmAYs.js"
  },
  "/assets/index-CjUJC-zT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a1-a+Z6n/3Z7E1HCZQNqWU3pQIPmrU"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 1953,
    "path": "../public/assets/index-CjUJC-zT.js"
  },
  "/assets/index-DVsuRrWm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-e8zbBlko4w2VzW773zUWCDp6T1E"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 2918,
    "path": "../public/assets/index-DVsuRrWm.js"
  },
  "/assets/index-DhBq5an6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3354-2SreaoH8aphNc/ZizFkE4hPwQiQ"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 13140,
    "path": "../public/assets/index-DhBq5an6.js"
  },
  "/assets/index-twhQ7wI7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75d3-a3UbZZZ5IvuPu5/5AV5jK+8h1Hs"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 30163,
    "path": "../public/assets/index-twhQ7wI7.js"
  },
  "/assets/index-SZ62VMKf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a96-7NUW6pVyQMBqXf44S5mhVCP0u38"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 2710,
    "path": "../public/assets/index-SZ62VMKf.js"
  },
  "/assets/installation-BmfqbZll.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"208f-hU6+K5/I+bO2jtt//NfYUbLORvI"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 8335,
    "path": "../public/assets/installation-BmfqbZll.js"
  },
  "/assets/installation-Y0VbmgTN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"974c-qydk9xenxS5IAUBZds1P36e76yk"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 38732,
    "path": "../public/assets/installation-Y0VbmgTN.js"
  },
  "/assets/installation-yTYvDLYj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ec5-nmtHnYfv4OTlyz307PZk7EyYLWU"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 20165,
    "path": "../public/assets/installation-yTYvDLYj.js"
  },
  "/assets/main-CL5WYQnP.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"134c3-WZcBbqNBOyDSfOmMjfBy6eX/uno"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 79043,
    "path": "../public/assets/main-CL5WYQnP.css"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T09:55:21.822Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-cgTJNLo0-Bd16v4xK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-calQ8/fQbuIMT0EMr3dfyBY0UrM"',
    "mtime": "2026-03-06T09:55:21.822Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-Bd16v4xK.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-D-eksEB8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-a6xbszCFRmXZjkbHNar2LAliGE8"',
    "mtime": "2026-03-06T09:55:21.822Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-D-eksEB8.js"
  },
  "/assets/parse-CpptOR-F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"689e-3XS4fMFVyIeiizAdhrYEQJrhy9c"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 26782,
    "path": "../public/assets/parse-CpptOR-F.js"
  },
  "/assets/pipeline-Ca4DVm_Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36ef-Rs6kUZb9E0+gqmqnZ/t1s5vB6xk"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 14063,
    "path": "../public/assets/pipeline-Ca4DVm_Y.js"
  },
  "/assets/parse-DHMtk-i0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d781-FaGAeh8LQA44kkTWoNQ2FMNg+Us"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 55169,
    "path": "../public/assets/parse-DHMtk-i0.js"
  },
  "/assets/pipelines-BH7GgLOT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-pQfJzScd7xxDFVmeucqQHCHzcVU"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 37283,
    "path": "../public/assets/pipelines-BH7GgLOT.js"
  },
  "/assets/process-directory-DTtv-Zjn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e2-eI6DTn5umK+78qEhdsmsaVcd5uU"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 50658,
    "path": "../public/assets/process-directory-DTtv-Zjn.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T09:55:21.822Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/search-default-D6oSUJug.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-UbvM7Kx7YGDmYpaqYfntHAsOnHM"',
    "mtime": "2026-03-06T09:55:21.822Z",
    "size": 940,
    "path": "../public/assets/search-default-D6oSUJug.js"
  },
  "/assets/quickstart-Bb_B1FQl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5fe5-0JFjA2SHnO2Czm0lYSuROHZCvlQ"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 24549,
    "path": "../public/assets/quickstart-Bb_B1FQl.js"
  },
  "/assets/static-BUXJwBmr-Cg6TLciW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-ey3IPNokaOqzF14MOEpHQCTlt8o"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-Cg6TLciW.js"
  },
  "/assets/usage-BSZQBZjA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-fY6vwKibY/ATVh2Op8q+06GJBO4"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 37282,
    "path": "../public/assets/usage-BSZQBZjA.js"
  },
  "/assets/utils-BdBUrSjW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a3-lGOUbtR2BlgUavc18eqvbBTDw0Q"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 17059,
    "path": "../public/assets/utils-BdBUrSjW.js"
  },
  "/assets/validation-DW3vmQSZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5445-i4uaZF/Cyx0faHYsn7QKIx+UgCU"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 21573,
    "path": "../public/assets/validation-DW3vmQSZ.js"
  },
  "/assets/verify-DfU3iIgj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2969-Sr/KtytrnE8Ih1F8pHc+Whu5Mns"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 10601,
    "path": "../public/assets/verify-DfU3iIgj.js"
  },
  "/assets/strategies-CnFiDXjK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b0b0-Ym6kHjQvL6Gt1YRI/KIcmhPkeuw"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 176304,
    "path": "../public/assets/strategies-CnFiDXjK.js"
  },
  "/assets/watch-folder-m-rNbmp-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10743-FkiU/WGbQ/yAvYbfsoon6sm+y8g"',
    "mtime": "2026-03-06T09:55:21.823Z",
    "size": 67395,
    "path": "../public/assets/watch-folder-m-rNbmp-.js"
  },
  "/assets/main-BqAtuq49.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ebaef-U14vp94SIpny725086Wbgz0T2Fs"',
    "mtime": "2026-03-06T09:55:21.824Z",
    "size": 965359,
    "path": "../public/assets/main-BqAtuq49.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T09:55:21.478Z",
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
