<?php

use Mateffy\Struktur\Dto\Event\ExtractionEvent;
use Mateffy\Struktur\Dto\Event\StepEvent;
use Mateffy\Struktur\Dto\Event\FinishEvent;

describe('ExtractionEvent interface', function () {
    it('is implemented by StepEvent', function () {
        $event = new StepEvent(step: 1, total: 5, label: 'test', timestamp: 123);

        expect($event)->toBeInstanceOf(ExtractionEvent::class);
        expect($event->timestamp)->toBe(123);
    });

    it('is implemented by FinishEvent', function () {
        $event = new FinishEvent(timestamp: 456);

        expect($event)->toBeInstanceOf(ExtractionEvent::class);
        expect($event->timestamp)->toBe(456);
    });

    it('requires timestamp property', function () {
        // All event classes have int timestamp
        $events = [
            new \Mateffy\Struktur\Dto\Event\ToolStartEvent(toolName: 'x', toolCallId: 'c', args: [], timestamp: 1),
            new \Mateffy\Struktur\Dto\Event\ToolEndEvent(toolCallId: 'c', result: null, error: null, timestamp: 1),
            new \Mateffy\Struktur\Dto\Event\ReasoningEvent(thought: 't', timestamp: 1),
            new \Mateffy\Struktur\Dto\Event\OutputSetEvent(data: [], timestamp: 1),
            new \Mateffy\Struktur\Dto\Event\OutputUpdatedEvent(changes: [], timestamp: 1),
            new \Mateffy\Struktur\Dto\Event\TokenUsageEvent(inputTokens: 1, outputTokens: 1, totalTokens: 2, model: null, timestamp: 1),
            new \Mateffy\Struktur\Dto\Event\ProgressEvent(current: 1, total: 2, percent: null, timestamp: 1),
            new \Mateffy\Struktur\Dto\Event\RetryEvent(attempt: 1, maxAttempts: 3, reason: null, timestamp: 1),
            new \Mateffy\Struktur\Dto\Event\FailureEvent(reason: 'r', timestamp: 1),
        ];

        foreach ($events as $event) {
            expect($event)->toBeInstanceOf(ExtractionEvent::class);
            expect($event->timestamp)->toBeInt();
        }
    });
});
