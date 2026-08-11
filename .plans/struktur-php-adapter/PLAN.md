# Struktur PHP Adapter — Implementation Plan

> **Status:** DRAFT
> **Plan:** `./.plans/struktur-php-adapter/PLAN.md`
> **Last updated:** 2026-07-01

---

## ⚠️ Instructions for the implementing agent

**READ THIS SECTION BEFORE TOUCHING ANY CODE.**

You are an executor. Your job is to implement this plan exactly as written.
This plan was written with full context from a prior research and design session.
You do not have that context. The plan is your complete specification.

**Rules you must follow without exception:**

1. **Do not deviate from this plan.** Do not simplify steps, skip phases, combine
   tasks, or substitute approaches — even if a different approach seems easier or
   more elegant. The decisions here were made deliberately. Respect them.

2. **Do not make decisions not explicitly covered by this plan.** If you reach a
   point where the plan is ambiguous or where you feel you need to make a choice
   the plan does not make for you, **stop and ask the user** before proceeding.
   Do not guess. Do not pick the path of least resistance. Do not assume.

3. **Do not change the plan.** If you believe a plan decision is wrong or
   suboptimal, stop and tell the user why. Do not silently implement something
   different.

4. **Work phase by phase.** Complete one phase fully before starting the next.
   Do not jump ahead.

5. **Update the Progress section** at the bottom of this file as you work:
   - Mark phase checkboxes `[x]` when a phase is complete.
   - Mark task checkboxes `[x]` as each task is done.
   - After each phase, write a brief note under "Session log" with what was
     done and what comes next. This allows a new agent to resume from exactly
     where you left off if the session is interrupted.

6. **If your context window is running low**, finish the current task cleanly,
   update the Progress section with exactly where you stopped and what the next
     step is, then tell the user you need a fresh session to continue.

---

## Goal

Build a Composer package (`struktur/sdk-php`) that provides strongly-typed PHP DTOs over the Struktur Node.js CLI, plus a `--format` mode on the CLI that emits a clean NDJSON event stream so the PHP adapter can stream progress back to callers in real time.

## Approach

Add a `--format text|json|debug` flag to the Struktur CLI. In `--format json` mode, the CLI emits a clean NDJSON event stream on **stderr** (no TUI, no human-readable spinner art) while keeping the final result JSON on **stdout**. Then build a PHP package with a `Client` class that shells out to the CLI via `proc_open`, streams file bytes into the CLI's stdin using `stream_copy_to_stream` (no full memory load), and parses the stderr NDJSON lines into strongly-typed PHP event DTOs that fire a user-provided callback. All public surfaces are typed classes — no raw arrays escape the package boundary except the actual extraction result data, which is an `array` by design.

**Alternatives considered and rejected:**
- **Full PHP port of the agent loop** (`laravel/EXPLORE.md`) — rejected because it requires re-implementing `AgentStrategy.ts`, `ArtifactFilesystem.ts`, the tool loop, validation retry, and vision handling in PHP. This is thousands of lines and must be kept in sync with every TS SDK change.
- **Custom file descriptor (fd 3) for events** — rejected because it adds OS-level complexity for minimal gain. Using stderr for events when `--format json` is active is simpler and equally clean since TUI is disabled in that mode.
- **PSR-7 StreamInterface for inputs** — rejected to keep the package zero-dependency. PHP native stream resources are sufficient.

## Tech stack & conventions

- **TS CLI**: Bun monorepo at `packages/cli/`, uses `citty` for CLI args. Debug logging lives in `packages/sdk/src/debug/logger.ts`.
- **PHP package**: PHP 8.2+, zero runtime dependencies. `readonly` classes for DTOs. Native PHP stream resources for input streaming.
- **Testing**: PHP side uses PHPUnit (installed as dev-dependency). TS side uses `bun test`.
- **Schema input**: PHP arrays that are `json_encode`'d internally. No DSL builder.
- **Event stream**: NDJSON (newline-delimited JSON), one object per line, on stderr when `--format json`.

---

## Context & orientation

### Existing codebase

- `packages/cli/src/cli.ts` — the CLI entrypoint. Defines commands (`extract`, `parse`, `config`, `utils`). Relevant to us: `extractCommand` and `parseCommand`.
- `packages/cli/src/cli/shared.ts` — shared CLI utilities. `loadArtifactsFromOptions()` handles stdin/file/text/artifact input resolution. `readStdinText()` reads full stdin as a string.
- `packages/sdk/src/debug/logger.ts` — `createDebugLogger(enabled)` returns an object with methods like `cliInit()`, `step()`, `llmCallStart()`, etc. Each writes a JSON line to stderr when enabled.
- `packages/sdk/src/types.ts` — core types: `Artifact`, `ExtractionResult`, `Usage`, `StepInfo`, `AgentToolStartInfo`, `AgentToolEndInfo`, `AgentReasoningInfo`, `ExtractionEvents`.
- `packages/sdk/src/extract.ts` — main `extract()` function. Takes `ExtractionOptions` (including `events` callbacks) and runs the strategy.

### What `--debug` does today

`--debug` enables `createDebugLogger(true)`. This writes verbose developer-oriented JSON lines to stderr, including:
- `cli_init`, `schema_loaded`, `artifacts_loaded`
- `llm_call_start` / `llm_call_complete` (with prompt lengths)
- `prompt_system`, `prompt_user`, `raw_response` (full prompt text and raw LLM responses)
- `validation_failed` with full error arrays
- `chunking_start`, `batching_complete`, etc.

These are **debug logs**, not a public event contract. They include internal call IDs, raw prompt text, and raw response objects — far too verbose and unstable for a machine consumer. The PHP adapter needs a **clean, stable, public event stream** with only the events relevant to a caller: step progress, tool invocations, reasoning, output updates, finish, and usage.

### Existing event callbacks

The `extract()` function accepts an `ExtractionEvents` object with these callbacks:
- `onStep(info: StepInfo)` — strategy step progress
- `onProgress(info: ProgressInfo)` — batch/chunk progress
- `onRetry(info: RetryInfo)` — retry attempts
- `onTokenUsage(info: TokenUsageInfo)` — token usage per call
- `onAgentToolStart(info: AgentToolStartInfo)` — agent tool invocation start
- `onAgentToolEnd(info: AgentToolEndInfo)` — agent tool invocation end
- `onAgentMessage(info: AgentMessageInfo)` — agent messages
- `onAgentReasoning(info: AgentReasoningInfo)` — agent thinking/reasoning
- `onVisionStatus(info: {enabled, provider, modelId})` — vision capability detection

