<?php

namespace Mateffy\Magic\Builder\Concerns;

use Closure;
use Mateffy\Magic\Chat\ActorTelemetry;

trait HasExtractionModelCallbacks
{
    protected ?Closure $onDataProgress = null;
    protected ?Closure $onActorTelemetry = null;

    /**
     * @param ?Closure(array $data): void $onDataProgress
     */
    public function onDataProgress(?Closure $onDataProgress): static
    {
        $this->onDataProgress = $onDataProgress;

        return $this;
    }

    /**
     * @param ?Closure(ActorTelemetry $telemetry): void $onActorTelemetry
     */
    public function onActorTelemetry(?Closure $onActorTelemetry): static
    {
        $this->onActorTelemetry = $onActorTelemetry;

        return $this;
    }
}
