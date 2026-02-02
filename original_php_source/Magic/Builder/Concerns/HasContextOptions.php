<?php

namespace Mateffy\Magic\Builder\Concerns;

use Mateffy\Magic\Extraction\ContextOptions;

trait HasContextOptions
{
	protected ?ContextOptions $contextOptions = null;

	public function contextOptions(ContextOptions $filter): static
	{
		$this->contextOptions = $filter;

		return $this;
	}

	public function getContextOptions(): ContextOptions
	{
		return $this->contextOptions ?? ContextOptions::default();
	}
}