<?php

namespace Mateffy\Magic\Chat\Messages;

interface DataMessage extends Message
{
    public function data(): ?array;
}
