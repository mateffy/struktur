# Struktur PHP SDK — Tutorial

This package (`mateffy/struktur`) is a zero-dependency PHP adapter over the [Struktur](https://github.com/struktur-ai/struktur) Node.js CLI. It provides strongly-typed DTOs, real-time event streaming, and a clean API for turning unstructured documents into structured data.

**Design principle:** All LLM logic, vision handling, and parsing stays in the CLI. PHP only marshals data and provides type-safe wrappers. This guarantees automatic feature parity with the CLI.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Your First Extraction](#3-your-first-extraction)
4. [Inputs: Path, Bytes, Stream](#4-inputs-path-bytes-stream)
5. [Parsing Documents](#5-parsing-documents)
6. [Extraction with Schemas](#6-extraction-with-schemas)
7. [Streaming Events](#7-streaming-events)
8. [Error Handling](#8-error-handling)
9. [Laravel Integration](#9-laravel-integration)
10. [Architecture Notes](#10-architecture-notes)

---

## 1. Prerequisites

- **PHP 8.2+**
- **The Struktur CLI** must be installed and accessible. The PHP package does **not** install the Node binary — you bring your own.

```bash
# Install the CLI globally (see the Struktur repo)
npm install -g struktur
# or use a local binary
bun /path/to/struktur/packages/cli/dist/cli.js
```

Verify the CLI works:

```bash
echo "hello world" | struktur parse --stdin --output -
```

---

## 2. Installation

```bash
composer require mateffy/struktur
```

No other PHP dependencies are pulled in. The package is intentionally dependency-free.

---

## 3. Your First Extraction

The fastest way to see Struktur work:

```php
<?php

require 'vendor/autoload.php';

use Mateffy\Struktur\Client;
use Mateffy\Struktur\Input;
use Mateffy\Struktur\Dto\ExtractionRequest;

$client = new Client(); // assumes `struktur` is in your PATH

$result = $client->extract(
    new ExtractionRequest(
        inputs: [Input::fromBytes("Invoice #12345\nTotal: $99.00")],
        schema: [
            'type' => 'object',
            'properties' => [
                'invoiceNumber' => ['type' => 'string'],
                'total'         => ['type' => 'number'],
            ],
            'required' => ['invoiceNumber', 'total'],
        ],
        strategy: 'simple',
        model:    'openai/gpt-4.1-mini',
    )
);

print_r($result->data);
// ['invoiceNumber' => '12345', 'total' => 99]
```

**What just happened?**

1. `Input::fromBytes()` created an input object from raw text.
2. `ExtractionRequest` bundled the input with a JSON Schema describing what you want back.
3. `Client::extract()` spawned the CLI as a subprocess, fed it the text via STDIN, and received the structured result via STDOUT.
4. `$result->data` is a plain PHP array matching your schema shape.

---

## 4. Inputs: Path, Bytes, Stream

Every operation takes exactly one input (multi-input is planned but not yet supported by the CLI).

### From a file path

```php
$input = Input::fromPath('/var/www/storage/invoices/invoice-42.pdf');
```

The CLI reads the file directly. No file content is loaded into PHP memory.

### From raw bytes (string)

```php
$input = Input::fromBytes(file_get_contents('/tmp/sample.txt'));
```

Useful when you already have the content in a variable (e.g. from an uploaded file in Laravel's `$request->getContent()`).

### From a stream resource

```php
$stream = fopen('/tmp/upload.pdf', 'rb');
$input  = Input::fromStream($stream);
```

The Client uses `stream_copy_to_stream()` to pipe the file into the CLI's STDIN. This is memory-efficient for large files — the file is never fully loaded into a PHP string.

**Validation:** `fromStream()` throws `InvalidArgumentException` if you pass anything other than a valid PHP stream resource.

```php
// These all throw:
Input::fromStream('not a stream');
Input::fromStream(123);
Input::fromStream(null);
Input::fromStream([]);
```

---

## 5. Parsing Documents

`parse()` converts a document into Struktur's internal **Artifact** format — a structured representation with pages, text slices, and embedded images.

```php
use Mateffy\Struktur\Dto\ParseRequest;

$result = $client->parse(
    new ParseRequest(inputs: [Input::fromPath('/path/to/report.pdf')])
);

foreach ($result->artifacts as $artifact) {
    echo "Type: {$artifact->type}\n";
    echo "Pages: " . count($artifact->contents) . "\n";

    foreach ($artifact->contents as $page) {
        echo "Text on page {$page->page}:\n{$page->text}\n";

        foreach ($page->media as $image) {
            echo "Image: {$image->url}\n";
        }
    }
}
```

**When to use `parse()` vs `extract()`:**

- **`parse()`** — you want the raw artifact structure (text per page, embedded images, metadata). Useful for document indexing or when you want to inspect what the parser saw.
- **`extract()`** — you want structured data matching a schema (e.g. "give me the invoice number and total as typed fields").

---

## 6. Extraction with Schemas

### Simple schema (flat object)

```php
$schema = [
    'type' => 'object',
    'properties' => [
        'companyName' => ['type' => 'string'],
        'foundedYear' => ['type' => 'integer'],
        'isPublic'    => ['type' => 'boolean'],
    ],
    'required' => ['companyName'],
];
```

### Nested schema

```php
$schema = [
    'type' => 'object',
    'properties' => [
        'invoiceNumber' => ['type' => 'string'],
        'lineItems' => [
            'type'  => 'array',
            'items' => [
                'type' => 'object',
                'properties' => [
                    'description' => ['type' => 'string'],
                    'quantity'    => ['type' => 'integer'],
                    'unitPrice'   => ['type' => 'number'],
                ],
            ],
        ],
        'total' => ['type' => 'number'],
    ],
    'required' => ['invoiceNumber', 'lineItems', 'total'],
];
```

### Schema as a PHP class (recommended for large projects)

Because schemas are just arrays, you can build them programmatically:

```php
class InvoiceSchema
{
    public static function build(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'invoiceNumber' => ['type' => 'string'],
                'date'          => ['type' => 'string', 'format' => 'date'],
                'customer' => [
                    'type' => 'object',
                    'properties' => [
                        'name'  => ['type' => 'string'],
                        'email' => ['type' => 'string', 'format' => 'email'],
                    ],
                ],
                'lineItems' => [
                    'type'  => 'array',
                    'items' => self::lineItemSchema(),
                ],
                'total' => ['type' => 'number'],
            ],
            'required' => ['invoiceNumber', 'date', 'lineItems', 'total'],
        ];
    }

    private static function lineItemSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'sku'         => ['type' => 'string'],
                'description' => ['type' => 'string'],
                'quantity'    => ['type' => 'integer'],
                'unitPrice'   => ['type' => 'number'],
            ],
            'required' => ['description', 'quantity', 'unitPrice'],
        ];
    }
}

// Usage
$result = $client->extract(
    new ExtractionRequest(
        inputs: [Input::fromPath('/path/to/invoice.pdf')],
        schema: InvoiceSchema::build(),
        strategy: 'simple',
        model: 'openai/gpt-4.1-mini',
    )
);
```

### Strategy and model

| Strategy | When to use |
|----------|-------------|
| `simple` | Single-pass extraction. Fastest. Best for simple documents. |
| `parallel` | Splits document into chunks, extracts in parallel. Good for large inputs. |
| `sequential` | Chunks extracted one at a time. Good for long narratives where context matters. |
| `parallelAutoMerge` | Parallel + automatic result merging. |
| `sequentialAutoMerge` | Sequential + automatic result merging. |
| `doublePass` | Two-pass extraction with intermediate validation. Most thorough. |
| `doublePassAutoMerge` | Two-pass + automatic merging. Best for complex multi-chunk documents. |
| `agent` | Uses an agent loop with tool calls. Best for web pages or when the extraction requires reasoning. |

---

## 7. Streaming Events

The CLI can emit real-time progress events as NDJSON on stderr. The PHP Client parses these and fires your callback as they arrive.

```php
$client->extract(
    new ExtractionRequest(
        inputs: [Input::fromPath('/path/to/long-document.pdf')],
        schema: InvoiceSchema::build(),
        strategy: 'agent',
    ),
    onEvent: function ($event) {
        match (true) {
            $event instanceof StepEvent =>
                echo "[Step {$event->step}] {$event->label}\n",

            $event instanceof ToolStartEvent =>
                echo "[Tool] Starting {$event->toolName}\n",

            $event instanceof TokenUsageEvent =>
                echo "[Tokens] {$event->totalTokens} total\n",

            $event instanceof ProgressEvent =>
                echo "[Progress] {$event->current} / {$event->total}\n",

            $event instanceof FailureEvent =>
                echo "[Failed] {$event->reason}\n",

            default => null,
        };
    }
);
```

### All event types

| Event class | Triggered when |
|-------------|----------------|
| `StepEvent` | A new extraction step begins |
| `ToolStartEvent` | An agent tool call starts |
| `ToolEndEvent` | An agent tool call completes |
| `ReasoningEvent` | The agent emits a reasoning thought |
| `OutputSetEvent` | The output object is set |
| `OutputUpdatedEvent` | The output object is incrementally updated |
| `TokenUsageEvent` | Token usage is reported |
| `ProgressEvent` | Chunking or processing progress updates |
| `RetryEvent` | A retry is attempted after a failure |
| `FinishEvent` | Extraction completes successfully |
| `FailureEvent` | Extraction fails |

### Laravel SSE Streaming

A common pattern: stream events from a Struktur extraction directly to the browser via Server-Sent Events.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\StreamedResponse;
use Mateffy\Struktur\Client;
use Mateffy\Struktur\Input;
use Mateffy\Struktur\Dto\ExtractionRequest;
use Mateffy\Struktur\Dto\Event;

class ExtractionController extends Controller
{
    public function __construct(private Client $struktur) {}

    public function extract(Request $request): StreamedResponse
    {
        $schema = [
            'type' => 'object',
            'properties' => [
                'companyName' => ['type' => 'string'],
                'amount'      => ['type' => 'number'],
            ],
            'required' => ['companyName', 'amount'],
        ];

        return response()->stream(function () use ($request, $schema) {
            $input = $request->hasFile('document')
                ? Input::fromStream($request->file('document')->openFile())
                : Input::fromBytes($request->input('text'));

            $result = $this->struktur->extract(
                new ExtractionRequest(
                    inputs: [$input],
                    schema: $schema,
                    strategy: 'simple',
                ),
                onEvent: function ($event) {
                    $data = match (true) {
                        $event instanceof Event\StepEvent => [
                            'type'  => 'step',
                            'step'  => $event->step,
                            'label' => $event->label,
                        ],
                        $event instanceof Event\ProgressEvent => [
                            'type'    => 'progress',
                            'current' => $event->current,
                            'total'   => $event->total,
                            'percent' => $event->percent,
                        ],
                        $event instanceof Event\TokenUsageEvent => [
                            'type'  => 'usage',
                            'total' => $event->totalTokens,
                        ],
                        default => ['type' => 'event', 'class' => get_class($event)],
                    };

                    echo "data: " . json_encode($data) . "\n\n";
                    ob_flush();
                    flush();
                }
            );

            // Final result
            echo "data: " . json_encode([
                'type' => 'result',
                'data' => $result->data,
            ]) . "\n\n";
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
```

**Frontend (JavaScript):**

```javascript
const source = new EventSource('/api/extract');

source.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);

    if (msg.type === 'step') {
        console.log(`Step ${msg.step}: ${msg.label}`);
    } else if (msg.type === 'progress') {
        updateProgressBar(msg.percent);
    } else if (msg.type === 'result') {
        displayResult(msg.data);
        source.close();
    }
});
```

---

## 8. Error Handling

All errors throw typed exceptions. You can catch them specifically or catch the base class.

```php
use Mateffy\Struktur\Exception;

try {
    $result = $client->extract($request);
} catch (Exception\ProcessException $e) {
    // The CLI binary could not be started (wrong path, not executable, not found)
    echo "Failed to start process: {$e->getMessage()}\n";
} catch (Exception\ExtractionFailedException $e) {
    // The CLI ran but extraction failed (non-zero exit code)
    echo "Extraction failed: {$e->getMessage()}\n";

    if ($e->stderr !== null) {
        echo "CLI stderr: {$e->stderr}\n";
    }
} catch (Exception\SchemaValidationException $e) {
    // Schema validation failed (rare in the adapter path; more relevant for direct SDK use)
    echo "Schema errors:\n";
    foreach ($e->errors as $error) {
        echo "  - $error\n";
    }
} catch (\JsonException $e) {
    // The CLI returned invalid JSON on stdout
    echo "Invalid JSON from CLI: {$e->getMessage()}\n";
}
```

### Exception hierarchy

```
RuntimeException
└── StrukturException
    ├── ProcessException
    ├── ExtractionFailedException  (has optional $stderr)
    └── SchemaValidationException    (has $errors array)
```

---

## 9. Laravel Integration

### Service Provider

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Mateffy\Struktur\Client;

class StrukturServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Client::class, function () {
            $binary = config('services.struktur.binary', 'struktur');
            return new Client(binaryPath: $binary);
        });
    }
}
```

### Config

```php
// config/services.php
'struktur' => [
    'binary' => env('STRUKTUR_BINARY', 'struktur'),
],
```

### In a Job

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Mateffy\Struktur\Client;
use Mateffy\Struktur\Input;
use Mateffy\Struktur\Dto\ExtractionRequest;

class ExtractInvoiceData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private string $filePath) {}

    public function handle(Client $struktur): void
    {
        $result = $struktur->extract(
            new ExtractionRequest(
                inputs: [Input::fromPath($this->filePath)],
                schema: [
                    'type' => 'object',
                    'properties' => [
                        'invoiceNumber' => ['type' => 'string'],
                        'total'         => ['type' => 'number'],
                        'vendor'        => ['type' => 'string'],
                    ],
                    'required' => ['invoiceNumber', 'total'],
                ],
                strategy: 'simple',
            )
        );

        // Store in database
        Invoice::create($result->data);
    }
}
```

### In a CLI Command

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Mateffy\Struktur\Client;
use Mateffy\Struktur\Input;
use Mateffy\Struktur\Dto\ExtractionRequest;
use Mateffy\Struktur\Dto\Event;

class ExtractCommand extends Command
{
    protected $signature = 'struktur:extract {file} {--strategy=simple}';
    protected $description = 'Extract structured data from a document';

    public function handle(Client $struktur): int
    {
        $file = $this->argument('file');
        $strategy = $this->option('strategy');

        $bar = $this->output->createProgressBar(100);

        $result = $struktur->extract(
            new ExtractionRequest(
                inputs: [Input::fromPath($file)],
                schema: [
                    'type' => 'object',
                    'properties' => [
                        'title'   => ['type' => 'string'],
                        'summary' => ['type' => 'string'],
                    ],
                ],
                strategy: $strategy,
            ),
            onEvent: function ($event) use ($bar) {
                if ($event instanceof Event\StepEvent) {
                    $this->info("Step {$event->step}: {$event->label}");
                }
                if ($event instanceof Event\ProgressEvent && $event->percent !== null) {
                    $bar->setProgress((int) $event->percent);
                }
                if ($event instanceof Event\FinishEvent) {
                    $bar->finish();
                    $this->newLine();
                }
            }
        );

        $this->table(
            array_keys($result->data),
            [array_values($result->data)]
        );

        return self::SUCCESS;
    }
}
```

---

## 10. Architecture Notes

### How the subprocess works

```
┌─────────────┐     proc_open      ┌─────────────┐
│   PHP       │ ─────────────────> │  Struktur   │
│   Client    │    STDIN: bytes    │   CLI       │
│             │ <───────────────── │  (Node.js)  │
│             │    STDOUT: JSON    │             │
│             │ <───────────────── │             │
│             │    STDERR: NDJSON  │             │
│             │      events        │             │
└─────────────┘                    └─────────────┘
```

1. PHP opens the CLI via `proc_open()` with three pipes: STDIN, STDOUT, STDERR.
2. If the input is bytes or a stream, PHP writes it to STDIN.
3. If the input is a path, the CLI reads the file directly.
4. PHP reads STDERR line-by-line in a non-blocking `stream_select` loop, parsing each NDJSON event and invoking the user callback immediately.
5. When the CLI exits, PHP reads the final JSON from STDOUT, decodes it, and returns it in `ExtractionResult->data`.

### Why stderr for events?

The CLI's stdout is reserved for the final result. Events go to stderr because:
- stdout stays clean for the JSON payload
- stderr is a standard pipe available on all Unix systems without OS-level tricks
- When `--format json` is active, the CLI suppresses its human TUI, so stderr becomes a pure NDJSON event stream

### The `extractFirstJsonObject` quirk

Some CLI strategies emit the final JSON twice (once via `console.log` and once via `writeOutput`). The Client handles this by scanning stdout for the first well-formed JSON object using a brace-depth parser that correctly handles nested objects and escaped strings.

### Performance considerations

- **Memory:** Stream inputs are piped directly via `stream_copy_to_stream()`. A 100MB PDF does not get loaded into a PHP string.
- **Latency:** The Client uses non-blocking I/O with `stream_select()`. Events are delivered to your callback as soon as they arrive, not batched.
- **Timeout:** There is no built-in timeout. If you need one, wrap the call in a Laravel job with a `timeout` setting, or use `set_time_limit()`.

### Security

- All CLI arguments are passed through `escapeshellarg()`.
- The binary path can contain spaces (e.g. `bun /path/to/cli.js`) — the Client correctly splits and escapes each segment.
- No user input is ever interpolated into a shell command unsafely.

---

## Full Example: End-to-End Invoice Extractor

```php
<?php

require 'vendor/autoload.php';

use Mateffy\Struktur\Client;
use Mateffy\Struktur\Input;
use Mateffy\Struktur\Dto\ExtractionRequest;
use Mateffy\Struktur\Dto\Event;

$client = new Client(binaryPath: 'struktur');

$schema = [
    'type' => 'object',
    'properties' => [
        'invoiceNumber' => ['type' => 'string'],
        'date'          => ['type' => 'string'],
        'vendor' => [
            'type' => 'object',
            'properties' => [
                'name'    => ['type' => 'string'],
                'address' => ['type' => 'string'],
            ],
        ],
        'lineItems' => [
            'type'  => 'array',
            'items' => [
                'type' => 'object',
                'properties' => [
                    'description' => ['type' => 'string'],
                    'quantity'    => ['type' => 'integer'],
                    'unitPrice'   => ['type' => 'number'],
                    'lineTotal'   => ['type' => 'number'],
                ],
            ],
        ],
        'subtotal' => ['type' => 'number'],
        'tax'      => ['type' => 'number'],
        'total'    => ['type' => 'number'],
    ],
    'required' => ['invoiceNumber', 'date', 'vendor', 'lineItems', 'total'],
];

$events = [];

$result = $client->extract(
    new ExtractionRequest(
        inputs: [Input::fromPath('/path/to/invoice.pdf')],
        schema: $schema,
        strategy: 'simple',
        model: 'openai/gpt-4.1-mini',
    ),
    onEvent: function ($event) use (&$events) {
        $events[] = [
            'class' => get_class($event),
            'data'  => json_decode(json_encode($event), true),
        ];
    }
);

echo "=== Extracted Data ===\n";
print_r($result->data);

echo "\n=== Usage ===\n";
echo "Input tokens:  {$result->usage->inputTokens}\n";
echo "Output tokens: {$result->usage->outputTokens}\n";
echo "Total tokens:  {$result->usage->totalTokens}\n";

echo "\n=== Events ({$result->rawStdout}) ===\n";
foreach ($events as $e) {
    echo "[{$e['class']}] " . json_encode($e['data']) . "\n";
}
```

---

## Troubleshooting

### "struktur binary not found"

The Client defaults to `struktur` in PATH. If your binary lives elsewhere:

```php
// Global npm install
$client = new Client(binaryPath: 'struktur');

// Local binary
$client = new Client(binaryPath: '/usr/local/bin/struktur');

// Via Bun (space-separated path is handled correctly)
$client = new Client(binaryPath: 'bun /Users/you/struktur/packages/cli/dist/cli.js');
```

### "No valid JSON object found in stdout"

The CLI produced something unexpected on stdout. Check `$result->rawStdout` (or catch the `JsonException` and inspect the output manually). Common causes:
- The CLI printed an error message to stdout instead of stderr
- The model returned invalid JSON (rare with `--format json`)
- The CLI version is older than `--format json` support

### Events not firing

- Ensure you passed `--format json` to the CLI. The Client always does this, but if you're using the CLI directly, add the flag.
- Ensure the CLI is not in `--format text` mode (the default). In text mode, stderr contains human TUI output, not NDJSON.
- If using a non-TTY environment (e.g. Docker, CI), the TUI may be auto-disabled, but `--format json` is still required for events.

### High memory usage

- Use `Input::fromStream()` instead of `Input::fromBytes()` for large files.
- If you're buffering all events in an array, consider processing them incrementally instead.

---

## Next Steps

- Read the [Struktur CLI documentation](https://github.com/struktur-ai/struktur) for advanced CLI features (custom parsers, vision, telemetry).
- Explore the [SDK TypeScript source](https://github.com/struktur-ai/struktur/tree/main/packages/sdk) to understand the underlying extraction strategies.
- Check `packages/struktur-php/src/` — every `.php` file has a colocated `.test.php` showing usage examples.
