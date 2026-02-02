<?php

namespace Mateffy\Magic\Models;

use Illuminate\Support\Collection;
use Mateffy\Magic\Chat\MessageCollection;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Support\ApiTokens\TokenResolver;
use Mateffy\Magic\Models\Options\ChatGptOptions;
use Mateffy\Magic\Models\Options\ElElEmOptions;
use Mateffy\Magic\Models\Options\Organization;
use Mateffy\Magic\Models\Providers\UsesOpenAiApi;

class Gemini extends ElElEm
{
	public const string GEMINI_1_5_FLASH = 'gemini-1.5-flash';
	public const string GEMINI_1_5_FLASH_8B = 'gemini-1.5-flash-8b';
	public const string GEMINI_1_5_PRO = 'gemini-1.5-pro';
	public const string GEMINI_2_0_FLASH = 'gemini-2.0-flash';
	public const string GEMINI_2_0_FLASH_LITE = 'gemini-2.0-flash-lite';

	// Experimental models
	public const string GEMINI_2_5_FLASH_PREVIEW = 'gemini-2.5-flash-preview-04-17';
	public const string GEMINI_2_5_PRO_PREVIEW = 'gemini-2.5-pro-preview-03-25';
	public const string GEMINI_2_5_PRO_EXPERIMENTAL = 'gemini-2.5-pro-exp-03-25';
    public const string GEMINI_2_5_FLASH_LITE = 'gemini-2.5-flash-lite';
    public const string GEMINI_2_5_FLASH = 'gemini-2.5-flash';
    public const string GEMINI_2_5_PRO = 'gemini-2.5-pro';

	// Deprecated models

    use UsesOpenAiApi;

    public function __construct(
        string $model,
        ElElEmOptions $options = new ChatGptOptions,
    ) {
        parent::__construct(
            organization: new Organization(
                id: 'google',
                name: 'Google',
                website: 'https://google.com',
                privacyUsedForModelTraining: true,
                privacyUsedForAbusePrevention: true,
            ),
            model: $model,
            options: $options,
        );
    }

	public static function models(?string $prefix = 'google', ?string $prefixLabels = 'Google'): Collection
    {
        return static::prefixModels([
            static::GEMINI_1_5_FLASH => 'Gemini 1.5 Flash',
			static::GEMINI_2_0_FLASH => 'Gemini 2.0 Flash',
            static::GEMINI_2_0_FLASH_LITE => 'Gemini 2.0 Flash Lite',
            static::GEMINI_2_5_FLASH_LITE => 'Gemini 2.5 Flash Lite',
            static::GEMINI_2_5_FLASH => 'Gemini 2.5 Flash',
            static::GEMINI_2_5_PRO => 'Gemini 2.5 Pro',
        ], $prefix, $prefixLabels);
    }

    protected function getOpenAiApiKey(): string
    {
        return app(TokenResolver::class)->resolve('google');
    }

    protected function getOpenAiOrganization(): ?string
    {
        return null;
    }

    protected function getOpenAiBaseUri(): ?string
    {
        return 'generativelanguage.googleapis.com/v1beta/openai';
    }

    public function send(Prompt $prompt): MessageCollection
    {
        // TODO: Implement send() method.
    }

    public static function flash(ElElEmOptions $options = new ChatGptOptions): static
    {
        return static::flash_2($options);
    }

	public static function flash_2(ElElEmOptions $options = new ChatGptOptions): static
	{
		return new static(
			model: self::GEMINI_2_0_FLASH,
			options: $options,
		);
	}

	public static function flash_2_lite(ElElEmOptions $options = new ChatGptOptions): static
	{
		return new static(
			model: self::GEMINI_2_0_FLASH_LITE,
			options: $options,
		);
	}

	public static function flash_1_5(ElElEmOptions $options = new ChatGptOptions): static
	{
		return new static(
			model: self::GEMINI_1_5_FLASH,
			options: $options,
		);
	}

	public static function flash_2_5_flash_preview(ElElEmOptions $options = new ChatGptOptions): static
	{
		return new static(
			model: self::GEMINI_2_5_FLASH_PREVIEW,
			options: $options,
		);
	}

	public static function flash_2_5_flash(ElElEmOptions $options = new ChatGptOptions): static
	{
		return self::flash_2_5_flash_preview($options);
	}

	public function flash_2_5_pro_preview(ElElEmOptions $options = new ChatGptOptions): static
	{
		return new static(
			model: self::GEMINI_2_5_PRO_PREVIEW,
			options: $options,
		);
	}

	public function flash_2_5_pro_experimental(ElElEmOptions $options = new ChatGptOptions): static
	{
		return new static(
			model: self::GEMINI_2_5_PRO_EXPERIMENTAL,
			options: $options,
		);
	}

	public function flash_2_5_pro(ElElEmOptions $options = new ChatGptOptions): static
	{
		return self::flash_2_5_pro_experimental($options);
	}

