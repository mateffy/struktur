import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { beforeEach } from "vitest";

// jsdom lacks the Web Crypto subtle API; Node's webcrypto provides it.
import { webcrypto } from "node:crypto";

if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}

// The polyfills below are DOM-only. Node-environment test files (server/api)
// don't have `window`/`HTMLElement`, so guard each one.
if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
}

if (typeof globalThis !== "undefined" && !globalThis.ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

// https://github.com/jsdom/jsdom/issues/1695
if (typeof HTMLElement !== "undefined" && !HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}

// Clean up any DOM-backed storage between tests for isolation.
beforeEach(() => {
  if (typeof localStorage !== "undefined") localStorage.clear();
  if (typeof sessionStorage !== "undefined") sessionStorage.clear();
});
