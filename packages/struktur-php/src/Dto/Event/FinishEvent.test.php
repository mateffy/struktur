<?php

use Mateffy\Struktur\Dto\Event\FinishEvent;

describe('FinishEvent', function () {
    it('constructs with timestamp', function () {
        $event = new FinishEvent(timestamp: 123);

        expect($event->timestamp)->toBe(123);
    });

    it('allows zero timestamp', function () {
        $event = new FinishEvent(timestamp: 0);

        expect($event->timestamp)->toBe(0);
    });
});
