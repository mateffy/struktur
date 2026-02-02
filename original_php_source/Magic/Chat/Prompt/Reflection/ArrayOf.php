<?php

namespace Mateffy\Magic\Chat\Prompt\Reflection;

use Attribute;

#[Attribute]
class ArrayOf extends PromptReflectionAttribute
{
    public function __construct(public string $type) {}

    public function getValidationRules(): array
    {
        return ['array'];
    }
}
