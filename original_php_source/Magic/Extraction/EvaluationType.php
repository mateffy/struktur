<?php

namespace Mateffy\Magic\Extraction;

enum EvaluationType: string
{
    case All = 'all';
    case TextOnly = 'text-only';
    case EmbeddedImages = 'embedded-images';
    case PageImages = 'page-images';

	public function getLabel(): string
	{
		return match ($this) {
			self::All => 'All',
			self::TextOnly => 'Text Only',
			self::EmbeddedImages => 'Embedded Images',
			self::PageImages => 'Page Images',
		};
	}

	public function toOptions(bool $markEmbeddedImages, bool $markPageImages): ContextOptions
	{
		return match ($this) {
			self::All => new ContextOptions(
				includeText: true,
				includeEmbeddedImages: true,
				markEmbeddedImages: $markEmbeddedImages,
				includePageImages: true,
				markPageImages: $markPageImages,
			),
			self::TextOnly => new ContextOptions(
				includeText: true,
				includeEmbeddedImages: false,
				markEmbeddedImages: false,
				includePageImages: false,
				markPageImages: false,
			),
			self::EmbeddedImages => new ContextOptions(
				includeText: true,
				includeEmbeddedImages: true,
				markEmbeddedImages: $markEmbeddedImages,
				includePageImages: false,
				markPageImages: false,
			),
			self::PageImages => new ContextOptions(
				includeText: true,
				includeEmbeddedImages: false,
				markEmbeddedImages: false,
				includePageImages: true,
				markPageImages: $markPageImages,
			),
		};
	}

	public static function fromOptions(ContextOptions $options): EvaluationType
	{
		if ($options->includeText && $options->includeEmbeddedImages && !$options->includePageImages) {
			return EvaluationType::EmbeddedImages;
		}

		if ($options->includeText && !$options->includeEmbeddedImages && $options->includePageImages) {
			return EvaluationType::PageImages;
		}

		if ($options->includeText && $options->includeEmbeddedImages && $options->includePageImages) {
			return EvaluationType::All;
		}

		return EvaluationType::TextOnly;
	}

    public function getOrder(): int
    {
        return match ($this) {
            self::TextOnly => 1,
            self::EmbeddedImages => 2,
            self::PageImages => 3,
            self::All => 4,
        };
    }
}
