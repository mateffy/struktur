<?php

use Mateffy\Struktur\Dto\ExtractionResult;
use Mateffy\Struktur\Dto\Usage;

describe('ExtractionResult', function () {
    it('constructs with all properties', function () {
        $usage = new Usage(100, 50, 150);
        $result = new ExtractionResult(data: ['invoice' => '123'], usage: $usage, rawStdout: '{"invoice":"123"}');

        expect($result->data)->toBe(['invoice' => '123']);
        expect($result->usage->totalTokens)->toBe(150);
        expect($result->rawStdout)->toBe('{"invoice":"123"}');
    });

    it('constructs with defaults', function () {
        $usage = new Usage(0, 0, 0);
        $result = new ExtractionResult(data: [], usage: $usage);

        expect($result->rawStdout)->toBeNull();
    });

    it('allows empty data array', function () {
        $usage = new Usage(0, 0, 0);
        $result = new ExtractionResult(data: [], usage: $usage);

        expect($result->data)->toBe([]);
    });
});
