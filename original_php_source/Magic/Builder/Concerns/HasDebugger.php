<?php

namespace Mateffy\Magic\Builder\Concerns;

use Mateffy\Magic\Support\FileDebugger;

trait HasDebugger
{
	protected ?FileDebugger $debugger = null;

	public function debugger(?FileDebugger $debugger): static
	{
		$this->debugger = $debugger;

		return $this;
	}

	public function getDebugger(): ?FileDebugger
	{
//		if (!$this->debugger) {
//			$this->debugger = new FileDebugger;
//		}

		return $this->debugger;
	}
}