<?php

namespace Mateffy\Magic\Models;

use Illuminate\Support\Collection;
use Mateffy\Magic\Models\Options\ElElEmOptions;
use Mateffy\Magic\Models\Options\Organization;
use Mateffy\Magic\Models\Providers\UsesAnthropicApi;

class Anthropic extends ElElEm
{
    use UsesAnthropicApi;

    public const HAIKU = 'claude-3-haiku-20240307';
	public const HAIKU_3_5 = 'claude-3-5-haiku-latest';

	public const SONNET = 'claude-3-sonnet-20240229';
	public const SONNET_3_5 = 'claude-3-5-sonnet-latest';
	public const SONNET_3_5_COMPUTER_USE = 'claude-3-5-sonnet-20241022';
	public const SONNET_3_7 = 'claude-3-7-sonnet-latest';

	public const OPUS = 'claude-3-opus-latest';


	public function __construct(
        string $model,
        ElElEmOptions $options = new ElElEmOptions,
    ) {
        parent::__construct(
            organization: new Organization(
                id: 'anthropic',
                name: 'Anthropic',
                website: 'https://anthropic.com',
                privacyUsedForModelTraining: true,
                privacyUsedForAbusePrevention: true,
            ),
            model: $model,
            options: $options,
        );
    }

    public function getModelCost(): ?ModelCost
    {
//		Model	Base Input Tokens	Cache Writes	Cache Hits	Output Tokens
//Claude 3.7 Sonnet	$3 / MTok	$3.75 / MTok	$0.30 / MTok	$15 / MTok
//Claude 3.5 Sonnet	$3 / MTok	$3.75 / MTok	$0.30 / MTok	$15 / MTok
//Claude 3.5 Haiku	$0.80 / MTok	$1 / MTok	$0.08 / MTok	$4 / MTok
//Claude 3 Haiku	$0.25 / MTok	$0.30 / MTok	$0.03 / MTok	$1.25 / MTok
//Claude 3 Opus	$15 / MTok	$18.75 / MTok	$1.50 / MTok	$75 / MTok
        return match ($this->model) {
            Anthropic::HAIKU => new ModelCost(
                inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(0.25),
                outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(1.25)
            ),
			Anthropic::HAIKU_3_5 => new ModelCost(
                inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(0.8),
                outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(4)
            ),
            Anthropic::SONNET,
            Anthropic::SONNET_3_5,
			Anthropic::SONNET_3_7 => new ModelCost(
                inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(3),
                outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(15)
            ),
            Anthropic::OPUS => new ModelCost(
                inputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(15),
                outputCentsPer1K: ModelCost::pricePerMillionToCentsPerThousands(75)
            ),
            default => null,
        };
    }

    public static function haiku(): Anthropic
    {
        return new Anthropic(
            model: Anthropic::HAIKU,
            options: new ElElEmOptions
        );
    }

    public static function sonnet(): Anthropic
    {
        return new Anthropic(
            model: Anthropic::SONNET,
            options: new ElElEmOptions
        );
    }

    public static function sonnet_3_5(): Anthropic
    {
        return new Anthropic(
            model: Anthropic::SONNET_3_5,
            options: new ElElEmOptions
        );
    }

    public static function sonnet_3_5_computer_use(): Anthropic
    {
        return new Anthropic(
            model: Anthropic::SONNET_3_5_COMPUTER_USE,
            options: new ElElEmOptions
        );
    }

    public static function opus(): Anthropic
    {
        return new Anthropic(
            model: Anthropic::OPUS,
            options: new ElElEmOptions
        );
    }

    public static function models(?string $prefix = 'anthropic', ?string $prefixLabels = 'Anthropic'): Collection
    {
        return static::prefixModels([
            static::HAIKU => 'Claude 3 Haiku',
            static::SONNET => 'Claude 3 Sonnet',
            static::OPUS => 'Claude 3 Opus',
            static::SONNET_3_5 => 'Claude 3.5 Sonnet',
        ], $prefix, $prefixLabels);
    }
}
