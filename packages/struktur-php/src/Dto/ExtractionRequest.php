<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

use Mateffy\Struktur\Input;

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
        public bool $screenshots = false,
        public bool $images = false,
        public ?int $maxSteps = null,
        public ?int $maxIterations = null,
    ) {
        if (count($inputs) !== 1) {
            throw new \InvalidArgumentException('Exactly 1 input is required (multi-input not yet supported)');
        }
    }
}