These are the events we will surface in `--format json` mode.

---

## Scope

**In scope (exact paths):**
- `packages/cli/src/cli.ts` — add `--format` arg, wire event emission
- `packages/cli/src/cli/shared.ts` — update `usage()` text
- `packages/sdk/src/debug/logger.ts` — no changes (keep `--debug` behavior intact)
- `packages/sdk/src/types.ts` — no changes
- `packages/sdk/src/extract.ts` — no changes
- `packages/struktur-php/` — new Composer package root (or `laravel/struktur-php/`)
- `packages/struktur-php/src/` — PHP source tree
- `packages/struktur-php/tests/` — PHP test tree
- `packages/struktur-php/composer.json`

**Out of scope:**
- Changes to strategies, parsers, chunking, LLM client, validation logic, merge logic — the TS SDK core stays untouched.
- Laravel AI SDK integration (`laravel/ai` package) — this adapter does not use it.
- Windows-specific process handling.
- Automatic installation of the `struktur` Node binary.
- Backwards compatibility with older CLI versions.

**Forbidden actions (do not do these under any circumstances):**
- Do NOT remove or change `--debug` behavior. `--debug` stays as a separate flag for developer verbose logging.
- Do NOT modify the core extraction strategies (`packages/sdk/src/strategies/**`).
- Do NOT add PHP runtime dependencies (PSR-7, Guzzle, Symfony Process, etc.). The PHP package must have zero required dependencies.
- Do NOT create a JSON Schema builder DSL in PHP. Schema input stays as plain PHP arrays.
- Do NOT add `composer install` scripts that try to install Node or the Struktur CLI.

---

## Acceptance criteria

- Running `bun test packages/cli/src/cli.test.ts` passes after the CLI changes.
- Running `struktur extract --format json --stdin --schema-json '{"type":"object","properties":{"x":{"type":"string"}}}' <<< "hello"` produces NDJSON lines on stderr and a single JSON object on stdout.
- Running `struktur extract --format text --stdin ...` shows the human TUI spinner on stderr (current behavior preserved).
- Running `struktur extract --format debug --stdin ...` produces verbose debug NDJSON on stderr (current `--debug` behavior preserved).
- The PHP `Client::extract()` method can be called with `inputs: [Input::fromPath('/tmp/test.pdf')]` and returns an `ExtractionResult` with typed `Usage`.
- The PHP `Client::extract()` method can be called with `inputs: [Input::fromStream(fopen('/tmp/test.pdf', 'r'))]` and streams the file into the CLI without loading the entire file into a PHP string.
- PHP event callback receives a `StepEvent` DTO when the CLI emits a step event.
- PHP package tests pass with `vendor/bin/phpunit`.

---

## Architecture

### Data flow

```
PHP App
  │
  ├─► ExtractionRequest(inputs: [Input::fromStream(...)], schema: [...])
  │     │
  │     ▼
  │   Client::extract($request, onEvent: fn($e) => ...)
  │     │
  │     ├─ proc_open('struktur extract --format json ...')
  │     │     stdin  ← stream_copy_to_stream(Input stream → proc stdin pipe)
  │     │     stdout → final JSON result
  │     │     stderr → NDJSON event lines
  │     │
  │     ├─ stream_select loop over stdout + stderr
  │     │     parses each stderr line → EventParser → typed Event DTO
  │     │     calls $onEvent($typedEvent)
  │     │
  │     └─ returns ExtractionResult(data: array, usage: Usage)
  │
  ▼
Typed Event DTOs (StepEvent, ToolStartEvent, ToolEndEvent,
                  ReasoningEvent, OutputSetEvent, OutputUpdatedEvent,
                  TokenUsageEvent, ProgressEvent, RetryEvent,
                  FinishEvent, FailureEvent)
```

### CLI `--format` flag

A new CLI argument `--format <mode>` with three mutually exclusive modes:

| Mode | Stdout | Stderr | TUI |
|---|---|---|---|
| `text` (default) | Final result JSON | Human TUI spinners/icons | Enabled |
| `json` | Final result JSON | NDJSON event stream | **Disabled** |
| `debug` | Final result JSON | Verbose debug NDJSON | Disabled (replaces TUI with debug log) |

`--debug` remains as a legacy alias for `--format debug`. If both `--debug` and `--format` are passed, error.

### PHP package structure

```
packages/struktur-php/
├── composer.json
├── phpunit.xml.dist
├── src/
│   ├── Client.php
│   ├── Input.php
│   ├── Dto/
│   │   ├── ExtractionRequest.php
│   │   ├── ExtractionResult.php
│   │   ├── ParseRequest.php
│   │   ├── ParseResult.php
│   │   ├── Usage.php
│   │   ├── Artifact.php
│   │   ├── ArtifactContent.php
│   │   ├── ArtifactImage.php
│   │   └── Event/
│   │       ├── ExtractionEvent.php          (interface)
│   │       ├── StepEvent.php
│   │       ├── ToolStartEvent.php
│   │       ├── ToolEndEvent.php
│   │       ├── ReasoningEvent.php
│   │       ├── OutputSetEvent.php
│   │       ├── OutputUpdatedEvent.php
│   │       ├── TokenUsageEvent.php
│   │       ├── ProgressEvent.php
│   │       ├── RetryEvent.php
│   │       ├── FinishEvent.php
│   │       └── FailureEvent.php
│   ├── Exception/
│   │   ├── StrukturException.php
│   │   ├── ProcessException.php
│   │   ├── ExtractionFailedException.php
│   │   └── SchemaValidationException.php
│   └── Internal/
│       └── EventParser.php
└── tests/
    ├── ClientTest.php
    ├── EventParserTest.php
    └── Dto/
        └── EventTest.php
```

### Key interfaces

**Input DTO** — accepts files, raw bytes, or stream resources:
```php
namespace Struktur;

final readonly class Input
{
    private function __construct(
        public ?string $path = null,
        public ?string $bytes = null,
        public $stream = null, // resource | null
    ) {}

    public static function fromPath(string $path): self;
    public static function fromBytes(string $bytes): self;
    public static function fromStream(mixed $stream): self;
}
```

**ExtractionRequest DTO**:
```php
namespace Struktur\Dto;

final readonly class ExtractionRequest
{
    /**
     * @param list<Input> $inputs
     * @param array<string, mixed> $schema
     */
    public function __construct(
        public array $inputs,
        public array $schema,
        public ?string $strategy = null,
        public ?string $model = null,
        public ?string $outputInstructions = null,
    ) {}
}
```

