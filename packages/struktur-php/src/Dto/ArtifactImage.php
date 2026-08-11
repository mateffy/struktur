<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

final readonly class ArtifactImage
{
    /**
     * @param array<string, mixed> $raw
     */
    public function __construct(
        public string $type,
        public ?string $url = null,
        public ?string $base64 = null,
        public ?string $text = null,
        public ?int $width = null,
        public ?int $height = null,
        public ?string $imageType = null,
        public array $raw = [],
    ) {
    }
}
