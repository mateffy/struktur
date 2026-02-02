<?php

namespace Mateffy\Magic\Extraction\Strategies;

/**
 * Same as the normal DoublePassStrategy, but with auto-merging enabled.
 */
class DoublePassStrategyAutoMerging extends DoublePassStrategy
{
    protected function makeParallelStrategy(): Strategy
	{
		return ParallelAutoMergeStrategy::make(
			llm: $this->llm,
			contextOptions: $this->contextOptions,
			outputInstructions: $this->outputInstructions,
			schema: $this->schema,
			chunkSize: $this->chunkSize,
			onDataProgress: $this->onDataProgress,
			onTokenStats: $this->onTokenStats,
			onMessageProgress: $this->onMessageProgress,
			onMessage: $this->onMessage,
			onActorTelemetry: $this->onActorTelemetry
		);
	}

	protected function makeSequentialStrategy(array $initialData = []): Strategy
	{
		return SequentialAutoMergeStrategy::make(
			llm: $this->llm,
			contextOptions: $this->contextOptions,
			outputInstructions: $this->outputInstructions,
			schema: $this->schema,
			chunkSize: $this->chunkSize,
			onDataProgress: $this->onDataProgress,
			onTokenStats: $this->onTokenStats,
			onMessageProgress: $this->onMessageProgress,
			onMessage: $this->onMessage,
			onActorTelemetry: $this->onActorTelemetry,

			// Pass the data from the first pass into the second pass
			initialData: $initialData
		);
	}

	public static function getLabel(): string
	{
		return __('Double Pass (Auto Merge)');
	}
}
