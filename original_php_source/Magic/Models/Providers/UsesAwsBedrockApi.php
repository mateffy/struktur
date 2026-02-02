<?php

namespace Mateffy\Magic\Models\Providers;

use Aws\BedrockRuntime\BedrockRuntimeClient;
use Closure;
use Mateffy\Magic\Chat\MessageCollection;
use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Chat\TokenStats;
use Mateffy\Magic\Chat\ToolChoice;
use Mateffy\Magic\Exceptions\InvalidRequest;
use Mateffy\Magic\Exceptions\TooManyTokensForModelRequested;
use Mateffy\Magic\Support\ApiTokens\TokenResolver;
use Mateffy\Magic\Models\Decoders\ClaudeResponseDecoder;
use Mateffy\Magic\Tools\InvokableTool;
use OpenAI\Responses\Chat\CreateResponse;
use Psr\Http\Message\StreamInterface;

trait UsesAwsBedrockApi
{
    protected function getApiToken(): string
    {
        return app(TokenResolver::class)->resolve('aws-bedrock');
    }

    /**
     * @throws InvalidRequest
     * @throws TooManyTokensForModelRequested
     */
    protected function createStreamedHttpRequest(Prompt $prompt): \Psr\Http\Message\StreamInterface
    {
        $config = [
            'inferenceConfig' => [
                'maxTokens' => $this->getOptions()->maxTokens,
            ],
            'modelId' => $this->getModelName(),
            'system' => [
                ['text' => $prompt->system()],
            ],
            'messages' => collect($prompt->messages())
                ->map(fn (Message $message) => $message->toArray())
                ->values()
                ->toArray(),
            'toolConfig' => [
                'tools' => collect($prompt->tools())
                    ->map(fn (InvokableTool $function) => [
                        'toolSpec' => [
                            'name' => $function->name(),
                            'description' => '',
                            'input_schema' => $function->schema(),
                        ],
                    ]),
            ],
        ];

		$rawToolChoice = $prompt->toolChoice();
		$toolChoice = match ($rawToolChoice) {
			ToolChoice::Auto => null,
			ToolChoice::Required => 'required',
			default => ['tool' => ['name' => $rawToolChoice]]
		};

		if ($toolChoice) {
			$config['toolChoice'] = $toolChoice;
		}

        $bedrockClient = new BedrockRuntimeClient([
            'region' => config('llm-magic.apis.aws.region', 'eu-central-1'),
            'version' => 'latest',
            'profile' => 'default',
        ]);
        $bedrockClient->converseStreamAsync($config);
    }

    public function stream(Prompt $prompt, ?Closure $onMessageProgress = null, ?Closure $onMessage = null, ?Closure $onTokenStats = null, ?Closure $onDataPacket = null): MessageCollection
    {
        $stream = $this->createStreamedHttpRequest($prompt);

        $cost = $this->getModelCost();

        $decoder = new ClaudeResponseDecoder(
            $stream,
            $onMessageProgress,
            $onMessage,
			$onDataPacket,
            onTokenStats: fn (TokenStats $stats) => $onTokenStats($cost
                    ? $stats->withCost($cost)
                    : $stats
            )
        );

        return $decoder->process();
    }

    protected function createHttpRequest(Prompt $prompt): StreamInterface|CreateResponse|null
    {
        throw new \Exception('Not implemented');
    }

    public function send(Prompt $prompt): MessageCollection
    {
        throw new \Exception('Not implemented');
    }
}
