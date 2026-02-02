<?php

namespace Mateffy\Magic\Chat\Messages;

interface PartialMessage extends Message
{
    public function append(string $chunk): static;

    public static function fromChunk(string $chunk): static;
}
