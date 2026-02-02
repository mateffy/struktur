<?php

namespace Mateffy\Magic\Extraction\Strategies;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use JsonException;
use Mateffy\Magic\Extraction\ArtifactBatcher;
use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\Strategies\Concerns\GenerateWithBatchedPrompt;
use Mateffy\Magic\Extraction\Strategies\Concerns\SupportsConcurrency;
use Mateffy\Magic\Extraction\Strategies\Concerns\SupportsFindingDuplicatesWithLlm;

class ParallelAutoMergeStrategy extends Extractor
{
	use GenerateWithBatchedPrompt;
	use SupportsConcurrency;
	use SupportsFindingDuplicatesWithLlm;

	/**
	 * @param Artifact[] $artifacts
	 * @throws JsonException
	 */
    public function run(array $artifacts): array
    {
		$batches = ArtifactBatcher::batch(
			artifacts: $artifacts,
			options: $this->contextOptions,
			maxTokens: $this->chunkSize,
			llm: $this->llm
		);

		$listOfData = $this->runConcurrently(
			batches: $batches,
			execute: fn(Collection $artifacts) => $this->generate($artifacts),
		);

		/** @var SmartDataMerger $merger */
		$merger = app(SmartDataMerger::class);
        $mergedData = null;

		// Merge the data back together.
		foreach ($listOfData as $data) {
			// Unless this is the first batch, merge the data.
			if ($mergedData !== null) {
				$mergedData = $merger->merge(
					schema: $this->schema,
					currentData: $mergedData,
					newData: $data
				);
			} else {
				$mergedData = $data;
			}
		}

		if ($mergedData === null) {
			Log::warning('No data was merged.', [
				'extractor' => static::class,
				'model' => $this->llm->getModelName()
			]);
		}

		// Run an initial de-duplication based on hashing. Finds only exact 1:1 duplicates.
		$exactDuplicateKeys = $merger->findExactDuplicatesWithHashing($mergedData ?? []);
		$dataDeduplicated = $merger->deduplicate(data: $mergedData ?? [], keys: $exactDuplicateKeys);

		// Run a second de-duplication that finds less obvious duplicates using an LLM
		$lessObviousDuplicateKeys = $this->findLessObviousDuplicatesWithLlm($dataDeduplicated);
		$dataDeduplicatedByLlm = $merger->deduplicate(data: $dataDeduplicated, keys: $lessObviousDuplicateKeys);

		return $dataDeduplicatedByLlm;
    }

	public static function getLabel(): string
	{
		return __('Parallel (Auto Merge)');
	}

	public function getEstimatedSteps(array $artifacts): int
	{
		// Add the final LLM de-duplication step
		return $this->getBatches(artifacts: $artifacts)->count() + 1;
	}
}
