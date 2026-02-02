<?php

namespace Mateffy\Magic\Chat\Messages;

use Illuminate\Support\Str;
use Mateffy\Magic\Chat\Prompt\Role;
use Mateffy\Magic\Support\PartialJson;

class ToolCallMessage implements DataMessage, PartialMessage
{
    use WireableViaArray;

    public function __construct(
        public Role      $role,
        public ?ToolCall $call = null,
        public ?string   $partial = null,
        public ?array    $schema = null,
    ) {}

    public function toArray(): array
    {
        return [
            'role' => $this->role->value,
            'call' => $this->call->toArray(),
            'partial' => $this->partial,
            'schema' => $this->schema,
        ];
    }

    public static function fromArray(array $data): static
    {
        return new static(
            role: Role::from($data['role']),
            call: ToolCall::fromArray($data['call']),
            partial: $data['partial'] ?? null,
            schema: $data['schema'] ?? null,
        );
    }

    public function data(): ?array
    {
        return $this->call->arguments;
    }

    public function text(): ?string
    {
        $arguments = collect($this->call->arguments)
            ->map(fn ($value, $key) => "$key: " . json_encode($value))
            ->join(', ');

        return "{$this->call->name}($arguments)";
    }

    public function role(): Role
    {
        return $this->role;
    }

    public function append(string $chunk): static
    {
        $this->partial .= $chunk;

        $data = PartialJson::parse($this->partial);
        $this->call = new ToolCall(
            name: $this->call->name,
            arguments: $data ?? $this->call->arguments,
            id: $this->call->id,
        );

        return $this;
    }

    public function appendFull(string $chunk): static
    {
        $this->partial .= $chunk;

        $data = PartialJson::parse($this->partial);
        $this->call = ($data['name'] ?? $this->call?->name)
            ? new ToolCall(
                name: $data['name'] ?? $this->call?->name,
                arguments: $data['parameters'] ?? $this->call?->arguments ?? [],
                id: $this->call?->id ?? Str::uuid()->toString(),
            )
            : null;

        return $this;
    }

    public static function fromChunk(string $chunk): static
    {
        $data = PartialJson::parse($chunk);

        if ($call = ToolCall::tryFrom($data)) {
            return new self(
                role: Role::Assistant,
                call: $call,
                partial: $chunk,
            );
        }

        return new self(
            role: Role::Assistant,
            call: null,
            partial: $chunk,
        );
    }

    public static function call(ToolCall $call): static
    {
        return new self(
            role: Role::Assistant,
            call: $call,
            partial: null,
        );
    }
}
