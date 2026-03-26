import { BrowserWindow } from "electrobun/bun";

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === "development" || process.env.ELECTROBUN_BUILD_ENV === "dev";

// Web dev server URL - add desktop mode query param for the web UI
const WEB_DEV_URL = "http://localhost:3030?desktop=true";

// Create the main window with transparent title bar
const _win = new BrowserWindow({
  title: "Struktur",
  url: isDev ? WEB_DEV_URL : "views://main/index.html",
  frame: {
    x: 0,
    y: 0,
    width: 1400,
    height: 900,
  },
  titleBarStyle: "hiddenInset",
});

console.log(`Struktur Desktop started in ${isDev ? "development" : "production"} mode`);
console.log(`Loading from: ${isDev ? WEB_DEV_URL : "views://main/index.html"}`);
