<?php

use Mateffy\Struktur\Dto\ExtractionRequest;
use Mateffy\Struktur\Input;

describe('ExtractionRequest', function () {
    it('constructs with valid single input', function () {
        $request = new ExtractionRequest(
            inputs: [Input::fromPath('/tmp/test.txt')],
            schema: ['type' => 'object', 'properties' => ['x' => ['type' => 'string']]],
        );

        expect($request->inputs)->toHaveCount(1);
        expect($request->schema['type'])->toBe('object');
        expect($request->strategy)->toBeNull();
        expect($request->model)->toBeNull();
        expect($request->outputInstructions)->toBeNull();
    });

    it('rejects zero inputs', function () {
        expect(fn () => new ExtractionRequest(inputs: [], schema: []))
            ->toThrow(\InvalidArgumentException::class, 'Exactly 1 input is required');
    });

    it('rejects multiple inputs', function () {
        expect(fn () => new ExtractionRequest(
            inputs: [Input::fromPath('/tmp/a.txt'), Input::fromPath('/tmp/b.txt')],
            schema: [],
        ))->toThrow(\InvalidArgumentException::class, 'Exactly 1 input is required');
    });

    it('accepts optional fields', function () {
        $request = new ExtractionRequest(
            inputs: [Input::fromBytes('hello')],
            schema: [],
            strategy: 'simple',
            model: 'openai/gpt-4',
            outputInstructions: 'Be concise',
        );

        expect($request->strategy)->toBe('simple');
        expect($request->model)->toBe('openai/gpt-4');
        expect($request->outputInstructions)->toBe('Be concise');
    });

    it('accepts empty schema', function () {
        $request = new ExtractionRequest(
            inputs: [Input::fromBytes('x')],
            schema: [],
        );

        expect($request->schema)->toBe([]);
    });
});
