<?php

namespace Mateffy\Magic\Extraction\Slices;

interface TextualSlice extends Slice
{
    public function text(): string;
}