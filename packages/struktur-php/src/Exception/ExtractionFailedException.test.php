<?php

use Mateffy\Struktur\Exception\ExtractionFailedException;
use Mateffy\Struktur\Exception\StrukturException;

describe('ExtractionFailedException', function () {
    it('extends StrukturException', function () {
        $e = new ExtractionFailedException('failed');

        expect($e)->toBeInstanceOf(StrukturException::class);
        expect($e->getMessage())->toBe('failed');
    });

    it('has optional stderr property', function () {
        $e = new ExtractionFailedException('extraction failed', stderr: 'some stderr');

        expect($e->stderr)->toBe('some stderr');
    });

    it('has null stderr by default', function () {
        $e = new ExtractionFailedException('failed');

        expect($e->stderr)->toBeNull();
    });

    it('preserves code and previous', function () {
        $previous = new \Exception('prev');
        $e = new ExtractionFailedException('msg', 42, $previous, 'err');

        expect($e->getCode())->toBe(42);
        expect($e->getPrevious())->toBe($previous);
        expect($e->stderr)->toBe('err');
    });

    it('has default empty message', function () {
        $e = new ExtractionFailedException();

        expect($e->getMessage())->toBe('');
    });
});
