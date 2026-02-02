<?php

namespace Mateffy\Magic\Chat\Messages;

use Illuminate\Contracts\Support\Arrayable;
use Livewire\Wireable;
use Mateffy\Magic\Chat\Prompt\Role;

interface Message extends Arrayable, Wireable
{
    public static function fromArray(array $data): static;

    public function toArray(): array;

    public function text(): ?string;
    public function role(): Role;
}
