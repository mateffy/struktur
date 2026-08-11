<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

use Mateffy\Struktur\Input;

final readonly class ParseRequest
{
    /**
     * @param list<Input> $inputs
     * @param array<string, string>|null $tokens Provider-to-token map (e.g. ['openai' => 'sk-xxx'])
     */
    public function __construct(
        public array $inputs,
        public ?array $tokens = null,
    ) {
        if (count($inputs) !== 1) {
            throw new \InvalidArgumentException('Exactly 1 input is required');
        }
    }
}