	public function getModelCost(): ?ModelCost
	{
		return match ($this->model) {
			self::GEMINI_1_5_FLASH => ModelCost::withPricePerMillion(inputPricePerMillion: 0.15, outputPricePerMillion: 0.6),
			self::GEMINI_1_5_FLASH_8B => ModelCost::withPricePerMillion(inputPricePerMillion: 0.075, outputPricePerMillion: 0.3),
			self::GEMINI_1_5_PRO => ModelCost::withPricePerMillion(inputPricePerMillion: 2.5, outputPricePerMillion: 10),
			self::GEMINI_2_0_FLASH => ModelCost::withPricePerMillion(inputPricePerMillion: 0.1, outputPricePerMillion: 0.4),
			self::GEMINI_2_0_FLASH_LITE => ModelCost::withPricePerMillion(inputPricePerMillion: 0.075, outputPricePerMillion: 0.3),
			self::GEMINI_2_5_FLASH_PREVIEW => ModelCost::withPricePerMillion(inputPricePerMillion: 0.15, outputPricePerMillion: 0.6),
			self::GEMINI_2_5_PRO_PREVIEW => ModelCost::withPricePerMillion(inputPricePerMillion: 1.25, outputPricePerMillion: 5),
			self::GEMINI_2_5_PRO_EXPERIMENTAL => ModelCost::withPricePerMillion(inputPricePerMillion: 1.25, outputPricePerMillion: 5),
			default => null,
		};
	}
}


