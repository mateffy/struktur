<?php

namespace Mateffy\Magic\Models;

use Illuminate\Support\Collection;
use Mateffy\Magic\Chat\MessageCollection;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Support\ApiTokens\TokenResolver;
use Mateffy\Magic\Models\Options\ChatGptOptions;
use Mateffy\Magic\Models\Options\ElElEmOptions;
use Mateffy\Magic\Models\Options\HasMaximumImageCount;
use Mateffy\Magic\Models\Options\Organization;
use Mateffy\Magic\Models\Providers\UsesOpenAiApi;

class Mistral extends ElElEm implements HasMaximumImageCount
{
	public const string MISTRAL_LARGE = 'mistral-large-latest';
    public const string MISTRAL_MEDIUM = 'mistral-medium-latest';
	public const string MISTRAL_SMALL = 'mistral-small-latest';
	public const string MISTRAL_SABA = 'mistral-saba-latest';

	public const string PIXTRAL_LARGE = 'pixtral-large-latest';
	public const string PIXTRAL_12B = 'pixtral-12b-2409';

	public const string CODESTRAL = 'codestral-latest';

	public const string MINISTRAL_3B = 'ministral-3b-latest';
	public const string MINISTRAL_8B = 'ministral-8b-latest';

	// Research models
	public const string MISTRAL_NEMO = 'open-mistral-nemo';
	public const string CODESTRAL_MAMBA = 'open-codestral-mamba';

    use UsesOpenAiApi;

    public function __construct(
        string $model,
        ElElEmOptions $options = new ChatGptOptions,
    ) {
        parent::__construct(
            organization: new Organization(
                id: 'mistral',
                name: 'Mistral',
                website: 'https://mistral.ai',
                privacyUsedForModelTraining: true,
                privacyUsedForAbusePrevention: true,
            ),
            model: $model,
            options: $options,
        );
    }

	public static function models(?string $prefix = 'mistral', ?string $prefixLabels = 'Mistral'): Collection
    {
        return static::prefixModels([
            static::MISTRAL_LARGE => 'Mistral Large',
            static::MISTRAL_MEDIUM => 'Mistral Medium',
			static::MISTRAL_SMALL => 'Mistral Small',
			static::PIXTRAL_LARGE => 'Pixtral Large',
			static::PIXTRAL_12B => 'Pixtral 12B',
			static::CODESTRAL => 'Codestral',
			static::MINISTRAL_3B => 'Ministral 3B',
			static::MINISTRAL_8B => 'Ministral 8B',
			static::MISTRAL_NEMO => 'Mistral Nemo (Research)',
			static::CODESTRAL_MAMBA => 'Codestral Mamba (Research)',
			static::MISTRAL_SABA => 'Mistral Saba',
        ], $prefix, $prefixLabels);
    }

    protected function getOpenAiApiKey(): string
    {
        return app(TokenResolver::class)->resolve('mistral');
    }

    protected function getOpenAiOrganization(): ?string
    {
        return null;
    }

    protected function getOpenAiBaseUri(): ?string
    {
        return 'https://api.mistral.ai/v1';
    }

    public function send(Prompt $prompt): MessageCollection
    {
        // TODO: Implement send() method.
    }


	/**
	 * Currently Mistral models are limited to 8 images per LLM call.
	 * https://docs.mistral.ai/capabilities/vision
	 */
	public function getMaximumImageCount(): int
	{
		return 8;
	}
}
