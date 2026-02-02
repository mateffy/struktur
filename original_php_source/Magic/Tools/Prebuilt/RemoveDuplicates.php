<?php

namespace Mateffy\Magic\Tools\Prebuilt;

use Mateffy\Magic;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Tools\InvokableTool;

class RemoveDuplicates implements InvokableTool
{
    public function name(): string
    {
        return 'removeDuplicates';
    }

    public function description(): ?string
    {
        return 'Remove duplicates from a dataset.';
    }

    public function schema(): array
    {
        return [
			'type' => 'object',
			'properties' => [
				'keys' => [
					'type' => 'array',
					'description' => 'The keys to remove from the dataset. This is a dot-notated list of keys that can be for multiple properties of the dataset. Only works on array properties!',
					'items' => [
						'type' => 'string',
						'description' => 'The key to remove duplicates from. Has to be dot notated and use 0-based indicies, for example: `products.3` or `categories.17`.'
					],
				]
			],
			'required' => ['keys'],
		];
    }

    public function validate(array $arguments): array
    {
        return $arguments;
    }

    public function execute(ToolCall $call): mixed
    {
		// We don't directly do anything but instead return the data to whatever script is using this tool to deduplicate the data.
        return Magic::end($call->arguments);
    }
}
