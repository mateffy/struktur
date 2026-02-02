<?php

namespace Mateffy\Magic\Support;

use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\ContextOptions;
use Mateffy\Magic\Extraction\Slices\EmbedSlice;
use Mateffy\Magic\Extraction\Slices\Slice;

class ArtifactID implements \Stringable
{
    public function __construct(
        public string $artifact,
        public string $path
    )
    {
    }

    public static function fromArtifactEmbedSlice(Artifact $artifact, EmbedSlice $slice): self
    {
        return new self(
            artifact: $artifact->getMetadata()->id,
            path: $slice->getUnmodifiedPath() ?? $slice->getPath()
        );
    }

    public static function parse(string $id): ?self
    {
        // We need to support both the old style artifact ID as well as the new ID here:
        // old / deprecated: artifact:1234567890/path/to/file.pdf
        // new: artifact:1234567890:path/to/file.pdf

        $artifact = str($id)
            ->after('artifact:')
            ->before(':')
            ->before('/')
            ->value();

        $path = str($id)
            ->after("artifact:{$artifact}:")
            ->after("artifact:{$artifact}/")
            ->value();

        if (empty($artifact) || empty($path)) {
            return null;
        }

        return new self($artifact, $path);
    }

    public function toString(): string
    {
        return "artifact:{$this->artifact}:{$this->path}";
    }

    public function __toString(): string
    {
        return $this->toString();
    }
}
