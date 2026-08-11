<?php

use Mateffy\Struktur\Dto\ParseRequest;
use Mateffy\Struktur\Input;

describe('ParseRequest', function () {
    it('constructs with valid single input', function () {
        $request = new ParseRequest(inputs: [Input::fromPath('/tmp/test.pdf')]);

        expect($request->inputs)->toHaveCount(1);
    });

    it('rejects zero inputs', function () {
        expect(fn () => new ParseRequest(inputs: []))
            ->toThrow(\InvalidArgumentException::class, 'Exactly 1 input is required');
    });

    it('rejects multiple inputs', function () {
        expect(fn () => new ParseRequest(
            inputs: [Input::fromPath('/tmp/a.pdf'), Input::fromPath('/tmp/b.pdf')],
        ))->toThrow(\InvalidArgumentException::class, 'Exactly 1 input is required');
    });

    it('accepts bytes input', function () {
        $request = new ParseRequest(inputs: [Input::fromBytes('hello')]);

        expect($request->inputs[0]->bytes)->toBe('hello');
    });

    it('accepts stream input', function () {
        $stream = fopen('php://temp', 'r+');
        $request = new ParseRequest(inputs: [Input::fromStream($stream)]);

        expect($request->inputs[0]->stream)->toBe($stream);
        fclose($stream);
    });
});
