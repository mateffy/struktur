<?php

use Mateffy\Struktur\Dto\Usage;

describe('Usage', function () {
    it('constructs with all properties', function () {
        $usage = new Usage(100, 50, 150);

        expect($usage->inputTokens)->toBe(100);
        expect($usage->outputTokens)->toBe(50);
        expect($usage->totalTokens)->toBe(150);
    });

    it('allows zero tokens', function () {
        $usage = new Usage(0, 0, 0);

        expect($usage->inputTokens)->toBe(0);
        expect($usage->outputTokens)->toBe(0);
        expect($usage->totalTokens)->toBe(0);
    });

    it('allows negative token values', function () {
        $usage = new Usage(-1, -2, -3);

        expect($usage->inputTokens)->toBe(-1);
        expect($usage->outputTokens)->toBe(-2);
        expect($usage->totalTokens)->toBe(-3);
    });
});
