<?php

namespace Mateffy\Magic\Builder\Concerns;

trait HasChunkSize
{
	protected ?int $chunkSize = null;

	public function chunkSize(?int $chunkSize): static
	{
		$this->chunkSize = $chunkSize;

		return $this;
	}

	public function getChunkSize(): int
	{
		return $this->chunkSize ?? config('llm-magic.artifacts.default_max_tokens');
	}
}
