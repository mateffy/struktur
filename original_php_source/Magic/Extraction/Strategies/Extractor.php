<?php

namespace Mateffy\Magic\Extraction\Strategies;

use Closure;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\SerializableClosure\Serializers\Native;
use Mateffy\Magic;
use Mateffy\Magic\Chat\ActorTelemetry;
use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\Messages\TextMessage;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Chat\Prompt\Role;
use Mateffy\Magic\Chat\TokenStats;
use Mateffy\Magic\Extraction\ArtifactBatcher;
use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\ContextOptions;
use Mateffy\Magic\Models\LLM;

abstract class Extractor implements Strategy
{
	protected ?TokenStats $totalTokenStats = null;

    public function __construct(
		public LLM $llm,
		public ContextOptions $contextOptions,
        public ?string $outputInstructions,
        public array $schema,
		public int $chunkSize,

		/** @var ?Closure(array): void $onDataProgress */
        protected null|Native|Closure $onDataProgress,

        /** @var null|Native|Closure(TokenStats): void $onTokenStats */
        protected null|Native|Closure $onTokenStats = null,

        /** @var null|Native|Closure(Message): void $onMessageProgress */
        protected null|Native|Closure $onMessageProgress = null,

        /** @var null|Native|Closure(Message, string): void $onMessage */
        protected null|Native|Closure $onMessage = null,

        /** @var null|Native|Closure(ActorTelemetry): void $onActorTelemetry */
        protected null|Native|Closure $onActorTelemetry = null,

		/** Provide some data that a strategy could use to get started with, if it exists. */
		public ?array $initialData = null,
    ) {}

	/**
	 * @param ?Closure(array $data): void $onDataProgress
	 * @param ?Closure(TokenStats $tokenStats): void $onTokenStats
	 * @param ?Closure(Message $message): void $onMessageProgress
	 * @param ?Closure(Message $message, string $threadId): void $onMessage
	 * @param ?Closure(ActorTelemetry $telemetry): void $onActorTelemetry
	 */
	public static function make(
		LLM $llm,
		ContextOptions $contextOptions,
		?string $outputInstructions,
		array $schema,
		int $chunkSize,
		?Closure $onDataProgress,
		?Closure $onTokenStats = null,
		?Closure $onMessageProgress = null,
		?Closure $onMessage = null,
		?Closure $onActorTelemetry = null,
		?array $initialData = null,
	): static {
		return new static(
			llm: $llm,
			contextOptions: $contextOptions,
			outputInstructions: $outputInstructions,
			schema: $schema,
			chunkSize: $chunkSize,
			onDataProgress: $onDataProgress,
			onTokenStats: $onTokenStats,
			onMessageProgress: $onMessageProgress,
			onMessage: $onMessage,
			onActorTelemetry: $onActorTelemetry,
			initialData: $initialData,
		);
	}

	abstract public function run(array $artifacts): array;

	/**
	 * Log some telemetry data about the current actor running, so we know some more info about the current extraction.
	 */
	protected function createActorThread(LLM $llm, Prompt $prompt): string
	{
        $threadId = Str::uuid()->toString();

        if ($this->onActorTelemetry) {
            ($this->onActorTelemetry)(
                ActorTelemetry::fromLLM(
                    id: $threadId,
                    llm: $llm,
                    prompt: $prompt,
                )
            );
        }

		$this->logUserMessages(prompt: $prompt, threadId: $threadId);

		return $threadId;
	}

	/**
	 * We pass all the input messages through the callback to have them displayed in the run page.
	 */
	protected function logUserMessages(Prompt $prompt, string $threadId): void
	{
        if ($this->onMessage) {
            ($this->onMessage)(new TextMessage(role: Role::System, content: $prompt->system()), $threadId);

            foreach ($prompt->messages() as $message) {
                ($this->onMessage)($message, $threadId);
            }
        }
	}

	protected function logMessage(Message $message, string $threadId): void
	{
		if ($this->onMessage) {
			($this->onMessage)($message, $threadId);
		}
	}

	protected function logMessageProgress(Message $message): void
	{
		if ($this->onMessageProgress) {
			($this->onMessageProgress)($message);
		}
	}

	protected function logDataProgressFromMessage(Message $message): void
	{
		if ($data = $message->toArray()['data'] ?? null) {
			$this->logDataProgress(data: $data);
		}
	}

	protected function logDataProgress(?array $data): void
	{
		if ($data && $this->onDataProgress) {
			($this->onDataProgress)($data);
		}
	}

	protected function logTokenStats(?TokenStats $tokenStats): void
	{
		if (!$tokenStats) {
			return;
		}

		$this->totalTokenStats = $this->totalTokenStats?->add($tokenStats) ?? $tokenStats;

		if ($this->onTokenStats) {
			($this->onTokenStats)($this->totalTokenStats);
		}
	}

	protected function send(string $threadId, LLM $llm, Prompt $prompt, bool $logDataProgress = true): ?array
	{
		$response = Magic::chat()
            ->model($llm)
            ->prompt($prompt)
            ->onMessageProgress(function (Message $message) use ($logDataProgress) {
				if ($logDataProgress) {
					$this->logDataProgressFromMessage(message: $message);
				}

                $this->logMessageProgress(message: $message);
            })
            ->onMessage(function (Message $message) use ($threadId, $logDataProgress) {
				if ($logDataProgress) {
					$this->logDataProgressFromMessage(message: $message);
				}

                $this->logMessage(message: $message, threadId: $threadId);
            })
            ->onTokenStats(function (TokenStats $tokenStats) use (&$lastTokenStats) {
                $lastTokenStats = $tokenStats;

                $this->logTokenStats(tokenStats: $lastTokenStats);
            })
            ->stream();

        $data = $response->lastData();

		if ($data && $logDataProgress) {
			$this->logDataProgress(data: $data);
		}

		if (is_string($data)) {
			Log::critical("Received data is a string", ['data' => $data]);
		}

		return $data;
	}

	/**
	 * Batch the artifacts into smaller chunks to avoid hitting the token limit.
	 *
	 * @param Artifact[] $artifacts
	 * @return Collection<Collection<Artifact>>
	 */
	protected function getBatches(array $artifacts): Collection
	{
		return ArtifactBatcher::batch(
			artifacts: $artifacts,
			options: $this->contextOptions,
			maxTokens: $this->chunkSize,
            maxImages: 8,
			llm: $this->llm
		);
	}
}
