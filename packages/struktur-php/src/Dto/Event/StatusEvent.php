<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class StatusEvent implements ExtractionEvent
{
    /**
     * @param array{key: string, params?: array<string, string|int>}|null $message
     */
    public function __construct(
        public string $phase,
        public ?array $message,
        public ?float $percent,
        public int $timestamp,
    ) {}
}
