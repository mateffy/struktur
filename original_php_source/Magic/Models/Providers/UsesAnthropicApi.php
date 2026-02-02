<?php

namespace Mateffy\Magic\Models\Providers;

use Closure;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Psr7\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Mateffy\Magic\Chat\MessageCollection;
use Mateffy\Magic\Chat\Messages\ToolCallMessage;
use Mateffy\Magic\Chat\Messages\ToolResultMessage;
use Mateffy\Magic\Chat\Messages\JsonMessage;
use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\Messages\Step;
use Mateffy\Magic\Chat\Messages\Step\Image;
use Mateffy\Magic\Chat\Messages\Step\ContentInterface;
use Mateffy\Magic\Chat\Messages\Step\Text;
use Mateffy\Magic\Chat\Messages\Step\ToolResult;
use Mateffy\Magic\Chat\Messages\Step\ToolUse;
use Mateffy\Magic\Chat\Messages\TextMessage;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Chat\TokenStats;
use Mateffy\Magic\Chat\ToolChoice;
use Mateffy\Magic\Exceptions\InvalidRequest;
use Mateffy\Magic\Exceptions\TooManyTokensForModelRequested;
use Mateffy\Magic\Support\ApiTokens\TokenResolver;
use Mateffy\Magic\Models\Decoders\ClaudeResponseDecoder;
use Mateffy\Magic\Tools\InvokableTool;

trait UsesAnthropicApi
{
    protected function getApiToken(): string
    {
        return app(TokenResolver::class)->resolve('anthropic');
    }

	protected function createClient(): Client
	{
		return new Client([
			'base_uri' => 'https://api.anthropic.com',
			'headers' => [
				'content-type' => 'application/json',
				'x-api-key' => $this->getApiToken(),
				'anthropic-version' => '2023-06-01',
			],
		]);
	}

	protected function prepareMessages(array $messages): Collection
	{
		return collect($messages)
			->map(fn(Message $message) => match ($message::class) {
				TextMessage::class => [
					'role' => $message->role, 'content' => $message->content,
				],

				JsonMessage::class => [
					'role' => $message->role, 'content' => json_encode($message->data),
				],

				ToolCallMessage::class => [
					'role' => $message->role, 'content' => [
						[
							'type' => 'tool_use', 'id' => $message->call->id ?? $message->call->name, 'name' => $message->call->name, 'input' => $message->call->arguments,
						],
					],
				],

				ToolResultMessage::class => [
					'role' => $message->role, 'content' => [
						[
							'type' => 'tool_result', 'tool_use_id' => $message->call->id ?? $message->call->name, 'content' => [
							['type' => 'text', 'text' => $message->text()],
						]
						],
					],
				],

				Step::class => [
					'role' => $message->role, 'content' => collect($message->content)
						->map(fn(ContentInterface $message) => match ($message::class) {
							Text::class => [
								'type' => 'text', 'text' => $message->text,
							],
							Image::class => [
								'type' => 'image', 'source' => [
									'type' => 'base64', 'media_type' => $message->mime, 'data' => $message->imageBase64,
								]
							],
							ToolUse::class => [
								'type' => 'tool_use', 'id' => $message->call->id, 'name' => $message->call->name, 'input' => $message->call->arguments,
							],
							ToolResult::class => [
								'type' => 'tool_result', 'tool_use_id' => $message->call->id, 'content' => json_encode($message->output),
							],
						})
						->toArray(),
				],

				default => null,
			})
			->filter()
			->values();
	}

	protected function prepareTools(array $tools): Collection
	{
		return collect($tools)
			->map(fn (InvokableTool $function, string|int $key) => [
			'name' => $function->name(),
				'description' => method_exists($function, 'description') ? $function->description() : '',
				'input_schema' => $function->schema(),
			])
			->values();
	}

    public function stream(Prompt $prompt, ?Closure $onMessageProgress = null, ?Closure $onMessage = null, ?Closure $onTokenStats = null, ?Closure $onDataPacket = null): MessageCollection
    {
        $options = $this->getOptions();
		$cost = $this->getModelCost();
		$messages = $this->prepareMessages($prompt->messages())->toArray();
		$tools = $this->prepareTools($prompt->tools())->toArray();

		$rawToolChoice = $prompt->toolChoice();
		$toolChoice = match ($rawToolChoice) {
			ToolChoice::Auto => null,
			ToolChoice::Required => ['type' => 'any'],
			default => ['type' => 'tool', 'name' => $rawToolChoice],
		};

        $data = array_filter([
            'model' => $this->getModelName(),
            'max_tokens' => $options->maxTokens,
            'system' => $prompt->system(),
            'messages' => $messages,
            'tools' => $tools,
			'tool_choice' => $toolChoice,
			'stream' => true,
        ]);

        try {
            $request = new Request('POST', '/v1/messages', [], json_encode($data));
            $response = $this->createClient()->send($request, ['stream' => true]);

			$stream = $response->getBody();

			$decoder = new ClaudeResponseDecoder(
				$stream,
				$onMessageProgress,
				$onMessage,
				$onDataPacket,
				onTokenStats: fn (TokenStats $stats) => $onTokenStats
					? $onTokenStats($cost
						? $stats->withCost($cost)
						: $stats
					)
					: $stats,
				json: method_exists($prompt, 'shouldParseJson') && $prompt->shouldParseJson()
			);

			return MessageCollection::make($decoder->process());
        } catch (ClientException $e) {
            $json = $e->getResponse()->getBody();
            $data = json_decode($json, true);

            if (Arr::has($data, 'error')) {
                $type = Arr::get($data, 'error.type');

                if ($type === 'invalid_request_error' && Str::startsWith(Arr::get($data, 'error.message'), 'max_tokens')) {
                    throw new TooManyTokensForModelRequested('Too many tokens: '.Arr::get($data, 'error.message'), previous: $e);
                }

				if ($type === 'invalid_request_error' && Str::startsWith(Arr::get($data, 'error.message'), 'Your credit balance is too low')) {
					throw new InvalidRequest('API error', Arr::get($data, 'error.message'), previous: $e);
				}

                if ($message = Arr::get($data, 'error.message')) {
                    throw new InvalidRequest('API error', $message, previous: $e);
                }
            }

            throw new InvalidRequest('API error', $e->getMessage(), previous: $e);
        } catch (GuzzleException $e) {
            throw new InvalidRequest('HTTP error', $e->getMessage(), previous: $e);
        }
    }

    public function send(Prompt $prompt): MessageCollection
    {
        throw new \Exception('Not implemented');
    }
}
