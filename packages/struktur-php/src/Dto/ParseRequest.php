<?php

declare(strict_types=1);

namespace Mateffy\Struktur\Dto;

use Mateffy\Struktur\Input;

final readonly class ParseRequest
{
    /**
     * @param list<Input> $inputs
     */
    public function __construct(
        public array $inputs,
    ) {
        if (count($inputs) !== 1) {
            throw new \InvalidArgumentException('Exactly 1 input is required');
        }
    }
}
