<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Exception;

class ExtractionFailedException extends StrukturException
{
    public function __construct(
        string $message = "",
        int $code = 0,
        ?\Throwable $previous = null,
        public readonly ?string $stderr = null,
    ) {
        parent::__construct($message, $code, $previous);
    }
}
