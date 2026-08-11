<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

final readonly class Usage
{
    public function __construct(
        public int $inputTokens,
        public int $outputTokens,
        public int $totalTokens,
    ) {
    }
}
