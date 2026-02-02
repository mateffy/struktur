<?php

namespace Mateffy\Magic\Models\Options;

class ChatGptOptions extends ElElEmOptions
{
    public function __construct(
        int $maxTokens = ElElEmOptions::DEFAULT_MAX_TOKENS,
        public ?float $temperature = null,
        public ?float $topP = null
    ) {
        parent::__construct(maxTokens: $maxTokens);
    }

    public function withOptions(array $data): static
    {
        return new static(
            maxTokens: $data['maxTokens'] ?? $this->maxTokens,
            temperature: $data['temperature'] ?? $this->temperature,
            topP: $data['topP'] ?? $this->topP,
        );
    }
}
