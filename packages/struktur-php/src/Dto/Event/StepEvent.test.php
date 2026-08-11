<?php

use Mateffy\Struktur\Dto\Event\StepEvent;

describe('StepEvent', function () {
    it('constructs with all properties', function () {
        $event = new StepEvent(step: 1, total: 10, label: 'extracting', timestamp: 1234567890);

        expect($event->step)->toBe(1);
        expect($event->total)->toBe(10);
        expect($event->label)->toBe('extracting');
        expect($event->timestamp)->toBe(1234567890);
    });

    it('allows null total', function () {
        $event = new StepEvent(step: 1, total: null, label: 'done', timestamp: 0);

        expect($event->total)->toBeNull();
    });

    it('allows empty label', function () {
        $event = new StepEvent(step: 0, total: null, label: '', timestamp: 0);

        expect($event->label)->toBe('');
    });
});
