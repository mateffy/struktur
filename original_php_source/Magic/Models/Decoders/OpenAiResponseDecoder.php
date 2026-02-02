<?php

namespace Mateffy\Magic\Models\Decoders;

use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Chat\Messages\ToolCallMessage;
use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\Messages\PartialMessage;
use Mateffy\Magic\Chat\Messages\TextMessage;
use Mateffy\Magic\Chat\Prompt\Role;
use Mateffy\Magic\Chat\TokenStats;
use Mateffy\Magic\Support\PartialJson;
use OpenAI\Responses\Chat\CreateStreamedResponse;
use OpenAI\Responses\Chat\CreateStreamedResponseChoice;
use OpenAI\Responses\StreamResponse;

class OpenAiResponseDecoder implements Decoder
{
    public const CHUNK_SIZE = 512;

    /**
     * @var Message[]
     */
    protected array $messages = [];

    public ?int $inputTokens = null;

    public ?int $outputTokens = null;

    public function __construct(
        protected StreamResponse $response,
        /**
         * @var \Closure(PartialMessage): void
         */
        protected ?\Closure $onMessageProgress = null,

        /**
         * @var \Closure(Message): void
         */
        protected ?\Closure $onMessage = null,

		/**
		 * @var \Closure(array): void
		 */
		protected ?\Closure $onDataPacket = null,

        /**
         * @var \Closure(TokenStats): void
         */
        protected ?\Closure $onTokenStats = null,

        /**
         * @var \Closure(TokenStats): void
         */
        protected ?\Closure $onEnd = null,

        /**
         * @var bool
         */
        protected bool $json = true,
    ) {}

    public function process(): array
    {
        $unfinished = null;

        /** @var ?PartialMessage $message */
        $message = null;

        $pushMessage = function () use (&$message) {
            $this->messages[] = $message;

            if ($this->onMessage) {
                ($this->onMessage)($message);
            }

            $message = null;
        };

        /** @var CreateStreamedResponseChoice[] $lastResponse */
        $choices = [];

        foreach($this->response as $response){
            /**
             * @var CreateStreamedResponse $response
             */
            foreach ($response->choices as $choice) {
				if ($this->onDataPacket) {
					($this->onDataPacket)($choice->toArray());
				}

                $delta = $choice->delta;
                $choices[] = $delta;

                // End the previous message, if one exists.
				// Edge case: a final \n is sent by the Gemini API to signal the end of the conversation, but it includes the role.
				// It will however set the finishReason to "stop" as well, so we still add the "\n" to the last message.
                if ($delta->role !== null && $message !== null && $choice->finishReason === null) {
                    $pushMessage();
                }

                if ($delta->role !== null && $message === null) {
                    $toolCall = $delta->toolCalls[0] ?? null;

                    $message = $toolCall !== null
                        ? new ToolCallMessage(
                            role: Role::Assistant,
                            call: new ToolCall(
                                name: $toolCall->function->name,
                                arguments: PartialJson::parse($toolCall->function->arguments) ?? [],
                                id: $toolCall->id,
                            ),
                            partial: $toolCall->function->arguments ?? ''
                        )
                        : TextMessage::fromChunk($delta->content ?? '');
                } elseif ($message && $delta->content !== null) {
                    $message->append($delta->content);

                    if ($this->onMessageProgress) {
                        ($this->onMessageProgress)($message);
                    }
                } else if ($message instanceof ToolCallMessage && $toolCall = $delta->toolCalls[0] ?? null) {
                    $message->append($toolCall->function->arguments);

                    if ($this->onMessageProgress) {
                        ($this->onMessageProgress)($message);
                    }
                } else if ($message instanceof TextMessage && empty($message->content) && isset($delta->toolCalls[0])) {
					// Edge case: the API will start an empty text message right before a tool call

					$toolCall = $delta->toolCalls[0];

					$message = new ToolCallMessage(
						role: Role::Assistant,
						call: new ToolCall(
							name: $toolCall->function->name,
							arguments: PartialJson::parse($toolCall->function->arguments) ?? [],
							id: $toolCall->id,
						),
						partial: $toolCall->function->arguments ?? ''
					);
				}
            }
        }

        if ($message !== null) {
            $pushMessage();
        }

        return $this->messages;
    }
}
