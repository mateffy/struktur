<?php

namespace Mateffy\Magic\Chat\Messages;

use Mateffy\Magic\Chat\Messages\Step\ContentInterface;
use Mateffy\Magic\Chat\Prompt\Role;

class ToolResultMessage implements Message, DataMessage, ContentInterface
{
    use WireableViaArray;

    public function __construct(
        public Role     $role,
        public ToolCall $call,
        public mixed    $output,
        public bool     $endConversation = false,
    ) {}

    public function data(): ?array
    {
        if (is_array($this->output)) {
            return $this->output;
        }

        if ($this->output === null) {
            return null;
        }

        return json_decode($this->output, true);
    }

    public static function fromArray(array $data): static
    {
        return new self(
            role: Role::from($data['role']),
            call: ToolCall::fromArray($data['call']),
            output: $data['output'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'role' => $this->role->value,
            'call' => $this->call->toArray(),
            'output' => $this->output,
        ];
    }

    public function json(): ?array
    {
        if (! is_array($this->output)) {
            return null;
        }

        return $this->output;
    }

    public function text(): ?string
    {
        if ($this->output === null) {
            return null;
        }

        if (! is_string($this->output)) {
            return json_encode($this->output, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }

        return $this->output;
    }

    public function role(): Role
    {
        return $this->role;
    }

	public function withOutput(mixed $output): static
	{
		return new self(role: $this->role, call: $this->call, output: $output, endConversation: $this->endConversation);
	}

    public static function output(ToolCall $call, mixed $output): static
    {
        return new self(role: Role::User, call: $call, output: $output);
    }

    public static function end(ToolCall $call, mixed $output): static
    {
        return new self(role: Role::User, call: $call, output: $output, endConversation: true);
    }

    public static function error(ToolCall $call, string $message): static
    {
        return new self(role: Role::User, call: $call, output: ['error' => $message]);
    }

    public static function canceled(ToolCall $call): static
    {
        return new self(role: Role::User, call: $call, output: 'canceled');
    }
}
