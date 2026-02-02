<?php

namespace Mateffy\Magic\Extraction\Strategies;

use Closure;
use Mateffy\Magic\Chat\ActorTelemetry;
use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\TokenStats;
use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\ContextOptions;
use Mateffy\Magic\Models\LLM;

interface Strategy
{
	public static function make(
		LLM $llm,
		ContextOptions $contextOptions,
        ?string $outputInstructions,
        array $schema,
		int $chunkSize,

		/** @var ?Closure(array): void $onDataProgress */
        ?Closure $onDataProgress,

        /** @var ?Closure(TokenStats): void $onTokenStats */
        ?Closure $onTokenStats = null,

        /** @var ?Closure(Message): void $onMessageProgress */
        ?Closure $onMessageProgress = null,

        /** @var ?Closure(Message, string): void $onMessage */
        ?Closure $onMessage = null,

        /** @var ?Closure(ActorTelemetry): void $onActorTelemetry */
        ?Closure $onActorTelemetry = null,
    ): static;

	public static function getLabel(): string;

	/**
	 * @param Artifact[] $artifacts
	 */
	public function getEstimatedSteps(array $artifacts): int;

	/**
	 * @param Artifact[] $artifacts
	 */
    public function run(array $artifacts): array;
}
