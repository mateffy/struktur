<?php

namespace Mateffy\Magic\Extraction\Strategies;

use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\Strategies\Concerns\GenerateWithBatchedPrompt;

class SequentialStrategy extends Extractor
{
	use GenerateWithBatchedPrompt;

    /**
     * @param  Artifact[]  $artifacts
     */
    public function run(array $artifacts): array
    {
        $batches = $this->getBatches(artifacts: $artifacts);

        $data = null;

        foreach ($batches as $batch) {
            $data = $this->generate($batch, $data);
        }

		$this->logDataProgress(data: $data);

        return $data;
    }

	public static function getLabel(): string
	{
		return __('Sequential');
	}

	public function getEstimatedSteps(array $artifacts): int
	{
		return $this->getBatches(artifacts: $artifacts)->count();
	}
}
