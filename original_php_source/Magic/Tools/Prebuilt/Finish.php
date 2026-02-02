<?php

namespace Mateffy\Magic\Tools\Prebuilt;

use Closure;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Tools\InvokableTool;

class Finish implements InvokableTool
{
    public function name(): string
    {
        return 'finish';
    }

    public function schema(): array
    {
        return [
            'name' => 'finish',
            'description' => 'Output some text as a result. Will be formatted as such.',
            'arguments' => [
                'text' => [
                    'type' => 'string',
                    'description' => 'Final message to output',
                ],
            ],
            'required' => ['text'],
        ];
    }

    public function validate(array $arguments): array
    {
        $validator = validator($arguments, [
            'text' => 'nullable|string',
        ]);

        $validator->validate();

        return $validator->validated();
    }

    public function execute(ToolCall $call): mixed
    {
        return null;
    }

    public function callback(): Closure
    {
        return fn () => null;
    }
}
