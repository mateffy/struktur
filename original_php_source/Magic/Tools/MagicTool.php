<?php

namespace Mateffy\Magic\Tools;

use Closure;
use Illuminate\Container\Container;
use Mateffy\Magic\Chat\Messages\ToolCall;

class
MagicTool implements InvokableTool
{
    public function __construct(
        protected string $name,
        protected array $schema,
        protected Closure $callback,
    )
    {
    }

    public function name(): string
    {
        return $this->name;
    }

    public function schema(): array
    {
        return $this->schema;
    }

    public function validate(array $arguments): array
    {
        // TODO: Implement JSON schema validation.

        return $arguments;
    }

    public function execute(ToolCall $call): mixed
    {
        return Container::getInstance()->call($this->callback, [
            ...$call->arguments,
            'call' => $call,
        ]);
    }
}
