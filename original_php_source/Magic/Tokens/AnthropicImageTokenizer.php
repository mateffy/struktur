<?php

namespace Mateffy\Magic\Tokens;

class AnthropicImageTokenizer implements ImageTokenizer
{
	public function tokenize(?int $width, ?int $height): int
	{
		$width ??= 2048;
		$height ??= 2048;

		// Based on Anthropic's model: tokens = (width px * height px)/750
		// This will not be accurate for other LLMs but is good enough for now
		return (int) ($width * $height) / 750;
	}
}