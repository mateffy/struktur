<?php

use Mateffy\Struktur\Dto\Event\ProgressEvent;

describe('ProgressEvent', function () {
    it('constructs with all properties', function () {
        $event = new ProgressEvent(current: 3, total: 10, percent: 30.0, timestamp: 123);

        expect($event->current)->toBe(3);
        expect($event->total)->toBe(10);
        expect($event->percent)->toBe(30.0);
        expect($event->timestamp)->toBe(123);
    });

    it('allows null percent', function () {
        $event = new ProgressEvent(current: 0, total: 0, percent: null, timestamp: 0);

        expect($event->percent)->toBeNull();
    });

    it('allows zero values', function () {
        $event = new ProgressEvent(current: 0, total: 0, percent: 0.0, timestamp: 0);

        expect($event->current)->toBe(0);
        expect($event->total)->toBe(0);
        expect($event->percent)->toBe(0.0);
    });
});
