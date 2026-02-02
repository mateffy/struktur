<?php

namespace Mateffy\Magic\Extraction;

use Illuminate\Support\Collection;
use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\Artifacts\SplitArtifact;
use Mateffy\Magic\Extraction\Slices\EmbedSlice;

/**
 * The artifact splitter is responsible for splitting a single artifact into multiple artifacts.
 * It supports both token and image constraints. Some LLM apis have limits for both (for example Mistral only allows 8 images per call).
 *
 * The splitter works with both in a what ever is hit first type of way.
 * So, if the token limit is hit first, it will split the artifact and start a new one.
 * If the image limit is hit first, it will also split the artifact and start a new one.
 */
class ArtifactSplitter
{
	public function __construct(
		protected Artifact $original,
		protected ContextOptions $options,
		protected int $maxTokens,
		protected ?int $maxImages
	)
	{
	}

	/**
	 * @return Collection<Artifact>
	 */
	public static function split(Artifact $artifact, ContextOptions $options, int $maxTokens = null, ?int $maxImages = null): Collection
	{
		// We use Laravel Dependency Injection to create a new instance of ArtifactSplitter.
		// This way, library users can override the default implementation of ArtifactSplitter with their own.
		$splitter = app(ArtifactSplitter::class, [
			'original' => $artifact,
			'options' => $options,
			'maxTokens' => $maxTokens,
			'maxImages' => $maxImages,
		]);

		return $splitter->splitByTokens();
	}

	/**
	 * Splits the document. Adds data until either the character limit or embed limit is reached, then starts a new split.
	 *
	 * @return Collection<Artifact>
	 */
	public function splitByTokens(): Collection
	{
		$artifacts = collect();
        $contents = collect();

        $currentTokens = 0;
		$imageCount = 0;

        foreach ($this->original->getContents(contextOptions: $this->options) as $content) {
			$tokens = $content->getTokens();

			if ($content instanceof EmbedSlice) {
				$imageCount++;
			}

            $currentTokens += $tokens;

			$contents[] = $content;

            if ($currentTokens > $this->maxTokens || ($this->maxImages !== null && $imageCount >= $this->maxImages)) {
                $artifacts[] = new SplitArtifact(original: $this->original, contents: $contents, tokens: $currentTokens, images: $imageCount);
                $contents = collect();

                $currentTokens = 0;
				$imageCount = 0;
            }
        }

        if (count($contents) > 0) {
            $artifacts[] = new SplitArtifact(original: $this->original, contents: $contents, tokens: $currentTokens, images: $imageCount);
        }

        return $artifacts;
	}
}