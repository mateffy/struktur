<?php

namespace Mateffy\Magic\Builder\Concerns;

trait HasOutputInstructions
{
    public ?string $outputInstructions = null;

    public function instructions(?string $instructions): static
    {
        $this->outputInstructions = $instructions;

        return $this;
    }
}
