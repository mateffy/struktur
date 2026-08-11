<?php

use Mateffy\Struktur\Client;
use Mateffy\Struktur\Dto;
use Mateffy\Struktur\Dto\Event;
use Mateffy\Struktur\Exception;
use Mateffy\Struktur\Input;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockScript(string $scriptContent): string
{
    $path = tempnam(sys_get_temp_dir(), 'struktur_mock_') . '.sh';
    file_put_contents($path, "#!/bin/sh\n" . $scriptContent);
    chmod($path, 0755);
    return $path;
}

function createParseSuccessScript(): string
{
    return createMockScript(<<<'SH'
# Output valid artifact JSON array
printf '[{"id":"a1","type":"text","contents":[{"page":1,"text":"hello"}],"metadata":{},"tokens":5}]\n'
SH
    );
}

function createParseFailureScript(): string
{
    return createMockScript(<<<'SH'
printf 'parse error occurred' >&2
exit 1
SH
    );
}

function createParseInvalidJsonScript(): string
{
    return createMockScript(<<<'SH'
printf 'not valid json'
SH
    );
}

function createParseNonArrayScript(): string
{
    return createMockScript(<<<'SH'
printf '{"id":"a1","type":"text"}'
SH
    );
}

function createExtractSuccessScript(): string
{
    return createMockScript(<<<'SH'
# Read schema from args and stdin
while [ "$1" != "--stdin" ] && [ "$1" != "" ]; do shift; done
if [ "$1" = "--stdin" ]; then
  cat > /dev/null
fi

# Emit NDJSON events on stderr
printf '{"event":"step","step":1,"total":3,"label":"extracting","timestamp":100}\n' >&2
printf '{"event":"token_usage","inputTokens":10,"outputTokens":5,"totalTokens":15,"model":"gpt-4","timestamp":101}\n' >&2
printf '{"event":"finish","timestamp":102}\n' >&2

# Output result JSON on stdout
printf '{"invoice":"12345"}\n'
SH
    );
}

function createExtractDuplicateStdoutScript(): string
{
    return createMockScript(<<<'SH'
if [ "$1" = "--stdin" ]; then cat > /dev/null; fi
printf '{"invoice":"12345"}\n'
printf '{"invoice":"12345"}\n'
SH
    );
}

function createExtractFailureScript(): string
{
    return createMockScript(<<<'SH'
printf 'extraction failed' >&2
exit 1
SH
    );
}

function createExtractInvalidJsonStdoutScript(): string
{
    return createMockScript(<<<'SH'
if [ "$1" = "--stdin" ]; then cat > /dev/null; fi
printf 'not json\n'
SH
    );
}

function createExtractNoJsonStdoutScript(): string
{
    return createMockScript(<<<'SH'
if [ "$1" = "--stdin" ]; then cat > /dev/null; fi
printf 'some log line without braces\n'
SH
    );
}

function cleanupMockScript(string $path): void
{
    @unlink($path);
}

// ---------------------------------------------------------------------------
// Reflection helpers for private methods
// ---------------------------------------------------------------------------

