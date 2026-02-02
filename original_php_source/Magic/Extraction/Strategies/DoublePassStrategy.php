<?php

namespace Mateffy\Magic\Extraction\Strategies;

use Mateffy\Magic\Extraction\Artifacts\Artifact;

/**
 * The double pass performs two passes on the input data, using two different strategies.
 *
 * The first pass is done in parallel, to get the initial data.
 * This results in a data object that may not contain very detailed data on the full set of artifacts, but is a good starting point.
 *
 * The second pass is done sequentially, to get the final data.
 * Since this passes the previous data into the next batch, it can go through the documents again to see if anything was missed.
 */
class DoublePassStrategy extends Extractor
{
    /**
     * @param Artifact[] $artifacts
     */
    public function run(array $artifacts): array
    {
		$parallel = $this->makeParallelStrategy();

		// Run the parallel strategy first, to get the data initial data
		$firstPassData = $parallel->run($artifacts);

		$sequential = $this->makeSequentialStrategy(initialData: $firstPassData);

		// Run the sequential strategy second, to get the final data
		$secondPassData = $sequential->run($artifacts);

        return $secondPassData;
    }

	protected function makeParallelStrategy(): Strategy
	{
		return ParallelStrategy::make(
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
		return SequentialStrategy::make(
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
		return __('Double Pass');
	}

	public function getEstimatedSteps(array $artifacts): int
	{
		$parallelSteps = $this->makeParallelStrategy()->getEstimatedSteps($artifacts);
		$sequentialSteps = $this->makeSequentialStrategy()->getEstimatedSteps($artifacts);

		return $parallelSteps + $sequentialSteps;
	}
}
