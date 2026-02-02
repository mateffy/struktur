<?php

namespace Mateffy\Magic\Chat\Messages\Step;

use Illuminate\Support\Facades\Storage;
use Mateffy\Magic\Chat\Messages\WireableViaArray;

readonly class Image implements ContentInterface
{
    use WireableViaArray;

    public function __construct(
        public string $imageBase64,
        public string $mime,
    ) {}

    public function toArray(): array
    {
        return [
            'type' => 'image',
            'source' => [
                'type' => 'base64',
                'media_type' => $this->mime,
                'data' => $this->imageBase64,
            ],
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            imageBase64: $data['source']['data'],
            mime: $data['source']['media_type'],
        );
    }

	/**
	 * @deprecated Use path() instead
	 */
    public static function fromPath(string $path): self
    {
		return self::path($path);
    }

	public static function path(string $path): self
	{
		$mime = mime_content_type($path);

        return self::fromContents(
            contents: file_get_contents($path),
            mime: $mime,
        );
	}

	/**
	 * @deprecated Use raw() instead
	 */
    public static function fromContents($contents, string $mime): self
    {
		return self::raw($contents, $mime);
    }

	public static function raw($contents, string $mime): self
	{
		return new self(
            imageBase64: base64_encode($contents),
            mime: $mime,
        );
	}

	/**
	 * @deprecated Use url() instead
	 */
	public static function fromUrl(string $url): self
	{
		return self::url($url);
	}

	public static function url(string $url): self
	{
		$contents = file_get_contents($url);
		$mime = mime_content_type($url);

		return self::raw($contents, $mime);
	}

	/**
	 * @deprecated Use disk() instead
	 */
    public static function fromDisk(string $disk, string $path): self
    {
		return self::disk($disk, $path);
    }

	public static function disk(string $disk, string $path): self
	{
		$disk = Storage::disk($disk);

        return self::raw(
            contents: $disk->get($path),
            mime: $disk->mimeType($path),
        );
	}

	public static function base64(string $base64, string $mime): self
	{
		return new self(
			imageBase64: $base64,
			mime: $mime,
		);
	}
}
