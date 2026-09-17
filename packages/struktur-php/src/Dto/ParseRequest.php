<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

use Mateffy\Struktur\Input;

final readonly class ParseRequest
{
    /**
     * @param list<Input> $inputs
     * @param array<string, string>|null $tokens Provider-to-token map (e.g. ['openai' => 'sk-xxx']).
     *        Tokens are passed as environment variable prefixes on the CLI command.
     * @param bool $images Extract the images that are embedded in the document (PDF
     *        inputs). When this is set, the parser also composes an image overview
     *        unless $imageOverview is false.
     * @param bool $screenshots Render each page as an image.
     * @param bool $imageOverview Include the generated contact sheet. The overview
     *        holds a labelled thumbnail of every extracted image, so a vision model
     *        can see the whole document for the cost of one image.
     * @param float|null $screenshotScale Scale factor for page renders (default 1.5).
     * @param int|null $screenshotWidth Width of a page render in pixels. Overrides
     *        $screenshotScale when it is set.
     * @param string|null $processor PDF processor: `pdf-parse` (default), `vlm`,
     *        `docling`, `liteparse` or `kreuzberg`. The alternatives need extra
     *        tooling in the environment.
     * @param string|null $mimeType MIME type, to override detection.
     * @param string|null $parser An npm package to use as the parser.
     */
    public function __construct(
        public array $inputs,
        public ?array $tokens = null,
        public bool $images = false,
        public bool $screenshots = false,
        public bool $imageOverview = true,
        public ?float $screenshotScale = null,
        public ?int $screenshotWidth = null,
        public ?string $processor = null,
        public ?string $mimeType = null,
        public ?string $parser = null,
    ) {
        if (count($inputs) !== 1) {
            throw new \InvalidArgumentException('Exactly 1 input is required');
        }
    }
}
