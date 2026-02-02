<?php

namespace Mateffy\Magic\Extraction\Artifacts;

use Illuminate\Support\Collection;
use Mateffy\Magic\Chat\Messages\Step\Image;
use Mateffy\Magic\Extraction\ContextOptions;
use Mateffy\Magic\Extraction\Slices\EmbedSlice;
use Mateffy\Magic\Extraction\Slices\Slice;

interface Artifact
{
    public function getMetadata(): ArtifactMetadata;

    /** @return Collection<Slice> */
    public function getContents(?ContextOptions $contextOptions = null): Collection;
    public function getRawEmbedContents(EmbedSlice $content): mixed;
	public function getRawEmbedStream(EmbedSlice $content): mixed;
    public function makeBase64Image(EmbedSlice $content): Image;
}
