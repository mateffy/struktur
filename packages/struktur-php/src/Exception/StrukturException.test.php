<?php

use Mateffy\Struktur\Exception\StrukturException;

describe('StrukturException', function () {
    it('is a RuntimeException', function () {
        $e = new StrukturException('base error');

        expect($e)->toBeInstanceOf(\RuntimeException::class);
        expect($e->getMessage())->toBe('base error');
    });

    it('has default empty message', function () {
        $e = new StrukturException();

        expect($e->getMessage())->toBe('');
    });

    it('can be thrown and caught', function () {
        try {
            throw new StrukturException('test');
        } catch (StrukturException $e) {
            expect($e->getMessage())->toBe('test');
            return;
        }

        $this->fail('Exception was not caught');
    });
});
