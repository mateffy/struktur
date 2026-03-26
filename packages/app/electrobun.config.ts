import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Struktur",
    identifier: "com.struktur.app",
    version: "1.0.0",
  },

  runtime: {
    exitOnLastWindowClosed: true,
  },

  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    views: {
      main: {
        entrypoint: "src/main/index.ts",
      },
    },
    copy: {
      "src/main/index.html": "views/main/index.html",
    },
    mac: {
      icons: "assets/icon.iconset",
    },
  },
} satisfies ElectrobunConfig;
