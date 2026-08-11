<?php

use Mateffy\Struktur\Exception\SchemaValidationException;
use Mateffy\Struktur\Exception\StrukturException;

describe('SchemaValidationException', function () {
    it('extends StrukturException', function () {
        $e = new SchemaValidationException('invalid');

        expect($e)->toBeInstanceOf(StrukturException::class);
        expect($e->getMessage())->toBe('invalid');
    });

    it('has errors array', function () {
        $e = new SchemaValidationException('invalid', errors: ['missing field x']);

        expect($e->errors)->toBe(['missing field x']);
    });

    it('has empty errors by default', function () {
        $e = new SchemaValidationException('invalid');

        expect($e->errors)->toBe([]);
    });

    it('preserves code and previous', function () {
        $previous = new \Exception('prev');
        $e = new SchemaValidationException('msg', 42, $previous, ['err1', 'err2']);

        expect($e->getCode())->toBe(42);
        expect($e->getPrevious())->toBe($previous);
        expect($e->errors)->toBe(['err1', 'err2']);
    });

    it('has default empty message', function () {
        $e = new SchemaValidationException();

        expect($e->getMessage())->toBe('');
        expect($e->errors)->toBe([]);
    });
});
