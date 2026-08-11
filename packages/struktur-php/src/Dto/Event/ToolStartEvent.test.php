<?php

use Mateffy\Struktur\Dto\Event\ToolStartEvent;

describe('ToolStartEvent', function () {
    it('constructs with all properties', function () {
        $event = new ToolStartEvent(
            toolName: 'read',
            toolCallId: 'call_123',
            args: ['path' => '/tmp/test.txt'],
            timestamp: 123,
        );

        expect($event->toolName)->toBe('read');
        expect($event->toolCallId)->toBe('call_123');
        expect($event->args)->toBe(['path' => '/tmp/test.txt']);
        expect($event->timestamp)->toBe(123);
    });

    it('allows empty args', function () {
        $event = new ToolStartEvent(toolName: 'x', toolCallId: 'c', args: [], timestamp: 0);

        expect($event->args)->toBe([]);
    });
});
