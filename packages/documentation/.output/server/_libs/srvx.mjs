function resolvePortAndHost(opts) {
  const _port = opts.port ?? globalThis.process?.env.PORT ?? 3e3;
  const port = typeof _port === "number" ? _port : Number.parseInt(_port, 10);
  if (port < 0 || port > 65535) throw new RangeError(`Port must be between 0 and 65535 (got "${port}").`);
  return {
    port,
    hostname: opts.hostname ?? globalThis.process?.env.HOST
  };
}
function fmtURL(host, port, secure) {
  if (!host || !port) return;
  if (host.includes(":")) host = `[${host}]`;
  return `http${secure ? "s" : ""}://${host}:${port}/`;
}
function printListening(opts, url) {
  if (!url || (opts.silent ?? globalThis.process?.env?.TEST)) return;
  let additionalInfo = "";
  try {
    const _url = new URL(url);
    if (_url.hostname === "[::]" || _url.hostname === "0.0.0.0") {
      _url.hostname = "localhost";
      url = _url.href;
      additionalInfo = " (all interfaces)";
    }
  } catch {
  }
  let listeningOn = `➜ Listening on:`;
  if (globalThis.process.stdout?.isTTY) {
    listeningOn = `\x1B[32m${listeningOn}\x1B[0m`;
    url = `\x1B[36m${url}\x1B[0m`;
    additionalInfo = `\x1B[2m${additionalInfo}\x1B[0m`;
  }
  console.log(`${listeningOn} ${url}${additionalInfo}`);
}
function resolveTLSOptions(opts) {
  if (!opts.tls || opts.protocol === "http") return;
  const cert = resolveCertOrKey(opts.tls.cert);
  const key = resolveCertOrKey(opts.tls.key);
  if (!cert && !key) {
    if (opts.protocol === "https") throw new TypeError("TLS `cert` and `key` must be provided for `https` protocol.");
    return;
  }
  if (!cert || !key) throw new TypeError("TLS `cert` and `key` must be provided together.");
  return {
    cert,
    key,
    passphrase: opts.tls.passphrase
  };
}
function resolveCertOrKey(value) {
  if (!value) return;
  if (typeof value !== "string") throw new TypeError("TLS certificate and key must be strings in PEM format or file paths.");
  if (value.startsWith("-----BEGIN ")) return value;
  const { readFileSync } = process.getBuiltinModule("node:fs");
  return readFileSync(value, "utf8");
}
function createWaitUntil() {
  const promises = /* @__PURE__ */ new Set();
  return {
    waitUntil: (promise) => {
      if (typeof promise?.then !== "function") return;
      promises.add(Promise.resolve(promise).catch(console.error).finally(() => {
        promises.delete(promise);
      }));
    },
    wait: () => {
      return Promise.all(promises);
    }
  };
}
const noColor = /* @__PURE__ */ (() => {
  const env = globalThis.process?.env ?? {};
  return env.NO_COLOR === "1" || env.TERM === "dumb";
})();
const _c = (c, r = 39) => (t) => noColor ? t : `\x1B[${c}m${t}\x1B[${r}m`;
const red = /* @__PURE__ */ _c(31);
const gray = /* @__PURE__ */ _c(90);
function wrapFetch(server) {
  const fetchHandler = server.options.fetch;
  const middleware = server.options.middleware || [];
  return middleware.length === 0 ? fetchHandler : (request) => callMiddleware(request, fetchHandler, middleware, 0);
}
function callMiddleware(request, fetchHandler, middleware, index) {
  if (index === middleware.length) return fetchHandler(request);
  return middleware[index](request, () => callMiddleware(request, fetchHandler, middleware, index + 1));
}
const gracefulShutdownPlugin = (server) => {
  const config = server.options?.gracefulShutdown;
  if (!globalThis.process?.on || config === false || config === void 0 && (process.env.CI || process.env.TEST)) return;
  const gracefulShutdown = config === true || !config?.gracefulTimeout ? Number.parseInt(process.env.SERVER_SHUTDOWN_TIMEOUT || "") || 3 : config.gracefulTimeout;
  const forceShutdown = config === true || !config?.forceTimeout ? Number.parseInt(process.env.SERVER_FORCE_SHUTDOWN_TIMEOUT || "") || 5 : config.forceTimeout;
  let isShuttingDown = false;
  let forceClose;
  const shutdown = async () => {
    if (isShuttingDown) {
      forceClose?.();
      return;
    }
    isShuttingDown = true;
    const w = process.stderr.write.bind(process.stderr);
    w(gray(`
Shutting down server in ${gracefulShutdown}s... (press Ctrl+C again to force close)`));
    let timeout;
    await Promise.race([server.close().finally(() => {
      clearTimeout(timeout);
      w(gray(" Server closed.\n"));
    }), new Promise((resolve) => {
      forceClose = () => {
        clearTimeout(timeout);
        w(gray("\nForce closing...\n"));
        server.close(true);
        resolve();
      };
      timeout = setTimeout(() => {
        w(gray(`
Force closing connections in ${forceShutdown}s...`));
        timeout = setTimeout(() => {
          w(red("\nCould not close connections in time, force exiting."));
          resolve();
        }, forceShutdown * 1e3);
        return server.close(true);
      }, gracefulShutdown * 1e3);
    })]);
    globalThis.process.exit(0);
  };
  for (const sig of ["SIGINT", "SIGTERM"]) globalThis.process.on(sig, shutdown);
};
const FastResponse$1 = Response;
function serve(options) {
  return new BunServer(options);
}
var BunServer = class {
  runtime = "bun";
  options;
  bun = {};
  serveOptions;
  fetch;
  #wait;
  constructor(options) {
    this.options = {
      ...options,
      middleware: [...options.middleware || []]
    };
    for (const plugin of options.plugins || []) plugin(this);
    gracefulShutdownPlugin(this);
    const fetchHandler = wrapFetch(this);
    this.#wait = createWaitUntil();
    this.fetch = (request, server) => {
      Object.defineProperties(request, {
        waitUntil: { value: this.#wait.waitUntil },
        runtime: {
          enumerable: true,
          value: {
            name: "bun",
            bun: { server }
          }
        },
        ip: {
          enumerable: true,
          get() {
            return server?.requestIP(request)?.address;
          }
        }
      });
      return fetchHandler(request);
    };
    const tls = resolveTLSOptions(this.options);
    this.serveOptions = {
      ...resolvePortAndHost(this.options),
      reusePort: this.options.reusePort,
      error: this.options.error,
      ...this.options.bun,
      tls: {
        cert: tls?.cert,
        key: tls?.key,
        passphrase: tls?.passphrase,
        ...this.options.bun?.tls
      },
      fetch: this.fetch
    };
    if (!options.manual) this.serve();
  }
  serve() {
    if (!this.bun.server) this.bun.server = Bun.serve(this.serveOptions);
    printListening(this.options, this.url);
    return Promise.resolve(this);
  }
  get url() {
    const server = this.bun?.server;
    if (!server) return;
    const address = server.address;
    if (address) return fmtURL(address.address, address.port, server.protocol === "https");
    return server.url.href;
  }
  ready() {
    return Promise.resolve(this);
  }
  async close(closeAll) {
    await Promise.all([this.#wait.wait(), Promise.resolve(this.bun?.server?.stop(closeAll))]);
  }
};
function lazyInherit(target, source, sourceKey) {
  for (const key of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
    if (key === "constructor") continue;
    const targetDesc = Object.getOwnPropertyDescriptor(target, key);
    const desc = Object.getOwnPropertyDescriptor(source, key);
    let modified = false;
    if (desc.get) {
      modified = true;
      desc.get = targetDesc?.get || function() {
        return this[sourceKey][key];
      };
    }
    if (desc.set) {
      modified = true;
      desc.set = targetDesc?.set || function(value) {
        this[sourceKey][key] = value;
      };
    }
    if (!targetDesc?.value && typeof desc.value === "function") {
      modified = true;
      desc.value = function(...args) {
        return this[sourceKey][key](...args);
      };
    }
    if (modified) Object.defineProperty(target, key, desc);
  }
}
const FastURL = /* @__PURE__ */ (() => {
  const NativeURL = globalThis.URL;
  const FastURL2 = class URL {
    #url;
    #href;
    #protocol;
    #host;
    #pathname;
    #search;
    #searchParams;
    #pos;
    constructor(url) {
      if (typeof url === "string") this.#href = url;
      else {
        this.#protocol = url.protocol;
        this.#host = url.host;
        this.#pathname = url.pathname;
        this.#search = url.search;
      }
    }
    static [Symbol.hasInstance](val) {
      return val instanceof NativeURL;
    }
    get _url() {
      if (this.#url) return this.#url;
      this.#url = new NativeURL(this.href);
      this.#href = void 0;
      this.#protocol = void 0;
      this.#host = void 0;
      this.#pathname = void 0;
      this.#search = void 0;
      this.#searchParams = void 0;
      this.#pos = void 0;
      return this.#url;
    }
    get href() {
      if (this.#url) return this.#url.href;
      if (!this.#href) this.#href = `${this.#protocol || "http:"}//${this.#host || "localhost"}${this.#pathname || "/"}${this.#search || ""}`;
      return this.#href;
    }
    #getPos() {
      if (!this.#pos) {
        const url = this.href;
        const protoIndex = url.indexOf("://");
        const pathnameIndex = protoIndex === -1 ? -1 : url.indexOf("/", protoIndex + 4);
        this.#pos = [
          protoIndex,
          pathnameIndex,
          pathnameIndex === -1 ? -1 : url.indexOf("?", pathnameIndex)
        ];
      }
      return this.#pos;
    }
    get pathname() {
      if (this.#url) return this.#url.pathname;
      if (this.#pathname === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.pathname;
        this.#pathname = this.href.slice(pathnameIndex, queryIndex === -1 ? void 0 : queryIndex);
      }
      return this.#pathname;
    }
    get search() {
      if (this.#url) return this.#url.search;
      if (this.#search === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.search;
        const url = this.href;
        this.#search = queryIndex === -1 || queryIndex === url.length - 1 ? "" : url.slice(queryIndex);
      }
      return this.#search;
    }
    get searchParams() {
      if (this.#url) return this.#url.searchParams;
      if (!this.#searchParams) this.#searchParams = new URLSearchParams(this.search);
      return this.#searchParams;
    }
    get protocol() {
      if (this.#url) return this.#url.protocol;
      if (this.#protocol === void 0) {
        const [protocolIndex] = this.#getPos();
        if (protocolIndex === -1) return this._url.protocol;
        this.#protocol = this.href.slice(0, protocolIndex + 1);
      }
      return this.#protocol;
    }
    toString() {
      return this.href;
    }
    toJSON() {
      return this.href;
    }
  };
  lazyInherit(FastURL2.prototype, NativeURL.prototype, "_url");
  Object.setPrototypeOf(FastURL2.prototype, NativeURL.prototype);
  Object.setPrototypeOf(FastURL2, NativeURL);
  return FastURL2;
})();
const FastResponse = Response;
export {
  FastURL as F,
  FastResponse as a,
  FastResponse$1 as b,
  serve as s
};
