<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Exception;

class SchemaValidationException extends StrukturException
{
    /**
     * @param list<string> $errors
     */
    public function __construct(
        string $message = "",
        int $code = 0,
        ?\Throwable $previous = null,
        public readonly array $errors = [],
    ) {
        parent::__construct($message, $code, $previous);
    }
}
