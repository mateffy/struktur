<?php

use Mateffy\Struktur\Dto\ParseResult;
use Mateffy\Struktur\Dto\Artifact;

describe('ParseResult', function () {
    it('constructs with artifacts', function () {
        $artifacts = [new Artifact(id: 'a1', type: 'text')];
        $result = new ParseResult(artifacts: $artifacts, rawStdout: '[{"id":"a1"}]');

        expect($result->artifacts)->toHaveCount(1);
        expect($result->rawStdout)->toBe('[{"id":"a1"}]');
    });

    it('constructs with defaults', function () {
        $result = new ParseResult(artifacts: []);

        expect($result->rawStdout)->toBeNull();
    });

    it('allows empty artifacts', function () {
        $result = new ParseResult(artifacts: []);

        expect($result->artifacts)->toBe([]);
    });
});
