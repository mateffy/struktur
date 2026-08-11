<?php

use Mateffy\Struktur\Dto\Event\ToolEndEvent;

describe('ToolEndEvent', function () {
    it('constructs with all properties', function () {
        $event = new ToolEndEvent(
            toolCallId: 'call_123',
            result: ['text' => 'hello'],
            error: null,
            timestamp: 123,
        );

        expect($event->toolCallId)->toBe('call_123');
        expect($event->result)->toBe(['text' => 'hello']);
        expect($event->error)->toBeNull();
        expect($event->timestamp)->toBe(123);
    });

    it('allows null result and string error', function () {
        $event = new ToolEndEvent(toolCallId: 'c', result: null, error: 'timeout', timestamp: 0);

        expect($event->result)->toBeNull();
        expect($event->error)->toBe('timeout');
    });

    it('allows empty toolCallId', function () {
        $event = new ToolEndEvent(toolCallId: '', result: null, error: null, timestamp: 0);

        expect($event->toolCallId)->toBe('');
    });
});
