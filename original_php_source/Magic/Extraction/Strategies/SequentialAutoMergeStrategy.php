<?php

namespace Mateffy\Magic\Extraction\Strategies;

use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\Strategies\Concerns\GenerateWithBatchedPrompt;
use Mateffy\Magic\Extraction\Strategies\Concerns\SupportsFindingDuplicatesWithLlm;

class SequentialAutoMergeStrategy extends Extractor
{
	use SupportsFindingDuplicatesWithLlm;
	use GenerateWithBatchedPrompt;

    /**
     * @param Artifact[] $artifacts
     */
    public function run(array $artifacts): array
    {
		$batches = $this->getBatches(artifacts: $artifacts);

		/** @var SmartDataMerger $merger */
		$merger = app(SmartDataMerger::class);
        $currentData = [];

        foreach ($batches as $batch) {
            $newData = $this->generate($batch, data: $currentData) ?? $currentData;

			if ($currentData !== null) {
				$currentData = $merger->merge(
					schema: $this->schema,
					currentData: $currentData,
					newData: $newData
				) ?? [];

				// Run an intermediate de-duplication step. Finds only exact 1:1 duplicates.
				$exactDuplicateKeys = $merger->findExactDuplicatesWithHashing($currentData);
				$currentData = $merger->deduplicate(data: $currentData, keys: $exactDuplicateKeys);
			} else {
				$currentData = $newData;
			}

			if ($currentData) {
				$this->logDataProgress(data: $currentData);
			}
        }

		// Run an initial de-duplication based on hashing. Finds only exact 1:1 duplicates.
		$exactDuplicateKeys = $merger->findExactDuplicatesWithHashing($currentData);
		$dataDeduplicated = $merger->deduplicate(data: $currentData, keys: $exactDuplicateKeys);

		// Run a second de-duplication that finds less obvious duplicates using an LLM
		$lessObviousDuplicateKeys = $this->findLessObviousDuplicatesWithLlm($dataDeduplicated);
		$dataDeduplicatedByLlm = $merger->deduplicate(data: $dataDeduplicated, keys: $lessObviousDuplicateKeys);

		return $dataDeduplicatedByLlm;
    }

	public static function getLabel(): string
	{
		return __('Sequential (Auto Merge)');
	}

	public function getEstimatedSteps(array $artifacts): int
	{
		// Add the final LLM de-duplication step
		return $this->getBatches(artifacts: $artifacts)->count() + 1;
	}
}
