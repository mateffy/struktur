<?php

namespace Mateffy\Magic\Extraction\Strategies;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class SmartDataMerger
{
	/**
	 * Merge the current data with the new data based on the schema.
	 * Only merges on the top level of the data and will not perform any deduplication.
	 *
	 * For normal values, newer values will overwrite older ones, if they are present and neither an empty string or null.
	 * For arrays, the new values will be concatenated to the old ones.
	 */
	public function merge(array $schema, array $currentData, array $newData): array
	{
		$mergedData = [];

		$properties = Arr::get($schema, 'properties', []);

		foreach ($properties as $key => $type) {
			if (Arr::get($type, 'type') === 'array') {
				// Concatenate the old and new values if we're dealing with an array
				$mergedData[$key] = [
					...($currentData[$key] ?? []),
					...($newData[$key] ?? [])
				];
			} else {
				$newValue = $newData[$key] ?? null;

				// Convert empty strings to null
				if ($newValue === '') {
					$newValue = null;
				}

				$mergedData[$key] = $newValue ?? $currentData[$key] ?? null;
			}
		}

		return $mergedData;
	}

	/**
	 * Deduplicate the data based on the provided dot-notated keys.
	 *
	 * @param string[] $keys Dot-notated keys to remove duplicates from. Only works on array properties!
	 */
	public function deduplicate(array $data, array $keys): array
	{
		$validKeys = collect($keys)
			// We only allow top-level keys to be modified. So products.3 is okay but products.3.discounts.5 is not.
			->filter(function (string $key) {
				$parts = explode('.', $key);

				// Only `a.0` or `a.1` etc. are allowed
				if (count($parts) !== 2) {
					return false;
				}

				// If the second part is not a number, it's not valid
				if (!is_numeric($parts[1])) {
					return false;
				}

				return true;
			})
			->values();

		$modifiedProperties = $validKeys
			->groupBy(fn (string $key) => Str::before($key, '.'));

		// Go through each key and remove it
		foreach ($modifiedProperties as $property => $keys) {
			// Get the current items and convert them to a string-indexed array.
			// This way we can remove items by their indices without shifting the array.
			$items = collect($data[$property] ?? [])
				->mapWithKeys(fn ($item, $index) => ["{$index}" => $item]);

			$indicies = $keys
				->map(fn (string $key) => explode('.', $key)[1])
				->toArray();

			// Remove the items by their indices
			$items = $items
				->except($indicies)
				->values()
				->all();

			$data[$property] = $items;
		}

		return $data;
	}

	/**
	 * Find duplicate keys in the data.
	 * This works by hashing the JSON representation of the items in the array properties, thus matching on exact duplicates of any kind.
	 *
	 * Returns a list of dot-notated keys to deduplicate.
	 *
	 * @return string[]
	 */
	public function findExactDuplicatesWithHashing(?array $data): array
	{
        $data ??= [];
		$keys = [];

		foreach ($data as $key => $value) {
			// We only care about array properties
			if (!is_array($value)) {
				continue;
			}

			// Group the items by their JSON representation to detect duplicates
			$grouped = [];

			foreach ($value as $index => $item) {
				// If the item itself is an array with string keys, sort by keys before stringifying
				if (is_array($item) && Arr::isAssoc($item)) {
					ksort($item);
				}

				$json = json_encode($item);

				// Use a hash of the JSON to group the items
				$detection_key = crc32($json);

				if (!isset($grouped[$detection_key])) {
					$grouped[$detection_key] = [$index];
				} else {
					$grouped[$detection_key][] = $index;
				}
			}

			// Filter the grouped items to only include the ones with more than one index.
			// Then, remove the first index so we only have the duplicates.

			$duplicates = collect($grouped)
				->filter(fn (array $indices) => count($indices) > 1)
				->map(fn (array $indices) => array_slice($indices, 1))
				->values()
				->flatten();

			$keys = [
				...$keys,
				...$duplicates
					// Turn the indices into dot-notated keys
					->map(fn ($index) => "{$key}.{$index}")
			];
		}

		return $keys;
	}
}