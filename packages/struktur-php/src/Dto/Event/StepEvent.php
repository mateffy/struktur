<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class StepEvent implements ExtractionEvent
{
    public function __construct(
        public int $step,
        public ?int $total,
        public string $label,
        public int $timestamp,
    ) {
    }
}
