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
        Struktur SDK
    </h1>
    <p>
      All-in-one tool for structured data extraction using LLMs. Feed it documents, get back validated JSON. Handles parsing files, chunking, retries, merging, and deduplication — you just define the schema and choose a strategy. <br /><br />
        <a href="https://struktur.sh/docs/quickstart" target="_blank">Quickstart</a> |
        <a href="https://struktur.sh/docs" target="_blank">Documentation</a>
    </p>
</div>

<br />
<br />

## @struktur/sdk

The TypeScript SDK for Struktur — structured data extraction using the Vercel AI SDK.

## Installation

```bash
npm install @struktur/sdk
# or
bun add @struktur/sdk
```

## Quick Example

```ts
import { extract, simple, urlToArtifact } from "@struktur/sdk";
import { openai } from "@ai-sdk/openai";
import type { JSONSchemaType } from "ajv";

type Invoice = { number: string; vendor: string; total: number };

const schema: JSONSchemaType<Invoice> = {
  type: "object",
  properties: {
    number: { type: "string" },
    vendor: { type: "string" },
    total: { type: "number" },
  },
  required: ["number", "vendor", "total"],
  additionalProperties: false,
};

const artifact = await urlToArtifact("https://example.com/invoice.pdf");

const result = await extract({
  artifacts: [artifact],
  schema,
  strategy: simple({ model: openai("gpt-4o-mini") }),
});

console.log(result.data.number); // fully typed
console.log(result.usage.totalTokens);
```

## Documentation

Full documentation at **[struktur.sh](https://struktur.sh)**

- [SDK Reference](https://struktur.sh/docs/sdk)
- [API Documentation](https://struktur.sh/docs/sdk/extract)
- [Strategies](https://struktur.sh/docs/explanation/strategies)
- [Examples](https://struktur.sh/docs/examples)

## Repository

This package is part of the [Struktur monorepo](https://github.com/mateffy/struktur).
