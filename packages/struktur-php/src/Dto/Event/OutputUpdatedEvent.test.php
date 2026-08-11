<?php

use Mateffy\Struktur\Dto\Event\OutputUpdatedEvent;

describe('OutputUpdatedEvent', function () {
    it('constructs with all properties', function () {
        $event = new OutputUpdatedEvent(changes: ['field' => 'new'], timestamp: 123);

        expect($event->changes)->toBe(['field' => 'new']);
        expect($event->timestamp)->toBe(123);
    });

    it('allows empty changes', function () {
        $event = new OutputUpdatedEvent(changes: [], timestamp: 0);

        expect($event->changes)->toBe([]);
    });
});
