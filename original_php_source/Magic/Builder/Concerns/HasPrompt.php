<?php

namespace Mateffy\Magic\Builder\Concerns;

use Mateffy\Magic\Chat\Prompt;

trait HasPrompt
{
    public Prompt|string|null $prompt = null;

    public function prompt(Prompt|string|null $prompt): static
    {
        $this->prompt = $prompt;

        return $this;
    }
}
