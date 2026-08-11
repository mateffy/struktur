<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class RetryEvent implements ExtractionEvent
{
    public function __construct(
        public int $attempt,
        public int $maxAttempts,
        public ?string $reason,
        public int $timestamp,
    ) {
    }
}
