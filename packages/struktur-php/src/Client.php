<?php

declare(strict_types=1);

namespace Mateffy\Struktur;

use Mateffy\Struktur\Dto;
use Mateffy\Struktur\Exception;
use Mateffy\Struktur\Internal\EventParser;

class Client
{
    public function __construct(
        private string $binaryPath = 'struktur',
        private ?string $workingDirectory = null,
    ) {
    }

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
                sprintf('struktur parse exited with code %d: %s', $exitCode, $stderr),
                stderr: $stderr,
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

    /**
     * @param callable(Dto\Event\ExtractionEvent): void|null $onEvent
     */
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
        $stderrOutput = '';
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
                    $stderrOutput .= $chunk;
                    while (($nl = strpos($stderrBuffer, "\n")) !== false) {
                        $line = substr($stderrBuffer, 0, $nl);
                        $stderrBuffer = substr($stderrBuffer, $nl + 1);
                        if ($line !== '' && $onEvent !== null) {
                            try {
                                $event = EventParser::parse($line);
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
        stream_set_blocking($pipes[2], true);
        $remaining = stream_get_contents($pipes[2]);
        $stderrBuffer .= $remaining;
        $stderrOutput .= $remaining;
        while (($nl = strpos($stderrBuffer, "\n")) !== false) {
            $line = substr($stderrBuffer, 0, $nl);
            $stderrBuffer = substr($stderrBuffer, $nl + 1);
            if ($line !== '' && $onEvent !== null) {
                try {
                    $event = EventParser::parse($line);
                    $onEvent($event);
                    if ($event instanceof Dto\Event\TokenUsageEvent) {
                        $usage = new Dto\Usage(
                            $event->inputTokens,
                            $event->outputTokens,
                            $event->totalTokens,
                        );
                    }
                } catch (\Throwable) {
                }
            }
        }

        fclose($pipes[1]);
        fclose($pipes[2]);

        $exitCode = proc_close($process);

        if ($exitCode !== 0) {
            throw new Exception\ExtractionFailedException(
                sprintf('struktur extract exited with code %d: %s', $exitCode, $stderrOutput),
            );
        }

        // stdout may contain duplicate JSON output (console.log + writeOutput both write to stdout),
        // and agent strategies emit tool call results as JSON. Extract the LAST valid JSON object
        // (the final result), not the first.
        $data = $this->extractLastJsonObject($stdout);

        return new Dto\ExtractionResult(data: $data, usage: $usage, rawStdout: $stdout);
    }

    private function buildParseCommand(Dto\ParseRequest $request): string
    {
        $input = $request->inputs[0];
        $parts = array_merge(explode(' ', $this->binaryPath), ['parse', '--output', '-']);

        if ($input->path !== null) {
            $parts[] = '--input';
            $parts[] = $input->path;
        } else {
            $parts[] = '--stdin';
        }

        return implode(' ', array_map('escapeshellarg', $parts));
    }

    private function buildExtractCommand(Dto\ExtractionRequest $request): string
    {
        $input = $request->inputs[0];
        $parts = array_merge(explode(' ', $this->binaryPath), ['extract', '--format', 'json', '--output', '-']);

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
        if ($request->screenshots) {
            $parts[] = '--screenshots';
        }
        if ($request->images) {
            $parts[] = '--images';
        }
        if ($request->maxSteps !== null) {
            $parts[] = '--max-steps';
            $parts[] = (string) $request->maxSteps;
        }
        if ($request->maxIterations !== null) {
            $parts[] = '--max-iterations';
            $parts[] = (string) $request->maxIterations;
        }
        if ($input->path !== null) {
            $parts[] = '--input';
            $parts[] = $input->path;
        } else {
            $parts[] = '--stdin';
        }

        return implode(' ', array_map('escapeshellarg', $parts));
    }

    /**
     * Extract the LAST valid JSON object from stdout, skipping over agent tool call output
     * that appears earlier in the stream.
     */
    private function extractLastJsonObject(string $stdout): array
    {
        $len = strlen($stdout);
        $lastValid = null;

        for ($i = 0; $i < $len; $i++) {
            if ($stdout[$i] !== '{') {
                continue;
            }

            $depth = 0;
            $inString = false;
            $escaped = false;
            for ($j = $i; $j < $len; $j++) {
                $char = $stdout[$j];
                if ($inString) {
                    if ($escaped) {
                        $escaped = false;
                        continue;
                    }
                    if ($char === '\\') {
                        $escaped = true;
                        continue;
                    }
                    if ($char === '"') {
                        $inString = false;
                    }
                    continue;
                }
                if ($char === '"') {
                    $inString = true;
                    continue;
                }
                if ($char === '{') {
                    $depth++;
                } elseif ($char === '}') {
                    $depth--;
                    if ($depth === 0) {
                        $candidate = substr($stdout, $i, $j - $i + 1);
                        try {
                            $decoded = json_decode($candidate, true, 512, JSON_THROW_ON_ERROR);
                            if (is_array($decoded)) {
                                $lastValid = $decoded;
                            }
                        } catch (\JsonException) {
                            // Not valid JSON, continue searching
                        }
                        $i = $j;
                        break;
                    }
                }
            }
        }

        if ($lastValid === null) {
            throw new \JsonException('No valid JSON object found in stdout');
        }

        return $lastValid;
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
