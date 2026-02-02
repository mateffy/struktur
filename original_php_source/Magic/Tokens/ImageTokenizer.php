<?php

namespace Mateffy\Magic\Tokens;

interface ImageTokenizer
{
	public function tokenize(?int $width, ?int $height): int;
}