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
    "mtime": "2026-03-06T03:11:39.191Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/_-B93ReuI5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29fd-Wor7jUx0EaAbA3VwyuKy21TIRPA"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 10749,
    "path": "../public/assets/_-B93ReuI5.js"
  },
  "/assets/algolia-CfKKhsrI-1KmnCPjO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-z/4AnEKLWbh8OC26qSU+Q0b8L4U"',
    "mtime": "2026-03-06T03:11:39.577Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-1KmnCPjO.js"
  },
  "/assets/app-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T03:11:39.577Z",
    "size": 78946,
    "path": "../public/assets/app-DU2F3XIG.css"
  },
  "/assets/artifact-format-Ks9Cst8Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8ea6-ITpxNsfJ5u88wju2EsS2oaO7aa0"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 36518,
    "path": "../public/assets/artifact-format-Ks9Cst8Y.js"
  },
  "/assets/built-in-inputs-DkCWOE3C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7392-V6LkGSS/+kLngk5mS9EmbCInI0w"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 29586,
    "path": "../public/assets/built-in-inputs-DkCWOE3C.js"
  },
  "/assets/choosing-7YhJ3iN_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5e96-tK7H6GhLbCA0oGX+pEWsPf7uLvA"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 24214,
    "path": "../public/assets/choosing-7YhJ3iN_.js"
  },
  "/assets/chunking-DreDaZy0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4087-zcUglj7gxUQR69pKvNAhPfTgbOo"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 16519,
    "path": "../public/assets/chunking-DreDaZy0.js"
  },
  "/assets/config-D7SMLZoH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"105d3-iN2GZl/IlbgL3jGDm7VgRTNtdws"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 67027,
    "path": "../public/assets/config-D7SMLZoH.js"
  },
  "/assets/custom-provider-DtY8ZETM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"105b3-txo3Hf1ToSfYfEZcN0JJ09wS2rQ"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 66995,
    "path": "../public/assets/custom-provider-DtY8ZETM.js"
  },
  "/assets/custom-strategy-DmBofURF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"79f6-CUJWNpvbuW/qiTPAcE1bSg+lC30"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 31222,
    "path": "../public/assets/custom-strategy-DmBofURF.js"
  },
  "/assets/artifact-helpers-h6EQpeVC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"653b-YCx9Gz3gZxp+Vnw7iOMLjBcCC50"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 25915,
    "path": "../public/assets/artifact-helpers-h6EQpeVC.js"
  },
  "/assets/double-pass-CEWitiYd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"64c4-vhXKcd8/Ng17Er5lUiuFcjwiMks"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 25796,
    "path": "../public/assets/double-pass-CEWitiYd.js"
  },
  "/assets/double-pass-auto-merge-B7Yi9sq3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c43-bx0//RuXI+DKhTPCBBBLms2Fqlo"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 23619,
    "path": "../public/assets/double-pass-auto-merge-B7Yi9sq3.js"
  },
  "/assets/environment-BvYjg-we.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b3d-mAsGRoJarrgrQKEpb0yhmrUtnbo"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 11069,
    "path": "../public/assets/environment-BvYjg-we.js"
  },
  "/assets/events-Byr_VoKs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-e1ywjKmmjSsm95PHDF/ElxPgA/I"',
    "mtime": "2026-03-06T03:11:39.581Z",
    "size": 17535,
    "path": "../public/assets/events-Byr_VoKs.js"
  },
  "/assets/extract-BFHuMHx6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46f1-On/ytCR6oM6kTiETjJWBhJtx3p4"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 18161,
    "path": "../public/assets/extract-BFHuMHx6.js"
  },
  "/assets/enrich-records-BSTcv6we.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d75-pwAfOwpgVqBI5f0GEhSFglOoOks"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 40309,
    "path": "../public/assets/enrich-records-BSTcv6we.js"
  },
  "/assets/extract-invoice-BwsTUzNB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b7f6-78gd/JvS9G8DPGF+HSmtJ0ZuxRo"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 47094,
    "path": "../public/assets/extract-invoice-BwsTUzNB.js"
  },
  "/assets/extract-realestate-6UQMaUVf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a1a2-D/yuFqnJ1gC41iqJYcg6IhsqwIA"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 41378,
    "path": "../public/assets/extract-realestate-6UQMaUVf.js"
  },
  "/assets/extract-w5i7H73K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01c-/Sfz274LCFMJhbd76AYwLYb4SZk"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 53276,
    "path": "../public/assets/extract-w5i7H73K.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T03:11:39.577Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/fields-BTduv3Sa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1268f-stCMDhqdw2jKh4s//kqqXw8IcQw"',
    "mtime": "2026-03-06T03:11:39.581Z",
    "size": 75407,
    "path": "../public/assets/fields-BTduv3Sa.js"
  },
  "/assets/fields-CAIGsKQM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b468-Pe21xCCcS44ZIHJGg0d33vHBqL8"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 46184,
    "path": "../public/assets/fields-CAIGsKQM.js"
  },
  "/assets/index-BM_q6aI6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7d8-mVlx21DLxFu18JcqnsusHreHGkI"',
    "mtime": "2026-03-06T03:11:39.581Z",
    "size": 2008,
    "path": "../public/assets/index-BM_q6aI6.js"
  },
  "/assets/index-BU-RvyVB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3194-8T0XJTsln5eorwJF4cYwXLf2Pvo"',
    "mtime": "2026-03-06T03:11:39.581Z",
    "size": 12692,
    "path": "../public/assets/index-BU-RvyVB.js"
  },
  "/assets/index-BgYATbjq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-dFKqIgBFobdIqLH8UFhlZV4h6Rw"',
    "mtime": "2026-03-06T03:11:39.581Z",
    "size": 1055,
    "path": "../public/assets/index-BgYATbjq.js"
  },
  "/assets/index-C7WJYjYf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-Ae9SqZHINqFF/VxOupXMgVpei0g"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 3066,
    "path": "../public/assets/index-C7WJYjYf.js"
  },
  "/assets/index-CiDIU-Bx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d88-LLf4uaVERl+vmUQybDNolm4WdB8"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 19848,
    "path": "../public/assets/index-CiDIU-Bx.js"
  },
  "/assets/index-BOliMFlp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36d3-5nTLpzt3CCZUpRAczg+sLPSyLLg"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 14035,
    "path": "../public/assets/index-BOliMFlp.js"
  },
  "/assets/index-CuLaMnIK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-+TWGjk5mk088BO+u97GzghEEC3w"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 2918,
    "path": "../public/assets/index-CuLaMnIK.js"
  },
  "/assets/index-D7UaxLY2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"94b-+SdIY/UGt3Q2gDucIyWDrm2/upI"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 2379,
    "path": "../public/assets/index-D7UaxLY2.js"
  },
  "/assets/index-B9w5BEff.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a37-q6FxzDIDQtgmrBbp43LztUusxiw"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 2615,
    "path": "../public/assets/index-B9w5BEff.js"
  },
  "/assets/index-M7J4LyaY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67b6-Te7MfR03MYT1kodHexta2HOgRj4"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 26550,
    "path": "../public/assets/index-M7J4LyaY.js"
  },
  "/assets/installation-BP4nr0Cg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ecb-1ca60sGKs4d5yiso0r88ZsWeTbg"',
    "mtime": "2026-03-06T03:11:39.581Z",
    "size": 7883,
    "path": "../public/assets/installation-BP4nr0Cg.js"
  },
  "/assets/installation-CdbWqFYV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"950b-lAkbzxqKGFojQwm2jtqkE3jPlhw"',
    "mtime": "2026-03-06T03:11:39.581Z",
    "size": 38155,
    "path": "../public/assets/installation-CdbWqFYV.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-CThNZJFh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-xnyWXK30REwyWbX60E3D25HYajI"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-CThNZJFh.js"
  },
  "/assets/orama-cloud-cgTJNLo0-CoUibEFn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-dAB7XKoSqWP7Uo6v3V7KR86/fJI"',
    "mtime": "2026-03-06T03:11:39.577Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-CoUibEFn.js"
  },
  "/assets/parallel-DMzzvUws.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c94-rn3hR1sP5tMmmrQ4bq/oY4M9lqg"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 23700,
    "path": "../public/assets/parallel-DMzzvUws.js"
  },
  "/assets/installation-CyLaSuMy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"58a8-k0GY52myB4ecPGFOB9C91/uTX4A"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 22696,
    "path": "../public/assets/installation-CyLaSuMy.js"
  },
  "/assets/parse-DUKL92Oe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"688d-uLrAvpBu9uk4pa4iiWyfY7PXK1w"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 26765,
    "path": "../public/assets/parse-DUKL92Oe.js"
  },
  "/assets/pipeline-CvQOUIa4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36eb-7YL3WyEA0WO7p/ww/gK0CdecldI"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 14059,
    "path": "../public/assets/pipeline-CvQOUIa4.js"
  },
  "/assets/pipelines-gvr51Wc4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-tAcWMmJ+QGb94CFjwDF+0lGTR5o"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 37283,
    "path": "../public/assets/pipelines-gvr51Wc4.js"
  },
  "/assets/parsers-tkvGd_qc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dc64-g2k8aoL0wrsS0FWYDc/S/xKsdhM"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 56420,
    "path": "../public/assets/parsers-tkvGd_qc.js"
  },
  "/assets/process-directory-Cjt-Z8E-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c60b-jeT01JvtO//srHF4NueaAPWMu0s"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 50699,
    "path": "../public/assets/process-directory-Cjt-Z8E-.js"
  },
  "/assets/parallel-auto-merge-1ioEa8_-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5d3e-Xp6w/gpvGjvJa2XKQOZSMG6SA0c"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 23870,
    "path": "../public/assets/parallel-auto-merge-1ioEa8_-.js"
  },
  "/assets/main-BVs-cBtG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb72d-OpXeaULPXNHJuiTCB5P9AFhfvOQ"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 964397,
    "path": "../public/assets/main-BVs-cBtG.js"
  },
  "/assets/quickstart-DTAmcfmM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"77a6-1uCz+kds8Gol0kBrwvKNEJC7xLg"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 30630,
    "path": "../public/assets/quickstart-DTAmcfmM.js"
  },
  "/assets/search-default-DeGDEy4E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-hmZ59tvHizHNH1Rd1puK5tj4uwk"',
    "mtime": "2026-03-06T03:11:39.577Z",
    "size": 940,
    "path": "../public/assets/search-default-DeGDEy4E.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/sequential-B5D-Dw6U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5363-aCrFW4m+f6ep5R/7e/yihEqwUEk"',
    "mtime": "2026-03-06T03:11:39.581Z",
    "size": 21347,
    "path": "../public/assets/sequential-B5D-Dw6U.js"
  },
  "/assets/sequential-auto-merge-C5NGSoAj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"57b5-3wYXqb5kxOiInItT00y/alvVQg0"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 22453,
    "path": "../public/assets/sequential-auto-merge-C5NGSoAj.js"
  },
  "/assets/simple-IjC2BXkz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4192-vnlOieXWRTSsBzuq79lRlQBnPuw"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 16786,
    "path": "../public/assets/simple-IjC2BXkz.js"
  },
  "/assets/static-BUXJwBmr-B44bYjpW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-EugKO+K9fqq6VzLINEo1YaKqg1Y"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-B44bYjpW.js"
  },
  "/assets/usage-9MBYEsYP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-hshurCPYIXjSqXiwnKCfK8shNiI"',
    "mtime": "2026-03-06T03:11:39.581Z",
    "size": 37282,
    "path": "../public/assets/usage-9MBYEsYP.js"
  },
  "/assets/utils-BQGm-XQy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42bf-uV977A/G7Me8H/tmV5lY0AZRNLU"',
    "mtime": "2026-03-06T03:11:39.578Z",
    "size": 17087,
    "path": "../public/assets/utils-BQGm-XQy.js"
  },
  "/assets/validation-Cd2mCt2p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5476-MJeI9MTjftPrUZsw2ystSPIlexw"',
    "mtime": "2026-03-06T03:11:39.580Z",
    "size": 21622,
    "path": "../public/assets/validation-Cd2mCt2p.js"
  },
  "/assets/verify-BNvwBBKL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2985-rFU8Yy4fr+iWehOYyiYX7hAdIeI"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 10629,
    "path": "../public/assets/verify-BNvwBBKL.js"
  },
  "/assets/watch-folder-8wYKce2E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10740-5ZGh7N+sK9QAZmr53P/9o33UAfg"',
    "mtime": "2026-03-06T03:11:39.579Z",
    "size": 67392,
    "path": "../public/assets/watch-folder-8wYKce2E.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T03:11:39.211Z",
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