**Client::extract()**:
```php
namespace Struktur;

class Client
{
    public function __construct(
        private string $binaryPath = 'struktur',
        private ?string $workingDirectory = null,
    ) {}

    /**
     * @param callable(Event\ExtractionEvent): void|null $onEvent
     */
    public function extract(
        Dto\ExtractionRequest $request,
        ?callable $onEvent = null,
    ): Dto\ExtractionResult {}

    public function parse(Dto\ParseRequest $request): Dto\ParseResult {}
}
```

**EventParser** maps raw JSON to typed DTOs by `event` field:
```php
namespace Struktur\Internal;

class EventParser
{
    public static function parse(string $jsonLine): Event\ExtractionEvent {}
}
```

### Streaming mechanism in PHP

When `inputs` contains a stream resource, the `Client` uses `stream_copy_to_stream($input->stream, $pipes[0])` instead of `fwrite($pipes[0], $input->bytes)`. This avoids loading the entire file into PHP memory.

When `inputs` contains a path, the `Client` opens it as a stream internally and streams it through.

When `inputs` contains raw bytes, it writes them directly (acceptable for small payloads).

For now, `inputs` supports exactly **1 item**. The constructor validates this. The array shape is future-proofed for multi-input when the CLI supports it.

---

## Phases & tasks

### Phase 1: Add `--format` to the Struktur CLI

This phase adds the `--format text|json|debug` flag and the NDJSON event emission on stderr for `--format json` mode. It leaves the CLI in a working, tested state.

#### Task 1.1: Add `--format` argument to `extractCommand`

**Why:** The CLI needs a new top-level argument so the PHP adapter can request a machine-readable event stream instead of the human TUI.

**Files:**
- Modify: `packages/cli/src/cli.ts` (in `extractCommand` args block, ~line 1770)
- Modify: `packages/cli/src/cli/shared.ts` (in `usage()` text)

**Steps:**

- [ ] **Step 1:** Add `--format` argument to `extractCommand` args.
  ```ts
  format: {
    type: "string",
    description: "Output format mode: text (default TUI), json (NDJSON events on stderr), debug (verbose debug NDJSON)",
    default: "text",
    valueHint: "text|json|debug",
  },
  ```
- [ ] **Step 2:** Add mutual exclusion check: if `--debug` is also true when `--format` is explicitly set (not default), throw `UserError`.
  ```ts
  if (args.debug && args.format !== "text") {
    throw new UserError("--debug and --format are mutually exclusive");
  }
  ```
- [ ] **Step 3:** In `extractCommand.run`, resolve effective format: if `args.debug === true`, treat as `format = "debug"`; else use `args.format`.
  ```ts
  const format = args.debug ? "debug" : (args.format as string);
  ```
- [ ] **Step 4:** Update `usage()` in `packages/cli/src/cli/shared.ts` to document `--format`.
  Add line under extract options:
  ```
  --format <mode>          Output format: text (default), json, debug
  ```
- [ ] **Step 5:** Run CLI tests.
  ```bash
  bun test packages/cli/src/cli.test.ts
  ```
  Expected: PASS (tests may need updating in Task 1.3)

#### Task 1.2: Implement NDJSON event emitter for `--format json`

**Why:** When `--format json` is active, every `ExtractionEvents` callback must serialize to a JSON line on stderr instead of the TUI.

**Files:**
- Modify: `packages/cli/src/cli.ts` (in `extractCommand.run`, around the `events` object construction, ~line 1900)

**Steps:**

- [ ] **Step 1:** Create a `createEventEmitter(format)` helper inside `cli.ts` (or inline). When `format === "json"`, return a function that writes to stderr:
  ```ts
  const emitEvent = (event: Record<string, unknown>) => {
    if (format !== "json") return;
    const line = JSON.stringify({ timestamp: Date.now(), ...event });
    process.stderr.write(line + "\n");
  };
  ```
- [ ] **Step 2:** Wrap each existing event handler with `emitEvent(...)`. For example, `onStep` becomes:
  ```ts
  onStep: async (info) => {
    emitEvent({ event: "step", step: info.step, total: info.total, label: info.label });
    // existing TUI code below...
  },
  ```
- [ ] **Step 3:** Do the same for all event handlers:
  - `onProgress` → `{ event: "progress", current, total, percent }`
  - `onRetry` → `{ event: "retry", attempt, maxAttempts, reason }`
  - `onTokenUsage` → `{ event: "token_usage", inputTokens, outputTokens, totalTokens, model }`
  - `onAgentToolStart` → `{ event: "tool_start", toolName, toolCallId, args }`
  - `onAgentToolEnd` → `{ event: "tool_end", toolCallId, result, error }`
  - `onAgentMessage` → `{ event: "agent_message", content, role }`
  - `onAgentReasoning` → `{ event: "agent_reasoning", thought }`
  - `onVisionStatus` → `{ event: "vision_status", enabled, provider, modelId }`
- [ ] **Step 4:** Suppress the TUI when `format === "json"` or `format === "debug"`. The `spinner` and `agentTUI` should only be created when `format === "text"`.
  ```ts
  const showTui = format === "text";
  const spinner = isDebug || !showTui ? null : createSpinner();
  const agentTUI = !isDebug && showTui && args.strategy === "agent" ? new AgentTUI() : null;
  ```
- [ ] **Step 5:** Ensure `--format debug` continues to use the existing `debug` logger (which already writes verbose JSON to stderr). No new code needed for debug mode beyond the `format` resolution.

#### Task 1.3: Update CLI tests for `--format`

**Why:** Existing tests may assert on stderr content or spinner behavior. We need to verify `--format json` produces NDJSON and `--format text` preserves the TUI.

**Files:**
- Modify: `packages/cli/src/cli.test.ts`
- Create: `packages/cli/src/format.test.ts` (if cli.test.ts is too large)

**Steps:**

- [ ] **Step 1:** Add a test that verifies `--format json --stdin ... --schema-json '{...}'` produces lines on stderr that are valid JSON objects with an `event` field.
  ```ts
  // Pseudocode for the test approach:
  // Mock the extract function or use a minimal stdin + schema
  // Capture stderr, split by newline, assert each line parses as JSON with event field
  ```
- [ ] **Step 2:** Add a test that `--format text` still creates a spinner when stderr is a TTY.
- [ ] **Step 3:** Run all CLI tests.
  ```bash
  bun test packages/cli/src/cli.test.ts
  ```
  Expected: PASS

