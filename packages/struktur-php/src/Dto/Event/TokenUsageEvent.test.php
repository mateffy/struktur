<?php

use Mateffy\Struktur\Dto\Event\TokenUsageEvent;

describe('TokenUsageEvent', function () {
    it('constructs with all properties', function () {
        $event = new TokenUsageEvent(
            inputTokens: 100,
            outputTokens: 50,
            totalTokens: 150,
            model: 'openai/gpt-4',
            timestamp: 123,
        );

        expect($event->inputTokens)->toBe(100);
        expect($event->outputTokens)->toBe(50);
        expect($event->totalTokens)->toBe(150);
        expect($event->model)->toBe('openai/gpt-4');
        expect($event->timestamp)->toBe(123);
    });

    it('allows null model', function () {
        $event = new TokenUsageEvent(inputTokens: 0, outputTokens: 0, totalTokens: 0, model: null, timestamp: 0);

        expect($event->model)->toBeNull();
    });

    it('allows zero tokens', function () {
        $event = new TokenUsageEvent(inputTokens: 0, outputTokens: 0, totalTokens: 0, model: null, timestamp: 0);

        expect($event->inputTokens)->toBe(0);
        expect($event->outputTokens)->toBe(0);
        expect($event->totalTokens)->toBe(0);
    });
});
