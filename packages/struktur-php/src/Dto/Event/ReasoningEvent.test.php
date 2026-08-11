<?php

use Mateffy\Struktur\Dto\Event\ReasoningEvent;

describe('ReasoningEvent', function () {
    it('constructs with all properties', function () {
        $event = new ReasoningEvent(thought: 'I think...', timestamp: 123);

        expect($event->thought)->toBe('I think...');
        expect($event->timestamp)->toBe(123);
    });

    it('allows empty thought', function () {
        $event = new ReasoningEvent(thought: '', timestamp: 0);

        expect($event->thought)->toBe('');
    });
});
