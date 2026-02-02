<?php

namespace Mateffy\Magic\Embeddings;


use Illuminate\Support\Str;
use Mateffy\Magic\Models\ModelCost;
use Mateffy\Magic\Models\Options\Organization;

abstract readonly class EmbeddingModel
{
    public function __construct(
        public Organization $organization,
        public string $model,
        public ?ModelCost $cost = null,
    ) {}

    public static function fromString(string $value): EmbeddingModel
    {
        $organization = Str::before($value, '/');
        $model = Str::after($value, '/');

        return match ($organization) {
            'openai' => match ($model) {
                OpenAIEmbeddings::TEXT_EMBEDDING_ADA_002 => OpenAIEmbeddings::text_ada_002(),
                OpenAIEmbeddings::TEXT_EMBEDDING_3_LARGE => OpenAIEmbeddings::text_3_large(),
                OpenAIEmbeddings::TEXT_EMBEDDING_3_SMALL => OpenAIEmbeddings::text_3_small(),
                default => new OpenAIEmbeddings(model: $model),
            },
            default => throw new \InvalidArgumentException("Unsupported organization: {$value}"),
        };
    }

    abstract public function get(string $input): EmbeddedData;
}

