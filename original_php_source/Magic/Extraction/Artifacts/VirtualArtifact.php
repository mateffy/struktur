<?php

namespace Mateffy\Magic\Extraction\Artifacts;

use Illuminate\Support\Collection;
use JsonException;
use Mateffy\Magic\Chat\Messages\Step\Image;
use Mateffy\Magic\Extraction\ContextOptions;
use Mateffy\Magic\Extraction\Slices\EmbedSlice;


class VirtualArtifact implements Artifact
{
    public function __construct(
		protected ArtifactMetadata $metadata,
		protected string $path,
		protected string $rawContents,
		protected ?Collection $contents,
		protected ?string $text = null,
	)
    {
    }

    public function getSourcePath(): string
    {
        return $this->path;
    }

    protected function getRawContents(): mixed
    {
		return $this->rawContents;
    }

    public function getContents(?ContextOptions $contextOptions = null): Collection
    {
		return $contextOptions?->filter($this->contents) ?? $this->contents;
    }

    /**
     * @throws JsonException
     */
    public function getText(?int $maxPages = null): ?string
    {
        return $this->text;
    }

    public function getMetadata(): ArtifactMetadata
    {
        return $this->metadata;
    }

    public function makeBase64Image(EmbedSlice $content): Image
    {
		throw new \Exception('Not implemented');
    }

    public function getRawEmbedContents(EmbedSlice $content): mixed
    {
        return null;
    }

	public function getRawEmbedStream(EmbedSlice $content): mixed
    {
        // Fake a stream that returns '' when read
		return fopen('php://temp', 'r+');
    }
}
