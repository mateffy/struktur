<?php

use Mateffy\Struktur\Dto\ParseResult;
use Mateffy\Struktur\Dto\Artifact;
use Mateffy\Struktur\Dto\ArtifactContent;
use Mateffy\Struktur\Dto\ArtifactImage;

describe('ParseResult', function () {
    it('constructs with artifacts', function () {
        $artifacts = [new Artifact(id: 'a1', type: 'text')];
        $result = new ParseResult(artifacts: $artifacts, rawStdout: '[{"id":"a1"}]');

        expect($result->artifacts)->toHaveCount(1);
        expect($result->rawStdout)->toBe('[{"id":"a1"}]');
    });

    it('constructs with defaults', function () {
        $result = new ParseResult(artifacts: []);

        expect($result->rawStdout)->toBeNull();
    });

    it('allows empty artifacts', function () {
        $result = new ParseResult(artifacts: []);

        expect($result->artifacts)->toBe([]);
    });

    it('keys images by their virtual path', function () {
        $result = new ParseResult(artifacts: [
            new Artifact(id: 'a1', type: 'pdf', contents: [
                new ArtifactContent(page: 1, text: 'page one', media: [
                    new ArtifactImage(
                        type: 'image',
                        imageType: ArtifactImage::TYPE_EMBEDDED,
                        virtualPath: '/images/a1-page-1-image-1.png',
                    ),
                ]),
                new ArtifactContent(page: 2, text: 'page two', media: [
                    new ArtifactImage(
                        type: 'image',
                        imageType: ArtifactImage::TYPE_SCREENSHOT,
                        virtualPath: '/images/a1-page-2-image-1.png',
                    ),
                ]),
            ]),
        ]);

        expect(array_keys($result->images()))->toBe([
            '/images/a1-page-1-image-1.png',
            '/images/a1-page-2-image-1.png',
        ]);
    });

    it('keeps an image that has no virtual path', function () {
        $result = new ParseResult(artifacts: [
            new Artifact(id: 'a1', type: 'image', contents: [
                new ArtifactContent(page: 1, media: [new ArtifactImage(type: 'image')]),
            ]),
        ]);

        expect($result->images())->toHaveKey('image-1');
    });

    it('finds the generated image overview and ignores page renders', function () {
        $result = new ParseResult(artifacts: [
            new Artifact(id: 'a1', type: 'pdf', contents: [
                new ArtifactContent(page: 1, media: [
                    new ArtifactImage(type: 'image', imageType: ArtifactImage::TYPE_EMBEDDED),
                    new ArtifactImage(type: 'image', imageType: ArtifactImage::TYPE_SCREENSHOT),
                    new ArtifactImage(
                        type: 'image',
                        imageType: ArtifactImage::TYPE_OVERVIEW,
                        virtualPath: '/images/image-overview-1.png',
                    ),
                ]),
            ]),
        ]);

        expect($result->overview()?->virtualPath)->toBe('/images/image-overview-1.png')
            ->and($result->media())->toHaveCount(3);
    });

    it('returns no overview when the parser did not make one', function () {
        $result = new ParseResult(artifacts: [
            new Artifact(id: 'a1', type: 'pdf', contents: [
                new ArtifactContent(page: 1, media: [
                    new ArtifactImage(type: 'image', imageType: ArtifactImage::TYPE_SCREENSHOT),
                ]),
            ]),
        ]);

        expect($result->overview())->toBeNull();
    });
});
