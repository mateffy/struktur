<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

final readonly class ParseResult
{
    /**
     * @param list<Artifact> $artifacts
     */
    public function __construct(
        public array $artifacts,
        public ?string $rawStdout = null,
    ) {
    }
}
