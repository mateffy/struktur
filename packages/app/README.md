# @struktur/app

Struktur Desktop Application - A native desktop app for structured data extraction.

## Overview

This package packages `@struktur/web` as a native desktop application using Electrobun, which provides:

- **Ultra-small bundle size**: ~12MB
- **Native performance**: Uses Bun runtime and system webviews
- **Cross-platform**: macOS 14+, Windows 11+, Linux
- **Transparent title bar**: Seamlessly blends with the web UI
- **Desktop mode**: Web UI adapts to provide space for window controls

## Quick Start

### Development (Web + Desktop together)

```bash
cd packages/app
bun install
bun run dev
```

This will:
1. Start the `@struktur/web` dev server on port 3030
2. Launch the Electrobun desktop app
3. Load the web UI from `http://localhost:3030?desktop=true` with full hot reload
4. The web UI automatically detects desktop mode and adds padding for window controls

### Desktop Mode Features

When running in the desktop app:
- **Transparent title bar**: The native title bar is hidden, creating a seamless look
- **Window control space**: The web UI header adds `pt-10` padding to accommodate macOS window buttons (close/minimize/maximize)
- **Native feel**: The app feels like a native macOS app with proper window controls

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start web server + desktop app together |
| `bun run dev:app` | Desktop app only |
| `bun run dev:web` | Web server only |
| `bun run build` | Build production app |
| `bun run build:release` | Build optimized release |
| `bun run package` | Package for distribution |

## App Icon

The app uses `resources/struktur-icon.png` from the root, converted to a macOS iconset at `assets/icon.iconset/`.

## Project Structure

```
packages/app/
├── electrobun.config.ts    # Build configuration with icon
├── package.json            # Scripts and dependencies
├── assets/
│   └── icon.iconset/       # macOS app icons
│       ├── icon_16x16.png
│       ├── icon_32x32.png
│       └── ... (all sizes)
├── src/
│   ├── bun/
│   │   └── index.ts        # Main process entry (transparent title bar)
│   └── main/               # Production webview assets
│       ├── index.html      # HTML shell
│       └── index.ts        # Placeholder
└── build/                  # Build output (generated)
```

## Configuration

### Window Setup

```typescript
const win = new BrowserWindow({
  title: "Struktur",
  url: isDev ? "http://localhost:3030?desktop=true" : "views://main/index.html",
  titleBarStyle: "hiddenInset",  // Transparent title bar on macOS
  frame: { x: 0, y: 0, width: 1400, height: 900 },
});
```

### Desktop Mode Detection

The web app detects desktop mode via query parameter:

```typescript
const isDesktop = new URLSearchParams(window.location.search).get("desktop") === "true";
```

When in desktop mode, the header automatically adjusts:

```typescript
<header className={`... ${isDesktop ? 'pt-10' : 'py-0'}`}>
```

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| macOS 14+ | ✅ Supported | Transparent title bar, native window controls |
| Windows 11+ | ✅ Supported | Uses WebView2 |
| Linux | ✅ Supported | Uses WebKitGTK |

## Troubleshooting

### Icon not showing

Make sure the iconset is properly created:
```bash
cd resources
sips -z 512 512 struktur-icon.png --out ../packages/app/assets/icon.iconset/icon_512x512.png
# ... create all sizes
```

### Dev server not found

If the desktop app shows a blank window:
1. Check that `@struktur/web` is running: `bun run --filter @struktur/web dev`
2. Verify port 3030 is available

## License

FSL-1.1-MIT
