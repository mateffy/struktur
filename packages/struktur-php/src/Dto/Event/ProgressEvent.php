<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class ProgressEvent implements ExtractionEvent
{
    public function __construct(
        public int $current,
        public int $total,
        public ?float $percent,
        public int $timestamp,
    ) {
    }
}