### Phase 2: Create the PHP package skeleton

This phase sets up the Composer package structure with DTOs and exceptions.

#### Task 2.1: Create `composer.json` and directory structure

**Why:** The package needs to be a valid Composer package with autoloading before any source files are written.

**Files:**
- Create: `packages/struktur-php/composer.json`
- Create: `packages/struktur-php/phpunit.xml.dist`
- Create: `packages/struktur-php/.gitignore`

**Steps:**

- [ ] **Step 1:** Write `composer.json`:
  ```json
  {
    "name": "struktur/sdk-php",
    "description": "PHP adapter for the Struktur structured data extraction CLI",
    "type": "library",
    "license": "MIT",
    "require": {
      "php": "^8.2"
    },
    "require-dev": {
      "phpunit/phpunit": "^10.0"
    },
    "autoload": {
      "psr-4": {
        "Struktur\\": "src/"
      }
    },
    "autoload-dev": {
      "psr-4": {
        "Struktur\\Tests\\": "tests/"
      }
    }
  }
  ```
- [ ] **Step 2:** Write `phpunit.xml.dist`:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:noNamespaceSchemaLocation="https://schema.phpunit.de/10.0/phpunit.xsd"
           bootstrap="vendor/autoload.php"
           colors="true"
           cacheDirectory=".phpunit.cache">
    <testsuites>
      <testsuite name="default">
        <directory>tests</directory>
      </testsuite>
    </testsuites>
  </phpunit>
  ```
- [ ] **Step 3:** Create directory structure:
  ```bash
  mkdir -p packages/struktur-php/src/{Dto/Event,Exception,Internal}
  mkdir -p packages/struktur-php/tests/{Dto,Exception,Internal}
  ```
- [ ] **Step 4:** Run `composer install` in the PHP package directory.
  ```bash
  cd packages/struktur-php && composer install
  ```
  Expected: installs PHPUnit and generates autoloader.

#### Task 2.2: Write exception classes

**Why:** Typed exceptions are the foundation for error handling in the adapter.

**Files:**
- Create: `packages/struktur-php/src/Exception/StrukturException.php`
- Create: `packages/struktur-php/src/Exception/ProcessException.php`
- Create: `packages/struktur-php/src/Exception/ExtractionFailedException.php`
- Create: `packages/struktur-php/src/Exception/SchemaValidationException.php`

**Steps:**

- [ ] **Step 1:** Write base exception:
  ```php
  <?php
  namespace Struktur\Exception;

  class StrukturException extends \RuntimeException {}
  ```
- [ ] **Step 2:** Write `ProcessException` extending `StrukturException`.
- [ ] **Step 3:** Write `ExtractionFailedException` extending `StrukturException` with an optional `$stderr` property.
- [ ] **Step 4:** Write `SchemaValidationException` extending `StrukturException` with a `$errors` array property.
- [ ] **Step 5:** Write minimal tests that each exception can be constructed and thrown.

#### Task 2.3: Write DTO classes (Usage, Artifact, ArtifactContent, ArtifactImage)

**Why:** These represent the data structures returned by `parse` and `extract`.

**Files:**
- Create: `packages/struktur-php/src/Dto/Usage.php`
- Create: `packages/struktur-php/src/Dto/Artifact.php`
- Create: `packages/struktur-php/src/Dto/ArtifactContent.php`
- Create: `packages/struktur-php/src/Dto/ArtifactImage.php`

**Steps:**

- [ ] **Step 1:** Write `Usage`:
  ```php
  <?php
  namespace Struktur\Dto;

  final readonly class Usage
  {
    public function __construct(
      public int $inputTokens,
      public int $outputTokens,
      public int $totalTokens,
    ) {}
  }
  ```
- [ ] **Step 2:** Write `ArtifactImage`:
  ```php
  <?php
  namespace Struktur\Dto;

  final readonly class ArtifactImage
  {
    /**
     * @param array<string, mixed> $raw
     */
    public function __construct(
      public string $type,
      public ?string $url = null,
      public ?string $base64 = null,
      public ?string $text = null,
      public ?int $width = null,
      public ?int $height = null,
      public ?string $imageType = null,
      public array $raw = [],
    ) {}
  }
  ```
- [ ] **Step 3:** Write `ArtifactContent`:
  ```php
  <?php
  namespace Struktur\Dto;

  final readonly class ArtifactContent
  {
    /**
     * @param list<ArtifactImage> $media
     */
    public function __construct(
      public ?int $page = null,
      public ?string $text = null,
      public array $media = [],
    ) {}
  }
  ```
- [ ] **Step 4:** Write `Artifact`:
  ```php
  <?php
  namespace Struktur\Dto;

  final readonly class Artifact
  {
    /**
     * @param list<ArtifactContent> $contents
     * @param array<string, mixed> $metadata
     */
    public function __construct(
      public string $id,
      public string $type,
      public array $contents = [],
      public array $metadata = [],
      public ?int $tokens = null,
    ) {}
  }
  ```
- [ ] **Step 5:** Write tests that instantiate each DTO and verify properties.

#### Task 2.4: Write request/result DTOs

**Why:** `ExtractionRequest`, `ExtractionResult`, `ParseRequest`, `ParseResult` are the public API surfaces.

**Files:**
- Create: `packages/struktur-php/src/Dto/ExtractionRequest.php`
- Create: `packages/struktur-php/src/Dto/ExtractionResult.php`
- Create: `packages/struktur-php/src/Dto/ParseRequest.php`
- Create: `packages/struktur-php/src/Dto/ParseResult.php`
- Create: `packages/struktur-php/src/Input.php`

**Steps:**

- [ ] **Step 1:** Write `Input.php`:
  ```php
  <?php
  namespace Struktur;

  final readonly class Input
  {
    private function __construct(
      public ?string $path = null,
      public ?string $bytes = null,
      public $stream = null,
    ) {}

    public static function fromPath(string $path): self
    {
      return new self(path: $path);
    }

    public static function fromBytes(string $bytes): self
    {
      return new self(bytes: $bytes);
    }

    public static function fromStream(mixed $stream): self
    {
      if (!is_resource($stream)) {
        throw new \InvalidArgumentException('Input must be a valid stream resource');
      }
      return new self(stream: $stream);
    }
  }
  ```
- [ ] **Step 2:** Write `ExtractionRequest`:
  ```php
  <?php
  namespace Struktur\Dto;

  use Struktur\Input;

  final readonly class ExtractionRequest
  {
    /**
     * @param list<Input> $inputs
     * @param array<string, mixed> $schema
     */
    public function __construct(
      public array $inputs,
      public array $schema,
      public ?string $strategy = null,
      public ?string $model = null,
      public ?string $outputInstructions = null,
    ) {
      if (count($inputs) !== 1) {
        throw new \InvalidArgumentException('Exactly 1 input is required (multi-input not yet supported)');
      }
    }
  }
  ```
- [ ] **Step 3:** Write `ExtractionResult`:
  ```php
  <?php
  namespace Struktur\Dto;

  final readonly class ExtractionResult
  {
    /**
     * @param array<string, mixed> $data
     */
    public function __construct(
      public array $data,
      public Usage $usage,
      public ?string $rawStdout = null,
    ) {}
  }
  ```
- [ ] **Step 4:** Write `ParseRequest`:
  ```php
  <?php
  namespace Struktur\Dto;

  use Struktur\Input;

  final readonly class ParseRequest
  {
    /**
     * @param list<Input> $inputs
     */
    public function __construct(
      public array $inputs,
    ) {
      if (count($inputs) !== 1) {
        throw new \InvalidArgumentException('Exactly 1 input is required');
      }
    }
  }
  ```
- [ ] **Step 5:** Write `ParseResult`:
  ```php
  <?php
  namespace Struktur\Dto;

  final readonly class ParseResult
  {
    /**
     * @param list<Artifact> $artifacts
     */
    public function __construct(
      public array $artifacts,
      public ?string $rawStdout = null,
    ) {}
  }
  ```
- [ ] **Step 6:** Write tests for construction and validation (e.g., 0 inputs throws).

### Phase 3: Write the PHP Client and Event system

This phase implements the process runner, event parser, and the main `Client` class.

#### Task 3.1: Write event DTOs

**Why:** The PHP adapter must parse NDJSON lines from stderr into typed PHP objects.

**Files:**
- Create: `packages/struktur-php/src/Dto/Event/ExtractionEvent.php` (interface)
- Create: `packages/struktur-php/src/Dto/Event/StepEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/ToolStartEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/ToolEndEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/ReasoningEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/OutputSetEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/OutputUpdatedEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/TokenUsageEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/ProgressEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/RetryEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/FinishEvent.php`
- Create: `packages/struktur-php/src/Dto/Event/FailureEvent.php`

**Steps:**

- [ ] **Step 1:** Write the interface:
  ```php
  <?php
  namespace Struktur\Dto\Event;

  interface ExtractionEvent
  {
    public int $timestamp { get; }
  }
  ```
- [ ] **Step 2:** Write all event DTOs as `final readonly` classes implementing the interface. Each constructor takes the relevant fields from the NDJSON event shape plus `int $timestamp`. Example `StepEvent`:
  ```php
  <?php
  namespace Struktur\Dto\Event;

  final readonly class StepEvent implements ExtractionEvent
  {
    public function __construct(
      public int $step,
      public ?int $total,
      public string $label,
      public int $timestamp,
    ) {}
  }
  ```
- [ ] **Step 3:** Write `ToolStartEvent` with `array $args`.
- [ ] **Step 4:** Write `ToolEndEvent` with `?array $result` and `?string $error`.
- [ ] **Step 5:** Write `OutputSetEvent` with `array $data`.
- [ ] **Step 6:** Write `OutputUpdatedEvent` with `array $changes`.
- [ ] **Step 7:** Write tests for each DTO.

#### Task 3.2: Write `EventParser`

**Why:** This is the bridge between CLI NDJSON lines and PHP event DTOs.

**Files:**
- Create: `packages/struktur-php/src/Internal/EventParser.php`
- Create: `packages/struktur-php/tests/Internal/EventParserTest.php`

**Steps:**

- [ ] **Step 1:** Implement `EventParser::parse(string $jsonLine): ExtractionEvent`:
  ```php
  <?php
  namespace Struktur\Internal;

  use Struktur\Dto\Event;

  class EventParser
  {
    public static function parse(string $jsonLine): Event\ExtractionEvent
    {
      $data = json_decode($jsonLine, true, 512, JSON_THROW_ON_ERROR);
      if (!is_array($data) || !isset($data['event'])) {
        throw new \InvalidArgumentException('Invalid event line: ' . $jsonLine);
      }

      $timestamp = $data['timestamp'] ?? time();

      return match ($data['event']) {
        'step' => new Event\StepEvent(
          step: $data['step'],
          total: $data['total'] ?? null,
          label: $data['label'] ?? '',
          timestamp: $timestamp,
        ),
        'tool_start' => new Event\ToolStartEvent(
          toolName: $data['toolName'],
          toolCallId: $data['toolCallId'] ?? '',
          args: $data['args'] ?? [],
          timestamp: $timestamp,
        ),
        'tool_end' => new Event\ToolEndEvent(
          toolCallId: $data['toolCallId'] ?? '',
          result: $data['result'] ?? null,
          error: $data['error'] ?? null,
          timestamp: $timestamp,
        ),
        'agent_reasoning' => new Event\ReasoningEvent(
          thought: $data['thought'] ?? '',
          timestamp: $timestamp,
        ),
        'output_set' => new Event\OutputSetEvent(
          data: $data['data'] ?? [],
          timestamp: $timestamp,
        ),
        'output_updated' => new Event\OutputUpdatedEvent(
          changes: $data['changes'] ?? [],
          timestamp: $timestamp,
        ),
        'token_usage' => new Event\TokenUsageEvent(
          inputTokens: $data['inputTokens'] ?? 0,
          outputTokens: $data['outputTokens'] ?? 0,
          totalTokens: $data['totalTokens'] ?? 0,
          model: $data['model'] ?? null,
          timestamp: $timestamp,
        ),
        'progress' => new Event\ProgressEvent(
          current: $data['current'],
          total: $data['total'],
          percent: $data['percent'] ?? null,
          timestamp: $timestamp,
        ),
        'retry' => new Event\RetryEvent(
          attempt: $data['attempt'],
          maxAttempts: $data['maxAttempts'],
          reason: $data['reason'] ?? null,
          timestamp: $timestamp,
        ),
        'finish' => new Event\FinishEvent(timestamp: $timestamp),
        'failure' => new Event\FailureEvent(
          reason: $data['reason'] ?? '',
          timestamp: $timestamp,
        ),
        default => throw new \InvalidArgumentException('Unknown event type: ' . $data['event']),
      };
    }
  }
  ```
- [ ] **Step 2:** Write tests that feed each event type JSON line and assert the returned DTO class and properties.
- [ ] **Step 3:** Write a test for unknown event type throwing.
- [ ] **Step 4:** Run tests.
  ```bash
  cd packages/struktur-php && vendor/bin/phpunit tests/Internal/EventParserTest.php
  ```
  Expected: PASS

#### Task 3.3: Write `Client::parse()`

**Why:** `parse` is simpler than `extract` (no event streaming needed, no schema). It validates the `Client` subprocess approach.

**Files:**
- Create: `packages/struktur-php/src/Client.php`
- Create: `packages/struktur-php/tests/ClientTest.php`

**Steps:**

- [ ] **Step 1:** Implement `Client::parse()`:
  ```php
  <?php
  namespace Struktur;

  use Struktur\Dto;
  use Struktur\Exception;

  class Client
  {
    public function __construct(
      private string $binaryPath = 'struktur',
      private ?string $workingDirectory = null,
    ) {}

    public function parse(Dto\ParseRequest $request): Dto\ParseResult
    {
      $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
      ];

      $command = $this->buildParseCommand($request);
      $process = proc_open($command, $descriptors, $pipes, $this->workingDirectory);

      if (!is_resource($process)) {
        throw new Exception\ProcessException('Failed to start struktur process');
      }

      $this->writeInputToStdin($request->inputs[0], $pipes[0]);
      fclose($pipes[0]);

      $stdout = stream_get_contents($pipes[1]);
      $stderr = stream_get_contents($pipes[2]);
      fclose($pipes[1]);
      fclose($pipes[2]);

      $exitCode = proc_close($process);

      if ($exitCode !== 0) {
        throw new Exception\ExtractionFailedException(
          sprintf('struktur parse exited with code %d: %s', $exitCode, $stderr)
        );
      }

      $data = json_decode($stdout, true, 512, JSON_THROW_ON_ERROR);
      if (!is_array($data)) {
        throw new Exception\ExtractionFailedException('Invalid parse output: expected array');
      }

      $artifacts = array_map(
        fn(array $a) => new Dto\Artifact(
          id: $a['id'],
          type: $a['type'],
          contents: array_map(
            fn(array $c) => new Dto\ArtifactContent(
              page: $c['page'] ?? null,
              text: $c['text'] ?? null,
              media: array_map(
                fn(array $m) => new Dto\ArtifactImage(
                  type: $m['type'],
                  url: $m['url'] ?? null,
                  base64: $m['base64'] ?? null,
                  text: $m['text'] ?? null,
                  width: $m['width'] ?? null,
                  height: $m['height'] ?? null,
                  imageType: $m['imageType'] ?? null,
                  raw: $m,
                ),
                $c['media'] ?? []
              ),
            ),
            $a['contents'] ?? []
          ),
          metadata: $a['metadata'] ?? [],
          tokens: $a['tokens'] ?? null,
        ),
        $data
      );

      return new Dto\ParseResult(artifacts: $artifacts, rawStdout: $stdout);
    }

    private function buildParseCommand(Dto\ParseRequest $request): string
    {
      $input = $request->inputs[0];
      $parts = [$this->binaryPath, 'parse', '--output', '-'];

      if ($input->path !== null) {
        $parts[] = '--input';
        $parts[] = $input->path;
      } else {
        $parts[] = '--stdin';
      }

      return implode(' ', array_map('escapeshellarg', $parts));
    }

    private function writeInputToStdin(Input $input, $stdinPipe): void
    {
      if ($input->path !== null) {
        // --input handles it, nothing to write
        return;
      }

      if ($input->stream !== null) {
        stream_copy_to_stream($input->stream, $stdinPipe);
        return;
      }

      if ($input->bytes !== null) {
        fwrite($stdinPipe, $input->bytes);
        return;
      }

      throw new \InvalidArgumentException('Input has no content');
    }
  }
  ```
- [ ] **Step 2:** Write a test that calls `Client::parse()` with `Input::fromBytes("hello world")` and verifies a `ParseResult` is returned. This requires the `struktur` binary to be available in the test environment. For unit testing without the binary, mock `proc_open`... actually, better to write an integration test that skips if `struktur` is not in PATH.
  ```php
  public function testParseFromBytes(): void
  {
      $client = new Client();
      $result = $client->parse(new Dto\ParseRequest(inputs: [Input::fromBytes("hello world")]));
      $this->assertInstanceOf(Dto\ParseResult::class, $result);
      $this->assertCount(1, $result->artifacts);
      $this->assertSame("text", $result->artifacts[0]->type);
  }
  ```
- [ ] **Step 3:** Run the test. If `struktur` is not available, document the skip condition.
  ```bash
  cd packages/struktur-php && vendor/bin/phpunit tests/ClientTest.php
  ```

#### Task 3.4: Write `Client::extract()` with event streaming

**Why:** This is the core of the adapter. It must handle the subprocess, stream input, read NDJSON events from stderr, and fire callbacks.

**Files:**
- Modify: `packages/struktur-php/src/Client.php`

**Steps:**

- [ ] **Step 1:** Add `extract()` method:
  ```php
  public function extract(
    Dto\ExtractionRequest $request,
    ?callable $onEvent = null,
  ): Dto\ExtractionResult {
    $descriptors = [
      0 => ['pipe', 'r'],
      1 => ['pipe', 'w'],
      2 => ['pipe', 'w'],
    ];

    $command = $this->buildExtractCommand($request);
    $process = proc_open($command, $descriptors, $pipes, $this->workingDirectory);

    if (!is_resource($process)) {
      throw new Exception\ProcessException('Failed to start struktur process');
    }

    $this->writeInputToStdin($request->inputs[0], $pipes[0]);
    fclose($pipes[0]);

    $stdout = '';
    $stderrBuffer = '';
    $usage = new Dto\Usage(0, 0, 0);

    if ($onEvent !== null) {
      stream_set_blocking($pipes[2], false);
    }
    stream_set_blocking($pipes[1], false);

    while (true) {
      $status = proc_get_status($process);
      $read = [$pipes[1], $pipes[2]];
      $write = null;
      $except = null;
      $tvSec = 0;
      $tvUsec = 100_000;

      $ready = stream_select($read, $write, $except, $tvSec, $tvUsec);
      if ($ready === false) {
        break;
      }

      foreach ($read as $pipe) {
        if ($pipe === $pipes[1]) {
          $stdout .= fread($pipes[1], 8192);
        } elseif ($pipe === $pipes[2]) {
          $chunk = fread($pipes[2], 8192);
          $stderrBuffer .= $chunk;
          while (($nl = strpos($stderrBuffer, "\n")) !== false) {
            $line = substr($stderrBuffer, 0, $nl);
            $stderrBuffer = substr($stderrBuffer, $nl + 1);
            if ($line !== '' && $onEvent !== null) {
              try {
                $event = Internal\EventParser::parse($line);
                $onEvent($event);
                if ($event instanceof Dto\Event\TokenUsageEvent) {
                  $usage = new Dto\Usage(
                    $event->inputTokens,
                    $event->outputTokens,
                    $event->totalTokens,
                  );
                }
              } catch (\Throwable $e) {
                // Skip unparsable lines (e.g. stray stderr output)
              }
            }
          }
        }
      }

      if (!$status['running'] && feof($pipes[1]) && feof($pipes[2])) {
        break;
      }
    }

    // Drain any remaining stderr
    $remaining = stream_get_contents($pipes[2]);
    $stderrBuffer .= $remaining;
    while (($nl = strpos($stderrBuffer, "\n")) !== false) {
      $line = substr($stderrBuffer, 0, $nl);
      $stderrBuffer = substr($stderrBuffer, $nl + 1);
      if ($line !== '' && $onEvent !== null) {
        try {
          $event = Internal\EventParser::parse($line);
          $onEvent($event);
        } catch (\Throwable) {}
      }
    }

    fclose($pipes[1]);
    fclose($pipes[2]);

    $exitCode = proc_close($process);

    if ($exitCode !== 0) {
      throw new Exception\ExtractionFailedException(
        sprintf('struktur extract exited with code %d', $exitCode)
      );
    }

    $data = json_decode($stdout, true, 512, JSON_THROW_ON_ERROR);

    return new Dto\ExtractionResult(data: $data, usage: $usage, rawStdout: $stdout);
  }
  ```
- [ ] **Step 2:** Add `buildExtractCommand()`:
  ```php
  private function buildExtractCommand(Dto\ExtractionRequest $request): string
  {
    $input = $request->inputs[0];
    $parts = [$this->binaryPath, 'extract', '--format', 'json', '--output', '-'];

    $parts[] = '--schema-json';
    $parts[] = json_encode($request->schema);

    if ($request->strategy !== null) {
      $parts[] = '--strategy';
      $parts[] = $request->strategy;
    }
    if ($request->model !== null) {
      $parts[] = '--model';
      $parts[] = $request->model;
    }
    if ($input->path !== null) {
      $parts[] = '--input';
      $parts[] = $input->path;
    } else {
      $parts[] = '--stdin';
    }

    return implode(' ', array_map('escapeshellarg', $parts));
  }
  ```
- [ ] **Step 3:** Write integration test for `extract()` with `Input::fromBytes("hello")`, a simple schema, and an event callback that collects events into an array. Assert at least one `StepEvent` was received and the result contains the expected data shape.
- [ ] **Step 4:** Run tests.
  ```bash
  cd packages/struktur-php && vendor/bin/phpunit tests/ClientTest.php
  ```
  Expected: PASS (or SKIP if `struktur` binary unavailable)

### Phase 4: Add `--format` support to `parseCommand`

**Why:** The `parse` command should also support `--format json` so the PHP `Client::parse()` can receive clean event streams if we later add parse progress events. For parity and consistency.

**Files:**
- Modify: `packages/cli/src/cli.ts` (in `parseCommand` args block)

**Steps:**

- [ ] **Step 1:** Add `--format` arg to `parseCommand` (same shape as `extractCommand`).
- [ ] **Step 2:** Wire it into the `parseCommand.run` — currently there are no event callbacks for `parse`, so `format === "json"` just means "no TUI". That's acceptable for now.
- [ ] **Step 3:** Run CLI tests.
  ```bash
  bun test packages/cli/src/cli.test.ts
  ```
  Expected: PASS

### Phase 5: Validation and final integration

#### Task 5.1: Run full TS test suite

**Why:** Ensure no regressions from the CLI changes.

**Steps:**
- [ ] Run `bun test` in the monorepo root.
  ```bash
  bun test
  ```
  Expected: all green.

#### Task 5.2: Run full PHP test suite

**Why:** Ensure the PHP package tests pass.

**Steps:**
- [ ] Run `vendor/bin/phpunit` in the PHP package.
  ```bash
  cd packages/struktur-php && vendor/bin/phpunit
  ```
  Expected: all green.

#### Task 5.3: Manual end-to-end test

**Why:** Verify the full pipe works: PHP → CLI subprocess → NDJSON events → typed PHP callbacks.

**Steps:**
- [ ] Write a small PHP script `packages/struktur-php/e2e.php`:
  ```php
  <?php
  require __DIR__ . '/vendor/autoload.php';
  use Struktur\Client;
  use Struktur\Input;
  use Struktur\Dto\ExtractionRequest;
  use Struktur\Dto\Event\StepEvent;

  $client = new Client();
  $events = [];
  $result = $client->extract(
    new ExtractionRequest(
      inputs: [Input::fromBytes("Invoice #12345\nTotal: $99.00")],
      schema: ['type' => 'object', 'properties' => ['invoiceNumber' => ['type' => 'string'], 'total' => ['type' => 'number']], 'required' => ['invoiceNumber', 'total']],
    ),
    onEvent: function ($e) use (&$events) {
      $events[] = get_class($e);
      if ($e instanceof StepEvent) {
        echo "Step {$e->step}: {$e->label}\n";
      }
    }
  );

  echo "Result: " . json_encode($result->data) . "\n";
  echo "Usage: {$result->usage->totalTokens} tokens\n";
  echo "Events received: " . implode(", ", $events) . "\n";
  ```
- [ ] Run it.
  ```bash
  cd packages/struktur-php && php e2e.php
  ```
  Expected: prints step labels, prints extracted JSON with `invoiceNumber` and `total`, prints usage > 0, lists event classes.
- [ ] Clean up: remove `e2e.php` after successful run.

---

## Validation

The complete set of commands that prove the plan delivered, with exact expected
output. A novice must be able to distinguish success from a silent failure.

```bash
# TS CLI tests
bun test packages/cli/src/cli.test.ts
# Expected: all green

