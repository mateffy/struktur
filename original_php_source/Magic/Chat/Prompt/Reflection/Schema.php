<?php

namespace Mateffy\Magic\Chat\Prompt\Reflection;

use Attribute;

#[Attribute]
class Schema extends PromptReflectionAttribute
{
    public function __construct(public array|string $schemaOrClasspath) {}
}
