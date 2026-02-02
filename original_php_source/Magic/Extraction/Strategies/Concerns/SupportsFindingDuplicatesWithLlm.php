<?php

namespace Mateffy\Magic\Extraction\Strategies\Concerns;

use Mateffy\Magic;
use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\Prompt\DataDeduplicationPrompt;
use Mateffy\Magic\Chat\TokenStats;

trait SupportsFindingDuplicatesWithLlm
{
	/**
	 * @param array $data
	 * @return string[]
	 */
	protected function findLessObviousDuplicatesWithLlm(array $data): array
	{
		$prompt = new DataDeduplicationPrompt(schema: $this->schema, data: $data);

		$threadId = $this->createActorThread(llm: $this->llm, prompt: $prompt);

		$removalData = Magic::chat()
            ->model($this->llm)
            ->prompt($prompt)
            ->onMessageProgress(function (Message $message) {
                $this->logMessageProgress(message: $message);
            })
            ->onMessage(function (Message $message) use ($threadId) {
                $this->logMessage(message: $message, threadId: $threadId);
            })
            ->onTokenStats(function (TokenStats $tokenStats) {
                $this->logTokenStats(tokenStats: $tokenStats);
            })
            ->stream()
			->lastData();


		return $removalData['keys'] ?? [];
	}
}