<?php

use Mateffy\Struktur\Dto\Event\OutputSetEvent;

describe('OutputSetEvent', function () {
    it('constructs with all properties', function () {
        $event = new OutputSetEvent(data: ['key' => 'value'], timestamp: 123);

        expect($event->data)->toBe(['key' => 'value']);
        expect($event->timestamp)->toBe(123);
    });

    it('allows empty data', function () {
        $event = new OutputSetEvent(data: [], timestamp: 0);

        expect($event->data)->toBe([]);
    });
});
