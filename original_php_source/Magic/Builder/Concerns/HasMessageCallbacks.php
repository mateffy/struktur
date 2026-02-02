<?php

namespace Mateffy\Magic\Builder\Concerns;

use Closure;
use Mateffy\Magic\Chat\Messages\Message;

trait HasMessageCallbacks
{
    protected ?Closure $onMessageProgress = null;
    protected ?Closure $onMessage = null;

    /**
     * @param ?Closure(Message): void $onMessageProgress
     */
    public function onMessageProgress(?Closure $onMessageProgress): static
    {
        $this->onMessageProgress = $onMessageProgress;

        return $this;
    }

    /**
     * @param ?Closure(Message): void $onMessage
     */
    public function onMessage(?Closure $onMessage): static
    {
        $this->onMessage = $onMessage;

        return $this;
    }
}
