<?php

namespace Mateffy\Magic\Chat;

use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\ToolChoice;
use Mateffy\Magic\Tools\InvokableTool;

interface Prompt
{
    public function system(): ?string;

    /**
     * @return Message[]
     */
    public function messages(): array;

    /**
     * @return InvokableTool[]
     */
    public function tools(): array;

	/**
	 * The tool to use / force.
     */
    public function toolChoice(): ToolChoice|string;
}
