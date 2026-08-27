<?php

use Mateffy\Struktur\Dto\Event\StatusEvent;

describe('StatusEvent', function () {
    it('constructs with all properties', function () {
        $event = new StatusEvent(
            phase: 'analyzing',
            message: ['key' => 'reading', 'params' => ['page' => 3]],
            percent: null,
            timestamp: 1234567890,
        );

        expect($event->phase)->toBe('analyzing');
        expect($event->message)->toBe(['key' => 'reading', 'params' => ['page' => 3]]);
        expect($event->percent)->toBeNull();
        expect($event->timestamp)->toBe(1234567890);
    });

    it('allows null message and determinate percent', function () {
        $event = new StatusEvent(
            phase: 'extracting',
            message: null,
            percent: 42.5,
            timestamp: 0,
        );

        expect($event->message)->toBeNull();
        expect($event->percent)->toBe(42.5);
    });
});
