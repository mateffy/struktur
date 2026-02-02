<?php

namespace Mateffy\Magic\Exceptions;

class JsonSchemaValidationError extends \Exception implements LLMException
{
	/**
	 * @param array $errors
	 */
	public function __construct(protected array $errors)
	{
		$last_key = array_key_last(array: $errors);
		$last_error = $errors[$last_key];

		parent::__construct(message: $last_error);
	}

	public function getValidationErrors(): array
	{
		return $this->errors;
	}

	public function getValidationErrorsAsJson(): string
	{
		return json_encode(value: $this->getValidationErrors(), flags: JSON_PRETTY_PRINT);
	}

	public function getTitle(): string
	{
		return 'Data validation error';
	}
}