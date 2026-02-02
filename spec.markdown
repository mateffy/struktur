# Documentation Site Spec (Struktur Style)

Purpose: Provide a drop-in, single-file spec that an agent can use to generate a GitHub Pages–ready documentation site with a landing page and a single-page doc reference. The style matches the clawkey-derived system used in this repo.

## Outcome

Generate a static documentation site in a `docs/` folder that GitHub Pages can serve directly, with:

- A landing page at `docs/index.html`.
- A single-page documentation reference with a left nav at `docs/guide.html`.
- Shared styling in `docs/assets/style.css`.
- No build tooling required; HTML/CSS/JS only.
- Light and dark themes with a toggle; theme persisted in `localStorage`.

## Required file structure

```
docs/
  index.html
  guide.html
  assets/
    style.css
```

## Visual system and tokens

Follow these tokens and behaviors exactly. All typography uses JetBrains Mono.

Typography
- Font: `JetBrains Mono` for all text.
- Headings: uppercase with letter spacing (`0.04em` to `0.12em`).
- Base body line-height: `1.7`.

Color tokens (light)
- Backgrounds: `--bg` `#fafafa`, `--bg-elevated` `#ffffff`, `--sidebar-bg` `#f5f5f5`
- Text: `--text` `#1a1a1a`, `--text-secondary` `#555555`, `--text-muted` `#808080`, `--text-subtle` `#a0a0a0`
- Borders: `--border` `#e0e0e0`, `--border-subtle` `#f0f0f0`, `--border-strong` `#d0d0d0`
- Accent: `--accent` `#1a1a1a`, `--accent-hover` `#404040`, `--secure-bg` `#f8f8f8`
- Code: `--key-bg` `#1a1a1a`, `--key-text` `#f5f5f5`
- Badges: `--badge-bg` `#f0f0f0`, `--badge-text` `#555555`

Dark mode tokens
- Provide a `[data-theme="dark"]` override with inverted grays:
  - `--bg` `#0a0a0a`, `--bg-elevated` `#141414`, `--sidebar-bg` `#0f0f0f`
  - `--border` `#2a2a2a`, `--border-subtle` `#1a1a1a`, `--border-strong` `#3a3a3a`
  - `--text` `#e5e5e5`, `--text-secondary` `#a0a0a0`, `--text-muted` `#707070`, `--text-subtle` `#505050`
  - `--accent` `#e5e5e5`, `--accent-hover` `#ffffff`, `--secure-bg` `#1a1a1a`
  - `--key-bg` `#000000`, `--key-text` `#e5e5e5`
  - `--badge-bg` `#1f1f1f`, `--badge-text` `#909090`

Layout rules
- Landing page content max width: ~980px (`--max-width`), centered.
- Documentation page uses a fixed left sidebar (240px) with anchor nav.
- Cards: `1px` border, `4px` radius, no heavy shadow.
- Buttons: primary = solid accent; secondary = bordered neutral.
- Code blocks: dark background, mono, scrollable if needed.
- Motion: subtle transitions (150–200ms), no animated gradients.

## Landing page requirements (`docs/index.html`)

Structure and sections
- Sticky header with logo, nav links, and theme toggle.
- Hero section with two columns:
  - Left: headline + paragraph + two buttons.
  - Right: a visualization panel with a 4-step pipeline list and subtle pulse animation.
- “How it works” section with 3 cards.
- “Highlights” section with 4 cards.
- “Strategies” section with tabbed UI and animated panel transitions:
  - Tabs: Simple, Parallel, Sequential, Auto-merge, Double pass, Custom.
  - Panels show short description + 3 metric tiles.
- “Quick start” section with a syntax-colored code example.
- Footer with a link to the doc page.

Hero visualization
- Use a `.hero-panel` with a `.pipeline` list.
- Each `.pipeline-step` contains a pulse dot and two lines of text.
- Animate dots with a subtle `@keyframes pulse`.

Strategy tabs
- Implement tabs with data attributes and a small inline script.
- Active tab styles: slightly elevated background, darker text.
- Active panel: opacity 1, translateY 0.

## Documentation page requirements (`docs/guide.html`)

Layout
- `doc-app` flex layout with `doc-sidebar` + `doc-main`.
- Sidebar includes logo, section divider, nav anchors, and theme toggle.
- Main content contains all sections on a single page.

Required sections and order
- Overview
- Installation
- Quick start
- Artifacts
- Chunking
- Strategies
- Validation
- Merge & dedupe
- Events
- Artifact providers
- Custom strategies
- Types & results
- Testing

Nav behavior
- Use IntersectionObserver to set the active nav link based on scroll position.

## Syntax highlighting (manual tokens)

Code blocks use manual spans, not a library. Add CSS for:

- `.tok-keyword`, `.tok-string`, `.tok-type`, `.tok-function`, `.tok-number`, `.tok-comment`, `.tok-operator`, `.tok-namespace`

Example token colors (dark code background):

- keyword: `#ffd166`
- string: `#8bd5ff`
- type: `#f896d8`
- function: `#b8f2e6`
- number: `#ffadad`
- comment: `#a0a0a0`
- operator: `#cfcfcf`
- namespace: `#c3f8ff`

## Theme toggle behavior

Use this JS logic on both pages:

- `getTheme()` reads from `localStorage` key `@mateffy/struktur-theme`, else uses `prefers-color-scheme`.
- `setTheme(theme)` sets `data-theme` on `documentElement` and updates `localStorage`.
- Toggle button flips between light and dark and updates the icon.
- Icon uses `◐` for light, `◑` for dark.

## GitHub Pages compatibility

- No build step.
- Use relative paths for CSS and links.
- Keep `docs/` as the Pages folder.

## Content guidance

- Write concise, technical copy similar in tone to the Struktur docs.
- Avoid marketing fluff; focus on clarity and structure.
- Keep buttons and navigation labels short and uppercase where relevant.

## Implementation checklist

- [ ] Create `docs/assets/style.css` with the tokens and components.
- [ ] Create `docs/index.html` with hero visualization and strategy tabs.
- [ ] Create `docs/guide.html` with all required sections and left nav.
- [ ] Ensure all links are relative and work in GitHub Pages.
- [ ] Verify theme toggle works on both pages.
- [ ] Verify strategy tabs switch content with a simple script.
- [ ] Verify manual syntax highlighting spans render properly.
