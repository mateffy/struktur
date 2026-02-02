<?php

namespace Mateffy\Magic\Models;

use Mateffy\Magic\Chat\MessageCollection;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Support\ApiTokens\TokenResolver;
use Mateffy\Magic\Models\Options\ChatGptOptions;
use Mateffy\Magic\Models\Options\ElElEmOptions;
use Mateffy\Magic\Models\Options\Organization;
use Mateffy\Magic\Models\Providers\UsesOpenAiApi;

class DeepSeek extends ElElEm
{
    use UsesOpenAiApi;

    public function __construct(
        string $model,
        ElElEmOptions $options = new ChatGptOptions,
    ) {
        parent::__construct(
            organization: new Organization(
                id: 'deepseek',
                name: 'DeepSeek',
                website: 'https://deepseek.com',
                privacyUsedForModelTraining: true,
                privacyUsedForAbusePrevention: true,
            ),
            model: $model,
            options: $options,
        );
    }

    protected function getOpenAiApiKey(): string
    {
        return app(TokenResolver::class)->resolve('deepseek');
    }

    protected function getOpenAiOrganization(): ?string
    {
        return null;
    }

    protected function getOpenAiBaseUri(): ?string
    {
        return 'api.deepseek.com';
    }

    public function send(Prompt $prompt): MessageCollection
    {
        // TODO: Implement send() method.
    }

    public static function chat(): static
    {
        return new static(
            model: 'deepseek-chat',
            options: new ChatGptOptions,
        );
    }
}
