<?php

namespace Mateffy\Magic\Tools\Prebuilt;

use Mateffy\Magic;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Tools\InvokableTool;
use Opis\JsonSchema\{
    Validator,
    ValidationResult,
    Errors\ErrorFormatter,
};

class Extract implements InvokableTool
{
    public function __construct(
        protected array $schema,
    ) {}

    public function name(): string
    {
        return 'extract';
    }

    public function description(): ?string
    {
        return 'Output the extracted data in the defined schema.';
    }

    public function schema(): array
    {
        return $this->schema;
    }

    public function validate(array $arguments): array
    {
		if ($errors = app(Magic\Support\JsonValidator::class)->validate(data: $arguments, schema: $this->schema)) {

		}
        return $arguments;
    }

    public function execute(ToolCall $call): mixed
    {
        return Magic::end($call->arguments);
    }

    public function callback(): \Closure
    {
        return fn () => null;
    }
}
