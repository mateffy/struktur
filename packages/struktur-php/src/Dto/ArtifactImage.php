<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

final readonly class ArtifactImage
{
    /**
     * An image extracted from the document body.
     */
    public const string TYPE_EMBEDDED = 'embedded';

    /**
     * A render of a page.
     */
    public const string TYPE_SCREENSHOT = 'screenshot';

    /**
     * A generated contact sheet of the extracted images. The parser adds it when
     * `ParseRequest::$images` is set and the overview is not disabled.
     */
    public const string TYPE_OVERVIEW = 'overview';

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
        public ?string $virtualPath = null,
        public array $raw = [],
    ) {
    }

    /**
     * The address of this image inside the document, for example
     * `/images/artifact-abc-page-2-image-1.png`. Use it to identify an image in a
     * later request; do not use it as a file name.
     */
    public function __toString(): string
    {
        return $this->virtualPath ?? ($this->type . ' image');
    }
}
