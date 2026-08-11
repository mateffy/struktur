<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto\Event;

final readonly class ToolStartEvent implements ExtractionEvent
{
    /**
     * @param array<string, mixed> $args
     */
    public function __construct(
        public string $toolName,
        public string $toolCallId,
        public array $args,
        public int $timestamp,
    ) {
    }
}
