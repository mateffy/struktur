<?php

namespace Mateffy\Magic\Models;

use Mateffy\Magic\Models\Options\ElElEmOptions;
use Mateffy\Magic\Models\Options\Organization;

interface LLM extends ModelLaunchInterface
{
    public function withOptions(array $data): static;

    public function getOrganization(): Organization;

    public function getOptions(): ElElEmOptions;

    public function getModelName(): string;
	public function getModelLabel(): string;

    public function getModelCost(): ?ModelCost;
}
