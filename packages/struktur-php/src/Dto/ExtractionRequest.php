<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

use Mateffy\Struktur\Input;

final readonly class ExtractionRequest
{
    /**
     * @param list<Input> $inputs
     * @param array<string, mixed> $schema
     * @param array<string, string>|null $tokens Provider-to-token map (e.g. ['openai' => 'sk-xxx']).
     *        Tokens are passed as environment variable prefixes on the CLI command.
     */
    public function __construct(
        public array $inputs,
        public array $schema,
        public ?string $strategy = null,
        public ?string $model = null,
        public ?string $outputInstructions = null,
        public bool $screenshots = false,
        public bool $images = false,
        public ?int $maxSteps = null,
        public ?int $maxIterations = null,
        public ?array $tokens = null,
        public ?string $reasoningEffort = null,
        public ?string $imagesOutput = null,
        /**
         * Agent context prefill: max tokens of document text to front-load as
         * synthetic read calls, e.g. "300k". Agent strategy only.
         */
        public ?string $prefill = null,
        /** Maximum images to pre-load alongside the prefill. Overviews first. */
        public ?int $prefillImages = null,
        /**
         * Strict schema validation. When true every required field must be present;
         * when false only missing required fields are tolerated on the final attempt.
         * Invalid values (wrong type, out-of-enum, …) are always rejected either way.
         */
        public bool $strict = false,
    ) {
        if (count($inputs) !== 1) {
            throw new \InvalidArgumentException('Exactly 1 input is required (multi-input not yet supported)');
        }
    }
}
