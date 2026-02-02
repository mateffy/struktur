<?php

namespace Mateffy\Magic\Chat;

use Closure;
use Illuminate\Support\Collection;
use Mateffy\Magic\Chat\Messages\DataMessage;
use Mateffy\Magic\Chat\Messages\ToolCallMessage;
use Mateffy\Magic\Chat\Messages\ToolResultMessage;
use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\Messages\TextMessage;

class MessageCollection extends Collection
{
    public function firstTextMessage(): ?TextMessage
    {
        return $this->first(fn (Message $message) => $message instanceof TextMessage);
    }

    public function firstText(): ?string
    {
        return $this->firstTextMessage()?->text();
    }

    public function firstDataMessage(): ?DataMessage
    {
        return $this->first(fn (Message $message) => $message instanceof DataMessage);
    }

    public function firstData(): ?array
    {
        return $this->firstDataMessage()?->data();
    }

	/**
	 * @deprecated Use firstToolCallMessage instead
	 */
    public function firstFunctionInvokation(?Closure $filter = null): ?ToolCallMessage
    {
        return $this->firstToolCallMessage($filter);
    }

	/**
	 * @deprecated Use firstToolResultMessage instead
	 */
    public function firstFunctionOutput(?Closure $filter = null): ?ToolResultMessage
    {
        return $this->firstToolResultMessage($filter);
    }

	public function firstToolCallMessage(?Closure $filter = null): ?ToolCallMessage
    {
        return $this->first(fn (Message $message) => $message instanceof ToolCallMessage && ($filter === null || $filter($message)));
    }

	public function firstToolResultMessage(?Closure $filter = null): ?ToolResultMessage
    {
        return $this->first(fn (Message $message) => $message instanceof ToolResultMessage && ($filter === null || $filter($message)));
    }

    public function lastTextMessage(): ?TextMessage
    {
        return $this->last(fn (Message $message) => $message instanceof TextMessage);
    }

    public function lastText(): ?string
    {
        return $this->lastTextMessage()?->text();
    }

    /**
     * @return DataMessage[]|null
     */
    public function lastDataMessage(): ?DataMessage
    {
        return $this->last(fn (Message $message) => $message instanceof DataMessage);
    }

    /**
     * @return array|null
     */
    public function lastData(): ?array
    {
        return $this->lastDataMessage()?->data();
    }

	/**
	 * @deprecated Use lastToolCallMessage instead
	 */
    public function lastFunctionInvokation(?Closure $filter = null): ?ToolCallMessage
    {
        return $this->lastToolCallMessage($filter);
    }

	/**
	 * @deprecated Use lastToolResultMessage instead
	 */
    public function lastFunctionOutput(?Closure $filter = null): ?ToolResultMessage
    {
		return $this->lastToolResultMessage($filter);
    }

	public function lastToolCallMessage(?Closure $filter = null): ?ToolCallMessage
	{
		return $this->last(fn (Message $message) => $message instanceof ToolCallMessage && ($filter === null || $filter($message)));
	}

	public function lastToolResultMessage(?Closure $filter = null): ?ToolResultMessage
	{
		return $this->last(fn (Message $message) => $message instanceof ToolResultMessage && ($filter === null || $filter($message)));
	}

	public function text(): string
	{
		return $this->map(fn (Message $message) => $message->text())->join("\n");
	}

    public function formattedText(): string
    {
        $lastIndex = $this->count() - 1;
        $lineBreak = fn (int $index) => $index === $lastIndex ? '' : "\n";

        return $this
            ->map(fn (Message $message, int $index) => match ($message::class) {
                ToolCallMessage::class => "Tool: " . trim($message->text()),
                ToolResultMessage::class => "Output: " . trim($message->text()) . $lineBreak($index),
                default => trim($message->text()) . $lineBreak($index),
            })
            ->join("\n");
    }
}
