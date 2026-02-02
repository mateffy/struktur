<?php

namespace Mateffy\Magic\Extraction\Strategies;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Mateffy\Magic\Chat\Prompt\ParallelMergerPrompt;
use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\Strategies\Concerns\GenerateWithBatchedPrompt;
use Mateffy\Magic\Extraction\Strategies\Concerns\SupportsConcurrency;

class ParallelStrategy extends Extractor
{
	use GenerateWithBatchedPrompt;
	use SupportsConcurrency;

    /**
     * @param Artifact[] $artifacts
     */
    public function run(array $artifacts): array
    {
		$batches = $this->getBatches(artifacts: $artifacts);

		$dataList = $this->runConcurrently(
			batches: $batches,
			execute: fn(Collection $artifacts) => $this->generate($artifacts)
		);

        $data = $this->mergeWithLlm($dataList->all());

        $this->logDataProgress(data: $data);

        return $data;
    }

    protected function mergeWithLlm(array $dataList): ?array
    {
        $prompt = new ParallelMergerPrompt(extractor: $this, datas: $dataList);

        $threadId = $this->createActorThread(llm: $this->llm, prompt: $prompt);

		return $this->send(
			threadId: $threadId,
			llm: $this->llm,
			prompt: $prompt
		);
    }

	public static function getLabel(): string
	{
		return __('Parallel');
	}

	public function getEstimatedSteps(array $artifacts): int
	{
		// Add one for the merge step.
		return $this->getBatches(artifacts: $artifacts)->count() + 1;
	}
}
