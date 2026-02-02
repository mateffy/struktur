<?php

namespace Mateffy\Magic\Extraction\Slices;

use Mateffy\Magic\Extraction\ContentType;

interface EmbedSlice extends Slice
{
	public function getType(): ContentType;
    public function getPath(): string;
	public function getUnmodifiedPath(): ?string;
    public function getMimeType(): string;
    public function isAbsolutePath(): bool;
}
