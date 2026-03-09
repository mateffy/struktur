<picture height="0">
  <source media="(min-width: 769px)" srcset="https://raw.githubusercontent.com/mateffy/struktur/main/resources/pixel.png" width="0" height="0">
  <img src="https://raw.githubusercontent.com/mateffy/struktur/main/resources/struktur-icon-padded.webp" alt="Struktur Logo" width="150">
</picture>

<div>
    <h1>
        <picture>
            <source media="(max-width: 768px)" srcset="https://raw.githubusercontent.com/mateffy/struktur/main/resources/pixel.png" width="0" height="0">
            <img src="https://raw.githubusercontent.com/mateffy/struktur/main/resources/struktur-icon-padded.webp" alt="Struktur Logo" width="225" align="left">
        </picture>
        Struktur CLI
    </h1>
    <p>
      All-in-one tool for structured data extraction using LLMs. Feed it documents, get back validated JSON. Handles parsing files, chunking, retries, merging, and deduplication — you just define the schema and choose a strategy. <br /><br />
        <a href="https://struktur.sh/docs/quickstart" target="_blank">Quickstart</a> |
        <a href="https://struktur.sh/docs" target="_blank">Documentation</a>
    </p>
</div>

<br />
<br />

## @struktur/cli

The command-line interface for Struktur — structured data extraction using LLMs.

## Installation

```bash
npm install -g @struktur/cli
# or
bun add -g @struktur/cli
```

## Quick Example

```bash
# Extract data from a PDF using the Agent (default)
struktur extract --input ./invoice.pdf --fields "number, vendor, total:number"
```

```json
{ 
  "number": "1042", 
  "vendor": "Acme Corp", 
  "total": 2400 
}
```

The **Agent strategy** is the default. It autonomously explores documents and extracts data incrementally. For specific use cases, other strategies are available via `--strategy`.

## Documentation

Full documentation at **[struktur.sh](https://struktur.sh)**

- [CLI Reference](https://struktur.sh/docs/cli)
- [Quickstart](https://struktur.sh/docs/quickstart)
- [Examples](https://struktur.sh/docs/examples)

## Repository

This package is part of the [Struktur monorepo](https://github.com/mateffy/struktur).