//Skip to main content
//ai.google.dev uses cookies from Google to deliver and enhance the quality of its services and to analyze traffic. Learn more.
//
//Understood
//Google AI for Developers
//Models
//
//Solutions
//Code assistance
//Showcase
//Community
//Search
///
//
//
//English
//Sign in
//Gemini API docs
//API Reference
//Cookbook
//
//Introducing Gemini 2.5 Flash, Veo 2, and updates to the Live API Learn more
//Home
//Gemini API
//Models
//Gemini Developer API Pricing
//
//
//The Gemini API "free tier" is offered through the API service with lower rate limits for testing purposes. Google AI Studio usage is completely free in all available countries. The Gemini API "paid tier" comes with higher rate limits, additional features, and different data handling.
//
//Upgrade to the Paid Tier
//Gemini 2.5 Flash Preview
//Try it in Google AI Studio
//
//Our first hybrid reasoning model which supports a 1M token context window and has thinking budgets.
//
//Preview models may change before becoming stable and have more restrictive rate limits.
//
//Free Tier	Paid Tier, per 1M tokens in USD
//Input price	Free of charge	$0.15 (text / image / video)
//$1.00 (audio)
//Output price	Free of charge	Non-thinking: $0.60
//Thinking: $3.50
//Context caching price	Coming soon!	Coming soon!
//Context caching (storage)	Coming soon!	Coming soon!
//Grounding with Google Search	Free of charge, up to 500 RPD	1,500 RPD (free), then $35 / 1,000 requests
//Used to improve our products	Yes	No
//Gemini 2.5 Pro Preview
//Try it in Google AI Studio
//
//Our state-of-the-art multipurpose model, which excels at coding and complex reasoning tasks.
//
//Preview models may change before becoming stable and have more restrictive rate limits.
//
//Free Tier	Paid Tier, per 1M tokens in USD
//Input price	Free of charge, use "gemini-2.5-pro-exp-03-25"	$1.25, prompts <= 200k tokens
//$2.50, prompts > 200k tokens
//Output price (including thinking tokens)	Free of charge, use "gemini-2.5-pro-exp-03-25"	$10.00, prompts <= 200k tokens
//$15.00, prompts > 200k
//Context caching price	Not available	$0.31, prompts <= 200k tokens
//$0.625, prompts > 200k
//$4.50 / 1,000,000 tokens per hour
//Grounding with Google Search	Free of charge, up to 500 RPD	1,500 RPD (free), then $35 / 1,000 requests
//Used to improve our products	Yes	No
//Gemini 2.0 Flash
//Try it in Google AI Studio
//
//Our most balanced multimodal model with great performance across all tasks, with a 1 million token context window, and built for the era of Agents.
//
//Free Tier	Paid Tier, per 1M tokens in USD
//Input price	Free of charge	$0.10 (text / image / video)
//$0.70 (audio)
//Output price	Free of charge	$0.40
//Context caching price	Free of charge	$0.025 / 1,000,000 tokens (text/image/video)
//$0.175 / 1,000,000 tokens (audio)
//Context caching (storage)	Free of charge, up to 1,000,000 tokens of storage per hour	$1.00 / 1,000,000 tokens per hour
//Tuning price	Not available	Not available
//Grounding with Google Search	Free of charge, up to 500 RPD	1,500 RPD (free), then $35 / 1,000 requests
//Live API	Free of charge	Input: $0.35 (text), $2.10 (audio / image [video])
//Output: $1.50 (text), $8.50 (audio)
//Used to improve our products	Yes	No
//Gemini 2.0 Flash-Lite
//Try it in Google AI Studio
//
//Our smallest and most cost effective model, built for at scale usage.
//
//Free Tier	Paid Tier, per 1M tokens in USD
//Input price	Free of charge	$0.075
//Output price	Free of charge	$0.30
//Context caching price	Not available	Not available
//Context caching (storage)	Not available	Not available
//Tuning price	Not available	Not available
//Grounding with Google Search	Not available	Not available
//Used to improve our products	Yes	No
//Imagen 3
//Try it in ImageFX
//
//Our state-of-the-art image generation model, available to developers on the paid tier of the Gemini API.
//
//Free Tier	Paid Tier, per Image in USD
//Image price	Not available	$0.03
//Used to improve our products	Yes	No
//Veo 2
//Try the API
//
//Our state-of-the-art video generation model, available to developers on the paid tier of the Gemini API.
//
//Free Tier	Paid Tier, per second in USD
//Video price	Not available	$0.35
//Used to improve our products	Yes	No
//Gemma 3
//Try Gemma 3
//
//Our lightweight, state-of the art, open model built from the same technology that powers our Gemini models.
//
//Free Tier	Paid Tier, per 1M tokens in USD
//Input price	Free of charge	Not available
//Output price	Free of charge	Not available
//Context caching price	Free of charge	Not available
//Context caching (storage)	Free of charge	Not available
//Tuning price	Not available	Not available
//Grounding with Google Search	Not available	Not available
//Used to improve our products	Yes	No
//Gemini 1.5 Flash
//Try it in Google AI Studio
//
//Our fastest multimodal model with great performance for diverse, repetitive tasks and a 1 million token context window.
//
//Free Tier	Paid Tier, per 1M tokens in USD
//Input price	Free of charge	$0.075, prompts <= 128k tokens
//$0.15, prompts > 128k tokens
//Output price	Free of charge	$0.30, prompts <= 128k tokens
//$0.60, prompts > 128k tokens
//Context caching price	Free of charge, up to 1 million tokens of storage per hour	$0.01875, prompts <= 128k tokens
//$0.0375, prompts > 128k tokens
//Context caching (storage)	Free of charge	$1.00 per hour
//Tuning price	Token prices are the same for tuned models
//Tuning service is free of charge.	Token prices are the same for tuned models
//Tuning service is free of charge.
//Grounding with Google Search	Not available	$35 / 1K grounding requests
//Used to improve our products	Yes	No
//Gemini 1.5 Flash-8B
//Try it in Google AI Studio
//
//Our smallest model for lower intelligence use cases, with a 1 million token context window.
//
//Free Tier	Paid Tier, per 1M tokens in USD
//Input price	Free of charge	$0.0375, prompts <= 128k tokens
//$0.075, prompts > 128k tokens
//Output price	Free of charge	$0.15, prompts <= 128k tokens
//$0.30, prompts > 128k tokens
//Context caching price	Free of charge, up to 1 million tokens of storage per hour	$0.01, prompts <= 128k tokens
//$0.02, prompts > 128k tokens
//Context caching (storage)	Free of charge	$0.25 per hour
//Tuning price	Token prices are the same for tuned models
//Tuning service is free of charge.	Token prices are the same for tuned models
//Tuning service is free of charge.
//Grounding with Google Search	Not available	$35 / 1K grounding requests
//Used to improve our products	Yes	No
//Gemini 1.5 Pro
//Try it in Google AI Studio
//
//Our highest intelligence Gemini 1.5 series model, with a breakthrough 2 million token context window.
//
//Free Tier	Paid Tier, per 1M tokens in USD
//Input price	Free of charge	$1.25, prompts <= 128k tokens
//$2.50, prompts > 128k tokens
//Output price	Free of charge	$5.00, prompts <= 128k tokens
//$10.00, prompts > 128k tokens
//Context caching price	Not available	$0.3125, prompts <= 128k tokens
//$0.625, prompts > 128k tokens
//Context caching (storage)	Not available	$4.50 per hour
//Tuning price	Not available	Not available
//Grounding with Google Search	Not available	$35 / 1K grounding requests
//Used to improve our products	Yes	No
//Text Embedding 004
//Our state-of-the-art text embedding model.
//
//Free Tier	Paid Tier, per 1M tokens in USD
//Input price	Free of charge	Not available
//Output price	Free of charge	Not available
//Tuning price	Not available	Not available
//Used to improve our products	Yes	No
//[*] Google AI Studio usage is free of charge in all available regions. See Billing FAQs for details.
//
//[**] Prices may differ from the prices listed here and the prices offered on Vertex AI. For Vertex prices, see the Vertex AI pricing page.
//
//[***] If you are using dynamic retrieval to optimize costs, only requests that contain at least one grounding support URL from the web in their response are charged for Grounding with Google Search. Costs for Gemini always apply. Rate limits are subject to change.
//
//Except as otherwise noted, the content of this page is licensed under the Creative Commons Attribution 4.0 License, and code samples are licensed under the Apache 2.0 License. For details, see the Google Developers Site Policies. Java is a registered trademark of Oracle and/or its affiliates.
//
//Last updated 2025-04-21 UTC.
//
//Terms
//Privacy
//
//English
