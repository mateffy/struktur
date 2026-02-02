<?php

namespace Mateffy\Magic\Tools;

use Illuminate\Validation\ValidationException;
use JsonException;
use Mateffy\Magic\Support\JsonValidator;

trait ValidateWithSchema
{
	/**
	 * @throws JsonException
	 */
	public function validate(array $arguments): array
    {
		$nulled_data = $this->replaceEmptyStringsWithNull($arguments);

		$validator = app(JsonValidator::class);

        $errors = $validator->validate(
            data: $nulled_data,
            schema: $this->schema()
        );

		if ($errors) {
			throw ValidationException::withMessages($errors);
		}

		return $nulled_data;
	}

	protected function replaceEmptyStringsWithNull(array $data): array
	{
		// Copy the arguments to a new array so that we can modify them without affecting the original
		$nulled_data = json_decode(json_encode($data), true);

        // Deeply replace empty strings with nulls
        array_walk_recursive($nulled_data, function (&$value) {
            if ($value === '') {
                $value = null;
            }
        });

		return $nulled_data;
	}
}