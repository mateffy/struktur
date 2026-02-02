<?php

namespace Mateffy\Magic\Support;

use Prism\Prism\Contracts\Schema;

class RawPrismSchema implements Schema
{
    public function __construct(public string $name, public array $schema)
    {
    }

    public function name(): string
    {
        return $this->name;
    }

    public function toArray(): array
    {
        return $this->schema;
    }
}