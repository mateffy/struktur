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
  "/assets/_-BMd_3Rk-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29fd-xP+9qymuD7ChZJAHZVok6sbyLlg"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 10749,
    "path": "../public/assets/_-BMd_3Rk-.js"
  },
  "/CNAME": {
    "type": "text/plain; charset=utf-8",
    "etag": '"b-vMwX+cTl5yDqPfvnjJ2Kk+BC1jQ"',
    "mtime": "2026-03-06T03:26:03.719Z",
    "size": 11,
    "path": "../public/CNAME"
  },
  "/assets/algolia-CfKKhsrI-D9hoElna.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe-UjgkhJa9GOqlkEAIpUyqV+WpKL8"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 766,
    "path": "../public/assets/algolia-CfKKhsrI-D9hoElna.js"
  },
  "/assets/artifact-format-DuHKX0FM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8ea6-WMPibgWQprslxfGd8ccWUgyU3IQ"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 36518,
    "path": "../public/assets/artifact-format-DuHKX0FM.js"
  },
  "/assets/chunking-BGzM4w-2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4087-LmqDutL3wj5HFBVHYcFAluwf5bY"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 16519,
    "path": "../public/assets/chunking-BGzM4w-2.js"
  },
  "/assets/choosing-UemQMbEg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5e96-a89VoX6n+cetvQW7Xo5vne5flFk"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 24214,
    "path": "../public/assets/choosing-UemQMbEg.js"
  },
  "/assets/config-Dnupd7W_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"105d3-2VVxXwqEf8pxb9Rhyvf/h8IoRBI"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 67027,
    "path": "../public/assets/config-Dnupd7W_.js"
  },
  "/assets/custom-provider-BV6QL8l5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"105b3-hCG//BvlaKhUW8wlBn/ET7yy1QI"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 66995,
    "path": "../public/assets/custom-provider-BV6QL8l5.js"
  },
  "/assets/built-in-inputs-Cok8Dxfd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7392-uSM0UA8nWyg8nLsepQN7bBMZ0NE"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 29586,
    "path": "../public/assets/built-in-inputs-Cok8Dxfd.js"
  },
  "/assets/artifact-helpers-BXQh_OE6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"653b-T3GtgNL6iyUIdmiHO7ql35oLhlA"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 25915,
    "path": "../public/assets/artifact-helpers-BXQh_OE6.js"
  },
  "/assets/custom-strategy-5zb1YwIC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"79f6-V8VRy1T4BKdCu4vLeHaJGSumE3w"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 31222,
    "path": "../public/assets/custom-strategy-5zb1YwIC.js"
  },
  "/assets/double-pass-auto-merge-CpN1BjP9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c43-+WcLEwO3O93kjtI1Ot2dWm4LjTs"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 23619,
    "path": "../public/assets/double-pass-auto-merge-CpN1BjP9.js"
  },
  "/assets/environment-BWBLxWb5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b3d-KI4uMc8GUHXx9UmBGTaiQLvVI08"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 11069,
    "path": "../public/assets/environment-BWBLxWb5.js"
  },
  "/assets/events-D_W6JKCG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"447f-7dlepT1WK6LEnF4k1Rv+9v25kxM"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 17535,
    "path": "../public/assets/events-D_W6JKCG.js"
  },
  "/assets/extract-DFCT2qFA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46f1-9SAukGBbM5rY33KK4l5ULCF46ps"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 18161,
    "path": "../public/assets/extract-DFCT2qFA.js"
  },
  "/assets/enrich-records-Bfvyyw1f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9d75-S4vZu16QRfU0NL+cD/wVi2A5jQk"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 40309,
    "path": "../public/assets/enrich-records-Bfvyyw1f.js"
  },
  "/assets/double-pass-BbRZWQpd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"64c4-QKHrWg51AM636WQeqRd81dyUs/s"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 25796,
    "path": "../public/assets/double-pass-BbRZWQpd.js"
  },
  "/assets/fetch-D_OY-eAB-BXhSS5YA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a0-YxUSDvvrpQzEtggJeyvfGNz+bSc"',
    "mtime": "2026-03-06T03:26:04.126Z",
    "size": 416,
    "path": "../public/assets/fetch-D_OY-eAB-BXhSS5YA.js"
  },
  "/assets/extract-px3aYAX9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d01c-P0oINJP64ZR2187kEjfo/+kzwRk"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 53276,
    "path": "../public/assets/extract-px3aYAX9.js"
  },
  "/assets/extract-invoice-DivkCW_K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b7f6-DTUJqAJj7kA0u2HZKonZnl5TtNQ"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 47094,
    "path": "../public/assets/extract-invoice-DivkCW_K.js"
  },
  "/assets/fields-CTidWxkF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b468-SV2ULyElFEzKmoK0WS1hFK1cMYc"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 46184,
    "path": "../public/assets/fields-CTidWxkF.js"
  },
  "/assets/extract-realestate-C78T-WJA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a1a2-2OdOz5ivIUFm7EA4bDxmhlJg8J8"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 41378,
    "path": "../public/assets/extract-realestate-C78T-WJA.js"
  },
  "/assets/index-9r3sITud.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67a8-aLk3uF+o0BwjTqTpJXl5BuO/jxw"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 26536,
    "path": "../public/assets/index-9r3sITud.js"
  },
  "/assets/fields-DvW40m5R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1268f-i83fd1jAk1t5++QsPOFXL0PYskY"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 75407,
    "path": "../public/assets/fields-DvW40m5R.js"
  },
  "/assets/index-BGFiAQL6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41f-iLaEyuaAf/kOxzq6dJ7s98xQ4as"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 1055,
    "path": "../public/assets/index-BGFiAQL6.js"
  },
  "/assets/index-CMc6l3ID.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36d3-kkztIWRhw4VzHz2407envhOs9Vc"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 14035,
    "path": "../public/assets/index-CMc6l3ID.js"
  },
  "/assets/index-COaXgWhS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a37-iK/9lKz23FlNfhvOXOmR7lh0Qfc"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 2615,
    "path": "../public/assets/index-COaXgWhS.js"
  },
  "/assets/index-D1nf0ddF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bfa-s5ikreydAC8lJ0vvnaA+n6BPHDs"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 3066,
    "path": "../public/assets/index-D1nf0ddF.js"
  },
  "/assets/index-DJInk6f8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d88-U85Licr42DUfAb/D4CCQDlg4phc"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 19848,
    "path": "../public/assets/index-DJInk6f8.js"
  },
  "/assets/index-DnoobJ5E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b66-5HB7VyXXkE9zfvwXLBJ31541CUQ"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 2918,
    "path": "../public/assets/index-DnoobJ5E.js"
  },
  "/assets/index-ca4iCeXq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"94b-9UJD2gIM3IU6NIyBtqEdMXXMPH0"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 2379,
    "path": "../public/assets/index-ca4iCeXq.js"
  },
  "/assets/index-JMcfRkOk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3194-3aQTeyIotI2bsKjFuRMXJfWM9Kc"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 12692,
    "path": "../public/assets/index-JMcfRkOk.js"
  },
  "/assets/installation-FVKgYWQW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"58a8-M2GfhEOWAOxyAyo5MdhRBJmOSyY"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 22696,
    "path": "../public/assets/installation-FVKgYWQW.js"
  },
  "/assets/installation-SS_ZSAAk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ecb-43gg9K3VVSxvYkNY0m9fa+9nvGI"',
    "mtime": "2026-03-06T03:26:04.129Z",
    "size": 7883,
    "path": "../public/assets/installation-SS_ZSAAk.js"
  },
  "/assets/installation-pWQafP1r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"950b-iT6BBOCeVOmpU32z9wJQ01vPAjs"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 38155,
    "path": "../public/assets/installation-pWQafP1r.js"
  },
  "/assets/orama-cloud-cgTJNLo0-DU_JDCL7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49f-5swBwEyEJZPd8m6OelR77uWLM1Y"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 1183,
    "path": "../public/assets/orama-cloud-cgTJNLo0-DU_JDCL7.js"
  },
  "/assets/mixedbread-TBJmV3co-Bpo1Waii.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e8c-dZf827hqfTOgNrxWF2bhqtuJ+ao"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 11916,
    "path": "../public/assets/mixedbread-TBJmV3co-Bpo1Waii.js"
  },
  "/assets/orama-cloud-legacy-Caf8mcU9-hIGS1E4M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"460-RtfRDtRr5y50/ojhnRy+Mh0NJpM"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 1120,
    "path": "../public/assets/orama-cloud-legacy-Caf8mcU9-hIGS1E4M.js"
  },
  "/assets/parallel-C94ewA0n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c94-VFYUVuz6SqogZlGtMW2WygtKy1Q"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 23700,
    "path": "../public/assets/parallel-C94ewA0n.js"
  },
  "/assets/parallel-auto-merge-Bzkb93D-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5d3e-cRH3qI2N3LpW1IO7Ovxb+6RYifU"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 23870,
    "path": "../public/assets/parallel-auto-merge-Bzkb93D-.js"
  },
  "/assets/parse-DhTI8pTm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"688d-9fIyYdB9igR6fBXKUtzEojYMhZQ"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 26765,
    "path": "../public/assets/parse-DhTI8pTm.js"
  },
  "/assets/parsers-CH_sUQOl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dc64-b4nVbtjTXxR4zEPxYH1MtCSPuFo"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 56420,
    "path": "../public/assets/parsers-CH_sUQOl.js"
  },
  "/assets/main-DU2F3XIG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13462-O7By6Qhm9QfUiKzOHGTaGmsplkw"',
    "mtime": "2026-03-06T03:26:04.126Z",
    "size": 78946,
    "path": "../public/assets/main-DU2F3XIG.css"
  },
  "/assets/pipeline-z4bVlMoR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"36eb-1Bc6vmgwYQ/H7PwXu2WtIQyZ6Js"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 14059,
    "path": "../public/assets/pipeline-z4bVlMoR.js"
  },
  "/assets/pipelines-DtdPduy8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a3-l/5G7rCbWW1f51cPF1QoVK2RzZQ"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 37283,
    "path": "../public/assets/pipelines-DtdPduy8.js"
  },
  "/assets/process-directory-DorFtrUV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c60b-aqpkS7kILh/4/KK8hD31VOt3w1E"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 50699,
    "path": "../public/assets/process-directory-DorFtrUV.js"
  },
  "/assets/index-CXKun9nr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7d8-nN/mMj7z1Gy6gpSFJ7qZN/gq3Og"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 2008,
    "path": "../public/assets/index-CXKun9nr.js"
  },
  "/assets/main-CqW1cql0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eb6f4-Pit0o6ye7CNtvf7w5w4P5mko9nA"',
    "mtime": "2026-03-06T03:26:04.129Z",
    "size": 964340,
    "path": "../public/assets/main-CqW1cql0.js"
  },
  "/assets/quickstart-Dc64EVlZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"77a6-USRRyl56n3QIrhKPcLzAl0z7gzc"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 30630,
    "path": "../public/assets/quickstart-Dc64EVlZ.js"
  },
  "/assets/remove-undefined-B_oBVupY-oajMeTFk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d7-wlj5j7tDxBiCdXw6SHXSAKXRq3w"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 215,
    "path": "../public/assets/remove-undefined-B_oBVupY-oajMeTFk.js"
  },
  "/assets/sequential-CUCib-Xp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5363-ow0tmkCgYObq9wuuyEsJo2c3V0Q"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 21347,
    "path": "../public/assets/sequential-CUCib-Xp.js"
  },
  "/assets/sequential-auto-merge-NzsKJYqV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"57b5-QeIgY8wEFTajGxrh9aZ3C2ZHMDw"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 22453,
    "path": "../public/assets/sequential-auto-merge-NzsKJYqV.js"
  },
  "/assets/simple-_10-qvPt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4192-Kb4XPxhMvTqu6eOqdoRPW2OTRwA"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 16786,
    "path": "../public/assets/simple-_10-qvPt.js"
  },
  "/assets/static-BUXJwBmr-CP-Ry4Ei.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3131-vUVznzpFAdqp9M5/343Z7ShScag"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 12593,
    "path": "../public/assets/static-BUXJwBmr-CP-Ry4Ei.js"
  },
  "/assets/usage-3trZ2njS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91a2-X2SEb3HyK4P9USce05RX2rSaBGA"',
    "mtime": "2026-03-06T03:26:04.129Z",
    "size": 37282,
    "path": "../public/assets/usage-3trZ2njS.js"
  },
  "/assets/search-default-NHL-YDwx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac-oG1tO3SjQgHJv9atKepoP+7AIOI"',
    "mtime": "2026-03-06T03:26:04.126Z",
    "size": 940,
    "path": "../public/assets/search-default-NHL-YDwx.js"
  },
  "/assets/utils-B_xturB-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42bf-GqE3FjXhcEym77RBaCO1mr0mrEQ"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 17087,
    "path": "../public/assets/utils-B_xturB-.js"
  },
  "/assets/validation-DPtvkr3w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5476-rG1idmAdO5ya6Iiut1j0gMccebQ"',
    "mtime": "2026-03-06T03:26:04.128Z",
    "size": 21622,
    "path": "../public/assets/validation-DPtvkr3w.js"
  },
  "/assets/watch-folder-Cv00h96L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10740-xyXykyJ+cabE2AgHJYtUHYY0a9I"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 67392,
    "path": "../public/assets/watch-folder-Cv00h96L.js"
  },
  "/assets/verify-6R_SWC4u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2985-EWkLsWQqLUXSh9q6cPHvoEDcfEc"',
    "mtime": "2026-03-06T03:26:04.127Z",
    "size": 10629,
    "path": "../public/assets/verify-6R_SWC4u.js"
  },
  "/struktur-icon.png": {
    "type": "image/png",
    "etag": '"59e52d-i3OIEgfdU5bFxZuRkSWc5QF3I3U"',
    "mtime": "2026-03-06T03:26:03.738Z",
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
