<?php

namespace Mateffy\Magic\Support;

use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Errors\ValidationError;
use Opis\JsonSchema\Validator;

/**
 * This class is a simple wrapper around the Opis\JsonSchema library.
 * The library is wonderful for validating JSON data against a JSON schema,
 * but it has some quirks that make passing data to it directly a bit cumbersome.
 *
 * For example, it requires PHP objects instead of PHP arrays, and it uses a slash-separated path for error messages.
 * LLM Magic aligns itself with the Laravel way of doing things, which is dot-notated error messages and just using PHP arrays for both data and schema.
 *
 * This class normalizes this behavior for use throughout the LLM Magic and Data Wizard ecosystem.
 */
class JsonValidator
{
	/**
	 * Validate the given data against the given schema.
	 *
	 * @throws \JsonException
	 */
	public function validate(array $data, array $schema): ?array
	{
		\Opis\JsonSchema\Helper::$useBCMath = false;

		$validator = new Validator();
		$validator->setMaxErrors(10);
		$validator->setStopAtFirstError(false);

		// Opis\JsonSchema works with PHP objects instead of PHP arrays.
		// A simple way to convert is to just encode and decode to JSON.
		$schema_json = json_encode($schema, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
		$schema_object = json_decode($schema_json, false, flags: JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

		// Opis\JsonSchema also requires PHP objects for dealing with the data.
		// We can use the same method to convert the data to a PHP object.
		$data_json = json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
		$data_object = json_decode($data_json, false, flags: JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

		// Perform the validation
		$result = $validator->validate($data_object, $schema_object);

		if ($error = $result->error()) {
			return $this->buildErrorArray($error);
		}

		return null;
	}

	protected function buildErrorArray(ValidationError $error, array $errors = []): array
	{
		$formatter = new ErrorFormatter();

		// Opis\JsonSchema uses a slash-separated path to the error (/user/age) with a leading slash.
		$key_with_slashes = $formatter->formatErrorKey($error);
		$key = str($key_with_slashes)
			// Remove the leading slash
			->trim('/')
			// Convert the slashes to dots
			->replace('/', '.')
			->__toString();

		if ($key === '') {
			// We use a wildcard key to represent the root of the error.
			$key = '*';
		}

		$message = $formatter->formatErrorMessage($error);

		$errors[$key] = $message;

		// Recursively build the error array for sub-errors
		foreach ($error->subErrors() as $subError) {
			$errors = [
				...$errors,
				...$this->buildErrorArray($subError, $errors),
			];
		}

		return $errors;
	}

	public static function test()
	{
		$data = [
			'name' => 'John Doe',
			'age' => 30,
			'products' => [
				[
					'name' => 'Product 1',
					'price' => 100,
				],
				[
					'name' => 'Product 2',
					'price' => '200',
				],
			],
		];

		$schema = [
			'type' => 'object',
			'properties' => [
				'name' => ['type' => 'string'],
				'age' => ['type' => 'integer'],
				'products' => [
					'type' => 'array',
					'items' => [
						'type' => 'object',
						'properties' => [
							'name' => ['type' => 'string'],
							'price' => ['type' => 'integer'],
						],
					],
				],
			],
			'required' => ['name', 'age', 'products'],
		];

		$validator = new JsonValidator();

		$errors = $validator->validate($data, $schema);

		dd($errors);
	}
}