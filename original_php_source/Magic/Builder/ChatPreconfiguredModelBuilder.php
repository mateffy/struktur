<?php

namespace Mateffy\Magic\Builder;

use Mateffy\Magic;
use Mateffy\Magic\Builder\Concerns\HasArtifacts;
use Mateffy\Magic\Builder\Concerns\HasAttempts;
use Mateffy\Magic\Builder\Concerns\HasDebugger;
use Mateffy\Magic\Builder\Concerns\HasMessageCallbacks;
use Mateffy\Magic\Builder\Concerns\HasMessages;
use Mateffy\Magic\Builder\Concerns\HasModel;
use Mateffy\Magic\Builder\Concerns\HasPrompt;
use Mateffy\Magic\Builder\Concerns\HasSchema;
use Mateffy\Magic\Builder\Concerns\HasSystemPrompt;
use Mateffy\Magic\Builder\Concerns\HasTokenCallback;
use Mateffy\Magic\Builder\Concerns\HasTools;
use Mateffy\Magic\Chat\MessageCollection;
use Mateffy\Magic\Chat\Messages\ToolCallMessage;
use Mateffy\Magic\Chat\Messages\ToolResultMessage;
use Mateffy\Magic\Chat\Messages\Step;
use Mateffy\Magic\Chat\Messages\TextMessage;
use Mateffy\Magic\Chat\Signals\EndConversation;
use Mateffy\Magic\Chat\ToolChoice;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Exceptions\JsonSchemaValidationError;
use Mateffy\Magic\Tools\InvokableTool;

class ChatPreconfiguredModelBuilder
{
    use HasArtifacts;
	use HasAttempts;
	use HasDebugger;
    use HasMessages;
    use HasModel;
    use HasMessageCallbacks;
    use HasPrompt;
    use HasSchema;
    use HasSystemPrompt;
    use HasTokenCallback;
    use HasTools;

    public function build(): Prompt
    {
        if ($this->prompt instanceof Prompt) {
            return $this->prompt;
        }

        return new class($this) implements Prompt
        {
            public function __construct(protected ChatPreconfiguredModelBuilder $builder) {}

            public function system(): ?string
            {
                return $this->builder->systemPrompt ?? 'You are a helpful chatbot.';
            }

            public function messages(): array
            {
                $messages = MessageCollection::make();
                $current = [];
                $role = null;

                // We allow to pass a string to ->prompt() to make it easier to use. This is ignored if
                // ->messages() is used too.
                if (is_string($this->builder->prompt) && count($this->builder->messages) === 0) {
                    $messages->push(new Step(role: Prompt\Role::User, content: [
                        Step\Text::make($this->builder->prompt),
                    ]));
                } else {
                    foreach ($this->builder->messages as $message) {
                        if ($message instanceof Step && count($current) > 0) {
                            $messages->push(new Step(role: $role, content: $current));
                            $current = [];

                            $messages->push($message);

                            continue;
                        } else if ($message instanceof Step) {
                            $messages->push($message);

                            continue;
                        } else if ($role && $message->role !== $role) {
                            $messages->push(new Step(role: $role, content: $current));
                            $current = [];
                        }

                        $role = $message->role;
                        $current[] = match($message::class) {
                            TextMessage::class => Step\Text::make($message->content),
                            ToolCallMessage::class => Step\ToolUse::call($message->call),
                            ToolResultMessage::class => Step\ToolResult::output($message->call, $message->output),
                        };
                    }
                }

                if (count($current) > 0) {
                    $messages->push(new Step(role: $role, content: $current));
                }

                return $messages->all();
            }

            public function tools(): array
            {
                return array_values($this->builder->tools);
            }

            public function forceFunction(): ?InvokableTool
            {
                if (!$this->builder->toolChoice) {
                    return null;
                }

                return $this->builder->tools[$this->builder->toolChoice] ?? null;
            }

            public function shouldParseJson(): bool
            {
                return false;
            }

			public function toolChoice(): ToolChoice|string
			{
				return $this->builder->toolChoice;
			}
		};
    }


