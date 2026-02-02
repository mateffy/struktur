<?php

namespace Mateffy\Magic\Models\Decoders;

interface Decoder
{
    public function process(): array;
}
