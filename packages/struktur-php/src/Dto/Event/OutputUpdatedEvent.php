<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class OutputUpdatedEvent implements ExtractionEvent
{
    /**
     * @param array<string, mixed> $changes
     */
    public function __construct(
        public array $changes,
        public int $timestamp,
    ) {
    }
}
