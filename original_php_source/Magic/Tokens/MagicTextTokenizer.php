<?php

namespace Mateffy\Magic\Tokens;

/**
 * Tokenize text in a unified way across LLM providers. This is worse for cost estimation (as the actual tokens used may differ)
 * but great for strategy evaluation as the token count is consistent and the amount of tokens a stragegy uses can be compared more accurately.
 */
class MagicTextTokenizer implements TextTokenizer
{
	public const float DEFAULT_CHARACTERS_PER_TOKEN = 4.5;

	public function tokenize(string $text): int
	{
		$character_count = mb_strlen($text);

		return (int) ceil($character_count / self::DEFAULT_CHARACTERS_PER_TOKEN);
	}
}