<?php

use Mateffy\Struktur\Dto\Event\FailureEvent;

describe('FailureEvent', function () {
    it('constructs with all properties', function () {
        $event = new FailureEvent(reason: 'extraction error', timestamp: 123);

        expect($event->reason)->toBe('extraction error');
        expect($event->timestamp)->toBe(123);
    });

    it('allows empty reason', function () {
        $event = new FailureEvent(reason: '', timestamp: 0);

        expect($event->reason)->toBe('');
    });
});
