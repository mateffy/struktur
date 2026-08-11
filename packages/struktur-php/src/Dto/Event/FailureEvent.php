<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class FailureEvent implements ExtractionEvent
{
    public function __construct(
        public string $reason,
        public int $timestamp,
    ) {
    }
}
