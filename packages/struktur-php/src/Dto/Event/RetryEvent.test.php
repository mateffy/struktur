<?php

use Mateffy\Struktur\Dto\Event\RetryEvent;

describe('RetryEvent', function () {
    it('constructs with all properties', function () {
        $event = new RetryEvent(attempt: 2, maxAttempts: 3, reason: 'validation failed', timestamp: 123);

        expect($event->attempt)->toBe(2);
        expect($event->maxAttempts)->toBe(3);
        expect($event->reason)->toBe('validation failed');
        expect($event->timestamp)->toBe(123);
    });

    it('allows null reason', function () {
        $event = new RetryEvent(attempt: 1, maxAttempts: 3, reason: null, timestamp: 0);

        expect($event->reason)->toBeNull();
    });
});
