<?php

use Mateffy\Struktur\Dto\Artifact;
use Mateffy\Struktur\Dto\ArtifactContent;
use Mateffy\Struktur\Dto\ArtifactImage;

describe('Artifact', function () {
    it('constructs with all properties', function () {
        $contents = [new ArtifactContent(page: 1, text: 'hello')];
        $artifact = new Artifact(
            id: 'a1',
            type: 'text',
            contents: $contents,
            metadata: ['source' => 'test'],
            tokens: 42,
        );

        expect($artifact->id)->toBe('a1');
        expect($artifact->type)->toBe('text');
        expect($artifact->contents)->toHaveCount(1);
        expect($artifact->metadata)->toBe(['source' => 'test']);
        expect($artifact->tokens)->toBe(42);
    });

    it('constructs with defaults', function () {
        $artifact = new Artifact(id: 'a1', type: 'text');

        expect($artifact->contents)->toBe([]);
        expect($artifact->metadata)->toBe([]);
        expect($artifact->tokens)->toBeNull();
    });

    it('allows empty id and type', function () {
        $artifact = new Artifact(id: '', type: '');

        expect($artifact->id)->toBe('');
        expect($artifact->type)->toBe('');
    });

    it('allows nested media in contents', function () {
        $image = new ArtifactImage(type: 'image', url: 'https://example.com/img.png');
        $content = new ArtifactContent(page: 1, text: 'hello', media: [$image]);
        $artifact = new Artifact(id: 'a1', type: 'pdf', contents: [$content]);

        expect($artifact->contents[0]->media[0]->url)->toBe('https://example.com/img.png');
    });
});
