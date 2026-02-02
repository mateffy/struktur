<?php

namespace Mateffy\Magic\Tokens;

interface TextTokenizer
{
	public function tokenize(string $text): int;
}