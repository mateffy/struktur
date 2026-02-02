<?php

namespace Mateffy\Magic\Extraction\Strategies;

use Mateffy\Magic\Chat\Prompt\ExtractorPrompt;
use Mateffy\Magic\Extraction\ArtifactBatcher;
use Mateffy\Magic\Extraction\Artifacts\Artifact;

class SimpleStrategy extends Extractor
{
	/**
	 * @param Artifact[] $artifacts
	 */
    public function run(array $artifacts): array
    {
		// We still batch the artifacts to avoid hitting the token limit, but only use the first one.
		[$limitedArtifacts] = $this->getBatches(artifacts: $artifacts);

        $prompt = new ExtractorPrompt(extractor: $this, artifacts: $limitedArtifacts->all(), contextOptions: $this->contextOptions);

        $threadId = $this->createActorThread(llm: $this->llm, prompt: $prompt);

        return $this->send(threadId: $threadId, llm: $this->llm, prompt: $prompt);
    }

	public static function getLabel(): string
	{
		return __('Simple');
	}

	public function getEstimatedSteps(array $artifacts): int
	{
		return 1;
	}
}
