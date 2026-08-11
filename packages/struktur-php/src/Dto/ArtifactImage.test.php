<?php

use Mateffy\Struktur\Dto\ArtifactImage;

describe('ArtifactImage', function () {
    it('constructs with all properties', function () {
        $image = new ArtifactImage(
            type: 'image',
            url: 'https://example.com/img.png',
            base64: 'base64string',
            text: 'alt text',
            width: 800,
            height: 600,
            imageType: 'png',
            raw: ['extra' => 'data'],
        );

        expect($image->type)->toBe('image');
        expect($image->url)->toBe('https://example.com/img.png');
        expect($image->base64)->toBe('base64string');
        expect($image->text)->toBe('alt text');
        expect($image->width)->toBe(800);
        expect($image->height)->toBe(600);
        expect($image->imageType)->toBe('png');
        expect($image->raw)->toBe(['extra' => 'data']);
    });

    it('constructs with defaults', function () {
        $image = new ArtifactImage(type: 'image');

        expect($image->type)->toBe('image');
        expect($image->url)->toBeNull();
        expect($image->base64)->toBeNull();
        expect($image->text)->toBeNull();
        expect($image->width)->toBeNull();
        expect($image->height)->toBeNull();
        expect($image->imageType)->toBeNull();
        expect($image->raw)->toBe([]);
    });

    it('constructs with empty string values', function () {
        $image = new ArtifactImage(type: '', url: '', base64: '', text: '', imageType: '');

        expect($image->type)->toBe('');
        expect($image->url)->toBe('');
        expect($image->base64)->toBe('');
        expect($image->text)->toBe('');
        expect($image->imageType)->toBe('');
    });
});