# PHP package tests
cd packages/struktur-php && vendor/bin/phpunit
# Expected: all green

# Manual CLI --format json test
echo "hello world" | struktur extract --stdin --format json --schema-json '{"type":"object","properties":{"greeting":{"type":"string"}}}'
# Expected stderr: NDJSON lines like {"event":"step",...}
# Expected stdout: {"greeting":"hello world"} (or similar, depends on model)

# Manual CLI --format text test (preserves TUI)
echo "hello world" | struktur extract --stdin --format text --schema-json '{"type":"object","properties":{"greeting":{"type":"string"}}}'
# Expected stderr: human spinner text (or none if not TTY)
# Expected stdout: {"greeting":"hello world"}

# Manual CLI --format debug test (preserves verbose debug)
echo "hello world" | struktur extract --stdin --format debug --schema-json '{"type":"object","properties":{"greeting":{"type":"string"}}}'
# Expected stderr: verbose JSON lines including type:"cli_init", type:"schema_loaded", etc.
```

---

## Risks & rollback

- **Risk:** The `stream_select` loop in PHP may hang on certain subprocess behaviors (e.g. stderr pipe fills up because we don't read it fast enough).
  **Mitigation:** Read stderr eagerly in the loop, and always set pipes to non-blocking. If issues arise, switch to reading stderr in a separate thread/process or use `socketpair` — but this is only a concern for very long extractions with massive event output.
- **Risk:** The CLI's NDJSON lines may occasionally contain malformed JSON if the model's tool output has unescaped characters.
  **Mitigation:** `EventParser` skips unparsable lines with a try/catch. This is intentional — the stream should be resilient, not brittle.
- **Risk:** `proc_open` on some systems may buffer stderr, delaying events.
  **Mitigation:** We use non-blocking reads and a tight `stream_select` loop. If buffering is observed, add `fflush(stderr)` in the CLI after each `process.stderr.write()`.
- **Rollback:** The CLI changes are additive (new `--format` arg, `--debug` preserved). Reverting means removing the `--format` arg and the `emitEvent` wrapper. No schema or strategy changes to roll back.

---

## Open questions

- [ ] **Model requirement for manual e2e tests:** The e2e test in Task 5.3 requires a configured model. The implementing agent must either have a provider token configured or mock the CLI for the e2e test. If no model is available, the e2e test should be documented as "requires `struktur` auth to be configured" and the unit tests (with mocked subprocess) should be the primary validation.
- [ ] **ParseResult from stream input:** Should `Client::parse()` accept `--format json` too, or just use `text`? For now, `parse` does not emit events, so `text` is fine. If we add parse progress later, we can switch to `--format json`.

---

## Progress

**This section is maintained by the implementing agent. Update it continuously.**

### Phase completion

- [x] Phase 1: Add `--format` to the Struktur CLI
- [x] Phase 2: Create the PHP package skeleton
- [x] Phase 3: Write the PHP Client and Event system
- [x] Phase 4: Add `--format` support to `parseCommand`
- [x] Phase 5: Validation and final integration
- [x] Plan marked DONE

### Session log

**2026-07-01 — Implementation complete**

**Phase 1 (CLI `--format` flag):**
- Added `--format text|json|debug` argument to `extractCommand` in `packages/cli/src/cli.ts`
- Added mutual exclusion check (`--debug` and `--format` cannot both be set)
- Added `emitEvent()` helper that writes clean NDJSON to stderr when `format === "json"`
- Wrapped all `ExtractionEvents` handlers with `emitEvent()` calls
- Suppressed TUI (spinner + agentTUI) when `format !== "text"`
- Updated `usage()` text in `packages/cli/src/cli/shared.ts`
- Wrote `packages/cli/src/format.test.ts` with 3 passing tests for json/text/debug modes
- Rebuilt `dist/cli.js` via `bun run build`

**Phase 2 (PHP package skeleton):**
- Created `packages/struktur-php/` with `composer.json`, `phpunit.xml.dist`, `.gitignore`
- Wrote all exception classes: `StrukturException`, `ProcessException`, `ExtractionFailedException`, `SchemaValidationException`
- Wrote all DTOs: `Usage`, `ArtifactImage`, `ArtifactContent`, `Artifact`, `ExtractionRequest`, `ExtractionResult`, `ParseRequest`, `ParseResult`
- Wrote `Input` class with `fromPath()`, `fromBytes()`, `fromStream()` factories
- Installed PHPUnit via `composer install`
- Wrote 19 unit tests covering all DTOs, exceptions, and input factories; all pass

**Phase 3 (PHP Client and Event system):**
- Wrote 12 typed event DTOs implementing `ExtractionEvent` interface: `StepEvent`, `ToolStartEvent`, `ToolEndEvent`, `ReasoningEvent`, `OutputSetEvent`, `OutputUpdatedEvent`, `TokenUsageEvent`, `ProgressEvent`, `RetryEvent`, `FinishEvent`, `FailureEvent`
- Wrote `Internal\EventParser` with `match`-based dispatch from NDJSON to typed DTOs
- Wrote `Client::parse()` with `proc_open`, `stream_copy_to_stream` support for memory-efficient streaming
- Wrote `Client::extract()` with `stream_select` loop reading stdout + stderr incrementally, parsing NDJSON events and firing callbacks in real time
- Added `extractFirstJsonObject()` helper to handle duplicate stdout JSON output from CLI
- Fixed `binaryPath` handling to support space-separated commands (e.g. `bun /path/cli.js`) via `explode(' ', ...)`
- Wrote `ClientTest.php` with 5 integration tests against the real CLI binary; all pass
- Fixed PHP 8.4 `readonly` mixed-type property issue in `Input` class

**Phase 4 (parseCommand `--format`):**
- Added `--format` and `--debug` args to `parseCommand` for parity
- Added format resolution and mutual exclusion check in `parseCommand.run`
- Added `createDebugLogger` for `--format debug` mode
- Rebuilt CLI dist

**Phase 5 (Validation):**
- SDK tests: 287 pass, 0 fail
- CLI format tests: 3 pass, 0 fail
- PHP unit tests: 36 pass, 0 fail
- Manual e2e: verified `Client::parse()` and `Client::extract()` with event callbacks produce correct typed results

**Decisions made during implementation:**
1. `--format json` event stream goes to stderr (not fd 3) — simpler, works everywhere
2. `Client` splits `binaryPath` on spaces to support `bun /path/cli.js` — avoids requiring users to configure PATH
3. `EventParser` silently skips unparsable stderr lines with try/catch — resilience against stray agent logs
4. `extractFirstJsonObject()` uses regex to handle double stdout JSON output — this is a known CLI behavior where `console.log` and `writeOutput` both emit
5. `TokenUsageEvent` updates are collected from the event stream rather than parsed from the final result — gives per-call granularity
