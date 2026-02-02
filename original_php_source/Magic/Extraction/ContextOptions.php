<?php

namespace Mateffy\Magic\Extraction;

use Illuminate\Support\Collection;
use Mateffy\Magic\Extraction\Slices\EmbedSlice;
use Mateffy\Magic\Extraction\Slices\Slice;
use Mateffy\Magic\Extraction\Slices\TextualSlice;

/**
 * A content filter is used to determine, what contents of an Artifact to include in an LLM call.
 */
class ContextOptions
{
	public function __construct(
		public readonly bool $includeText,
		public readonly bool $includeEmbeddedImages,
		public readonly bool $markEmbeddedImages,
		public readonly bool $includePageImages,
		public readonly bool $markPageImages,
	)
	{
	}

	/**
	 * Create a content filter with everything included.
	 */
	public static function all(): ContextOptions
	{
		return new ContextOptions(
			includeText: true,
			includeEmbeddedImages: true,
			markEmbeddedImages: true,
			includePageImages: true,
			markPageImages: true,
		);
	}

	public static function default(): ContextOptions
	{
		return new ContextOptions(
			includeText: true,
			includeEmbeddedImages: true,
			markEmbeddedImages: true,
			includePageImages: false,
			markPageImages: false,
		);
	}

	/**
	 * Filter a content collection according to the filter settings.
	 *
	 * @param Collection<Slice> $contents
	 * @return Collection<Slice>
	 */
	public function filter(Collection $contents): Collection
	{
		return $contents->filter(fn (Slice $content) => match (true) {
			$this->includeText && $content instanceof TextualSlice => true,
			$this->includeEmbeddedImages && !$this->markEmbeddedImages && $content instanceof EmbedSlice && $content->getType() === ContentType::Image => true,
			$this->includeEmbeddedImages && $this->markEmbeddedImages && $content instanceof EmbedSlice && $content->getType() === ContentType::ImageMarked => true,
			$this->includePageImages && !$this->markPageImages && $content instanceof EmbedSlice && $content->getType() === ContentType::PageImage => true,
			$this->includePageImages && $this->markPageImages && $content instanceof EmbedSlice && $content->getType() === ContentType::PageImageMarked => true,
			default => false,
		});
	}

	public function getEvaluationType(): EvaluationType
	{
		return EvaluationType::fromOptions($this);
	}

    public function getEvaluationTypeLabel(): string
    {
        return $this->getEvaluationType()->value;
    }

	public function toArray(): array
	{
		return [
			'type' => $this->getEvaluationType(),
			'includeText' => $this->includeText,
			'includeEmbeddedImages' => $this->includeEmbeddedImages,
			'markEmbeddedImages' => $this->markEmbeddedImages,
			'includePageImages' => $this->includePageImages,
			'markPageImages' => $this->markPageImages,
		];
	}
}
