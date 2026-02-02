<?php

namespace Mateffy\Magic\Models;

use Closure;
use Mateffy\Magic\Chat\MessageCollection;
use Mateffy\Magic\Chat\Prompt;

interface ModelLaunchInterface
{
    public function stream(Prompt $prompt, ?Closure $onMessageProgress = null, ?Closure $onMessage = null, ?Closure $onTokenStats = null, ?Closure $onDataPacket = null): MessageCollection;

    public function send(Prompt $prompt): MessageCollection;
}
