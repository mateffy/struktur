<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class FinishEvent implements ExtractionEvent
{
    public function __construct(
        public int $timestamp,
    ) {
    }
}
