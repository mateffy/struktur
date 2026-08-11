<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

final readonly class ExtractionResult
{
    /**
     * @param array<string, mixed> $data
     */
    public function __construct(
        public array $data,
        public Usage $usage,
        public ?string $rawStdout = null,
    ) {
    }
}
