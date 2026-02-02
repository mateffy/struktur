<?php

namespace Mateffy\Magic\Models\Providers;

use Closure;
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
use Mateffy\Magic\Exceptions\LLMException;
use Mateffy\Magic\Exceptions\UnknownInferenceException;
use Mateffy\Magic\Support\ApiTokens\TokenResolver;
use Mateffy\Magic\Models\Decoders\OpenAiResponseDecoder;
use Mateffy\Magic\Tools\InvokableTool;
use OpenAI\Client;

trait UsesOpenAiApi
{
    protected function getOpenAiApiKey(): string
    {
		return app(TokenResolver::class)->resolve('openai');
    }

    protected function getOpenAiOrganization(): ?string
    {
		return app(TokenResolver::class)->resolve('openai', 'organization_id');
    }

    protected function getOpenAiBaseUri(): ?string
    {
        return 'api.openai.com/v1';
    }

	protected function getSystemMessageRoleName(): string
	{
		if (Str::startsWith($this->model, 'o1')) {
			return 'user';
		}

		if ($this->organization->id === 'openai') {
			return 'developer';
		}

		return 'system';
	}

	protected function createClient(): Client
	{
		return \OpenAI::factory()
			->withApiKey($this->getOpenAiApiKey())
			->withOrganization($this->getOpenAiOrganization())
			->withBaseUri($this->getOpenAiBaseUri())
			->make();
	}

	protected function prepareMessages(array $messages): Collection
	{
		return collect($messages)
            ->flatMap(callback: function (Message $message) {
				$id = ($message instanceof ToolCallMessage || $message instanceof ToolResultMessage)
					? $message->call->id ?? null
					: null;

				return match ($message::class) {
					TextMessage::class => [
						[
							'role' => $message->role,
							'content' => $message->content,
						],
					],
					JsonMessage::class => [
						[
							'role' => $message->role,
							'content' => json_encode($message->data),
						],
					],
					ToolCallMessage::class => [
						[
							'role' => $message->role,
							'tool_calls' => [
								[
									'id' => $id,
									'type' => 'function',
									'function' => [
										'name' => $message->call->name,
										'arguments' => json_encode($message->call->arguments, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
									]
								]
							],
							'content' => json_encode($message->call->arguments),
							'tool_call_id' => $id
						],
					],
					ToolResultMessage::class => [
						[
							'role' => 'tool',
							'content' => $message->text(),
							'tool_call_id' => $id,
						],
					],
					Step::class => (function () use ($message) {
						$tools = collect($message->content)
							->filter(fn (ContentInterface $message) => $message instanceof ToolUse || $message instanceof ToolResult)
							->map(function (ContentInterface $message) {
								$id = $message->call->id ?? null;

								return match ($message::class) {
									ToolUse::class => [
										'role' => 'assistant',
										'tool_calls' => [
											[
												'id' => $id,
												'type' => 'function',
												'function' => [
													'name' => $message->call->name,
													'arguments' => json_encode($message->call->arguments, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
												]
											]
										],
										'content' => json_encode($message->call->arguments),
										'tool_call_id' => $id,
									],
									ToolResult::class => [
										'role' => 'tool',
										'content' => json_encode($message->output, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
										'tool_call_id' => $id,
									],
								};
							})
							->values();

						$content = collect($message->content)
							->filter(fn (ContentInterface $message) => !($message instanceof ToolUse || $message instanceof ToolResult))
							->values();

						return array_filter([
							...$tools,
							$content->isNotEmpty()
								? [
									'role' => $message->role,
									'content' => $content
										->map(fn (ContentInterface $message) => match ($message::class) {
											Text::class => [
												'type' => 'text',
												'text' => $message->text,
											],
											Image::class => [
												'type' => 'image_url',
												'image_url' => [
													'url' => "data:{$message->mime};base64,{$message->imageBase64}"
												]
											],
										})
										->values()
										->toArray(),
								]
								: null,
						]);
					})(),

					default => null,
				};
			})
            ->filter()
            ->values();
	}

	protected function prepareTools(array $tools): Collection
	{
		return collect($tools)
            ->map(fn (InvokableTool $function) => [
                'type' => 'function',
                'function' => [
                    'name' => $function->name(),
                    'description' => method_exists($function, 'description') ? $function->description() : "The {$function->name()} function",
                    'parameters' => $function->schema(),
                ]
            ])
			->values();
	}

    /**
     * @throws UnknownInferenceException
     * @throws LLMException
     */
    public function stream(Prompt $prompt, ?Closure $onMessageProgress = null, ?Closure $onMessage = null, ?Closure $onTokenStats = null, ?Closure $onDataPacket = null): MessageCollection
    {
		$cost = $this->getModelCost();
		$messages = $this->prepareMessages(messages: $prompt->messages());
        $tools = $this->prepareTools($prompt->tools());

		if ($system = $prompt->system()) {
			$messages->unshift([
				'role' => $this->getSystemMessageRoleName(),
				'content' => [
					[
						'type' => 'text',
						'text' => $system,
					]
				]
			]);
		}

		$rawToolChoice = $prompt->toolChoice();
		$toolChoice = match ($rawToolChoice) {
			ToolChoice::Auto => null,
			ToolChoice::Required => 'required',
			default => ['type' => 'function', 'function' => ['name' => $rawToolChoice]]
		};

		$data = array_filter([
			'model' => str($this->model)
				->after('openai/'),
			'messages' => $messages,
			'tools' => count($tools) > 0 ? $tools : null,
			'tool_choice' => count($tools) > 0 ? $toolChoice : null,
		]);

        try {
            $stream = $this->createClient()
                ->chat()
                ->createStreamed($data);

            $decoder = new OpenAiResponseDecoder(
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
        } catch (LLMException $e) {
            throw $e;
        } catch (\Throwable $e) {
            throw new UnknownInferenceException($e->getMessage(), previous: $e);
        }
    }

    public function send(Prompt $prompt): MessageCollection
    {
        // TODO: Implement send() method.
    }
}
