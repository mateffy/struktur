<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

final readonly class Artifact
{
    /**
     * @param list<ArtifactContent> $contents
     * @param array<string, mixed> $metadata
     */
    public function __construct(
        public string $id,
        public string $type,
        public array $contents = [],
        public array $metadata = [],
        public ?int $tokens = null,
    ) {
    }
}
