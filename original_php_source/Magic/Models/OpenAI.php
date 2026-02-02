<?php

namespace Mateffy\Magic\Models;

use Illuminate\Support\Collection;
use Mateffy\Magic\Models\Options\ChatGptOptions;
use Mateffy\Magic\Models\Options\ElElEmOptions;
use Mateffy\Magic\Models\Options\Organization;
use Mateffy\Magic\Models\Providers\UsesOpenAiApi;

class OpenAI extends ElElEm
{
    use UsesOpenAiApi;

    public function __construct(
        string $model,
        ElElEmOptions $options = new ChatGptOptions,
    ) {
        parent::__construct(
            organization: new Organization(
                id: 'openai',
                name: 'OpenAI',
                website: 'https://openai.com',
                privacyUsedForModelTraining: true,
                privacyUsedForAbusePrevention: true,
            ),
            model: $model,
            options: $options,
        );
    }

    public static function models(?string $prefix = 'openai', ?string $prefixLabels = 'OpenAI'): Collection
    {
        return static::prefixModels([
			'o1' => 'o1',
			'o1-pro' => 'o1 Pro',
			'o3-mini' => 'o3 Mini',
			'o3' => 'o3',
			'o4-mini' => 'o4 Mini',
			'gpt-4-turbo' => 'GPT-4 Turbo',
            'gpt-4o' => 'GPT-4o',
            'gpt-4o-mini' => 'GPT-4o Mini',
        ], $prefix, $prefixLabels);
    }

	public static function gpt_4o_mini(ElElEmOptions $options = new ChatGptOptions): OpenAI
	{
		return new OpenAI('gpt-4o-mini');
	}

	public static function gpt_4o(ElElEmOptions $options = new ChatGptOptions): OpenAI
	{
		return new OpenAI('gpt-4o');
	}

	public static function gpt_4_turbo(ElElEmOptions $options = new ChatGptOptions): OpenAI
	{
		return new OpenAI('gpt-4-turbo');
	}

	public static function o1_mini(ElElEmOptions $options = new ChatGptOptions): OpenAI
	{
		return new OpenAI('o1-mini');
	}

	public static function o1_preview(ElElEmOptions $options = new ChatGptOptions): OpenAI
	{
		return new OpenAI('o1-preview');
	}

	public function getModelCost(): ?ModelCost
	{
		return match ($this->model) {
			'o1' => new ModelCost(
				inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(15),
				outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(75)
			),
			'o1-pro' => new ModelCost(
				inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(3),
				outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(15)
			),
			'o3-mini' => new ModelCost(
				inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(0.8),
				outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(4)
			),
			'o3' => new ModelCost(
				inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(0.8),
				outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(4)
			),
			'o4-mini' => new ModelCost(
				inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(0.8),
				outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(4)
			),
			'gpt-4-turbo' => new ModelCost(
				inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(0.8),
				outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(4)
			),
			'gpt-4o' => new ModelCost(
				inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(0.8),
				outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(4)
			),
			'gpt-4o-mini' => new ModelCost(
				inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(0.8),
				outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(4)
			),
			default => null,
		};
	}
}