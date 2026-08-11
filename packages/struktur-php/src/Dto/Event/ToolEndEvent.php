<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class ToolEndEvent implements ExtractionEvent
{
    /**
     * @param array<string, mixed>|null $result
     */
    public function __construct(
        public string $toolCallId,
        public ?array $result,
        public ?string $error,
        public int $timestamp,
    ) {
    }
}
