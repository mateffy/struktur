<?php

use Mateffy\Struktur\Dto\ArtifactContent;
use Mateffy\Struktur\Dto\ArtifactImage;

describe('ArtifactContent', function () {
    it('constructs with all properties', function () {
        $media = [new ArtifactImage(type: 'image')];
        $content = new ArtifactContent(page: 1, text: 'Hello world', media: $media);

        expect($content->page)->toBe(1);
        expect($content->text)->toBe('Hello world');
        expect($content->media)->toHaveCount(1);
    });

    it('constructs with defaults', function () {
        $content = new ArtifactContent();

        expect($content->page)->toBeNull();
        expect($content->text)->toBeNull();
        expect($content->media)->toBe([]);
    });

    it('allows null page and text', function () {
        $content = new ArtifactContent(page: null, text: null, media: []);

        expect($content->page)->toBeNull();
        expect($content->text)->toBeNull();
    });

    it('allows empty text', function () {
        $content = new ArtifactContent(text: '');

        expect($content->text)->toBe('');
    });
});
