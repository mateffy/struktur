<?php

namespace Mateffy\Magic\Extraction;

use Illuminate\Support\Collection;
use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\Artifacts\SplitArtifact;
use Mateffy\Magic\Models\LLM;
use Mateffy\Magic\Models\Options\HasMaximumImageCount;
use Mateffy\Magic\Models\Options\HasMaximumTokenCount;

/**
 * ArtifactBatcher is a class similar to ArtifactSplitter, but it has a different purpose.
 * While Artifact Splitter is supposed to split single artifacts into multiple artifacts so a large artifact fits into
 * token constraints, ArtifactBatcher will combine multiple (split) artifacts into batches that fit into token and image constraints.
 *
 * It uses ArtifactSplitter to split the artifacts into smaller parts, then combines these parts into batches that are as large as possible.
 */
class ArtifactBatcher
{
	public function __construct(
		/** @var Collection<Artifact> $artifacts */
		protected Collection $artifacts,
		protected ContextOptions $options,
		protected int $maxTokens,
		protected ?int $maxImages
	)
	{
	}

	/**
	 * @param Collection<Artifact>|Artifact[] $artifacts
	 * @return Collection<Collection<Artifact>>
	 */
	public static function batch(array|Collection $artifacts, ContextOptions $options, int $maxTokens, ?int $maxImages = null, ?LLM $llm = null): Collection
	{
		$llmMaxTokens = $llm instanceof HasMaximumTokenCount
			? $llm->getMaximumTokenCount()
			: null;

		$llmMaxImages = $llm instanceof HasMaximumImageCount
			? $llm->getMaximumImageCount()
			: null;

		$maxTokens = min($maxTokens, $llmMaxTokens ?? $maxTokens);

		if ($maxImages !== null) {
			$maxImages = min($maxImages, $llmMaxImages ?? $maxImages);
		}

		// We use Laravel Dependency Injection to create a new instance of ArtifactSplitter.
		// This way, library users can override the default implementation of ArtifactSplitter with their own.
		$splitter = app(ArtifactBatcher::class, [
			'artifacts' => Collection::wrap($artifacts),
			'options' => $options,
			'maxTokens' => $maxTokens,
			'maxImages' => $maxImages,
		]);

		return $splitter->batchByTokens();
	}

	/**
	 * Split the artifacts into batches that fit into token and image constraints.
	 *
	 * @return Collection<Collection<Artifact>>
	 */
	public function batchByTokens(): Collection
	{
        /** @var Collection<SplitArtifact> $splits */
        $splits = collect();

        foreach ($this->artifacts as $artifact) {
			$splitArtifacts = ArtifactSplitter::split(
				artifact: $artifact,
				options: $this->options,
				maxTokens: $this->maxTokens,
				maxImages: $this->maxImages,
			);

            $splits = $splits->concat($splitArtifacts->all());
        }


        /** @var Collection<Collection<SplitArtifact>> $batches */
        $batches = collect();
        $batch = collect();

		$currentBatchTokens = 0;
		$currentBatchImages = 0;

        foreach ($splits as $splitArtifact) {
			$currentBatchTokens += $splitArtifact->tokens;
			$currentBatchImages += $splitArtifact->images;

			$fitsInCurrentBatchByTokens = $currentBatchTokens <= $this->maxTokens;
			$fitsInCurrentBatchByImages = $this->maxImages === null || $currentBatchImages <= $this->maxImages;

            if ($fitsInCurrentBatchByTokens && $fitsInCurrentBatchByImages) {
				$batch->push($splitArtifact);
			} else {
				// Make sure we don't add empty batches
				if ($batch->isNotEmpty()) {
					$batches->push($batch);
				}

				$batch = collect([$splitArtifact]);

				$currentBatchTokens = $splitArtifact->tokens;
				$currentBatchImages = $splitArtifact->images;
			}
        }

        if ($batch->isNotEmpty()) {
            $batches->push($batch);
        }

		return $batches;
	}
}