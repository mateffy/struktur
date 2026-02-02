<?php

namespace Mateffy\Magic\Models;

use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Mateffy\Magic\Models\Options\ElElEmOptions;
use Mateffy\Magic\Models\Options\HasMaximumTokenCount;
use Mateffy\Magic\Models\Options\Organization;

/**
 * @template T of ElElEmOptions
 */
abstract class ElElEm implements LLM, HasMaximumTokenCount
{
    public function __construct(
        public Organization $organization,
        public string $model,

        /** @var T $options */
        public ElElEmOptions $options,
    ) {}

    public function withOptions(array $data): static
    {
        $this->options = $this->options->withOptions($data);

        return $this;
    }

    public function getOrganization(): Organization
    {
        return $this->organization;
    }

    /**
     * @return T
     */
    public function getOptions(): ElElEmOptions
    {
        return $this->options;
    }

    public function getModelName(): string
    {
		return $this->model;
    }

	public function getModelLabel(): string
	{
		$models = static::models();

        return $models["{$this->organization->id}/{$this->model}"] ?? $this->model;
	}

    public function getModelCost(): ?ModelCost
    {
        return null;
    }

    public static function fromString(string $value): LLM
    {
        $organization = Str::before($value, '/');
        $model = Str::after($value, '/');

        return match ($organization) {
            'openrouter' => new OpenRouter(model: $model),
            'togetherai' => new TogetherAI(model: $model),
            'anthropic' => match ($model) {
                'claude-3-haiku' => new Anthropic(model: Anthropic::HAIKU),
                'claude-3-sonnet' => new Anthropic(model: Anthropic::SONNET),
                'claude-3-opus' => new Anthropic(model: Anthropic::OPUS),
                'claude-3.5-sonnet' => new Anthropic(model: Anthropic::SONNET_3_5),
                default => new Anthropic(model: $model),
            },
            'bedrock' => match ($model) {
                'claude-3-haiku' => new Bedrock(model: Bedrock::HAIKU),
                'claude-3-sonnet' => new Bedrock(model: Bedrock::SONNET),
                'claude-3-opus' => new Bedrock(model: Bedrock::OPUS),
                'claude-3.5-sonnet' => new Bedrock(model: Bedrock::SONNET_3_5),
                default => new Bedrock(model: $model),
            },
            'openai' => new OpenAI(model: $model),
            'google' => new Gemini(model: $model),
			'mistral' => new Mistral(model: $model),
            default => throw new \InvalidArgumentException("Invalid model type: {$value}"),
        };
    }

    public static function fromArray(array $data): ?LLM
    {
        if ($data['model'] ?? null === null) {
            throw new \InvalidArgumentException('Missing model key in model data');
        }

        return self::fromString($data['model'])
            ?->withOptions($data['options'] ?? []);
    }

    public static function id(string $organization, string $model): string
    {
        return "{$organization}/{$model}";
    }

    public static function model(string $model): static
    {
        return new static(
            model: $model,
            options: new ElElEmOptions,
        );
    }

    protected static function prefixModels(array|Collection $models, ?string $prefix = null, ?string $prefixLabels = null): Collection
    {
        return Collection::wrap($models)
            ->when($prefix, fn ($models) => $models->mapWithKeys(fn ($name, $key) => ["{$prefix}/{$key}" => $name]))
            ->when($prefixLabels, fn ($models) => $models->mapWithKeys(fn ($name, $key) => [$key => "$prefixLabels → {$name}"]));
    }

    public static function models(?string $prefix = 'togetherai', ?string $prefixLabels = 'TogetherAI'): Collection
    {
        return static::prefixModels([], $prefix, $prefixLabels);
    }

	public function getMaximumTokenCount(): int
	{
		return 32_000;
	}
}
