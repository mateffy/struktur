<?php

namespace Mateffy\Magic\Extraction\Strategies\Concerns;

use Closure;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Mateffy\Magic\Exceptions\UnknownInferenceException;
use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Throwable;
use VXM\Async\AsyncFacade as Async;

trait SupportsConcurrency
{
	/**
	 * Process batches in parallel.
	 *
	 * @param Collection<Collection<Artifact>> $batches
	 * @param Closure(Collection<Artifact>): ?array $execute The function that does the LLM call.
	 * @param null|Closure(array): void $process The function to process each resulting data array.
	 * @throws UnknownInferenceException
	 */
	protected function runConcurrently(Collection $batches, Closure $execute, ?Closure $process = null): Collection
	{
		$concurrency = config('llm-magic.extraction.concurrency');

		$results = collect();

		// If concurrency is 1 or less, consider it disabled.
		if ($concurrency <= 1) {
			// No concurrency.
			foreach ($batches as $batch) {
				// Generate a result.
				$data = $execute($batch);

				// Filter out invalid results.
				if ($data === null) {
					continue;
				}

				// Process the result.
				$process($data);

				$results->push($data);
			}

			return $results;
		}

		// If the concurrency is higher than 1, we can run the batches concurrently using the number of forks specified.

		// We again chunk the batches into groups of $concurrency.
		$concurrentSteps = $batches->chunk($concurrency);

		$id = Str::uuid()->toString();

		$errors = collect();

		// Run the concurrent steps. We split the batches into groups of $concurrency and run them concurrently to not cause any memory issues.
		foreach ($concurrentSteps as $stepIndex => $concurrentBatches) {
			foreach ($concurrentBatches as $batchIndex => $batch) {
				Async::run(function () use ($id, $stepIndex, $batchIndex, $batch, $execute) {
					$result = $execute($batch);

					// There seems to be problems with memory limits when running this in Docker containers.
					// If the output data is too large to be returned, it is droppped quietly.
					// I have yet to find a satisfying solution to this.
					// As a workaround, we don't use the returned data, but instead store it in the cache and retrieve it later.
					cache()->put("{$id}-{$stepIndex}-{$batchIndex}", $result);

					Log::info('Stored data in cache.', [
						'threadId' => $id,
						'context' => $this->contextOptions->getEvaluationTypeLabel(),
						'llm' => $this->llm->getModelName(),
						'data' => $result,
					]);

					return $result;
				}, events: [
					'timeout' => function () use (&$errors) {
						// A job took too long to finish.
						$errors->push(new \RuntimeException('A job timed out.'));
					},
					'error' => function (Throwable $exception) use (&$errors) {
						// A job failed.
						$errors->push($exception);
					},
				]);
			}

			$returnedResults = Async::wait();
			$returnedResults = json_decode(json_encode($returnedResults), associative: true, flags: JSON_THROW_ON_ERROR);

			if ($errors->isNotEmpty()) {
				// If there are errors, we need to throw an exception.
				// We can throw the first error, but we should log all of them.
				foreach ($errors as $error) {
					Log::error('An error occurred while processing a batch.', [
						'threadId' => $id,
						'context' => $this->contextOptions->getEvaluationTypeLabel(),
						'llm' => $this->llm->getModelName(),
						'error' => $error,
					]);
				}

				/**
				 * @var Throwable $error
				 */
				$error = $errors->first();

				throw new UnknownInferenceException(
					message: "{$error->getMessage()} – " . $errors->count() . " errors occurred: " . $errors->map(fn($error) => $error->getMessage())->implode(', '),
					previous: $errors->first(),
				);
			}

			foreach ($returnedResults as $result) {
				// Filter out invalid results.
				if ($result === null) {
					continue;
				}

				// Process the result.
				if ($process) {
					$process($result);
				}

				$results->push($result);
			}
		}

		// To retrieve the results, we need to fetch them from the cache.
		// This is a workaround for the memory issues we are facing.
		$ids = collect();

		foreach ($concurrentSteps as $stepIndex => $concurrentBatches) {
			foreach ($concurrentBatches as $batchIndex => $batch) {
				$ids->push("{$id}-{$stepIndex}-{$batchIndex}");
			}
		}

		// With all the IDs, we can now retrieve the results from the cache.
		$results = $ids
			->map(fn($id) => cache()->pull($id))
			->filter();

		return $results;
	}
}