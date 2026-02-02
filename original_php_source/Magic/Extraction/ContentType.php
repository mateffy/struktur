<?php

namespace Mateffy\Magic\Extraction;

/**
 * The content types are used by the PDF parser when extracting document contents.
 */
enum ContentType: string
{
	case Text = 'text';
	case Image = 'image';
	case ImageMarked = 'image-marked';
	case PageImage = 'page-image';
	case PageImageMarked = 'page-image-marked';

	/**
	 * Check if the content type is a normal image, and not a page image.
	 */
	public function isNormalImage(): bool
	{
		return $this === self::Image || $this === self::ImageMarked;
	}
}