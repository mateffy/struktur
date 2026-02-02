<?php

namespace Mateffy\Magic\Models\Decoders;

use Gemini\Data\Content;
use Gemini\Data\GenerationConfig;
use Mateffy\Magic\Chat\Magic\LLM\Models\Decoders\Role;

class GeminiResponseDecoder extends BaseDecoder
{
	protected function client()
	{
		$apiKey = config('llm-magic.apis.gemini.token');

		assert($apiKey !== null, 'Gemini API key is not set');

		return \Gemini::client($apiKey);
	}

	public function process(): array
	{
		$client = $this->client();

		$client->generativeModel('gemini-2.0-flash-lite-preview-02-05')
			->withGenerationConfig(new GenerationConfig(
//				stopSequences: [],
//				maxOutputTokens: 100,
//				temperature: 0.5,
//				topP: 1,
//				topK: 40
			))
//			->withSafetySetting(new SafetySetting(
//				category: HarmCategory::HARM_CATEGORY_SEXUAL,
//				threshold: HarmBlockThreshold::BLOCK_LOW_AND_ABOVE
//			))
			->streamGenerateContent([
				Content::parse(part: 'The stories you write about what I have to say should be one line. Is that clear?'),
				Content::parse(part: 'Yes, I understand. The stories I write about your input should be one line long.', role: Role::MODEL)
			]);
	}
}