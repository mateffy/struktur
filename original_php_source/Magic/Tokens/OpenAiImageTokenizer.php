<?php

namespace Mateffy\Magic\Tokens;

class OpenAiImageTokenizer implements ImageTokenizer
{
	public function tokenize(?int $width, ?int $height): int
	{
		// We use the OpenAI method of calculating tokens for images. https://platform.openai.com/docs/guides/vision#calculating-costs
		// This will not be accurate for all LLM providers and can be improved in the future.

		$width ??= 2048;
		$height ??= 2048;

		// Step 1: Scale to fit within 2048x2048 while maintaining aspect ratio
		$maxSize = 2048;
		if ($width > $maxSize || $height > $maxSize) {
			$scale = $maxSize / max($width, $height);
			$width = (int) round($width * $scale);
			$height = (int) round($height * $scale);
		}

		// Step 2: Scale shortest side to at least 768px
		$minSize = 768;
		if (min($width, $height) > $minSize) {
			$scale = $minSize / min($width, $height);
			$width = (int) round($width * $scale);
			$height = (int) round($height * $scale);
		}

		// Step 3: Calculate the number of 512px tiles required
		$tiles = ceil($width / 512) * ceil($height / 512);

		// Step 4: Compute the final token cost
		return ceil(($tiles * 170) + 85);
	}
}