<?php

declare(strict_types=1);

namespace Mateffy\Struktur;

final readonly class Input
{
    private function __construct(
        public ?string $path = null,
        public ?string $bytes = null,
        public mixed $stream = null,
    ) {
    }

    public static function fromPath(string $path): self
    {
        return new self(path: $path);
    }

    public static function fromBytes(string $bytes): self
    {
        return new self(bytes: $bytes);
    }

    public static function fromStream(mixed $stream): self
    {
        if (!is_resource($stream)) {
            throw new \InvalidArgumentException('Input must be a valid stream resource');
        }
        return new self(stream: $stream);
    }
}
