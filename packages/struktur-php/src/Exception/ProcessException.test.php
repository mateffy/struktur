<?php

use Mateffy\Struktur\Exception\ProcessException;
use Mateffy\Struktur\Exception\StrukturException;

describe('ProcessException', function () {
    it('extends StrukturException', function () {
        $e = new ProcessException('failed');

        expect($e)->toBeInstanceOf(StrukturException::class);
        expect($e)->toBeInstanceOf(\RuntimeException::class);
        expect($e->getMessage())->toBe('failed');
    });

    it('has default empty message', function () {
        $e = new ProcessException();

        expect($e->getMessage())->toBe('');
    });

    it('preserves code and previous', function () {
        $previous = new \Exception('prev');
        $e = new ProcessException('msg', 42, $previous);

        expect($e->getCode())->toBe(42);
        expect($e->getPrevious())->toBe($previous);
    });
});