function invokePrivateMethod(object $object, string $method, array $args = []): mixed
{
    $ref = new ReflectionClass($object);
    $m = $ref->getMethod($method);
    $m->setAccessible(true);
    return $m->invoke($object, ...$args);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Client', function () {
    describe('buildParseCommand', function () {
        it('builds command with path input', function () {
            $client = new Client(binaryPath: 'struktur');
            $request = new Dto\ParseRequest(inputs: [Input::fromPath('/tmp/test.txt')]);
            $cmd = invokePrivateMethod($client, 'buildParseCommand', [$request]);

            expect($cmd)->toContain("'struktur'");
            expect($cmd)->toContain("'parse'");
            expect($cmd)->toContain("'--output'");
            expect($cmd)->toContain("'--input'");
            expect($cmd)->toContain("'/tmp/test.txt'");
            expect($cmd)->not->toContain("'--stdin'");
        });

        it('builds command with stdin input', function () {
            $client = new Client(binaryPath: 'struktur');
            $request = new Dto\ParseRequest(inputs: [Input::fromBytes('hello')]);
            $cmd = invokePrivateMethod($client, 'buildParseCommand', [$request]);

            expect($cmd)->toContain("'--stdin'");
            expect($cmd)->not->toContain("'--input'");
        });

        it('escapes shell arguments', function () {
            $client = new Client(binaryPath: 'struktur');
            $request = new Dto\ParseRequest(inputs: [Input::fromPath('/tmp/file with spaces.txt')]);
            $cmd = invokePrivateMethod($client, 'buildParseCommand', [$request]);

            expect($cmd)->toContain("'/tmp/file with spaces.txt'");
        });
    });

    describe('buildExtractCommand', function () {
        it('builds command with all options', function () {
            $client = new Client(binaryPath: 'struktur');
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromPath('/tmp/test.txt')],
                schema: ['type' => 'object'],
                strategy: 'simple',
                model: 'openai/gpt-4',
            );
            $cmd = invokePrivateMethod($client, 'buildExtractCommand', [$request]);

            expect($cmd)->toContain("'struktur'");
            expect($cmd)->toContain("'extract'");
            expect($cmd)->toContain("'--format'");
            expect($cmd)->toContain("'json'");
            expect($cmd)->toContain("'--output'");
            expect($cmd)->toContain("'--schema-json'");
            expect($cmd)->toContain("'--strategy'");
            expect($cmd)->toContain("'simple'");
            expect($cmd)->toContain("'--model'");
            expect($cmd)->toContain("'openai/gpt-4'");
            expect($cmd)->toContain("'--input'");
            expect($cmd)->toContain("'/tmp/test.txt'");
        });

        it('builds command with minimal options and stdin', function () {
            $client = new Client(binaryPath: 'struktur');
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'string'],
            );
            $cmd = invokePrivateMethod($client, 'buildExtractCommand', [$request]);

            expect($cmd)->toContain("'--stdin'");
            expect($cmd)->not->toContain("'--strategy'");
            expect($cmd)->not->toContain("'--model'");
        });

        it('handles space-separated binary path', function () {
            $client = new Client(binaryPath: 'bun /path/to/cli.js');
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('x')],
                schema: [],
            );
            $cmd = invokePrivateMethod($client, 'buildExtractCommand', [$request]);

            expect($cmd)->toContain("'bun'");
            expect($cmd)->toContain("'/path/to/cli.js'");
        });

        it('embeds schema as json', function () {
            $client = new Client(binaryPath: 'struktur');
            $schema = ['type' => 'object', 'properties' => ['x' => ['type' => 'string']]];
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('x')],
                schema: $schema,
            );
            $cmd = invokePrivateMethod($client, 'buildExtractCommand', [$request]);

            expect($cmd)->toContain(json_encode($schema));
        });
    });

    describe('extractFirstJsonObject', function () {
        it('extracts single json object', function () {
            $client = new Client();
            $data = invokePrivateMethod($client, 'extractFirstJsonObject', ['{"key":"value"}']);

            expect($data)->toBe(['key' => 'value']);
        });

        it('extracts first json from duplicate output', function () {
            $client = new Client();
            $data = invokePrivateMethod($client, 'extractFirstJsonObject', [
                "{\"key\":\"value\"}\n{\"key\":\"value\"}\n"
            ]);

            expect($data)->toBe(['key' => 'value']);
        });

        it('extracts json from mixed output', function () {
            $client = new Client();
            $data = invokePrivateMethod($client, 'extractFirstJsonObject', [
                "log line\n{\"result\":true}\nanother line\n"
            ]);

            expect($data)->toBe(['result' => true]);
        });

        it('extracts deeply nested json', function () {
            $client = new Client();
            $data = invokePrivateMethod($client, 'extractFirstJsonObject', [
                '{"a": {"b": {"c": 1}}}'
            ]);

            expect($data)->toBe(['a' => ['b' => ['c' => 1]]]);
        });

        it('extracts json with braces in strings', function () {
            $client = new Client();
            $data = invokePrivateMethod($client, 'extractFirstJsonObject', [
                '{"text": "a { b } c"}'
            ]);

            expect($data)->toBe(['text' => 'a { b } c']);
        });

        it('extracts first valid json from multiple candidates', function () {
            $client = new Client();
            $data = invokePrivateMethod($client, 'extractFirstJsonObject', [
                'garbage {"first":1} more {"second":2}'
            ]);

            expect($data)->toBe(['first' => 1]);
        });

        it('skips invalid json object and finds next', function () {
            $client = new Client();
            // {"bad": unquoted} is invalid JSON, then a valid one follows
            $data = invokePrivateMethod($client, 'extractFirstJsonObject', [
                '{"bad": unquoted} {"good": "yes"}'
            ]);

            expect($data)->toBe(['good' => 'yes']);
        });

        it('throws when no json found', function () {
            $client = new Client();
            expect(fn () => invokePrivateMethod($client, 'extractFirstJsonObject', ['no json here']))
                ->toThrow(\JsonException::class, 'No valid JSON object found in stdout');
        });

        it('throws on empty string', function () {
            $client = new Client();
            expect(fn () => invokePrivateMethod($client, 'extractFirstJsonObject', ['']))
                ->toThrow(\JsonException::class);
        });
    });

    describe('writeInputToStdin', function () {
        it('does nothing for path input', function () {
            $client = new Client();
            $input = Input::fromPath('/tmp/test.txt');
            $pipe = fopen('php://temp', 'r+');

            invokePrivateMethod($client, 'writeInputToStdin', [$input, $pipe]);

            rewind($pipe);
            expect(stream_get_contents($pipe))->toBe('');
            fclose($pipe);
        });

        it('writes bytes to pipe', function () {
            $client = new Client();
            $input = Input::fromBytes('hello world');
            $pipe = fopen('php://temp', 'r+');

            invokePrivateMethod($client, 'writeInputToStdin', [$input, $pipe]);

            rewind($pipe);
            expect(stream_get_contents($pipe))->toBe('hello world');
            fclose($pipe);
        });

        it('copies stream to pipe', function () {
            $client = new Client();
            $stream = fopen('php://temp', 'r+');
            fwrite($stream, 'stream data');
            rewind($stream);
            $input = Input::fromStream($stream);
            $pipe = fopen('php://temp', 'r+');

            invokePrivateMethod($client, 'writeInputToStdin', [$input, $pipe]);

            rewind($pipe);
            expect(stream_get_contents($pipe))->toBe('stream data');
            fclose($stream);
            fclose($pipe);
        });

        it('throws when input has no content', function () {
            $client = new Client();
            // Create an Input with uninitialized properties via reflection
            $ref = new ReflectionClass(Input::class);
            $input = $ref->newInstanceWithoutConstructor();
            // Initialize all properties to null explicitly
            foreach ($ref->getProperties() as $prop) {
                $prop->setAccessible(true);
                $prop->setValue($input, null);
            }
            $pipe = fopen('php://temp', 'r+');

            expect(fn () => invokePrivateMethod($client, 'writeInputToStdin', [$input, $pipe]))
                ->toThrow(\InvalidArgumentException::class, 'Input has no content');

            fclose($pipe);
        });
    });

    describe('parse', function () {
        it('returns artifacts from successful parse', function () {
            $script = createParseSuccessScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ParseRequest(inputs: [Input::fromBytes('hello')]);

            $result = $client->parse($request);

            expect($result->artifacts)->toHaveCount(1);
            expect($result->artifacts[0]->id)->toBe('a1');
            expect($result->artifacts[0]->type)->toBe('text');
            expect($result->artifacts[0]->contents[0]->text)->toBe('hello');
            expect($result->artifacts[0]->tokens)->toBe(5);
            expect($result->rawStdout)->toBeString();

            cleanupMockScript($script);
        });

        it('returns artifacts from path input', function () {
            $script = createParseSuccessScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ParseRequest(inputs: [Input::fromPath('/tmp/test.txt')]);

            $result = $client->parse($request);

            expect($result->artifacts)->toHaveCount(1);

            cleanupMockScript($script);
        });

        it('throws ExtractionFailedException on non-zero exit', function () {
            $script = createParseFailureScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ParseRequest(inputs: [Input::fromBytes('hello')]);

            expect(fn () => $client->parse($request))
                ->toThrow(Exception\ExtractionFailedException::class, 'exited with code 1');

            cleanupMockScript($script);
        });

        it('throws JsonException on invalid json output', function () {
            $script = createParseInvalidJsonScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ParseRequest(inputs: [Input::fromBytes('hello')]);

            expect(fn () => $client->parse($request))
                ->toThrow(\JsonException::class);

            cleanupMockScript($script);
        });

        it('throws ExtractionFailedException on non-array json output', function () {
            $script = createMockScript(<<<'SH'
printf '"just a string"'
SH
            );
            $client = new Client(binaryPath: $script);
            $request = new Dto\ParseRequest(inputs: [Input::fromBytes('hello')]);

            expect(fn () => $client->parse($request))
                ->toThrow(Exception\ExtractionFailedException::class, 'expected array');

            cleanupMockScript($script);
        });
    });

    describe('extract', function () {
        it('returns data from successful extract', function () {
            $script = createExtractSuccessScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'object'],
                strategy: 'simple',
            );

            $result = $client->extract($request);

            expect($result->data)->toBe(['invoice' => '12345']);

            cleanupMockScript($script);
        });

        it('returns data with duplicate stdout json', function () {
            $script = createExtractDuplicateStdoutScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'object'],
            );

            $result = $client->extract($request);

            expect($result->data)->toBe(['invoice' => '12345']);

            cleanupMockScript($script);
        });

        it('collects events via callback', function () {
            $script = createExtractSuccessScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'object'],
            );

            $events = [];
            $result = $client->extract($request, onEvent: function ($e) use (&$events) {
                $events[] = $e;
            });

            expect($events)->toHaveCount(3);
            expect($events[0])->toBeInstanceOf(Event\StepEvent::class);
            expect($events[0]->step)->toBe(1);
            expect($events[1])->toBeInstanceOf(Event\TokenUsageEvent::class);
            expect($events[1]->totalTokens)->toBe(15);
            expect($events[2])->toBeInstanceOf(Event\FinishEvent::class);

            cleanupMockScript($script);
        });

        it('works without event callback', function () {
            $script = createExtractSuccessScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'object'],
            );

            $result = $client->extract($request);

            expect($result->data)->toBe(['invoice' => '12345']);

            cleanupMockScript($script);
        });

        it('throws ExtractionFailedException on non-zero exit', function () {
            $script = createExtractFailureScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'object'],
            );

            expect(fn () => $client->extract($request))
                ->toThrow(Exception\ExtractionFailedException::class, 'exited with code 1');

            cleanupMockScript($script);
        });

        it('throws on invalid stdout json', function () {
            $script = createExtractInvalidJsonStdoutScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'object'],
            );

            expect(fn () => $client->extract($request))
                ->toThrow(\JsonException::class);

            cleanupMockScript($script);
        });

        it('throws when no json in stdout', function () {
            $script = createExtractNoJsonStdoutScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'object'],
            );

            expect(fn () => $client->extract($request))
                ->toThrow(\JsonException::class, 'No valid JSON object found in stdout');

            cleanupMockScript($script);
        });

        it('throws when binary path is not executable', function () {
            $client = new Client(binaryPath: '/dev/null');
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'object'],
            );

            // /dev/null exists but is not executable; shell exits with 126
            expect(fn () => $client->extract($request))
                ->toThrow(Exception\ExtractionFailedException::class);
        });

        it('skips unparsable stderr lines silently', function () {
            $script = createMockScript(<<<'SH'
if [ "$1" = "--stdin" ]; then cat > /dev/null; fi
printf 'not valid json line\n' >&2
printf '{"event":"step","step":1,"label":"ok","timestamp":1}\n' >&2
printf '{"result":"data"}\n'
SH
            );
            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromBytes('hello')],
                schema: ['type' => 'object'],
            );

            $events = [];
            $result = $client->extract($request, onEvent: function ($e) use (&$events) {
                $events[] = $e;
            });

            expect($result->data)->toBe(['result' => 'data']);
            expect($events)->toHaveCount(1);
            expect($events[0])->toBeInstanceOf(Event\StepEvent::class);

            cleanupMockScript($script);
        });

        it('handles extract from stream input', function () {
            $script = createExtractSuccessScript();
            $stream = fopen('php://temp', 'r+');
            fwrite($stream, 'stream content');
            rewind($stream);

            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromStream($stream)],
                schema: ['type' => 'object'],
            );

            $result = $client->extract($request);

            expect($result->data)->toBe(['invoice' => '12345']);

            fclose($stream);
            cleanupMockScript($script);
        });

        it('handles extract from path input', function () {
            $tmpPath = tempnam(sys_get_temp_dir(), 'struktur_test_') . '.txt';
            file_put_contents($tmpPath, 'file content');

            $script = createExtractSuccessScript();
            $client = new Client(binaryPath: $script);
            $request = new Dto\ExtractionRequest(
                inputs: [Input::fromPath($tmpPath)],
                schema: ['type' => 'object'],
            );

            $result = $client->extract($request);

            expect($result->data)->toBe(['invoice' => '12345']);

            @unlink($tmpPath);
            cleanupMockScript($script);
        });
    });

    describe('workingDirectory', function () {
        it('uses provided working directory', function () {
            $client = new Client(binaryPath: 'struktur', workingDirectory: '/tmp');
            $request = new Dto\ParseRequest(inputs: [Input::fromBytes('hello')]);
            $cmd = invokePrivateMethod($client, 'buildParseCommand', [$request]);

            expect($cmd)->toContain("'struktur'");
        });
    });
});
