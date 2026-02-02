<?php

namespace Mateffy\Magic\Extraction\Artifacts;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ArtifactMetadata
{
    public function __construct(
        public ArtifactType $type,
		public string $id,
        public string $name,
        public string $mimetype,
        public string $extension,
    ) {}

    public function toArray(): array
    {
        return [
            'type' => $this->type->value,
			'id' => $this->id,
            'name' => $this->name,
            'mimetype' => $this->mimetype,
            'extension' => $this->extension,
        ];
    }

    public static function fromArray(array $data): static
    {
        return new static(
            type: ArtifactType::from($data['type']),
			id: $data['id'],
            name: $data['name'],
            mimetype: $data['mimetype'],
            extension: $data['extension'],
        );
    }

	/**
	 * @throws \JsonException
	 */
	public static function tryFromPath(string $jsonPath, ?string $disk = null): ?static
    {
		if ($disk) {
			$disk = Storage::disk($disk);

			if ($disk->exists($jsonPath)) {
				$json = json_decode($disk->get($jsonPath), true, flags: JSON_THROW_ON_ERROR);
			}
		} elseif (File::exists($jsonPath)) {
			$json = File::json($jsonPath, flags: JSON_THROW_ON_ERROR);
		}

		if (isset($json)) {
			return static::fromArray($json);
		}

        return null;
    }

    public static function fromFile(string $id, string $path, ?string $disk = null): static
    {
        $mimeType = $disk
            ? Storage::disk($disk)->mimeType($path)
            : mime_content_type($path);

        return new self(
            type: ArtifactType::fromMimetype($mimeType),
			id: $id,
            name: basename($path),
            mimetype: $mimeType,
            extension: pathinfo($path, PATHINFO_EXTENSION),
        );
    }
}
