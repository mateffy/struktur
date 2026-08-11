<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class OutputSetEvent implements ExtractionEvent
{
    /**
     * @param array<string, mixed> $data
     */
    public function __construct(
        public array $data,
        public int $timestamp,
    ) {
    }
}
