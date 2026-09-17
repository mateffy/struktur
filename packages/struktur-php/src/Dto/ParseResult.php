<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

final readonly class ParseResult
{
    /**
     * @param list<Artifact> $artifacts
     */
    public function __construct(
        public array $artifacts,
        public ?string $rawStdout = null,
    ) {
    }

    /**
     * Every image in the document, keyed by its virtual path.
     *
     * The virtual path is the address of the image inside the document, for example
     * `/images/artifact-abc-page-2-image-1.png`. An image without a virtual path is
     * keyed by its position, so no image is lost.
     *
     * @return array<string, ArtifactImage>
     */
    public function images(): array
    {
        $images = [];
        $position = 0;

        foreach ($this->media() as $image) {
            $position++;

            $images[$image->virtualPath ?? sprintf('image-%d', $position)] = $image;
        }

        return $images;
    }

    /**
     * The generated image overview: a contact sheet of every extracted image, each
     * thumbnail captioned with its virtual path. Null when the parser did not make one.
     */
    public function overview(): ?ArtifactImage
    {
        foreach ($this->media() as $image) {
            if ($image->imageType === ArtifactImage::TYPE_OVERVIEW) {
                return $image;
            }
        }

        return null;
    }

    /**
     * @return list<ArtifactImage>
     */
    public function media(): array
    {
        $media = [];

        foreach ($this->artifacts as $artifact) {
            foreach ($artifact->contents as $content) {
                foreach ($content->media as $image) {
                    $media[] = $image;
                }
            }
        }

        return $media;
    }
}
