<?php

namespace Mateffy\Magic\Models\Options;

class Organization
{
    public function __construct(
        public string $id,
        public string $name,
        public string $website,
        public bool $privacyUsedForModelTraining,
        public bool $privacyUsedForAbusePrevention,
    ) {}
}
