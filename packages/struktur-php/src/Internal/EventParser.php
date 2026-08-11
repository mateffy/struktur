<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Internal;

use Mateffy\Struktur\Dto\Event;

class EventParser
{
    public static function parse(string $jsonLine): Event\ExtractionEvent
    {
        $data = json_decode($jsonLine, true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($data) || !isset($data['event'])) {
            throw new \InvalidArgumentException('Invalid event line: ' . $jsonLine);
        }

        $timestamp = $data['timestamp'] ?? time();

        return match ($data['event']) {
            'step' => new Event\StepEvent(
                step: $data['step'],
                total: $data['total'] ?? null,
                label: $data['label'] ?? '',
                timestamp: $timestamp,
            ),
            'tool_start' => new Event\ToolStartEvent(
                toolName: $data['toolName'],
                toolCallId: $data['toolCallId'] ?? '',
                args: $data['args'] ?? [],
                timestamp: $timestamp,
            ),
            'tool_end' => new Event\ToolEndEvent(
                toolCallId: $data['toolCallId'] ?? '',
                result: $data['result'] ?? null,
                error: $data['error'] ?? null,
                timestamp: $timestamp,
            ),
            'agent_reasoning' => new Event\ReasoningEvent(
                thought: $data['thought'] ?? '',
                timestamp: $timestamp,
            ),
            'output_set' => new Event\OutputSetEvent(
                data: $data['data'] ?? [],
                timestamp: $timestamp,
            ),
            'output_updated' => new Event\OutputUpdatedEvent(
                changes: $data['changes'] ?? [],
                timestamp: $timestamp,
            ),
            'token_usage' => new Event\TokenUsageEvent(
                inputTokens: $data['inputTokens'] ?? 0,
                outputTokens: $data['outputTokens'] ?? 0,
                totalTokens: $data['totalTokens'] ?? 0,
                model: $data['model'] ?? null,
                timestamp: $timestamp,
            ),
            'progress' => new Event\ProgressEvent(
                current: $data['current'],
                total: $data['total'],
                percent: $data['percent'] ?? null,
                timestamp: $timestamp,
            ),
            'retry' => new Event\RetryEvent(
                attempt: $data['attempt'],
                maxAttempts: $data['maxAttempts'],
                reason: $data['reason'] ?? null,
                timestamp: $timestamp,
            ),
            'finish' => new Event\FinishEvent(timestamp: $timestamp),
            'failure' => new Event\FailureEvent(
                reason: $data['reason'] ?? '',
                timestamp: $timestamp,
            ),
            'agent_message' => new Event\StepEvent( // Map to step with message info for now
                step: 0,
                total: null,
                label: $data['content'] ?? '',
                timestamp: $timestamp,
            ),
            default => throw new \InvalidArgumentException('Unknown event type: ' . $data['event']),
        };
    }
}
