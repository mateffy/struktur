<?php

namespace Mateffy\Magic\Builder\Concerns;

use Closure;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Chat\ToolChoice;
use Mateffy\Magic\Tools\InvokableTool;
use Mateffy\Magic\Tools\ToolProcessor;
use ReflectionException;
use Throwable;

trait HasTools
{
    public array $tools = [];

    public ToolChoice|string $toolChoice = ToolChoice::Auto;

    /**
     * @var Closure(Throwable): void|null $onToolError
     */
    public ?Closure $onToolError = null;

    /**
     * @var Closure(ToolCall): void|null $shouldInterrupt
     */
    public ?Closure $shouldInterrupt = null;

    /**
     * @throws ReflectionException
     */
    public function tools(...$tools): static
    {
        $this->tools = [
            ...$this->tools,
            ...$this->processTools($tools)
        ];

        return $this;
    }

    /**
     * @throws ReflectionException
     */
    protected function processTools(array $tools): array
    {
        $processor = app(ToolProcessor::class);
        $processedTools = [];

        foreach ($tools as $key => $tool) {
            if ($tool instanceof InvokableTool) {
                if (is_numeric($key)) {
                    $key = $tool->name();
                }

                $processedTools[$key] = $tool;
            } else if (is_callable($tool)) {
                $processedTools[$key] = $processor->processFunctionTool($key, $tool);
            } elseif (is_array($tool)) {
                $processedTools = [
                    ...$processedTools,
                    ...$this->processTools($tool)
                ];
            }
        }

        return $processedTools;
    }

    public function interrupt(?Closure $shouldInterrupt): static
    {
        $this->shouldInterrupt = $shouldInterrupt;

        return $this;
    }

    public function toolChoice(ToolChoice|string $name = ToolChoice::Auto): static
    {
        $this->toolChoice = $name;

        return $this;
    }

	public function forceTool(ToolChoice|string $name = ToolChoice::Required): static
    {
        $this->toolChoice = $name;

        return $this;
    }

    public function onToolError(?Closure $onToolError): static
    {
        $this->onToolError = $onToolError;

        return $this;
    }
}
