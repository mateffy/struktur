# Struktur PHP SDK

PHP adapter for the [Struktur](https://github.com/mateffy/struktur) structured data extraction CLI. Zero runtime dependencies. Type-safe DTOs. Real-time event streaming.

## What is Struktur?

Struktur converts documents (PDFs, text, images) into validated JSON using LLMs. You define a [JSON Schema](https://json-schema.org/), pick a [strategy](https://struktur.sh/docs/explanation/strategies), and it handles parsing, chunking, extraction, validation, retries, and deduplication. Works with OpenAI, Anthropic, Google, OpenRouter, and any OpenAI-compatible provider.

## Installation

```bash
composer require mateffy/struktur
```

You also need the Struktur CLI. Choose one:

```bash
npm install -g @struktur/cli          # global npm install
bun install -g @struktur/cli          # global bun install
# or download the standalone binary from GitHub Releases
```

Requires **PHP 8.2+**.

## Quick start

```php
use Mateffy\Struktur\Client;
use Mateffy\Struktur\Input;
use Mateffy\Struktur\Dto\ExtractionRequest;

$client = new Client();

$result = $client->extract(new ExtractionRequest(
    inputs: [Input::fromPath('./invoice.pdf')],
    schema: [
        'type' => 'object',
        'properties' => [
            'invoice_number' => ['type' => 'string'],
            'total'          => ['type' => 'number'],
        ],
        'required' => ['invoice_number', 'total'],
    ],
    strategy: 'agent',
    model: 'openrouter/moonshotai/kimi-k2.5',
    tokens: ['openrouter' => getenv('OPENROUTER_API_KEY')],
));

// $result->data is a typed array matching your schema
echo $result->data['invoice_number']; // "INV-1042"
echo $result->usage->totalTokens;     // 420
```

## Event streaming

The CLI emits typed NDJSON events on stderr. The SDK parses them in real time:

```php
$client->extract(
    request: new ExtractionRequest(
        inputs: [Input::fromPath('./contract.pdf')],
        schema: $schema,
        model: 'openai/gpt-4o',
        strategy: 'agent',
        maxSteps: 200,
    ),
    onEvent: function (\Mateffy\Struktur\Dto\Event\ExtractionEvent $event) {
        match (true) {
            $event instanceof \Mateffy\Struktur\Dto\Event\StatusEvent =>
                printf("[%s] %s\n", $event->phase, $event->message['key'] ?? ''),

            $event instanceof \Mateffy\Struktur\Dto\Event\ToolStartEvent =>
                printf("tool start: %s\n", $event->toolName),

            $event instanceof \Mateffy\Struktur\Dto\Event\TokenUsageEvent =>
                printf("tokens: %d\n", $event->totalTokens),

            default => null,
        };
    }
);
```

Use `StatusEvent` for human-facing progress UIs — it carries a coarse, strategy-independent `phase` (`starting`, `analyzing`, `extracting`, `retrying`, `completed`, `failed`) so you can render localized status without matching internal tool names or step labels.

## Image extraction

Enable `images: true` and use `imagesOutput` to receive extracted images as a virtual-path → base64 map:

```php
$result = $client->extract(new ExtractionRequest(
    inputs: [Input::fromPath('./brochure.pdf')],
    schema: $schema,
    model: 'openrouter/moonshotai/kimi-k2.5',
    strategy: 'agent',
    images: true,
    imagesOutput: '/tmp/images.json',
    tokens: ['openrouter' => getenv('OPENROUTER_API_KEY')],
));

// $result->images['/images/artifact-…-page-1-image-1.png'] → base64 bytes
```

## Direct parsing

Use `parse()` to convert files into artifact JSON (text + extracted images) without LLM extraction. Useful for pre-processing pipelines:

```php
$result = $client->parse(new \Mateffy\Struktur\Dto\ParseRequest(
    inputs: [Input::fromPath('./report.pdf')],
    images: true,
    screenshots: true,
));
```

## Provider tokens

Pass tokens per-request via `ExtractionRequest::$tokens` — no global env variables needed. The SDK maps provider names to environment variables:

| Provider | Config key | Env variable |
|---|---|---|
| OpenAI | `openai` | `OPENAI_API_KEY` |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` |
| Google | `google` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` |
| OpenCode | `opencode` | `OPENCODE_API_KEY` |
| Ollama | `ollama` | `OLLAMA_BASE_URL` |

Tokens are injected as environment variable prefixes on the CLI command — never written to disk and never leak across requests.

## Error handling

```php
use Mateffy\Struktur\Exception\ProcessException;
use Mateffy\Struktur\Exception\ExtractionFailedException;

try {
    $result = $client->extract(...);
} catch (ProcessException $e) {
    // CLI binary not found or failed to start
} catch (ExtractionFailedException $e) {
    // Extraction exited with non-zero code or validation failure
}
```

## Documentation

- [Struktur docs](https://struktur.sh/docs) — full documentation
- [PHP tutorial](https://github.com/mateffy/struktur-php/blob/main/TUTORIAL.md) — detailed walkthrough with Laravel examples
- [Struktur monorepo](https://github.com/mateffy/struktur) — source code, issues, releases

## License

FSL-1.1-MIT (Functional Source License, MIT future). See [LICENSE](./LICENSE).