<?php

namespace Mateffy\Magic\Extraction\Slices;

use Mateffy\Magic\Extraction\ContentType;
use Mateffy\Magic\Tokens\ImageTokenizer;

readonly class ImageSlice implements Slice, EmbedSlice
{
    public function __construct(
		public ContentType $type,
        public string $mimetype,
        public string $path,
		public ?string $unmodifiedPath = null,
        public ?int $page = null,
        public ?int $width = null,
        public ?int $height = null,
        public bool $absolutePath = false,
    ) {
    }

    public function toArray(): array
    {
        return [
			'type' => $this->type->value,
            'mimetype' => $this->mimetype,
            'path' => $this->path,
			'unmodified_path' => $this->unmodifiedPath,
            'page' => $this->page,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }

    public static function from(array $data): static
    {
        return new static(
			type: ContentType::tryFrom($data['type']),
            mimetype: $data['mimetype'],
            path: $data['path'],
			unmodifiedPath: $data['unmodified_path'] ?? null,
            page: $data['page'] ?? null,
            width: $data['width'] ?? null,
            height: $data['height'] ?? null,
        );
    }

    public function getPage(): ?int
    {
        return $this->page;
    }

    public function getPath(): string
    {
        return $this->path;
    }

	public function getUnmodifiedPath(): ?string
	{
		// Unmodified path is the path before any transformations were applied.
		// so for images_marked/image1.jpg, it would be images/image1.jpg
		// but it's optional. if so it's assumed the normal path is the unmodified path.

		return $this->unmodifiedPath;
	}

	public function getMimeType(): string
    {
        return $this->mimetype;
    }

    public function isAbsolutePath(): bool
    {
        return $this->absolutePath;
    }

	public function getTokens(): int
	{
		return app(ImageTokenizer::class)->tokenize($this->width, $this->height);
	}

	public function getType(): ContentType
	{
		return $this->type;
	}
}
