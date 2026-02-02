<?php

namespace Mateffy\Magic\Extraction\Slices;

interface Slice
{
    public function toArray(): array;

    public static function from(array $data): static;

    public function getPage(): ?int;

	public function getTokens(): int;
}
