<?php

namespace Mateffy\Magic\Tools;

use Closure;

abstract class ClosureMagicFunction
{
    public static function make(string $name): MagicTool
    {
        return app(ToolProcessor::class)->processFunctionTool($name, static::callback());
    }

    abstract public static function callback(): Closure;
}
