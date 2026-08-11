<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class TokenUsageEvent implements ExtractionEvent
{
    public function __construct(
        public int $inputTokens,
        public int $outputTokens,
        public int $totalTokens,
        public ?string $model,
        public int $timestamp,
    ) {
    }
}