    public function stream(): MessageCollection
    {
		$self = $this;
        $prompt = $this->build();
		$debugger = $this->getDebugger();

        if ($debugger) {
            $debugger->onMessage(TextMessage::user($prompt->system()));

            foreach ($prompt->messages() as $message) {
                $debugger->onMessage($message);
            }
        }

        $messages = $this->model
			->stream(
				prompt: $prompt,
				onMessageProgress: function () use ($self, $debugger) {
					$args = func_get_args();

					if ($debugger) {
						$debugger->onMessageProgress(...$args);
					}

					if ($self->onMessageProgress) {
						($self->onMessageProgress)(...$args);
					}
				},
				onMessage: function () use ($self, $debugger) {
					$args = func_get_args();

					if ($debugger) {
						$debugger->onMessage(...$args);
					}

					if ($self->onMessage) {
						($self->onMessage)(...$args);
					}
				},
				onTokenStats: function () use ($self, $debugger) {
					$args = func_get_args();

					if ($debugger) {
						$debugger->onTokenStats(...$args);
					}

					if ($self->onTokenStats) {
						($self->onTokenStats)(...$args);
					}
				},
				onDataPacket: function () use ($self, $debugger) {
					$args = func_get_args();

					if ($debugger) {
						$debugger->onDataPacket(...$args);
					}
				},
			);

        return $this->handleMessages($messages);
    }

    public function send(): MessageCollection
    {
        $prompt = $this->build();

        return MessageCollection::make($this->model->send($prompt));
    }

    public function handleMessages(MessageCollection $messages, bool $ignoreInterrupts = false): MessageCollection
    {
        $continue = true;

        foreach ($messages as $message) {
            $this->addMessage($message);

            if ($message instanceof ToolCallMessage) {
                if ($fn = $this->tools[$message->call->name] ?? null) {
                    /** @var InvokableTool $fn */

                    try {
						$message->call->arguments = $fn->validate($message->call->arguments);

						if (!$ignoreInterrupts && $this->shouldInterrupt && ($this->shouldInterrupt)($message->call)) {
							return MessageCollection::make([$message]);
						}

                        $output = $fn->execute($message->call);

                        if ($output instanceof ToolResultMessage) {
                            $outputMessage = $output;
                        } else if ($output instanceof EndConversation) {
                            $outputMessage = ToolResultMessage::end(call: $message->call, output: $output->getOutput());
                        } else if ($output instanceof Step) {
                            $outputMessage = $output;
                        } else {
                            $outputMessage = ToolResultMessage::output(call: $message->call, output: $output);
                        }

						// If we make it to this point, we consider whatever went on successful so we can reset the attempt counter
						$this->resetAttempts();
					} catch (JsonSchemaValidationError $e) {
						// We use one attempt
						$this->useAttempt();

						$outputMessage = ToolResultMessage::error(call: $message->call, message: $e->getValidationErrorsAsJson());

                        if ($this->onToolError) {
                            ($this->onToolError)($e);
                        }
					} catch (\Throwable $e) {
						// We use one attempt
						$this->useAttempt();

                        $outputMessage = ToolResultMessage::error(call: $message->call, message: $e->getMessage());

                        if ($this->onToolError) {
                            ($this->onToolError)($e);
                        }
                    }

                    $messages->push($outputMessage);

                    if ($this->onMessageProgress) {
                        ($this->onMessageProgress)($outputMessage);
                    }

                    if ($this->onMessage) {
                        ($this->onMessage)($outputMessage);
                    }

                    $this->addMessage($outputMessage);

                    if (property_exists($outputMessage, 'endConversation') && $outputMessage->endConversation) {
                        $continue = false;
                    }
                }
            }
        }

		$lastMessageWasFunctionOutput = $messages->last() instanceof ToolResultMessage;
		$lastMessageWasEndConversation = $lastMessageWasFunctionOutput && $messages->last()->endConversation;
		$hasRunOutOfAttempts = $this->attemptsLeft <= 0;

		// Immediately continue if the last message was a function output, it was not an end conversation signal and we haven't run out of attempts
        if ($continue && $lastMessageWasFunctionOutput && !$lastMessageWasEndConversation && !$hasRunOutOfAttempts) {
            return MessageCollection::make([
                ...$messages,
                ...$this->stream()
            ]);
        }

        return $messages;
    }
}
