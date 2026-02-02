<?php

namespace Mateffy\Magic\Extraction\Artifacts;

enum ArtifactType: string
{
    case Unknown = 'unknown';
    case Text = 'text';
    case Image = 'image';
    case Pdf = 'pdf';
	case RichTextDocument = 'rich-text-document';
	case Spreadsheet = 'spreadsheet';

	public function getLabel(): string
	{
		return match ($this) {
			self::Unknown => 'Unknown',
			self::Text => 'Text',
			self::Image => 'Image',
			self::Pdf => 'PDF',
			self::RichTextDocument => 'Text Document',
			self::Spreadsheet => 'Spreadsheet',
		};
	}

    public static function fromMimetype(string $mimeType): static
    {
        $str = str($mimeType)->lower();

        return match (true) {
            $str->startsWith('text/') => self::Text,
            $str->startsWith('image/') => self::Image,
            $str->startsWith('application/pdf') => self::Pdf,
			$str->startsWith([
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'application/msword',
				'application/vnd.oasis.opendocument.text',
				'application/vnd.openxmlformats-officedocument.presentationml.presentation',
				'application/vnd.ms-powerpoint',
				'application/vnd.oasis.opendocument.presentation',
			]) => self::RichTextDocument,
			$str->startsWith([
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'application/vnd.ms-excel',
				'application/vnd.oasis.opendocument.spreadsheet',
			]) => self::Spreadsheet,
            default => self::Unknown,
        };
    }
}
