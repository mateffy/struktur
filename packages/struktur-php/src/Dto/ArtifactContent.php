<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

final readonly class ArtifactContent
{
    /**
     * @param list<ArtifactImage> $media
     */
    public function __construct(
        public ?int $page = null,
        public ?string $text = null,
        public array $media = [],
    ) {
    }
}
