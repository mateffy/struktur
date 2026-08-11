<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class ReasoningEvent implements ExtractionEvent
{
    public function __construct(
        public string $thought,
        public int $timestamp,
    ) {
    }
}
