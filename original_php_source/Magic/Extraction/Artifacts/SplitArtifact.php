<?php

namespace Mateffy\Magic\Extraction\Artifacts;

use Illuminate\Support\Collection;
use Mateffy\Magic\Chat\Messages\Step\Image;
use Mateffy\Magic\Extraction\ContextOptions;
use Mateffy\Magic\Extraction\Slices\EmbedSlice;
use Mateffy\Magic\Extraction\Slices\Slice;

/**
 * Artifact directory:
 * /artifacts/<ID>
 * /artifacts/<ID>/metadata.json
 * /artifacts/<ID>/source.<EXT>
 * /artifacts/<ID>/thumbnail.jpg
 * /artifacts/<ID>/embeds (optional)
 * /artifacts/<ID>/embeds/<FILENAME>.jpg
 */
readonly class SplitArtifact implements Artifact
{
    public function __construct(
        public Artifact $original,
        /** @var Collection<Slice> */
        public Collection $contents,
        public int $tokens,
		public int $images
    ) {}

    public function getMetadata(): ArtifactMetadata
    {
        return $this->original->getMetadata();
    }

    public function getContents(?ContextOptions $contextOptions = null): Collection
    {
        return $contextOptions?->filter($this->contents) ?? $this->contents;
    }

    public function makeBase64Image(EmbedSlice $content): Image
    {
        return $this->original->makeBase64Image($content);
    }

    public function getRawEmbedContents(EmbedSlice $content): mixed
    {
        return $this->original->getRawEmbedContents($content);
    }

	public function getRawEmbedStream(EmbedSlice $content): mixed
	{
		return $this->original->getRawEmbedStream($content);
	}
}
