<?php

use Mateffy\Struktur\Input;

describe('Input', function () {
    it('creates from path', function () {
        $input = Input::fromPath('/tmp/test.txt');

        expect($input->path)->toBe('/tmp/test.txt');
        expect($input->bytes)->toBeNull();
        expect($input->stream)->toBeNull();
    });

    it('creates from bytes', function () {
        $input = Input::fromBytes('hello world');

        expect($input->path)->toBeNull();
        expect($input->bytes)->toBe('hello world');
        expect($input->stream)->toBeNull();
    });

    it('creates from stream', function () {
        $stream = fopen('php://temp', 'r+');
        fwrite($stream, 'hello world');
        rewind($stream);

        $input = Input::fromStream($stream);

        expect($input->path)->toBeNull();
        expect($input->bytes)->toBeNull();
        expect($input->stream)->toBe($stream);

        fclose($stream);
    });

    it('rejects non-resource stream', function () {
        expect(fn () => Input::fromStream('not a stream'))
            ->toThrow(\InvalidArgumentException::class, 'Input must be a valid stream resource');
    });

    it('rejects integer as stream', function () {
        expect(fn () => Input::fromStream(123))
            ->toThrow(\InvalidArgumentException::class, 'Input must be a valid stream resource');
    });

    it('rejects null as stream', function () {
        expect(fn () => Input::fromStream(null))
            ->toThrow(\InvalidArgumentException::class, 'Input must be a valid stream resource');
    });

    it('rejects array as stream', function () {
        expect(fn () => Input::fromStream([]))
            ->toThrow(\InvalidArgumentException::class, 'Input must be a valid stream resource');
    });

    it('allows empty bytes', function () {
        $input = Input::fromBytes('');

        expect($input->bytes)->toBe('');
    });

    it('allows empty path', function () {
        $input = Input::fromPath('');

        expect($input->path)->toBe('');
    });
});
