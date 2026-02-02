<?php

namespace Mateffy\Magic\Tools\Prebuilt;

use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Tools\InvokableTool;

class ModifyData implements InvokableTool
{
    public function __construct(
        protected array $schema,
    ) {}

    public function name(): string
    {
        return 'modifyData';
    }

    public function description(): ?string
    {
        return 'Modify the data.';
    }

    public function schema(): array
    {
        return $this->schema;
    }

    public function validate(array $arguments): array
    {
        return $arguments;
    }

    public function execute(ToolCall $call): mixed
    {
        return null;
    }

    public function callback(): \Closure
    {
        return fn () => null;
    }
}
