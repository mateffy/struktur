<?php

namespace Mateffy\Magic\Chat\Messages\Step;

use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Chat\Messages\WireableViaArray;

readonly class ToolUse implements ContentInterface
{
    use WireableViaArray;

    public function __construct(
        public ToolCall $call,
    ) {}

    public function toArray(): array
    {
        return [
            'type' => 'tool_use',
            'call' => $this->call->toArray(),
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            call: ToolCall::fromArray($data['call']),
        );
    }

    public static function call(ToolCall $call): self
    {
        return new self(call: $call);
    }

	public static function make(string $name, array $arguments = [], ?string $id = null): self
	{
		return new self(call: new ToolCall(name: $name, arguments: $arguments, id: $id));
	}
}
