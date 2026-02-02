<?php

namespace Mateffy\Magic\Tools\Prebuilt;

use Mateffy\Magic;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Tools\InvokableTool;

class MergeData implements InvokableTool
{
    public function __construct(
        protected array $schema,
    ) {}

    public function name(): string
    {
        return 'mergeData';
    }

    public function description(): ?string
    {
        return 'Merge the data together by calling this function. The data you pass in should be the data that you merged together. This will save it.';
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
        return Magic::end($call->arguments);
    }

    public function callback(): \Closure
    {
        return fn () => null;
    }
}
