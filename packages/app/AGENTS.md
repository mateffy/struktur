# Struktur Desktop App

Native desktop application for Struktur using Electrobun.

## Architecture

- **Main Process**: Bun runtime at `src/bun/index.ts`
- **Webview**: Production placeholder at `src/main/`
- **Dev Mode**: Loads from `@struktur/web` dev server with transparent title bar

## Features

### Draggable Header
The header is marked as a draggable region using the `electrobun-webkit-app-region-drag` CSS class. This allows users to drag the window by grabbing the header area. Interactive elements (buttons, links) inside the header use `electrobun-webkit-app-region-no-drag` to remain clickable.

### Transparent Title Bar
The desktop app uses a transparent title bar (`hiddenInset` style on macOS) that blends with the web UI. The native window control buttons (close/minimize/maximize) appear in the top-left corner.

### Window Control Layout
The layout is specifically arranged to accommodate the window control buttons:
- **Header**: Reduced left padding (`pl-4`), normal right padding (`pr-6`)
- **Logo wrapper**: Has top padding (`pt-3`) in desktop mode, positioned below the window buttons
- **Logo**: Reduced left padding (`pl-3`)
- **Navbar height**: Fixed at `h-16` (64px) with content centered vertically
- **No left indent**: Logo sits directly under the window control buttons
- **Links section**: No border-left (avoiding duplicate borders), reduced left margin

## Development Workflow

```bash
# Start both web dev server and desktop app (recommended)
bun run dev

# This will:
# 1. Start @struktur/web dev server on port 3030
# 2. Wait 3 seconds for server to be ready
# 3. Launch Electrobun desktop app
# 4. Desktop app loads from http://localhost:3030?desktop=true
# 5. Web UI adjusts layout to accommodate window controls
```

## Scripts

- `bun run dev` - Run web + desktop together with hot reload
- `bun run dev:app` - Desktop app only (requires web server running)
- `bun run dev:web` - Web server only
- `bun run build` - Build production app
- `bun run package` - Package for distribution

## Desktop Mode CSS Classes

### Draggable Regions
- `electrobun-webkit-app-region-drag` - Makes element a draggable window region
- `electrobun-webkit-app-region-no-drag` - Excludes element from drag behavior (for buttons/links)

Applied in the web app:
- **Header**: Has drag class to allow window dragging
- **Logo, Docs link, GitHub link**: Have no-drag class to remain clickable
- **Right-side actions** (API keys, buttons): Have no-drag class

## Project Structure

```
packages/app/
├── electrobun.config.ts    # Build configuration with icon
├── package.json            # Scripts and dependencies
├── assets/
│   └── icon.iconset/       # macOS app icons (all sizes)
├── src/
│   ├── bun/
│   │   └── index.ts        # Main process entry
│   └── main/               # Production webview assets
│       ├── index.html      # HTML shell
│       └── index.ts        # Placeholder
└── build/                  # Build output (generated)
```

## Configuration

### Window Setup with Draggable Title Bar

```typescript
const win = new BrowserWindow({
  title: "Struktur",
  url: isDev ? "http://localhost:3030?desktop=true" : "views://main/index.html",
  titleBarStyle: "hiddenInset",  // Transparent title bar
  frame: { x: 0, y: 0, width: 1400, height: 900 },
});
```

### Desktop Mode Detection in Web UI

```typescript
const isDesktop = new URLSearchParams(window.location.search).get("desktop") === "true";
```

When in desktop mode:
- **Logo wrapper** gets `pt-3` (12px) top padding
- **Navbar** has fixed height `h-16` with centered content
- **Header** is marked draggable with `electrobun-webkit-app-region-drag`
- **Interactive elements** marked with `electrobun-webkit-app-region-no-drag`

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| macOS 14+ | ✅ Supported | Draggable header, transparent title bar, native window controls |
| Windows 11+ | ⚠️ Basic | Uses WebView2, may need custom window controls |
| Linux | ⚠️ Basic | Uses WebKitGTK, may need custom window controls |

## TODO

For full production integration:
- [ ] Bundle `@struktur/web` static assets into production build
- [ ] Implement custom window controls for Windows/Linux (since they don't have native overlay)
- [ ] Add native menu bar integration
- [ ] Set up CI for automated builds with proper code signing
